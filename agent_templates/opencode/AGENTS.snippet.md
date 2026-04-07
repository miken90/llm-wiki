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
- Keyword search: grep in `{{WIKI_ROOT}}/wiki/`
- Read wiki page: `qmd get <file>` via shell (fallback: native read with `{{WIKI_ROOT}}/` prefix)
- Write wiki pages: native write/edit tools with `{{WIKI_ROOT}}/` prefix

### Operations
- **Ingest source**: "ingest `<path>`" — source already in sources/
- **Ingest project**: "add `<project>` to wiki" — scan project, present docs, user selects
- **Update project**: "update wiki with `<project>` changes" — diff vs sources, update
- **Query**: search wiki → read pages → synthesize answer with [[citations]]
- **Lint**: "lint wiki" — orphans, broken links, stale claims, gaps
- **Discover**: "discover" → search web/feeds/GitHub → queue candidates to inbox
- **Run**: "run" → discover → approve → ingest → lint (max 2 rounds)
- **Status**: "status" → page counts, health, capabilities
- **Register**: "register `<project>`" → scan project → propose topics → append to config.yaml
- **Unregister**: "unregister `<project>`" → remove project's registered topics/feeds
- **Organic**: proactively write durable knowledge during normal work

Read {{WIKI_ROOT}}/wiki-schema.md for detailed steps. Config: {{WIKI_ROOT}}/config.yaml

### Capability Map
| Capability | Tool |
|------------|------|
| web_search | web_search (if available) |
| http_fetch | read_web_page (if available) |
| qmd_query | `qmd query` via shell |

Skip unavailable strategies, don't fail.
<!-- llm-wiki:end -->
