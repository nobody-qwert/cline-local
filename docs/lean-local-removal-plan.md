# Lean Local Removal Plan (LM Studio, Ollama, OpenAI-compatible only)

Purpose: Make the app lean for local-only usage. Keep only LM Studio, Ollama, and OpenAI-compatible local endpoints. Remove telemetry/analytics, authentication/billing, and all internet-only providers. This file marks EXACTLY what to remove or adjust and includes concrete edit instructions, validation commands, and acceptance criteria.

Execution mode for this document:
- This document only marks what to delete/change. No files have been removed yet.
- Removal can be staged; recommended to remove code first, then prune dependencies, then rebuild.
- If you prefer a reversible path, alias to no-op shims instead of deleting. This plan assumes actual deletions.
- Confirmed against current workspace layout (paths verified present where listed below).

--------------------------------------------------------------------------------
A) Providers (keep local only)
--------------------------------------------------------------------------------

Keep:
- src/api/providers/openai.ts
- src/api/providers/ollama.ts
- src/api/providers/lmstudio.ts
- src/api/transform/openai-format.ts
- src/api/transform/ollama-format.ts
- src/api/transform/stream.ts
- src/api/providers/types.ts  (shared types used by kept handlers)
- src/api/index.ts            (but must edit to only handle the 3 local providers)

Remove:
- src/api/providers/anthropic.ts
- src/api/providers/asksage.ts
- src/api/providers/baseten.ts
- src/api/providers/bedrock.ts
- src/api/providers/cerebras.ts
- src/api/providers/claude-code.ts
- src/api/providers/cline.ts
- src/api/providers/deepseek.ts
- src/api/providers/doubao.ts
- src/api/providers/fireworks.ts
- src/api/providers/gemini.ts
- src/api/providers/groq.ts
- src/api/providers/huawei-cloud-maas.ts
- src/api/providers/huggingface.ts
- src/api/providers/litellm.ts        (remove unless you run a local LiteLLM proxy)
- src/api/providers/mistral.ts
- src/api/providers/moonshot.ts
- src/api/providers/nebius.ts
- src/api/providers/openai-native.ts  (remove unless explicitly required)
- src/api/providers/openrouter.ts
- src/api/providers/qwen.ts
- src/api/providers/requesty.ts
- src/api/providers/sambanova.ts
- src/api/providers/sapaicore.ts
- src/api/providers/together.ts
- src/api/providers/vertex.ts
- src/api/providers/vscode-lm.ts
- src/api/providers/xai.ts

- src/api/transform/gemini-format.ts
- src/api/transform/mistral-format.ts
- src/api/transform/o1-format.ts
- src/api/transform/openrouter-stream.ts
- src/api/transform/r1-format.ts
- src/api/transform/vscode-lm-format.ts

Adjust:
- src/api/index.ts: remove all imports and switch cases for removed providers so that only "openai", "ollama", and "lmstudio" remain (plus a default that chooses one of these).

IMPORTANT typing note:
- The interface ApiHandler.createMessage currently depends on Anthropic.Messages.MessageParam. If we remove the Anthropic SDK entirely, we must also refactor this type to a local one.
- Short-term: keep the Anthropic SDK import for typing only. Long-term: define a provider-agnostic message type in shared code and update handlers accordingly (see Section I).

Concrete edit instructions for src/api/index.ts:
- Remove imports for all providers other than the 3 local ones.
- Switch logic should be reduced to:

```ts
// imports
import { OpenAiHandler } from "./providers/openai"
import { OllamaHandler } from "./providers/ollama"
import { LmStudioHandler } from "./providers/lmstudio"
import type { ApiHandler } from "./providers/types"

// factory
export function createHandlerForProvider(apiProvider: string, options: any, mode: "plan" | "act"): ApiHandler {
  switch (apiProvider) {
    case "openai":
      return new OpenAiHandler(options)
    case "ollama":
      return new OllamaHandler(options)
    case "lmstudio":
      return new LmStudioHandler(options)
    default:
      // Default to OpenAI-compatible local (honor baseUrl) or Ollama as safe fallback
      return options?.openaiBaseUrl ? new OpenAiHandler(options) : new OllamaHandler(options)
  }
}
```

- If any direct imports of Anthropic or other providers remain, delete them.
- If the file exports provider lists or metadata for the UI, ensure only these three providers are exposed.

Search guidance (to confirm and clean imports/cases):
- Search for these tokens in src/api/index.ts and remove references found: anthropic, bedrock, claude, mistral, gemini, vertex, vscode-lm, openrouter, fireworks, groq, qwen, together, sapaicore, sambanova, baseten, cerebras, asksage, doubao, huawei, huggingface, nebius, moonshot, xai, requesty, litellm, openai-native.


