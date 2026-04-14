<!-- llm-wiki:start -->
## LLM Wiki Integration

### Context Gathering Priority
1. **Search LLM Wiki first** — load `llm-wiki` skill, search for prior knowledge on the topic (*"what do we already know?"*)
2. **Read `docs/` first** — architecture, conventions, decisions (*"why"*)
3. **Use cocoindex semantic search** — find relevant code chunks (*"what, where"*)
4. **Read full files** — only when need complete context
5. **Scout** — only when docs missing or stale

### Behavioral Rules
- **Search before creating** — update existing wiki pages, don't duplicate
- **Minimal sufficient write** — match effort to source density
- **Self-audit** — "Could I update an existing page instead?", "Will this matter in 30 days?"
- If ambiguous, choose narrower non-destructive interpretation and state the assumption
- ❌ Don't create a concept page just because the source uses a new phrase → update existing + add alias
- ❌ Don't save every answer to wiki → save only durable, reusable outputs

### Project Registration
- `register <project>` / `add <project> to wiki` — **syncs codebase docs first**, then optionally proposes discovery topics
- `unregister <project>` — remove project's topics/feeds from config.yaml

### Auto-Sync on Commit
After committing, if `README.md` or `docs/*` changed and project is registered → update wiki silently.
See wiki-schema.md "Auto-Sync on Significant Changes".

### Discovery Operations (optional)
- `discover` — find new sources → queue to inbox. Load `llm-wiki` skill first.
- `run` — full cycle: discover → approve → ingest → lint
- `status` — wiki health dashboard
<!-- llm-wiki:end -->
