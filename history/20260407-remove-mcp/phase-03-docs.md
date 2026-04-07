# Phase 03 — Docs

> Parent: [plan.md](plan.md) | Depends on: [Phase 02](phase-02-init-cleanup.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P1
- **Status:** complete
- **Effort:** 0.5h

Update README and docs/ to remove all MCP references.

## Implementation Steps

### 1. Update `README.md`

- Architecture diagram: "search/read/write via qmd MCP" → "search via qmd CLI"
- "Shared knowledge service" line: remove "via qmd MCP server"
- Prerequisites: "qmd — markdown search engine with MCP server" → "qmd — markdown search engine"
- Quick Start: remove "merges qmd MCP config" from description

### 2. Update `docs/codebase-summary.md`

- Remove "MCP config merge" from init.mjs capabilities
- Remove "MCP configuration snippets" from agent_templates description
- Remove `config.json` entries from all agent listings
- "via qmd MCP server" → "via qmd CLI"
- Search section: "qmd MCP server" → "qmd CLI"

### 3. Update `docs/system-architecture.md`

- Architecture diagram: "via qmd MCP" → "via qmd CLI"
- Agent Integration section: remove MCP config references
- "MCP Server (qmd)" section → "Search Engine (qmd)"
- Remove "MCP gateway" from federation future section (keep as generic "gateway")

### 4. Update `docs/project-overview-pdr.md`

- "via qmd MCP server" → "via qmd CLI"
- Remove "qmd — MCP server" from requirements
- Update agent_templates description

### 5. Update `docs/project-roadmap.md`

- "MCP config merging" → "Snippet injection"
- "MCP gateway" → "search gateway"

### 6. Update `docs/deployment-guide.md`

- Remove "merges MCP config" from init output
- Remove "Failed to merge MCP config" troubleshooting section
- Remove "Check MCP config" from search troubleshooting
- Simplify agent install steps

### 7. Update `docs/code-standards.md`

- Agent Capabilities table: `qmd_query` column → "✅ qmd CLI" for all agents
- Remove "MCP config" from commit examples

### 8. Update `docs/user-guide.md`

- Remove "via the qmd MCP server" from getting started

## Files Changed

- `README.md`
- `docs/codebase-summary.md`
- `docs/system-architecture.md`
- `docs/project-overview-pdr.md`
- `docs/project-roadmap.md`
- `docs/deployment-guide.md`
- `docs/code-standards.md`
- `docs/user-guide.md`

## Success Criteria

- Zero "MCP" references in docs/ except historical context (history/ is fine)
- Zero "MCP" references in README.md
- All docs describe qmd as CLI tool, not MCP server
- Setup instructions don't mention MCP config
