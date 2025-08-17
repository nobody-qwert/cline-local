import React, { useCallback } from "react"
import ChatRow from "@/components/chat/ChatRow"
import { ClineMessage } from "@shared/ExtensionMessage"
import { MessageHandlers } from "../../types/chatTypes"

interface MessageRendererProps {
	index: number
	messageOrGroup: ClineMessage | ClineMessage[]
	groupedMessages: (ClineMessage | ClineMessage[])[]
	modifiedMessages: ClineMessage[]
	expandedRows: Record<number, boolean>
	onToggleExpand: (ts: number) => void
	onHeightChange: (isTaller: boolean) => void
	onSetQuote: (quote: string | null) => void
	inputValue: string
	messageHandlers: MessageHandlers
}

/**
 * Specialized component for rendering messages
 * Handles regular chat messages only
 */
export const MessageRenderer: React.FC<MessageRendererProps> = ({
	index,
	messageOrGroup,
	groupedMessages,
	modifiedMessages,
	expandedRows,
	onToggleExpand,
	onHeightChange,
	onSetQuote,
	inputValue,
	messageHandlers,
}) => {
	// Handle only single messages (arrays/browser sessions no longer supported)
	const message = Array.isArray(messageOrGroup) ? messageOrGroup[0] : messageOrGroup

	// Determine if this is the last message for status display purposes
	const isLast = index === groupedMessages.length - 1

	// Regular message
	return (
		<ChatRow
			key={message.ts}
			message={message}
			isExpanded={expandedRows[message.ts] || false}
			onToggleExpand={onToggleExpand}
			lastModifiedMessage={modifiedMessages.at(-1)}
			isLast={isLast}
			onHeightChange={onHeightChange}
			inputValue={inputValue}
			sendMessageFromChatRow={messageHandlers.handleSendMessage}
			onSetQuote={onSetQuote}
		/>
	)
}

/**
 * Factory function to create the itemContent callback for Virtuoso
 * This allows us to encapsulate the rendering logic while maintaining performance
 */
export const createMessageRenderer = (
	groupedMessages: (ClineMessage | ClineMessage[])[],
	modifiedMessages: ClineMessage[],
	expandedRows: Record<number, boolean>,
	onToggleExpand: (ts: number) => void,
	onHeightChange: (isTaller: boolean) => void,
	onSetQuote: (quote: string | null) => void,
	inputValue: string,
	messageHandlers: MessageHandlers,
) => {
	return (index: number, messageOrGroup: ClineMessage | ClineMessage[]) => (
		<MessageRenderer
			index={index}
			messageOrGroup={messageOrGroup}
			groupedMessages={groupedMessages}
			modifiedMessages={modifiedMessages}
			expandedRows={expandedRows}
			onToggleExpand={onToggleExpand}
			onHeightChange={onHeightChange}
			onSetQuote={onSetQuote}
			inputValue={inputValue}
			messageHandlers={messageHandlers}
		/>
	)
}
