# LM Studio Inference Settings Feature

Author: Cline  
Scope: Add user-configurable LM Studio sampling parameters with Idea/Strict profiles and a Plan-mode Idea toggle. No system-prompt banner.

## Goals

- Provide two parameter profiles for LM Studio:
  - Idea (creative, used only in Plan mode when Idea Mode is ON)
  - Strict (deterministic, used in Act mode always; also used in Plan mode when Idea Mode is OFF)
- Expose controls in Settings > LM Studio:
  - Two grouped sections: Idea params and Strict params
  - A Plan-mode-only toggle to enable/disable Idea Mode
- Wire the selected profile into every LM Studio request:
  - LM Studio OpenAI-compatible `/v1/chat/completions`
  - Do not modify the system prompt
  - Tool calls benefit naturally (Act mode = Strict)

## Defaults and Constraints

- Idea (used only if mode=Plan and Idea Mode is ON)
  - temperature: 0.9
  - top_p: 0.95
  - top_k: 40
  - repeat_penalty: 1.05

- Strict (used in Act mode always; and in Plan mode when Idea Mode is OFF)
  - temperature: 0.1
  - top_p: 1.0
  - top_k: 0
  - repeat_penalty: 1.0

- UI validation ranges:
  - temperature: 0.00–1.00 (step 0.01)
  - top_p: 0.00–1.00 (step 0.01)
  - top_k: 0–100 (integer)
  - repeat_penalty: 0.00–2.00 (step 0.01)

- No `min_p` parameter:
  - LM Studio OpenAI-compatible API supports temperature, top_p, top_k, repeat_penalty, etc., but not min_p
  - We will not include min_p in requests nor UI

## Architecture Changes

### 1) Types, Storage, Proto

- Extend `ApiConfiguration` (src/shared/api.ts) with:
  - `planIdeaModeEnabled?: boolean`
  - `planModeLmStudioTemperature?: number`
  - `planModeLmStudioTopP?: number`
  - `planModeLmStudioTopK?: number`
  - `planModeLmStudioRepeatPenalty?: number`
  - `actModeLmStudioTemperature?: number`
  - `actModeLmStudioTopP?: number`
  - `actModeLmStudioTopK?: number`
  - `actModeLmStudioRepeatPenalty?: number`

- Update proto (proto/cline/models.proto, message ModelsApiConfiguration)
  - Add `optional bool plan_idea_mode_enabled = 103;`
  - Plan sampling:
    - `optional double plan_mode_lm_studio_temperature = 113;`
    - `optional double plan_mode_lm_studio_top_p = 114;`
    - `optional int32 plan_mode_lm_studio_top_k = 115;`
    - `optional double plan_mode_lm_studio_repeat_penalty = 116;`
  - Act sampling:
    - `optional double act_mode_lm_studio_temperature = 213;`
    - `optional double act_mode_lm_studio_top_p = 214;`
    - `optional int32 act_mode_lm_studio_top_k = 215;`
    - `optional double act_mode_lm_studio_repeat_penalty = 216;`

- Regenerate:
  - `npm run protos`
  - Format scripts already configured

- Update conversions (src/shared/proto-conversions/models/api-configuration-conversion.ts):
  - Map all new fields both directions

### 2) Provider Selection Logic

- `buildApiHandler` (src/api/index.ts):
  - Determine effective sampling params:
    - If `mode === "plan"` and `planIdeaModeEnabled === true` → use Plan/Idea params
    - Else → use Act/Strict params
  - Pass selected values into `LmStudioHandler`

### 3) LM Studio Handler

- `src/api/providers/lmstudio.ts`:
  - Extend `LmStudioHandlerOptions` with:
    - `temperature?: number`
    - `topP?: number`
    - `topK?: number`
    - `repeatPenalty?: number`
  - In `createMessage`:
    - GPT-OSS path (manual fetch `/v1/chat/completions`): include `temperature`, `top_p`, `top_k`, `repeat_penalty` in the JSON body
    - Non-GPT-OSS path (OpenAI SDK): include the same fields on `req` (`any`)
  - Clamp values to UI ranges before sending

### 4) Settings UI (webview)

- File: `webview-ui/src/components/settings/providers/LMStudioProvider.tsx`
  - Plan-mode-only toggle:
    - Label: “Idea Mode (Plan only)”
    - Visible only when `currentMode === "plan"`
    - Uses `updateSetting("planIdeaModeEnabled", boolean)`
  - Two parameter groups labeled:
    - “Idea (Plan mode when Idea Mode is ON)”
    - “Strict (Act mode; and Plan mode when Idea Mode is OFF)”
  - Each group provides numeric input controls with validation and a “Reset to defaults” button
  - Controls update `ApiConfiguration` using `handleFieldChange` with the explicit field names

### 5) Behavior Guarantees

- Act mode → Strict params always
- Plan mode:
  - Idea Mode ON → Idea params
  - Idea Mode OFF → Strict params
- Tool-call determinism is satisfied by Act mode’s strictness; if user wants strictness in Plan, they can toggle Idea OFF
- No system-prompt banner; rely solely on API parameters

## Test Plan

- Settings UI:
  - Toggle Idea Mode only appears in Plan mode
  - Edit Idea and Strict fields, verify persistence across reloads
  - Reset-to-defaults sets exactly:
    - Idea: temperature=0.9, top_p=0.95, top_k=40, repeat_penalty=1.05
    - Strict: temperature=0.1, top_p=1.0, top_k=0, repeat_penalty=1.0

- Provider requests:
  - Plan+Idea ON: POST body includes Idea params
  - Plan+Idea OFF: POST
