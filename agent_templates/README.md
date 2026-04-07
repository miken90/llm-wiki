# Agent Templates

Instruction files to connect your LLM agent to this wiki from any project.

## Prerequisites

- **Node.js ≥ 22**
- **qmd** installed: `npm install -g @tobilu/qmd`

## qmd Setup (One-Time)

Run from the wiki root directory:

```bash
cd {{WIKI_ROOT}}
qmd collection add wiki/ --name wiki
qmd collection add sources/ --name sources
qmd context add qmd://wiki "LLM-maintained knowledge base"
qmd context add qmd://sources "Raw source documents"
qmd embed
```

Replace `{{WIKI_ROOT}}` with the absolute path to this wiki repo (e.g., `/mnt/d/WORKSPACES/AI/llm-wiki`).

## Per-Agent Install

Use `node init.mjs --agent <name>` (recommended) or follow manual steps below.

| Agent | What gets installed |
|-------|---------------------|
| **Amp** | `SKILL.md` → `~/.config/amp/skills/llm-wiki/` + snippet → `~/.config/amp/AGENTS.md` |
| **Claude Code** | snippet → `~/.claude/CLAUDE.md` |
| **OpenCode** | snippet → `~/.config/opencode/AGENTS.md` |
| **Cursor** | snippet → `~/.cursor/.cursorrules` |

### Steps

1. Run `node init.mjs --agent <name>` — handles everything automatically
2. Restart your agent

## Verify

After setup, open your agent in any project repo and ask:

> "search wiki for LLM Wiki"

It should return results from this wiki. If not, check that qmd is installed and indexed (`qmd status`).

## Template Contents

Each agent directory contains:

| File | Purpose |
|------|---------|
| Snippet file (`.snippet.md` / `.snippet`) | Wiki instructions injected between `<!-- llm-wiki:start/end -->` markers |
| `SKILL.md` (Amp only) | Full skill file copied to `~/.config/amp/skills/llm-wiki/` |

All snippet files reference `wiki-schema.md` as the source of truth — they do not duplicate rules.
