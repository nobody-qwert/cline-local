# GitHub Release (Local Steps + Manual GitHub UI) — Cline Workflow

This workflow automates all local release steps with Git and npm, then ends with clear, click-by-click GitHub UI instructions to publish the release and upload the VSIX manually. No GitHub CLI is required.

<prereqs>
- Git is installed and authenticated for push to `origin`.
- Node and npm are installed (project already builds locally).
- `npx vsce` is available (it will be downloaded on first use).
- Windows: `certutil` (built-in) is used for SHA256.
</prereqs>

<notes>
- Follow Windows terminal best practices:
  - Quote any path containing spaces, e.g. "C:\Program Files\..."
  - Prefer simple one-liners. Avoid chaining a lot of commands in a single line.
- This workflow assumes the repository uses the same layout as this project (README, CHANGELOG, package.json, webview-ui).
</notes>

---

## 0) Collect inputs

Use Cline’s `<ask_followup_question>` to collect:
- `version` (e.g. `0.3.0`)
- `ref` (branch or commit to release from, default: `main`)
- `releaseDate` (default: today in `YYYY-MM-DD`)
- `bumpType` (Patch / Minor / Major). Show current package.json version and the proposed new version to confirm.
- `releaseNotesSource`:
  - “Use CHANGELOG top section (I will paste)”
  - “Generate from recent commits (Cline synthesizes)”
  - “I will paste final notes”

If “Generate from recent commits” is selected:
- Find previous tag via `git describe --tags --abbrev=0` and collect commits since that tag to synthesize user-focused bullets grouped under Added / Changed / Fixed.

---

## 1) Prepare git (no GitHub CLI)

Use `<execute_command>` for each line (don’t chain excessively on Windows):

```bash
git fetch origin --tags
```

```bash
git switch -c release/v{version} {ref} || git switch release/v{version}
```

```bash
git pull --ff-only origin release/v{version} || true
```

- If the branch didn’t exist, creating it from `{ref}` is expected.

---

## 2) Bump version and docs

Use `<replace_in_file>` for targeted edits.

- Update `package.json` `"version"` to `{version}`.

- Update README “Latest Release” section to:

  ```
  - v{version}: [Release notes](https://github.com/nobody-qwert/cline-local/releases/tag/v{version}) • [Download VSIX](https://github.com/nobody-qwert/cline-local/releases/download/v{version}/cline-local-{version}.vsix)
  ```

- Update `CHANGELOG.md`:
  - Insert at the very top (above prior entries):
    ```
    ## {version} - {releaseDate}
    ```
  - If the user supplied notes, place them under this heading.
  - If generating from commits, synthesize concise, end-user focused bullets and group by:
    - Added — new features
    - Changed — changes in existing functionality
    - Fixed — bug fixes
  - Put the most impactful/flagship items at the top of the list.

Tip: Keep language simple and focused on user impact; avoid internal refactors in the main bullets.

---

## 3) Build and package VSIX

Execute these one by one:

```bash
npm run install:all
```

```bash
npm run package
```

```bash
npx vsce package
```

- Confirm a file named `cline-local-{version}.vsix` exists in the repository root.

---

## 4) Compute SHA256

On Windows (primary):

```bash
certutil -hashfile "cline-local-{version}.vsix" SHA256
```

- Copy the resulting 64-hex-character hash.
- Create `SHA256SUM.txt` containing exactly:

```
<SHA256_HASH>  cline-local-{version}.vsix
```

(Use `<write_to_file>` or `<replace_in_file>` to create/update this file.)

---

## 5) Commit, tag, and push

Run these commands (one per step):

```bash
git add package.json README.md CHANGELOG.md SHA256SUM.txt
```

```bash
git commit -m "release: v{version}"
```

```bash
git tag -a v{version} -m "v{version}"
```

```bash
git push origin release/v{version}
```

```bash
git push origin v{version}
```

At this point:
- Branch `release/v{version}` is on GitHub
- Tag `v{version}` is on GitHub
- VSIX and SHA256 are local (to be uploaded in the UI)

---

## 6) Manual GitHub UI steps (no gh CLI)

1. Navigate to your repo on GitHub.
2. In the right sidebar, click “Releases” → “Draft a new release”.
3. Tag:
   - Choose the existing tag `v{version}` (pushed above).
4. Title:
   - `v{version}`
5. Description:
   - Paste your release notes (or copy the section you just added to `CHANGELOG.md` for `{version}`).
   - Include a “Verification” section:

     ```
     Verification
     - SHA256: <paste the SHA256 hash you computed>
     - Windows: certutil -hashfile "cline-local-{version}.vsix" SHA256
     - macOS/Linux: shasum -a 256 cline-local-{version}.vsix
     ```

6. Upload asset:
   - Drag and drop `cline-local-{version}.vsix` from your local repo folder into the “Attach binaries” area.
7. Options:
   - Ensure “Set as the latest release” is enabled.
   - Leave “This is a pre-release” unchecked unless you intend a pre-release.
8. Click “Publish release”.

---

## 7) Post-release validation and cleanup

- Validate README links:
  - Release notes: `https://github.com/nobody-qwert/cline-local/releases/tag/v{version}`
  - VSIX download: `https://github.com/nobody-qwert/cline-local/releases/download/v{version}/cline-local-{version}.vsix`
- Merge the release branch to `main` via a PR in GitHub (if needed).
- Clean up the branch after merge (optional):
  - Locally: `git branch -d release/v{version}`
  - Remote: `git push origin --delete release/v{version}`

---

## Cline Tool Hints

- Use `<replace_in_file>` for precise edits to:
  - `package.json` ("version")
  - `README.md` (Latest Release links)
  - `CHANGELOG.md` (new version section)
  - `SHA256SUM.txt` (create/update with the hash line)
- Use `<execute_command>` for all Git and npm steps, quoting any path with spaces.
- When generating notes from commits:
  - Find prior tag: `git describe --tags --abbrev=0`
  - Commits since tag: `git log --oneline <prev-tag>..HEAD`
  - Synthesize bullets in user-focused language.
