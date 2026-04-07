# LLM Wiki — Project Overview & Product Development Requirements

## Executive Summary

**LLM Wiki** is a personal knowledge management system where LLM agents incrementally build and maintain a persistent, interlinked wiki. Unlike RAG (Retrieval-Augmented Generation) systems that re-derive knowledge on every query, LLM Wiki compiles knowledge once and keeps it current through structured, cross-referenced markdown pages.

**Philosophy:** "Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase." (Andrej Karpathy)

## Product Vision

Create a knowledge base that compounds over time rather than staying static. The wiki grows richer with every source added and every question asked. Humans abandon wikis due to maintenance burden; LLMs don't get bored.

## Core Problems Solved

| Problem | RAG Approach | LLM Wiki Approach |
|---------|--------------|-------------------|
| Knowledge reuse | Re-derive on every query | Compiled once, updated incrementally |
| Cross-references | Not maintained | Explicit `[[wikilinks]]` between pages |
| Contradictions | Missed | Detected during lint operations |
| Synthesis | Generated ad-hoc | Maintained as durable pages |
| Maintenance burden | Human curator (unsustainable) | LLM agent (scalable) |

## Functional Requirements

### Core Operations

1. **Ingest** — Read source → create/update wiki pages → maintain index + log
2. **Query** — Search wiki → read pages → synthesize answer with citations
3. **Lint** — Detect orphans, broken links, contradictions, gaps, stale claims
4. **Discover** — Search web/feeds/GitHub → dedup candidates → queue for approval
5. **Run** — Full cycle: discover → approve → ingest → lint (max 2 rounds)
6. **Status** — Dashboard: page counts, health metrics, last operations
7. **Register** — Scan project → propose topics/feeds → append to config
8. **Unregister** — Remove project-registered topics/feeds from config

### Architecture Layer

Three immutable layers:

| Layer | Directory | Who writes | Purpose |
|-------|-----------|-----------|---------|
| Sources | `sources/` | Human | Raw, immutable source documents |
| Wiki | `wiki/` | LLM agents | Structured, interlinked knowledge |
| Schema | `wiki-schema.md` | Human + LLM | Conventions, operations, rules |

### Page Types

| Type | Directory | Example |
|------|-----------|---------|
| Entity | `wiki/entities/` | Person, organization, product |
| Concept | `wiki/concepts/` | Idea, framework, pattern, technique |
| Summary | `wiki/summaries/` | Per-source distillation |
| Synthesis | `wiki/syntheses/` | Cross-source analysis |
| Decision | `wiki/decisions/` | Architecture/business decision record |

### Shared Knowledge Service

The wiki repo is a central knowledge base. Agents in other project repos access it via qmd MCP server to search, read, and write wiki pages. Enables cross-project knowledge reuse.

## Non-Functional Requirements

### Performance & Scale

