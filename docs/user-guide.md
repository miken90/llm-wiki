# LLM Wiki — User Guide

A practical guide to using all wiki operations from your LLM agent.

## Getting Started

After setup (`node init.mjs --agent <name>`), open your agent in any project repo. The wiki is accessible from anywhere via qmd CLI.

**Quick test:**
```
search wiki for LLM Wiki
```

## Operations at a Glance

| Operation | What you say | What happens |
|-----------|-------------|--------------|
| **Ingest** | `ingest path/to/source.md` | Source → wiki pages |
| **Ingest project** | `add my-project to wiki` | Scan project docs → select → ingest |
| **Query** | Ask any question | Search wiki → synthesize answer |
| **Lint** | `lint wiki` | Health check: orphans, broken links, gaps |
| **Discover** | `discover` | Search web/feeds/GitHub → queue candidates |
| **Run** | `run` | Full cycle: discover → approve → ingest → lint |
| **Status** | `status` | Dashboard: page counts, health |
| **Register** | `register` | Scan project → propose topics → add to config |
| **Unregister** | `unregister my-project` | Remove project's topics from config |
| **Update** | `update wiki with my-project changes` | Diff project vs wiki → update |

## Ingest a Source

Add a document to the wiki's knowledge base.

### Ingest a file

Place the source file in `sources/`, then:

```
ingest sources/my-article.md
```

**What happens:**
1. Agent reads the source and discusses key takeaways with you
2. Creates/updates wiki pages (entities, concepts, summaries, decisions)
3. Adds `[[wikilinks]]` between related pages
4. Updates `wiki/index.md` and `wiki/log.md`

**Tip:** Aim for 10–15 wiki pages per source. The agent extracts entities, concepts, and synthesis automatically.

### Ingest a project

From any project repo:

```
add my-project to wiki
```

**What happens:**
1. Agent scans your project for docs (README, docs/, CHANGELOG, etc.)
2. Shows you what it found — you pick which files to ingest
3. Copies selected files to `sources/` with proper frontmatter
4. Runs standard ingest for each

## Query the Wiki

Just ask a question:

```
How does the plugin architecture work?
What are the trade-offs between RAG and wiki patterns?
Compare PostgreSQL and MongoDB for our use case
```

**Output formats:**
- **Markdown page** (default) — structured answer with `[[citations]]`
- **Comparison table** — for "compare X vs Y" questions
- **Marp slides** — for "create a presentation about X"

**Tip:** Good answers get filed back to the wiki automatically. Your explorations compound.

## Lint the Wiki

Run a health check:

```
lint wiki
```

**What it checks:**
- Pages listed in `index.md` exist on disk
- No orphan pages (on disk but not indexed)
- All `[[wikilinks]]` resolve to real pages
- Frontmatter has required fields (title, type, created, updated)
- Contradictions across pages
- Stale claims (pages not updated in >90 days)
- Knowledge gaps (concepts mentioned but no page exists)

**Output:** Error count, warnings, suggestions, and a research backlog.

## Discovery: Find New Sources

### Configure topics