--------------------------------------------------------------------------------
B) Telemetry / Analytics
--------------------------------------------------------------------------------

Remove:
- Entire dir: src/services/posthog/ (PostHogClientProvider, FeatureFlagsService, TelemetryService, etc.)
- src/shared/services/config/posthog-config.ts
- src/services/error/ErrorService.ts (depends on PostHog; see Logger note below)

Remove references (delete imports and calls):
- src/services/browser/BrowserSession.ts
  - Remove: import { telemetryService } from "@/services/posthog/PostHogClientProvider"
  - Remove all calls: telemetryService.captureBrowser*
- src/integrations/checkpoints/CheckpointTracker.ts
  - Remove: import { telemetryService } ...
  - Remove: telemetryService.captureCheckpointUsage(...)
- src/integrations/checkpoints/CheckpointGitOperations.ts
  - Remove: import { telemetryService } ...
  - Remove: usage calls
- src/services/logging/Logger.ts
  - Remove: import { errorService } from "../posthog/PostHogClientProvider"
  - Replace errorService.* with console.error/console.warn as applicable

Optional to keep (safe if only referenced by generated code; can be deleted after confirming unused):
- src/shared/TelemetrySetting.ts
- src/shared/proto-conversions/state/telemetry-setting-conversion.ts
- Generated references to TelemetrySetting in src/shared/proto/** and src/generated/** (only remove when confirmed unused)

Find-and-remove pass:
- Search for posthog, telemetryService, FeatureFlagsService, PostHogClientProvider, errorService across src/** and remove usages/imports after deleting the directory.

--------------------------------------------------------------------------------
C) Authentication / Billing (Cline Account)
--------------------------------------------------------------------------------

Remove backend:
- Entire dir: src/services/auth/ (AuthService.ts, AuthServiceMock.ts, providers/FirebaseAuthProvider.ts)

Remove webview UI:
- webview-ui/src/context/ClineAuthContext.tsx
- webview-ui/src/components/settings/ClineAccountInfoCard.tsx
- Entire dir: webview-ui/src/components/account/ (AccountView.tsx, CreditsHistoryTable.tsx, helpers.ts, etc.)
- Any imports of @shared/ClineAccount (then remove shared/ClineAccount.ts if unused elsewhere)

Extension commands/menus (remove "Account" button end-to-end):
- package.json:
  - Remove command with "command": "cline.accountButtonClicked"
  - Remove any entries under contributes.menus.view/title and contributes.menus.editor/title that reference "cline.accountButtonClicked"

JSON edit guidance (package.json):
- Remove objects in contributes.commands where .command == "cline.accountButtonClicked"
- Remove menu contributions referencing that command under contributes.menus.*

--------------------------------------------------------------------------------
D) Tests (keep local-only)
--------------------------------------------------------------------------------

Keep:
- src/api/providers/__tests__/ollama.test.ts

Remove:
- src/api/providers/__tests__/bedrock.test.ts
- src/api/providers/gemini-mock.test.ts
- src/api/transform/vscode-lm-format.test.ts

Note:
- Also remove any transform tests referencing non-local providers (e.g., r1/o1/openrouter/gemini/mistral).

--------------------------------------------------------------------------------
E) Dependencies to Remove from package.json (after code deletion)
--------------------------------------------------------------------------------

Telemetry/Analytics:
- "posthog-node"
- "@sentry/browser"
- All "@opentelemetry/*" packages (if no other usage remains)

Auth:
- "firebase"
- "jwt-decode" (if only referenced by auth)

Internet providers and cloud SDKs:
- "@anthropic-ai/sdk"
- "@anthropic-ai/vertex-sdk"
- "@aws-sdk/client-bedrock-runtime"
- "@aws-sdk/credential-providers"
- "@google-cloud/vertexai"
- "@google/genai"
- "@mistralai/mistralai"
- "@cerebras/cerebras_cloud_sdk"
- Any other provider-specific SDKs only used by files above

Keep for local-only:
- "openai"  (for OpenAI-compatible local endpoints; baseUrl configurable)
- "ollama"

Dependency pruning guidance:
- Remove from dependencies and devDependencies where present.
- After pruning, run a clean install and build to confirm no missing peer deps.

--------------------------------------------------------------------------------
F) UI: Provider Settings (Webview)
--------------------------------------------------------------------------------

- Ensure the settings UI and provider model pickers expose ONLY:
  - OpenAI (with configurable local baseUrl)
  - Ollama
  - LM Studio
- Remove provider pickers, favorites, info components, or icons for removed providers.

Typical areas (paths may vary):
- webview-ui/src/components/settings/* provider selectors
- webview-ui/src/context/ExtensionStateContext.tsx and any provider-list constants
- Icons/assets for removed providers under webview-ui/public or assets if present

--------------------------------------------------------------------------------
G) Optional Docs/Copy Cleanup
--------------------------------------------------------------------------------

- If distributing a local-only variant, trim copy that advertises cloud providers, accounts, billing, or telemetry.
- docs/provider-config/*: remove or gate pages that describe deleted providers (anthropic, bedrock, openrouter, gemini, mistral, etc.) for a local-only build distribution.

--------------------------------------------------------------------------------
H) Order of Operations (Suggested)
--------------------------------------------------------------------------------

1) Edit src/api/index.ts to restrict to the 3 providers (keep Anthropic import for typing until later refactor).
2) Remove telemetry references from BrowserSession, CheckpointTracker, CheckpointGitOperations, and Logger; delete src/services/posthog/**, posthog-config.ts, and ErrorService.ts.
3) Remove auth service dir and webview account components; remove “Account” command/menu in package.json.
4) Delete remote provider files and transforms listed above.
5) Remove remote-only tests; keep ollama test.
6) Rebuild; then prune package.json dependencies listed above; rebuild again to verify.
7) (Optional) Refactor ApiHandler message param type to a local type to fully remove Anthropic SDK typing.
8) UI check: ensure only OpenAI/Ollama/LM Studio are visible as provider options.

--------------------------------------------------------------------------------
I) Risk/Refactor Notes (ApiHandler typing migration plan)
--------------------------------------------------------------------------------

- Current: ApiHandler.createMessage uses Anthropic.Messages.MessageParam from @anthropic-ai/sdk.
- Goal: Provider-agnostic message types.

Proposed shared types (add to src/api/providers/types.ts or src/shared/api.ts):
```ts
export type CoreMessageRole = "system" | "user" | "assistant" | "tool"

export interface CoreToolCall {
  id?: string
  type: "function"
  function: { name: string; arguments: string }
}

export interface CoreMessage {
  role: CoreMessageRole
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>
  tool_calls?: CoreToolCall[]
  name?: string
}

export interface ApiHandler {
  // Replace any Anthropic-specific types with CoreMessage
  createMessage(input: { role: CoreMessageRole; content: any }): CoreMessage
  // ...other methods
}
```

Migration steps:
- Introduce CoreMessage types.
- Update openai.ts, ollama.ts, lmstudio.ts to accept/return CoreMessage.
- Update src/api/index.ts and call sites accordingly.
- Remove @anthropic-ai/sdk once no Anthropic types remain.

--------------------------------------------------------------------------------
J) Quick Checklist (execution tracking)
--------------------------------------------------------------------------------

- [ ] Restrict src/api/index.ts to openai/ollama/lmstudio only
- [ ] Delete src/services/posthog/** + remove all telemetry references
- [ ] Delete src/shared/services/config/posthog-config.ts
- [ ] Delete src/services/error/ErrorService.ts and replace Logger usage with console.error/warn
- [ ] Delete src/services/auth/** + all webview account components
- [ ] Remove "cline.accountButtonClicked" command/menu from package.json
- [ ] Delete remote provider files/transforms listed above
- [ ] Keep only src/api/providers/__tests__/ollama.test.ts (remove remote tests)
- [ ] Prune package.json deps (telemetry, auth, cloud SDKs)
- [ ] Verify build and dev run work with only local providers
- [ ] UI: Provider picker exposes only OpenAI/Ollama/LM Studio
- [ ] (Optional) Refactor ApiHandler types and remove @anthropic-ai/sdk

--------------------------------------------------------------------------------
K) Validation & Find/Replace Commands (suggested)
--------------------------------------------------------------------------------

These are suggested commands for reference; adapt as needed.

Find imports/usages (ripgrep examples):
- rg -n "from \"@/services/posthog" src
- rg -n "telemetryService\." src
- rg -n "errorService\." src
- rg -n "\\banthropic\\b|bedrock|openrouter|vertex|gemini|mistral|vscode-lm|fireworks|groq|qwen|together|sapaicore|sambanova|baseten|cerebras|asksage|doubao|huawei|huggingface|nebius|moonshot|xai|requesty|litellm|openai-native" src

After dependency prune:
- npm run build
- npm test

Build/test should pass with only local providers and remaining core features.

--------------------------------------------------------------------------------
L) Acceptance Criteria
--------------------------------------------------------------------------------

- Build passes with only local providers present.
- No references to telemetry/auth/account remain in code or bundle.
- Account command and menus removed from package.json.
- Only local provider tests run and pass (ollama.test.ts).
- package.json free of removed SDKs; smaller install footprint.
- Provider settings UI shows only OpenAI (local baseUrl), Ollama, LM Studio.
- No imports of deleted provider modules or telemetry/auth code in TypeScript sources.
- (Optional) Anthropic SDK removed entirely after ApiHandler typing refactor.
