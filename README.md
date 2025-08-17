# Cline Local – Lean, local‑only fork of Cline

<p align="center">
  <img src="https://media.githubusercontent.com/media/cline/cline/main/assets/docs/demo.gif" width="100%" />
</p>

Cline Local is a lean, local‑only fork of the Cline VSCode extension. It preserves the Plan/Act toolchain, MCP support, and file/terminal integration while permanently removing browser automation, telemetry/analytics, authentication/billing, cloud‑only model providers, and background checkpoints. This variant is designed for teams who manage Git directly and for environments with strict data protection policies where cloud APIs are restricted or disallowed.

---

## Features

- **Plan/Act workflow** with human‑in‑the‑loop controls  
  Reviews diffs before file changes; prompts approval before running terminal commands
- **File operations**  
  Create/edit files with diffs; adapts to linter/compiler output to fix issues automatically
- **Terminal integration**  
  Execute commands and stream output; continue tasks while long‑running processes run in background
- **MCP integration**  
  Extend capabilities by connecting to MCP servers for custom tools/resources
- **Read‑only web ingestion**  
  `web_fetch` fetches HTTP(S) pages, strips non‑content HTML, converts to Markdown
- **Local provider support**  
  OpenAI‑compatible (configurable `baseUrl`), Ollama, and LM Studio
- **Git‑friendly**  
  No background checkpoints; designed to work cleanly with your own Git workflows

---

## Differences vs Full Version

- **Local‑only model focus**
  - Providers limited to OpenAI‑compatible (configurable `baseUrl`), Ollama, and LM Studio
  - Cloud‑specific providers (Anthropic, Bedrock, Gemini, Mistral, OpenRouter, etc.) removed
- **No browser automation**
  - The `browser_action` tool and computer‑use features are removed
  - Web content ingestion is read‑only via HTTP `web_fetch` (axios + cheerio + turndown)
- **No telemetry, authentication, or billing**
  - PostHog and related analytics removed
  - Cline Account and billing UI removed
- **No background checkpoints**
  - Designed to work cleanly alongside your own Git practices without internal snapshots
- **Repository policy**
  - Public PRs disabled for this fork
  - Manual sync with upstream cline/cline (see Repository Policy)

---

## Benefits for Local/Privacy‑First Environments

- **Smaller footprint and faster installs**
  - Fewer dependencies; no cloud provider SDKs or analytics packages
- **Privacy by default**
  - No telemetry or account/billing flows; strictly controlled network access
- **Git‑friendly workflows**
  - No internal snapshotting; avoids `.git` churn and keeps history under your control
- **Predictable and offline‑friendlier**
  - Uses local providers (Ollama/LM Studio/OpenAI‑compatible with local `baseUrl`); no browser automation variability
- **Simpler maintenance surface**
  - Fewer moving parts to configure, debug, and update

---

## What Cline Local Can Do

<img align="right" width="340" src="https://github.com/user-attachments/assets/3cf21e04-7ce9-4d22-a7b9-ba2c595e88a4">

- **Analyze your workspace**
  - Explore directory structure, run regex searches, and read files to build context
- **Create and edit files**
  - Show diffs in‑editor; you can accept, modify, or revert
  - Monitors linter/compiler output to self‑correct common issues
- **Run commands in your terminal**
  - Executes with your approval, streams output back to the task loop
  - Long‑running processes (e.g., dev servers) can continue while tasks proceed
- **Use MCP (Model Context Protocol)**
  - Connect to MCP servers to extend capabilities with custom tools/resources
- **Fetch and convert web pages to Markdown (read‑only)**
  - `web_fetch` performs HTTP/HTTPS requests, strips non‑content elements, and converts HTML to Markdown for contextual reading
  - No browsing, clicking, or visual automation

<img width="2000" height="0" src="https://github.com/user-attachments/assets/ee14e6f7-20b8-4391-9091-8e8e25561929"><br>

## Removed in Cline Local

- **Browser automation** (e.g., `browser_action`, computer‑use features)
- **Cloud provider integrations** (Anthropic, OpenRouter, Gemini, Bedrock, Mistral, etc.)
- **Telemetry/analytics and account/billing UIs**
- **Background checkpoints** that performed Git snapshots inside your workspace
  - This fork assumes developers manage Git directly, avoiding extra snapshots and `.git` churn

