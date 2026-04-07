# LLM Wiki

A personal knowledge wiki maintained by LLM agents, based on [Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

> "Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase." — Andrej Karpathy

## What is this?

Most LLM-document workflows are RAG: retrieve chunks at query time, generate an answer, forget everything. Knowledge is re-derived from scratch on every question.

LLM Wiki is different. The LLM **incrementally builds and maintains a persistent wiki** — structured, interlinked markdown files that sit between you and the raw sources. When you add a source, the LLM reads it, extracts key information, and integrates it into the existing wiki. The knowledge is compiled once and kept current, not re-derived on every query.

The wiki is a **persistent, compounding artifact**. Cross-references are already there. Contradictions have been flagged. The synthesis reflects everything you've read. It gets richer with every source you add and every question you ask.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   wiki-schema.md                     │
│              (conventions & operations)              │
└─────────────────────┬───────────────────────────────┘
                      │ governs
          ┌───────────┼───────────┐
          ▼           ▼           ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ sources/ │ │  wiki/   │ │ outputs/ │
   │ (raw,    │→│ (LLM-    │→│ (reports,│
   │ immutable│ │ maintained│ │ slides)  │
   └──────────┘ └──────────┘ └──────────┘
                      ▲
                      │ search/read/write via qmd MCP
          ┌───────────┼───────────┐
          │           │           │
     ┌────┴───┐ ┌────┴───┐ ┌────┴───┐
     │  Amp   │ │ Claude │ │ Cursor │  ... (any project repo)
     │Project │ │Project │ │Project │
     └────────┘ └────────┘ └────────┘
```

**Three layers:**

| Layer | Directory | Who writes | Purpose |
|-------|-----------|-----------|---------|
| Raw sources | `sources/` | Human | Immutable source documents — articles, papers, notes |
| Wiki | `wiki/` | LLM agents | Structured, interlinked knowledge pages |
| Schema | `wiki-schema.md` | Human + LLM | Conventions, operations, rules |

**Shared knowledge service:** This wiki repo is a central knowledge base. Agents working in *other* project repos connect via the qmd MCP server to search, read, and write wiki pages.

## Directory Structure

```
llm-wiki/
├── sources/              # Raw source documents (immutable)
│   ├── assets/           # Downloaded images and attachments
│   └── *.md              # Source files
├── wiki/                 # LLM-maintained knowledge pages
│   ├── index.md          # Auto-maintained page catalog
│   ├── log.md            # Append-only operations log
│   ├── entities/         # People, orgs, products
│   ├── concepts/         # Ideas, frameworks, patterns
│   ├── summaries/        # Per-source summary pages
│   ├── syntheses/        # Cross-source synthesis pages
│   └── decisions/        # Architecture/business decisions
├── outputs/              # Durable query artifacts (reports, slides)
├── agent_templates/      # Per-agent config templates
├── wiki-schema.md        # Source of truth for all conventions
└── README.md             # This file
```

## Prerequisites

- **Git** — version control
- **Node.js ≥ 22** — required for qmd
- **qmd** — markdown search engine with MCP server
- **Obsidian** (optional) — human browsing, graph view

## Quick Start

### 1. Install qmd

```bash
npm install -g @tobilu/qmd
```

### 2. Index the wiki

```bash
cd /path/to/llm-wiki
qmd collection add wiki/ --name wiki
qmd collection add sources/ --name sources
qmd context add qmd://wiki "LLM-maintained knowledge base"
qmd context add qmd://sources "Raw source documents"
qmd embed
```

### 3. Connect your agent

Copy the appropriate template from `agent_templates/` to your agent's config directory. See `agent_templates/README.md` for per-agent instructions.

### 4. Verify

Open your agent in any project repo and ask: *"search wiki for LLM Wiki"* — it should return results from this wiki.

## Operations

All operations are defined in `wiki-schema.md`. Summary:

| Operation | Trigger | What it does |
|-----------|---------|-------------|
| **Ingest** | `ingest <source_path>` | Read source → discuss with user → create/update wiki pages → update index + log |
| **Query** | Ask a question | Search wiki → read pages → synthesize answer → optionally file back |
| **Lint** | `lint wiki` | Check orphans, broken links, frontmatter, contradictions, stale claims, data gaps |

## Use Cases

- **Research** — deep-dive a topic over weeks, building a comprehensive wiki with evolving thesis
- **Book reading** — file each chapter, build pages for characters, themes, plot threads
- **Business/team** — internal wiki fed by meeting transcripts, project docs, customer calls
- **Competitive analysis** — structured comparison across competitors
- **Course notes** — accumulate and organize learning over time

## Obsidian Setup

1. Open this folder as an Obsidian vault (File → Open Vault → Open folder as vault)
2. Wikilinks are pre-configured (`[[wikilinks]]` enabled)
3. Attachments auto-save to `sources/assets/`

### Recommended Plugins

Install from Obsidian's Community Plugins browser:

| Plugin | Purpose |
|--------|---------|
| **Dataview** | Query page frontmatter — dynamic tables, lists, dashboards |
| **Obsidian Git** | Auto-commit, pull/push from within Obsidian |
| **Marp Slides** | Generate slide decks from wiki markdown |

### Tips

- **Web Clipper**: Install [Obsidian Web Clipper](https://obsidian.md/clipper) browser extension to clip web articles directly to `sources/`
- **Download images**: In Settings → Hotkeys, bind Ctrl+Shift+D to "Download attachments for current file" — images save to `sources/assets/`
- **Graph view**: Use Obsidian's graph view to see wiki structure — hubs, orphans, clusters

## Cross-OS Compatibility

| Tool | Windows | macOS | Linux | WSL |
|------|---------|-------|-------|-----|
| qmd | ✅ | ✅ | ✅ | ✅ |
| Obsidian | ✅ native | ✅ native | ✅ AppImage | ✅ via Windows |
| Git | ✅ | ✅ | ✅ | ✅ |
| Node.js ≥22 | ✅ | ✅ | ✅ | ✅ |

## Philosophy

- **Wiki = codebase, LLM = programmer, Human = curator**
- Knowledge **compounds** — unlike RAG, which re-derives from scratch every time
- Human curates sources and asks questions; LLM does the bookkeeping
- The maintenance burden that kills human wikis is near-zero for LLMs
- Related in spirit to Vannevar Bush's Memex (1945) — personal, curated, with connections as valuable as the documents themselves

## License

Private knowledge base. Not intended for redistribution.
