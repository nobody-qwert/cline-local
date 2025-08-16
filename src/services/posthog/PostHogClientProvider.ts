// No-op telemetry shim for lean local build (PostHog removed)

export const telemetryService = {
	captureExtensionActivated: (..._args: any[]) => {},
	captureButtonClick: (..._args: any[]) => {},
	captureCheckpointUsage: (..._args: any[]) => {},
	captureBrowserToolStart: (..._args: any[]) => {},
	captureBrowserToolEnd: (..._args: any[]) => {},
	captureBrowserError: (..._args: any[]) => {},
	captureGeminiApiPerformance: (..._args: any[]) => {},

	// Additional no-op methods referenced across the codebase
	updateTelemetryState: (..._args: any[]) => {},
	captureModeSwitch: (..._args: any[]) => {},
	captureModelFavoritesUsage: (..._args: any[]) => {},
	captureFocusChainToggle: (..._args: any[]) => {},
	captureTaskFeedback: (..._args: any[]) => {},
	captureFocusChainListOpened: (..._args: any[]) => {},
	captureConversationTurnEvent: (..._args: any[]) => {},
	captureTaskRestarted: (..._args: any[]) => {},
	captureTaskCreated: (..._args: any[]) => {},
	captureTaskCompleted: (..._args: any[]) => {},
	captureDiffEditFailure: (..._args: any[]) => {},
	captureToolUsage: (..._args: any[]) => {},
	captureOptionSelected: (..._args: any[]) => {},
	captureOptionsIgnored: (..._args: any[]) => {},
	captureSummarizeTask: (..._args: any[]) => {},
	captureFocusChainListWritten: (..._args: any[]) => {},
	captureFocusChainProgressFirst: (..._args: any[]) => {},
	captureFocusChainProgressUpdate: (..._args: any[]) => {},
	captureFocusChainIncompleteOnCompletion: (..._args: any[]) => {},
}

export const featureFlagsService = {
	getFeatureFlag: (_flag: string) => false as boolean,
	getFeatureFlagPayload: (_flag: string) => undefined as any,
	getFocusChainEnabled: () => false as boolean,
}

export const errorService = {
	logMessage: (..._args: any[]) => {},
	logException: (..._args: any[]) => {},
	toClineError: (..._args: any[]) => undefined as any,
}

export class PostHogClientProvider {
	static _instance: PostHogClientProvider | undefined
	distinctId: string

	constructor(distinctId?: string) {
		this.distinctId = distinctId || ""
	}

	static getInstance(id?: string) {
		if (!this._instance) {
			this._instance = new PostHogClientProvider(id)
		}
		return this._instance
	}

	dispose() {
		// no-op
	}
}
