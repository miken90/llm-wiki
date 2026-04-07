# Brainstorm — Auto-Discovery for LLM Wiki

**Date:** 2026-04-07
**Trigger:** Gap analysis vs [mduongvandinh/llm-wiki](https://github.com/mduongvandinh/llm-wiki)
**Objective:** Add auto-discovery capabilities while preserving our stronger architecture

---

## Problem Statement

Our LLM Wiki is **passive** — waits for human to drop sources into `sources/`. The mduongvandinh fork is **active** — auto-discovers sources from web, Reddit, GitHub, RSS. Their "wiki grows without manual effort" is the killer feature we lack.

**Gap:** 3 missing primitives → `discover`, `run`, `config.yaml`

## Current Architecture (Strengths to Preserve)

| Strength | Detail |
|----------|--------|
| Multi-agent | Amp, Claude, Cursor, OpenCode |
| Agent-agnostic schema | `wiki-schema.md` = single source of truth |
| qmd MCP | BM25 + vector + rerank (vs their grep-only) |
| Auto-setup | `init.mjs` (1 command) |
| Cross-project | Any project repo → qmd MCP → wiki repo |
| DRY templates | Thin wrappers, no duplicated rules |

## Evaluated Approaches

### Approach A: Port their model directly
Copy their 9 commands, config.yaml, .discoveries/, scheduler scripts.

| Pros | Cons |
|------|------|
| Feature-complete immediately | Claude Code-specific (WebSearch, WebFetch) |
| Proven by another user | Breaks our agent-agnostic design |
| | Duplicates logic across 4 agent templates |
| | Over-engineers (pain-rank, digest = niche) |

**Verdict:** ❌ Violates our core architecture

### Approach B: Schema-first discovery (RECOMMENDED)
Add `Discover` + `Run` operations to `wiki-schema.md`. Agent templates get thin capability maps. qmd drives dedup/ranking.

| Pros | Cons |
|------|------|
| Preserves agent-agnostic design | More design work upfront |
| Leverages qmd for smart dedup | Web search capability varies by agent |
| Clean separation: schema vs template | |
| YAGNI — start with 3 strategies, expand later | |

**Verdict:** ✅ Best fit for our architecture

### Approach C: External script-based discovery
Node.js script (`discover.mjs`) does all discovery outside agents.

| Pros | Cons |
|------|------|
| No agent dependency | Loses LLM intelligence for content evaluation |
| Deterministic, schedulable | Can't assess source quality or relevance |
| | Two systems to maintain |

**Verdict:** ❌ Premature — consider later as optional runner

## Recommended Solution

### Core Additions

#### 1. `config.yaml` (minimal)
```yaml
wiki:
  name: "My LLM Wiki"
  language: "en"

topics:
  - name: "Topic Name"
    keywords: ["kw1", "kw2"]
    priority: high

discovery:
  strategies: [web_search, feeds, github]
  max_candidates_per_run: 20
  auto_ingest: false        # require approval by default

feeds:
  rss: []
  github_repos: []
  github_orgs: []

schedule:
  discover_interval: "daily"
  lint_interval: "weekly"
```

#### 2. `.discoveries/` state directory
```
.discoveries/
├── history.json    # processed URLs/fingerprints (dedup)
├── inbox.json      # candidate queue (discover → approve → ingest)
└── gaps.json       # knowledge gaps (lint output → discover input)
```

#### 3. Schema operations (in wiki-schema.md)
- **Discover** — fetch candidates → dedup via qmd → rank → inbox
- **Run** — discover → ingest inbox → lint → (optional 2nd round)
- **Status** — page counts, health, last run times

#### 4. Agent capability map (in each template)
```
Discovery capabilities:
- Web search: [agent's native web search tool]
- HTTP fetch: [agent's native fetch tool]
- If unavailable: skip web_search strategy, use feeds/github only
```

### Strategy Taxonomy

| Strategy | Priority | Description |
|----------|----------|-------------|
| `web_search` | P0 | Search web by topic keywords |
| `feed_poll` | P0 | Check RSS feeds, known URLs |
| `github_watch` | P1 | Track repos/orgs for releases, new repos |
| `gap_fill` | Built-in | Ranking mode — boost candidates matching lint gaps |
| `snowball` | Future | Follow references in existing sources |
| `reddit_scan` | Future | Niche, noisy |
| `github_trending` | Future | Low precision |

### qmd as Discovery Brain (Key Differentiator)

Their approach: grep INDEX.md for dedup. Ours:
- **Dedup:** qmd semantic search against wiki + sources before ingest
- **Coverage estimation:** query qmd to check if topic already well-covered
- **Gap-aware ranking:** lint gaps → qmd confirms sparse coverage → boost candidate
- **Cross-reference:** qmd finds related pages to update after ingest

### What NOT to Build

| Feature | Reason |
|---------|--------|
| `digest` command | Just a report format — derive from log.md later |
| `pain-rank` command | Niche business use case — add when needed |
| `init` command | Manual topic add to config.yaml is fine |
| Scheduler scripts | Out of scope — document cron example in README |
| `wiki-viewer.html` | We have Obsidian (pre-configured) |
| `loop` command | Agent-specific, not schema-level |

## Implementation Considerations

### Risk Mitigation

| Risk | Guardrail |
|------|-----------|
| Web tool fragmentation | Capability map per agent, graceful fallback |
| Discovery floods wiki with junk | `auto_ingest: false` default, inbox queue |
| Duplicate knowledge | 3-layer dedup: URL → title → qmd semantic |
| Cross-project write complexity | Absolute paths, state stays in wiki repo |
| Overbuilding | Start 3 strategies, expand on demand |

### Naming Decision: `raw/` vs `sources/`

Keep `sources/` — our existing name. Add subdirectories for auto-discovered content:
```
sources/
├── articles/     # auto-discovered web articles
├── assets/       # downloaded images
└── *.md          # manually added sources (existing)
```

### Files Changed

| File | Change |
|------|--------|
| `wiki-schema.md` | Add Discover, Run, Status operations |
| `config.example.yaml` | NEW — template for config.yaml |
| `.discoveries/` | NEW — state directory |
| `agent_templates/amp/SKILL.md` | Add discover/run/status commands + capability map |
| `agent_templates/claude/CLAUDE.md` | Add capability map |
| `agent_templates/cursor/.cursorrules` | Add capability map |
| `agent_templates/opencode/AGENTS.md` | Add capability map |
| `init.mjs` | Copy config.example.yaml, create .discoveries/, update .gitignore |
| `README.md` | Document new operations |
| `.gitignore` | Add config.yaml, .discoveries/ |

## Success Metrics

1. User can run `discover` from any agent → candidates appear in `.discoveries/inbox.json`
2. User can run `run` → full cycle completes (discover → ingest → lint)
3. `status` shows page counts, health, last run times
4. qmd dedup prevents duplicate sources
5. Works across all 4 agents (with graceful degradation if no web search)

## Effort Estimate

| Phase | Effort |
|-------|--------|
| Schema design (wiki-schema.md) | 1-2h |
| config.example.yaml + .discoveries/ | 30min |
| Agent template updates (4 agents) | 1-2h |
| init.mjs updates | 30min |
| README updates | 30min |
| **Total** | **~4-6h** |

---

**Decision:** Proceed with Approach B — schema-first discovery with qmd-powered dedup.
**Next step:** Create implementation plan with `plan` skill.
