# Phase 01 — Schema + Agent Templates

> Parent: [plan.md](plan.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P1
- **Status:** complete
- **Effort:** 1h

Update wiki-schema.md and all agent templates to replace MCP references with qmd CLI.

## Key Insight

The replacement is mechanical: every `mcp__qmd__query` becomes `qmd query "..." --json` via Bash. Every "qmd MCP server" reference becomes "qmd CLI". No behavior changes.

## Implementation Steps

### 1. Update `wiki-schema.md`

**Search section (line ~166):**
```
Before: Primary: qmd CLI (`qmd query "..."`) or qmd MCP tools (`query`, `get`, `multi_get`, `status`)
After:  Primary: qmd CLI (`qmd query "..."`, `qmd search "..."`, `qmd status`)
```

- Remove "qmd MCP" from Architecture description (line ~31)
- Update Search section — remove MCP references, document CLI commands
- Update Capability Model — `qmd_query` maps to `qmd query` CLI (not MCP)
- Remove "MCP config" from directory structure description (line ~54)
- Keep `qmd` as required tool, just not via MCP

### 2. Update `agent_templates/amp/SKILL.md`

Replace Tool Map:
```
Before: | Semantic search | `mcp__qmd__query` | `{"searches":[...]}` |
After:  | Semantic search | `Bash` | `qmd query "..." -c wiki --md` |
        | Read wiki page  | `Bash` or `Read` | `qmd get wiki/concepts/foo.md` (fallback: native Read) |
```

- Remove `mcp__qmd__*` references
- Replace "Do NOT use mcp__qmd__get" with: "Use `qmd get <file>` via Bash for quick page fetch. Fallback to native Read tool if Bash unavailable."
- Update Workflow step 1: `qmd query` via Bash instead of MCP
- Update Discovery Capability Map: `qmd_query` → `Bash` with `qmd query`
- Remove "Search: hybrid (qmd MCP for semantic...)" → "Search: hybrid (qmd CLI for semantic...)"

### 3. Update `agent_templates/amp/AGENTS.snippet.md`

Minimal — just remove "qmd MCP" reference if present.

### 4. Update `agent_templates/claude/CLAUDE.snippet.md`

- Replace "qmd MCP `query`" → "`qmd query` via Bash/shell"
- Remove Capability Map table (MCP-specific)
- Simplify Tool Map

### 5. Update `agent_templates/cursor/.cursorrules.snippet`

- Replace "qmd MCP query" → "`qmd query` via shell"

### 6. Update `agent_templates/opencode/AGENTS.snippet.md`

- Same as Claude — replace MCP references with CLI

## Files Changed

- `wiki-schema.md`
- `agent_templates/amp/SKILL.md`
- `agent_templates/amp/AGENTS.snippet.md`
- `agent_templates/claude/CLAUDE.snippet.md`
- `agent_templates/cursor/.cursorrules.snippet`
- `agent_templates/opencode/AGENTS.snippet.md`

## qmd CLI Quick Reference (for templates)

```bash
# Semantic search (recommended)
qmd query "search terms" -c wiki --md

# Keyword search (BM25 only, fast)
qmd search "exact terms" -c wiki

# Read a specific page
qmd get wiki/concepts/foo.md

# Check index health
qmd status

# Re-index after changes
qmd update && qmd embed
```

## Success Criteria

- No `mcp__qmd__*` references in any template
- No "qmd MCP" in wiki-schema.md
- All agents can search wiki via `qmd query` CLI
- Capability model still documents graceful degradation
- Templates are agent-agnostic (all use Bash/shell)
