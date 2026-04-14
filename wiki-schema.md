---
title: Wiki Schema
type: schema
updated: 2026-04-14
---

# Wiki Schema

> "Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase." — Andrej Karpathy

This document is the single source of truth for all wiki conventions, page formats, and operations. Every LLM agent working with this wiki must read and follow this schema. It is agent-agnostic — no tool-specific instructions.

## Philosophy

- The wiki is a **persistent, compounding artifact** — not a retrieval layer
- Knowledge is **compiled once and kept current**, not re-derived on every query
- Human curates sources and asks questions; the LLM does all bookkeeping
- Cross-references, contradictions, and synthesis are maintained continuously
- Humans abandon wikis because maintenance burden grows faster than value — LLMs don't get bored

## Agent Operating Principles

These principles govern all wiki operations. Internalize them — they reduce wasted work and improve wiki quality.

### 1. Goal First, Not Steps First

Before executing any operation, state the goal and what "done" looks like. Transform imperative tasks into verifiable outcomes.

- ❌ "I'll ingest this source by following the 12 steps"
- ✅ "Goal: integrate this source's knowledge into the wiki. Done when: summary page exists, key concepts linked, index updated, no duplicates created"

### 2. Search Before Creating

Always search the wiki before creating a new page. **Update existing pages** rather than creating near-duplicates.

- ❌ Create `retrieval-augmented-generation.md` when `rag-vs-wiki.md` already covers the concept
- ✅ Update `rag-vs-wiki.md` with new information, add aliases if the concept has multiple names

**Create a new page only if:**
- The topic is clearly distinct from all existing pages
- The topic is likely reusable across future work
- Adding to an existing page would make it unfocused

### 3. Minimal Sufficient Action

Do the smallest write that compounds knowledge. Match effort to source density.

- ❌ Create 12 thin pages from one short article
- ✅ Create 1 summary + update 2-3 existing concept/entity pages with new claims
- ❌ Extract every noun as an entity page
- ✅ Extract only durable, reusable entities worth tracking long-term

**Scaling rule:** Replace "aim to touch 10-15 pages" with: touch as many pages as the source justifies — usually 3-8 for articles, 5-15 for dense technical docs, rarely more.

### 4. Evidence Hierarchy

When integrating information, label confidence by source:

1. **Direct source text** — quoted or closely paraphrased from a source
2. **Multiple corroborating sources** — confirmed across 2+ sources
3. **Existing wiki synthesis** — prior integration by the agent
4. **Agent inference** — reasoning not directly supported by sources

Never present inference at the same confidence level as sourced claims. If uncertain, say so.

### 5. Self-Audit Before Finishing

After every write operation, ask:

- Did I create a page where updating an existing one was enough?
- Is this knowledge durable (still useful in 30 days), or project-local churn?
- Did I preserve existing context, or accidentally overwrite useful prior synthesis?
- Are the links helping navigation, or just padding?
- Would another agent starting fresh understand what changed and why?

### 6. Own Your Mess, Leave the Rest

Fix issues introduced or exposed by your current operation. Do not turn a focused task into a repo-wide cleanup.

- ❌ Ingest a source → notice 5 old broken links → fix all of them during ingest
- ✅ Ingest a source → fix links you introduced → mention old broken links in lint backlog
- ❌ Register a project → reformat the entire `config.yaml` → normalize all topic entries
- ✅ Register a project → add your entries cleanly → leave existing entries untouched

### 7. Surface Assumptions

When ambiguity exists, choose the narrower non-destructive interpretation and state the assumption.

- ❌ "update wiki" is ambiguous → silently re-ingest all sources from scratch
- ✅ "update wiki" is ambiguous → ask "update which project?" or assume the most recent registered project and state: "Assuming you mean project X"

Include in operation reports:
- Assumptions made
- Actions skipped and why
- Follow-up opportunities (for user to decide later)

## Architecture

Three layers:

```
sources/          → Raw source documents (immutable, human-curated)
wiki/             → LLM-maintained knowledge pages (structured, interlinked)
wiki-schema.md    → Conventions and operations (this file)
```

This wiki is a **shared knowledge service**. Agents in other project repos connect via qmd CLI to search, read, and write wiki pages. The wiki repo is not tied to any single project.

### Directory Structure

