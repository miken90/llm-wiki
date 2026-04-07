# Phase 02 — Schema Operations (Discover, Run, Status)

> Parent: [plan.md](plan.md) | Depends on: [Phase 01](phase-01-config-state-infra.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P1
- **Status:** pending
- **Effort:** 2.5h

Add three new operations to `wiki-schema.md`: Discover, Run, Status. This is the core of the feature — all behavior lives here, templates just reference it.

## Key Insights

- Schema must be agent-agnostic — describe capabilities, not tool names
- qmd is the differentiator — use it for dedup and coverage estimation
- Separate fetching (strategies) from ranking (gap-aware scoring)
- Discovery writes to inbox only, not directly to sources/wiki

## Requirements

1. **Operation — Discover**: fetch candidates → dedup → score → queue to inbox
2. **Operation — Run**: discover → approve/ingest inbox → lint → optional 2nd round
3. **Operation — Status**: dashboard of wiki health and discovery state
4. **Candidate approval model**: pending → approved → ingested lifecycle
5. **Dedup policy**: 3-layer (URL → title → qmd semantic)
6. **Capability abstraction**: define capabilities, not tool names

## Architecture

### Capability Model (agent-agnostic)

Define these abstract capabilities in schema — each template maps to native tools:

| Capability | Purpose | Required? |
|------------|---------|-----------|
| `web_search` | Find new sources by keyword | Optional |
| `http_fetch` | Download article content | Optional |
| `file_read` | Read config, state, sources | Required |
| `file_write` | Write sources, wiki, state | Required |
| `qmd_query` | Semantic search for dedup/gaps | Required |

### Discover Operation Flow

```
1. Read config.yaml → topics, strategies, feeds
2. Read .discoveries/gaps.json → knowledge gaps from lint
3. Read .discoveries/history.json → dedup registry
4. For each enabled strategy:
   a. web_search: search by topic keywords (if capable)
   b. feed_poll: check RSS URLs, known endpoints (if capable)
   c. github_watch: check tracked repos/orgs (if capable)
5. For each candidate found:
   a. URL exact match against history → skip if found
   b. Normalized title match against history → skip if found
   c. qmd semantic search against wiki + sources:
      - High similarity (>0.9) → duplicate, skip
      - Medium similarity (0.6-0.9) → flag, lower score
      - Low similarity (<0.6) → novel, boost score
   d. Score = topic_relevance × recency × gap_match × novelty
6. Write candidates to .discoveries/inbox.json (status: pending)
7. Report: N candidates found, M after dedup, top candidates listed
8. Append to wiki/log.md
```

### Run Operation Flow

<!-- Updated: Validation Session 1 -->
```
1. Run discover (if inbox is empty or stale)
2. Present inbox as numbered list, ask: "Approve all / select by number / reject all?"
3. For each approved candidate:
   a. Fetch content (if not already fetched)
   b. Save to sources/articles/YYYY-MM-DD-<slug>.md with frontmatter
   c. Run standard ingest operation
   d. Update .discoveries/history.json (status: ingested)
   e. Remove from inbox.json
4. For rejected candidates:
   a. Move to history.json (status: rejected)
   b. Remove from inbox.json
5. Re-index qmd: update + embed (once, after all ingests)
6. Run lint
7. If lint finds critical gaps AND this is round 1:
   a. Update gaps.json
   b. Run discover again (round 2, max_candidates reduced)
   c. Repeat approval + ingest
8. Generate summary report → outputs/run-YYYY-MM-DD.md
9. Append to wiki/log.md
```

**Max 2 rounds** to prevent infinite loops.

### Status Operation Flow

```
1. Count wiki pages by type (entities, concepts, summaries, syntheses, decisions)
2. Count sources in sources/
3. Read .discoveries/inbox.json → pending/approved counts
4. Read .discoveries/gaps.json → open gaps count
5. Read wiki/log.md → extract last discover, ingest, lint dates
6. Check qmd status
7. Assess agent capabilities (web_search available? http_fetch?)
8. Report health: Good | Warning | Needs Attention
```

### Discovered Source Frontmatter

```yaml
---
title: "Article Title"
source_url: "https://example.com/article"
author: "Author Name"
date_published: 2026-04-01
date_ingested: 2026-04-07
format: web-article
discovered_by: web_search
topic: "AI Agents"
---
```

## Related Code Files

- `wiki-schema.md` — main file to edit

### State Recovery

<!-- Updated: Validation Session 1 -->
When reading `.discoveries/*.json`, validate structure on load. If malformed or unreadable, reset to empty defaults (`{ "version": 1, ... }`) and warn user. Never fail a discovery operation due to corrupted state.

### Config Dependency

<!-- Updated: Validation Session 1 -->
`config.yaml` is **optional**. If absent, discover/run use sensible defaults (empty topics = skip web_search, no feeds = skip feed_poll). Existing operations (ingest, query, lint) remain config-free.

## Implementation Steps

1. Add "Configuration" section to wiki-schema.md:
   - Document config.yaml location (`{{WIKI_ROOT}}/config.yaml`)
   - Document .discoveries/ location and JSON contracts
   - Reference config.example.yaml for full schema
   - State that config/state live in wiki repo only
   - State that config.yaml is **optional** — operations degrade gracefully without it

2. Add "Capability Model" section:
   - Define abstract capabilities table
   - State: unsupported capability → skip strategy, don't fail
   - State: status should report active capabilities

3. Add "Operation — Discover" section:
   - Trigger: "discover" or "find new sources"
   - Steps 1-8 as defined above
   - Rules: max candidates per config, dedup policy, gap-aware scoring
   - Output: inbox.json updated, log.md appended

4. Add "Operation — Run" section:
   - Trigger: "run" or "run full cycle"
   - Steps 1-9 as defined above
   - Rules: max 2 rounds, approval required (unless auto_ingest), re-index once
   - Output: run report, log.md appended

5. Add "Operation — Status" section:
   - Trigger: "status" or "wiki status"
   - Steps 1-8 as defined above
   - Output format (dashboard)

6. Add "Candidate Lifecycle" subsection:
   - State diagram: pending → approved → ingested | rejected | failed
   - Approval: user confirms in interactive session
   - Auto-ingest: only if config.auto_ingest = true

7. Update existing "Operation — Lint" section:
   <!-- Updated: Validation Session 1 -->
   - Add step: if `.discoveries/` exists, write detected knowledge gaps to `.discoveries/gaps.json`
   - This enables the self-improving loop: lint → gaps → discover → ingest

8. Add "State Recovery" subsection:
   <!-- Updated: Validation Session 1 -->
   - Validate JSON on read, reset to empty defaults if malformed, warn user

9. Update "Concurrency" section:
   - Add discover, run to single-writer operations list

10. Update "Quick Reference" table:
   - Add config.yaml, .discoveries/ entries

## Todo

- [ ] Add Configuration section to wiki-schema.md
- [ ] Add Capability Model section
- [ ] Add Operation — Discover
- [ ] Add Operation — Run
- [ ] Add Operation — Status
- [ ] Add Candidate Lifecycle subsection
- [ ] Update existing Lint operation — add gaps.json output step
- [ ] Add State Recovery subsection
- [ ] Update Concurrency section
- [ ] Update Quick Reference table
- [ ] Verify all operations reference config.yaml and .discoveries/ contracts
- [ ] Verify config.yaml is documented as optional

## Success Criteria

- wiki-schema.md contains complete Discover, Run, Status operations
- All operations are agent-agnostic (no tool-specific names)
- Dedup policy is explicit and 3-layered
- Candidate lifecycle is fully defined
- Capability model is documented
- Cross-project path rules are stated (WIKI_ROOT)

## Risk Assessment

| Component | Risk | Mitigation |
|-----------|------|------------|
| Schema complexity | MEDIUM — longest addition to wiki-schema.md | Keep each operation ≤40 lines, reference config/state contracts |
| Agent interpretation | MEDIUM — different agents may interpret differently | Be explicit about steps, avoid ambiguous language |
| Dedup precision | MEDIUM — semantic similarity thresholds may need tuning | Start conservative (0.9 = duplicate), allow user override |

## Security Considerations

- Discovered URLs should be validated (no file:// or local paths)
- Fetched content should be sanitized (no script injection into markdown)

## Next Steps

→ Phase 03: Agent templates map capabilities to native tools
