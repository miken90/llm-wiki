# LLM Wiki — Deployment & Setup Guide

## System Requirements

### Minimum Requirements

- **Node.js ≥ 22** — Required for qmd
- **Git** — Version control
- **4 GB RAM** — For qmd indexing and agent operations
- **500 MB disk** — For wiki + sources + embeddings

### Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| Windows 11/10 | ✅ Fully supported | Run `node init.mjs` in PowerShell or Git Bash |
| macOS 12+ | ✅ Fully supported | Intel and Apple Silicon |
| Linux (Ubuntu 20.04+) | ✅ Fully supported | Debian/RHEL derivatives tested |
| WSL 2 | ✅ Fully supported | Run setup on both Windows and WSL sides |

### Optional Components

- **Obsidian** — For human browsing (download from obsidian.md)
- **Web browser** — For web clipper (optional plugin)
- **Git GUI** — SourceTree, GitHub Desktop, or similar (optional)

## Installation

### Step 1: Clone the Wiki Repo

```bash
git clone https://github.com/your-org/llm-wiki.git
cd llm-wiki
```

Or for a fresh start (create new wiki):

```bash
mkdir my-wiki
cd my-wiki
git init
# Copy files from template repo
```

### Step 2: Install Node.js

**Windows:**
```bash
# Via Chocolatey
choco install nodejs

# Or via scoop
scoop install nodejs

# Or download from nodejs.org
```

**macOS:**
```bash
# Via Homebrew
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify:**
```bash
node --version  # Should be ≥22.0.0
npm --version   # Should be ≥10.0.0
```

### Step 3: Run Setup Script

```bash
# qmd setup only
node init.mjs

# qmd + install agent skill (Amp, Claude, OpenCode, Cursor)
node init.mjs --agent amp
node init.mjs --agent amp,claude    # multiple agents

# Check if skills are up to date
node init.mjs --check               # all agents
node init.mjs --check --agent amp   # specific agent
```

**What it does:**
1. Detects your OS (Windows, macOS, Linux, WSL)
2. Checks if qmd is installed, installs if missing
3. Creates qmd collections for `wiki/` and `sources/`
4. Builds vector embeddings for search
5. (With `--agent`) Copies skill file and merges MCP config

**Output:**
```
✓ qmd installed: version X.X.X
✓ Collection 'wiki' created
✓ Collection 'sources' created
✓ Embeddings built (123 pages, 456 sources)
✓ Amp skill installed to ~/.claude/skills/llm-wiki/
✓ MCP config merged into ~/.claude/config.json
```

### Step 4: Verify Installation

In any project repo, ask your agent:

```
search wiki for LLM Wiki
```

Expected: Results from this wiki repo, ranked by relevance.

**Troubleshooting:**
- If no results → check `node init.mjs --check` status
- If qmd not found → run `node init.mjs` again to reinstall
- If MCP config not merged → run `node init.mjs --agent <name>` again

## Configuration

### Optional: Discovery Config

Copy and customize the discovery configuration:

```bash
cp config.example.yaml config.yaml
```

Edit `config.yaml`:

```yaml
wiki:
  name: "My LLM Wiki"
  language: "en"

topics:
  - name: "AI Agents"
    keywords: ["LLM agents", "agentic AI", "tool use"]
    priority: high
  - name: "Rust Systems"
    keywords: ["Rust", "systems programming", "concurrency"]
    priority: medium

discovery:
  strategies: [web_search, feed_poll, github_watch]
  max_candidates_per_run: 20
  auto_ingest: false
  recency: month

feeds:
  rss:
    - url: "https://blog.anthropic.com/rss"
      name: "Anthropic Blog"
  github_repos:
    - repo: "anthropic-ai/anthropic-sdk-python"
      watch: [releases, readme]
