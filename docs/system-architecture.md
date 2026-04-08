# LLM Wiki — System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   wiki-schema.md                         │
│        (single source of truth for conventions)          │
└─────────────────────┬───────────────────────────────────┘
                      │ governs & validates
          ┌───────────┼───────────┐
          ▼           ▼           ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │  sources/    │ │   wiki/      │ │  outputs/    │
   │  (raw, immut)│→│ (LLM-maint)  │→│ (reports)    │
   └──────────────┘ └──────────────┘ └──────────────┘
            ▲              ▲
            │              │ search/read/write via qmd CLI
    human curates    agents use operations
            │              │
   ┌────────┴──────────────┴────────┐
   │   Agent Fleet (Amp, Claude,    │
   │    OpenCode, Cursor)           │
   │   in any project repo          │
   └────────────────────────────────┘
```

## Three-Layer Architecture

### Layer 1: Sources (`sources/`)

**Purpose:** Raw, immutable source documents — the knowledge input.

**What lives here:**
- Web articles (auto-discovered via discovery operations)
- Project documentation (manually ingested from other repos)
- Research papers, books chapters, meeting transcripts
- Attachments and images (in `sources/assets/`)

**Immutability rules:**
- Files in `sources/` are never modified after creation
- New sources can be added via ingest operation
- All sources must have frontmatter with metadata (title, source_url, date_published, etc.)
- Deduplication prevents ingesting the same article twice

**Format:** Markdown or plaintext with YAML frontmatter.

**Ownership:** Humans curate what to ingest; LLM agents index and reference.

### Layer 2: Wiki (`wiki/`)

**Purpose:** Structured, interlinked knowledge pages maintained by LLM agents.

**What lives here:**
- **index.md** — Auto-maintained catalog of all pages
- **log.md** — Append-only operation log
- **entities/** — People, orgs, products (1 per page)
- **concepts/** — Ideas, frameworks, patterns (1 per page)
- **summaries/** — Per-source distillations
- **syntheses/** — Cross-source analysis
- **decisions/** — Architecture/business decision records

**Key characteristics:**
- Structured via page type (entity, concept, summary, synthesis, decision)
- Interconnected via `[[wikilinks]]`
- YAML frontmatter on every page (title, type, sources, created, updated, tags)
- One topic per page (atomic notes)
- Append-only updates (never overwrite existing content)

**Ownership:** LLM agents write via ingest operations; humans curate via lint feedback.

### Layer 3: Outputs (`outputs/`)

**Purpose:** Durable query artifacts — reports, comparisons, slide decks.

**What lives here:**
- Markdown reports from query operations
- Marp slide decks (for presentations)
- Comparison tables (for analysis)
- Charts and visualizations

**Key characteristics:**
- Generated from wiki pages (not part of wiki structure)
- Timestamped and slug-named (e.g., `2026-04-07-rag-vs-wiki-comparison.md`)
- Can be deleted without losing knowledge (wiki pages are the source of truth)
- Optional — not required for core operations

## Schema Layer (`wiki-schema.md`)

**The single source of truth** — 566 LOC defining all conventions, rules, and operations.

**Governs:**
- Page conventions (frontmatter, types, content rules)
- Source rules (immutability, frontmatter)
- Index and log rules (auto-maintenance)
- 8 operations (ingest, query, lint, discover, run, status, register, unregister)
- Discovery system (strategies, dedup, candidate lifecycle)
- Capability model (graceful degradation)
- Concurrency rules (single-writer)

**Every agent reads this first** — no tool-specific instructions, agent-agnostic.

## Operation Flows

### Ingest Operation

```
Source file (sources/*)
        │
        ├→ Read & analyze
        │
        ├→ Extract entities, concepts, claims, decisions
        │
        ├→ Create/update wiki pages
        │   ├─ wiki/summaries/<slug>.md
        │   ├─ wiki/entities/<entity>.md
        │   ├─ wiki/concepts/<concept>.md
        │   ├─ wiki/decisions/<decision>.md
        │   └─ wiki/syntheses/<synthesis>.md (if multi-topic)
        │
        ├→ Add [[wikilinks]] between related pages
        │
        ├→ Update wiki/index.md (add new entries)
        │
        └→ Append to wiki/log.md
```

**Single operation:** Creates/updates 10–15 pages per source.

### Query Operation

```
User question
        │
        ├→ Search wiki via qmd ("semantic + BM25")
        │
        ├→ Read top matching pages
        │
        ├→ Synthesize answer
        │
        ├→ Cite with [[wikilinks]]
        │
        └→ Output: Markdown | Table | Slide deck | Chart
           (optionally filed back to wiki/outputs/)
```

**No wiki modification** — read-only operation.

### Lint Operation

```
Lint sweep
        │
        ├→ Check all pages in index.md exist ✓
        ├→ Find orphan pages (on disk, not in index)
        ├→ Check [[wikilinks]] — broken links?
        ├→ Check frontmatter — required fields?
        ├→ Detect contradictions across pages
        ├→ Flag stale claims (updated > 90 days ago)
        ├→ Identify data gaps (concepts mentioned without page)
        │
        ├→ Write detected gaps to .discoveries/gaps.json
        │
        └→ Report: N errors, N warnings, N suggestions
           + research backlog
```

**Single-writer safe:** Creates/updates .discoveries/gaps.json only.

### Discover Operation

```
Config (topics, keywords)
        │
        ├→ For each strategy (web_search, feed_poll, github_watch):
        │   ├─ Search web / poll RSS / check GitHub
        │   └─ Collect candidates
        │
        ├→ Apply 3-layer dedup:
        │   ├─ URL exact match (skip if in history)
        │   ├─ Title normalized match (skip if in history)
        │   └─ qmd semantic search (>0.9 = dup, 0.6-0.9 = overlap, <0.6 = novel)
        │
        ├→ Score remaining candidates (topic_relevance × recency × novelty)
        │
        ├→ Write to .discoveries/inbox.json (status: pending)
        │
        └→ Report: N candidates found, M after dedup, top candidates
           + append to wiki/log.md
```

**Single-writer:** Creates/updates .discoveries/inbox.json and wiki/log.md.

### Run Operation (Full Cycle)

```
Run command
        │
        ├→ [Round 1]
        │   ├─ Discover (if inbox empty/stale)
        │   ├─ Present inbox to user
        │   ├─ For each approved candidate:
        │   │   ├─ Fetch content
        │   │   ├─ Save to sources/articles/YYYY-MM-DD-<slug>.md
        │   │   ├─ Run ingest operation
        │   │   └─ Update .discoveries/history.json (status: ingested)
        │   ├─ For rejected candidates:
        │   │   └─ Move to history.json (status: rejected)
        │   ├─ Re-index qmd (once, after all ingests)
        │   └─ Run lint
        │
        ├→ If lint finds critical gaps AND round 1:
        │   ├→ [Round 2] with reduced max_candidates
        │   │   ├─ Discover again (targeted by gaps)
        │   │   ├─ Approve/ingest/lint
        │   │   └─ No more rounds (max 2)
        │
        ├→ Generate summary report → outputs/run-YYYY-MM-DD.md
        │
        └→ Append to wiki/log.md
           (e.g., "## [2026-04-07] run | 5 ingested, 2 rejected")
```

**Single-writer:** Max 2 rounds to prevent infinite loops.

### Register Operation

```
Project directory
        │
        ├→ Scan for signals:
        │   ├─ README.md (tech stack, domain keywords)
        │   ├─ package.json / Cargo.toml / go.mod (dependencies)
        │   ├─ docs/ (domain concepts)
        │   └─ Existing wiki pages (tags)
        │
        ├→ Propose topics with keywords & priority
        │
        ├→ User approves/edits
        │
        ├→ Read config.yaml (create if missing)
        │
        ├→ For each approved topic:
        │   ├─ Check dedup (name + keyword Jaccard > 0.8)
        │   ├─ If topic exists: append project to registered_by array
        │   └─ If new: create topic with registered_by: [project], registered_at
        │
        ├→ (Optional) Propose feeds (RSS, GitHub repos)
        │
        ├→ Write updated config.yaml (surgical edit, not rewrite)
        │
        └→ Append to wiki/log.md
           (e.g., "## [2026-04-07] register | my-project — 3 topics, 1 feed")
```

**Single-writer:** Modifies config.yaml only.

### Unregister Operation

```
Project name
        │
        ├→ Read config.yaml
        │
        ├→ Find all entries where registered_by contains "project-name"
        │
        ├→ Present list to user for confirmation
        │
        ├→ Remove project from registered_by arrays
        │
        ├→ Delete entries where registered_by is now empty
        │
        └→ Append to wiki/log.md
           (e.g., "## [2026-04-07] unregister | my-project — 3 topics removed")
```

**Single-writer:** Modifies config.yaml only. Manually added topics never touched.

## Data Flow Diagram

```
Human (curator)                      Project repos (developers)
        │                                    │
        │ uploads sources                   │ run agent
        ▼                                   ▼
┌──────────────┐                    ┌──────────────┐
│ sources/     │◄───register────────│   Project    │
│ (immutable)  │                    │  (any repo)  │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │ ingest, discover, run             │ query (read-only)
       ▼                                   ▼
┌──────────────────────────────────────────────────┐
│  wiki/                                           │
│  ├─ index.md (catalog)                          │
│  ├─ log.md (append-only)                        │
│  ├─ entities/, concepts/, summaries/,           │
│  │  syntheses/, decisions/ (wiki pages)         │
│  └─ [[wikilinks]] between pages                 │
└──────────────────┬───────────────────────────────┘
                   │ lint, register, unregister
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
    .discoveries/  outputs/   config.yaml
    ├─history.json ├─reports  ├─ topics
    ├─inbox.json   ├─slides   ├─ feeds
    └─gaps.json    └─charts   └─ settings
        (state)        (artifacts)  (config)
```

## Search Architecture

### qmd Integration

**Purpose:** BM25 (keyword) + vector (semantic) search with LLM re-ranking.

**Collections:**
- `wiki` — All wiki pages (entities, concepts, summaries, syntheses, decisions)
- `sources` — All source documents (for citation retrieval)

**Setup:**
```bash
qmd collection add wiki/ --name wiki
qmd collection add sources/ --name sources
qmd embed  # Build vector embeddings
```

**Graceful fallback:** If qmd unavailable → fall back to native file reading and grep.

**Scale:** At <100 pages, `wiki/index.md` sufficient. At scale, qmd provides semantic ranking.

## Discovery System Architecture

### 3-Layer Dedup

```
Candidate URL
        │
        ├→ [Layer 1] Exact URL match against history.json
        │            → Skip if found (100% duplicate)
        │
        ├→ [Layer 2] Normalized title match (edit distance)
        │            → Skip if found (<3 char diff)
        │
        └→ [Layer 3] qmd semantic search against wiki + sources
                     ├─ Similarity > 0.9 → Skip (duplicate)
                     ├─ Similarity 0.6–0.9 → Flag as overlap, lower score
                     └─ Similarity < 0.6 → Boost score (novel)
```

**Thresholds tunable** in wiki-schema.md. Adjust if too aggressive or permissive.

### Candidate Lifecycle

```
pending ─→ approved ─→ ingested
  │          └───→ failed
  └──→ rejected
```

- **pending:** Discovered, awaiting user review
- **approved:** User confirmed, ready for ingest
- **ingested:** Successfully processed, added to wiki
- **rejected:** User declined (recorded in history for dedup)
- **failed:** Ingest errored (recorded in history)

### Scoring Algorithm

```
score = topic_relevance × recency × gap_match × novelty

topic_relevance  = keyword_match_score (BM25)
recency          = 1.0 if <1 month old, decay to 0.3 for 6mo+ old
gap_match        = boost if matches keywords in gaps.json
novelty          = 1.0 if <0.6 semantic similarity, 0.5 if 0.6-0.9, 0.1 if >0.9
```

**Result:** Candidates ranked by composite score, top candidates presented to user.

## Concurrency Model

### Single-Writer Rule

**Write operations serialized:**
- ingest
- discover
- run (both rounds)
- lint (if writing gaps.json)
- register
- unregister

**Read operations concurrent-safe:**
- query
- status
- search via qmd

**Implementation:** Agent discipline (one agent per operation at a time). Git prevents conflicts at rest.

**Multi-wiki federation:** Future — each wiki maintains its own schema + state, coordination via search gateway.

## Configuration & State Management

### Static Configuration (config.yaml)

**Optional, gitignored.** Controls discovery behavior.

**Sections:**
- `wiki:` Metadata (name, language)
- `topics:` Keywords, priority, optional registration tracking
- `discovery:` Strategies, limits, settings
- `feeds:` RSS, GitHub repos/orgs

**Graceful degradation:** All sections optional. Missing config → operations degrade gracefully.

### Runtime State (.discoveries/)

**Gitignored JSON files:**

| File | Purpose | Lifecycle |
|------|---------|-----------|
| history.json | Dedup registry | Grows with every discover/run |
| inbox.json | Pending candidates | Cleared by run operation |
| gaps.json | Knowledge gaps | Updated by lint, read by discover |

**State recovery:** If file corrupted → reset to empty defaults, warn user. Never fail operation.

## Error Handling Strategy

### Graceful Degradation

**Missing config.yaml:**
- Discover operation unavailable (no topics/feeds)
- Other operations (ingest, query, lint) unaffected
- Report: "Config not found, discovery skipped"

**Unavailable capability (e.g., no web_search):**
- Skip that strategy in discover operation
- Try next strategy
- Report: "web_search unavailable, trying feed_poll"

**Corrupted state file (.discoveries/):**
- Reset to empty defaults
- Continue operation
- Warn: "gaps.json corrupted, reset"

**Broken [[wikilink]]:**
- Lint detects and reports
- Page still renders (missing link shows as text)
- User updates page to fix

**Network failure during fetch:**
- Candidate marked as `failed` in history
- Move to next candidate
- Report: "Fetch failed, added to retry queue"

### User-Facing Errors

**Operation fails completely only if:**
- file_read capability unavailable (can't read sources)
- file_write capability unavailable (can't write wiki)
- Unrecoverable Git error (corrupted repo)

**For all other errors:** Log, continue with degraded behavior, report to user.

## Scalability Considerations

### Current Scale
- Wiki pages grow with each ingest
- Sources accumulate over time
- <100 KB total wiki content
- qmd indexes both wiki and sources

### Target Scale (1+ year)
- 500+ wiki pages
- 1000+ sources
- ~5 MB wiki content
- qmd handles scale with vector embeddings

### Performance Optimizations
- qmd re-index once per batch (not per-source)
- Candidate scoring cached (JSON, not recalculated)
- Dedup thresholds tuned to reduce false negatives
- Lint incremental (check only new pages, not all)

### Multi-Wiki Federation (Future)
- Separate wiki repos, each with own schema + state
- Search gateway for cross-wiki queries
- Topic namespacing (wiki1/topic vs wiki2/topic)
- Shared artifact registry (avoid duplicate ingests across wikis)

## Agent Integration Points

### Four Agent Platforms
- **Amp** — Full SKILL.md + AGENTS.snippet.md
- **Claude** — CLAUDE.snippet.md injected into ~/.claude/CLAUDE.md
- **OpenCode** — AGENTS.snippet.md injected into ~/.config/opencode/AGENTS.md
- **Cursor** — .cursorrules.snippet injected into ~/.cursor/.cursorrules

### Search Engine (qmd)
**Shared CLI tool** — all agents use the same qmd commands via Bash/shell.

**Commands:**
- `qmd query "..." -c wiki --md` — Semantic search
- `qmd search "..." -c wiki` — Keyword search (BM25)
- `qmd get <file>` — Fetch single page
- `qmd status` — Check index health

### Idempotent Installation
```bash
node init.mjs --agent amp        # Install or update
node init.mjs --check --agent amp # Detect if outdated
```

Uses `<!-- llm-wiki:start -->` / `<!-- llm-wiki:end -->` markers for surgical injection.

---

**Document status:** Version 1.0 — Foundation complete.  
**Last updated:** 2026-04-08
