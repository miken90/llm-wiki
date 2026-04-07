#!/usr/bin/env node

/**
 * LLM Wiki — Init Script
 *
 * Cross-OS (Windows, Linux, macOS, WSL). Single entry point.
 *
 * Usage:
 *   node init.mjs                        # qmd setup only
 *   node init.mjs --agent amp            # qmd + install Amp skill
 *   node init.mjs --agent amp,claude     # qmd + multiple agents
 */

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname, resolve } from "path";
import { homedir, platform } from "os";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { parseArgs } from "util";

const __filename = fileURLToPath(import.meta.url);
const WIKI_ROOT = dirname(__filename);
const HOME = homedir();
const IS_WIN = platform() === "win32";

// ── CLI ─────────────────────────────────────────────────────────────

const { values } = parseArgs({
  options: {
    agent: { type: "string", short: "a", default: "" },
    check: { type: "boolean", short: "c", default: false },
    help:  { type: "boolean", short: "h", default: false },
  },
  strict: true,
});

if (values.help) {
  console.log(`
Usage: node init.mjs [--agent <amp,claude,opencode,cursor>] [--check]

Without --agent: sets up qmd collections and embeddings
With --agent:    also installs skill file + rules snippet for specified agent(s)
With --check:    compare installed skill files vs repo templates, show update status

Examples:
  node init.mjs                        # qmd only
  node init.mjs --agent amp            # qmd + Amp skill
  node init.mjs --agent amp,claude     # qmd + Amp + Claude
  node init.mjs --check                # check all agents for updates
  node init.mjs --check --agent amp    # check specific agent
`);
  process.exit(0);
}

// ── Helpers ─────────────────────────────────────────────────────────

const C = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
};

function ok(msg)   { console.log(`${C.green("✓")} ${msg}`); }
function warn(msg) { console.log(`${C.yellow("⚠")} ${msg}`); }
function err(msg)  { console.log(`${C.red("✗")} ${msg}`); }

/**
 * Resolve the qmd command. On Windows, npm shims can be broken
 * (referencing /bin/sh), so we resolve the actual binary path
 * and run via node directly.
 */
let QMD_CMD = "qmd";

function resolveQmd() {
  // Try direct command first
  if (run("qmd --help")) { QMD_CMD = "qmd"; return true; }

  // Resolve via npm global root → actual JS entry point
  const npmRoot = run("npm root -g");
  if (!npmRoot) return false;

  const qmdJs = join(npmRoot, "@tobilu", "qmd", "dist", "cli", "qmd.js");
  if (!existsSync(qmdJs)) return false;

  // Verify it works via node
  if (run(`node "${qmdJs}" --help`)) {
    QMD_CMD = `node "${qmdJs}"`;
    return true;
  }
  return false;
}

function qmd(args) {
  return run(`${QMD_CMD} ${args}`);
}

function qmdLoud(args) {
  runLoud(`${QMD_CMD} ${args}`);
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: "pipe", ...opts }).trim();
  } catch (e) {
    return null;
  }
}

function runLoud(cmd) {
  execSync(cmd, { encoding: "utf-8", stdio: "inherit" });
}

function writeJson(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/**
 * Inject or update a snippet between marker comments in a target file.
 * Markers: <!-- llm-wiki:start --> ... <!-- llm-wiki:end -->
 */
function injectSnippet(targetPath, snippetContent) {
  const startMarker = "<!-- llm-wiki:start -->";
  const endMarker = "<!-- llm-wiki:end -->";

  if (!existsSync(targetPath)) {
    // File doesn't exist — append snippet
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, snippetContent, "utf-8");
    return "created";
  }

  const existing = readFileSync(targetPath, "utf-8");
  const startIdx = existing.indexOf(startMarker);
  const endIdx = existing.indexOf(endMarker);

  if (startIdx !== -1 && endIdx !== -1) {
    // Replace existing snippet
    const before = existing.slice(0, startIdx);
    const after = existing.slice(endIdx + endMarker.length);
    const updated = before + snippetContent.trim() + after;
    if (updated === existing) return "up-to-date";
    writeFileSync(targetPath, updated, "utf-8");
    return "updated";
  }

  // No markers found — append at end
  writeFileSync(targetPath, existing.trimEnd() + "\n\n" + snippetContent, "utf-8");
  return "injected";
}

// ── Agent Definitions ───────────────────────────────────────────────

const AGENTS = {
  amp: {
    // Amp has both: SKILL.md (on-demand) + AGENTS.snippet.md (always-on rules)
    template:     "agent_templates/amp/SKILL.md",
    destDir:      join(HOME, ".config", "amp", "skills", "llm-wiki"),
    destFile:     "SKILL.md",
    rulesSnippet: "agent_templates/amp/AGENTS.snippet.md",
    rulesTarget:  join(HOME, ".config", "amp", "AGENTS.md"),
  },
  claude: {
    rulesSnippet: "agent_templates/claude/CLAUDE.snippet.md",
    rulesTarget:  join(HOME, ".claude", "CLAUDE.md"),
  },
  opencode: {
    rulesSnippet: "agent_templates/opencode/AGENTS.snippet.md",
    rulesTarget:  join(HOME, ".config", "opencode", "AGENTS.md"),
  },
  cursor: {
    rulesSnippet: "agent_templates/cursor/.cursorrules.snippet",
    rulesTarget:  join(HOME, ".cursor", ".cursorrules"),
  },
};

