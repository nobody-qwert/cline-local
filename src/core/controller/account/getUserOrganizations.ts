import type { Controller } from "../index"
import type { EmptyRequest } from "@shared/proto/cline/common"
import { UserOrganizationsResponse } from "@shared/proto/cline/account"

/**
 * Local-only build: return no organizations without calling any cloud services.
 */
export async function getUserOrganizations(_controller: Controller, _request: EmptyRequest): Promise<UserOrganizationsResponse> {
	return UserOrganizationsResponse.create({
		organizations: [],
	})
}