```

**Note:** config.yaml is gitignored — safe to add personal topics.

### Optional: Obsidian Setup

1. **Install Obsidian** from obsidian.md

2. **Open as vault:**
   - Launch Obsidian
   - Click "Open folder as vault"
   - Select the `llm-wiki` folder

3. **Enable community plugins:**
   - Settings (⚙️) → Community plugins → Turn on
   - Browse and install:
     - **Dataview** — Query wiki with SQL-like syntax
     - **Obsidian Git** — Auto-commit and sync
     - **Marp Slides** — Render slide decks

4. **Verify:**
   - Open `wiki/index.md` — page catalog visible
   - Click any `[[wikilink]]` — navigates correctly
   - Open Graph View (Ctrl/Cmd+G) — page network visible
   - Create test file — lands in `wiki/`

## Updating Skills

When agent templates are updated (new operations, bug fixes):

```bash
# Check for outdated skills
node init.mjs --check

# Output shows status:
# ✓ amp: up to date
# ⚠ claude: outdated — run: node init.mjs --agent claude
# ⚠ cursor: not installed — run: node init.mjs --agent cursor

# Update specific agents
node init.mjs --agent claude

# Update all agents
node init.mjs --agent amp,claude,opencode,cursor
```

## Cross-Platform Considerations

### Windows

**PowerShell (recommended):**
```powershell
node init.mjs
node init.mjs --agent amp
```

**Git Bash:**
```bash
node init.mjs
node init.mjs --agent amp
```

**Note:** WSL and Windows have separate npm environments. Run setup on both.

### macOS

```bash
node init.mjs
node init.mjs --agent amp
```

**M1/M2 (Apple Silicon):** Fully supported. qmd detects architecture automatically.

### Linux

```bash
node init.mjs
node init.mjs --agent amp
```

**Note:** WSL 2 users should run setup on both WSL and Windows sides.

## Troubleshooting

### Issue: "qmd not found"

**Symptoms:**
```
✗ qmd is not installed or not in PATH
```

**Solutions:**
1. Run setup again: `node init.mjs`
2. Verify Node.js: `node --version` (must be ≥22)
3. Clear npm cache: `npm cache clean --force`
4. Reinstall globally: `npm install -g @tobilu/qmd`

### Issue: "Collection 'wiki' not found"

**Symptoms:**
```
✗ qmd collection 'wiki' not found
```

**Solutions:**
1. Re-create collections: `node init.mjs`
2. Check if `wiki/` directory exists
3. Verify disk space (need 500 MB free)
4. Check file permissions: `ls -la wiki/`

### Issue: "Failed to merge MCP config"

**Symptoms:**
```
✗ Failed to merge MCP config into ~/.claude/config.json
```

**Solutions:**
1. Check file exists: `ls ~/.claude/config.json`
2. Verify JSON syntax: `cat ~/.claude/config.json | jq .`
3. Manual merge: Copy config from `agent_templates/claude/config.json`
4. For Claude Code: check `~/.claude.json` under `projects.<path>.mcpServers`
5. Re-run: `node init.mjs --agent claude`

### Issue: "Agent can't search wiki"

**Symptoms:** Agent returns no results when asked "search wiki for X"

**Solutions:**
1. Check qmd status: `qmd status`
2. Verify wiki collection indexed: `qmd collection list`
3. Re-index: `qmd collection update && qmd embed`
4. Check MCP config: For Claude Code, check `~/.claude.json` under `projects` key

### Issue: "Obsidian can't open as vault"

**Symptoms:** Obsidian shows "Error opening vault" or can't find wikilinks

**Solutions:**
1. Verify folder exists: `ls -la /path/to/llm-wiki`
2. Check permissions: `chmod 755 /path/to/llm-wiki`
3. Restart Obsidian (fully quit and reopen)
4. Manually open `.obsidian/vault.json` and verify paths

### Issue: "Git merge conflicts in wiki pages"

**Symptoms:** After `git pull`, wiki pages have conflict markers

**Symptoms:**
```
<<<<<<< HEAD
agent A's version
=======
agent B's version
>>>>>>> branch-name
```

**Solutions:**
1. Understand conflict — read wiki-schema.md concurrency rules
2. Resolve manually — merge content (append new info from both)
3. Update frontmatter — set `updated` to today's date
4. Commit: `git add wiki/ && git commit -m "fix(wiki): resolve merge conflict in <page>"`
5. Prevent future conflicts — use single-writer model (one agent per operation)

## Performance Tuning

### For Large Wikis (500+ pages)

**Increase qmd embeddings memory:**
```bash
# Linux/macOS
NODE_OPTIONS="--max-old-space-size=2048" qmd embed

