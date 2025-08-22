import type { AnthropicCompat as Anthropic } from "@/types/anthropic-compat"
import { ApiConfiguration, ModelInfo, DEFAULT_LMSTUDIO_IDEA, DEFAULT_LMSTUDIO_STRICT } from "../shared/api"
import { OllamaHandler } from "./providers/ollama"
import { LmStudioHandler } from "./providers/lmstudio"
import { ApiStream, ApiStreamUsageChunk } from "./transform/stream"
import { Mode } from "@shared/storage/types"

export interface ApiHandler {
	createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream
	getModel(): ApiHandlerModel
	getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>
	// Optional cancellation hook so providers can abort in-flight requests
	cancelActiveRequest?(): void
}

export interface ApiHandlerModel {
	id: string
	info: ModelInfo
}

export interface SingleCompletionHandler {
	completePrompt(prompt: string): Promise<string>
}

function createHandlerForProvider(
	apiProvider: string | undefined,
	options: Omit<ApiConfiguration, "apiProvider">,
	mode: Mode,
): ApiHandler {
	switch (apiProvider) {
		case "ollama":
			return new OllamaHandler({
				ollamaBaseUrl: options.ollamaBaseUrl,
				ollamaApiKey: options.ollamaApiKey,
				ollamaModelId: mode === "plan" ? options.planModeOllamaModelId : options.actModeOllamaModelId,
				ollamaApiOptionsCtxNum: options.ollamaApiOptionsCtxNum,
				requestTimeoutMs: options.requestTimeoutMs,
			})
		case "lmstudio": {
			// Determine Idea vs Strict profile
			// Default Idea mode ON in Plan unless explicitly disabled
			const useIdeaProfile = mode === "plan" && options.planIdeaModeEnabled !== false
			const temperature = useIdeaProfile
				? (options.planModeLmStudioTemperature ?? DEFAULT_LMSTUDIO_IDEA.temperature)
				: (options.actModeLmStudioTemperature ?? DEFAULT_LMSTUDIO_STRICT.temperature)
			const topP = useIdeaProfile
				? (options.planModeLmStudioTopP ?? DEFAULT_LMSTUDIO_IDEA.topP)
				: (options.actModeLmStudioTopP ?? DEFAULT_LMSTUDIO_STRICT.topP)
			const topK = useIdeaProfile
				? (options.planModeLmStudioTopK ?? DEFAULT_LMSTUDIO_IDEA.topK)
				: (options.actModeLmStudioTopK ?? DEFAULT_LMSTUDIO_STRICT.topK)
			const repeatPenalty = useIdeaProfile
				? (options.planModeLmStudioRepeatPenalty ?? DEFAULT_LMSTUDIO_IDEA.repeatPenalty)
				: (options.actModeLmStudioRepeatPenalty ?? DEFAULT_LMSTUDIO_STRICT.repeatPenalty)

			return new LmStudioHandler({
				lmStudioBaseUrl: options.lmStudioBaseUrl,
				lmStudioModelId: mode === "plan" ? options.planModeLmStudioModelId : options.actModeLmStudioModelId,
				thinkingBudgetTokens:
					mode === "plan" ? options.planModeThinkingBudgetTokens : options.actModeThinkingBudgetTokens,
				openaiReasoningEffort: options.openaiReasoningEffort,
				temperature,
				topP,
				topK,
				repeatPenalty,
			})
		}
		default:
			return new OllamaHandler({
				ollamaBaseUrl: options.ollamaBaseUrl,
				ollamaApiKey: options.ollamaApiKey,
				ollamaModelId: mode === "plan" ? options.planModeOllamaModelId : options.actModeOllamaModelId,
				ollamaApiOptionsCtxNum: options.ollamaApiOptionsCtxNum,
				requestTimeoutMs: options.requestTimeoutMs,
			})
	}
}

export function buildApiHandler(configuration: ApiConfiguration, mode: Mode): ApiHandler {
	const { planModeApiProvider, actModeApiProvider, ...options } = configuration

	const apiProvider = mode === "plan" ? planModeApiProvider : actModeApiProvider

	return createHandlerForProvider(apiProvider, options, mode)
}
