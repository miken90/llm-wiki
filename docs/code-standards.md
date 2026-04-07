# LLM Wiki — Code Standards & Conventions

## Overview

This document defines the standards, conventions, and best practices for the LLM Wiki codebase and knowledge management system.

## Page Standards (wiki-schema.md)

The single source of truth for all wiki conventions. Every agent working with this wiki must read `wiki-schema.md` first.

### Frontmatter Standards

**Required fields:**
```yaml
title: "Page Title"
type: entity | concept | summary | synthesis | decision
created: 2026-04-07
updated: 2026-04-07
```

**Recommended fields:**
```yaml
sources: [source1.md, source2.md]
tags: [tag1, tag2]
```

**Optional fields:**
```yaml
aliases: [Alternative Name]
```

**Rules:**
- Use YAML simple values only (no nested objects, no multi-line strings)
- All dates in YYYY-MM-DD format
- Source list is flat array: `[file1.md, file2.md]`
- Tags are flat array: `[tag1, tag2]`
- Never modify required fields after creation (especially `created`)

### Content Standards

**Atomic notes:** One topic per page.

**Naming:**
- File names: lowercase, hyphens for spaces (e.g., `session-based-connection.md`)
- Page titles: Title Case with proper nouns

**Linking:**
- Internal: `[[page-name]]` (resolve to `page-name.md`)
- With display text: `[[page-name|Custom Text]]`
- External: `[text](https://example.com)`

**Prose:**
- Dense, factual content (not conversational)
- Prefer bullet lists over paragraphs
- When updating existing pages, **append/integrate** new information — never overwrite
- Correct factual errors, but preserve original context

**Encoding:** UTF-8, no BOM.

## Page Type Standards

### Entity Pages (`wiki/entities/`)
**Purpose:** People, organizations, products, tools.

**Content checklist:**
- [ ] Brief description (1–2 paragraphs)
- [ ] Key facts (founding date, role, specialization)
- [ ] Notable projects or contributions
- [ ] Links to related concepts and decisions
- [ ] Source citations

**Example:** TablePro — desktop database client with drivers for 6 database systems.

### Concept Pages (`wiki/concepts/`)
**Purpose:** Ideas, frameworks, patterns, techniques.

**Content checklist:**
- [ ] Definition and context
- [ ] Why it matters
- [ ] Key components or principles
- [ ] Examples or use cases
- [ ] Related concepts and entities
- [ ] Trade-offs or limitations

**Example:** Plugin Architecture FFI — DLL plugin loading with ABI handshake for capability substrate.

### Summary Pages (`wiki/summaries/`)
**Purpose:** Per-source distillation — extract key ideas from a single source.

**Naming:** `<source-name>-summary.md` or `<topic>-summary.md`

**Content checklist:**
- [ ] Source metadata (author, date, URL)
- [ ] Main thesis or key argument
- [ ] Supporting points (3–5 bullet points)
- [ ] Important quotes or data
- [ ] How it relates to existing wiki knowledge
- [ ] Gaps or questions raised

**Rules:**
- Summarize, don't paraphrase
- Link to related concepts and entities
- Note any contradictions with existing pages

### Synthesis Pages (`wiki/syntheses/`)
**Purpose:** Cross-source analysis — connect multiple topics into coherent narrative.

**Naming:** `<topic>-synthesis.md` or `<topic>-comparison.md`

**Content checklist:**
- [ ] What sources are being synthesized
- [ ] Unifying theme or question
- [ ] Comparison table (if contrasting multiple approaches)
- [ ] Consensus and disagreements
- [ ] Emerging patterns or insights
- [ ] Open questions

**Example:** "Knowledge-Management-Evolution" synthesizing RAG, wiki patterns, and personal knowledge systems.

### Decision Pages (`wiki/decisions/`)
**Purpose:** Architecture and business decision records (ADRs).

**Format:**
- **Status:** Proposed | Accepted | Deprecated
- **Decision:** What was decided
- **Rationale:** Why
- **Alternatives considered:** What else was evaluated
- **Consequences:** Positive and negative impacts
- **Related decisions:** Links to related ADRs