// ── Check Mode ──────────────────────────────────────────────────────

if (values.check) {
  console.log(C.cyan("\n=== LLM Wiki — Check Installed Agents ===\n"));

  const checkList = values.agent
    ? values.agent.split(",").map((s) => s.trim().toLowerCase())
    : Object.keys(AGENTS);

  let hasUpdates = false;

  for (const name of checkList) {
    const cfg = AGENTS[name];
    if (!cfg) { err(`Unknown agent: ${name}`); continue; }

    // Check skill file (Amp only)
    if (cfg.template) {
      const installedPath = join(cfg.destDir, cfg.destFile);
      const templatePath = join(WIKI_ROOT, cfg.template);

      if (!existsSync(templatePath)) {
        err(`${name}: template missing at ${templatePath}`);
      } else if (!existsSync(installedPath)) {
        warn(`${name}: skill not installed — run: node init.mjs --agent ${name}`);
        hasUpdates = true;
      } else {
        const templateContent = readFileSync(templatePath, "utf-8")
          .replace(/\{\{WIKI_ROOT\}\}/g, WIKI_ROOT);
        const installedContent = readFileSync(installedPath, "utf-8");
        if (installedContent === templateContent) {
          ok(`${name}: skill up to date`);
        } else {
          warn(`${name}: skill outdated — run: node init.mjs --agent ${name}`);
          hasUpdates = true;
        }
      }
    }

    // Check rules snippet
    if (cfg.rulesSnippet) {
      const snippetPath = join(WIKI_ROOT, cfg.rulesSnippet);
      if (existsSync(snippetPath) && existsSync(cfg.rulesTarget)) {
        const snippetContent = readFileSync(snippetPath, "utf-8")
          .replace(/\{\{WIKI_ROOT\}\}/g, WIKI_ROOT).trim();
        const targetContent = readFileSync(cfg.rulesTarget, "utf-8");
        if (targetContent.includes("<!-- llm-wiki:start -->") && targetContent.includes(snippetContent.split("\n").slice(1, -1).join("\n").trim())) {
          ok(`${name}: rules up to date (${cfg.rulesTarget})`);
        } else if (targetContent.includes("<!-- llm-wiki:start -->")) {
          warn(`${name}: rules outdated in ${cfg.rulesTarget}`);
          hasUpdates = true;
        } else {
          warn(`${name}: rules not injected in ${cfg.rulesTarget}`);
          hasUpdates = true;
        }
      } else if (existsSync(snippetPath) && !existsSync(cfg.rulesTarget)) {
        warn(`${name}: rules target missing (${cfg.rulesTarget})`);
      }
    }
  }

  console.log();
  if (hasUpdates) {
    console.log(`Run ${C.cyan("node init.mjs --agent <agents>")} to update.\n`);
  } else {
    ok("All agents up to date.\n");
  }
  process.exit(0);
}

// ── Step 1: Prerequisites ───────────────────────────────────────────

console.log(C.cyan("\n=== LLM Wiki Init ==="));
console.log(`OS:        ${IS_WIN ? "Windows" : platform()}`);
console.log(`WIKI_ROOT: ${WIKI_ROOT}`);
console.log(`HOME:      ${HOME}\n`);

const nodeVer = run("node --version");
if (!nodeVer) { err("Node.js not found"); process.exit(1); }
ok(`Node.js ${nodeVer}`);

// ── Step 2: qmd ─────────────────────────────────────────────────────

let hasQmd = resolveQmd();
if (!hasQmd) {
  warn("qmd not found — installing...");
  runLoud("npm install -g @tobilu/qmd");
  hasQmd = resolveQmd();
  if (!hasQmd) { err("qmd install failed — try: npm install -g @tobilu/qmd"); process.exit(1); }
}
ok(`qmd installed (${QMD_CMD.startsWith("node") ? "via node fallback" : "native"})`);

// ── Step 3: Collections ─────────────────────────────────────────────

console.log(C.cyan("\n--- qmd collections ---"));

const status = qmd("status") || "";

const wikiDir = join(WIKI_ROOT, "wiki") + (IS_WIN ? "\\" : "/");
const sourcesDir = join(WIKI_ROOT, "sources") + (IS_WIN ? "\\" : "/");

if (status.includes("wiki")) {
  warn("Collection 'wiki' exists — skipping");
} else {
  qmdLoud(`collection add "${wikiDir}" --name wiki`);
  ok("Collection 'wiki' added");
}

if (status.includes("sources")) {
  warn("Collection 'sources' exists — skipping");
} else {
  qmdLoud(`collection add "${sourcesDir}" --name sources`);
  ok("Collection 'sources' added");
}

