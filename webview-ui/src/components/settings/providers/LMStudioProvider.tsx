import { VSCodeDropdown, VSCodeOption, VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useState, useCallback, useEffect, useRef, useMemo } from "react"
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

interface LMStudioProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

interface LMStudioModelMetadata {
	id: string
	object?: "model"
	type?: string
	publisher?: string
	arch?: string
	compatibility_type?: string
	quantization?: string
	state?: string
	max_context_length?: number
	loaded_context_length?: number
	[key: string]: unknown
}

export const LMStudioProvider = ({ currentMode }: LMStudioProviderProps) => {
	const { apiConfiguration, openaiReasoningEffort } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	const { lmStudioModelId } = getModeSpecificFields(apiConfiguration, currentMode)

	const [lmStudioModels, setLmStudioModels] = useState<LMStudioModelMetadata[]>([])
	const [connOk, setConnOk] = useState<boolean | null>(null)
	const [statusText, setStatusText] = useState<string>("")
	const [statusTip, setStatusTip] = useState<string | undefined>(undefined)

	const inFlightRef = useRef(false)

	const endpoint = useMemo(
		() => apiConfiguration?.lmStudioBaseUrl?.trim() || "http://localhost:1234",
		[apiConfiguration?.lmStudioBaseUrl],
	)

	const currentLMStudioModel = useMemo(
		() => lmStudioModels.find((model) => model.id === lmStudioModelId),
		[lmStudioModels, lmStudioModelId],
	)

	const availableModelIds = useMemo(
		() => lmStudioModels.map((model) => model.id).filter((id): id is string => Boolean(id)),
		[lmStudioModels],
	)

	const currentDropdownValue = useMemo(() => {
		if (lmStudioModelId && availableModelIds.includes(lmStudioModelId)) {
			return lmStudioModelId
		}
		return availableModelIds[0] ?? lmStudioModelId ?? ""
	}, [availableModelIds, lmStudioModelId])

	const requestLmStudioModels = useCallback(async () => {
		if (inFlightRef.current) {
			return
		}
		inFlightRef.current = true
		try {
			const response = await ModelsServiceClient.getLmStudioModels({ value: endpoint } as any)
			const values = response?.values ?? []
			const parsed = values
				.map((rawValue) => {
					try {
						return JSON.parse(rawValue) as LMStudioModelMetadata
					} catch (error) {
						console.error("Failed to parse LM Studio model metadata:", error)
						return null
					}
				})
				.filter(Boolean) as LMStudioModelMetadata[]

			if (parsed.length > 0) {
				const sorted = [...parsed].sort((a, b) => (a.id || "").localeCompare(b.id || ""))
				setLmStudioModels(sorted)
				setConnOk(true)
				setStatusText(`Connected — ${sorted.length} models`)
				setStatusTip(undefined)

				const allIds = sorted.map((model) => model.id).filter(Boolean) as string[]
				const current = lmStudioModelId || ""
				if ((!current || !allIds.includes(current)) && sorted[0]?.id) {
					handleModeFieldChange(
						{ plan: "planModeLmStudioModelId", act: "actModeLmStudioModelId" },
						sorted[0].id,
						currentMode,
					)
				}
			} else {
				setLmStudioModels([])
				setConnOk(false)
				setStatusText("Cannot connect")
				setStatusTip("No models returned by LM Studio")
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
	}, [endpoint, handleModeFieldChange, currentMode, lmStudioModelId])

	useEffect(() => {
		setConnOk(null)
		requestLmStudioModels()
	}, [endpoint])

	useInterval(requestLmStudioModels, connOk === false ? 2000 : null)

	const lmStudioMaxTokens = useMemo(() => currentLMStudioModel?.max_context_length?.toString(), [currentLMStudioModel])
	const currentLoadedContext = useMemo(() => currentLMStudioModel?.loaded_context_length?.toString(), [currentLMStudioModel])

	useEffect(() => {
		const loaded = currentLMStudioModel?.loaded_context_length?.toString()
		const max = currentLMStudioModel?.max_context_length?.toString()
		const choice = apiConfiguration?.lmStudioMaxTokens ?? max
		if (loaded && loaded !== choice) {
			handleFieldChange("lmStudioMaxTokens", loaded)
		}
	}, [
		currentLMStudioModel?.loaded_context_length,
		currentLMStudioModel?.max_context_length,
		apiConfiguration?.lmStudioMaxTokens,
		handleFieldChange,
	])

	const { selectedModelInfo, selectedModelId } = normalizeApiConfiguration(apiConfiguration, currentMode)
	const modelIdForCheck = (selectedModelId || lmStudioModelId || "").toLowerCase()
	const isGptOss =
		modelIdForCheck.startsWith("gpt-oss") ||
		modelIdForCheck.includes("/gpt-oss") ||
		modelIdForCheck.includes("openai/gpt-oss")

	const modeFields = getModeSpecificFields(apiConfiguration, currentMode)
	const DEFAULT_MIN_VALID_TOKENS = 1024

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

			{availableModelIds.length === 0 ? (
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
			) : (
				<VSCodeDropdown
					currentValue={currentDropdownValue}
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
						<VSCodeOption key={model.id ?? "(unknown)"} value={model.id ?? ""}>
							{model.id ?? "(unknown id)"}
						</VSCodeOption>
					))}
				</VSCodeDropdown>
			)}

			<VSCodeTextField
				className="w-full pointer-events-none"
				disabled={true}
				title="Not editable - the value is returned by the connected endpoint"
				value={String(currentLoadedContext ?? lmStudioMaxTokens ?? "0")}
			/>

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
