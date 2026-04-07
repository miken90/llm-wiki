# Phase 02 — Agent Templates + Init

> Parent: [plan.md](plan.md) | Depends on: [Phase 01](phase-01-schema-operation.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P2
- **Status:** pending
- **Effort:** 1h

Update agent templates with register/unregister triggers. No new capabilities needed — register only uses `file_read` + `file_write` which all agents already have.

## Key Insights

- No new capability required — register reads/writes config.yaml, all agents can do this
- Agents running in project repos need WIKI_ROOT to find config.yaml — already solved
- SKILL.md gets the most detail, snippets just add trigger keywords

## Implementation Steps

### 1. Update `agent_templates/amp/SKILL.md`

Add to Discovery Operations section:
```markdown
- **Register**: "register `<project>`" — scan project, propose topics/feeds, append to config.yaml
- **Unregister**: "unregister `<project>`" — remove project's registered topics/feeds
```

### 2. Update all 4 snippet files

Add to Operations list in each snippet:
- `register <project>` — scan project → propose topics → append to config.yaml
- `unregister <project>` — remove project's topics/feeds from config.yaml

### 3. Update SKILL.md description frontmatter

Add "register", "unregister" to trigger phrases.

## Todo

- [ ] Update `agent_templates/amp/SKILL.md` — add register/unregister
- [ ] Update `agent_templates/amp/AGENTS.snippet.md` — add triggers
- [ ] Update `agent_templates/claude/CLAUDE.snippet.md` — add triggers
- [ ] Update `agent_templates/cursor/.cursorrules.snippet` — add triggers
- [ ] Update `agent_templates/opencode/AGENTS.snippet.md` — add triggers

## Success Criteria

- All 4 agents have register/unregister triggers
- No new capabilities or tool mappings needed
- Snippets stay within size limits (≤30 lines)

## Risk Assessment

| Component | Risk | Mitigation |
|-----------|------|------------|
| Snippet bloat | LOW | Just 2 lines per snippet |

## Next Steps

→ Phase 03: Update README docs
