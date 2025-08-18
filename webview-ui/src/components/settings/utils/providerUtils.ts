import {
	ApiConfiguration,
	ApiProvider,
	ModelInfo,
	openAiModelInfoSaneDefaults,
	getLmStudioModelInfoForModelId,
} from "@shared/api"
import { Mode } from "@shared/storage/types"

/**
 * Interface for normalized API configuration
 */
export interface NormalizedApiConfig {
	selectedProvider: ApiProvider
	selectedModelId: string
	selectedModelInfo: ModelInfo
}

/**
 * Normalizes API configuration for local-only providers (LM Studio, Ollama).
 * Falls back to LM Studio if provider is unset or unknown.
 */
export function normalizeApiConfiguration(
	apiConfiguration: ApiConfiguration | undefined,
	currentMode: Mode,
): NormalizedApiConfig {
	const provider: ApiProvider =
		((currentMode === "plan"
			? apiConfiguration?.planModeApiProvider
			: apiConfiguration?.actModeApiProvider) as ApiProvider) || ("lmstudio" as ApiProvider)

	switch (provider) {
		case "ollama": {
			const modelId =
				currentMode === "plan" ? apiConfiguration?.planModeOllamaModelId : apiConfiguration?.actModeOllamaModelId
			return {
				selectedProvider: "ollama",
				selectedModelId: modelId || "",
				// Use OpenAI sane defaults as an approximation for Ollama models
				selectedModelInfo: openAiModelInfoSaneDefaults,
			}
		}
		case "lmstudio":
		default: {
			const modelId =
				currentMode === "plan" ? apiConfiguration?.planModeLmStudioModelId : apiConfiguration?.actModeLmStudioModelId
			return {
				selectedProvider: "lmstudio",
				selectedModelId: modelId || "",
				// LM Studio sane defaults with overrides (gpt-oss => 131k, unknown => 128k)
				selectedModelInfo: getLmStudioModelInfoForModelId(modelId || ""),
			}
		}
	}
}

/**
 * Gets mode-specific field values from API configuration
 * Only returns fields used by local providers (lmstudio, ollama).
 */
export function getModeSpecificFields(apiConfiguration: ApiConfiguration | undefined, mode: Mode) {
	if (!apiConfiguration) {
		return {
			apiProvider: undefined as ApiProvider | undefined,
			apiModelId: undefined as string | undefined,
			lmStudioModelId: undefined as string | undefined,
			ollamaModelId: undefined as string | undefined,
			thinkingBudgetTokens: undefined as number | undefined,
			reasoningEffort: undefined as string | undefined,
			// kept for compatibility with callers
			vsCodeLmModelSelector: undefined as any,
			openAiModelInfo: undefined as ModelInfo | undefined,
			liteLlmModelInfo: undefined as ModelInfo | undefined,
			openRouterModelInfo: undefined as ModelInfo | undefined,
			requestyModelInfo: undefined as ModelInfo | undefined,
			groqModelInfo: undefined as ModelInfo | undefined,
			basetenModelInfo: undefined as ModelInfo | undefined,
			huggingFaceModelInfo: undefined as ModelInfo | undefined,
			// aws/huawei custom fields (not used in local build)
			awsBedrockCustomSelected: undefined as boolean | undefined,
			awsBedrockCustomModelBaseId: undefined as string | undefined,
			huaweiCloudMaasModelInfo: undefined as ModelInfo | undefined,
			// provider-specific IDs (not used in local build)
			togetherModelId: undefined as string | undefined,
			fireworksModelId: undefined as string | undefined,
			liteLlmModelId: undefined as string | undefined,
			requestyModelId: undefined as string | undefined,
			openAiModelId: undefined as string | undefined,
			openRouterModelId: undefined as string | undefined,
			groqModelId: undefined as string | undefined,
			basetenModelId: undefined as string | undefined,
			huggingFaceModelId: undefined as string | undefined,
			huaweiCloudMaasModelId: undefined as string | undefined,
		}
	}

	return {
		apiProvider: mode === "plan" ? apiConfiguration.planModeApiProvider : apiConfiguration.actModeApiProvider,
		apiModelId: mode === "plan" ? apiConfiguration.planModeApiModelId : apiConfiguration.actModeApiModelId,
		lmStudioModelId: mode === "plan" ? apiConfiguration.planModeLmStudioModelId : apiConfiguration.actModeLmStudioModelId,
		ollamaModelId: mode === "plan" ? apiConfiguration.planModeOllamaModelId : apiConfiguration.actModeOllamaModelId,
		thinkingBudgetTokens:
			mode === "plan" ? apiConfiguration.planModeThinkingBudgetTokens : apiConfiguration.actModeThinkingBudgetTokens,
		reasoningEffort: mode === "plan" ? apiConfiguration.planModeReasoningEffort : apiConfiguration.actModeReasoningEffort,
		// no-ops for local build (kept to satisfy call sites)
		vsCodeLmModelSelector: undefined,
		openAiModelInfo: undefined,
		liteLlmModelInfo: undefined,
		openRouterModelInfo: undefined,
		requestyModelInfo: undefined,
		groqModelInfo: undefined,
		basetenModelInfo: undefined,
		huggingFaceModelInfo: undefined,
		awsBedrockCustomSelected: undefined,
		awsBedrockCustomModelBaseId: undefined,
		huaweiCloudMaasModelInfo: undefined,
		togetherModelId: undefined,
		fireworksModelId: undefined,
		liteLlmModelId: undefined,
		requestyModelId: undefined,
		openAiModelId: undefined,
		openRouterModelId: undefined,
		groqModelId: undefined,
		basetenModelId: undefined,
		huggingFaceModelId: undefined,
		huaweiCloudMaasModelId: undefined,
	}
}

/**
 * Synchronizes mode configurations when "Use different models for Plan and Act" is disabled.
 * Only handles local providers (lmstudio, ollama). Unknown providers fall back to copying provider + apiModelId.
 */
export async function syncModeConfigurations(
	apiConfiguration: ApiConfiguration | undefined,
	sourceMode: Mode,
	handleFieldsChange: (updates: Partial<ApiConfiguration>) => Promise<void>,
): Promise<void> {
	if (!apiConfiguration) return

	const sourceFields = getModeSpecificFields(apiConfiguration, sourceMode)
	const provider = sourceFields.apiProvider

	if (!provider) return

	const updates: Partial<ApiConfiguration> = {
		planModeApiProvider: provider,
		actModeApiProvider: provider,
		planModeThinkingBudgetTokens: sourceFields.thinkingBudgetTokens,
		actModeThinkingBudgetTokens: sourceFields.thinkingBudgetTokens,
		planModeReasoningEffort: sourceFields.reasoningEffort,
		actModeReasoningEffort: sourceFields.reasoningEffort,
	}

	switch (provider) {
		case "ollama":
			updates.planModeOllamaModelId = sourceFields.ollamaModelId
			updates.actModeOllamaModelId = sourceFields.ollamaModelId
			break
		case "lmstudio":
			updates.planModeLmStudioModelId = sourceFields.lmStudioModelId
			updates.actModeLmStudioModelId = sourceFields.lmStudioModelId
			break
		default:
			// Fallback: copy generic apiModelId only
			updates.planModeApiModelId = sourceFields.apiModelId
			updates.actModeApiModelId = sourceFields.apiModelId
			break
	}

	await handleFieldsChange(updates)
}
