import {
	ApiConfiguration,
	ApiProvider,
	ModelInfo,
	lmStudioModelInfoSaneDefaults,
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
				// Use LM Studio sane defaults as an approximation for Ollama models
				selectedModelInfo: lmStudioModelInfoSaneDefaults,
			}
		}
		case "lmstudio":
		default: {
			const modelId =
				currentMode === "plan" ? apiConfiguration?.planModeLmStudioModelId : apiConfiguration?.actModeLmStudioModelId
			const defaultInfo = getLmStudioModelInfoForModelId(modelId || "")
			const configuredMaxTokens = Number(apiConfiguration?.lmStudioMaxTokens)
			const contextWindowOverride =
				Number.isFinite(configuredMaxTokens) && configuredMaxTokens > 0 ? configuredMaxTokens : undefined

			const selectedModelInfo = {
				...defaultInfo,
				contextWindow: contextWindowOverride ?? defaultInfo.contextWindow,
			}

			return {
				selectedProvider: "lmstudio",
				selectedModelId: modelId || "",
				selectedModelInfo,
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
			// kept for compatibility with callers
			vsCodeLmModelSelector: undefined as any,
		}
	}

	return {
		apiProvider: mode === "plan" ? apiConfiguration.planModeApiProvider : apiConfiguration.actModeApiProvider,
		apiModelId: mode === "plan" ? apiConfiguration.planModeApiModelId : apiConfiguration.actModeApiModelId,
		lmStudioModelId: mode === "plan" ? apiConfiguration.planModeLmStudioModelId : apiConfiguration.actModeLmStudioModelId,
		ollamaModelId: mode === "plan" ? apiConfiguration.planModeOllamaModelId : apiConfiguration.actModeOllamaModelId,
		thinkingBudgetTokens:
			mode === "plan" ? apiConfiguration.planModeThinkingBudgetTokens : apiConfiguration.actModeThinkingBudgetTokens,
		// kept for compatibility with callers
		vsCodeLmModelSelector: undefined as any,
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
