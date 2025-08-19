// Stubbed out - web fetching functionality has been removed

export interface OpenGraphData {
	title?: string
	description?: string
	image?: string
	url?: string
	siteName?: string
	type?: string
}

/**
 * Stubbed - web fetching has been removed
 * @param url The URL to fetch metadata from
 * @returns Promise resolving to empty OpenGraphData
 */
export async function fetchOpenGraphData(url: string): Promise<OpenGraphData> {
	// Web fetching functionality has been removed
	return {
		title: url,
		description: "Web fetching is disabled",
		url: url,
	}
}

/**
 * Stubbed - web fetching has been removed
 * @param url The URL to check
 * @returns Promise resolving to false
 */
export async function detectImageUrl(url: string): Promise<boolean> {
	// Web fetching functionality has been removed
	// Simple extension check only
	return /\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff|tif|avif)$/i.test(url)
}
