import { MessageStateHandler } from "./message-state"

/**
 * Stubbed function - checkpoint functionality has been removed
 * This function is kept to maintain compatibility with existing imports
 */
export async function showChangedFilesDiff(
	messageStateHandler: MessageStateHandler,
	checkpointTracker: any,
	messageTs: number,
	seeNewChangesSinceLastTaskCompletion: boolean,
) {
	// No-op: checkpoint functionality has been removed
	console.debug("showChangedFilesDiff called but checkpoint functionality has been removed")
}
