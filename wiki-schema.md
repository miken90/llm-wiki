---
title: Wiki Schema
type: schema
updated: 2026-04-07
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

This wiki is a **shared knowledge service**. Agents in other project repos connect via qmd MCP server to search, read, and write wiki pages. The wiki repo is not tied to any single project.

### Directory Structure

```
llm-wiki/
├── sources/                  # Raw source documents — IMMUTABLE
│   ├── assets/               # Downloaded images and attachments
│   └── *.md, *.txt           # Source files
├── wiki/                     # LLM-maintained knowledge pages
│   ├── index.md              # Auto-maintained page catalog
│   ├── log.md                # Append-only operations log
│   ├── entities/             # People, organizations, products
│   ├── concepts/             # Ideas, frameworks, patterns, techniques
│   ├── summaries/            # Per-source summary pages
│   ├── syntheses/            # Cross-source synthesis pages
│   └── decisions/            # Architecture/business decision records
├── outputs/                  # Durable query artifacts (reports, comparisons, slides)
├── agent_templates/          # Per-agent instruction files + MCP config
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
---
```

**Required fields:** `title`, `type`, `created`, `updated`
**Recommended fields:** `sources`, `tags`
**Optional fields:** `aliases`

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
- When updating existing pages, **append/integrate** — don't overwrite
- Read operations (search, query) are safe to run concurrently

## Search

- **Primary:** qmd CLI (`qmd query "..."`) or qmd MCP tools (`query`, `get`, `multi_get`, `status`)
- **Fallback:** native file-reading and search capabilities of the agent
- **Setup:** `qmd collection add wiki/ --name wiki && qmd embed`

At small scale (~100 pages), `wiki/index.md` is sufficient for navigation. As the wiki grows, qmd provides hybrid BM25 + vector search with LLM re-ranking.

---

## Operation — Ingest

**Trigger:** "ingest `<source_path>`" or adding a new source to process

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
11. Report: errors, warnings, suggestions, research backlog
12. Append to `wiki/log.md`: `## [YYYY-MM-DD] lint | errors: N, warnings: N`

---

## Quick Reference

| What | Where |
|------|-------|
| All conventions | This file (`wiki-schema.md`) |
| Page catalog | `wiki/index.md` |
| Operations log | `wiki/log.md` |
| Raw sources | `sources/` (immutable) |
| Wiki pages | `wiki/` subdirectories |
| Query artifacts | `outputs/` |
| Agent setup | `agent_templates/` |
| Project overview | `README.md` |
