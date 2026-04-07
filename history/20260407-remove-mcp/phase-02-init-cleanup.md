# Phase 02 — init.mjs + Config Cleanup

> Parent: [plan.md](plan.md) | Depends on: [Phase 01](phase-01-schema-templates.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P1
- **Status:** complete
- **Effort:** 0.5h

Remove MCP config merge logic from init.mjs and delete all config.json files.

## Implementation Steps

### 1. Delete config.json files (4 files)

```
agent_templates/amp/config.json
agent_templates/claude/config.json
agent_templates/cursor/config.json
agent_templates/opencode/config.json
```

### 2. Simplify AGENTS definition in init.mjs

Remove from each agent:
- `configPath`
- `configKey`
- `configValue`
- `configCli`
- `configNested`

Keep:
- `template` (Amp only — SKILL.md)
- `destDir`, `destFile` (Amp only)
- `rulesSnippet`
- `rulesTarget`

### 3. Remove MCP check logic from check mode (~20 LOC)

Delete the "Check MCP config" block (lines ~238-256).

### 4. Remove MCP merge logic from install mode (~40 LOC)

Delete the entire "3. Merge MCP config" block (lines ~457-500+).

### 5. Update help text and output messages

- Remove "MCP config" from `--agent` description
- Remove "MCP config merged" from output examples
- Update comments

### 6. Update `agent_templates/README.md`

- Remove "MCP config" column from table
- Remove config.json from Template Contents table
- Simplify setup to: install qmd + run init.mjs

## Files Changed

- `init.mjs` (~80 LOC removed)
- `agent_templates/amp/config.json` (delete)
- `agent_templates/claude/config.json` (delete)
- `agent_templates/cursor/config.json` (delete)
- `agent_templates/opencode/config.json` (delete)
- `agent_templates/README.md`

## Success Criteria

- No `config.json` files in agent_templates/
- No MCP merge logic in init.mjs
- `node init.mjs --agent amp` still works (installs SKILL.md + snippet)
- `node init.mjs --check` still works (checks skill + snippet, no MCP check)
- init.mjs is ~80 LOC shorter
