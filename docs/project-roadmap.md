# LLM Wiki — Project Roadmap & Development Timeline

## Current Status

**Overall Progress:** Phase 2 (Content & UX) — In Progress

**Completion estimate:** Foundation 100% | Content & UX 40% | Discovery Automation 100% | Agent Ecosystem 0%

## Phase 1: Foundation (Complete ✓)

**Objective:** Build the core architecture and cross-OS setup.

**Completion:** 2026-04-07

### Milestones Achieved

- [x] Three-layer architecture defined (sources, wiki, schema)
- [x] wiki-schema.md written (566 LOC — single source of truth)
- [x] 8 core operations designed (ingest, query, lint, discover, run, status, register, unregister)
- [x] Cross-OS setup script (init.mjs — 500 LOC)
  - [x] Windows, macOS, Linux, WSL support
  - [x] qmd auto-detection and installation
  - [x] Agent skill installation (4 agents)
  - [x] MCP config merging (idempotent)
  - [x] Update detection (`--check` mode)
- [x] Discovery state infrastructure (.discoveries/)
  - [x] history.json (dedup registry)
  - [x] inbox.json (candidate queue)
  - [x] gaps.json (knowledge gaps)
- [x] Agent template system (4 agents ready)
  - [x] Amp (full SKILL.md)
  - [x] Claude (CLAUDE.snippet.md)
  - [x] OpenCode (AGENTS.snippet.md)
  - [x] Cursor (.cursorrules.snippet)
- [x] Multi-project registration system
  - [x] Register operation designed
  - [x] Unregister operation designed
  - [x] Topic dedup logic (Jaccard similarity)
- [x] Git version control setup
- [x] Obsidian vault initialized

## Phase 2: Content & UX (In Progress - 40%)

**Objective:** Build initial wiki content and improve user experience.

**Target completion:** 2026-05-15

### Current Work

- [x] Documentation suite created
  - [x] docs/project-overview-pdr.md (PDR + roadmap)
  - [x] docs/codebase-summary.md (architecture + inventory)
  - [x] docs/code-standards.md (naming, frontmatter, conventions)
  - [x] docs/system-architecture.md (data flows, operations)
  - [ ] docs/deployment-guide.md (setup + troubleshooting)
- [x] Obsidian setup guide (README.md section)
- [x] Plugin recommendations documented
  - [x] Dataview (dynamic tables)
  - [x] Obsidian Git (auto-sync)
  - [x] Marp Slides (presentations)
- [x] Initial wiki content ingested
  - [x] Entity, concept, summary, decision pages
  - [x] wiki/index.md auto-maintained
  - [x] wiki/log.md operations log

### Remaining Work

- [ ] Query output formats
  - [ ] Markdown page templates
  - [ ] Comparison table generator
  - [ ] Marp slide deck generator
  - [ ] Chart/visualization templates
- [ ] Interactive dashboard
  - [ ] Status page (page counts, health metrics)
  - [ ] Lint report dashboard
  - [ ] Discovery inbox UI
  - [ ] Knowledge gap suggestions
- [ ] Knowledge gap analysis
  - [ ] Lint identifies gaps (done in schema)
  - [ ] Suggest new questions (TODO)
  - [ ] Automated gap fill (TODO)

### Success Criteria

- [ ] At least 50 wiki pages across multiple projects
- [ ] Zero broken `[[wikilinks]]` (lint passes)
- [ ] >40% of pages have 3+ cross-references
- [ ] Query operation returns ranked results with citations
- [ ] Obsidian vault is usable for human browsing

## Phase 3: Discovery Automation (Complete ✓)

**Objective:** Implement autonomous source discovery and ingestion.

**Completion:** 2026-04-07

### Milestones Achieved

- [x] Config-driven discovery
  - [x] Web search strategy (web_search capability)
  - [x] Feed polling (http_fetch capability)
  - [x] GitHub watching (http_fetch capability)
  - [x] Graceful degradation (skip unavailable strategies)
