import type { Controller } from "../index"
import type { EmptyRequest } from "@shared/proto/cline/common"
import { UserCreditsData } from "@shared/proto/cline/account"

/**
 * Local-only build: return zero balance and empty transactions without calling any cloud services.
 */
export async function getUserCredits(_controller: Controller, _request: EmptyRequest): Promise<UserCreditsData> {
	return UserCreditsData.create({
		balance: { currentBalance: 0 },
		usageTransactions: [],
		paymentTransactions: [],
	})
}
