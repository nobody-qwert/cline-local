import { type ReactNode } from "react"

// Local-only build: no telemetry in webview. This provider is a no-op pass-through.
export function CustomPostHogProvider({ children }: { children: ReactNode }) {
	return <>{children}</>
}
