import * as vscode from "vscode"
import axios from "axios"
import * as cheerio from "cheerio"
import TurndownService from "turndown"

// Local-only build: HTTP-based web fetching without browser automation
export class UrlContentFetcher {
	constructor(private context: vscode.ExtensionContext) {}

	async launchBrowser(): Promise<void> {
		// No-op for HTTP-based fetching
	}

	async closeBrowser(): Promise<void> {
		// No-op for HTTP-based fetching
	}

	async urlToMarkdown(url: string): Promise<string> {
		try {
			// Upgrade HTTP to HTTPS
			const fetchUrl = url.startsWith("http://") ? url.replace("http://", "https://") : url

			// Fetch the HTML content
			const response = await axios.get(fetchUrl, {
				timeout: 10_000,
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
					Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
					"Accept-Language": "en-US,en;q=0.5",
					"Accept-Encoding": "gzip, deflate, br",
					Connection: "keep-alive",
					"Upgrade-Insecure-Requests": "1",
				},
				maxRedirects: 5,
				validateStatus: (status) => status >= 200 && status < 400,
			})

			// Use cheerio to parse and clean up the HTML
			const $ = cheerio.load(response.data)
			$("script, style, nav, footer, header").remove()

			// Convert cleaned HTML to markdown
			const turndownService = new TurndownService()
			const markdown = turndownService.turndown($.html())

			return markdown
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response) {
					throw new Error(`HTTP error ${error.response.status}: ${error.response.statusText}`)
				} else if (error.request) {
					throw new Error(`Network error: Unable to reach ${url}`)
				} else {
					throw new Error(`Request error: ${error.message}`)
				}
			}
			throw new Error(`Failed to fetch URL content: ${error instanceof Error ? error.message : String(error)}`)
		}
	}
}
