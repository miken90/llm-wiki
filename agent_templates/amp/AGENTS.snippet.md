<!-- llm-wiki:start -->
## LLM Wiki Integration

### Context Gathering Priority
1. **Search LLM Wiki first** — load `llm-wiki` skill, search for prior knowledge on the topic (*"what do we already know?"*)
2. **Read `docs/` first** — architecture, conventions, decisions (*"why"*)
3. **Use cocoindex semantic search** — find relevant code chunks (*"what, where"*)
4. **Read full files** — only when need complete context
5. **Scout** — only when docs missing or stale

### Discovery Operations
- `discover` — find new sources → queue to inbox. Load `llm-wiki` skill first.
- `run` — full cycle: discover → approve → ingest → lint
- `status` — wiki health dashboard
- `register <project>` — scan project → propose topics → append to config.yaml
- `unregister <project>` — remove project's topics/feeds from config.yaml
<!-- llm-wiki:end -->