qmd('context add qmd://wiki "LLM-maintained knowledge base"');
qmd('context add qmd://sources "Raw source documents"');
ok("Contexts attached");

// ── Step 4: Embeddings ──────────────────────────────────────────────

console.log(C.cyan("\n--- Embeddings ---"));
qmdLoud("embed");
ok("Embeddings built");

// ── Step 5: Verify ──────────────────────────────────────────────────

const searchResult = qmd('search "wiki" -n 1');
if (searchResult) {
  ok("Search verified — results returned");
} else {
  warn("Search returned no results (wiki may be empty)");
}

// ── Step 5b: Discovery Bootstrap ────────────────────────────────────

console.log(C.cyan("\n--- Discovery ---"));

// config.yaml
const configSrc = join(WIKI_ROOT, "config.example.yaml");
const configDst = join(WIKI_ROOT, "config.yaml");
if (existsSync(configDst)) {
  ok("config.yaml exists (not modified)");
} else if (existsSync(configSrc)) {
  copyFileSync(configSrc, configDst);
  ok("config.yaml → created from config.example.yaml");
} else {
  warn("config.example.yaml not found — skip config bootstrap");
}

// .discoveries/
const discDir = join(WIKI_ROOT, ".discoveries");
mkdirSync(discDir, { recursive: true });

const emptyState = {
  "history.json": { version: 1, entries: [] },
  "inbox.json": { version: 1, candidates: [] },
  "gaps.json": { version: 1, updated_at: null, gaps: [] },
};

for (const [file, defaultContent] of Object.entries(emptyState)) {
  const filePath = join(discDir, file);
  if (existsSync(filePath)) {
    ok(`.discoveries/${file} exists (not modified)`);
  } else {
    writeJson(filePath, defaultContent);
    ok(`.discoveries/${file} → created`);
  }
}

// sources/articles/
const articlesDir = join(WIKI_ROOT, "sources", "articles");
mkdirSync(articlesDir, { recursive: true });
ok("sources/articles/ ready");

// .gitignore update
const gitignorePath = join(WIKI_ROOT, ".gitignore");
const ignoreEntries = [".discoveries/*.json", "config.yaml"];

if (existsSync(gitignorePath)) {
  let content = readFileSync(gitignorePath, "utf-8");
  const added = [];
  for (const entry of ignoreEntries) {
    if (!content.includes(entry)) {
      content += `\n${entry}`;
      added.push(entry);
    }
  }
  if (added.length) {
    writeFileSync(gitignorePath, content.trimEnd() + "\n", "utf-8");
    ok(`.gitignore → added: ${added.join(", ")}`);
  } else {
    ok(".gitignore already up to date");
  }
} else {
  writeFileSync(gitignorePath, ignoreEntries.join("\n") + "\n", "utf-8");
  ok(".gitignore → created");
}

// ── Step 6: Agent Setup ─────────────────────────────────────────────

if (!values.agent) {
  console.log(`\n${C.green("✓")} qmd setup complete. Run with --agent to install agent skill.\n`);
  process.exit(0);
}

const agentList = values.agent.split(",").map((s) => s.trim().toLowerCase());

for (const name of agentList) {
  const cfg = AGENTS[name];
  if (!cfg) {
    err(`Unknown agent: ${name} (supported: ${Object.keys(AGENTS).join(", ")})`);
    continue;
  }

  console.log(C.cyan(`\n--- ${name} ---`));

  // 1. Copy skill file (Amp only — has separate SKILL.md)
  if (cfg.template) {
    const srcPath = join(WIKI_ROOT, cfg.template);
    if (!existsSync(srcPath)) {
      err(`Template not found: ${srcPath}`);
      continue;
    }
    const content = readFileSync(srcPath, "utf-8")
      .replace(/\{\{WIKI_ROOT\}\}/g, WIKI_ROOT);
    mkdirSync(cfg.destDir, { recursive: true });
    writeFileSync(join(cfg.destDir, cfg.destFile), content, "utf-8");
    ok(`Skill → ${join(cfg.destDir, cfg.destFile)}`);
  }

  // 2. Inject rules snippet (all agents — never overwrites existing content)
  if (cfg.rulesSnippet) {
    const snippetPath = join(WIKI_ROOT, cfg.rulesSnippet);
    if (existsSync(snippetPath)) {
      const snippetContent = readFileSync(snippetPath, "utf-8")
        .replace(/\{\{WIKI_ROOT\}\}/g, WIKI_ROOT);
      const result = injectSnippet(cfg.rulesTarget, snippetContent);
      if (result === "up-to-date") {
        ok(`Rules → ${cfg.rulesTarget} (already up to date)`);
      } else {
        ok(`Rules → ${result} in ${cfg.rulesTarget}`);
      }
    }
  }

}

console.log(`\n${C.green("✓")} Done! Restart your agent(s), then test: "search wiki for LLM Wiki"\n`);
