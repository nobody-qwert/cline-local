import { Controller } from ".."
import { Empty, Int64Request } from "@shared/proto/cline/common"

/**
 * Stubbed function - checkpoint functionality has been removed
 * This function is kept to maintain compatibility with existing imports
 */
export async function checkpointDiff(controller: Controller, request: Int64Request): Promise<Empty> {
	// No-op: checkpoint functionality has been removed
	console.debug("checkpointDiff called but checkpoint functionality has been removed")
	return Empty.create({})
}
