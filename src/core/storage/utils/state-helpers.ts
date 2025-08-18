import { ExtensionContext } from "vscode"
import { ApiProvider, ModelInfo } from "@shared/api"
import { ClineRulesToggles } from "@/shared/cline-rules"
import { DEFAULT_MCP_DISPLAY_MODE, McpDisplayMode } from "@/shared/McpDisplayMode"
import { TelemetrySetting } from "@/shared/TelemetrySetting"
import { HistoryItem } from "@/shared/HistoryItem"
import { AutoApprovalSettings, DEFAULT_AUTO_APPROVAL_SETTINGS } from "@/shared/AutoApprovalSettings"
import { Mode, OpenaiReasoningEffort } from "@/shared/storage/types"
import { SecretKey } from "../state-keys"
import { Controller } from "@/core/controller"

export async function readStateFromDisk(context: ExtensionContext) {
	// Get all global state values (local providers only)
	const strictPlanModeEnabled = context.globalState.get("strictPlanModeEnabled") as boolean | undefined
	const isNewUser = context.globalState.get("isNewUser") as boolean | undefined
	const welcomeViewCompleted = context.globalState.get("welcomeViewCompleted") as boolean | undefined
	const ollamaBaseUrl = context.globalState.get("ollamaBaseUrl") as string | undefined
	const ollamaApiOptionsCtxNum = context.globalState.get("ollamaApiOptionsCtxNum") as string | undefined
	const lmStudioBaseUrl = context.globalState.get("lmStudioBaseUrl") as string | undefined
	const lastShownAnnouncementId = context.globalState.get("lastShownAnnouncementId") as string | undefined
	const taskHistory = context.globalState.get("taskHistory") as HistoryItem[] | undefined
	const autoApprovalSettings = context.globalState.get("autoApprovalSettings") as AutoApprovalSettings | undefined
	const telemetrySetting = context.globalState.get("telemetrySetting") as TelemetrySetting | undefined
	const planActSeparateModelsSettingRaw = context.globalState.get("planActSeparateModelsSetting") as boolean | undefined
	const favoritedModelIds = context.globalState.get("favoritedModelIds") as string[] | undefined
	const globalClineRulesToggles = context.globalState.get("globalClineRulesToggles") as ClineRulesToggles | undefined
	const requestTimeoutMs = context.globalState.get("requestTimeoutMs") as number | undefined
	const shellIntegrationTimeout = context.globalState.get("shellIntegrationTimeout") as number | undefined
	const enableCheckpointsSettingRaw = context.globalState.get("enableCheckpointsSetting") as boolean | undefined
	const mcpMarketplaceEnabledRaw = context.globalState.get("mcpMarketplaceEnabled") as boolean | undefined
	const mcpDisplayMode = context.globalState.get("mcpDisplayMode") as McpDisplayMode | undefined
	const mcpResponsesCollapsedRaw = context.globalState.get("mcpResponsesCollapsed") as boolean | undefined
	const globalWorkflowToggles = context.globalState.get("globalWorkflowToggles") as ClineRulesToggles | undefined
	const terminalReuseEnabled = context.globalState.get("terminalReuseEnabled") as boolean | undefined
	const terminalOutputLineLimit = context.globalState.get("terminalOutputLineLimit") as number | undefined
	const defaultTerminalProfile = context.globalState.get("defaultTerminalProfile") as string | undefined
	const openaiReasoningEffort = context.globalState.get("openaiReasoningEffort") as OpenaiReasoningEffort | undefined
	const preferredLanguage = context.globalState.get("preferredLanguage") as string | undefined

	// Get secret values (local providers only)
	const [apiKey, ollamaApiKey] = await Promise.all([
		context.secrets.get("apiKey") as Promise<string | undefined>,
		context.secrets.get("ollamaApiKey") as Promise<string | undefined>,
	])

	const localClineRulesToggles = context.workspaceState.get("localClineRulesToggles") as ClineRulesToggles | undefined
	const localWindsurfRulesToggles = context.workspaceState.get("localWindsurfRulesToggles") as ClineRulesToggles | undefined
	const localCursorRulesToggles = context.workspaceState.get("localCursorRulesToggles") as ClineRulesToggles | undefined
	const localWorkflowToggles = context.workspaceState.get("workflowToggles") as ClineRulesToggles | undefined

	// Get mode-related configurations
	const mode = context.globalState.get("mode") as Mode | undefined

	// Plan mode configurations (local providers only)
	const planModeApiProvider = context.globalState.get("planModeApiProvider") as ApiProvider | undefined
	const planModeApiModelId = context.globalState.get("planModeApiModelId") as string | undefined
	const planModeVsCodeLmModelSelector = context.globalState.get("planModeVsCodeLmModelSelector") as any | undefined
	const planModeOllamaModelId = context.globalState.get("planModeOllamaModelId") as string | undefined
	const planModeLmStudioModelId = context.globalState.get("planModeLmStudioModelId") as string | undefined

	// Act mode configurations (local providers only)
	const actModeApiProvider = context.globalState.get("actModeApiProvider") as ApiProvider | undefined
	const actModeApiModelId = context.globalState.get("actModeApiModelId") as string | undefined
	const actModeVsCodeLmModelSelector = context.globalState.get("actModeVsCodeLmModelSelector") as any | undefined
	const actModeOllamaModelId = context.globalState.get("actModeOllamaModelId") as string | undefined
	const actModeLmStudioModelId = context.globalState.get("actModeLmStudioModelId") as string | undefined

	let apiProvider: ApiProvider = planModeApiProvider || "lmstudio"

	const mcpResponsesCollapsed = mcpResponsesCollapsedRaw ?? false

	// Plan/Act separate models setting is a boolean indicating whether the user wants to use different models for plan and act. Existing users expect this to be enabled, while we want new users to opt in to this being disabled by default.
	// On win11 state sometimes initializes as empty string instead of undefined
	let planActSeparateModelsSetting: boolean | undefined = undefined
	if (planActSeparateModelsSettingRaw === true || planActSeparateModelsSettingRaw === false) {
		planActSeparateModelsSetting = planActSeparateModelsSettingRaw
	} else {
		// default to true for existing users
		if (planModeApiProvider) {
			planActSeparateModelsSetting = true
		} else {
			// default to false for new users
			planActSeparateModelsSetting = false
		}
	}

	return {
		apiConfiguration: {
			// Global configuration
			requestTimeoutMs,

			// Local provider configurations
			ollamaBaseUrl,
			ollamaApiKey,
			ollamaApiOptionsCtxNum,
			lmStudioBaseUrl,

			// Plan mode configurations (local providers only)
			planModeApiProvider: planModeApiProvider || apiProvider,
			planModeApiModelId,
			planModeVsCodeLmModelSelector,
			planModeOllamaModelId,
			planModeLmStudioModelId,

			// Act mode configurations (local providers only)
			actModeApiProvider: actModeApiProvider || apiProvider,
			actModeApiModelId,
			actModeVsCodeLmModelSelector,
			actModeOllamaModelId,
			actModeLmStudioModelId,

			// Favorited model IDs
			favoritedModelIds,
		},
		strictPlanModeEnabled: strictPlanModeEnabled ?? false,
		isNewUser: isNewUser ?? true,
		welcomeViewCompleted,
		lastShownAnnouncementId,
		taskHistory: taskHistory || [],
		autoApprovalSettings: autoApprovalSettings || DEFAULT_AUTO_APPROVAL_SETTINGS,
		globalClineRulesToggles: globalClineRulesToggles || {},
		preferredLanguage: preferredLanguage || "English",
		openaiReasoningEffort: (openaiReasoningEffort as OpenaiReasoningEffort) || "medium",
		mode: mode || "act",
		mcpMarketplaceEnabled: mcpMarketplaceEnabledRaw ?? true,
		mcpDisplayMode: mcpDisplayMode ?? DEFAULT_MCP_DISPLAY_MODE,
		mcpResponsesCollapsed: mcpResponsesCollapsed,
		telemetrySetting: telemetrySetting || "unset",
		planActSeparateModelsSetting,
		enableCheckpointsSetting: enableCheckpointsSettingRaw ?? true,
		shellIntegrationTimeout: shellIntegrationTimeout || 4000,
		terminalReuseEnabled: terminalReuseEnabled ?? true,
		terminalOutputLineLimit: terminalOutputLineLimit ?? 500,
		defaultTerminalProfile: defaultTerminalProfile ?? "default",
		globalWorkflowToggles: globalWorkflowToggles || {},
		localClineRulesToggles: localClineRulesToggles || {},
		localWindsurfRulesToggles: localWindsurfRulesToggles || {},
		localCursorRulesToggles: localCursorRulesToggles || {},
		localWorkflowToggles: localWorkflowToggles || {},
	}
}

export async function resetWorkspaceState(controller: Controller) {
	const context = controller.context
	await Promise.all(context.workspaceState.keys().map((key) => controller.context.workspaceState.update(key, undefined)))

	await controller.cacheService.reInitialize()
}

export async function resetGlobalState(controller: Controller) {
	// TODO: Reset all workspace states?
	const context = controller.context

	await Promise.all(context.globalState.keys().map((key) => context.globalState.update(key, undefined)))
	const secretKeys: SecretKey[] = ["apiKey", "ollamaApiKey"]
	await Promise.all(secretKeys.map((key) => context.secrets.delete(key)))
	await controller.cacheService.reInitialize()
}
