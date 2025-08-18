import { VSCodeRadioGroup, VSCodeRadio, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState, useCallback, useEffect } from "react"
import { useInterval } from "react-use"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelsServiceClient } from "@/services/grpc-client"
import { BaseUrlField } from "../common/BaseUrlField"
import { StatusPill } from "../common/StatusPill"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { Mode } from "@shared/storage/types"
/**
 * Props for the LMStudioProvider component
 */
interface LMStudioProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The LM Studio provider configuration component
 */
export const LMStudioProvider = ({ showModelOptions, isPopup, currentMode }: LMStudioProviderProps) => {
	const { apiConfiguration, openaiReasoningEffort } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	const { lmStudioModelId } = getModeSpecificFields(apiConfiguration, currentMode)

	const [lmStudioModels, setLmStudioModels] = useState<string[]>([])

	// Connection status
	const [connOk, setConnOk] = useState<boolean | null>(null)
	const [statusText, setStatusText] = useState<string>("")
	const [statusTip, setStatusTip] = useState<string | undefined>(undefined)

	// Poll LM Studio models
	const requestLmStudioModels = useCallback(async () => {
		try {
			const response = await ModelsServiceClient.getLmStudioModels({
				value: apiConfiguration?.lmStudioBaseUrl || "",
			} as any)
			if (response && response.values) {
				setLmStudioModels(response.values)
				setConnOk(true)
				setStatusText(`Connected — ${response.values.length} models`)
				setStatusTip(undefined)
			}
		} catch (error: any) {
			console.error("Failed to fetch LM Studio models:", error)
			setLmStudioModels([])
			setConnOk(false)
			setStatusText("Cannot connect")
			setStatusTip(String(error?.message || "Connection failed"))
		}
	}, [apiConfiguration?.lmStudioBaseUrl])

	useEffect(() => {
		requestLmStudioModels()
	}, [requestLmStudioModels])

	useInterval(requestLmStudioModels, 2000)

	// Determine if the selected model supports "thinking" and whether it's GPT-OSS (effort-based)
	const { selectedModelInfo, selectedModelId } = normalizeApiConfiguration(apiConfiguration, currentMode)
	const modelIdForCheck = (selectedModelId || lmStudioModelId || "").toLowerCase()
	const isGptOss =
		modelIdForCheck.startsWith("gpt-oss") ||
		modelIdForCheck.includes("/gpt-oss") ||
		modelIdForCheck.includes("openai/gpt-oss")

	return (
		<div>
			<BaseUrlField
				initialValue={apiConfiguration?.lmStudioBaseUrl}
				onChange={(value) => handleFieldChange("lmStudioBaseUrl", value)}
				placeholder="Default: http://localhost:1234"
				label="Use custom base URL"
			/>
			<div style={{ marginTop: 4 }}>
				<StatusPill
					status={connOk === null ? "unknown" : connOk ? "ok" : "error"}
					text={connOk === null ? "Not checked" : statusText}
					tooltip={statusTip}
				/>
			</div>

			{lmStudioModels.length === 0 && (
				<DebouncedTextField
					initialValue={lmStudioModelId || ""}
					onChange={(value) =>
						handleModeFieldChange(
							{ plan: "planModeLmStudioModelId", act: "actModeLmStudioModelId" },
							value,
							currentMode,
						)
					}
					style={{ width: "100%" }}
					placeholder={"e.g. meta-llama-3.1-8b-instruct"}>
					<span style={{ fontWeight: 500 }}>Model ID</span>
				</DebouncedTextField>
			)}

			{lmStudioModels.length > 0 && (
				<VSCodeRadioGroup
					value={lmStudioModels.includes(lmStudioModelId || "") ? lmStudioModelId : ""}
					onChange={(e) => {
						const value = (e.target as HTMLInputElement)?.value
						// need to check value first since radio group returns empty string sometimes
						if (value) {
							handleModeFieldChange(
								{ plan: "planModeLmStudioModelId", act: "actModeLmStudioModelId" },
								value,
								currentMode,
							)
						}
					}}>
					{lmStudioModels.map((model) => (
						<VSCodeRadio key={model} value={model} checked={lmStudioModelId === model}>
							{model}
						</VSCodeRadio>
					))}
				</VSCodeRadioGroup>
			)}

			{/* Thinking controls */}
			{selectedModelInfo?.supportsReasoning && (
				<div style={{ marginTop: 10 }}>
					{isGptOss ? (
						<div
							style={{
								fontSize: "12px",
								color: "var(--vscode-descriptionForeground)",
								lineHeight: 1.5,
								border: "1px solid var(--vscode-editorGroup-border)",
								borderRadius: 4,
								padding: "8px 10px",
								background: "var(--vscode-textCodeBlock-background)",
							}}>
							<b>Thinking</b> for GPT‑OSS models is controlled by the “OpenAI Reasoning Effort” setting (Features →
							OpenAI Reasoning Effort). Current effort:{" "}
							<span style={{ fontWeight: 600 }}>{openaiReasoningEffort || "medium"}</span>. No numeric budget is
							required for GPT‑OSS.
						</div>
					) : (
						// For non‑GPT‑OSS models that support reasoning, expose the Thinking Budget slider (toggle + slider)
						<ThinkingBudgetSlider currentMode={currentMode} />
					)}
				</div>
			)}

			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				LM Studio allows you to run models locally on your computer. For instructions on how to get started, see their
				<VSCodeLink href="https://lmstudio.ai/docs" style={{ display: "inline", fontSize: "inherit" }}>
					quickstart guide.
				</VSCodeLink>
				You will also need to start LM Studio's{" "}
				<VSCodeLink href="https://lmstudio.ai/docs/basics/server" style={{ display: "inline", fontSize: "inherit" }}>
					local server
				</VSCodeLink>{" "}
				feature to use it with this extension.{" "}
				<span style={{ color: "var(--vscode-errorForeground)" }}>
					(<span style={{ fontWeight: 500 }}>Note:</span> Cline uses complex prompts and works best with Claude models.
					Less capable models may not work as expected.)
				</span>
			</p>
		</div>
	)
}
