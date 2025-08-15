import type { Controller } from ".."
import type { EmptyRequest, VsCodeLmModelsArray } from "@/shared/proto/cline/models" // type-only; fallback to any if path changes

// Lean local stub: VS Code LM not supported in local-only build
export async function getVsCodeLmModels(_controller: Controller, _req: any): Promise<any> {
	return { values: [] } as any as VsCodeLmModelsArray
}