- [x] Intelligent candidate ranking
  - [x] Topic relevance scoring (BM25)
  - [x] Recency weighting (prefer recent sources)
  - [x] Gap matching (boost candidates matching known gaps)
  - [x] Novelty scoring (semantic dedup)
- [x] Advanced dedup
  - [x] URL exact match (100%)
  - [x] Normalized title match (edit distance)
  - [x] qmd semantic similarity (0.9/0.6 thresholds)
- [x] Auto-ingestion with user approval
  - [x] Run operation: discover → approve → ingest → lint
  - [x] 2-round loop (discover → ingest → lint → discover)
  - [x] Safety limits (max_candidates_per_run)
- [x] Enhanced lint operation
  - [x] Lint → gaps.json → discover → ingest → lint loop
  - [x] Contradiction detection (claim vs counter-claim)
  - [x] Stale claims flagging (updated > 90 days ago)
  - [x] Missing cross-reference suggestions

### Success Criteria

- [ ] Web search discovers 5+ relevant sources per topic
- [ ] Dedup reduces false positives by >80%
- [ ] Run operation completes without user intervention (except approval)
- [ ] Wiki grows by 100+ pages after 1 month of autodiscovery

## Phase 4: Agent Ecosystem (Future - 0%)

**Objective:** Multi-agent orchestration and specialized roles.

**Target completion:** 2026-08-31

### Planned Features

- [ ] Specialized agents
  - [ ] Researcher — deep-dive sources, extract key insights
  - [ ] Synthesizer — cross-source analysis, identify conflicts
  - [ ] Curator — lint, dedup, maintain index
  - [ ] Discoverer — focused source hunting by topic
- [ ] Multi-agent orchestration
  - [ ] Agent team coordination (task queue, state sharing)
  - [ ] Conflict resolution (merge conflicting edits)
  - [ ] Quality review (curator reviews synthesizer work)
- [ ] Cross-wiki federation
  - [ ] Multiple wiki repos, shared knowledge base
  - [ ] Topic namespacing (wiki1/topic vs wiki2/topic)
  - [ ] MCP gateway for cross-wiki search
  - [ ] Artifact dedup across wikis
- [ ] Analytics & metrics
  - [ ] Contributor metrics (who added which pages)
  - [ ] Knowledge growth curves (pages/week, sources/month)
  - [ ] Gap closure tracking (gaps → ingests → resolved)
  - [ ] Synthesis quality dashboard

### Success Criteria

- [ ] 3+ specialized agents working in parallel
- [ ] Cross-wiki search finds results from multiple wikis
- [ ] Analytics show consistent knowledge growth
- [ ] Zero manual conflict resolution needed

## Dependencies & Blockers

### Current Blockers
- **None** — Phase 1 & 2 are all-clear

### Phase 3 Blockers
- qmd MCP server must be stable (currently verified working)
- Web search API availability (graceful fallback if missing)
- GitHub API rate limits (will implement caching)

### Phase 4 Blockers
- Multi-agent orchestration requires formal protocol (in development)
- Cross-wiki federation needs shared schema version (design TBD)

## Release Timeline

| Date | Phase | Deliverables | Status |
|------|-------|--------------|--------|
| 2026-04-07 | Phase 1 | Core architecture, setup script, agent templates, schema | **COMPLETE** |
| 2026-05-15 | Phase 2 | Wiki content (50+ pages), query formats, documentation | **IN PROGRESS** |
| 2026-04-07 | Phase 3 | Autodiscovery, dedup, 2-round run loop, register/unregister | **COMPLETE** |
| 2026-08-31 | Phase 4 | Multi-agent, cross-wiki federation, analytics | **FUTURE** |

## Resource Requirements

### Compute
- **Node.js ≥ 22** — required
- **qmd indexing** — ~30s for 100 pages, <5s for incremental updates
- **Vector embedding** — ~100MB for 500 pages (disk)
- **Memory** — <500MB for qmd server + wiki operations

### Human Time (Estimated)

