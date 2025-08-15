// No-op telemetry shim for lean local build (PostHog removed)

export const telemetryService = {
	captureExtensionActivated: (..._args: any[]) => {},
	captureButtonClick: (..._args: any[]) => {},
	captureCheckpointUsage: (..._args: any[]) => {},
	captureBrowserToolStart: (..._args: any[]) => {},
	captureBrowserToolEnd: (..._args: any[]) => {},
	captureBrowserError: (..._args: any[]) => {},
	captureGeminiApiPerformance: (..._args: any[]) => {},
}

export const featureFlagsService = {
	getFeatureFlag: (_flag: string) => false as boolean,
	getFeatureFlagPayload: (_flag: string) => undefined as any,
}

export const errorService = {
	logMessage: (..._args: any[]) => {},
	logException: (..._args: any[]) => {},
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
