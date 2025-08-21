# Changelog - Cline Local

All notable changes to the Cline Local fork will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.2.1 - 2025-08-21

### Fixed
- Reasoning effort selector now applies correctly.

## 0.2.0 - 2025-08-21

### Changed
- Bumped version to 0.2.0 and updated README “Latest Release” links.

### Removed
- Removed 'upstream' git remote; repository operates independently (no fork tracking).

### Build/Release
- Documented release process for GitHub-only VSIX distribution.

## [1.0.0] - 2025-01-17

### Initial Fork Release

This marks the first official release of **Cline Local**, a lean, privacy-focused fork of the upstream Cline project.

#### Added
- **Local-only architecture** - No cloud dependencies or external connections except for AI API calls
- **Privacy-first design** - Zero telemetry, analytics, or data collection
- **Streamlined provider support** - OpenAI-compatible (with configurable baseUrl), Ollama, and LM Studio
- **Core development tools**:
  - Plan/Act mode workflow for structured development
  - File operations (read, write, search, list)
  - Terminal integration with command execution
  - MCP (Model Context Protocol) integration for extensibility
  - Git-friendly design with manual checkpoint controls
  - Web content fetching (HTTP-only, no browser automation)

#### Removed for Privacy & Simplicity
- **Browser automation** - No Puppeteer/browser_action tool
- **Telemetry & analytics** - No PostHog, no data collection, no usage tracking
- **Cloud providers** - No AWS Bedrock, GCP Vertex, Azure, Anthropic direct, etc.
- **Background processes** - No automatic checkpoints or background Git operations
- **Authentication systems** - No user accounts, billing, or subscription management
- **Marketplace integrations** - Simplified local-only MCP server management

#### Technical Foundation
- Based on upstream Cline architecture (WebviewProvider → Controller → Task flow)
- Maintained compatibility with existing MCP servers and local development workflows
- Preserved core extension capabilities while removing cloud/privacy-concerning features
- Independent package identity: `cline-local` with `nobody-qwert` publisher

#### Documentation
- Updated README.md with fork-specific positioning
- Clear differentiation from upstream regarding privacy and local-only focus
- Installation and setup guides for local/offline development environments

---

## Versioning Strategy

**Cline Local** follows independent versioning starting from v1.0.0:

- **Major versions (2.0.0, 3.0.0)**: Breaking changes or significant architectural updates
- **Minor versions (1.1.0, 1.2.0)**: New features, upstream merges with compatible changes
- **Patch versions (1.0.1, 1.0.2)**: Bug fixes, security updates, minor improvements

### Upstream Integration Policy

When merging relevant changes from upstream Cline:
- Only privacy-compatible features are integrated
- Cloud/telemetry features are explicitly excluded
- Changes are documented as "merged upstream improvements" with version references
- Fork-specific modifications are clearly distinguished from upstream contributions

---

## Archive Notice

The complete upstream changelog from the original Cline project has been preserved in `CHANGELOG-UPSTREAM.md` for reference and attribution purposes.

---

*Cline Local is an independent fork focused on privacy and local development. While based on the excellent upstream Cline project, it represents a distinct approach prioritizing data protection and offline workflows.*
