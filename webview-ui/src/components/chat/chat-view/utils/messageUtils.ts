/**
 * Utility functions for message filtering, grouping, and manipulation
 */

import { ClineMessage } from "@shared/ExtensionMessage"
import { combineApiRequests } from "@shared/combineApiRequests"
import { combineCommandSequences } from "@shared/combineCommandSequences"

/**
 * Combine API requests and command sequences in messages
 */
export function processMessages(messages: ClineMessage[]): ClineMessage[] {
	return combineApiRequests(combineCommandSequences(messages))
}

/**
 * Filter messages that should be visible in the chat
 */
export function filterVisibleMessages(messages: ClineMessage[]): ClineMessage[] {
	return messages.filter((message) => {
		switch (message.ask) {
			case "completion_result":
				// don't show a chat row for a completion_result ask without text. This specific type of message only occurs if cline wants to execute a command as part of its completion result, in which case we interject the completion_result tool with the execute_command tool.
				if (message.text === "") {
					return false
				}
				break
			case "api_req_failed": // this message is used to update the latest api_req_started that the request failed
			case "resume_task":
			case "resume_completed_task":
				return false
		}
		switch (message.say) {
			case "api_req_finished": // combineApiRequests removes this from modifiedMessages anyways
			case "api_req_retried": // this message is used to update the latest api_req_started that the request was retried
			case "deleted_api_reqs": // aggregated api_req metrics from deleted messages
			case "task_progress": // task progress messages are displayed in TaskHeader, not in main chat
				return false
			case "text":
				// Sometimes cline returns an empty text message, we don't want to render these. (We also use a say text for user messages, so in case they just sent images we still render that)
				if ((message.text ?? "") === "" && (message.images?.length ?? 0) === 0) {
					return false
				}
				break
			case "mcp_server_request_started":
				return false
		}
		return true
	})
}

/**
 * Check if a message is part of a browser session
 */
export function isBrowserSessionMessage(_message: ClineMessage): boolean {
	// Browser sessions are disabled in local-only build
	return false
}

/**
 * Group messages, combining browser session messages into arrays
 */
export function groupMessages(visibleMessages: ClineMessage[]): (ClineMessage | ClineMessage[])[] {
	// Browser session grouping disabled in local-only build
	return visibleMessages
}

/**
 * Get the task message from the messages array
 */
export function getTaskMessage(messages: ClineMessage[]): ClineMessage | undefined {
	return messages.at(0)
}

/**
 * Check if we should show the scroll to bottom button
 */
export function shouldShowScrollButton(disableAutoScroll: boolean, isAtBottom: boolean): boolean {
	return disableAutoScroll && !isAtBottom
}