---

## Supported Providers (Local)

- OpenAI‑compatible (point `baseUrl` to your local/hosted compatible endpoint)
- Ollama
- LM Studio

---

## Quick Start (Build from Source)

### Prerequisites
- VSCode v1.84+
- Node.js 18+ (Node 20.x used in development)
- Git

### Install
- Clone this repo
- Install dependencies:
  - `npm run install:all`

### Build
- Build the extension + webview:
  - `npm run package`
- Or for development:
  - `npm run watch` (and separately, `npm run dev:webview` if you prefer hot webview dev)

### Run in VSCode
- Open this folder in VSCode
- Press `F5` (Run Extension) to launch an Extension Development Host

### Optional – Create a VSIX
- `npx vsce package`
- In VSCode: Extensions panel → "Install from VSIX…"

---

## Configure a Local Provider

Open the extension UI → Settings, then select one of:

- OpenAI‑compatible
  - Set `baseUrl` to your local endpoint (e.g., `http://localhost:1234/v1`)
  - Provide an API key if required by your endpoint
- Ollama
  - Ensure Ollama is running locally (default `http://localhost:11434`)
- LM Studio
  - Ensure the server is running and set the `baseUrl` accordingly

Choose models available from your selected provider.

---

## Using `web_fetch` (Read‑only Web Ingestion)

- Mention `@url` in chat or allow Cline Local to call the `web_fetch` tool when needed.
- The fetcher:
  - Upgrades `http://` to `https://` when possible
  - Uses axios for HTTP and cheerio to strip `script/style/nav/header/footer`
  - Converts cleaned HTML to Markdown with turndown
- No browser session is created; this is content ingestion only.

---

## Tool Suite (Local)

- `execute_command`
- `read_file`, `write_to_file`, `replace_in_file`
- `list_files`, `list_code_definition_names`, `search_files`
- `ask_followup_question` (for clarifications)
- `attempt_completion` (final result/summary)
- `new_task` (create tasks with context)
- `use_mcp_tool`, `access_mcp_resource` (MCP integration)
- `web_fetch` (HTTP‑only)
- Removed: `browser_action`

---

## Security and Control

- Human‑in‑the‑loop for all file edits and terminal commands
- No telemetry or analytics in this fork
- Network access is limited to what your configured tools perform (e.g., `web_fetch` HTTP requests; your provider endpoint if configured)

---

## Repository Policy

- Upstream: https://github.com/cline/cline
- This fork's origin: see your configured git remotes
- PRs disabled: This fork does not accept public pull requests
- Manual upstream sync:
  - Changes are cherry‑picked or merged manually from upstream as needed
  - Feature selection aims to preserve local‑only behavior and a small footprint

---

## Versioning and CHANGELOG

**Cline Local** follows independent semantic versioning starting from v1.0.0:

- **Major versions (2.0.0, 3.0.0)**: Breaking changes or significant architectural updates
- **Minor versions (1.1.0, 1.2.0)**: New features, upstream merges with compatible changes  
- **Patch versions (1.0.1, 1.0.2)**: Bug fixes, security updates, minor improvements

### Upstream Integration Policy

When merging relevant changes from upstream Cline:
- Only privacy-compatible features are integrated
- Cloud/telemetry features are explicitly excluded
- Changes are documented as "merged upstream improvements" with version references
- Fork-specific modifications are clearly distinguished from upstream contributions

### Changelog Structure

- `CHANGELOG.md` records changes specific to Cline Local starting from v1.0.0
- `CHANGELOG-UPSTREAM.md` preserves the complete upstream changelog for reference
- Expect version skew vs upstream due to selective syncing and removal of cloud/browser features

---

## Contributing

- Public contributions are not accepted on this fork
- For new features or broader ecosystem participation, contribute to upstream `cline/cline`
- For local‑only customizations, consider forking this repo

---

## License and Credits

- Licensed under Apache 2.0 (same as upstream). See `LICENSE`
- Derived from the Cline project by Cline Bot Inc.
- All trademarks and brand names belong to their respective owners

---

## Troubleshooting

- Build: `npm run check-types`, `npm run lint`, `npm test`
- Terminal integration: see `docs/troubleshooting/terminal-quick-fixes.mdx`
- If a feature references a removed provider or browser automation, it's not supported in this fork by design
