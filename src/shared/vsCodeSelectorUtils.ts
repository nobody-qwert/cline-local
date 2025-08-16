export const SELECTOR_SEPARATOR = "/"

export function stringifyVsCodeLmModelSelector(selector: any): string {
	return [selector?.vendor, selector?.family, selector?.version, selector?.id].filter(Boolean).join(SELECTOR_SEPARATOR)
}
