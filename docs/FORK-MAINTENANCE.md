# Fork Maintenance Guide - Cline Local

This document outlines the maintenance strategy and branching approach for the Cline Local fork.

## Branching Strategy

### Main Branches

- **`main`** - Stable releases and production-ready code
  - Tagged releases (v1.0.0, v1.1.0, etc.)
  - Protected branch requiring review
  - Always deployable/packageable

- **`develop`** - Integration branch for ongoing development
  - Merges from feature branches and upstream integration
  - Pre-release testing occurs here
  - Staging area before main branch merges

### Supporting Branches

- **`upstream-sync`** - Temporary branch for upstream integration
  - Created when pulling changes from upstream cline/cline
  - Used to cherry-pick and adapt compatible features
  - Merged into develop after privacy/compatibility review

- **`feature/*`** - Fork-specific feature development
  - For local-only enhancements and improvements
  - Branched from and merged back to develop
  - Examples: `feature/enhanced-mcp-local`, `feature/offline-improvements`

- **`hotfix/*`** - Critical fixes that need immediate release
  - Branched from main for urgent security/stability fixes
  - Merged to both main and develop
  - Tagged with patch version (v1.0.1, v1.0.2)

## Upstream Integration Process

### 1. Monitoring Upstream Changes

- Regularly review upstream releases and commits
- Focus on changes that align with local-only philosophy
- Skip cloud providers, telemetry, browser automation features

### 2. Selective Integration Workflow

```bash
# Create upstream sync branch
git checkout develop
git pull origin develop
git checkout -b upstream-sync/v3.26.x

# Add upstream remote if not already added
git remote add upstream https://github.com/cline/cline.git
git fetch upstream

# Cherry-pick relevant commits or merge specific features
git cherry-pick <commit-hash>
# OR
git merge --no-commit upstream/main
# Then carefully review and revert unwanted changes

# Test integration thoroughly
npm run check-types
npm run lint
npm test

# Merge to develop
git checkout develop
git merge upstream-sync/v3.26.x
git branch -d upstream-sync/v3.26.x
```

### 3. Integration Guidelines

**Include:**
- Core tool improvements (file operations, MCP enhancements)
- Bug fixes and security patches
- Performance optimizations
- Local provider improvements
- Development tooling enhancements

**Exclude:**
- New cloud providers (Anthropic, Bedrock, etc.)
- Telemetry/analytics features
- Browser automation enhancements
- Authentication/billing systems
- Background checkpoint features

## Release Process

### Version Numbering

- **Major (2.0.0)**: Breaking changes, significant architecture updates
- **Minor (1.1.0)**: New features, upstream integrations with new capabilities
- **Patch (1.0.1)**: Bug fixes, security updates, minor improvements

### Release Workflow

```bash
# From develop branch when ready for release
git checkout main
git merge develop

# Update version in package.json if not already done
# Update CHANGELOG.md with release notes

git add package.json CHANGELOG.md
git commit -m "chore: bump version to v1.1.0"

# Tag the release
git tag -a v1.1.0 -m "Cline Local v1.1.0: [Brief description]"

# Push to origin
git push origin main
git push origin v1.1.0

# Merge back to develop
git checkout develop
git merge main
```

## Maintenance Responsibilities

### Code Quality
- Maintain ESLint compliance (warnings allowed for upstream compatibility)
- Keep TypeScript strict mode enabled
- Preserve test coverage for modified components
- Follow existing code patterns and architecture

### Documentation
- Update README.md for significant changes
- Maintain CHANGELOG.md with clear categorization
- Document fork-specific features and differences
- Keep FORK-MAINTENANCE.md current

### Security
- Monitor upstream for security patches
- Apply security fixes promptly via hotfix branches
- Review dependencies regularly
- Maintain privacy-first approach in all changes

## Privacy Compliance Review

Before any upstream integration, verify:

1. **No telemetry/analytics** - Check for PostHog, analytics, or tracking code
2. **No cloud dependencies** - Avoid new cloud provider integrations
3. **No authentication systems** - Skip account/billing related features
4. **No browser automation** - Exclude Puppeteer or computer-use enhancements
5. **No background processes** - Avoid automatic checkpointing or snapshots

## Communication

- Use commit messages that clearly indicate upstream vs fork-specific changes
- Tag upstream integrations: `upstream: merge file operation improvements from v3.26.x`
- Tag fork features: `feat: add enhanced local MCP server discovery`
- Use CHANGELOG.md to communicate changes to users

## Emergency Procedures

### Critical Security Issues
1. Create hotfix branch from main immediately
2. Apply minimal fix required
3. Test thoroughly but quickly
4. Release patch version within 24-48 hours
5. Communicate via GitHub releases and README

### Upstream Breaking Changes
1. Assess impact on fork functionality
2. Create feature branch to adapt changes
3. May require major version bump (2.0.0)
4. Extensive testing in develop branch before release
5. Clear migration guide in CHANGELOG.md

---

This maintenance guide ensures Cline Local remains a stable, privacy-focused fork while selectively benefiting from upstream improvements.