# Windows (PowerShell)
$env:NODE_OPTIONS = "--max-old-space-size=2048"; qmd embed
```

**Incremental indexing (faster):**
```bash
qmd collection update  # Update index only
qmd embed             # Rebuild embeddings (slower, required after new pages)
```

### For Slow Networks

**Offline discovery (no web_search/http_fetch):**
```yaml
# config.yaml
discovery:
  strategies: []  # Skip all strategies, use manual ingest only
```

**Fetch content in advance:**
```bash
# Save articles locally before asking agent to discover
curl -s https://article.com > sources/manual/article.md
```

## Backup & Recovery

### Regular Backups

```bash
# Commit frequently
git add wiki/ sources/
git commit -m "feat: ingest new sources"

# Push to remote
git push origin main
```

### Recovery from Corruption

```bash
# Revert to last good commit
git log --oneline | head -10  # Find good commit
git reset --hard <commit-hash>

# Rebuild qmd index
node init.mjs
```

### Partial Recovery (specific pages)

```bash
# Check history of a page
git log --oneline -- wiki/concepts/page-name.md

# Restore from earlier version
git checkout <commit-hash> -- wiki/concepts/page-name.md
```

## Security Considerations

### Protecting Sensitive Data

**Never commit:**
- `config.yaml` — Contains personal topics/feeds (gitignored)
- `.env` files — API keys, credentials
- `.discoveries/history.json` — URL history (gitignored)
- Private notes (use separate wiki)

**Verify .gitignore:**
```bash
cat .gitignore | grep -E "config.yaml|.discoveries|.env"
```

### Safe Web Discovery

**Validate URLs before fetching:**
- No `file://` URLs (local files only)
- No IP addresses in discovery (unpredictable content)
- Sanitize markdown (no script injection)

**Limit discovery scope:**
- Use narrow keywords (avoid overly broad searches)
- Monitor discovered sources (approve manually)
- Set `max_candidates_per_run` limit

### Multi-User Wikis

**Current limitation:** No access control (all-or-nothing access).

**Workaround for sensitive content:**
- Use separate private wiki repo
- Share via read-only link (GitHub pages)
- Exclude from autodiscovery (remove topics from config)

## Getting Help

### Documentation

- **README.md** — Project overview + quick start
- **wiki-schema.md** — All operations and conventions
- **docs/** — Detailed architecture and standards

### Common Tasks

| Task | Command |
|------|---------|
| Search wiki | `qmd query "keywords"` or ask agent |
| Add source | `ingest /path/to/source.md` |
| Check health | `status` or `node init.mjs --check` |
| Find gaps | `lint wiki` |
| Discover sources | `discover` or `run` |
| Update skills | `node init.mjs --agent <name>` |

### Reporting Issues

1. Check troubleshooting section above
2. Verify setup: `node init.mjs --check`
3. Check wiki-schema.md for operation details
4. Post issue with:
   - Error message (exact text)
   - Platform (Windows/macOS/Linux/WSL)
   - Node.js version: `node --version`
   - qmd version: `qmd --version`

---

**Document status:** Version 1.0 — Setup verified on Windows, macOS, Linux.  
**Last updated:** 2026-04-07  
**Next: Expand with performance tuning examples**
