import type { Controller } from "../index"
import { Empty } from "@shared/proto/cline/common"
import { UserOrganizationUpdateRequest } from "@shared/proto/cline/account"

/**
 * Handles setting the user's active organization
 * @param controller The controller instance
 * @param request UserOrganization to set as active
 * @returns Empty response
 */
export async function setUserOrganization(_controller: Controller, _request: UserOrganizationUpdateRequest): Promise<Empty> {
	// Local-only build: no organizations; no-op
	return Empty.create({})
}
