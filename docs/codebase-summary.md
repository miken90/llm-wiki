# LLM Wiki — Codebase Summary

## Directory Structure

```
llm-wiki/
├── sources/                    # Raw source documents (immutable)
│   ├── articles/               # Auto-discovered web articles
│   ├── assets/                 # Downloaded images and attachments
│   └── *.md                    # Manually added sources
├── wiki/                       # LLM-maintained knowledge pages
│   ├── index.md                # Auto-maintained page catalog
│   ├── log.md                  # Append-only operations log
│   ├── entities/               # People, orgs, products
│   ├── concepts/               # Ideas, frameworks, patterns
│   ├── summaries/              # Per-source summaries
│   ├── syntheses/              # Cross-source analysis
│   └── decisions/              # Decision records
├── outputs/                    # Durable artifacts (reports, slides)
├── .discoveries/               # Discovery state (gitignored)
│   ├── history.json            # Processed URL registry
│   ├── inbox.json              # Candidate queue
│   └── gaps.json               # Knowledge gaps
├── agent_templates/            # Per-agent configs (4 agents)
│   ├── amp/                    # SKILL.md + AGENTS.snippet.md
│   ├── claude/                 # CLAUDE.snippet.md
│   ├── opencode/               # AGENTS.snippet.md
│   └── cursor/                 # .cursorrules.snippet
├── plans/                      # Implementation plans and reports
├── history/                    # Historical plans
├── .obsidian/                  # Obsidian vault settings (plugins, CSS)
├── config.example.yaml         # Discovery config template
├── config.yaml                 # User config (gitignored)
├── wiki-schema.md              # 566 LOC — Source of truth
├── init.mjs                    # 500 LOC — Setup script
├── README.md                   # 277 LOC — Project overview
└── docs/                       # This documentation
```

## Key Files

### wiki-schema.md (566 LOC)
**Single source of truth** for all conventions, page formats, and operations.

**Sections:**
- Philosophy & architecture (3 layers)
- Page conventions (frontmatter, types, content rules)
- Source rules (immutability, supported formats)
- Index/log rules (auto-maintained catalogs)
- Operations (8 detailed operation specs)
- Discovery (config-driven strategies, dedup, candidate lifecycle)
- Capability model (graceful degradation)
- Concurrency rules (single-writer for writes)

**Page types defined:**
- `entity` — People, organizations, products
- `concept` — Ideas, frameworks, patterns
- `summary` — Per-source distillation
- `synthesis` — Cross-source analysis
- `decision` — Architecture/business decisions

### init.mjs (500 LOC)
**Cross-OS setup script** — single entry point for qmd + agent skill installation.

**Capabilities:**
- OS detection (Windows, macOS, Linux, WSL)
- qmd resolution (direct command or via npm global)
- Collection creation (`wiki/`, `sources/`)
- Embedding build (`qmd embed`)
- Agent skill installation (amp, claude, opencode, cursor)
- Rules snippet injection (idempotent via markers)
- Update detection (`--check` mode)

**CLI:**
```bash
node init.mjs                   # qmd only
node init.mjs --agent amp       # qmd + Amp skill
node init.mjs --agent amp,claude # multiple agents
node init.mjs --check           # detect outdated skills
```

### agent_templates/ (4 agents)
Per-agent instruction files. Idempotent injection via `<!-- llm-wiki:start -->` markers.

**Amp:**
- `SKILL.md` — Full skill description
- `AGENTS.snippet.md` — Agent instructions

**Claude:**
- `CLAUDE.snippet.md` — Injected into `~/.claude/CLAUDE.md`

**OpenCode:**
- `AGENTS.snippet.md` — Injected into `~/.config/opencode/AGENTS.md`

**Cursor:**
- `.cursorrules.snippet` — Injected into `~/.cursor/.cursorrules`

### config.example.yaml
**Discovery configuration template** — copied to `config.yaml` (gitignored).

**Sections:**
- `wiki:` — Vault metadata (name, language)
- `topics:` — Keywords, priority, optional `registered_by` tracking (string or array for multi-project)
- `discovery:` — Strategies (web_search, feed_poll, github_watch), limits
- `feeds:` — RSS URLs, GitHub repos/orgs to watch

**Graceful degradation:** All sections optional. Missing config → operations degrade (skip unavailable strategies).

### wiki/
Wiki pages are LLM-maintained and organized by page type. Content varies based on what has been ingested. See `wiki/index.md` for current catalog.

### .discoveries/ (Runtime state)
**JSON files tracking discovery lifecycle:**

- `history.json` — Processed URLs: `{url, url_normalized, status, strategy, date_added}`
- `inbox.json` — Pending candidates: `{url, title, snippet, score, status, date_found}`
- `gaps.json` — Knowledge gaps: `{concept, priority, query_hints, detected_date}`

## Architecture Patterns

### Three-Layer Model
```
sources/           (immutable, human-curated)
  ↓
wiki/              (LLM-maintained, interlinked)
  ↓
outputs/           (durable artifacts: reports, slides)
```

Agents read from sources, write to wiki, optionally generate outputs. Humans curate sources and questions.

### Shared Knowledge Service
Any project repo can connect via qmd CLI to:
- **Query** — Search wiki pages
- **Read** — Fetch wiki page content
- **Write** — Update wiki pages via LLM ingest
- **Register** — Add project-specific topics to config
- **Unregister** — Remove project topics

