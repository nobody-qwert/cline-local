import { ApiProvider, ModelInfo } from "@shared/api"
import { ClineRulesToggles } from "@/shared/cline-rules"
import { McpDisplayMode } from "@/shared/McpDisplayMode"
import { TelemetrySetting } from "@/shared/TelemetrySetting"
import { HistoryItem } from "@/shared/HistoryItem"
import { AutoApprovalSettings } from "@/shared/AutoApprovalSettings"
import { Mode, OpenaiReasoningEffort } from "@/shared/storage/types"
import { McpMarketplaceCatalog } from "@/shared/mcp"
import { FocusChainSettings } from "@shared/FocusChainSettings"

export type SecretKey = "ollamaApiKey" | "apiKey"

export type GlobalStateKey =
	| "lastShownAnnouncementId"
	| "taskHistory"
	| "ollamaBaseUrl"
	| "ollamaApiOptionsCtxNum"
	| "lmStudioBaseUrl"
	| "autoApprovalSettings"
	| "globalClineRulesToggles"
	| "globalWorkflowToggles"
	| "mcpMarketplaceCatalog"
	| "telemetrySetting"
	| "planActSeparateModelsSetting"
	| "enableCheckpointsSetting"
	| "mcpMarketplaceEnabled"
	| "favoritedModelIds"
	| "requestTimeoutMs"
	| "shellIntegrationTimeout"
	| "mcpResponsesCollapsed"
	| "terminalReuseEnabled"
	| "defaultTerminalProfile"
	| "isNewUser"
	| "welcomeViewCompleted"
	| "terminalOutputLineLimit"
	| "mcpDisplayMode"
	| "strictPlanModeEnabled"
	| "focusChainSettings"
	| "focusChainFeatureFlagEnabled"
	// Settings around plan/act and ephemeral model configuration
	| "preferredLanguage"
	| "openaiReasoningEffort"
	| "mode"
	// Plan mode configurations
	| "planModeApiProvider"
	| "planModeApiModelId"
	| "planModeVsCodeLmModelSelector"
	| "planModeOllamaModelId"
	| "planModeLmStudioModelId"
	// Act mode configurations
	| "actModeApiProvider"
	| "actModeApiModelId"
	| "actModeVsCodeLmModelSelector"
	| "actModeOllamaModelId"
	| "actModeLmStudioModelId"
	| "planModeThinkingBudgetTokens"
	| "actModeThinkingBudgetTokens"

export type LocalStateKey = "localClineRulesToggles" | "localCursorRulesToggles" | "localWindsurfRulesToggles" | "workflowToggles"

export interface GlobalState {
	lastShownAnnouncementId: string | undefined
	taskHistory: HistoryItem[]
	ollamaBaseUrl: string | undefined
	ollamaApiOptionsCtxNum: string | undefined
	lmStudioBaseUrl: string | undefined
	autoApprovalSettings: AutoApprovalSettings
	globalClineRulesToggles: ClineRulesToggles
	globalWorkflowToggles: ClineRulesToggles
	mcpMarketplaceCatalog: McpMarketplaceCatalog | undefined
	telemetrySetting: TelemetrySetting
	planActSeparateModelsSetting: boolean
	enableCheckpointsSetting: boolean
	mcpMarketplaceEnabled: boolean
	favoritedModelIds: string[] | undefined
	requestTimeoutMs: number | undefined
	shellIntegrationTimeout: number
	mcpResponsesCollapsed: boolean
	terminalReuseEnabled: boolean
	defaultTerminalProfile: string
	isNewUser: boolean
	welcomeViewCompleted: boolean | undefined
	terminalOutputLineLimit: number
	mcpDisplayMode: McpDisplayMode
	strictPlanModeEnabled: boolean
	preferredLanguage: string
	openaiReasoningEffort: OpenaiReasoningEffort
	mode: Mode
	focusChainSettings: FocusChainSettings
	focusChainFeatureFlagEnabled: boolean
	// Plan mode configurations
	planModeApiProvider: ApiProvider
	planModeApiModelId: string | undefined
	planModeVsCodeLmModelSelector: any | undefined
	planModeOllamaModelId: string | undefined
	planModeLmStudioModelId: string | undefined
	planModeThinkingBudgetTokens: number | undefined
	// Act mode configurations
	actModeApiProvider: ApiProvider
	actModeApiModelId: string | undefined
	actModeVsCodeLmModelSelector: any | undefined
	actModeOllamaModelId: string | undefined
	actModeLmStudioModelId: string | undefined
	actModeThinkingBudgetTokens: number | undefined
}

export interface Secrets {
	ollamaApiKey: string | undefined
	apiKey: string | undefined
}

export interface LocalState {
	localClineRulesToggles: ClineRulesToggles
	localCursorRulesToggles: ClineRulesToggles
	localWindsurfRulesToggles: ClineRulesToggles
	workflowToggles: ClineRulesToggles
}