**Naming:** `<decision-name>.md` — e.g., `tablpro-driver-capability-substrate.md`

## Index Standards (wiki/index.md)

**Purpose:** Auto-maintained catalog of all wiki pages.

**Entry format:**
```markdown
- [[Page Title]] — one-line summary (N sources)
```

**Rules:**
- Entries grouped by page type: Entities, Concepts, Summaries, Syntheses, Decisions
- Sorted alphabetically within each section
- One-line summaries should be concise (max 80 chars)
- Source count (N sources) helps track coverage
- Updated after every ingest operation

**Example:**
```markdown
- [[TablePro]] — Desktop database client with 6 drivers (16 sources)
- [[Plugin Architecture FFI]] — DLL loading with ABI handshake (1 source)
```

## Log Standards (wiki/log.md)

**Purpose:** Append-only, chronological record of all operations.

**Entry format:**
```markdown
## [YYYY-MM-DD] operation | subject

Details (optional)
```

**Rules:**
- Append new entries at the **end** of file
- Date format: YYYY-MM-DD (ISO 8601)
- Operation: ingest, query, lint, discover, run, status, register, unregister, update
- Subject: brief description (e.g., source name, question summary)
- Parseable: `grep "^## \[" wiki/log.md | tail -5`

**Examples:**
```markdown
## [2026-04-07] ingest | Karpathy LLM Wiki Gist
## [2026-04-07] lint | errors: 0, warnings: 3
## [2026-04-07] register | my-react-app — 3 topics, 1 feed
```

## Source Standards (sources/)

**Immutability:** Never modify files already in sources/. Append-only for new sources.

**Frontmatter (optional but recommended):**
```yaml
---
title: "Source Title"
source_url: "https://example.com/article" or "local://project/path"
author: "Author Name"
date_published: 2026-04-07
date_ingested: 2026-04-07
format: web-article | project-docs | book-chapter | research-paper
discovered_by: web_search | feed_poll | github_watch | manual
topic: "Topic Name"
---
```

**Rules:**
- Supported formats: `.md`, `.txt`
- Naming: `YYYY-MM-DD-<slug>.md` for auto-discovered sources
- Manual sources: descriptive name (`project-name-doc.md`)
- Images and attachments: `sources/assets/` directory
- All content UTF-8 encoded

## Configuration Standards (config.yaml)

**Location:** `llm-wiki/config.yaml` (gitignored, optional)

**Template:** Copy from `config.example.yaml` and customize.

**Structure:**
```yaml
wiki:
  name: "My LLM Wiki"
  language: "en"

topics:
  - name: "Topic Name"
    keywords: ["kw1", "kw2", "kw3"]
    priority: high | medium | low
    # registered_by: "project-name"  # Set by register operation
    # registered_at: "2026-04-07"    # Set by register operation

discovery:
  strategies: [web_search, feed_poll, github_watch]
  max_candidates_per_run: 20
  auto_ingest: false
  recency: month | week | day

feeds:
  rss:
    - url: "https://blog.example.com/rss"
      name: "Example Blog"
      # registered_by: "project-name"
  github_repos:
    - repo: "owner/repo"
      watch: [releases, readme]
  github_orgs:
    - org: "anthropic"
      watch: [new_repos, releases]
```

**Rules:**
- All sections optional
- Topic names must be unique (deduplicated by name + keyword Jaccard similarity)
- Keywords are flat list, lowercase
- Priority: high (search immediately) | medium (search periodically) | low (skip)
- Registered entries tracked with optional `registered_by` and `registered_at`
- Graceful degradation if config missing

## Discovery State Standards (.discoveries/)

**Runtime state files (gitignored):**

### history.json
Processed URL registry for dedup.

```json
{
  "version": 1,
  "entries": [
    {
      "url": "https://example.com/article",
      "url_normalized": "example.com/article",
      "status": "ingested | rejected | failed",
      "strategy": "web_search | feed_poll | github_watch",
      "date_added": "2026-04-07",
      "title": "Article Title"
    }
  ]
}
```

