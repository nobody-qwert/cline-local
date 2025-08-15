// Lean local build ClineAccountService shim (no-op)
export type OrgCredits = { organizationId: string; balance: number }
export type OrgUsageTx = {
	aiInferenceProviderName?: string
	aiModelName?: string
	aiModelTypeName?: string
	completionTokens?: number
	costUsd?: number
	createdAt?: string
	creditsUsed?: number
	generationId?: string
	organizationId?: string
	promptTokens?: number
	totalTokens?: number
	userId?: string
}

export class ClineAccountService {
	private static instance: ClineAccountService | undefined

	static getInstance(): ClineAccountService {
		if (!this.instance) this.instance = new ClineAccountService()
		return this.instance
	}

	// RPC-like helpers expected by account controller
	async fetchOrganizationCreditsRPC(_organizationId: string): Promise<OrgCredits | undefined> {
		return { organizationId: _organizationId, balance: 0 }
	}

	async fetchOrganizationUsageTransactionsRPC(_organizationId: string): Promise<OrgUsageTx[] | undefined> {
		return []
	}
}
