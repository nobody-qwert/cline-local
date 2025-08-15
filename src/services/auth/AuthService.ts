// Lean local build AuthService shim (no-op)
import type { Controller } from "@/core/controller"

export class AuthService {
	private static instance: AuthService | undefined

	static getInstance(_controller?: Controller): AuthService {
		if (!this.instance) {
			this.instance = new AuthService()
		}
		return this.instance
	}

	async createAuthRequest(): Promise<any> {
		// Return shape compatible with shared proto String message
		return Promise.resolve({ value: "" } as any)
	}

	async handleAuthCallback(_customToken: string, _provider: string = "google"): Promise<void> {
		// no-op
		return
	}

	restoreRefreshTokenAndRetrieveAuthInfo(): void {
		// no-op
	}

	handleDeauth(): void {
		// no-op
	}

	getInfo(): any {
		// minimal shape to satisfy callers that access user?.uid
		return { user: undefined }
	}
}
