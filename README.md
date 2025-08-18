# Cline Local – Lean, local‑only fork of Cline

<p align="center">
  <img src="https://media.githubusercontent.com/media/cline/cline/main/assets/docs/demo.gif" width="100%" />
</p>

Cline Local is a lean, local‑only fork of the Cline VSCode extension. It preserves the Plan/Act toolchain, MCP support, and file/terminal integration while permanently removing browser automation, telemetry/analytics, authentication/billing, cloud‑only model providers, and background checkpoints. This variant is designed for teams who manage Git directly and for environments with strict data protection policies where cloud APIs are restricted or disallowed.

---

## Core capabilities

- Plan/Act workflow with human‑in‑the‑loop approvals (diff review for file edits; approval before terminal commands)
- Create and edit files with diffs; adapts to linter/compiler output to self‑correct common issues
- Terminal integration: execute commands with approval and stream output; long‑running processes can continue while tasks proceed
- MCP integration: connect to servers for custom tools/resources
- Read‑only web ingestion via `web_fetch` (HTTP→Markdown; no browser automation)
- Local providers: OpenAI‑compatible (configurable `baseUrl`), Ollama, LM Studio
- Git‑friendly by design: no background checkpoints; works cleanly with your Git workflows

---

## Key differences from upstream

- Removed
  - Browser automation (`browser_action`, computer‑use features)
  - Cloud provider integrations (Anthropic, OpenRouter, Gemini, Bedrock, Mistral, etc.)
  - Telemetry/analytics and account/billing UIs
  - Background checkpoints (no internal Git snapshots)
- Retained and focused
  - Plan/Act workflow with approvals
  - MCP integration (custom tools/resources)
  - Local‑only providers: OpenAI‑compatible (configurable `baseUrl`), Ollama, LM Studio
  - Git‑friendly operation (works cleanly with your own Git practices)

---

## Privacy, security, and operations

- No telemetry, account, or billing flows
- Strictly controlled network access (only your provider endpoint and `web_fetch` when used)
- Human‑in‑the‑loop approvals for file edits and terminal commands
- Smaller dependency footprint; fewer moving parts
- Works cleanly with Git; no internal snapshots

---

## What Cline Local Can Do

See Core capabilities above.




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

## Configure providers

Supported local providers: OpenAI‑compatible (configurable `baseUrl`), Ollama, LM Studio.

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