```
llm-wiki/
├── sources/                  # Raw source documents — IMMUTABLE
│   ├── articles/             # Auto-discovered web articles
│   ├── assets/               # Downloaded images and attachments
│   ├── projects/             # Project documentation (grouped by org/project)
│   │   ├── <org>/            # Org-level grouping (optional)
│   │   │   ├── <project-a>/
│   │   │   └── <project-b>/
│   │   └── <standalone>/     # Projects without org grouping
│   └── *.md                  # General reference sources
├── wiki/                     # LLM-maintained knowledge pages
│   ├── index.md              # Auto-maintained page catalog
│   ├── log.md                # Append-only operations log
│   ├── entities/             # People, organizations, products
│   ├── concepts/             # Ideas, frameworks, patterns, techniques
│   ├── summaries/            # Per-source summary pages
│   ├── syntheses/            # Cross-source synthesis pages
│   └── decisions/            # Architecture/business decision records
├── outputs/                  # Durable query artifacts (reports, comparisons, slides)
├── .discoveries/             # Discovery state (gitignored)
│   ├── history.json          # Processed source dedup registry
│   ├── inbox.json            # Candidate queue (pending approval)
│   └── gaps.json             # Knowledge gaps from lint
├── agent_templates/          # Per-agent instruction files
├── config.example.yaml       # Discovery config template
├── config.yaml               # Your discovery config (gitignored, optional)
├── wiki-schema.md            # This file — source of truth
└── README.md                 # Project overview and setup guide
```

## Page Conventions

### Frontmatter

Every wiki page requires YAML frontmatter. Use **simple YAML only** — single-line `key: value`, flat lists `[a, b, c]`. No multi-line values, no nested objects.

```yaml
---
title: "Page Title"
type: entity | concept | summary | synthesis | decision
sources: [source-filename.md]
created: 2026-04-07
updated: 2026-04-07
tags: [tag1, tag2]
aliases: [Alternative Name]
projects: [project-a, project-b]
---
```

**Required fields:** `title`, `type`, `created`, `updated`
**Recommended fields:** `sources`, `tags`
**Optional fields:** `aliases`, `projects`

### Page Types

| Type | Directory | Purpose | Example |
|------|-----------|---------|---------|
| `entity` | `wiki/entities/` | People, organizations, products, tools | `andrej-karpathy.md` |
| `concept` | `wiki/concepts/` | Ideas, frameworks, patterns, techniques | `rag-vs-wiki.md` |
| `summary` | `wiki/summaries/` | Per-source distillation | `karpathy-llm-wiki.md` |
| `synthesis` | `wiki/syntheses/` | Cross-source analysis connecting multiple topics | `knowledge-management-evolution.md` |
| `decision` | `wiki/decisions/` | Architecture or business decision records | `search-engine-choice.md` |

### Page Structure Templates

Each page type has an expected shape. Follow these to reduce variance.