### inbox.json
Pending candidates awaiting approval.

```json
{
  "version": 1,
  "entries": [
    {
      "url": "https://example.com/article",
      "title": "Article Title",
      "snippet": "First 100 chars of content...",
      "score": 0.95,
      "status": "pending | approved",
      "date_found": "2026-04-07",
      "strategy": "web_search",
      "topic": "Topic Name"
    }
  ]
}
```

### gaps.json
Knowledge gaps detected by lint.

```json
{
  "version": 1,
  "entries": [
    {
      "concept": "Page name (singular or plural)",
      "priority": "high | medium | low",
      "query_hints": ["keyword1", "keyword2"],
      "detected_date": "2026-04-07"
    }
  ]
}
```

**Rules:**
- All files start with `{ "version": 1, "entries": [...] }`
- If file missing or malformed, reset to empty defaults
- Date format: ISO 8601 (YYYY-MM-DD)
- Status values are constrained (no free text)
- Never fail operation due to state corruption

## Naming Conventions

### File Names
- **Wiki pages:** lowercase, hyphens: `session-based-connection.md`
- **Sources:** `YYYY-MM-DD-<slug>.md` (auto-discovered), `<project>-<doc>.md` (manual)
- **Outputs:** `YYYY-MM-DD-<slug>.md` — e.g., `2026-04-07-rag-vs-wiki-comparison.md`
- **Plans:** `{date}-{slug}/` — e.g., `260407-2142-auto-discovery/`
- **Reports:** `{agent}-{date}-{slug}.md` — e.g., `researcher-260407-2142-llm-wiki-analysis.md`

### Page Names
- **Entity:** Person/org/product name, lowercase with hyphens
- **Concept:** Concept name, lowercase with hyphens
- **Summary:** `<source-name>-summary.md`
- **Synthesis:** `<topic>-synthesis.md` or `<topic>-comparison.md`
- **Decision:** `<decision-name>.md`

**Examples:**
- `andrej-karpathy.md` (entity)
- `plugin-architecture-ffi.md` (concept)
- `karpathy-llm-wiki-summary.md` (summary)
- `knowledge-management-evolution.md` (synthesis)
- `tablpro-driver-capability-substrate.md` (decision)

## Linking Conventions

**Wikilinks (internal):**
- `[[page-name]]` — Links to `wiki/*/page-name.md`
- `[[page-name|Display Text]]` — Custom display text

**External links:**
- `[text](https://example.com)` — Standard markdown

**Citation format:**
- Answers should cite with `[[wikilinks]]` to source pages
- Example: "The [[Plugin Architecture FFI]] pattern enables..."

## Agent Standards

### Template Injection Markers
All agent templates use idempotent comment markers:

```markdown
<!-- llm-wiki:start -->
[instructions and config here]
<!-- llm-wiki:end -->
```

**Rules:**
- Markers define exact boundaries for injection
- Re-running `init.mjs --agent <name>` removes old block and inserts new one
- Markers work with markdown (claude, opencode), rules (.cursorrules), JSON (config.json)
- Never manually edit content between markers

### Agent Capabilities
Each agent maps to native tools:

| Capability | Amp | Claude | OpenCode | Cursor |
|-----------|-----|--------|----------|--------|
| web_search | ✅ WebSearch | ✅ WebSearch | ✅ search | ✅ @web |
| http_fetch | ✅ fetch | ✅ WebFetch | ✅ fetch | ✅ @web |
| file_read | ✅ read | ✅ Read | ✅ read | ✅ read |
| file_write | ✅ write | ✅ Write | ✅ write | ✅ write |
| qmd_query | ✅ qmd MCP | ✅ qmd MCP | ✅ qmd MCP | ✅ qmd MCP |

## Code Organization

### init.mjs Standards

**Size limit:** Keep under 600 LOC

**Structure:**
1. Header + imports
2. CLI argument parsing
3. Helper functions (logging, command execution)
4. Main logic (setup, agent installation)
5. Error handling

