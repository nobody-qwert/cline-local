import type { AnthropicCompat as Anthropic } from "@/types/anthropic-compat"
import { ApiConfiguration, ModelInfo } from "../shared/api"
import { OllamaHandler } from "./providers/ollama"
import { LmStudioHandler } from "./providers/lmstudio"
import { ApiStream, ApiStreamUsageChunk } from "./transform/stream"
import { Mode } from "@shared/storage/types"

export interface ApiHandler {
	createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream
	getModel(): ApiHandlerModel
	getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>
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
		case "lmstudio":
			return new LmStudioHandler({
				lmStudioBaseUrl: options.lmStudioBaseUrl,
				lmStudioModelId: mode === "plan" ? options.planModeLmStudioModelId : options.actModeLmStudioModelId,
			})
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

	// Thinking budget tokens removed in local-only version

	return createHandlerForProvider(apiProvider, options, mode)
}
