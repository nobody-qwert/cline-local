import { HTMLAttributes } from "react"

const SECTION_HEADER_Z_INDEX_BASE = 1000

type SectionHeaderProps = HTMLAttributes<HTMLDivElement> & {
	children: React.ReactNode
	description?: string
}

export const SectionHeader = ({ description, children, className, ...props }: SectionHeaderProps) => {
	return (
		<div
			className={`sticky top-0 text-[var(--vscode-foreground)] bg-[var(--vscode-panel-background)] px-5 py-3 ${className || ""}`}
			{...props}
			style={{ zIndex: SECTION_HEADER_Z_INDEX_BASE + 20 }}>
			<h4 className="m-0">{children}</h4>
			{description && <p className="text-[var(--vscode-descriptionForeground)] text-sm mt-2 mb-0">{description}</p>}
		</div>
	)
}

export default SectionHeader
