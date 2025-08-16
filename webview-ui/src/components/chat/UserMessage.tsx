import Thumbnails from "@/components/common/Thumbnails"
import React, { useRef, useState } from "react"
import DynamicTextArea from "react-textarea-autosize"
import { highlightText } from "./task-header/TaskHeader"

interface UserMessageProps {
	text?: string
	files?: string[]
	images?: string[]
	sendMessageFromChatRow?: (text: string, images: string[], files: string[]) => void
}

const UserMessage: React.FC<UserMessageProps> = ({ text, images, files, sendMessageFromChatRow }) => {
	const [isEditing, setIsEditing] = useState(false)
	const [editedText, setEditedText] = useState(text || "")
	const textAreaRef = useRef<HTMLTextAreaElement>(null)

	const handleClick = () => {
		if (!isEditing) {
			setIsEditing(true)
		}
	}

	// Select all text when entering edit mode
	React.useEffect(() => {
		if (isEditing && textAreaRef.current) {
			textAreaRef.current.select()
		}
	}, [isEditing])

	const handleSendMessage = () => {
		setIsEditing(false)

		if (text === editedText) {
			return
		}

		sendMessageFromChatRow?.(editedText, images || [], files || [])
	}

	const handleBlur = () => {
		setIsEditing(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Escape") {
			setIsEditing(false)
		} else if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	return (
		<div
			style={{
				backgroundColor: isEditing ? "unset" : "var(--vscode-badge-background)",
				color: "var(--vscode-badge-foreground)",
				borderRadius: "3px",
				padding: "9px",
				whiteSpace: "pre-line",
				wordWrap: "break-word",
			}}
			onClick={handleClick}>
			{isEditing ? (
				<>
					<DynamicTextArea
						ref={textAreaRef}
						value={editedText}
						onChange={(e) => setEditedText(e.target.value)}
						onBlur={handleBlur}
						onKeyDown={handleKeyDown}
						autoFocus
						style={{
							width: "100%",
							backgroundColor: "var(--vscode-input-background)",
							color: "var(--vscode-input-foreground)",
							borderColor: "var(--vscode-input-border)",
							border: "1px solid",
							borderRadius: "2px",
							padding: "6px",
							fontFamily: "inherit",
							fontSize: "inherit",
							lineHeight: "inherit",
							boxSizing: "border-box",
							resize: "none",
							overflowX: "hidden",
							overflowY: "scroll",
							scrollbarWidth: "none",
						}}
					/>
					<div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
						<button
							onClick={(e) => {
								e.stopPropagation()
								handleSendMessage()
							}}
							style={{
								backgroundColor: "var(--vscode-button-background)",
								color: "var(--vscode-button-foreground)",
								border: "none",
								padding: "4px 8px",
								borderRadius: "2px",
								fontSize: "9px",
								cursor: "pointer",
							}}>
							Send Edited Message
						</button>
					</div>
				</>
			) : (
				<span className="ph-no-capture" style={{ display: "block" }}>
					{highlightText(editedText || text)}
				</span>
			)}
			{((images && images.length > 0) || (files && files.length > 0)) && (
				<Thumbnails images={images ?? []} files={files ?? []} style={{ marginTop: "8px" }} />
			)}
		</div>
	)
}

export default UserMessage