**Style:**
- Explicit error messages with recovery suggestions
- Color output for readability (green ✓, yellow ⚠, red ✗, cyan info)
- Cross-OS path handling (use `join()`, not hardcoded `/` or `\`)
- `process.exit(1)` only for unrecoverable errors

### Documentation Standards

**Required docs:**
- `README.md` — Project overview + setup + quick start
- `wiki-schema.md` — All conventions + operations
- `docs/project-overview-pdr.md` — PDR + roadmap
- `docs/codebase-summary.md` — Architecture + file inventory
- `docs/code-standards.md` — This file
- `docs/system-architecture.md` — Diagrams + layer interactions

**Keeping docs current:**
- Update `wiki-schema.md` when adding new operations
- Update roadmap in PDR when completing phases
- Update codebase summary when restructuring
- Append to `wiki/log.md` after every operation

## Version Control Standards

**Commit messages:** Use conventional commit format

```
type(scope): subject

body (optional)
```

**Types:**
- `feat` — New feature or operation
- `fix` — Bug fix
- `docs` — Documentation only
- `refactor` — Code restructure (no behavior change)
- `test` — Test additions
- `chore` — Build, tooling (no wiki content change)

**Scope:** Typically the file or feature (e.g., `init`, `schema`, `docs`)

**Examples:**
```
feat(schema): add Update operation to wiki-schema.md
fix(init): resolve qmd command path on Windows npm
docs(readme): add Obsidian setup guide
refactor(agent-templates): deduplicate MCP config
```

**Rules:**
- Never commit secrets (.env, API keys, credentials)
- Keep commits focused on one logical change
- No AI references in messages

## Testing & Validation

### Manual Validation Checklist

Before committing changes:

- [ ] Read `wiki-schema.md` — does my change align with schema?
- [ ] Check frontmatter — required fields present?
- [ ] Verify wikilinks — all `[[links]]` point to existing pages?
- [ ] Run `grep` to check for orphan pages
- [ ] Git diff — are there unintended changes?
- [ ] No sensitive data (config.yaml, API keys, credentials)

### Lint Checks

**Automated lint operation validates:**
- [ ] All pages in index.md exist
- [ ] No orphan pages (exist on disk but not in index)
- [ ] Broken `[[wikilinks]]` (target page missing)
- [ ] Missing frontmatter fields
- [ ] Pages with `updated` date older than 90 days (stale claims)
- [ ] Knowledge gaps (concepts mentioned but no page)

## Best Practices

### When Creating Pages

1. **Search first** — Check wiki/index.md and qmd for duplicates
2. **Atomic** — One topic per page
3. **Link** — Add `[[wikilinks]]` to related pages and from related pages
4. **Source** — Cite which source(s) informed the page
5. **Update index** — Add entry to wiki/index.md
6. **Update log** — Append to wiki/log.md (if major operation)

### When Updating Pages

1. **Append** — Don't overwrite existing content
2. **Integrate** — New info should flow naturally from existing context
3. **Correct errors** — Fix factual mistakes, preserve original intent
4. **Update date** — Bump `updated` field
5. **Link new info** — Add wikilinks as appropriate

### When Deleting Pages

1. **Rare** — Default to marking deprecated, not deleting
2. **Update references** — Remove `[[wikilinks]]` to deleted page
3. **Update index** — Remove entry from wiki/index.md
4. **Log it** — Append to wiki/log.md explaining why
5. **Preserve history** — Git retains deleted content

### Discovery Best Practices

1. **Start narrow** — Begin with 3–5 high-priority topics
2. **Review inbox** — Approve candidates manually (learn dedup patterns)
3. **Lint after each run** — Identify gaps and contradictions
4. **Refine keywords** — Based on false positives, adjust topic keywords
5. **Monitor dedup** — If too aggressive, lower similarity threshold

---

**Document status:** Version 1.0 — Foundation standards complete.  
**Last updated:** 2026-04-07  
**Maintained by:** Technical Writer role
