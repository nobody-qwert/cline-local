// Provider-agnostic minimal type shapes used across the codebase to represent
// "Anthropic-like" message blocks. This removes any dependency on @anthropic-ai/sdk
// for local-only providers (LM Studio, Ollama).

export namespace AnthropicCompat {
	// Text block
	export interface TextBlockParam {
		type: "text"
		text: string
	}

	// Image block (kept for compile-time compatibility; ignored in local build)
	export interface ImageBlockParam {
		type: "image"
		source: { media_type: string; data: string }
	}

	// Tool use block (assistant requests a tool)
	export interface ToolUseBlockParam {
		type: "tool_use"
		id: string
		name: string
		input: any
	}

	// Tool result block (user/tool response to a tool_use)
	export interface ToolResultBlockParam {
		type: "tool_result"
		tool_use_id: string
		// Can be a string or an array of text/image parts
		content?: string | Array<{ type: "text"; text: string } | ImageBlockParam>
	}

	export type ContentBlockParam = TextBlockParam | ImageBlockParam | ToolUseBlockParam | ToolResultBlockParam

	export namespace Messages {
		// Generic shapes used in our transforms/handlers
		export type MessageParam = {
			role: "user" | "assistant" | "system" | "tool"
			content: string | ContentBlockParam[]
			// other fields may exist depending on provider, but ignored here
		}
		export type Message = any

		// Re-export for convenience
		export type TextBlockParam = AnthropicCompat.TextBlockParam
		export type ImageBlockParam = AnthropicCompat.ImageBlockParam
		export type ToolUseBlockParam = AnthropicCompat.ToolUseBlockParam
		export type ToolResultBlockParam = AnthropicCompat.ToolResultBlockParam
		export type ContentBlockParam = AnthropicCompat.ContentBlockParam
	}
}