Enables knowledge reuse across projects without centralizing development.

### Discovery Loop (Max 2 rounds)
```
Discover (search web/feeds/GitHub)
  ↓
Approve candidates (user review)
  ↓
Ingest approved candidates (run standard ingest for each)
  ↓
Lint (detect gaps, contradictions, orphans)
  ↓ (if critical gaps AND round 1)
Discover again (targeted by gaps)
  ↓
(done, no more rounds)
```

Prevents infinite loops while allowing gap-driven discovery.

### Idempotent Agent Installation
Agent templates use comment markers for surgery:
```markdown
<!-- llm-wiki:start -->
[instructions here]
<!-- llm-wiki:end -->
```

Re-running `init.mjs --agent amp` removes old block and inserts new one. No duplicates.

## Data Formats

### Page Frontmatter
**YAML, flat structure (no nesting):**
```yaml
---
title: "Page Title"
type: entity | concept | summary | synthesis | decision
sources: [source1.md, source2.md]
created: 2026-04-07
updated: 2026-04-07
tags: [tag1, tag2]
aliases: [Alternative Name]
---
```

**Required:** title, type, created, updated  
**Recommended:** sources, tags  
**Optional:** aliases, projects

### Content Rules
- One topic per page (atomic notes)
- UTF-8 encoding
- `[[wikilinks]]` for cross-references
- `[[target|Display Text]]` for custom display
- Append new info when updating (no overwrites)
- Dense, factual prose

### Index Entry Format
```markdown
- [[Page Title]] — one-line summary (N sources)
```
Entries sorted alphabetically by page type section.

### Log Entry Format
```markdown
## [YYYY-MM-DD] operation | subject

Details...
```
Append-only, parseable via `grep "^## \["`.

## Operations (8 Total)

| Operation | Trigger | Purpose | Write? |
|-----------|---------|---------|--------|
| **Ingest** | `ingest <path>` | Read source → create/update wiki pages | Yes |
| **Query** | Ask question | Search wiki → synthesize → cite | No |
| **Lint** | `lint wiki` | Detect orphans, broken links, gaps | No* |
| **Discover** | `discover` | Search web/feeds/GitHub → dedup → queue | Yes |
| **Run** | `run` | Full cycle: discover → approve → ingest → lint | Yes |
| **Status** | `status` | Dashboard: counts, health, last ops | No |
| **Register** | `register <project>` | Scan project → append topics to config | Yes |
| **Unregister** | `unregister <project>` | Remove project's topics from config | Yes |

*Lint reads `.discoveries/` (write-only if gaps.json updated)

**Concurrency:** Single-writer for write operations. Read operations concurrent-safe.

## Capability Model

**Abstract capabilities** — each agent maps to native tools:

| Capability | Purpose | Required | Fallback |
|------------|---------|----------|----------|
| web_search | Find new sources | No | Skip web_search strategy |
| http_fetch | Download content | No | Skip feed/GitHub strategies |
| file_read | Read config, sources, wiki | Yes | Fail operation |
| file_write | Write wiki, state | Yes | Fail operation |
| qmd_query | Semantic search + dedup | Yes | Fall back to file scan |

**Graceful degradation:** If a capability unavailable → skip that strategy, continue.

## Configuration

### config.yaml (Optional)
**Controls discovery behavior:**
- Topics with keywords and priority
- Strategies enabled (web_search, feed_poll, github_watch)
- Safety limits (max_candidates_per_run)
- Feeds (RSS, GitHub repos/orgs)
- Auto-ingest flag

**Missing config:** Operations degrade gracefully. ingest/query/lint work unchanged.

### Dedup Thresholds
**3-layer dedup in discover operation:**
1. URL exact match (100%)
2. Normalized title match (edit distance)
3. Semantic similarity via qmd:
   - Similarity > 0.9 → duplicate, skip
   - Similarity 0.6–0.9 → overlap, lower score
   - Similarity < 0.6 → novel, boost score

Thresholds tunable in schema.

## Version Control

- **Git tracking:** All wiki state (sources/, wiki/, .discoveries/) in git
- **Immutable sources:** Never overwrite files in sources/
- **Append-only log:** wiki/log.md records operations chronologically
- **.gitignore:** config.yaml, .discoveries/, .obsidian local settings

**Recovery:** Revert to any commit to restore prior wiki state.

## Cross-Platform Support

| Component | Windows | macOS | Linux | WSL |
|-----------|---------|-------|-------|-----|
| qmd | ✅ | ✅ | ✅ | ✅ |
| Node.js | ✅ | ✅ | ✅ | ✅ |
| Obsidian | ✅ native | ✅ native | ✅ AppImage | ✅ via Windows |
| Git | ✅ | ✅ | ✅ | ✅ |

**WSL + Windows:** Separate npm environments and qmd indexes. Run `init.mjs` on both sides.

## Search & Indexing

**Primary:** qmd CLI (BM25 + vector search + LLM re-ranking)  
**Fallback:** Native file reading and grep/awk if qmd unavailable

**Collections:**
- `wiki` — All wiki pages (entities, concepts, summaries, syntheses, decisions)
- `sources` — All source documents (for citation retrieval)

**Setup:** `qmd collection add wiki/ --name wiki && qmd embed`

**Scale:** At <100 pages, wiki/index.md sufficient for navigation. At scale, qmd provides semantic ranking.

---

**Document status:** Foundation complete.  
**Last updated:** 2026-04-08