Edit `config.yaml` (copy from `config.example.yaml` if you haven't):

```yaml
topics:
  - name: "AI Agents"
    keywords: ["LLM agents", "agentic AI", "tool use"]
    priority: high

  - name: "Rust Systems"
    keywords: ["Rust", "systems programming", "async"]
    priority: medium

feeds:
  rss:
    - url: "https://blog.anthropic.com/rss"
      name: "Anthropic Blog"
  github_repos:
    - repo: "anthropic-ai/anthropic-sdk-python"
      watch: [releases]
```

### Discover sources

```
discover
```

**What happens:**
1. Reads your topics and keywords from `config.yaml`
2. Searches web, polls RSS feeds, checks GitHub repos
3. Deduplicates against existing sources (3-layer: URL, title, semantic)
4. Scores candidates (relevance × recency × novelty)
5. Queues to `.discoveries/inbox.json` for your review

### Run full cycle

```
run
```

**What happens:**
1. Discovers new candidates (if inbox empty)
2. Shows you the inbox — approve, select by number, or reject
3. Fetches and ingests approved candidates
4. Runs lint to find new gaps
5. If critical gaps found: discovers again (max 2 rounds)
6. Generates summary report in `outputs/`

### Check status

```
status
```

**Output:**
```
Wiki Status
───────────
Pages:      16 total (1 entities, 9 concepts, 2 summaries, 0 syntheses, 2 decisions)
Sources:    17 total (0 manual, 0 auto-discovered)
Inbox:      0 pending candidates
Gaps:       0 open knowledge gaps
Last lint:  2026-04-07
Capabilities: web_search ✓, http_fetch ✓, qmd ✓
Health:     Good
```

## Register: Multi-Project Setup

Register lets any project push its topics into the wiki's `config.yaml`, eliminating manual editing.

### Register a project

From your project repo:

```
register
```

**What happens:**
1. Agent detects project name (from package.json, directory name, or git remote)
2. Scans for topic signals:
   - `README.md` → technology stack, domain keywords
   - `package.json` / `Cargo.toml` / `go.mod` → dependencies
   - `docs/` → domain concepts
3. Proposes topics:
   ```
   Detected topics for my-react-app:
   | # | Topic               | Keywords                    | Priority |
   | 1 | React Performance   | RSC, Suspense, hydration    | high     |
   | 2 | TypeScript Patterns  | generics, type inference    | medium   |
   Approve all / select by number / edit / skip?
   ```
4. You approve or edit
5. Appends to `config.yaml` with `registered_by` and `registered_at` tracking
6. Dedup: skips if topic already exists with matching name + project

### Unregister a project

```
unregister my-react-app
```

**What happens:**
1. Finds all topics/feeds tagged with `registered_by: "my-react-app"`
2. Shows you the list for confirmation
3. Removes only those entries — manually added topics are never touched

### How registration works

Topics added by register include tracking fields:

```yaml
topics:
  - name: "React Performance"
    keywords: ["RSC", "Suspense", "hydration"]
    priority: high
    registered_by: "my-react-app"    # ← which project added this
    registered_at: "2026-04-07"      # ← when
```

These fields are **optional** — existing topics without them still work perfectly.

**Dedup rules:**
- Same topic name + same `registered_by` → skip (already registered)
- Keyword overlap > 80% (Jaccard similarity) with existing topic → warn, you decide

## Update a Project's Wiki Pages

When project docs change:

```
update wiki with my-project changes
```

**What happens:**
1. Finds existing sources for this project
2. Compares current project state vs what's in wiki
3. Shows a change summary (NEW / CHANGED / STALE files)
4. You select which updates to apply
5. Updates sources and wiki pages accordingly

## Organic Knowledge Growth

During normal work in any project, your agent may discover knowledge worth preserving:

- A non-obvious bug fix with root cause analysis
- An architecture decision and its rationale
- A pattern that could apply to other projects
- A comparison that took significant effort

The agent should **proactively write these back** to the wiki without waiting for an explicit ingest command. This is how the wiki compounds over time.

## Workflow Examples

### Starting a new project

```
1. register                      # Add project topics to wiki config
2. discover                      # Find relevant sources
3. run                           # Ingest approved sources
4. status                        # Check wiki health
```

### Weekly maintenance

```
1. lint wiki                     # Find issues
2. discover                      # Find new sources for gaps
3. run                           # Ingest + lint cycle
```

### Research deep-dive

```
1. ingest sources/paper.md       # Add a new source
2. What are the key findings?    # Query the wiki
3. Compare X with Y              # Cross-reference
4. lint wiki                     # Check for gaps
```

### Removing a project

```
1. unregister my-old-project     # Remove topics from config
```

Sources and wiki pages already ingested remain — only config entries are removed.

## Tips

- **Search before creating** — always check if a page exists before making a new one
- **Start with 3–5 topics** — narrow focus yields better discovery results
- **Review inbox manually** at first — learn dedup patterns before enabling `auto_ingest`
- **Lint after every run** — catches contradictions and gaps early
- **Use Obsidian Graph View** — reveals topic clusters and orphan pages visually
- **Commit wiki changes separately** from project code changes

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Agent can't find wiki | Run `node init.mjs --check --agent <name>` |
| No search results | Re-index: `node init.mjs` (rebuilds embeddings) |
| Stale skill file | Run `node init.mjs --agent <name>` to update |
| Discovery finds nothing | Check `config.yaml` has topics with keywords |
| Broken wikilinks | Run `lint wiki` to find and fix them |
| Config.yaml missing | Run `cp config.example.yaml config.yaml` |

---

**Last updated:** 2026-04-07
