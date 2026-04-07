# Phase 05 — README & Documentation

> Parent: [plan.md](plan.md) | Depends on: [Phase 03](phase-03-agent-templates.md), [Phase 04](phase-04-init-bootstrap.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P2
- **Status:** pending
- **Effort:** 1h

Update README.md to document discovery operations, config.yaml usage, and the recommended workflow.

## Requirements

1. Add Discovery section to README explaining discover/run/status
2. Document config.yaml setup (copy example, configure topics)
3. Update Directory Structure to include .discoveries/
4. Update Operations table with new operations
5. Add recommended workflow (happy path)

## Related Code Files

- `README.md` — main file to edit

## Implementation Steps

### 1. Update Directory Structure

Add `.discoveries/` and `config.yaml` entries:

```
llm-wiki/
├── sources/              # Raw source documents (immutable)
│   ├── articles/         # Auto-discovered web articles
│   ├── assets/           # Downloaded images and attachments
│   └── *.md              # Manually added source files
├── wiki/                 # LLM-maintained knowledge pages
│   └── ...
├── outputs/              # Durable query artifacts
├── .discoveries/         # Discovery state (gitignored)
│   ├── history.json      # Processed source dedup registry
│   ├── inbox.json        # Candidate queue (pending approval)
│   └── gaps.json         # Knowledge gaps from lint
├── agent_templates/      # Per-agent config templates
├── config.example.yaml   # Discovery config template
├── config.yaml           # Your discovery config (gitignored)
├── wiki-schema.md        # Source of truth for all conventions
└── README.md
```

### 2. Update Operations Table

```markdown
| Operation | Trigger | What it does |
|-----------|---------|-------------|
| **Ingest** | `ingest <source_path>` | Read source → discuss → create/update wiki pages |
| **Query** | Ask a question | Search wiki → synthesize answer with citations |
| **Lint** | `lint wiki` | Check orphans, broken links, contradictions, gaps |
| **Discover** | `discover` | Search web/feeds/GitHub → dedup → queue candidates |
| **Run** | `run` | Full cycle: discover → approve → ingest → lint |
| **Status** | `status` | Dashboard: page counts, health, capabilities |
```

### 3. Add Discovery Section

Add after Operations section:

```markdown
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

See `config.example.yaml` for full options.
```

### 4. Add sources/articles/ to Directory Structure

Create `sources/articles/.gitkeep` so the directory exists for discovered content.

## Todo

- [ ] Update Directory Structure in README
- [ ] Update Operations table
- [ ] Add Discovery section with setup + workflow + config example
- [ ] Create `sources/articles/.gitkeep`
- [ ] Verify README renders correctly in GitHub

## Success Criteria

- README documents discover/run/status operations
- Config setup is clear (3 steps)
- Workflow is documented (happy path)
- Directory structure reflects new additions
- No broken links or references

## Risk Assessment

| Component | Risk | Mitigation |
|-----------|------|------------|
| README length | LOW | Keep discovery section concise (~40 lines) |
| Overpromising | LOW | Be explicit about approval flow and capabilities |

## Security Considerations

- None

## Next Steps

→ Plan complete. Ready for implementation.
