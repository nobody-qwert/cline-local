import VSCodeButtonLink from "@/components/common/VSCodeButtonLink"
import { TaskServiceClient } from "@/services/grpc-client"
import { AskResponseRequest } from "@shared/proto/cline/task"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import React from "react"

interface CreditLimitErrorProps {
	currentBalance: number
	totalSpent?: number
	totalPromotions?: number
	message: string
}

const CreditLimitError: React.FC<CreditLimitErrorProps> = ({
	currentBalance = 0,
	totalSpent = 0,
	totalPromotions = 0,
	message = "You have run out of credits.",
}) => {
	const { uriScheme } = useExtensionState()

	// Lean local build: no auth/org context. Use a generic credits URL.
	const buyCreditsUrl = "https://app.cline.bot/dashboard/credits?tab=credits&redirect=true"

	const callbackUrl = `${uriScheme || "vscode"}://saoudrizwan.claude-dev`
	const fullPurchaseUrl = new URL(buyCreditsUrl)
	fullPurchaseUrl.searchParams.set("callback_url", callbackUrl)

	return (
		<div className="p-2 border-none rounded-md mb-2 bg-[var(--vscode-textBlockQuote-background)]">
			<div className="mb-3 font-azeret-mono">
				<div style={{ color: "var(--vscode-errorForeground)", marginBottom: "8px" }}>{message}</div>
			</div>

			<VSCodeButtonLink
				href={fullPurchaseUrl.toString()}
				style={{
					width: "100%",
					marginBottom: "8px",
				}}>
				<span className="codicon codicon-credit-card mr-[6px] text-[14px]" />
				Buy Credits
			</VSCodeButtonLink>

			<VSCodeButton
				onClick={async () => {
					try {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "yesButtonClicked",
								text: "",
								images: [],
							}),
						)
					} catch (error) {
						console.error("Error invoking action:", error)
					}
				}}
				appearance="secondary"
				style={{
					width: "100%",
				}}>
				<span className="codicon codicon-refresh" style={{ fontSize: "14px", marginRight: "6px" }} />
				Retry Request
			</VSCodeButton>
		</div>
	)
}

export default CreditLimitError
