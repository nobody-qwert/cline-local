import type { LanguageModelChatSelector } from "../api/providers/types"

export type ApiProvider = "ollama" | "lmstudio"

export interface ApiHandlerOptions {
	// Global configuration (not mode-specific)
	ulid?: string // Used to identify the task in API requests
	requestTimeoutMs?: number
	onRetryAttempt?: (attempt: number, maxRetries: number, delay: number, error: any) => void

	// Local provider configurations
	ollamaBaseUrl?: string
	ollamaApiKey?: string
	ollamaApiOptionsCtxNum?: string
	lmStudioBaseUrl?: string

	// Plan mode configurations
	planModeApiModelId?: string
	planModeVsCodeLmModelSelector?: LanguageModelChatSelector
	planModeOllamaModelId?: string
	planModeLmStudioModelId?: string
	planModeThinkingBudgetTokens?: number

	// Act mode configurations
	actModeApiModelId?: string
	actModeVsCodeLmModelSelector?: LanguageModelChatSelector
	actModeOllamaModelId?: string
	actModeLmStudioModelId?: string
	actModeThinkingBudgetTokens?: number
}

export type ApiConfiguration = ApiHandlerOptions & {
	planModeApiProvider?: ApiProvider
	actModeApiProvider?: ApiProvider
	favoritedModelIds?: string[]
}

// Models

interface PriceTier {
	tokenLimit: number // Upper limit (inclusive) of *input* tokens for this price. Use Infinity for the highest tier.
	price: number // Price per million tokens for this tier.
}

export interface ModelInfo {
	maxTokens?: number
	contextWindow?: number
	supportsImages?: boolean
	supportsPromptCache: boolean
	inputPrice?: number
	outputPrice?: number
	cacheWritesPrice?: number
	cacheReadsPrice?: number
	description?: string
	tiers?: {
		contextWindow: number
		inputPrice?: number
		outputPrice?: number
		cacheWritesPrice?: number
		cacheReadsPrice?: number
	}[]
}

export interface OpenAiCompatibleModelInfo extends ModelInfo {
	temperature?: number
	isR1FormatRequired?: boolean
}

// LM Studio sane defaults for local models
export const lmStudioModelInfoSaneDefaults: ModelInfo = {
	maxTokens: -1,
	contextWindow: 128_000,
	supportsImages: false,
	supportsPromptCache: false,
	inputPrice: 0,
	outputPrice: 0,
}

/**
 * Returns LM Studio model info with sane defaults, applying overrides for known model patterns.
 * Rules:
 * - If model id matches /^gpt-oss/i or contains "/gpt-oss", use 131,072 context window
 * - Otherwise, default to 128,000
 */
export function getLmStudioModelInfoForModelId(modelId?: string): ModelInfo {
	const base = { ...lmStudioModelInfoSaneDefaults }
	if (!modelId) {
		return base
	}
	const id = modelId.toLowerCase()
	if (id.startsWith("gpt-oss") || id.includes("/gpt-oss")) {
		return { ...base, contextWindow: 131_072 }
	}
	return base
}

// Azure OpenAI (kept for compatibility with OpenAI-compatible endpoints)
export const azureOpenAiDefaultApiVersion = "2024-08-01-preview"