**Summary** (`wiki/summaries/`):
- Source overview (1-2 sentences: what is this source, who wrote it)
- Key claims (bullet list of the most important takeaways)
- Entities and concepts mentioned (with `[[wikilinks]]`)
- Open questions or gaps (what the source doesn't cover)

**Concept** (`wiki/concepts/`):
- Definition (what it is, in 1-2 sentences)
- Why it matters (context, relevance)
- Variants or tradeoffs (if applicable)
- Related pages (`[[wikilinks]]`)
- Source basis (which sources support this page)

**Entity** (`wiki/entities/`):
- What it is (person, org, product, tool — 1-2 sentences)
- Why relevant (to wiki topics)
- Related concepts/projects (`[[wikilinks]]`)

**Synthesis** (`wiki/syntheses/`):
- Question or theme being explored
- Compared sources (which sources contribute)
- Convergences (where sources agree)
- Divergences (where sources conflict — see Contradiction Handling)
- Conclusion or current understanding

**Decision** (`wiki/decisions/`):
- Context (what prompted the decision)
- Decision (what was decided)
- Rationale (why this option was chosen)
- Alternatives considered
- Consequences (what follows from this decision)

### Content Rules

- **One topic per page** (atomic notes)
- **All files UTF-8 encoded**
- Use `[[wikilinks]]` for cross-references between pages
- For display text: `[[target-page|Display Text]]`
- Aim for **dense, factual content** — not conversational prose
- **Bullet-dense writing** — prefer structured lists over paragraphs; don't restate the same point across summary and concept pages
- When updating an existing page, **append/integrate new information** — do not overwrite existing content unless correcting errors
- File names: lowercase, hyphens for spaces (e.g., `andrej-karpathy.md`)

### Contradiction Handling

When sources disagree:

1. **Preserve both claims** — do not silently pick one
2. **Annotate the conflict** in the relevant concept/synthesis page with sources cited
3. **Prefer newer or higher-authority source** only when there is clear justification (e.g., official docs supersede blog posts)
4. If the contradiction is meaningful, create or update a synthesis page to explore it

### Deprecation Protocol

When wiki content becomes stale or invalid:

1. **Do not silently delete pages** — mark as deprecated first
2. Add to frontmatter: `status: deprecated`
3. Add a note at the top: `> ⚠️ Deprecated (YYYY-MM-DD): <reason>. See [[replacement-page]] instead.`
4. Update `wiki/index.md` — mark the entry or remove if replacement exists
5. Only delete pages after user explicitly confirms

### Open Questions Handling

When ingest/query/lint uncovers uncertainty:

- Put unresolved items in a `## Open Questions` section on the relevant page
- Or write to `.discoveries/gaps.json` for future discovery
- **Do not fill gaps with speculative text** — leave them as explicit questions

## Source Rules

- `sources/` is **immutable** — never modify files already in this directory
- New files may be added via the ingest operation
- Supported formats: `.md` and `.txt`
- Each source file should have frontmatter: `title`, `source_url`, `author`, `date_published`, `date_ingested`, `format`
- Images and attachments go in `sources/assets/`

## Index Rules

`wiki/index.md` is a catalog of all wiki pages.

**Entry format:**
```
- [[Page Title]] — one-line summary (N sources)
```

**Rules:**
- Entries sorted **alphabetically** within each category section
- Updated after every ingest operation
- Categories: Entities, Concepts, Summaries, Syntheses, Decisions
- Include source count where applicable

## Log Rules

`wiki/log.md` is an **append-only**, chronological record of operations.

**Entry format:**
```
## [YYYY-MM-DD] operation | subject
```

**Examples:**
```
## [2026-04-07] ingest | Karpathy LLM Wiki Gist
## [2026-04-07] query | How does wiki pattern compare to RAG?
## [2026-04-07] lint | errors: 0, warnings: 3
```

**Rules:**
- Append new entries at the **end** of the file (after all existing entries)
- Parseable: `grep "^## \[" wiki/log.md | tail -5`
- Records: ingests, queries (when answer is filed back), lint passes
- Helps LLM understand recent activity when starting a new session

## Outputs

`outputs/` stores durable query artifacts — reports, comparisons, slide decks.

**Rules:**
- These are **deliverables**, not knowledge pages — not part of wiki/
- Naming: `YYYY-MM-DD-<slug>.md`
- Formats: Markdown, Marp slides, comparison tables, charts

## Concurrency

- **Single-writer**: only one agent should perform wiki write operations at a time
- **Operations requiring single-writer**: ingest, update, lint, discover, run, register, unregister
- When updating existing pages, **append/integrate** — don't overwrite
- Read operations (search, query, status) are safe to run concurrently

## Search

- **Primary:** qmd CLI (`qmd query "..."`, `qmd search "..."`, `qmd status`)
- **Fallback:** native file-reading and search capabilities of the agent
- **Setup:** `qmd collection add wiki/ --name wiki && qmd embed`

At small scale (~100 pages), `wiki/index.md` is sufficient for navigation. As the wiki grows, qmd provides hybrid BM25 + vector search with LLM re-ranking.

## Configuration

`config.yaml` is **optional**. If absent, discovery operations degrade gracefully — web_search skipped (no topics), feed_poll skipped (no feeds), github_watch skipped (no repos). Existing operations (ingest, query, lint) are unaffected.

- **Template:** `config.example.yaml` — copy to `config.yaml` and customize
- **Location:** `{{WIKI_ROOT}}/config.yaml` (gitignored)
- **Schema:** topics, strategies, feeds, safety limits — see `config.example.yaml`
- **Source tracking:** topics and feeds may include optional `registered_by` (string or array of strings) and `registered_at` fields to track which project registered them. When multiple projects register the same topic, `registered_by` becomes an array. Agents must normalize on read: treat `"project-a"` as `["project-a"]`. `registered_at` reflects the first registration date and does not change when additional projects join. Manually added entries don't need these fields.

### Discovery State

Runtime state lives in `.discoveries/` (gitignored, JSON files):

| File | Purpose | Key fields |
|------|---------|------------|
| `history.json` | Dedup registry of all processed URLs | `url`, `url_normalized`, `status`, `strategy` |
| `inbox.json` | Candidate queue awaiting approval | `url`, `title`, `snippet`, `score`, `status` |
| `gaps.json` | Knowledge gaps detected by lint | `concept`, `priority`, `query_hints` |

**State recovery:** When reading `.discoveries/*.json`, validate structure on load. If malformed or unreadable, reset to empty defaults (`{ "version": 1, ... }`) and warn user. Never fail an operation due to corrupted state.

## Capability Model

Discovery operations use abstract capabilities — each agent template maps these to native tools:

| Capability | Purpose | Required? |
|------------|---------|-----------|
| `web_search` | Find new sources by keyword | Optional |
| `http_fetch` | Download article content | Optional |
| `file_read` | Read config, state, sources | Required |
| `file_write` | Write sources, wiki, state | Required |
| `qmd_query` | Semantic search for dedup/gaps | Required |

**Graceful degradation:** If a capability is unavailable, skip that strategy and continue. Never fail an entire operation because one strategy is unsupported. Report degraded mode in status.

---

## Operation — Discover

**Trigger:** "discover" or "find new sources"

**Goal:** Find high-quality, novel source candidates that fill wiki gaps or enrich tracked topics.
**Done when:** Inbox has new candidates with rationale, no duplicates, all scored.
**Verify:** No duplicate URLs in inbox; all candidates have reason + score; JSON structure valid.
**Shortcut:** If inbox already has unreviewed candidates, report them instead of searching again.

**Steps:**

1. Read `config.yaml` → topics, strategies, feeds (if absent, use empty defaults)
2. Read `.discoveries/gaps.json` → knowledge gaps from lint
3. Read `.discoveries/history.json` → dedup registry
4. For each enabled strategy:
   a. **web_search**: search by topic keywords + gap query hints (if `web_search` capable)
   b. **feed_poll**: check RSS URLs, known endpoints (if `http_fetch` capable)
   c. **github_watch**: check tracked repos/orgs for releases, READMEs (if `http_fetch` capable)
5. For each candidate found, apply 3-layer dedup:
   a. URL exact match against history → skip if found
   b. Normalized title match against history → skip if found
   c. qmd semantic search against wiki + sources:
      - Similarity > 0.9 → duplicate, skip
      - Similarity 0.6–0.9 → flag as overlap, lower score
      - Similarity < 0.6 → novel, boost score
   d. Score = topic_relevance × recency × gap_match × novelty
6. Write candidates to `.discoveries/inbox.json` (status: `pending`)
7. Report: N candidates found, M after dedup, top candidates listed
8. Append to `wiki/log.md`: `## [YYYY-MM-DD] discover | N candidates queued`

**Rules:**
- Max candidates per run: `config.discovery.max_candidates_per_run` (default: 20)
- Dedup thresholds (0.9/0.6) are tunable — adjust if too aggressive/permissive
- Discovered URLs must be validated — no `file://` or local paths
- Fetched content must be sanitized — no script injection into markdown
- **Prefer fewer high-signal candidates** over many weak ones — official docs > blogs > random commentary
- Each inbox candidate should include: `url`, `title`, `score`, `reason` (why relevant), `gap_match` (which gap/topic it maps to)

---

## Operation — Run

**Trigger:** "run" or "run full cycle"

**Goal:** Improve wiki health in bounded iterations — discover, ingest approved sources, lint for gaps.
**Done when:** All approved candidates ingested, lint completed, wiki re-indexed.
**Verify:** Each round: accepted candidates fully ingested; lint results improved or backlog refined.
**Stop early if:** Second round yields no high-value candidates, or lint only surfaces low-priority opportunities.

**Steps:**

1. Run discover (if inbox is empty or stale)
2. Present inbox as numbered list, ask: "Approve all / select by number / reject all?"
3. For each approved candidate:
   a. Fetch content (if not already fetched, requires `http_fetch`)
   b. Save to `sources/articles/YYYY-MM-DD-<slug>.md` with frontmatter:
      ```yaml
      ---
      title: "Article Title"
      source_url: "https://example.com/article"
      author: "Author Name"
      date_published: <from source>
      date_ingested: <today>
      format: web-article
      discovered_by: <strategy>
      topic: "Topic Name"
      ---
      ```
   c. Run standard ingest operation
   d. Update `.discoveries/history.json` (status: `ingested`)
   e. Remove from `inbox.json`
4. For rejected candidates:
   a. Move to `history.json` (status: `rejected`)
   b. Remove from `inbox.json`
5. Re-index qmd: `qmd update && qmd embed` (once, after all ingests)
6. Run lint
7. If lint finds critical gaps AND this is round 1:
   a. Update `gaps.json`
   b. Run discover again (round 2, `max_candidates` reduced)
   c. Repeat approval + ingest
8. Generate summary report → `outputs/run-YYYY-MM-DD.md`
9. Append to `wiki/log.md`: `## [YYYY-MM-DD] run | N ingested, M rejected`

**Rules:**
- **Max 2 rounds** to prevent infinite loops
- Approval required unless `config.discovery.auto_ingest` is `true`
- Re-index once after all ingests (not per-source)

---

## Operation — Status

**Trigger:** "status" or "wiki status"

**Steps:**

1. Count wiki pages by type (entities, concepts, summaries, syntheses, decisions)
2. Count sources in `sources/`
3. Read `.discoveries/inbox.json` → pending/approved counts
4. Read `.discoveries/gaps.json` → open gaps count
5. Read `wiki/log.md` → extract last discover, ingest, lint dates
6. Check qmd status
7. Assess agent capabilities (`web_search` available? `http_fetch`?)
8. Report health: **Good** | **Warning** | **Needs Attention**

**Output format:**
```
Wiki Status
───────────
Pages:      N total (E entities, C concepts, S summaries, Y syntheses, D decisions)
Sources:    N total (M manual, A auto-discovered)
Inbox:      N pending candidates
Gaps:       N open knowledge gaps
Last lint:  YYYY-MM-DD (errors: N, warnings: N)
Last discover: YYYY-MM-DD
Capabilities: web_search ✓/✗, http_fetch ✓/✗, qmd ✓/✗
Health:     [Good | Warning | Needs Attention]

Quality:
  Broken links:     N
  Orphan pages:     N (on disk but not in index)
  Missing frontmatter: N
  Stale pages:      N (updated > 90 days ago with newer sources available)
  Deprecated pages: N
  Pages touched (30d): N
```

### Candidate Lifecycle

```
pending → approved → ingested
    │         └───→ failed
    └──→ rejected
```

- **pending**: discovered, awaiting user review
- **approved**: user confirmed, ready for ingest
- **ingested**: successfully processed into wiki pages
- **rejected**: user declined (stays in history for dedup)
- **failed**: ingest attempted but errored (stays in history)

---

## Operation — Register

**Trigger:** "register `<project>`", "add `<project>` to wiki", "ingest project at `<path>`"

All three triggers route to the same flow below.

Register adds a project to the wiki by **syncing its codebase documentation first** (primary purpose), then optionally proposing discovery topics. The wiki's main value is codebase knowledge — external discovery is secondary.

**Goal:** Integrate a project's documentation into the wiki as durable, linked knowledge.
**Done when:** Foundational docs ingested, wiki pages created/updated, index updated, qmd re-indexed.
**Verify:** Each copied source has `source_url`; no duplicate pages created; at least one summary + relevant concept/entity pages exist for the project.
**Shortcut:** For projects with 1-2 small docs, skip topic proposal entirely.

### Phase 1 — Codebase Sync (always runs)

1. Identify the project:
   a. Use current working directory as the project (agent is already in the project repo)
   b. Detect project name from `package.json` name field, directory name, or git remote
2. Scan the project directory — look for:
   - `README.md`, `docs/`, `CHANGELOG.md`, `CONTRIBUTING.md`
   - Architecture docs, decision records, codebase summaries
   - Config files that reveal stack (`package.json`, `Cargo.toml`, `go.mod`, etc.)
3. Classify docs by priority:
   - **Foundational** (ingest first): README, architecture, design decisions
   - **Reference** (ingest if selected): API docs, configuration guides
   - **Noise** (skip by default): changelogs, auto-generated docs, CI configs
4. Present findings to user with a summary table:
   ```
   Found N docs in <project>:
   | # | File | Size | Content |
   | 1 | docs/architecture.md | 5KB | System architecture overview |
   | 2 | README.md | 3KB | Project overview + setup |
   ...
   Which files should I ingest? (all / select by number / skip)
   ```
5. User selects which files to ingest
6. For each selected file:
   a. Copy to `sources/<project-slug>-<filename>.md` with frontmatter:
      ```yaml
      ---
      title: "<Project> — <Doc Title>"
      source_url: "local://<project>/<relative-path>"
      author: <from git or user>
      date_ingested: <today>
      format: project-docs
      ---
      ```
      b. Append original content below frontmatter
      c. Run the standard **ingest flow** (Operation — Ingest, steps 1-12) for each copied source:
      summaries → entities → concepts → decisions → syntheses → wikilinks → index → log
   d. For each wiki page created/updated:
      - Add project name to `projects` field in frontmatter
      - If `projects` field exists → append (deduplicated)
      - If `projects` field absent → create as `[project-name]`
7. **Before writing:** Search the wiki first. Update existing pages rather than creating duplicates.
8. Re-index search: `qmd update && qmd embed`

### Phase 2 — Discovery Topics (optional, only if user opts in)

After codebase sync completes, ask:
```
Codebase docs synced. Want to also register discovery topics for <project>?
(These are used when you run `discover` later to find external articles/resources.)
[yes / skip]
```

If user says yes:

7. Scan the project for topic signals:
   a. `README.md` → extract technology stack, domain keywords
   b. `package.json` / `Cargo.toml` / `go.mod` → extract dependencies as keyword hints
   c. `docs/` → extract domain concepts
   d. Existing wiki pages about this project → extract tags
8. Propose topics to user:
   ```
   Detected topics for <project>:
   | # | Topic | Keywords | Priority |
   | 1 | React Performance | RSC, Suspense, hydration | high |
   | 2 | TypeScript Patterns | generics, type inference | medium |
   ...
   Approve all / select by number / edit / skip?
   ```
9. User confirms or edits
10. Read `config.yaml` (create from `config.example.yaml` if absent)
11. For each approved topic:
    a. Check if topic with same name exists:
       - YES + project already in `registered_by` → skip (idempotent)
       - YES + project NOT in `registered_by` → append project to `registered_by` array
       - NO → create new topic with `registered_by: [project]`
    b. Check keyword overlap: Jaccard similarity |intersection| / |union| > 0.8 with DIFFERENT-named topic → warn, let user decide
    c. Append to `topics:` array with `registered_by` and `registered_at`
12. Optionally propose feeds:
    a. If project has known blog/RSS → suggest RSS feed
    b. If project is a GitHub repo → suggest `github_repos` watch
13. Write updated `config.yaml` — surgical edit, never rewrite entire file

### Reporting

14. Report: N docs ingested, N wiki pages created/updated, N topics added (if any), N feeds added (if any)
15. Append to `wiki/log.md`: `## [YYYY-MM-DD] register | <project> — N docs synced, N topics, N feeds`

**Rules:**
- **Codebase sync is the primary action** — it always runs, even if user skips discovery topics
- Discovery topics are optional — they only matter when user explicitly runs `discover` later
- `registered_by` and `registered_at` fields are **optional** — backward compatible with manually added entries
- Idempotent: re-registering syncs new/changed docs + updates existing topic entries without duplicating
- No auto-trigger of discover — user explicitly runs discover after register
- Dedup uses Jaccard similarity: |intersection| / |union| of keyword sets

---

## Operation — Unregister

**Trigger:** "unregister `<project>`" or "remove `<project>` topics"

Unregister removes all topics and feeds registered by a specific project. Only entries with a matching `registered_by` field are affected — manually added entries are never touched.

**Goal:** Remove a project's discovery configuration without affecting wiki pages or other projects.
**Done when:** All `registered_by` entries for this project cleaned from `config.yaml`.
**Verify:** Only scoped entries changed; manually added topics untouched; shared topics still have other projects' ownership.

**Steps:**

1. Read `config.yaml`
2. Find all entries (topics, RSS feeds, GitHub repos) where `registered_by` array contains `"<project>"`
3. Present list to user for confirmation
4. For each confirmed entry:
   a. Remove project from `registered_by` array
   b. If `registered_by` array is now empty → remove entire entry from `config.yaml`
   c. If `registered_by` still has other projects → keep entry, update array only
5. Write updated `config.yaml`
6. Append to `wiki/log.md`: `## [YYYY-MM-DD] unregister | <project> — N topics, M feeds removed`

**Rules:**
- Only modifies entries where `registered_by` contains the project — manually added topics are never touched
- If a topic has multiple projects in `registered_by`, only the specified project is removed
- If no entries found for the project, report and exit

---

## Operation — Ingest

### Ingest a source file

**Trigger:** "ingest `<source_path>`" — source file already exists in `sources/`

**Goal:** Convert one source into durable, linked wiki knowledge with minimal duplication.
**Done when:** Summary page exists, relevant entity/concept/decision pages updated, index and log updated.
**Verify:** No duplicate pages created; all touched pages have valid frontmatter and `[[wikilinks]]`; `updated:` date changed on every touched page; every new page appears in `wiki/index.md`.
**Shortcut:** For thin sources (< 500 words), create only a summary page + update 1-2 existing pages. Skip synthesis unless cross-topic insight genuinely exists.

**Steps:**

1. Read the source file
2. **Search wiki first** — check for existing pages covering similar topics before creating anything
3. Discuss key takeaways with the user — what's important, what to emphasize
4. Identify key entities, concepts, claims, and decisions in the source
5. Create or update `wiki/summaries/<slug>.md` with a source summary
6. For each entity: create or update `wiki/entities/<entity>.md`
7. For each concept: create or update `wiki/concepts/<concept>.md`
8. For each decision: create or update `wiki/decisions/<decision>.md`
9. If the source connects multiple topics: create or update `wiki/syntheses/<synthesis>.md`
10. Add `[[wikilinks]]` between all new and updated pages
11. Update `wiki/index.md` — add entries with link + one-line summary for each new page
12. Append to `wiki/log.md`: `## [YYYY-MM-DD] ingest | <source title>`
13. Report: pages created vs updated, assumptions made, unresolved questions, follow-up opportunities

- ❌ Extract every noun as an entity → create 12 thin pages from one short article
- ✅ Extract only durable entities/concepts → create 1 summary + update 2-3 existing pages with new claims

### Ingest a project

**Trigger:** "add `<project>` to wiki", "ingest project at `<path>`"

→ **Redirects to Operation — Register** (see above). Register Phase 1 performs the full codebase sync with the same ingest flow.

---

## Operation — Query

**Trigger:** User asks a question about wiki knowledge

**Goal:** Synthesize an accurate answer from existing wiki knowledge, citing sources.
**Done when:** Answer delivered with `[[wikilinks]]`; reusable answers filed back.
**Verify:** Answer cites actual wiki pages read; no unsupported claims beyond evidence; reusable outputs saved only if durable.
**Shortcut:** For quick factual lookups, answer directly without creating output files.

**Steps:**

1. **Search wiki first** via qmd (`qmd query "..."`) or read `wiki/index.md` to find relevant pages
2. Read the most relevant wiki pages
3. Synthesize an answer citing `[[wikilinks]]` to wiki pages
4. Label evidence: "based on wiki pages" vs "based on source" vs "inference/open question"
5. Choose the appropriate output format:
   - **Markdown page** (default)
   - **Comparison table** (for vs/compare questions)
   - **Marp slide deck** (for presentations)
   - **Chart/visualization** (for data-driven answers)
6. If the answer is comprehensive or reusable: file it back as a wiki page or save to `outputs/`
7. Append to `wiki/log.md`: `## [YYYY-MM-DD] query | <question summary>`

- ❌ Answer from memory/training data without checking wiki first → save every answer back to wiki
- ✅ Search wiki first → synthesize from existing pages → save only durable, reusable outputs

**Key insight:** Good answers should be filed back into the wiki. Explorations compound just like ingested sources do. But not every answer is worth persisting — ask "will this still matter in 30 days?"

---

## Operation — Update

**Trigger:** "update wiki with `<project>` changes", "refresh wiki for `<project>`"

**Goal:** Sync wiki pages with current project documentation state.
**Done when:** Source copies updated, wiki pages reflect current reality, stale claims resolved.
**Verify:** Changed sources remain traceable (`source_url` intact); impacted wiki pages updated; no silent deletions.

**Steps:**

1. Identify existing sources for this project: search `sources/` for files with matching `source_url` prefix
2. For each source, read the original project file at `source_url` path
3. Compare current project state vs wiki pages — classify changes by severity:
   - **Cosmetic**: wording tweaks, formatting (update source copy only)
   - **Factual update**: new sections, changed setup instructions (update source copy + wiki pages)
   - **Architecture shift**: new patterns, deprecated components (full re-evaluation of related pages)
   - **Deprecation/removal**: features removed from project (mark wiki pages as deprecated)
4. Present a change summary to user:
   ```
   <project> changes detected:
   | Status | File | What changed |
   | NEW    | docs/api-v2.md | New API documentation |
   | CHANGED| README.md | Updated setup instructions |
   | STALE  | wiki/entities/old-feature.md | Feature removed from project |
   ...
   Apply updates? (all / select / skip)
   ```
5. User selects which updates to apply
6. For new files: run "Ingest a project" flow (copy to sources/ + ingest)
7. For changed files: update the source copy in sources/, then update related wiki pages
8. For stale wiki pages: mark as deprecated or remove, update index
9. Re-index: `qmd update && qmd embed`
10. Append to `wiki/log.md`: `## [YYYY-MM-DD] update | <project> — N new, N changed, N stale`

---

## Organic Growth

During normal work in any project, the agent may discover durable knowledge worth preserving — patterns, decisions, debugging insights, architecture rationale. The agent should proactively write these back to the wiki without waiting for an explicit ingest command.

**When to write back (agent judgment):**
- A non-obvious bug fix with root cause worth remembering
- An architecture decision and its rationale
- A pattern or technique that could apply to other projects
- A comparison or evaluation that took significant effort

**When NOT to write back:**
- Project-specific implementation details (belongs in project docs)
- Temporary workarounds
- Routine code changes

---

## Auto-Sync on Significant Changes

Wiki pages for registered projects can become stale as code evolves. Agents should **proactively check and sync** wiki after significant work — without requiring user to prompt.

### When to auto-sync

After completing a feature, fix, or refactor that touches a **registered project** (i.e., the project has wiki pages with matching `projects` field), the agent should:

1. Check if the current project is registered: search `sources/` for files with `source_url: "local://<project>/..."` prefix
2. If registered → compare changed files against ingested sources:
   - Did `README.md`, `docs/*`, or architecture files change?
   - Did new docs/ files appear that aren't in sources/ yet?
3. If changes detected → run a **lightweight update** (no user prompt needed):
   a. Update the source copy in `sources/` with new content
   b. Update related wiki pages (entities, concepts, summaries)
   c. Re-index: `qmd update && qmd embed`
   d. Append to `wiki/log.md`: `## [YYYY-MM-DD] auto-sync | <project> — N pages updated`
4. If no doc changes detected → skip silently

### When to trigger

Auto-sync should run after any of these events:

- **After committing code** that touches `README.md`, `docs/*`, or architecture files
- **After completing a feature or fix** (before marking work as done)
- **After a code review** that resulted in doc changes

Agents or agent skills that perform commits should check for doc changes and trigger auto-sync automatically.

### Rules
- **Silent when no changes** — don't report "wiki is up to date"
- **Lightweight** — only update changed docs, don't re-ingest unchanged files
- **No user prompt** — auto-sync is non-destructive (updates existing pages, never deletes)
- **Skip if project not registered** — only sync projects that have wiki pages
- **Skip if wiki repo unavailable** — graceful degradation, never block the main workflow
- **Doc-significant changes only** — trigger on documentation changes, not all code changes
- **Never create discovery topics** during auto-sync
- **Never rewrite broad synthesis pages** — only update directly impacted summary/entity/concept pages

---

## Operation — Lint

**Trigger:** "lint wiki"

**Goal:** Assess wiki health, surface actionable issues, and identify knowledge gaps.
**Done when:** Findings reported as errors/warnings/opportunities; gaps written to `.discoveries/gaps.json`.
**Verify:** Error counts are real (spot-check 2-3); gap backlog is specific and actionable.
**Shortcut:** For quick structural checks only, skip contradiction/stale analysis.

**Steps:**

1. Check all pages listed in `wiki/index.md` exist on disk
2. Find pages on disk NOT listed in `wiki/index.md` (orphans)
3. Check `[[wikilinks]]` across all pages — flag broken links (parse `[[target|display]]` and check only the target before `|`)
4. Check frontmatter — verify required fields are present on every page
5. **Detect likely duplicate pages** — similar titles, overlapping aliases, highly similar sources/tags
6. **Detect thin pages** — pages too short to justify existence (< 3 substantive lines beyond frontmatter)
7. Flag contradictions across pages — claims that materially conflict (not just wording differences)
8. Flag stale claims — pages with old `updated` date vs newer sources that cover the same topic
9. Identify data gaps — concepts mentioned in text but lacking their own page
10. Check missing cross-references — related pages that should link to each other but don't
11. **Check source coverage** — sources with no summary page; summary pages with no downstream links
12. **Check project registration health** — registered projects with old source snapshots
13. Suggest web searches to fill knowledge gaps
14. Suggest new questions to investigate
15. If `.discoveries/` exists: write detected knowledge gaps to `.discoveries/gaps.json` (enables discover → ingest → lint → discover loop)

**Report findings in three tiers:**

| Tier | Type | Examples |
|------|------|---------|
| **Errors** | Must fix | Broken links, missing files, invalid frontmatter, index/disk mismatch |
| **Warnings** | Should fix | Stale claims, likely duplicates, thin pages, missing refs |
| **Opportunities** | Could improve | Missing pages, suggested discover topics, synthesis ideas, source coverage gaps |

- ❌ Report every possible missing link as equally important
- ✅ Prioritize: broken links and duplicates first, then stale claims, then nice-to-have gaps

16. Report: errors, warnings, opportunities count
17. Append to `wiki/log.md`: `## [YYYY-MM-DD] lint | errors: N, warnings: N, opportunities: N`

---

## Quick Reference

| What | Where |
|------|-------|
| All conventions | This file (`wiki-schema.md`) |
| Page catalog | `wiki/index.md` |
| Operations log | `wiki/log.md` |
| Raw sources | `sources/` (immutable) |
| Discovered sources | `sources/articles/` |
| Wiki pages | `wiki/` subdirectories |
| Query artifacts | `outputs/` |
| Discovery config | `config.yaml` (optional, gitignored) |
| Config template | `config.example.yaml` |
| Discovery state | `.discoveries/` (gitignored) |
| Registered projects | `config.yaml` → `registered_by` field on topics/feeds |
| Agent setup | `agent_templates/` |
| Project overview | `README.md` |
