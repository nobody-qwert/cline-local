import React, { memo } from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { DebouncedTextField } from "../common/DebouncedTextField"
import Section from "../Section"

/**
 * Inference parameters table (rows = params, columns = Idea / Strict)
 * Shown under Settings → Features only. Not in provider/model selection.
 */
const InferenceParamsSection = () => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleFieldsChange } = useApiConfigurationHandlers()

	const clampNum = (v: any, min: number, max: number, fallback: number) => {
		const n = typeof v === "string" ? parseFloat(v) : Number(v)
		if (isNaN(n)) return fallback
		return Math.max(min, Math.min(max, n))
	}

	return (
		<Section>
			<div style={{ marginTop: 10 }}>
				<div style={{ fontWeight: 600, marginBottom: 6 }}>Inference Parameters (LM Studio)</div>
				<p className="text-xs text-[var(--vscode-descriptionForeground)]" style={{ marginBottom: 10 }}>
					These parameters influence generation behavior. They apply to LM Studio requests. Idea profile is used in Plan
					mode when Idea mode is ON; Strict profile is used in Act mode and Plan mode when Idea mode is OFF.
				</p>

				{/* Simple responsive table layout */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "minmax(160px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr)",
						rowGap: 8,
						columnGap: 12,
						alignItems: "center",
					}}>
					{/* Header */}
					<div style={{ fontWeight: 600 }}>Parameter</div>
					<div style={{ fontWeight: 600 }}>Idea (Plan)</div>
					<div style={{ fontWeight: 600 }}>Strict (Act/Plan OFF)</div>

					{/* Temperature */}
					<div>
						Temperature
						<div className="text-xs text-[var(--vscode-descriptionForeground)]">0–1</div>
					</div>
					<DebouncedTextField
						initialValue={String(apiConfiguration?.planModeLmStudioTemperature ?? 0.9)}
						onChange={(v) => {
							const num = clampNum(v, 0, 1, 0.9)
							handleFieldChange("planModeLmStudioTemperature" as any, num as any)
						}}
					/>
					<DebouncedTextField
						initialValue={String(apiConfiguration?.actModeLmStudioTemperature ?? 0.1)}
						onChange={(v) => {
							const num = clampNum(v, 0, 1, 0.1)
							handleFieldChange("actModeLmStudioTemperature" as any, num as any)
						}}
					/>

					{/* Top P */}
					<div>
						Top P<div className="text-xs text-[var(--vscode-descriptionForeground)]">0–1</div>
					</div>
					<DebouncedTextField
						initialValue={String(apiConfiguration?.planModeLmStudioTopP ?? 0.95)}
						onChange={(v) => {
							const num = clampNum(v, 0, 1, 0.95)
							handleFieldChange("planModeLmStudioTopP" as any, num as any)
						}}
					/>
					<DebouncedTextField
						initialValue={String(apiConfiguration?.actModeLmStudioTopP ?? 1.0)}
						onChange={(v) => {
							const num = clampNum(v, 0, 1, 1.0)
							handleFieldChange("actModeLmStudioTopP" as any, num as any)
						}}
					/>

					{/* Top K */}
					<div>
						Top K<div className="text-xs text-[var(--vscode-descriptionForeground)]">0–100</div>
					</div>
					<DebouncedTextField
						initialValue={String(apiConfiguration?.planModeLmStudioTopK ?? 40)}
						onChange={(v) => {
							const num = clampNum(v, 0, 100, 40)
							handleFieldChange("planModeLmStudioTopK" as any, num as any)
						}}
					/>
					<DebouncedTextField
						initialValue={String(apiConfiguration?.actModeLmStudioTopK ?? 0)}
						onChange={(v) => {
							const num = clampNum(v, 0, 100, 0)
							handleFieldChange("actModeLmStudioTopK" as any, num as any)
						}}
					/>

					{/* Repeat Penalty */}
					<div>
						Repeat Penalty
						<div className="text-xs text-[var(--vscode-descriptionForeground)]">0–2</div>
					</div>
					<DebouncedTextField
						initialValue={String(apiConfiguration?.planModeLmStudioRepeatPenalty ?? 1.05)}
						onChange={(v) => {
							const num = clampNum(v, 0, 2, 1.05)
							handleFieldChange("planModeLmStudioRepeatPenalty" as any, num as any)
						}}
					/>
					<DebouncedTextField
						initialValue={String(apiConfiguration?.actModeLmStudioRepeatPenalty ?? 1.1)}
						onChange={(v) => {
							const num = clampNum(v, 0, 2, 1.0)
							handleFieldChange("actModeLmStudioRepeatPenalty" as any, num as any)
						}}
					/>
				</div>

				<div style={{ display: "flex", gap: 10, marginTop: 12 }}>
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
					<VSCodeButton
						appearance="secondary"
						onClick={() =>
							handleFieldsChange({
								actModeLmStudioTemperature: 0.1 as any,
								actModeLmStudioTopP: 0.8 as any,
								actModeLmStudioTopK: 40 as any,
								actModeLmStudioRepeatPenalty: 1.1 as any,
							})
						}>
						Reset Strict Defaults
					</VSCodeButton>
				</div>
			</div>
		</Section>
	)
}

export default memo(InferenceParamsSection)
