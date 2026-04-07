---
title: "Register Topics from Project"
description: "Add a register operation so projects can push topics/feeds into wiki config.yaml dynamically"
status: done
priority: P2
effort: 3h
branch: main
tags: [discovery, config, multi-project]
created: 2026-04-07
mode: fast
blockedBy: []
blocks: []
---

# Register Topics from Project

Add a `register` operation so any connected project can push its topics and feeds into the wiki's `config.yaml` — eliminating manual config editing when onboarding new projects.

## Problem

Currently, when a new project connects to the wiki, someone must manually edit `config.yaml` to add relevant topics/feeds. This breaks the "LLM does all bookkeeping" philosophy. With N projects, keeping topics current becomes a maintenance burden — exactly what the wiki pattern is supposed to eliminate.

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 01 | Schema Operation + Config Extensions | done | 1.5h | [phase-01](phase-01-schema-operation.md) |
| 02 | Agent Templates + Init | done | 1h | [phase-02-agent-templates.md](phase-02-agent-templates.md) |
| 03 | Docs | done | 0.5h | [phase-03-docs.md](phase-03-docs.md) |

## Dependencies

```
Phase 01 ──→ Phase 02 ──→ Phase 03
```

## Key Decisions

1. **Single config.yaml** — register appends to the shared file, not per-project configs
2. **Source tracking** — each topic/feed tagged with `registered_by: "<project>"` for traceability
3. **Dedup on register** — skip topics with identical name or >80% keyword overlap
4. **Idempotent** — re-registering same project updates existing entries, doesn't duplicate
5. **Unregister support** — `unregister <project>` removes all entries tagged with that project
6. **No auto-discover trigger** — register only updates config, user decides when to discover

## Validation Log

### Session 1 — 2026-04-07

**Q1: Project identification — path vs name resolution?**
→ **A: Always use CWD** — `register` with no argument uses current project. Simpler, covers 95% use case.
Impact: Phase 01 (simplify step 1 of Register operation)

**Q2: YAML write strategy — how does the agent modify config.yaml safely?**
→ **A: Read → edit_file with surgical insert** — agent reads, finds `topics:` array, appends entry.
Impact: Phase 01 (add YAML write safety rule to schema)

**Q3: Should `register` auto-trigger `discover` afterward?**
→ **A: No auto-trigger** — user explicitly runs discover after register. Current plan confirmed.
Impact: None — already the plan's approach.

**Q4: Keyword overlap threshold — 80% is specific. How is it calculated?**
→ **A: Jaccard similarity** — |intersection| / |union| > 0.8. Standard, well-defined.
Impact: Phase 01 (specify Jaccard in dedup policy)
