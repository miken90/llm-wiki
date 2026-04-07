# Agent Templates

Copy the appropriate instruction file and MCP config to connect your LLM agent to this wiki from any project.

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

| Agent | Copy instruction file to | Copy config.json to |
|-------|--------------------------|---------------------|
| **Amp** | `~/.config/amp/skills/llm-wiki/SKILL.md` | Merge `mcpServers` into `~/.config/amp/settings.json` |
| **Claude Code** | Project root as `CLAUDE.md` or `~/.claude/CLAUDE.md` (global) | Merge `mcpServers` into `~/.claude/settings.json` |
| **OpenCode** | Project root as `AGENTS.md` | Merge `mcp` into `~/.config/opencode/opencode.json` |
| **Cursor** | Project root as `.cursorrules` | Merge `mcpServers` into `~/.cursor/mcp.json` |

### Steps

1. Copy the instruction file from `agent_templates/<agent>/` to the location above
2. Open the corresponding `config.json` and merge the MCP server entry into your agent's settings
3. Replace all `{{WIKI_ROOT}}` placeholders with the absolute path to this wiki repo
4. Restart your agent

## Verify

After setup, open your agent in any project repo and ask:

> "search wiki for LLM Wiki"

It should return results from this wiki. If not, check that qmd is installed and indexed (`qmd status`).

## Template Contents

Each agent directory contains:

| File | Purpose |
|------|---------|
| Instruction file | Thin wrapper (~30-50 lines) referencing `wiki-schema.md` |
| `config.json` | qmd MCP server config in the agent's native format |

All instruction files reference `wiki-schema.md` as the source of truth — they do not duplicate rules.
