import { VSCodeDropdown, VSCodeOption, VSCodeLink, VSCodeCheckbox, VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useState, useCallback, useEffect, useRef } from "react"
import { useInterval } from "react-use"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelsServiceClient } from "@/services/grpc-client"
import { BaseUrlField } from "../common/BaseUrlField"
import { StatusPill } from "../common/StatusPill"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { updateSetting } from "../utils/settingsHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { Mode, OpenaiReasoningEffort } from "@shared/storage/types"
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
	const { handleFieldChange, handleModeFieldChange, handleFieldsChange } = useApiConfigurationHandlers()

	const { lmStudioModelId } = getModeSpecificFields(apiConfiguration, currentMode)

	const [lmStudioModels, setLmStudioModels] = useState<string[]>([])

	// Connection status
	const [connOk, setConnOk] = useState<boolean | null>(null)
	const [statusText, setStatusText] = useState<string>("")
	const [statusTip, setStatusTip] = useState<string | undefined>(undefined)

	const inFlightRef = useRef(false)

	// Poll LM Studio models
	const requestLmStudioModels = useCallback(async () => {
		if (inFlightRef.current) return
		inFlightRef.current = true
		try {
			const response = await ModelsServiceClient.getLmStudioModels({
				value: apiConfiguration?.lmStudioBaseUrl || "",
			} as any)
			if (response && Array.isArray(response.values)) {
				// Sort models alphabetically for a predictable dropdown order
				const sorted = [...response.values].sort((a, b) => a.localeCompare(b))
				setLmStudioModels(sorted)
				setConnOk(true)
				setStatusText(`Connected — ${sorted.length} models`)
				setStatusTip(undefined)

				// Auto-select first model if none selected or current selection not present
				const current = lmStudioModelId || ""
				if (!current || !sorted.includes(current)) {
					const first = sorted[0]
					if (first) {
						handleModeFieldChange(
							{ plan: "planModeLmStudioModelId", act: "actModeLmStudioModelId" },
							first,
							currentMode,
						)
					}
				}
			} else {
				// Treat invalid response shape as a failed connection
				setLmStudioModels([])
				setConnOk(false)
				setStatusText("Cannot connect")
				setStatusTip("Unexpected response from LM Studio")
			}
		} catch (error: any) {
			console.error("Failed to fetch LM Studio models:", error)
			setLmStudioModels([])
			setConnOk(false)
			setStatusText("Cannot connect")
			setStatusTip(String(error?.message || "Connection failed"))
		} finally {
			inFlightRef.current = false
		}
	}, [apiConfiguration?.lmStudioBaseUrl, currentMode, handleModeFieldChange, lmStudioModelId])

	useEffect(() => {
		setConnOk(null)
		requestLmStudioModels()
	}, [apiConfiguration?.lmStudioBaseUrl])

	useInterval(requestLmStudioModels, connOk === false ? 2000 : null)

	// Determine if the selected model supports "thinking" and whether it's GPT-OSS (effort-based)
	const { selectedModelInfo, selectedModelId } = normalizeApiConfiguration(apiConfiguration, currentMode)
	const modelIdForCheck = (selectedModelId || lmStudioModelId || "").toLowerCase()
	const isGptOss =
		modelIdForCheck.startsWith("gpt-oss") ||
		modelIdForCheck.includes("/gpt-oss") ||
		modelIdForCheck.includes("openai/gpt-oss")

	// Mode fields (thinking tokens) for current mode
	const modeFields = getModeSpecificFields(apiConfiguration, currentMode)

	const DEFAULT_MIN_VALID_TOKENS = 1024
	// Ensure GPT‑OSS models always have "thinking enabled" (non-zero tokens) for internal consistency.
	// Numeric value is ignored by GPT‑OSS, but non-zero keeps downstream logic uniform.
	useEffect(() => {
		if (isGptOss && (modeFields.thinkingBudgetTokens || 0) <= 0) {
			handleModeFieldChange(
				{ plan: "planModeThinkingBudgetTokens", act: "actModeThinkingBudgetTokens" },
				DEFAULT_MIN_VALID_TOKENS,
				currentMode,
			)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isGptOss, modeFields.thinkingBudgetTokens, currentMode])

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
				<VSCodeDropdown
					currentValue={lmStudioModels.includes(lmStudioModelId || "") ? lmStudioModelId : lmStudioModels[0]}
					onChange={(e: any) => {
						const value = e?.target?.currentValue as string | undefined
						if (value) {
							handleModeFieldChange(
								{ plan: "planModeLmStudioModelId", act: "actModeLmStudioModelId" },
								value,
								currentMode,
							)
						}
					}}
					style={{ position: "relative", zIndex: 9999 }}
					className="w-full">
					{lmStudioModels.map((model) => (
						<VSCodeOption key={model} value={model}>
							{model}
						</VSCodeOption>
					))}
				</VSCodeDropdown>
			)}

			{/* Thinking controls */}
			{selectedModelInfo?.supportsReasoning && (
				<div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
					{isGptOss ? (
						<>
							<label
								htmlFor="openai-reasoning-effort-dropdown"
								className="block text-sm font-medium text-[var(--vscode-foreground)] mb-1">
								OpenAI Reasoning Effort
							</label>
							<VSCodeDropdown
								id="openai-reasoning-effort-dropdown"
								currentValue={openaiReasoningEffort || "medium"}
								onChange={(e: any) => {
									const newValue = e.target.currentValue as OpenaiReasoningEffort
									updateSetting("openaiReasoningEffort", newValue)
								}}
								style={{ position: "relative", zIndex: 0 }}
								className="w-full">
								<VSCodeOption value="low">Low</VSCodeOption>
								<VSCodeOption value="medium">Medium</VSCodeOption>
								<VSCodeOption value="high">High</VSCodeOption>
							</VSCodeDropdown>
						</>
					) : (
						<ThinkingBudgetSlider currentMode={currentMode} />
					)}
				</div>
			)}

			{/* Sampling (LM Studio) */}
			<div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
				{currentMode === "plan" && (
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<VSCodeCheckbox
							checked={apiConfiguration?.planIdeaModeEnabled === true}
							onChange={(e: any) => {
								const checked = !!e.target.checked
								handleFieldChange("planIdeaModeEnabled", checked as any)
							}}>
							Idea Mode (Plan only)
						</VSCodeCheckbox>
					</div>
				)}

				{/* Idea (Plan) */}
				<div>
					<div style={{ fontWeight: 600, marginBottom: 6 }}>Idea (Plan mode when Idea Mode is ON)</div>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
						<DebouncedTextField
							initialValue={String(apiConfiguration?.planModeLmStudioTemperature ?? 0.9)}
							onChange={(v) => {
								const num = Math.max(0, Math.min(1, parseFloat(v)))
								handleFieldChange("planModeLmStudioTemperature", (isNaN(num) ? 0.9 : num) as any)
							}}>
							<span>Temperature (0–1)</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={String(apiConfiguration?.planModeLmStudioTopP ?? 0.95)}
							onChange={(v) => {
								const num = Math.max(0, Math.min(1, parseFloat(v)))
								handleFieldChange("planModeLmStudioTopP", (isNaN(num) ? 0.95 : num) as any)
							}}>
							<span>Top P (0–1)</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={String(apiConfiguration?.planModeLmStudioTopK ?? 40)}
							onChange={(v) => {
								const num = Math.max(0, Math.min(100, parseInt(v)))
								handleFieldChange("planModeLmStudioTopK", (isNaN(num) ? 40 : num) as any)
							}}>
							<span>Top K (0–100)</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={String(apiConfiguration?.planModeLmStudioRepeatPenalty ?? 1.05)}
							onChange={(v) => {
								const num = Math.max(0, Math.min(2, parseFloat(v)))
								handleFieldChange("planModeLmStudioRepeatPenalty", (isNaN(num) ? 1.05 : num) as any)
							}}>
							<span>Repeat Penalty (0–2)</span>
						</DebouncedTextField>
					</div>
					<div style={{ marginTop: 6 }}>
						<VSCodeButton
							appearance="secondary"
							onClick={() =>
								handleFieldsChange({
									planModeLmStudioTemperature: 0.9 as any,
									planModeLmStudioTopP: 0.95 as any,
									planModeLmStudioTopK: 40 as any,
									planModeLmStudioRepeatPenalty: 1.05 as any,
								})
							}>
							Reset Idea Defaults
						</VSCodeButton>
					</div>
				</div>

				{/* Strict (Act) */}
				<div>
					<div style={{ fontWeight: 600, margin: "12px 0 6px" }}>
						Strict (Act mode; and Plan mode when Idea Mode is OFF)
					</div>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
						<DebouncedTextField
							initialValue={String(apiConfiguration?.actModeLmStudioTemperature ?? 0.1)}
							onChange={(v) => {
								const num = Math.max(0, Math.min(1, parseFloat(v)))
								handleFieldChange("actModeLmStudioTemperature", (isNaN(num) ? 0.1 : num) as any)
							}}>
							<span>Temperature (0–1)</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={String(apiConfiguration?.actModeLmStudioTopP ?? 1.0)}
							onChange={(v) => {
								const num = Math.max(0, Math.min(1, parseFloat(v)))
								handleFieldChange("actModeLmStudioTopP", (isNaN(num) ? 1.0 : num) as any)
							}}>
							<span>Top P (0–1)</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={String(apiConfiguration?.actModeLmStudioTopK ?? 0)}
							onChange={(v) => {
								const num = Math.max(0, Math.min(100, parseInt(v)))
								handleFieldChange("actModeLmStudioTopK", (isNaN(num) ? 0 : num) as any)
							}}>
							<span>Top K (0–100)</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={String(apiConfiguration?.actModeLmStudioRepeatPenalty ?? 1.0)}
							onChange={(v) => {
								const num = Math.max(0, Math.min(2, parseFloat(v)))
								handleFieldChange("actModeLmStudioRepeatPenalty", (isNaN(num) ? 1.0 : num) as any)
							}}>
							<span>Repeat Penalty (0–2)</span>
						</DebouncedTextField>
					</div>
					<div style={{ marginTop: 6 }}>
						<VSCodeButton
							appearance="secondary"
							onClick={() =>
								handleFieldsChange({
									actModeLmStudioTemperature: 0.1 as any,
									actModeLmStudioTopP: 1.0 as any,
									actModeLmStudioTopK: 0 as any,
									actModeLmStudioRepeatPenalty: 1.0 as any,
								})
							}>
							Reset Strict Defaults
						</VSCodeButton>
					</div>
				</div>
			</div>

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
				feature to use it with this extension.
			</p>
		</div>
	)
}
