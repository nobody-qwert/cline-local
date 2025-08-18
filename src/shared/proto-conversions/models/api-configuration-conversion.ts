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

		// Act mode configurations (local providers only)
		actModeApiProvider: config.actModeApiProvider ? convertApiProviderToProto(config.actModeApiProvider) : undefined,
		actModeApiModelId: config.actModeApiModelId,
		actModeOllamaModelId: config.actModeOllamaModelId,
		actModeLmStudioModelId: config.actModeLmStudioModelId,

		// Favorited model IDs
		favoritedModelIds: config.favoritedModelIds || [],

		// All other cloud provider fields set to defaults/empty values for proto compatibility
		apiKey: "",
		clineAccountId: "",
		liteLlmBaseUrl: "",
		liteLlmApiKey: "",
		liteLlmUsePromptCache: false,
		openAiHeaders: {},
		anthropicBaseUrl: "",
		openRouterApiKey: "",
		openRouterProviderSorting: "",
		awsAccessKey: "",
		awsSecretKey: "",
		awsSessionToken: "",
		awsRegion: "",
		awsUseCrossRegionInference: false,
		awsBedrockUsePromptCache: false,
		awsUseProfile: false,
		awsAuthentication: "",
		awsProfile: "",
		awsBedrockApiKey: "",
		awsBedrockEndpoint: "",
		claudeCodePath: "",
		vertexProjectId: "",
		vertexRegion: "",
		openAiBaseUrl: "",
		openAiApiKey: "",
		geminiApiKey: "",
		geminiBaseUrl: "",
		openAiNativeApiKey: "",
		deepSeekApiKey: "",
		requestyApiKey: "",
		requestyBaseUrl: "",
		togetherApiKey: "",
		fireworksApiKey: "",
		fireworksModelMaxCompletionTokens: 0,
		fireworksModelMaxTokens: 0,
		qwenApiKey: "",
		doubaoApiKey: "",
		mistralApiKey: "",
		azureApiVersion: "",
		qwenApiLine: "",
		moonshotApiLine: "",
		moonshotApiKey: "",
		huggingFaceApiKey: "",
		nebiusApiKey: "",
		asksageApiUrl: "",
		asksageApiKey: "",
		xaiApiKey: "",
		sambanovaApiKey: "",
		cerebrasApiKey: "",
		groqApiKey: "",
		basetenApiKey: "",
		sapAiCoreClientId: "",
		sapAiCoreClientSecret: "",
		sapAiResourceGroup: "",
		sapAiCoreTokenUrl: "",
		sapAiCoreBaseUrl: "",
		huaweiCloudMaasApiKey: "",
		planModeThinkingBudgetTokens: 0,
		planModeReasoningEffort: "",
		planModeVsCodeLmModelSelector: undefined,
		planModeAwsBedrockCustomSelected: false,
		planModeAwsBedrockCustomModelBaseId: "",
		planModeOpenRouterModelId: "",
		planModeOpenRouterModelInfo: undefined,
		planModeOpenAiModelId: "",
		planModeOpenAiModelInfo: undefined,
		planModeLiteLlmModelId: "",
		planModeLiteLlmModelInfo: undefined,
		planModeRequestyModelId: "",
		planModeRequestyModelInfo: undefined,
		planModeTogetherModelId: "",
		planModeFireworksModelId: "",
		planModeGroqModelId: "",
		planModeGroqModelInfo: undefined,
		planModeBasetenModelId: "",
		planModeBasetenModelInfo: undefined,
		planModeHuggingFaceModelId: "",
		planModeHuggingFaceModelInfo: undefined,
		planModeSapAiCoreModelId: "",
		planModeHuaweiCloudMaasModelId: "",
		planModeHuaweiCloudMaasModelInfo: undefined,
		actModeThinkingBudgetTokens: 0,
		actModeReasoningEffort: "",
		actModeVsCodeLmModelSelector: undefined,
		actModeAwsBedrockCustomSelected: false,
		actModeAwsBedrockCustomModelBaseId: "",
		actModeOpenRouterModelId: "",
		actModeOpenRouterModelInfo: undefined,
		actModeOpenAiModelId: "",
		actModeOpenAiModelInfo: undefined,
		actModeLiteLlmModelId: "",
		actModeLiteLlmModelInfo: undefined,
		actModeRequestyModelId: "",
		actModeRequestyModelInfo: undefined,
		actModeTogetherModelId: "",
		actModeFireworksModelId: "",
		actModeGroqModelId: "",
		actModeGroqModelInfo: undefined,
		actModeBasetenModelId: "",
		actModeBasetenModelInfo: undefined,
		actModeHuggingFaceModelId: "",
		actModeHuggingFaceModelInfo: undefined,
		actModeSapAiCoreModelId: "",
		actModeHuaweiCloudMaasModelId: "",
		actModeHuaweiCloudMaasModelInfo: undefined,
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

		// Act mode configurations (local providers only)
		actModeApiProvider:
			protoConfig.actModeApiProvider !== undefined ? convertProtoToApiProvider(protoConfig.actModeApiProvider) : undefined,
		actModeApiModelId: protoConfig.actModeApiModelId,
		actModeOllamaModelId: protoConfig.actModeOllamaModelId,
		actModeLmStudioModelId: protoConfig.actModeLmStudioModelId,

		// Favorited model IDs
		favoritedModelIds:
			protoConfig.favoritedModelIds && protoConfig.favoritedModelIds.length > 0 ? protoConfig.favoritedModelIds : undefined,
	}
}
