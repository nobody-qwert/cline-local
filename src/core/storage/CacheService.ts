import { ApiConfiguration } from "@shared/api"
import { SecretKey, GlobalStateKey, LocalStateKey, GlobalState, Secrets, LocalState } from "./state-keys"
import { CACHE_SERVICE_NOT_INITIALIZED } from "./error-messages"
import type { ExtensionContext } from "vscode"
import { readStateFromDisk } from "./utils/state-helpers"
import { DEFAULT_AUTO_APPROVAL_SETTINGS } from "@/shared/AutoApprovalSettings"
import { DEFAULT_FOCUS_CHAIN_SETTINGS } from "@shared/FocusChainSettings"

/**
 * Interface for persistence error event data
 */
export interface PersistenceErrorEvent {
	error: Error
}

/**
 * In-memory cache service for fast state access
 * Provides immediate reads/writes with async disk persistence
 */
export class CacheService {
	private globalStateCache: GlobalState = {} as GlobalState
	private secretsCache: Secrets = {} as Secrets
	private workspaceStateCache: LocalState = {} as LocalState
	private context: ExtensionContext
	private isInitialized = false

	// Debounced persistence state
	private pendingGlobalState = new Set<GlobalStateKey>()
	private pendingSecrets = new Set<SecretKey>()
	private pendingWorkspaceState = new Set<LocalStateKey>()
	private persistenceTimeout: NodeJS.Timeout | null = null
	private readonly PERSISTENCE_DELAY_MS = 500

	// Callback for persistence errors
	onPersistenceError?: (event: PersistenceErrorEvent) => void

	constructor(context: ExtensionContext) {
		this.context = context
	}

	/**
	 * Initialize the cache by loading data from disk
	 */
	async initialize(): Promise<void> {
		try {
			// Load all extension state from disk
			const state = await readStateFromDisk(this.context)

			if (state) {
				// Populate the caches with all extension state fields
				// Use populate method to avoid triggering persistence during initialization
				this.populateCache(state)
			}

			this.isInitialized = true
		} catch (error) {
			console.error("Failed to initialize CacheService:", error)
			throw error
		}
	}

	/**
	 * Set method for global state keys - updates cache immediately and schedules debounced persistence
	 */
	setGlobalState<K extends keyof GlobalState>(key: K, value: GlobalState[K]): void {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}

		// Update cache immediately for instant access
		this.globalStateCache[key] = value

