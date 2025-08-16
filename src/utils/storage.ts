import path from "path"
import getFolderSize from "get-folder-size"

/**
 * Gets the total size of tasks directory
 * @param storagePath The base storage path (typically globalStorageUri.fsPath)
 * @returns The total size in bytes, or null if calculation fails
 */
export async function getTotalTasksSize(storagePath: string): Promise<number | null> {
	const tasksDir = path.join(storagePath, "tasks")

	try {
		const tasksSize = await getFolderSize.loose(tasksDir)
		return tasksSize
	} catch (error) {
		console.error("Failed to calculate total task size:", error)
		return null
	}
}
