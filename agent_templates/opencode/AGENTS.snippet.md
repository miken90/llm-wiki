<!-- llm-wiki:start -->
## LLM Wiki Integration

- **WIKI_ROOT**: {{WIKI_ROOT}}
- Search: hybrid (qmd MCP `query` for semantic, native tools for keyword/read/write)

### Context Gathering Priority
1. **Search wiki first** — prior knowledge on the topic
2. Read project docs/ — architecture, conventions
3. Search project code — find relevant implementations
4. Read full files — only when need complete context

### Tool Map (absolute paths, work cross-project)
- Semantic search: qmd MCP `query` tool
- Keyword search: grep in `{{WIKI_ROOT}}/wiki/`
- Read/write wiki pages: native read/write/edit tools with `{{WIKI_ROOT}}/` prefix
- Do NOT use qmd `get` or `multi_get` — returns unsupported content type

### Operations
- **Ingest source**: "ingest `<path>`" — source already in sources/
- **Ingest project**: "add `<project>` to wiki" — scan project, present docs, user selects
- **Update project**: "update wiki with `<project>` changes" — diff vs sources, update
- **Query**: search wiki → read pages → synthesize answer with [[citations]]
- **Lint**: "lint wiki" — orphans, broken links, stale claims, gaps
- **Discover**: "discover" → search web/feeds/GitHub → queue candidates to inbox
- **Run**: "run" → discover → approve → ingest → lint (max 2 rounds)
- **Status**: "status" → page counts, health, capabilities
- **Organic**: proactively write durable knowledge during normal work

Read {{WIKI_ROOT}}/wiki-schema.md for detailed steps. Config: {{WIKI_ROOT}}/config.yaml

### Capability Map
| Capability | Tool |
|------------|------|
| web_search | web_search (if available) |
| http_fetch | read_web_page (if available) |
| qmd_query | qmd MCP `query` |

Skip unavailable strategies, don't fail.
<!-- llm-wiki:end -->
