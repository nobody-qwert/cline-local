import { Controller } from ".."
import { Empty } from "@shared/proto/cline/common"

/**
 * Stubbed function - checkpoint functionality has been removed
 * This function is kept to maintain compatibility with existing imports
 */
export async function checkpointRestore(controller: Controller, request: any): Promise<Empty> {
	// No-op: checkpoint functionality has been removed
	console.debug("checkpointRestore called but checkpoint functionality has been removed")
	return Empty.create({})
}