| Phase | Est. Hours | Allocation |
|-------|-----------|------------|
| Phase 1 | 80 | Complete — archive |
| Phase 2 | 60 | 40% done — 36 hours remaining |
| Phase 3 | 100 | Planned — 100 hours estimated |
| Phase 4 | 150 | Future — 150 hours estimated |
| **Total** | **390** | **136 hours remaining** |

## Success Metrics

### Phase 1 (Foundation)
- [x] Setup script works cross-platform without errors
- [x] 4 agent templates installable and functional
- [x] wiki-schema.md is complete and unambiguous
- [x] Git tracking works correctly

### Phase 2 (Content & UX)
- [ ] 50+ wiki pages with zero broken links
- [ ] >40% of pages have 3+ cross-references
- [ ] All query operations return ranked results
- [ ] Obsidian vault is searchable and navigable

### Phase 3 (Discovery)
- [ ] 100+ new pages ingested via autodiscovery
- [ ] Dedup effectiveness >80% (false positives <20%)
- [ ] Run operation completes 2-round cycle in <10 minutes
- [ ] Knowledge gaps reduced by >50% per run

### Phase 4 (Ecosystem)
- [ ] 3+ agents working without conflicts
- [ ] Cross-wiki federation handles 1000+ total pages
- [ ] Analytics show consistent growth metrics
- [ ] Zero manual conflict resolution needed

## Known Limitations & Trade-Offs

### Current Limitations

1. **Single-writer model** — Only one agent performs write operations at a time. Prevents conflicts but limits parallelism.
   - **Mitigation:** Phase 4 multi-agent orchestration with formal locking protocol

2. **No horizontal scaling** — qmd indexes everything in one process. At 10K+ pages, may need distributed search.
   - **Mitigation:** Phase 4+ federation model (multiple wikis, shared gateway)

3. **Manual dedup thresholds** — Similarity thresholds (0.9/0.6) tuned by hand, not learned.
   - **Mitigation:** Phase 3 fine-tuning based on real discovery results

4. **No access control** — Single shared wiki, no read/write permissions.
   - **Mitigation:** Phase 4 multi-user wiki with role-based access

### Design Trade-Offs

1. **Append-only wiki pages** vs. "overwrite for clarity"
   - **Chosen:** Append-only preserves history, prevents losing information
   - **Cost:** Pages may become longer, require better structure

2. **Git version control** vs. "database with real-time sync"
   - **Chosen:** Git for simplicity, recovery, offline-first
   - **Cost:** Conflict resolution manual, not atomic across layers

3. **Config-driven discovery** vs. "learned preferences"
   - **Chosen:** Explicit config (predictable, transparent)
   - **Cost:** Requires manual topic maintenance

## Open Questions

1. **How to measure synthesis quality?** 
   - Current: Manual review by curator
   - Desired: Automated contradiction detection, consensus metrics

2. **Can we reach 10K+ pages with qmd?**
   - Hypothesis: Yes, with vector embeddings and incremental indexing
   - Testing: Phase 3 will validate at 500+ pages

3. **How to handle merges in multi-wiki federation?**
   - Current: Not addressed
   - Future: Formal merge protocol (similar to git, but for wiki semantics)

4. **Should we version wiki pages separately from git commits?**
   - Current: Git commits are the version log
   - Consideration: Separate page version history for archaeology?

5. **Can LLMs maintain consistency without central curator?**
   - Current: Single curator role (human or agent)
   - Future: Decentralized consensus (multiple agents vote on changes)

## Maintenance & Review Schedule

- **Weekly:** Lint wiki (detect gaps, broken links)
- **Bi-weekly:** Review discovery results, tune topic keywords
- **Monthly:** Analyze growth metrics, update roadmap
- **Quarterly:** Major refactors (schema updates, agent training)

---

**Roadmap status:** Version 1.0 — Phase 1 complete, Phase 2 in progress.  
**Last updated:** 2026-04-07  
**Next milestone:** Phase 2 completion by 2026-05-15
