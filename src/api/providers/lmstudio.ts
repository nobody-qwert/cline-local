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
}

export class LmStudioHandler implements ApiHandler {
	private options: LmStudioHandlerOptions
	private client: OpenAI | undefined
	private lastUsage: ApiStreamUsageChunk | undefined

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
		const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: "system", content: systemPrompt },
			...convertToOpenAiMessages(messages),
		]

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
			}
			const stream = (await client.chat.completions.create(req)) as any
			for await (const chunk of stream as any) {
				const delta = chunk.choices[0]?.delta
				if (delta?.content) {
					yield {
						type: "text",
						text: delta.content,
					}
				}
				if (delta && "reasoning_content" in delta && delta.reasoning_content) {
					yield {
						type: "reasoning",
						reasoning: (delta.reasoning_content as string | undefined) || "",
					}
				}
				// Emit usage if LM Studio provides it (OpenAI-compatible include_usage)
				const usage = (chunk as any)?.usage
				if (usage && (usage.prompt_tokens !== null || usage.completion_tokens !== null)) {
					const usageChunk: ApiStreamUsageChunk = {
						type: "usage",
						inputTokens: usage.prompt_tokens || 0,
						outputTokens: usage.completion_tokens || 0,
						// Best-effort cache metrics if LM Studio provides them
						cacheReadTokens: usage.prompt_tokens_details?.cached_tokens || 0,
						cacheWriteTokens: usage.prompt_cache_miss_tokens || 0,
					}
					this.lastUsage = usageChunk
					yield usageChunk
				}
			}
		} catch (error) {
			// LM Studio doesn't return an error code/body for now
			throw new Error(
				"Please check the LM Studio developer logs to debug what went wrong. You may need to load the model with a larger context length to work with Cline's prompts.",
			)
		}
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
}
