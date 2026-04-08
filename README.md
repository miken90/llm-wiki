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
                      │ search via qmd CLI
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

**Shared knowledge service:** This wiki repo is a central knowledge base. Agents working in *other* project repos connect via qmd CLI to search, read, and write wiki pages.

## Directory Structure

```
llm-wiki/
├── sources/              # Raw source documents (immutable)
│   ├── articles/         # Auto-discovered web articles
│   ├── assets/           # Downloaded images and attachments
│   └── *.md              # Manually added source files
├── wiki/                 # LLM-maintained knowledge pages
│   ├── index.md          # Auto-maintained page catalog
│   ├── log.md            # Append-only operations log
│   ├── entities/         # People, orgs, products
│   ├── concepts/         # Ideas, frameworks, patterns
│   ├── summaries/        # Per-source summary pages
│   ├── syntheses/        # Cross-source synthesis pages
│   └── decisions/        # Architecture/business decisions
├── outputs/              # Durable query artifacts (reports, slides)
├── .discoveries/         # Discovery state (gitignored)
│   ├── history.json      # Processed source dedup registry
│   ├── inbox.json        # Candidate queue (pending approval)
│   └── gaps.json         # Knowledge gaps from lint
├── agent_templates/      # Per-agent config templates
├── config.example.yaml   # Discovery config template
├── config.yaml           # Your discovery config (gitignored)
├── wiki-schema.md        # Source of truth for all conventions
└── README.md             # This file
```

## Prerequisites

- **Git** — version control
- **Node.js ≥ 22** — required for qmd
- **qmd** — markdown search engine
- **Obsidian** (optional) — human browsing, graph view

## Quick Start

All platforms, one command:

```bash
# qmd setup only
node init.mjs

# qmd + install agent skill (amp, claude, opencode, cursor)
node init.mjs --agent amp
node init.mjs --agent amp,claude    # multiple agents

# check if installed skills are up to date
node init.mjs --check               # all agents
node init.mjs --check --agent amp   # specific agent

# update outdated skills
node init.mjs --agent amp           # re-run to update
```

The script auto-detects your OS, installs qmd if missing, indexes wiki + sources, builds embeddings, and (with `--agent`) installs the skill file and rules snippet for your agent.

> **WSL + Windows:** Run once on each side. WSL and Windows have separate npm environments and qmd indexes. Example: `node init.mjs --agent amp` on WSL, then `node init.mjs --agent claude` in PowerShell.

### Keeping Skills Updated

When templates in `agent_templates/` are updated (new operations, bug fixes), installed skill files become outdated. Run `--check` to detect and `--agent` to update:

```bash
$ node init.mjs --check
⚠ amp: outdated — run: node init.mjs --agent amp
✓ claude: up to date
⚠ cursor: not installed — run: node init.mjs --agent cursor
```

### Verify

Open your agent in any project repo and ask: *"search wiki for LLM Wiki"* — it should return results from this wiki.

## Operations

All operations are defined in `wiki-schema.md`. Summary:

| Operation | Trigger | What it does |
|-----------|---------|-------------|
| **Ingest** | `ingest <source_path>` | Read source → discuss with user → create/update wiki pages → update index + log |
| **Query** | Ask a question | Search wiki → read pages → synthesize answer → optionally file back |
| **Lint** | `lint wiki` | Check orphans, broken links, frontmatter, contradictions, stale claims, data gaps |
| **Discover** | `discover` | Search web/feeds/GitHub → dedup → queue candidates to inbox |
| **Run** | `run` | Full cycle: discover → approve → ingest → lint (max 2 rounds) |
| **Status** | `status` | Dashboard: page counts, health, capabilities |
| **Register** | `register <project>` | Scan project → propose topics/feeds → append to config.yaml |
| **Unregister** | `unregister <project>` | Remove project's registered topics/feeds from config.yaml |

## Discovery

The wiki can actively find new sources based on topics you configure.

### Setup

1. Copy the example config: `cp config.example.yaml config.yaml`
2. Edit `config.yaml` — add your topics and keywords
3. Run `discover` in your agent to find new sources

