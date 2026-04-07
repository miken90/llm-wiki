---
title: "Auto-Discovery for LLM Wiki"
description: "Add discover/run/status operations with config-driven topic feeds and qmd-powered dedup"
status: pending
priority: P1
effort: 8h
branch: main
tags: [discovery, automation, schema, config]
created: 2026-04-07
mode: hard
blockedBy: []
blocks: []
---

# Auto-Discovery for LLM Wiki

Add auto-discovery capabilities so the wiki actively finds and queues new sources, instead of waiting for manual drops.

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 01 | Config & State Infrastructure | pending | 1.5h | [phase-01](phase-01-config-state-infra.md) |
| 02 | Schema Operations (Discover, Run, Status) | pending | 2.5h | [phase-02](phase-02-schema-operations.md) |
| 03 | Agent Template Updates | pending | 2h | [phase-03](phase-03-agent-templates.md) |
| 04 | Init Script & Bootstrap | pending | 1h | [phase-04](phase-04-init-bootstrap.md) |
| 05 | README & Documentation | pending | 1h | [phase-05](phase-05-docs.md) |

## Dependencies

```
Phase 01 ──→ Phase 02 ──→ Phase 03
                  │              │
                  └──→ Phase 04 ─┤
                                 └──→ Phase 05
```

## Key Decisions

1. **Schema-first** — all behavior in wiki-schema.md, templates are thin capability maps
2. **Inbox model** — discover queues candidates, approval required before ingest
3. **3 strategies first** — web_search, feed_poll, github_watch (expand later)
4. **qmd dedup** — 3-layer: URL → title → semantic similarity
5. **Graceful degradation** — skip strategies when agent lacks web tools

## Validation Log

### Session 1 — 2026-04-07

**Q1: Candidate approval UX?**
→ **A: List all, ask "approve all / select / reject all"** — simple, interactive
Impact: Phase 02 (Run operation flow step 2)

**Q2: Discovered source storage location?**
→ **A: `sources/articles/` subfolder** — separates auto vs manual
Impact: Phase 01 (frontmatter), Phase 02 (paths), Phase 05 (directory structure)

**Q3: Corrupted .discoveries/ JSON recovery?**
→ **A: Validate on read, reset to empty + warn if malformed** — resilient
Impact: Phase 02 (add recovery rule to schema)

**Q4: qmd semantic dedup thresholds (0.9/0.6)?**
→ **A: Ship with defaults, document as tunable** — pragmatic
Impact: Phase 02 (note thresholds are adjustable)

**Q5: Should lint auto-update gaps.json?**
→ **A: Yes, always when .discoveries/ exists** — enables self-improving loop
Impact: Phase 02 (update Lint operation in schema)

**Q6: config.yaml dependency in schema?**
→ **A: Optional — "if config.yaml exists, use it; otherwise use defaults"** — backwards-compatible
Impact: Phase 02 (config is optional, not required)
