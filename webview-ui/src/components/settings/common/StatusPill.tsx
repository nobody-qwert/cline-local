import React from "react"

type Status = "ok" | "error" | "unknown"

export function StatusPill({
	status,
	text,
	tooltip,
	inline = true,
}: {
	status: Status
	text: string
	tooltip?: string
	inline?: boolean
}) {
	const { bg, fg, dot } = (() => {
		switch (status) {
			case "ok":
				return {
					bg: "rgba(0, 128, 0, 0.15)",
					fg: "var(--vscode-editorInfo-foreground, #89d185)",
					dot: "#2ea043",
				}
			case "error":
				return {
					bg: "rgba(255, 0, 0, 0.12)",
					fg: "var(--vscode-errorForeground, #f14c4c)",
					dot: "#f85149",
				}
			default:
				return {
					bg: "rgba(128, 128, 128, 0.12)",
					fg: "var(--vscode-descriptionForeground)",
					dot: "var(--vscode-descriptionForeground)",
				}
		}
	})()

	return (
		<span
			title={tooltip}
			style={{
				display: inline ? "inline-flex" : "flex",
				alignItems: "center",
				gap: 6,
				padding: "2px 6px",
				borderRadius: 999,
				background: bg,
				color: fg,
				fontSize: 12,
				lineHeight: "16px",
				userSelect: "none",
			}}>
			<span
				style={{
					width: 8,
					height: 8,
					minWidth: 8,
					minHeight: 8,
					borderRadius: "50%",
					background: dot,
					display: "inline-block",
				}}
			/>
			<span>{text}</span>
		</span>
	)
}
