import { type ReactNode } from "react"

import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { HeroUIProvider } from "@heroui/react"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ExtensionStateContextProvider>
			<HeroUIProvider>{children}</HeroUIProvider>
		</ExtensionStateContextProvider>
	)
}
