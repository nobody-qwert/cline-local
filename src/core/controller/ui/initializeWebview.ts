import type { Controller } from "../index"
import { EmptyRequest, Empty } from "@shared/proto/cline/common"

import { sendMcpMarketplaceCatalogEvent } from "../mcp/subscribeToMcpMarketplaceCatalog"
import { McpMarketplaceCatalog } from "@shared/mcp"

/**
 * Initialize webview when it launches
 * @param controller The controller instance
 * @param request The empty request
 * @returns Empty response
 */
export async function initializeWebview(controller: Controller, request: EmptyRequest): Promise<Empty> {
	try {
		// GUI relies on model info to be up-to-date to provide the most accurate pricing, so we need to fetch the latest details on launch.
		// We do this for all users since many users switch between api providers and if they were to switch back to openrouter it would be showing outdated model info if we hadn't retrieved the latest at this point
		// (see normalizeApiConfiguration > openrouter)
		// Prefetch marketplace and OpenRouter models

		// Send stored MCP marketplace catalog if available
		const mcpMarketplaceCatalog = controller.cacheService.getGlobalStateKey("mcpMarketplaceCatalog")

		if (mcpMarketplaceCatalog) {
			sendMcpMarketplaceCatalogEvent(mcpMarketplaceCatalog as McpMarketplaceCatalog)
		}

		// Silently refresh MCP marketplace catalog
		controller.silentlyRefreshMcpMarketplace()

		return Empty.create({})
	} catch (error) {
		console.error("Failed to initialize webview:", error)
		// Return empty response even on error to not break the frontend
		return Empty.create({})
	}
}
