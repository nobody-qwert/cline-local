import * as path from "path"
import fs from "fs/promises"
import { isBinaryFile } from "isbinaryfile"
import * as chardet from "jschardet"
import * as iconv from "iconv-lite"

export async function detectEncoding(fileBuffer: Buffer, fileExtension?: string): Promise<string> {
	const detected = chardet.detect(fileBuffer)
	if (typeof detected === "string") {
		return detected
	} else if (detected && (detected as any).encoding) {
		return (detected as any).encoding
	} else {
		if (fileExtension) {
			const isBinary = await isBinaryFile(fileBuffer).catch(() => false)
			if (isBinary) {
				throw new Error(`Cannot read text for file type: ${fileExtension}`)
			}
		}
		return "utf8"
	}
}

export async function extractTextFromFile(filePath: string): Promise<string> {
	try {
		await fs.access(filePath)
	} catch (error) {
		throw new Error(`File not found: ${filePath}`)
	}

	return callTextExtractionFunctions(filePath)
}

/**
 * Expects the fs.access call to have already been performed prior to calling
 */
export async function callTextExtractionFunctions(filePath: string): Promise<string> {
	const fileExtension = path.extname(filePath).toLowerCase()

	// Only handle plain text files and simple JSON files
	switch (fileExtension) {
		case ".ipynb":
			return extractTextFromIPYNB(filePath)
		case ".pdf":
		case ".docx":
		case ".xlsx":
		case ".xls":
		case ".doc":
		case ".ppt":
		case ".pptx":
			throw new Error(
				`Binary document formats are not supported. Please export to a text format or copy/paste the content.`,
			)
		default:
			const fileBuffer = await fs.readFile(filePath)
			if (fileBuffer.byteLength > 20 * 1000 * 1024) {
				// 20MB limit (20 * 1000 * 1024 bytes, decimal MB)
				throw new Error(`File is too large to read into context.`)
			}
			const encoding = await detectEncoding(fileBuffer, fileExtension)
			return iconv.decode(fileBuffer, encoding)
	}
}

async function extractTextFromIPYNB(filePath: string): Promise<string> {
	const fileBuffer = await fs.readFile(filePath)
	const encoding = await detectEncoding(fileBuffer)
	const data = iconv.decode(fileBuffer, encoding)
	const notebook = JSON.parse(data)
	let extractedText = ""

	for (const cell of notebook.cells) {
		if ((cell.cell_type === "markdown" || cell.cell_type === "code") && cell.source) {
			extractedText += cell.source.join("\n") + "\n"
		}
	}

	return extractedText
}

/**
 * Helper function used to load file(s) and format them into a string
 */
export async function processFilesIntoText(files: string[]): Promise<string> {
	const fileContentsPromises = files.map(async (filePath) => {
		try {
			// Check if file exists and is binary
			//const isBinary = await isBinaryFile(filePath).catch(() => false)
			//if (isBinary) {
			//	return `<file_content path="${filePath.toPosix()}">\n(Binary file, unable to display content)\n</file_content>`
			//}
			const content = await extractTextFromFile(filePath)
			return `<file_content path="${filePath.toPosix()}">\n${content}\n</file_content>`
		} catch (error) {
			console.error(`Error processing file ${filePath}:`, error)
			return `<file_content path="${filePath.toPosix()}">\nError fetching content: ${error.message}\n</file_content>`
		}
	})

	const fileContents = await Promise.all(fileContentsPromises)

	const validFileContents = fileContents.filter((content) => content !== null).join("\n\n")

	if (validFileContents) {
		return `Files attached by the user:\n\n${validFileContents}`
	}

	// returns empty string if no files were loaded properly
	return ""
}
