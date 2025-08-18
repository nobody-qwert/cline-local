import { ApiConfiguration, ApiProvider } from "@shared/api"
import { ApiConfiguration as ProtoApiConfiguration } from "@shared/proto/cline/state"

/**
 * Converts domain ApiConfiguration objects to proto ApiConfiguration objects (local providers only)
 */
export function convertApiConfigurationToProtoApiConfiguration(config: ApiConfiguration): ProtoApiConfiguration {
	return ProtoApiConfiguration.create({
		// Global configuration fields (local providers only)
		ulid: config.ulid,
		requestTimeoutMs: config.requestTimeoutMs ? Number(config.requestTimeoutMs) : undefined,
		ollamaBaseUrl: config.ollamaBaseUrl,
		ollamaApiKey: config.ollamaApiKey,
		ollamaApiOptionsCtxNum: config.ollamaApiOptionsCtxNum,
		lmStudioBaseUrl: config.lmStudioBaseUrl,

		// Plan mode configurations (local providers only)
		planModeApiProvider: config.planModeApiProvider,
		planModeApiModelId: config.planModeApiModelId,
		planModeVscodeLmModelSelector: config.planModeVsCodeLmModelSelector
			? JSON.stringify(config.planModeVsCodeLmModelSelector)
			: undefined,
		planModeOllamaModelId: config.planModeOllamaModelId,
		planModeLmStudioModelId: config.planModeLmStudioModelId,
		planModeThinkingBudgetTokens: config.planModeThinkingBudgetTokens,

		// Act mode configurations (local providers only)
		actModeApiProvider: config.actModeApiProvider,
		actModeApiModelId: config.actModeApiModelId,
		actModeVscodeLmModelSelector: config.actModeVsCodeLmModelSelector
			? JSON.stringify(config.actModeVsCodeLmModelSelector)
			: undefined,
		actModeOllamaModelId: config.actModeOllamaModelId,
		actModeLmStudioModelId: config.actModeLmStudioModelId,
		actModeThinkingBudgetTokens: config.actModeThinkingBudgetTokens,

		// Favorited model IDs
		favoritedModelIds: config.favoritedModelIds || [],
	})
}

/**
 * Converts proto ApiConfiguration objects to domain ApiConfiguration objects (local providers only)
 */
export function convertProtoApiConfigurationToApiConfiguration(protoConfig: ProtoApiConfiguration): ApiConfiguration {
	const config: ApiConfiguration = {
		// Global configuration fields (local providers only)
		ulid: protoConfig.ulid,
		requestTimeoutMs: protoConfig.requestTimeoutMs ? Number(protoConfig.requestTimeoutMs) : undefined,
		ollamaBaseUrl: protoConfig.ollamaBaseUrl,
		ollamaApiKey: protoConfig.ollamaApiKey,
		ollamaApiOptionsCtxNum: protoConfig.ollamaApiOptionsCtxNum,
		lmStudioBaseUrl: protoConfig.lmStudioBaseUrl,

		// Plan mode configurations (local providers only)
		planModeApiProvider: protoConfig.planModeApiProvider as ApiProvider,
		planModeApiModelId: protoConfig.planModeApiModelId,
		planModeOllamaModelId: protoConfig.planModeOllamaModelId,
		planModeLmStudioModelId: protoConfig.planModeLmStudioModelId,
		planModeThinkingBudgetTokens: protoConfig.planModeThinkingBudgetTokens,

		// Act mode configurations (local providers only)
		actModeApiProvider: protoConfig.actModeApiProvider as ApiProvider,
		actModeApiModelId: protoConfig.actModeApiModelId,
		actModeOllamaModelId: protoConfig.actModeOllamaModelId,
		actModeLmStudioModelId: protoConfig.actModeLmStudioModelId,
		actModeThinkingBudgetTokens: protoConfig.actModeThinkingBudgetTokens,

		// Favorited model IDs
		favoritedModelIds: protoConfig.favoritedModelIds || [],
	}

	// Handle complex JSON objects (local providers only)
	try {
		if (protoConfig.planModeVscodeLmModelSelector) {
			config.planModeVsCodeLmModelSelector = JSON.parse(protoConfig.planModeVscodeLmModelSelector)
		}
		if (protoConfig.actModeVscodeLmModelSelector) {
			config.actModeVsCodeLmModelSelector = JSON.parse(protoConfig.actModeVscodeLmModelSelector)
		}
	} catch (error) {
		console.error("Failed to parse complex JSON objects in API configuration:", error)
	}

	return config
}
