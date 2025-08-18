import { useRef, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { getAsVar, VSC_TITLEBAR_INACTIVE_FOREGROUND } from "@/utils/vscStyles"
import AutoApproveModal from "./AutoApproveModal"
import { ACTION_METADATA, NOTIFICATIONS_SETTING } from "./constants"

interface AutoApproveBarProps {
	style?: React.CSSProperties
}

const AutoApproveBar = ({ style }: AutoApproveBarProps) => {
	const { autoApprovalSettings } = useExtensionState()

	const [isModalVisible, setIsModalVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)

	const getQuickAccessItems = () => {
		const notificationsEnabled = autoApprovalSettings.enableNotifications

		// Determine which action IDs are enabled
		const enabledActionIds = Object.keys(autoApprovalSettings.actions).filter(
			(key) => autoApprovalSettings.actions[key as keyof typeof autoApprovalSettings.actions],
		)

		// Map enabled IDs to metadata with short names
		const allActions = ACTION_METADATA.flatMap((a) => [a, a.subAction]).filter(Boolean)
		const enabledActions = enabledActionIds
			.map((id) => allActions.find((a) => a?.id === id))
			.filter((a) => a && a.shortName) as { shortName: string }[]

		// Build summary items
		const summaryItems: string[] = enabledActions.map((a) => a.shortName)
		if (notificationsEnabled) {
			summaryItems.push(NOTIFICATIONS_SETTING.shortName)
		}

		if (summaryItems.length === 0) return null

		return [
			<span className="text-[color:var(--vscode-foreground-muted)] pl-[10px] opacity-60" key="separator">
				✓
			</span>,
			...summaryItems.map((name, index) => (
				<span className="text-[color:var(--vscode-foreground-muted)] opacity-60" key={`${name}-${index}`}>
					{name}
					{index < summaryItems.length - 1 && ","}
				</span>
			)),
		]
	}

	return (
		<div
			className="px-[10px] mx-[5px] select-none rounded-[10px_10px_0_0]"
			style={{
				borderTop: `0.5px solid color-mix(in srgb, ${getAsVar(VSC_TITLEBAR_INACTIVE_FOREGROUND)} 20%, transparent)`,
				overflowY: "auto",
				backgroundColor: isModalVisible ? CODE_BLOCK_BG_COLOR : "transparent",
				...style,
			}}>
			<div
				ref={buttonRef}
				className="cursor-pointer py-[8px] pr-[2px] flex items-center justify-between gap-[8px]"
				onClick={() => {
					setIsModalVisible((prev) => !prev)
				}}>
				<div
					className="flex flex-nowrap items-center overflow-x-auto gap-[4px] whitespace-nowrap"
					style={{
						msOverflowStyle: "none",
						scrollbarWidth: "none",
						WebkitOverflowScrolling: "touch",
					}}>
					<span>Auto-approve:</span>
					{getQuickAccessItems()}
				</div>
				{isModalVisible ? (
					<span className="codicon codicon-chevron-down" />
				) : (
					<span className="codicon codicon-chevron-up" />
				)}
			</div>

			<AutoApproveModal
				isVisible={isModalVisible}
				setIsVisible={setIsModalVisible}
				buttonRef={buttonRef}
				ACTION_METADATA={ACTION_METADATA}
				NOTIFICATIONS_SETTING={NOTIFICATIONS_SETTING}
			/>
		</div>
	)
}

export default AutoApproveBar
