import type { LanguageModelChatSelector } from "../api/providers/types"
import { OpenaiReasoningEffort } from "@shared/storage/types"

export type ApiProvider = "ollama" | "lmstudio"

export interface ApiHandlerOptions {
	// Global configuration (not mode-specific)
	ulid?: string // Used to identify the task in API requests
	requestTimeoutMs?: number
	onRetryAttempt?: (attempt: number, maxRetries: number, delay: number, error: any) => void
	openaiReasoningEffort?: OpenaiReasoningEffort // OpenAI reasoning effort level: "low" | "medium" | "high"

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
	// Whether model supports OpenAI-compatible reasoning output (e.g., streams "reasoning_content")
	supportsReasoning?: boolean
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
	supportsReasoning: false,
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

	// GPT-OSS (OpenAI Harmony-style reasoning; effort is low|medium|high via system prompt)
	if (id.startsWith("gpt-oss") || id.includes("/gpt-oss") || id.includes("openai/gpt-oss")) {
		return { ...base, contextWindow: 131_072, supportsReasoning: true }
	}

	// Qwen 30B families (context windows and thinking support)
	const isQwenThinking2507 =
		id.includes("qwen3-30b-a3b-thinking-2507") || (id.includes("qwen3-30b-a3b") && id.includes("thinking"))
	const isQwenBaseA3B = id.includes("qwen3-30b-a3b") && !id.includes("instruct") && !id.includes("thinking")
	const isQwenInstruct2507 = id.includes("qwen3-30b-a3b-instruct-2507")
	const isQwenCoder30bInstruct =
		id.includes("qwen3-coder-30b-a3b-instruct") || id.includes("qwen-coder-30b-a3b-instruct") || id.includes("qwen-coder-30b")
	const isMlxPort =
		id.includes("mlx") && (id.includes("qwen3-coder-30b-a3b-instruct") || id.includes("qwen-coder-30b-a3b-instruct"))
	const isQwen3_30b_3ab_2507 = id.includes("qwen3-30b-3ab-2507")

	// Thinking-only variant
	if (isQwenThinking2507) {
		return { ...base, contextWindow: 262_144, supportsReasoning: true }
	}

	// Base A3B (supports thinking and non-thinking)
	if (isQwenBaseA3B) {
		return { ...base, contextWindow: 131_072, supportsReasoning: true }
	}

	// Non-thinking instruct variants (including MLX ports)
	if (isQwenInstruct2507 || isQwenCoder30bInstruct || isMlxPort || isQwen3_30b_3ab_2507) {
		return { ...base, contextWindow: 262_144, supportsReasoning: false }
	}

	// Default sane LM Studio local model behavior
	return base
}

// Azure OpenAI (kept for compatibility with OpenAI-compatible endpoints)
export const azureOpenAiDefaultApiVersion = "2024-08-01-preview"
