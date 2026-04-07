# Phase 03 — Agent Template Updates

> Parent: [plan.md](plan.md) | Depends on: [Phase 02](phase-02-schema-operations.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P1
- **Status:** pending
- **Effort:** 2h

Update all 4 agent templates with discovery capability maps and new operation triggers. Templates remain thin — all behavior stays in wiki-schema.md.

## Key Insights

- All agents use **global-level** instructions (not project-level in wiki repo)
- Amp: SKILL.md (on-demand) + AGENTS.snippet.md (always-on, injected into global AGENTS.md)
- Claude/Cursor/OpenCode: snippet only (injected into global CLAUDE.md / .cursorrules / AGENTS.md)
- Expand existing snippets to include discovery triggers + capability map
- Snippets stay within `<!-- llm-wiki:start/end -->` markers — init.mjs injects as-is
- Keep additions compact — snippets should be ≤30 lines

## Requirements

1. Amp SKILL.md gets discover/run/status commands + capability map
2. All 4 snippet files get discovery triggers + capability map (within markers)
3. All reference wiki-schema.md for detailed steps
4. Capability map maps abstract capabilities to agent-native tools
5. Graceful degradation documented per agent

## Architecture

### What gets installed where

| Agent | On-demand skill | Always-on snippet | Target |
|-------|----------------|-------------------|--------|
| Amp | `SKILL.md` → `~/.config/amp/skills/llm-wiki/` | `AGENTS.snippet.md` → `~/.config/amp/AGENTS.md` | Global |
| Claude | — | `CLAUDE.snippet.md` → `~/.claude/CLAUDE.md` | Global |
| Cursor | — | `.cursorrules.snippet` → `~/.cursor/.cursorrules` | Global |
| OpenCode | — | `AGENTS.snippet.md` → `~/.config/opencode/AGENTS.md` | Global |

### Capability Map per Agent

| Capability | Amp | Claude Code | Cursor | OpenCode |
|------------|-----|-------------|--------|----------|
| web_search | `mcp__exa__web_search_exa` | `WebSearch` | web_search (if available) | web_search (if available) |
| http_fetch | `mcp__exa__crawling_exa` | `WebFetch` | read_web_page (if available) | read_web_page (if available) |
| file_read | `Read` | `Read` / `cat` | `Read` / `cat` | `Read` / `cat` |
| file_write | `create_file` / `edit_file` | `Write` / `Edit` | `Write` / `Edit` | `Write` / `Edit` |
| qmd_query | `mcp__qmd__query` | qmd MCP `query` | qmd MCP `query` | qmd MCP `query` |

### Fallback Rules (all agents)

```
If web_search unavailable → skip web_search strategy, continue with feed_poll/github_watch
If http_fetch unavailable → queue URLs in inbox but can't fetch content (user must provide)
If qmd unavailable → use Grep/file search as fallback for dedup
```

## Related Code Files

- `agent_templates/amp/SKILL.md` — on-demand skill
- `agent_templates/amp/AGENTS.snippet.md` — always-on global snippet
- `agent_templates/claude/CLAUDE.snippet.md` — always-on global snippet
- `agent_templates/cursor/.cursorrules.snippet` — always-on global snippet
- `agent_templates/opencode/AGENTS.snippet.md` — always-on global snippet

## Implementation Steps

### 1. Update `agent_templates/amp/SKILL.md`

Add after "## Operations" section:

```markdown
## Discovery Operations

- **Discover**: "discover" or "find new sources" — search web/feeds/GitHub, queue to inbox
- **Run**: "run" or "run full cycle" — discover → approve → ingest → lint (max 2 rounds)
- **Status**: "status" or "wiki status" — page counts, health, capabilities

For detailed steps, read wiki-schema.md Discovery/Run/Status sections.

### Discovery Capability Map

| Capability | Tool |
|------------|------|
| web_search | `mcp__exa__web_search_exa` |
| http_fetch | `mcp__exa__crawling_exa` |
| file_read | `Read` |
| file_write | `create_file` / `edit_file` |
| qmd_query | `mcp__qmd__query` |

If a capability is unavailable, skip that strategy and continue. Report degraded mode in status.

### Discovery Paths

- Config: {{WIKI_ROOT}}/config.yaml
- State: {{WIKI_ROOT}}/.discoveries/
- Sources: {{WIKI_ROOT}}/sources/articles/
```

### 2. Update `agent_templates/amp/AGENTS.snippet.md`

Expand within existing markers:

```markdown
<!-- llm-wiki:start -->
## LLM Wiki Integration

### Context Gathering Priority
1. **Search LLM Wiki first** — load `llm-wiki` skill, search for prior knowledge
2. **Read `docs/` first** — architecture, conventions, decisions
3. **Use cocoindex semantic search** — find relevant code chunks
4. **Read full files** — only when need complete context
5. **Scout** — only when docs missing or stale

### Discovery Operations
- `discover` — find new sources → queue to inbox. Load `llm-wiki` skill first.
- `run` — full cycle: discover → approve → ingest → lint
- `status` — wiki health dashboard
<!-- llm-wiki:end -->
```

### 3. Update `agent_templates/claude/CLAUDE.snippet.md`

Expand within markers:

```markdown
<!-- llm-wiki:start -->
## LLM Wiki Integration

### Context Gathering Priority
1. **Search wiki first** — qmd MCP query for prior knowledge on the topic
2. Read project docs/ — architecture, conventions
3. Search project code — find relevant implementations

### Wiki Operations (via qmd MCP at {{WIKI_ROOT}})
- **Query**: search wiki → read pages → synthesize answer with [[citations]]
- **Ingest**: "ingest <path>" → read source → create/update wiki pages
- **Lint**: "lint wiki" → check orphans, broken links, gaps
- **Discover**: "discover" → search web/feeds/GitHub → queue candidates to inbox
- **Run**: "run" → discover → approve → ingest → lint (max 2 rounds)
- **Status**: "status" → page counts, health, capabilities

Read {{WIKI_ROOT}}/wiki-schema.md for detailed steps. Config: {{WIKI_ROOT}}/config.yaml

### Capability Map
| Capability | Tool |
|------------|------|
| web_search | WebSearch |
| http_fetch | WebFetch |
| qmd_query | qmd MCP `query` |

Skip unavailable strategies, don't fail.
<!-- llm-wiki:end -->
```

### 4. Update `agent_templates/cursor/.cursorrules.snippet`

Same pattern, compact:

```markdown
<!-- llm-wiki:start -->
## LLM Wiki

Wiki at {{WIKI_ROOT}} via qmd MCP. Search wiki before non-trivial work.

Operations: query, ingest, lint, discover, run, status
Read {{WIKI_ROOT}}/wiki-schema.md for steps. Config: {{WIKI_ROOT}}/config.yaml

Skip web strategies if web tools unavailable.
<!-- llm-wiki:end -->
```

### 5. Update `agent_templates/opencode/AGENTS.snippet.md`

Same pattern as Claude snippet.

## Todo

- [ ] Update `agent_templates/amp/SKILL.md` — add Discovery Operations + Capability Map
- [ ] Update `agent_templates/amp/AGENTS.snippet.md` — add discovery triggers
- [ ] Update `agent_templates/claude/CLAUDE.snippet.md` — add operations + capability map
- [ ] Update `agent_templates/cursor/.cursorrules.snippet` — add operations (compact)
- [ ] Update `agent_templates/opencode/AGENTS.snippet.md` — add operations + capability map
- [ ] Verify all snippets stay within `<!-- llm-wiki:start/end -->` markers
- [ ] Verify {{WIKI_ROOT}} placeholder used for all paths
- [ ] Test: `node init.mjs --check` detects outdated snippets

## Success Criteria

- All 4 agents have discovery triggers in global snippets
- Amp SKILL.md has full capability map
- All snippets reference wiki-schema.md (not duplicate logic)
- `node init.mjs --agent <name>` installs updated snippets
- `node init.mjs --check` detects when snippets are outdated
- {{WIKI_ROOT}} placeholder used consistently

## Risk Assessment

| Component | Risk | Mitigation |
|-----------|------|------------|
| Snippet too large | MEDIUM — bloats global config | Keep ≤30 lines per snippet |
| Template drift | MEDIUM — 4 snippets may diverge | Same structure, test with --check |
| Overwriting user content | LOW — markers protect injection zone | init.mjs only replaces between markers |

## Security Considerations

- No secrets in templates — config.yaml paths only

## Next Steps

→ Phase 04: init.mjs bootstraps config + state
→ Phase 05: README documents the workflow
