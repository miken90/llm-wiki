# Approach — Auto-Discovery for LLM Wiki

**Date:** 2026-04-07
**Approach:** B — Schema-first discovery with qmd-powered dedup

## Decision

Add `Discover`, `Run`, `Status` operations to `wiki-schema.md` as agent-agnostic operations. Use `config.yaml` for topics/feeds, `.discoveries/` for state, qmd for smart dedup.

## Why Approach B

| Factor | A (Port directly) | B (Schema-first) | C (External script) |
|--------|-------------------|-------------------|---------------------|
| Agent-agnostic | ❌ Claude-only | ✅ All 4 agents | ✅ No agent needed |
| qmd integration | ❌ grep-only | ✅ Full semantic | ❌ No LLM intelligence |
| DRY | ❌ Duplicated rules | ✅ Schema + thin wrappers | ✅ |
| LLM quality | ✅ | ✅ | ❌ Can't evaluate sources |
| Effort | L | M | S (but limited value) |

## Key Contracts

### Candidate Lifecycle
```
pending → approved → ingested (success)
pending → approved → failed (error)
pending → rejected
```

### Dedup Policy (3-layer)
1. **URL exact match** against history.json → duplicate
2. **Normalized title match** against history.json → probable duplicate
3. **qmd semantic search** against wiki + sources:
   - >0.9 similarity → duplicate, skip
   - 0.6-0.9 → flag, lower score, keep as pending
   - <0.6 → novel, boost score

### Capability Degradation
- Missing web_search → skip web_search strategy
- Missing http_fetch → queue URLs, user must fetch manually
- Missing qmd → fallback to file-based dedup only
- Status reports active capabilities

### Single-Writer Rule
`discover`, `run`, `ingest`, `update`, `lint` are exclusive write operations. Only one agent at a time.

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Template drift (4 agents) | MEDIUM | Keep additions ≤20 lines, behavior in schema |
| State corruption | HIGH | Seed valid JSON, single-writer, version field |
| Junk ingestion | MEDIUM | auto_ingest: false, approval gate, 3-layer dedup |
| Cross-project path errors | MEDIUM | All writes via WIKI_ROOT, state in wiki repo only |
| Overbuilding | LOW | 3 strategies now, expand on demand |

## Files Changed

| File | Change | Risk |
|------|--------|------|
| config.example.yaml | NEW | LOW |
| .discoveries/.gitkeep | NEW | LOW |
| wiki-schema.md | Add 3 operations + config section | MEDIUM |
| agent_templates/amp/SKILL.md | Add discovery commands + capability map | MEDIUM |
| agent_templates/claude/CLAUDE.md | Add capability map + triggers | MEDIUM |
| agent_templates/cursor/.cursorrules | Add capability map + triggers | MEDIUM |
| agent_templates/opencode/AGENTS.md | Add capability map + triggers | MEDIUM |
| init.mjs | Bootstrap config + state | MEDIUM |
| README.md | Document discovery workflow | LOW |
| .gitignore | Add config.yaml, .discoveries/*.json | LOW |
| sources/articles/.gitkeep | NEW directory | LOW |
