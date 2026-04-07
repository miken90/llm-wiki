# Phase 01 — Schema Operation + Config Extensions

> Parent: [plan.md](plan.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P2
- **Status:** pending
- **Effort:** 1.5h

Add `Operation — Register` to wiki-schema.md and extend config.yaml schema to support source tracking.

## Key Insights

- Register is a **config-write** operation, not a wiki-write — it modifies config.yaml only
- Must work from any project repo via the agent (cross-project absolute paths)
- Agent scans the project to infer topics — similar to how "ingest project" scans for docs
- `registered_by` field enables clean unregister and audit trail

## Architecture

### Extended config.yaml schema

```yaml
topics:
  - name: "React Performance"
    keywords: ["RSC", "Suspense", "hydration"]
    priority: high
    registered_by: "my-react-app"          # NEW — tracks source project
    registered_at: "2026-04-07"            # NEW — when registered

feeds:
  rss:
    - url: "https://react.dev/blog/rss.xml"
      name: "React Blog"
      registered_by: "my-react-app"        # NEW
  github_repos:
    - repo: "facebook/react"
      watch: [releases]
      registered_by: "my-react-app"        # NEW
```

Fields `registered_by` and `registered_at` are **optional** — manually added topics don't need them. This preserves backward compatibility.

### Operation — Register

**Trigger:** "register `<project>`" or "register topics from `<project>`"

**Steps:**

1. Identify the project:
   a. Use current working directory as the project (agent is already in the project repo)
   b. Detect project name from `package.json` name field, directory name, or git remote
2. Scan the project for topic signals:
   a. `README.md` → extract technology stack, domain keywords
   b. `package.json` / `Cargo.toml` / `go.mod` → extract dependencies as keyword hints
   c. `docs/` → extract domain concepts
   d. Existing wiki pages about this project → extract tags
3. Propose topics to user:
   ```
   Detected topics for <project>:
   | # | Topic | Keywords | Priority |
   | 1 | React Performance | RSC, Suspense, hydration | high |
   | 2 | TypeScript Patterns | generics, type inference | medium |
   ...
   Approve all / select by number / edit / skip?
   ```
4. User confirms or edits
5. Read `config.yaml` (create from `config.example.yaml` if absent)
6. For each approved topic:
   a. Check dedup: skip if topic with same name exists AND `registered_by` matches
   b. Check keyword overlap: Jaccard similarity |intersection| / |union| > 0.8 with existing topic → warn, let user decide
   c. Append to `topics:` array with `registered_by` and `registered_at`
7. Optionally propose feeds:
   a. If project has known blog/RSS → suggest RSS feed
   b. If project is a GitHub repo → suggest github_repos watch
8. Write updated `config.yaml` — use surgical edit (find `topics:` array, append entry), never rewrite entire file
9. Report: N topics added, M feeds added, K skipped (already registered)
10. Append to `wiki/log.md`: `## [YYYY-MM-DD] register | <project> — N topics, M feeds`

### Operation — Unregister

**Trigger:** "unregister `<project>`" or "remove `<project>` topics"

**Steps:**

1. Read `config.yaml`
2. Find all entries with `registered_by: "<project>"`
3. Present list to user for confirmation
4. Remove confirmed entries from config.yaml
5. Write updated `config.yaml`
6. Append to `wiki/log.md`: `## [YYYY-MM-DD] unregister | <project> — N topics, M feeds removed`

**Note:** Only removes entries with matching `registered_by`. Manually added topics are never touched.

## Related Code Files

- `wiki-schema.md` — add Register + Unregister operations
- `config.example.yaml` — add `registered_by`, `registered_at` comments

## Implementation Steps

1. Add "Operation — Register" section to wiki-schema.md (after Status, before Ingest)
2. Add "Operation — Unregister" section to wiki-schema.md (after Register)
3. Update Configuration section — mention `registered_by` as optional tracking field
4. Update `config.example.yaml` — add commented examples with `registered_by`
5. Update Concurrency section — register/unregister are single-writer config operations
6. Update Quick Reference table

## Todo

- [ ] Add Operation — Register to wiki-schema.md
- [ ] Add Operation — Unregister to wiki-schema.md
- [ ] Update Configuration section with registered_by docs
- [ ] Update config.example.yaml with registered_by examples
- [ ] Update Concurrency + Quick Reference

## Success Criteria

- wiki-schema.md contains complete Register and Unregister operations
- Operations are agent-agnostic (no tool-specific names)
- Dedup policy is explicit (name match + keyword overlap)
- registered_by field is documented as optional
- Backward compatible — existing config.yaml without registered_by still works

## Risk Assessment

| Component | Risk | Mitigation |
|-----------|------|------------|
| YAML write correctness | MEDIUM — agents may produce invalid YAML | Use surgical edit_file insert, not full rewrite. Validate YAML structure before write. |
| Topic inference quality | LOW — user confirms before write | Approval step prevents bad topics |
| Keyword dedup precision | LOW — Jaccard is well-defined | Standard metric, 0.8 threshold is tunable |

## Next Steps

→ Phase 02: Agent templates add register/unregister triggers