- **Initial:** ~50 pages, ~100 sources
- **Target:** 500+ pages, 1000+ sources over time
- **Search latency:** <1s for qmd queries (BM25 + vector search)
- **Concurrent reads:** Safe (search, query, status operations don't conflict)
- **Write operations:** Single-writer serialized (ingest, lint, discover, register, unregister)

### Reliability & Data Integrity

- **Immutable sources:** Files in `sources/` never overwritten
- **Append-only log:** `wiki/log.md` records all operations chronologically
- **Git tracking:** All wiki state in git for history and recovery
- **Discovery state:** `.discoveries/` tracks candidates, dedup registry, gaps
- **Cross-OS support:** Windows, macOS, Linux, WSL with same behavior

### Usability

- **Low friction discovery:** Config-driven (no code changes needed)
- **Graceful degradation:** Operations work with or without web_search/http_fetch
- **Idempotent:** Re-running operations doesn't duplicate entries
- **Obsidian integration:** Optional — human browsing, graph view, plugins

### Maintainability

- **Single source of truth:** `wiki-schema.md` defines all conventions + operations
- **Agent-agnostic:** No tool-specific instructions (works with Amp, Claude, Cursor, OpenCode)
- **Skill idempotence:** Agent templates use `<!-- llm-wiki:start -->` markers for surgery
- **Configuration as code:** `config.yaml` drives discovery behavior

## Technical Constraints

### Required

- **Node.js ≥ 22** — for qmd search engine
- **qmd** — markdown search with BM25 + vector search + MCP server
- **Git** — version control for wiki state
- **File I/O** — reading sources and writing wiki pages

### Optional

- **web_search capability** — web_search strategy in discover operation
- **http_fetch capability** — feed polling and GitHub watching
- **Obsidian** — human browsing (not required for LLM operations)
- **Community plugins** — Dataview, Obsidian Git, Marp Slides

### Capability Model (Graceful Degradation)

| Capability | Purpose | Required | Graceful Fallback |
|------------|---------|----------|-------------------|
| web_search | Find new sources | No | Skip web_search strategy |
| http_fetch | Download content | No | Skip feed/GitHub strategies |
| file_read | Read config, sources, wiki | Yes | Operation fails |
| file_write | Write wiki, state | Yes | Operation fails |
| qmd_query | Semantic search + dedup | Yes | Fall back to file scan |

## Acceptance Criteria

### Ingest Operation
- Source file is read and analyzed
- Wiki pages are created or updated with proper frontmatter
- `[[wikilinks]]` connect related pages
- `wiki/index.md` is updated with new entries
- `wiki/log.md` records the operation

### Discover Operation
- Web search returns candidates (if capable)
- 3-layer dedup reduces false positives
- Candidates scored and ranked
- Candidates queued to `.discoveries/inbox.json`
- User can approve/reject before ingest

### Lint Operation
- Orphan pages detected
- Broken `[[wikilinks]]` identified
- Frontmatter completeness checked
- Contradictions flagged across pages
- Stale claims detected (old updated dates vs recent sources)
- Knowledge gaps identified and written to `gaps.json`

### Cross-Project Integration
- Agent in project repo can query wiki via qmd MCP server
- Results include citations with `[[wikilinks]]`
- Project can register topics (executed, recorded in log)
- Project can unregister topics (removed, recorded in log)

## Success Metrics

### Quantitative

- **Knowledge compilation:** Reduce duplicate source processing from N articles to 1 wiki page
- **Query speed:** <1s median latency for wiki search
- **Content density:** Average 2-3 wiki pages per ingested source
- **Reuse rate:** % of wiki pages linked from multiple pages (target: >40%)
- **Stale detection:** Lint catches >80% of pages with updated date older than 90 days

### Qualitative

- **Synthesis quality:** Cross-source pages reflect true conflicts/consensus
- **Search relevance:** Query results ranked by semantic similarity, not just keyword match
- **Discoverability:** Graph view reveals topic clusters and knowledge gaps
- **Maintenance burden:** Zero human curation overhead for ingesting sources

## Roadmap & Milestones

### Phase 1: Foundation (Complete)
- [x] Three-layer architecture (sources, wiki, schema)
- [x] 8 core operations defined in schema
- [x] Cross-OS setup script (init.mjs)
- [x] qmd integration for search
- [x] Agent template system (4 agents)
- [x] Discovery state management (.discoveries/)
- [x] Multi-project registration system

### Phase 2: Content & UX (In Progress)
- [x] Obsidian setup guide
- [x] Plugin recommendations (Dataview, Git, Marp)
- [x] Initial wiki content (TablePro project)
- [ ] Query output formats (markdown, tables, slides, charts)
- [ ] Interactive dashboard (status page)
- [ ] Knowledge gap suggestions

### Phase 3: Discovery Automation (Complete)
- [x] Config-driven discovery (web_search, feed_poll, github_watch)
- [x] Intelligent candidate ranking (topic_relevance × recency × novelty)
- [x] Dedup by semantic similarity (>0.9 = duplicate, <0.6 = novel)
- [x] Auto-ingestion after lint (2-round loop)

### Phase 4: Agent Ecosystem (Future)
- [ ] Specialized agents: researcher, synthesizer, curator
- [ ] Multi-agent orchestration
- [ ] Cross-wiki federation (multiple wikis, shared topics)
- [ ] Analytics: contributor metrics, knowledge growth curves

## Dependencies & Integrations

### External
- **Node.js ≥ 22** — language runtime
- **qmd** — search engine and MCP server
- **Git** — version control
- **Agent platforms** — Amp, Claude, OpenCode, Cursor

### Internal
- `wiki-schema.md` — All conventions and operations
- `init.mjs` — Setup and update script
- `config.example.yaml` — Discovery configuration template
- `agent_templates/` — Per-agent instruction files + MCP config

## Open Questions & Future Considerations

1. **Horizontal scaling:** Can wiki support 10K+ pages with qmd performance?
2. **Merge conflicts:** How to handle concurrent writes from multiple agents?
3. **Versioning:** Should we track page version history separately from git?
4. **Access control:** Multi-user wikis with role-based read/write permissions?
5. **Multi-language:** Support wikis in languages other than English?
6. **Synthesis evaluation:** How to measure synthesis quality automatically?

---

**Document status:** Version 1.0 — Foundation complete, active development on discovery automation.  
**Last updated:** 2026-04-07  
**Next review:** After Phase 2 completion
