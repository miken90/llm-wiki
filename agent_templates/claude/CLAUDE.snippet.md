<!-- llm-wiki:start -->
## LLM Wiki Integration

- **WIKI_ROOT**: {{WIKI_ROOT}}
- Search: hybrid (qmd CLI for semantic, native tools for keyword/read/write)

### Context Gathering Priority
1. **Search wiki first** — prior knowledge on the topic
2. Read project docs/ — architecture, conventions
3. Search project code — find relevant implementations
4. Read full files — only when need complete context

### Tool Map (absolute paths, work cross-project)
- Semantic search: `qmd query "..." -c wiki --md` via shell
- Keyword search: Grep in `{{WIKI_ROOT}}/wiki/`
- Read wiki page: `qmd get <file>` via shell (fallback: native Read with `{{WIKI_ROOT}}/` prefix)
- Write wiki pages: native Write/Edit tools with `{{WIKI_ROOT}}/` prefix

### Operations
- **Ingest source**: "ingest `<path>`" — source already in sources/
- **Query**: search wiki → read pages → synthesize answer with [[citations]]
- **Lint**: "lint wiki" — orphans, broken links, stale claims, gaps
- **Organic**: proactively write durable knowledge during normal work

### Project Registration
- **Register**: "register `<project>`" / "add `<project>` to wiki" — **syncs codebase docs first** (scan → ingest → wiki pages), then optionally proposes discovery topics
- **Update**: "update wiki with `<project>` changes" — diff vs sources, update
- **Unregister**: "unregister `<project>`" → remove project's registered topics/feeds

### Auto-Sync on Commit
After committing code, if `README.md` or `docs/*` changed and project is registered in wiki:
1. Check `{{WIKI_ROOT}}/sources/` for files with `source_url: "local://<project>/..."`
2. If found → update source copies + wiki pages silently (no user prompt)
3. Re-index: `qmd update && qmd embed`
4. If not registered → skip silently

### Discovery Operations (optional, run explicitly)
- **Discover**: "discover" → search web/feeds/GitHub → queue candidates to inbox
- **Run**: "run" → discover → approve → ingest → lint (max 2 rounds)
- **Status**: "status" → page counts, health, capabilities

Read {{WIKI_ROOT}}/wiki-schema.md for detailed steps. Config: {{WIKI_ROOT}}/config.yaml

### Capability Map
| Capability | Tool |
|------------|------|
| web_search | WebSearch |
| http_fetch | WebFetch |
| qmd_query | `qmd query` via shell |

Skip unavailable strategies, don't fail.
<!-- llm-wiki:end -->
