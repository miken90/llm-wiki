# Phase 01 — Config & State Infrastructure

> Parent: [plan.md](plan.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P1
- **Status:** pending
- **Effort:** 1.5h

Create `config.example.yaml` and `.discoveries/` state directory with explicit JSON contracts.

## Requirements

1. `config.example.yaml` — declarative topic/feed/strategy configuration
2. `.discoveries/` — state directory with 3 JSON files
3. `.gitignore` updates — ignore runtime state, keep templates

## Architecture

### config.example.yaml schema

```yaml
wiki:
  name: "My LLM Wiki"
  language: "en"                    # content language

topics:
  - name: "Topic Name"
    keywords: ["kw1", "kw2", "kw3"]
    priority: high                  # high | medium | low

discovery:
  strategies: [web_search, feed_poll, github_watch]
  max_candidates_per_run: 20       # safety limit
  auto_ingest: false               # require approval by default
  recency: "month"                 # prefer recent sources

feeds:
  rss: []
    # - url: "https://blog.example.com/rss"
    #   name: "Example Blog"
  github_repos: []
    # - repo: "owner/repo"
    #   watch: [releases, readme]
  github_orgs: []
    # - org: "anthropic"
    #   watch: [new_repos, releases]
```

### .discoveries/ JSON contracts

#### history.json
```json
{
  "version": 1,
  "entries": [
    {
      "url": "https://example.com/article",
      "url_normalized": "example.com/article",
      "title": "Article Title",
      "source_slug": "2026-04-07-article-title",
      "status": "ingested",
      "strategy": "web_search",
      "topic": "AI Agents",
      "discovered_at": "2026-04-07T10:00:00Z",
      "ingested_at": "2026-04-07T10:30:00Z"
    }
  ]
}
```

**Status values:** `discovered` → `approved` → `ingested` | `rejected` | `failed`

#### inbox.json
```json
{
  "version": 1,
  "candidates": [
    {
      "id": "candidate-001",
      "url": "https://example.com/new-article",
      "title": "New Article Title",
      "snippet": "Brief description or first paragraph...",
      "topic": "AI Agents",
      "strategy": "web_search",
      "score": 0.85,
      "score_reason": "High topic relevance, no existing coverage in wiki",
      "status": "pending",
      "discovered_at": "2026-04-07T12:00:00Z",
      "approved_at": null,
      "rejected_at": null
    }
  ]
}
```

**Status lifecycle:** `pending` → `approved` → (moves to history as `ingested`/`failed`) | `rejected` → (moves to history)

#### gaps.json
```json
{
  "version": 1,
  "updated_at": "2026-04-07T14:00:00Z",
  "gaps": [
    {
      "concept": "vector databases",
      "source": "lint",
      "description": "Mentioned in 3 pages but no dedicated page exists",
      "priority": "high",
      "query_hints": ["vector database comparison", "embeddings storage"],
      "created_at": "2026-04-07T14:00:00Z",
      "resolved_at": null
    }
  ]
}
```

## Related Code Files

- `.gitignore` — add config.yaml, .discoveries/

## Implementation Steps

1. Create `config.example.yaml` at wiki root with schema above
2. Create `.discoveries/.gitkeep` (directory tracked, contents ignored)
3. Update `.gitignore`:
   ```
   # Discovery state (runtime)
   .discoveries/*.json
   
   # User config (contains local topics/feeds)
   config.yaml
   ```
4. Ensure `config.example.yaml` is committed (not ignored)

## Todo

- [ ] Create `config.example.yaml`
- [ ] Create `.discoveries/.gitkeep`
- [ ] Update `.gitignore`
- [ ] Verify config.example.yaml is valid YAML

## Success Criteria

- `config.example.yaml` exists, valid YAML, well-commented
- `.discoveries/` directory exists with `.gitkeep`
- `config.yaml` and `.discoveries/*.json` are in `.gitignore`
- `config.example.yaml` is NOT ignored

## Risk Assessment

| Component | Risk | Mitigation |
|-----------|------|------------|
| Config schema | LOW — simple YAML | Keep flat, document defaults |
| JSON contracts | MEDIUM — agents may write inconsistently | Define schema explicitly in wiki-schema.md |

## Security Considerations

- `config.yaml` may contain API keys in future (RSS auth, GitHub tokens) → gitignore it now

## Next Steps

→ Phase 02: Reference these contracts in wiki-schema.md operations
