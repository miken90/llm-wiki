---
title: "Remove MCP Dependency — Switch to qmd CLI"
description: "Replace qmd MCP server with qmd CLI via Bash. Delete all MCP config files and merge logic."
status: complete
priority: P1
effort: 2h
branch: main
tags: [refactor, simplification, qmd]
created: 2026-04-07
mode: fast
blockedBy: []
blocks: []
---

# Remove MCP Dependency — Switch to qmd CLI

Replace `qmd MCP server` with `qmd CLI` (via Bash). Delete all MCP config files and merge logic from init.mjs. Agent templates instruct agents to use `qmd query "..."` via Bash instead of MCP tools.

## Problem

MCP adds complexity without real value for this project:
- Each agent has different MCP config format/location (settings.json, .claude.json, opencode.json, mcp.json)
- Config merging logic in init.mjs is ~80 LOC of fragile, agent-specific code
- MCP path bugs keep appearing (Claude Code settings.json → .claude.json)
- All agents already have Bash access — `qmd query` works identically everywhere
- MCP only provides semantic search — agents already use Read/Grep/edit_file for everything else

## Solution

- Replace `mcp__qmd__query(...)` with `qmd query "..." --json` via Bash
- Replace `mcp__qmd__status` with `qmd status` via Bash
- Delete all `config.json` files (4 files)
- Remove MCP merge logic from init.mjs (~80 LOC deletion)
- Update all agent templates to use CLI commands
- Update wiki-schema.md Search/Capability sections

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 01 | Schema + Agent Templates | complete | 1h | [phase-01](phase-01-schema-templates.md) |
| 02 | init.mjs + Config Cleanup | complete | 0.5h | [phase-02](phase-02-init-cleanup.md) |
| 03 | Docs | complete | 0.5h | [phase-03](phase-03-docs.md) |

## Dependencies

```
Phase 01 ──→ Phase 02 ──→ Phase 03
```

## Key Decisions

1. **CLI over MCP** — `qmd query` via Bash is universal, no per-agent config needed
2. **JSON output** — use `qmd query "..." --json` for structured results agents can parse
3. **Keep qmd install** — init.mjs still installs qmd and builds indexes, just no MCP config
4. **Keep Capability Model** — wiki-schema.md still lists abstract capabilities, but `qmd_query` maps to CLI not MCP
5. **No wrapper scripts** — agents call `qmd` directly, no intermediary
6. **Markdown output** — use `qmd query "..." --md` for agent-friendly output
7. **qmd get as alternative** — document `qmd get <file>` with fallback to native Read if unsupported

## Validation Log

### Session 1 — 2026-04-07

**Q1: Cross-project qmd access — PATH or absolute path?**
Options: a) Rely on global PATH (Recommended), b) Hardcode absolute path, c) Local install per wiki
→ **A: a) Rely on global PATH** — qmd is already global after `npm install -g`. Simplest.
Impact: None — already the plan's approach.

**Q2: qmd output format for agent consumption?**
Options: a) Default TTY, b) --json, c) --md (Recommended), d) Don't prescribe
→ **A: c) --md** — markdown output is natural for agents to read, minimal parsing needed.
Impact: Phase 01 (update CLI examples in templates to use `--md`)

**Q3: Existing MCP installs — cleanup or ignore?**
Options: a) Ignore (Recommended), b) Add cleanup logic, c) Document manual cleanup
→ **A: a) Ignore** — old MCP config is harmless, agents just won't use it.
Impact: None — no cleanup code needed.

**Q4: `Do NOT use qmd get/multi_get` warning — remove entirely?**
Options: a) Remove entirely (Recommended), b) Replace with CLI equivalent
→ **A: b) Replace with CLI equivalent** — document `qmd get <file>` as search alternative, with fallback to native Read tool if agent doesn't support Bash or qmd get fails.
Impact: Phase 01 (update SKILL.md tool map to include `qmd get`)
