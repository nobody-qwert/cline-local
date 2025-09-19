import type { AnthropicCompat as Anthropic } from "../../types/anthropic-compat"
import OpenAI from "openai"
import { ApiHandler } from "../"
import { ModelInfo, getLmStudioModelInfoForModelId } from "@shared/api"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { ApiStream, ApiStreamUsageChunk } from "../transform/stream"
import { withRetry } from "../retry"

interface LmStudioHandlerOptions {
	lmStudioBaseUrl?: string
	lmStudioModelId?: string
	thinkingBudgetTokens?: number
	openaiReasoningEffort?: string
}

export class LmStudioHandler implements ApiHandler {
	private options: LmStudioHandlerOptions
	private client: OpenAI | undefined
	private lastUsage: ApiStreamUsageChunk | undefined
	private abortController: AbortController | undefined

	constructor(options: LmStudioHandlerOptions) {
		this.options = options
	}

	private ensureClient(): OpenAI {
		if (!this.client) {
			try {
				this.client = new OpenAI({
					baseURL: (this.options.lmStudioBaseUrl || "http://localhost:1234") + "/v1",
					apiKey: "noop",
				})
			} catch (error) {
				throw new Error(`Error creating LM Studio client: ${error.message}`)
			}
		}
		return this.client
	}

	@withRetry({ retryAllErrors: true })
	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const client = this.ensureClient()
		const controller = new AbortController()
		this.abortController = controller

		// Determine model capabilities for reasoning control
		const modelId = this.getModel().id || ""
		const lowerId = modelId.toLowerCase()
		const isGptOss = lowerId.startsWith("gpt-oss") || lowerId.includes("/gpt-oss") || lowerId.includes("openai/gpt-oss")

		// For LM Studio models, add reasoning control to the system message
		// based on whether thinking is enabled via the UI toggle (ThinkingBudgetSlider).
		let finalSystemPrompt = systemPrompt
		const thinkingEnabled = (this.options.thinkingBudgetTokens || 0) > 0

