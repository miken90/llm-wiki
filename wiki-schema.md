---
title: Wiki Schema
type: schema
updated: 2026-04-08
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
│   └── *.md, *.txt           # Manually added source files
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

### Content Rules

- **One topic per page** (atomic notes)
- **All files UTF-8 encoded**
- Use `[[wikilinks]]` for cross-references between pages
- For display text: `[[target-page|Display Text]]`
- Aim for **dense, factual content** — not conversational prose
- When updating an existing page, **append/integrate new information** — do not overwrite existing content unless correcting errors
- File names: lowercase, hyphens for spaces (e.g., `andrej-karpathy.md`)

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

---

## Operation — Run

**Trigger:** "run" or "run full cycle"

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
Last lint:  YYYY-MM-DD
Last discover: YYYY-MM-DD
Capabilities: web_search ✓/✗, http_fetch ✓/✗, qmd ✓/✗
Health:     [Good | Warning | Needs Attention]
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

**Trigger:** "register" or "register `<project>`" or "register topics from `<project>`"

Register scans a project to infer relevant topics and feeds, then appends them to the wiki's `config.yaml`. This is a **config-write** operation — it modifies `config.yaml` only, not wiki pages.

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
   a. Check if topic with same name exists:
      - YES + project already in `registered_by` → skip (idempotent)
      - YES + project NOT in `registered_by` → append project to `registered_by` array
      - NO → create new topic with `registered_by: [project]`
   b. Check keyword overlap: Jaccard similarity |intersection| / |union| > 0.8 with DIFFERENT-named topic → warn, let user decide
   c. Append to `topics:` array with `registered_by` and `registered_at`
7. Optionally propose feeds:
   a. If project has known blog/RSS → suggest RSS feed
   b. If project is a GitHub repo → suggest `github_repos` watch
8. Write updated `config.yaml` — use surgical edit (find `topics:` array, append entry), never rewrite entire file
9. Report: N topics added, M feeds added, K skipped (already registered)
10. Append to `wiki/log.md`: `## [YYYY-MM-DD] register | <project> — N topics, M feeds`

**Rules:**
- `registered_by` and `registered_at` fields are **optional** — backward compatible with manually added entries
- Idempotent: re-registering the same project updates existing entries, doesn't duplicate
- No auto-trigger of discover — user explicitly runs discover after register
- Dedup uses Jaccard similarity: |intersection| / |union| of keyword sets

---

## Operation — Unregister

**Trigger:** "unregister `<project>`" or "remove `<project>` topics"

Unregister removes all topics and feeds registered by a specific project. Only entries with a matching `registered_by` field are affected — manually added entries are never touched.

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

**Steps:**

1. Read the source file
2. Discuss key takeaways with the user — what's important, what to emphasize
3. Identify key entities, concepts, claims, and decisions in the source
4. Create or update `wiki/summaries/<slug>.md` with a source summary
5. For each entity: create or update `wiki/entities/<entity>.md`
6. For each concept: create or update `wiki/concepts/<concept>.md`
7. For each decision: create or update `wiki/decisions/<decision>.md`
8. If the source connects multiple topics: create or update `wiki/syntheses/<synthesis>.md`
9. Add `[[wikilinks]]` between all new and updated pages — aim to touch 10-15 pages
10. Update `wiki/index.md` — add entries with link + one-line summary for each new page
11. Append to `wiki/log.md`: `## [YYYY-MM-DD] ingest | <source title>`
12. Report a summary of all changes made

### Ingest a project

**Trigger:** "add `<project>` to wiki", "ingest project at `<path>`"

**Steps:**

1. Scan the project directory — look for:
   - `README.md`, `docs/`, `CHANGELOG.md`, `CONTRIBUTING.md`
   - Architecture docs, decision records, codebase summaries
   - Config files that reveal stack (package.json, Cargo.toml, go.mod, etc.)
2. Present findings to user with a summary table:
   ```
   Found N docs in <project>:
   | File | Size | Content |
   | docs/architecture.md | 5KB | System architecture overview |
   | README.md | 3KB | Project overview + setup |
   ...
   Which files should I ingest? (all / select by number / skip)
   ```
3. User selects which files to ingest
4. For each selected file:
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
5. Run the standard ingest flow (steps 1-12 above) for each copied source
5a. For each wiki page created/updated during ingest:
   - Add project name to `projects` field in frontmatter
   - If `projects` field exists → append (deduplicated)
   - If `projects` field absent → create as `[project-name]`
6. Re-index search if applicable: `qmd update && qmd embed`

**Before writing:** Search the wiki first. Update existing pages rather than creating duplicates.

---

## Operation — Query

**Trigger:** User asks a question about wiki knowledge

**Steps:**

1. Search wiki via qmd (`qmd query "..."`) or read `wiki/index.md` to find relevant pages
2. Read the most relevant wiki pages
3. Synthesize an answer citing `[[wikilinks]]` to wiki pages
4. Choose the appropriate output format:
   - **Markdown page** (default)
   - **Comparison table** (for vs/compare questions)
   - **Marp slide deck** (for presentations)
   - **Chart/visualization** (for data-driven answers)
5. If the answer is comprehensive or reusable: file it back as a wiki page or save to `outputs/`
6. Append to `wiki/log.md`: `## [YYYY-MM-DD] query | <question summary>`

**Key insight:** Good answers should be filed back into the wiki. Explorations compound just like ingested sources do.

---

## Operation — Update

**Trigger:** "update wiki with `<project>` changes", "refresh wiki for `<project>`"

**Steps:**

1. Identify existing sources for this project: search `sources/` for files with matching `source_url` prefix
2. For each source, read the original project file at `source_url` path
3. Compare current project state vs wiki pages — look for:
   - New files in project docs/ that aren't in sources/ yet
   - Significant changes to already-ingested files (new sections, changed architecture)
   - Removed or deprecated features still documented in wiki
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

## Operation — Lint

**Trigger:** "lint wiki"

**Steps:**

1. Check all pages listed in `wiki/index.md` exist on disk
2. Find pages on disk NOT listed in `wiki/index.md` (orphans)
3. Check `[[wikilinks]]` across all pages — flag broken links (parse `[[target|display]]` and check only the target before `|`)
4. Check frontmatter — verify required fields are present on every page
5. Flag contradictions across pages — claims that conflict with each other
6. Flag stale claims — pages with old `updated` date vs newer sources that cover the same topic
7. Identify data gaps — concepts mentioned in text but lacking their own page
8. Check missing cross-references — related pages that should link to each other but don't
9. Suggest web searches to fill knowledge gaps
10. Suggest new questions to investigate
11. If `.discoveries/` exists: write detected knowledge gaps to `.discoveries/gaps.json` (enables discover → ingest → lint → discover loop)
12. Report: errors, warnings, suggestions, research backlog
13. Append to `wiki/log.md`: `## [YYYY-MM-DD] lint | errors: N, warnings: N`

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
