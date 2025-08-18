import { ApiConfiguration, ApiProvider } from "../../api"
import { ModelsApiConfiguration as ProtoApiConfiguration, ApiProvider as ProtoApiProvider } from "@shared/proto/cline/models"

// Convert application ApiProvider to proto ApiProvider
function convertApiProviderToProto(provider: string | undefined): ProtoApiProvider {
	switch (provider) {
		case "ollama":
			return ProtoApiProvider.OLLAMA
		case "lmstudio":
			return ProtoApiProvider.LMSTUDIO
		default:
			return ProtoApiProvider.LMSTUDIO
	}
}

// Convert proto ApiProvider to application ApiProvider
function convertProtoToApiProvider(provider: ProtoApiProvider): ApiProvider {
	switch (provider) {
		case ProtoApiProvider.OLLAMA:
			return "ollama"
		case ProtoApiProvider.LMSTUDIO:
			return "lmstudio"
		default:
			return "lmstudio"
	}
}

// Converts application ApiConfiguration to proto ApiConfiguration
export function convertApiConfigurationToProto(config: ApiConfiguration): ProtoApiConfiguration {
	return {
		// Local provider configuration fields only
		ulid: config.ulid,
		requestTimeoutMs: config.requestTimeoutMs,
		ollamaBaseUrl: config.ollamaBaseUrl,
		ollamaApiKey: config.ollamaApiKey,
		lmStudioBaseUrl: config.lmStudioBaseUrl,

		// Plan mode configurations (local providers only)
		planModeApiProvider: config.planModeApiProvider ? convertApiProviderToProto(config.planModeApiProvider) : undefined,
		planModeApiModelId: config.planModeApiModelId,
		planModeOllamaModelId: config.planModeOllamaModelId,
		planModeLmStudioModelId: config.planModeLmStudioModelId,
		planModeThinkingBudgetTokens: config.planModeThinkingBudgetTokens,

		// Act mode configurations (local providers only)
		actModeApiProvider: config.actModeApiProvider ? convertApiProviderToProto(config.actModeApiProvider) : undefined,
		actModeApiModelId: config.actModeApiModelId,
		actModeOllamaModelId: config.actModeOllamaModelId,
		actModeLmStudioModelId: config.actModeLmStudioModelId,
		actModeThinkingBudgetTokens: config.actModeThinkingBudgetTokens,

		// Favorited model IDs
		favoritedModelIds: config.favoritedModelIds || [],
	}
}

// Converts proto ApiConfiguration to application ApiConfiguration
export function convertProtoToApiConfiguration(protoConfig: ProtoApiConfiguration): ApiConfiguration {
	return {
		// Local provider configuration fields only
		ulid: protoConfig.ulid,
		requestTimeoutMs: protoConfig.requestTimeoutMs,
		ollamaBaseUrl: protoConfig.ollamaBaseUrl,
		ollamaApiKey: protoConfig.ollamaApiKey,
		lmStudioBaseUrl: protoConfig.lmStudioBaseUrl,

		// Plan mode configurations (local providers only)
		planModeApiProvider:
			protoConfig.planModeApiProvider !== undefined
				? convertProtoToApiProvider(protoConfig.planModeApiProvider)
				: undefined,
		planModeApiModelId: protoConfig.planModeApiModelId,
		planModeOllamaModelId: protoConfig.planModeOllamaModelId,
		planModeLmStudioModelId: protoConfig.planModeLmStudioModelId,
		planModeThinkingBudgetTokens: protoConfig.planModeThinkingBudgetTokens,

		// Act mode configurations (local providers only)
		actModeApiProvider:
			protoConfig.actModeApiProvider !== undefined ? convertProtoToApiProvider(protoConfig.actModeApiProvider) : undefined,
		actModeApiModelId: protoConfig.actModeApiModelId,
		actModeOllamaModelId: protoConfig.actModeOllamaModelId,
		actModeLmStudioModelId: protoConfig.actModeLmStudioModelId,
		actModeThinkingBudgetTokens: protoConfig.actModeThinkingBudgetTokens,

		// Favorited model IDs
		favoritedModelIds:
			protoConfig.favoritedModelIds && protoConfig.favoritedModelIds.length > 0 ? protoConfig.favoritedModelIds : undefined,
	}
}
