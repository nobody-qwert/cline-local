import { ApiConfiguration, ModelInfo } from "@shared/api"
import { getModeSpecificFields } from "@/components/settings/utils/providerUtils"
import { Mode } from "@shared/storage/types"

export function validateApiConfiguration(currentMode: Mode, apiConfiguration?: ApiConfiguration): string | undefined {
	if (!apiConfiguration) return undefined
	const { apiProvider, ollamaModelId, lmStudioModelId } = getModeSpecificFields(apiConfiguration, currentMode)

	switch (apiProvider) {
		case "ollama":
			if (!ollamaModelId) return "You must provide a valid model ID."
			return undefined
		case "lmstudio":
		default:
			// Default to LM Studio in local build
			if (!lmStudioModelId) return "You must provide a valid model ID."
			return undefined
	}
}

export function validateModelId(
	currentMode: Mode,
	apiConfiguration?: ApiConfiguration,
	_openRouterModels?: Record<string, ModelInfo>,
): string | undefined {
	if (!apiConfiguration) return undefined
	const { apiProvider, lmStudioModelId, ollamaModelId } = getModeSpecificFields(apiConfiguration, currentMode)
	if (apiProvider === "ollama") {
		return ollamaModelId ? undefined : "You must provide a model ID."
	}
	// Default to LM Studio
	return lmStudioModelId ? undefined : "You must provide a model ID."
}
