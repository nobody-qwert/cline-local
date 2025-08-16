import React from "react"

// Local-only build: Requesty is not supported. Keep a no-op component to satisfy imports if any remain.
export interface RequestyModelPickerProps {
	isPopup?: boolean
	currentMode?: any
}

const RequestyModelPicker: React.FC<RequestyModelPickerProps> = () => {
	return null
}

export default RequestyModelPicker