### Workflow

```
discover → review inbox → approve → run → wiki grows
```

1. **Configure**: Edit `config.yaml` with topics, feeds, GitHub repos to watch
2. **Discover**: Agent searches web/feeds/GitHub for new sources
3. **Review**: Candidates queue in `.discoveries/inbox.json` for approval
4. **Run**: Approved candidates get ingested into wiki, then lint runs
5. **Repeat**: Lint finds gaps → discover fills them → wiki compounds

### Config Example

```yaml
topics:
  - name: "AI Agents"
    keywords: ["LLM agents", "agentic AI", "tool use"]
    priority: high

discovery:
  strategies: [web_search, feed_poll, github_watch]
  auto_ingest: false  # review before ingest (recommended)
```

See `config.example.yaml` for full options. Config is optional — operations degrade gracefully without it.

### Multi-Project Setup

Each project can register its own topics into the shared wiki:

```
# From any project repo, ask your agent:
register my-react-app
register my-api-server
```

Topics are tagged with `registered_by` (array format) for traceability. Multiple projects can share the same topic — the second registration appends to the array instead of skipping. To remove a project's topics:

```
unregister my-react-app
```

The wiki compounds knowledge across all registered projects. See `wiki-schema.md` for the full Register and Unregister operation steps.

## Use Cases

- **Research** — deep-dive a topic over weeks, building a comprehensive wiki with evolving thesis
- **Book reading** — file each chapter, build pages for characters, themes, plot threads
- **Business/team** — internal wiki fed by meeting transcripts, project docs, customer calls
- **Competitive analysis** — structured comparison across competitors
- **Course notes** — accumulate and organize learning over time

## Obsidian Setup

### 1. Install Obsidian

Download from [obsidian.md](https://obsidian.md/) — available for Windows, macOS, Linux.

> **WSL users:** Obsidian runs on Windows side. The wiki at `D:\WORKSPACES\AI\llm-wiki` is the same folder as `/mnt/d/WORKSPACES/AI/llm-wiki` in WSL.

### 2. Open as Vault

1. Launch Obsidian
2. Click **Open folder as vault** (or File → Open Vault → Open folder as vault)
3. Select the `llm-wiki` folder (e.g., `D:\WORKSPACES\AI\llm-wiki`)
4. Obsidian loads — pre-configured settings apply automatically:
   - `[[wikilinks]]` enabled
   - New files default to `wiki/`
   - Attachments save to `sources/assets/`

### 3. Enable Community Plugins

Obsidian ships with community plugins disabled by default:

1. Settings (⚙️) → **Community plugins**
2. Click **Turn on community plugins** → confirm
3. Click **Browse** and install:

| Plugin | What it does | Why you want it |
|--------|-------------|-----------------|
| **Dataview** | Query frontmatter with SQL-like syntax | Dynamic tables: list all entities, filter by tag, sort by date |
| **Obsidian Git** | Auto-commit + push/pull from Obsidian | Keep wiki synced without leaving Obsidian |
| **Marp Slides** | Render Marp slide decks in Obsidian | Generate presentations from wiki content |

4. After installing each plugin, click **Enable**

### 4. Verify

- Open `wiki/index.md` — you should see the page catalog
- Click any `[[wikilink]]` — it should navigate to the target page
- Open **Graph View** (Ctrl/Cmd+G) — you should see nodes for existing pages
- Try creating a test file — it should land in `wiki/`
- Drag an image into a page — it should save to `sources/assets/`

### Tips & Tricks

- **Web Clipper**: Install [Obsidian Web Clipper](https://obsidian.md/clipper) browser extension to clip web articles directly to `sources/`
- **Download images**: Settings → Hotkeys → search "Download" → bind **Ctrl+Shift+D** to "Download attachments for current file" — images save to `sources/assets/`
- **Graph view**: Best way to see wiki structure — hubs, orphans, clusters. Filter by folder to see only `wiki/`
- **Dataview queries**: Add to any page to create dynamic lists:
  ```
  ```dataview
  TABLE type, updated, tags
  FROM "wiki"
  SORT updated DESC
  ```
  ```

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