		// Add to pending persistence set and schedule debounced write
		this.pendingGlobalState.add(key)
		this.scheduleDebouncedPersistence()
	}

	/**
	 * Batch set method for global state keys - updates cache immediately and schedules debounced persistence
	 */
	setGlobalStateBatch(updates: Partial<GlobalState>): void {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}

		// Update cache in one go
		// Using object.assign to because typescript is not able to infer the type of the updates object when using Object.entries
		Object.assign(this.globalStateCache, updates)

		// Then track the keys for persistence
		Object.keys(updates).forEach((key) => {
			this.pendingGlobalState.add(key as GlobalStateKey)
		})

		// Schedule debounced persistence
		this.scheduleDebouncedPersistence()
	}

	/**
	 * Set method for secret keys - updates cache immediately and schedules debounced persistence
	 */
	setSecret<K extends keyof Secrets>(key: K, value: Secrets[K]): void {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}

		// Update cache immediately for instant access
		this.secretsCache[key] = value

		// Add to pending persistence set and schedule debounced write
		this.pendingSecrets.add(key)
		this.scheduleDebouncedPersistence()
	}

	/**
	 * Batch set method for secret keys - updates cache immediately and schedules debounced persistence
	 */
	setSecretsBatch(updates: Partial<Secrets>): void {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}

		// Update cache immediately for all keys
		Object.entries(updates).forEach(([key, value]) => {
			this.secretsCache[key as keyof Secrets] = value
			this.pendingSecrets.add(key as SecretKey)
		})

		// Schedule debounced persistence
		this.scheduleDebouncedPersistence()
	}

	/**
	 * Set method for workspace state keys - updates cache immediately and schedules debounced persistence
	 */
	setWorkspaceState<K extends keyof LocalState>(key: K, value: LocalState[K]): void {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}

		// Update cache immediately for instant access
		this.workspaceStateCache[key] = value

		// Add to pending persistence set and schedule debounced write
		this.pendingWorkspaceState.add(key)
		this.scheduleDebouncedPersistence()
	}

	/**
	 * Batch set method for workspace state keys - updates cache immediately and schedules debounced persistence
	 */
	setWorkspaceStateBatch(updates: Partial<LocalState>): void {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}

		// Update cache immediately for all keys
		Object.entries(updates).forEach(([key, value]) => {
			this.workspaceStateCache[key as keyof LocalState] = value
			this.pendingWorkspaceState.add(key as LocalStateKey)
		})

		// Schedule debounced persistence
		this.scheduleDebouncedPersistence()
	}

	/**
	 * Convenience method for getting API configuration
	 * Ensures cache is initialized if not already done
	 */
	getApiConfiguration(): ApiConfiguration {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}

		// Construct API configuration from cached component keys
		return this.constructApiConfigurationFromCache()
	}

	/**
	 * Convenience method for setting API configuration
	 */
	setApiConfiguration(apiConfiguration: ApiConfiguration): void {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}

		const {
			// Local provider configuration fields only
			requestTimeoutMs,
			openaiReasoningEffort,
			ollamaBaseUrl,
			ollamaApiKey,
			ollamaApiOptionsCtxNum,
			lmStudioBaseUrl,
			// Plan mode configurations (local providers only)
			planModeApiProvider,
			planModeApiModelId,
			planModeVsCodeLmModelSelector,
			planModeOllamaModelId,
			planModeLmStudioModelId,
			planModeThinkingBudgetTokens,
			// Act mode configurations (local providers only)
			actModeApiProvider,
			actModeApiModelId,
			actModeVsCodeLmModelSelector,
			actModeOllamaModelId,
			actModeLmStudioModelId,
			actModeThinkingBudgetTokens,
			// Favorited model IDs
			favoritedModelIds,
		} = apiConfiguration

		// Batch update global state keys (local providers only)
		// Only persist fields that are explicitly provided to avoid clearing values (e.g., openaiReasoningEffort)
		const gsUpdates: Partial<GlobalState> = {}
		const setGS = <K extends keyof GlobalState>(key: K, value: GlobalState[K] | undefined) => {
			if (value !== undefined) {
				gsUpdates[key] = value
			}
		}

		// Plan mode configuration updates
		setGS("planModeApiProvider", planModeApiProvider)
		setGS("planModeApiModelId", planModeApiModelId as any)
		setGS("planModeVsCodeLmModelSelector", planModeVsCodeLmModelSelector as any)
		setGS("planModeOllamaModelId", planModeOllamaModelId as any)
		setGS("planModeLmStudioModelId", planModeLmStudioModelId as any)
		setGS("planModeThinkingBudgetTokens", planModeThinkingBudgetTokens as any)

		// Act mode configuration updates
		setGS("actModeApiProvider", actModeApiProvider)
		setGS("actModeApiModelId", actModeApiModelId as any)
		setGS("actModeVsCodeLmModelSelector", actModeVsCodeLmModelSelector as any)
		setGS("actModeOllamaModelId", actModeOllamaModelId as any)
		setGS("actModeLmStudioModelId", actModeLmStudioModelId as any)
		setGS("actModeThinkingBudgetTokens", actModeThinkingBudgetTokens as any)

		// Global state updates
		setGS("ollamaBaseUrl", ollamaBaseUrl as any)
		setGS("ollamaApiOptionsCtxNum", ollamaApiOptionsCtxNum as any)
		setGS("lmStudioBaseUrl", lmStudioBaseUrl as any)
		setGS("favoritedModelIds", favoritedModelIds as any)
		setGS("requestTimeoutMs", requestTimeoutMs as any)
		setGS("openaiReasoningEffort", openaiReasoningEffort as any)

		this.setGlobalStateBatch(gsUpdates)

		// Batch update secrets (local providers only)
		this.setSecretsBatch({
			ollamaApiKey,
		})
	}

	/**
	 * Get method for global state keys - reads from in-memory cache
	 */
	getGlobalStateKey<K extends keyof GlobalState>(key: K): GlobalState[K] {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}
		return this.globalStateCache[key]
	}

	/**
	 * Get method for secret keys - reads from in-memory cache
	 */
	getSecretKey<K extends keyof Secrets>(key: K): Secrets[K] {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}
		return this.secretsCache[key]
	}

	/**
	 * Get method for workspace state keys - reads from in-memory cache
	 */
	getWorkspaceStateKey<K extends keyof LocalState>(key: K): LocalState[K] {
		if (!this.isInitialized) {
			throw new Error(CACHE_SERVICE_NOT_INITIALIZED)
		}
		return this.workspaceStateCache[key]
	}

	/**
	 * Reinitialize the cache service by clearing all state and reloading from disk
	 * Used for error recovery when write operations fail
	 */
	async reInitialize(): Promise<void> {
		// Clear all cached data and pending state
		this.dispose()

		// Reinitialize from disk
		await this.initialize()
	}

	/**
	 * Dispose of the cache service
	 */
	private dispose(): void {
		if (this.persistenceTimeout) {
			clearTimeout(this.persistenceTimeout)
			this.persistenceTimeout = null
		}

		this.pendingGlobalState.clear()
		this.pendingSecrets.clear()
		this.pendingWorkspaceState.clear()

		this.globalStateCache = {} as GlobalState
		this.secretsCache = {} as Secrets
		this.workspaceStateCache = {} as LocalState

		this.isInitialized = false
	}

	/**
	 * Schedule debounced persistence - simple timeout-based persistence
	 */
	private scheduleDebouncedPersistence(): void {
		// Clear existing timeout if one is pending
		if (this.persistenceTimeout) {
			clearTimeout(this.persistenceTimeout)
		}

		// Schedule a new timeout to persist pending changes
		this.persistenceTimeout = setTimeout(async () => {
			try {
				await Promise.all([
					this.persistGlobalStateBatch(this.pendingGlobalState),
					this.persistSecretsBatch(this.pendingSecrets),
					this.persistWorkspaceStateBatch(this.pendingWorkspaceState),
				])

				// Clear pending sets on successful persistence
				this.pendingGlobalState.clear()
				this.pendingSecrets.clear()
				this.pendingWorkspaceState.clear()
				this.persistenceTimeout = null
			} catch (error) {
				console.error("Failed to persist pending changes:", error)
				this.persistenceTimeout = null

				// Call persistence error callback for error recovery
				this.onPersistenceError?.({ error: error as Error })
			}
		}, this.PERSISTENCE_DELAY_MS)
	}

	/**
	 * Private method to batch persist global state keys with Promise.all
	 */
	private async persistGlobalStateBatch(keys: Set<GlobalStateKey>): Promise<void> {
		try {
			await Promise.all(
				Array.from(keys).map((key) => {
					const value = this.globalStateCache[key]
					return this.context.globalState.update(key, value)
				}),
			)
		} catch (error) {
			console.error("Failed to persist global state batch:", error)
			throw error
		}
	}

	/**
	 * Private method to batch persist secrets with Promise.all
	 */
	private async persistSecretsBatch(keys: Set<SecretKey>): Promise<void> {
		try {
			await Promise.all(
				Array.from(keys).map((key) => {
					const value = this.secretsCache[key]
					if (value) {
						return this.context.secrets.store(key, value)
					} else {
						return this.context.secrets.delete(key)
					}
				}),
			)
		} catch (error) {
			console.error("Failed to persist secrets batch:", error)
			throw error
		}
	}

	/**
	 * Private method to batch persist workspace state keys with Promise.all
	 */
	private async persistWorkspaceStateBatch(keys: Set<LocalStateKey>): Promise<void> {
		try {
			await Promise.all(
				Array.from(keys).map((key) => {
					const value = this.workspaceStateCache[key]
					return this.context.workspaceState.update(key, value)
				}),
			)
		} catch (error) {
			console.error("Failed to persist workspace state batch:", error)
			throw error
		}
	}

	/**
	 * Private method to populate cache with all extension state without triggering persistence
	 * Used during initialization
	 */
	private populateCache(state: any): void {
		// Extract API configuration fields (only local providers)
		const {
			apiKey,
			requestTimeoutMs,
			ollamaBaseUrl,
			ollamaApiKey,
			ollamaApiOptionsCtxNum,
			lmStudioBaseUrl,
			// Plan mode configurations
			planModeApiProvider,
			planModeApiModelId,
			planModeVsCodeLmModelSelector,
			planModeOllamaModelId,
			planModeLmStudioModelId,
			planModeThinkingBudgetTokens,
			// Act mode configurations
			actModeApiProvider,
			actModeApiModelId,
			actModeVsCodeLmModelSelector,
			actModeOllamaModelId,
			actModeLmStudioModelId,
			actModeThinkingBudgetTokens,
			// Favorited model IDs
			favoritedModelIds,
		} = state.apiConfiguration || {}

		// Directly populate global state cache without triggering persistence
		const globalStateFields = {
			// Extension state fields
			strictPlanModeEnabled: state.strictPlanModeEnabled,
			isNewUser: state.isNewUser,
			welcomeViewCompleted: state.welcomeViewCompleted,
			autoApprovalSettings: state.autoApprovalSettings || DEFAULT_AUTO_APPROVAL_SETTINGS,
			globalClineRulesToggles: state.globalClineRulesToggles,
			focusChainSettings: state.focusChainSettings || DEFAULT_FOCUS_CHAIN_SETTINGS,
			focusChainFeatureFlagEnabled: state.focusChainFeatureFlagEnabled,
			preferredLanguage: state.preferredLanguage,
			openaiReasoningEffort: state.openaiReasoningEffort,
			mode: state.mode,
			mcpMarketplaceEnabled: state.mcpMarketplaceEnabled,
			mcpDisplayMode: state.mcpDisplayMode,
			mcpResponsesCollapsed: state.mcpResponsesCollapsed,
			telemetrySetting: state.telemetrySetting,
			planActSeparateModelsSetting: state.planActSeparateModelsSetting,
			enableCheckpointsSetting: state.enableCheckpointsSetting,
			shellIntegrationTimeout: state.shellIntegrationTimeout,
			terminalReuseEnabled: state.terminalReuseEnabled,
			terminalOutputLineLimit: state.terminalOutputLineLimit,
			defaultTerminalProfile: state.defaultTerminalProfile,
			globalWorkflowToggles: state.globalWorkflowToggles,
			taskHistory: state.taskHistory,
			lastShownAnnouncementId: state.lastShownAnnouncementId,
			mcpMarketplaceCatalog: state.mcpMarketplaceCatalog,

			// Local provider configuration updates
			ollamaBaseUrl,
			ollamaApiOptionsCtxNum,
			lmStudioBaseUrl,
			favoritedModelIds,
			requestTimeoutMs,

			// Plan mode configuration updates (local providers only)
			planModeApiProvider,
			planModeApiModelId,
			planModeVsCodeLmModelSelector,
			planModeOllamaModelId,
			planModeLmStudioModelId,
			planModeThinkingBudgetTokens,

			// Act mode configuration updates (local providers only)
			actModeApiProvider,
			actModeApiModelId,
			actModeVsCodeLmModelSelector,
			actModeOllamaModelId,
			actModeLmStudioModelId,
			actModeThinkingBudgetTokens,
		} satisfies GlobalState

		// Populate global state cache directly
		Object.assign(this.globalStateCache, globalStateFields)

		// Directly populate secrets cache without triggering persistence (local providers only)
		const secretsFields = {
			apiKey,
			ollamaApiKey,
		} satisfies Secrets

		// Populate secrets cache directly
		Object.assign(this.secretsCache, secretsFields)

		// Populate workspace state cache directly
		const workspaceStateFields = {
			localClineRulesToggles: state.localClineRulesToggles,
			localWindsurfRulesToggles: state.localWindsurfRulesToggles,
			localCursorRulesToggles: state.localCursorRulesToggles,
			workflowToggles: state.localWorkflowToggles, // Note: key name is "workflowToggles" in LocalStateKey
		}

		Object.assign(this.workspaceStateCache, workspaceStateFields)
	}

	/**
	 * Construct API configuration from cached component keys
	 */
	private constructApiConfigurationFromCache(): ApiConfiguration {
		return {
			// Local provider configuration fields only
			requestTimeoutMs: this.globalStateCache["requestTimeoutMs"],
			openaiReasoningEffort: this.globalStateCache["openaiReasoningEffort"],
			ollamaBaseUrl: this.globalStateCache["ollamaBaseUrl"],
			ollamaApiKey: this.secretsCache["ollamaApiKey"],
			ollamaApiOptionsCtxNum: this.globalStateCache["ollamaApiOptionsCtxNum"],
			lmStudioBaseUrl: this.globalStateCache["lmStudioBaseUrl"],

			// Plan mode configurations (local providers only)
			planModeApiProvider: this.globalStateCache["planModeApiProvider"],
			planModeApiModelId: this.globalStateCache["planModeApiModelId"],
			planModeVsCodeLmModelSelector: this.globalStateCache["planModeVsCodeLmModelSelector"],
			planModeOllamaModelId: this.globalStateCache["planModeOllamaModelId"],
			planModeLmStudioModelId: this.globalStateCache["planModeLmStudioModelId"],
			planModeThinkingBudgetTokens: this.globalStateCache["planModeThinkingBudgetTokens"],

			// Act mode configurations (local providers only)
			actModeApiProvider: this.globalStateCache["actModeApiProvider"],
			actModeApiModelId: this.globalStateCache["actModeApiModelId"],
			actModeVsCodeLmModelSelector: this.globalStateCache["actModeVsCodeLmModelSelector"],
			actModeOllamaModelId: this.globalStateCache["actModeOllamaModelId"],
			actModeLmStudioModelId: this.globalStateCache["actModeLmStudioModelId"],
			actModeThinkingBudgetTokens: this.globalStateCache["actModeThinkingBudgetTokens"],

			// Favorited model IDs
			favoritedModelIds: this.globalStateCache["favoritedModelIds"],
		}
	}
}
