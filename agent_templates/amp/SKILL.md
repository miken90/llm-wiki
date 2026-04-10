---
name: llm-wiki
description: Query and maintain the shared LLM Wiki knowledge base from any project. Use when researching topics, before non-trivial work, or when discovering durable knowledge worth preserving. Trigger phrases - "search wiki", "query wiki", "ingest", "lint wiki", "add source", "wiki", "discover", "run", "status", "register", "unregister".
---

# LLM Wiki

## Config

- WIKI_ROOT: {{WIKI_ROOT}}
- Search: hybrid (qmd CLI for semantic, native tools for keyword/read/write)

## When to use

- Before non-trivial work → search wiki for prior knowledge
- When discovering durable knowledge → write back to wiki
- When asked to "ingest", "query wiki", "lint wiki", "search wiki", "add source"

## Tool Map

All tools work cross-project via absolute paths. WIKI_ROOT = {{WIKI_ROOT}}

| Task | Tool | Example |
|------|------|---------|
| Semantic search | `Bash` | `qmd query "..." -c wiki --md` |
| Keyword search | `Grep` | `pattern="...", path="{{WIKI_ROOT}}/wiki/"` |
| Browse index | `Read` | `path="{{WIKI_ROOT}}/wiki/index.md"` |
| Read wiki page | `Bash` or `Read` | `qmd get wiki/concepts/foo.md` (fallback: native Read) |
| List pages | `glob` | `filePattern="{{WIKI_ROOT}}/wiki/**/*.md"` |
| Create page | `create_file` | `path="{{WIKI_ROOT}}/wiki/entities/foo.md"` |
| Update page | `edit_file` | `path="{{WIKI_ROOT}}/wiki/entities/foo.md"` |

**Page fetch:** Use `qmd get <file>` via Bash for quick page retrieval. Fallback to native Read tool if Bash unavailable.

## Workflow

1. Search: `qmd query "..." -c wiki --md` via Bash for semantic, `Grep` for exact terms
2. Read: `qmd get <file>` via Bash or native Read tool with full absolute path
3. Apply knowledge to current project task
4. Write back: native file-create/edit tools with absolute path to WIKI_ROOT
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
- **Query**: Search via qmd + keyword search, read pages, synthesize answer with [[citations]]
- **Lint**: Read wiki-schema.md "Operation — Lint" section, follow steps

## Project Registration

- **Register**: "register `<project>`" / "add `<project>` to wiki" / "ingest project at `<path>`" — **all route to same flow**: syncs codebase docs first (scan → copy to sources/ → full 12-step ingest → wiki pages → `qmd embed`), then optionally proposes discovery topics
- **Unregister**: "unregister `<project>`" — remove project's registered topics/feeds from config.yaml

## Auto-Sync on Commit

After committing code, if `README.md` or `docs/*` changed and project is registered in wiki:
1. Check `sources/` for files with `source_url: "local://<project>/..."` 
2. If found → update source copies + wiki pages silently (no user prompt)
3. Re-index: `qmd update && qmd embed`
4. If not registered → skip silently

See wiki-schema.md "Auto-Sync on Significant Changes" for full spec.

## Discovery Operations (optional, run explicitly)

- **Discover**: "discover" or "find new sources" — search web/feeds/GitHub, queue to inbox
- **Run**: "run" or "run full cycle" — discover → approve → ingest → lint (max 2 rounds)
- **Status**: "status" or "wiki status" — page counts, health, capabilities

### Discovery Capability Map

| Capability | Tool |
|------------|------|
| web_search | `mcp__exa__web_search_exa` |
| http_fetch | `mcp__exa__crawling_exa` |
| file_read | `Read` |
| file_write | `create_file` / `edit_file` |
| qmd_query | `Bash` (`qmd query "..." -c wiki --md`) |

If a capability is unavailable, skip that strategy and continue. Report degraded mode in status.

### Discovery Paths

- Config: {{WIKI_ROOT}}/config.yaml
- State: {{WIKI_ROOT}}/.discoveries/
- Sources: {{WIKI_ROOT}}/sources/articles/

For all operations, read wiki-schema.md for detailed steps.
