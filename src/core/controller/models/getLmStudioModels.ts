import { Controller } from ".."
import { StringArray, StringRequest } from "@shared/proto/cline/common"
import axios from "axios"

/**
 * Fetches available models from LM Studio
 * @param controller The controller instance
 * @param request The request containing the base URL (optional)
 * @returns Array of model names
 */
export async function getLmStudioModels(controller: Controller, request: StringRequest): Promise<StringArray> {
	try {
		let baseUrl = request.value || "http://localhost:1234"

		if (!URL.canParse(baseUrl)) {
			return StringArray.create({ values: [] })
		}

		const endpoint = new URL("api/v0/models", baseUrl)
		const response = await axios.get(endpoint.toString())
		const modelsArray = response.data?.data || []
		const serializedModels = modelsArray.map((model: unknown) => JSON.stringify(model))

		return StringArray.create({ values: serializedModels })
	} catch (error) {
		return StringArray.create({ values: [] })
	}
}
