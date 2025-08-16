// Lightweight type shim to avoid build/TS errors when @anthropic-ai/sdk is not installed.
// This is sufficient for files that only need the types at compile time.
// If you later install the real package, this shim will be ignored due to module resolution.

declare module "@anthropic-ai/sdk" {
	// Export a minimal Anthropic namespace with just the shapes our code references.
	// Use 'any' liberally to avoid strict coupling.
	export namespace Anthropic {
		export namespace Messages {
			// Commonly referenced types in transforms/handlers
			export type MessageParam = any
			export type Message = any

			export interface ImageBlockParam {
				type: "image"
				source: { media_type: string; data: string }
			}

			export interface TextBlockParam {
				type: "text"
				text: string
			}

			export interface ToolResultBlockParam {
				type: "tool_result"
				tool_use_id: string
				// In practice can be a string or array of blocks
				content?: string | Array<{ type: "text"; text: string } | ImageBlockParam>
			}

			export interface ToolUseBlock {
				type: "tool_use"
				id: string
				name: string
				input: any
			}
		}
	}

	// Default export placeholder
	const AnthropicDefault: any
	export default AnthropicDefault
}
