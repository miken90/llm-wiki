# LLM Wiki

You have access to a shared knowledge wiki via the qmd MCP server.

## Config

- WIKI_ROOT: {{WIKI_ROOT}}
- Search: hybrid (qmd MCP for semantic, native tools for keyword/read/write)

## When to use

- Before non-trivial work → search wiki for prior knowledge
- When discovering durable knowledge → write back to wiki
- When asked to "ingest", "query wiki", "lint wiki", "search wiki", "add source"

## Tool Map

All tools work cross-project via absolute paths. WIKI_ROOT = {{WIKI_ROOT}}

| Task | Tool | Example |
|------|------|---------|
| Semantic search | qmd MCP `query` | `{"searches":[{"type":"vec","query":"..."}]}` |
| Keyword search | `grep` | Search in `{{WIKI_ROOT}}/wiki/` |
| Browse index | `read` | `{{WIKI_ROOT}}/wiki/index.md` |
| Read wiki page | `read` | `{{WIKI_ROOT}}/wiki/concepts/foo.md` |
| List pages | `glob` / `find` | `{{WIKI_ROOT}}/wiki/**/*.md` |
| Create page | `write` | `{{WIKI_ROOT}}/wiki/entities/foo.md` |
| Update page | `edit` / `patch` | `{{WIKI_ROOT}}/wiki/entities/foo.md` |

**Do NOT use** qmd `get` or `multi_get` — returns unsupported content type in some agents.

## Workflow

1. Search: qmd MCP `query` for semantic, `grep` for exact terms
2. Read: native file-read tool with full absolute path (prepend WIKI_ROOT to relative paths from qmd results)
3. Apply knowledge to current project task
4. Write back: native file tools with absolute path to WIKI_ROOT
5. Update index: edit {{WIKI_ROOT}}/wiki/index.md
6. Update log: append to {{WIKI_ROOT}}/wiki/log.md
7. Follow {{WIKI_ROOT}}/wiki-schema.md for all conventions

## Write Rules

- Read wiki-schema.md before first wiki write in a session
- Search before creating — update existing pages, don't duplicate
- One topic per page, use [[wikilinks]]
- Append new information — don't overwrite existing content
- Add YAML frontmatter (title, type, sources, created, updated, tags)
- Commit wiki changes separately from project changes

## Operations

- **Ingest source**: "ingest `<source_path>`" — source already in sources/
- **Ingest project**: "add `<project>` to wiki" or "ingest project at `<path>`" — agent scans project, presents docs found, user selects, agent copies to sources/ + ingests
- **Update project**: "update wiki with `<project>` changes" — agent diffs project vs sources, presents changes, user confirms, agent updates
- **Query**: Search via qmd + keyword search, read pages, synthesize answer with [[citations]]
- **Lint**: "lint wiki" — check orphans, broken links, stale claims, gaps
- **Organic**: During normal work, proactively write durable knowledge back (decisions, patterns, non-obvious fixes)

For all operations, read wiki-schema.md for detailed steps.

## Context Gathering Priority

1. **Search wiki first** — prior knowledge on the topic
2. Read project docs/ — architecture, conventions
3. Search project code — find relevant implementations
4. Read full files — only when need complete context
