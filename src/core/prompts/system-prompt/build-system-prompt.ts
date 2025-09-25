import { McpHub } from "@services/mcp/McpHub"
import { ApiHandlerModel } from "@/api"
import { FocusChainSettings } from "@shared/FocusChainSettings"
import { SYSTEM_PROMPT_NEXT_GEN } from "./families/next-gen-models/next-gen-system-prompt"

export const buildSystemPrompt = async (
	cwd: string,
	supportsBrowserUse: boolean,
	mcpHub: McpHub,
	apiHandlerModel: ApiHandlerModel,
	focusChainSettings: FocusChainSettings,
) => {
	return SYSTEM_PROMPT_NEXT_GEN(cwd, mcpHub, focusChainSettings)
}
