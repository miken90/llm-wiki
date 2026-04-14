<!-- llm-wiki:start -->
## LLM Wiki Integration

- **WIKI_ROOT**: {{WIKI_ROOT}}
- Search: hybrid (qmd CLI for semantic, native tools for keyword/read/write)

### Context Gathering Priority
1. **Search wiki first** — prior knowledge on the topic
2. Read project docs/ — architecture, conventions
3. Search project code — find relevant implementations
4. Read full files — only when need complete context

### Behavioral Rules
- **Search before creating** — update existing wiki pages, don't duplicate
- **Minimal sufficient write** — match effort to source density
- **Self-audit** — "Could I update an existing page instead?", "Will this matter in 30 days?"
- If ambiguous, choose narrower non-destructive interpretation and state the assumption
- ❌ Don't create a concept page just because the source uses a new phrase → update existing + add alias
- ❌ Don't save every answer to wiki → save only durable, reusable outputs

### Tool Map (absolute paths, work cross-project)
- Semantic search: `qmd query "..." -c wiki --md` via shell
- Keyword search: grep in `{{WIKI_ROOT}}/wiki/`
- Read wiki page: `qmd get <file>` via shell (fallback: native read with `{{WIKI_ROOT}}/` prefix)
- Write wiki pages: native write/edit tools with `{{WIKI_ROOT}}/` prefix

### Operations
- **Ingest source**: "ingest `<path>`" — source already in sources/
  - Done: summary page exists, index + log updated, no duplicate pages
- **Query**: search wiki → read pages → synthesize answer with [[citations]]
  - Done: answer cites wiki pages; durable outputs saved
- **Lint**: "lint wiki" — orphans, broken links, stale claims, gaps
  - Done: errors/warnings/opportunities reported
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
| web_search | web_search (if available) |
| http_fetch | read_web_page (if available) |
| qmd_query | `qmd query` via shell |

Skip unavailable strategies, don't fail.
<!-- llm-wiki:end -->