		const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: "system", content: finalSystemPrompt },
			...convertToOpenAiMessages(messages),
		]

		// For GPT-OSS models, bypass the OpenAI SDK to preserve non-standard fields like "reasoning_effort"
		if (isGptOss) {
			const url = (this.options.lmStudioBaseUrl || "http://localhost:1234") + "/v1/chat/completions"
			const body: any = {
				model: this.getModel().id,
				messages: openAiMessages,
				stream: true,
				// Request usage in streaming chunks (OpenAI-compatible)
				stream_options: { include_usage: true },
				// Top-level reasoning effort per LM Studio GPT-OSS format
				reasoning_effort: (this.options.openaiReasoningEffort as "low" | "medium" | "high") || "low",
			}
			try {
				const resp = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
					signal: controller.signal,
				} as any)
				if (!resp.ok || !resp.body) {
					throw new Error(`LM Studio request failed with status ${resp.status}`)
				}
				const reader = (resp.body as any).getReader()
				const decoder = new TextDecoder()
				let buffer = ""
				while (true) {
					const { done, value } = await reader.read()
					if (done) break
					buffer += decoder.decode(value, { stream: true })
					let newlineIndex = buffer.indexOf("\n")
					while (newlineIndex !== -1) {
						const line = buffer.slice(0, newlineIndex).trim()
						buffer = buffer.slice(newlineIndex + 1)
						if (line.startsWith("data:")) {
							const dataStr = line.slice(5).trim()
							if (dataStr === "[DONE]") {
								// End of stream
							} else {
								try {
									const chunk = JSON.parse(dataStr)
									const delta = chunk?.choices?.[0]?.delta
									if (delta?.content) {
										yield { type: "text", text: delta.content }
									}
									const reasoningText = this.extractReasoningFromDelta(delta)
									if (reasoningText) {
										yield { type: "reasoning", reasoning: reasoningText }
									}
									const usage = (chunk as any)?.usage
									if (usage && (usage.prompt_tokens !== null || usage.completion_tokens !== null)) {
										const usageChunk: ApiStreamUsageChunk = {
											type: "usage",
											inputTokens: usage.prompt_tokens || 0,
											outputTokens: usage.completion_tokens || 0,
											cacheReadTokens: usage.prompt_tokens_details?.cached_tokens || 0,
											cacheWriteTokens: usage.prompt_cache_miss_tokens || 0,
										}
										this.lastUsage = usageChunk
										yield usageChunk
									}
								} catch {
									// ignore parse errors
								}
							}
						}
						newlineIndex = buffer.indexOf("\n")
					}
				}
				// Flush any remaining buffer content
				if (buffer.startsWith("data:")) {
					const dataStr = buffer.slice(5).trim()
					if (dataStr && dataStr !== "[DONE]") {
						try {
							const chunk = JSON.parse(dataStr)
							const delta = chunk?.choices?.[0]?.delta
							if (delta?.content) {
								yield { type: "text", text: delta.content }
							}
							const reasoningText = this.extractReasoningFromDelta(delta)
							if (reasoningText) {
								yield { type: "reasoning", reasoning: reasoningText }
							}
							const usage = (chunk as any)?.usage
							if (usage && (usage.prompt_tokens !== null || usage.completion_tokens !== null)) {
								const usageChunk: ApiStreamUsageChunk = {
									type: "usage",
									inputTokens: usage.prompt_tokens || 0,
									outputTokens: usage.completion_tokens || 0,
									cacheReadTokens: usage.prompt_tokens_details?.cached_tokens || 0,
									cacheWriteTokens: usage.prompt_cache_miss_tokens || 0,
								}
								this.lastUsage = usageChunk
								yield usageChunk
							}
						} catch {
							// ignore parse errors
						}
					}
				}
			} catch (error) {
				// Swallow aborts; propagate other errors
				if (error instanceof Error && (error.name === "AbortError" || error.message?.includes("aborted"))) {
					return
				}
				throw new Error(`LM Studio (GPT-OSS) request failed: ${error instanceof Error ? error.message : String(error)}`)
			} finally {
				// Clear controller on exit of this branch
				this.abortController = undefined
			}
		} else {
			// Non-GPT-OSS path: use OpenAI SDK
			try {
				const req: any = {
					model: this.getModel().id,
					messages: openAiMessages,
					stream: true,
					// Request usage in streaming chunks (OpenAI-compatible)
					stream_options: { include_usage: true },
				}
				// If thinking budget is enabled, include OpenAI-compatible reasoning params
				if (this.options.thinkingBudgetTokens && this.options.thinkingBudgetTokens > 0) {
					req.reasoning = { budget_tokens: this.options.thinkingBudgetTokens }
				} else {
					// Explicitly disable reasoning when thinking is not enabled
					req.reasoning = false
				}
				const stream = (await (client as any).chat.completions.create(req, { signal: controller.signal })) as any
				for await (const chunk of stream as any) {
					const delta = chunk.choices[0]?.delta
					if (delta?.content) {
						yield { type: "text", text: delta.content }
					}
					const reasoningText = this.extractReasoningFromDelta(delta)
					if (reasoningText) {
						yield { type: "reasoning", reasoning: reasoningText }
					}
					// Emit usage if LM Studio provides it (OpenAI-compatible include_usage)
					const usage = (chunk as any)?.usage
					if (usage && (usage.prompt_tokens !== null || usage.completion_tokens !== null)) {
						const usageChunk: ApiStreamUsageChunk = {
							type: "usage",
							inputTokens: usage.prompt_tokens || 0,
							outputTokens: usage.completion_tokens || 0,
							cacheReadTokens: usage.prompt_tokens_details?.cached_tokens || 0,
							cacheWriteTokens: usage.prompt_cache_miss_tokens || 0,
						}
						this.lastUsage = usageChunk
						yield usageChunk
					}
				}
			} catch (error) {
				// Handle aborts gracefully; otherwise surface a helpful error
				if (error instanceof Error && (error.name === "AbortError" || error.message?.includes("aborted"))) {
					return
				}
				// LM Studio doesn't return an error code/body for now
				throw new Error(
					"Please check the LM Studio developer logs to debug what went wrong. You may need to load the model with a larger context length to work with Cline's prompts.",
				)
			} finally {
				this.abortController = undefined
			}
		}
	}

	private extractReasoningFromDelta(delta: any): string | undefined {
		if (!delta) return undefined
		// LM Studio / OpenAI-compatible fields:
		// - delta.reasoning (string or { content: string })
		// - delta.reasoning_content (string)
		if (typeof delta.reasoning === "string" && delta.reasoning.length > 0) {
			return delta.reasoning
		}
		const r = (delta as any).reasoning
		if (r && typeof r.content === "string" && r.content.length > 0) {
			return r.content
		}
		const rc = (delta as any).reasoning_content
		if (typeof rc === "string" && rc.length > 0) {
			return rc
		}
		return undefined
	}

	getApiStreamUsage = async (): Promise<ApiStreamUsageChunk | undefined> => {
		return this.lastUsage
	}

	getModel(): { id: string; info: ModelInfo } {
		return {
			id: this.options.lmStudioModelId || "",
			info: getLmStudioModelInfoForModelId(this.options.lmStudioModelId || ""),
		}
	}

	// Allow Task/Controller to cancel an in-flight request
	cancelActiveRequest(): void {
		try {
			this.abortController?.abort()
		} finally {
			this.abortController = undefined
		}
	}
}
