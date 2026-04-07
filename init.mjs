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

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
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
    help:  { type: "boolean", short: "h", default: false },
  },
  strict: true,
});

if (values.help) {
  console.log(`
Usage: node init.mjs [--agent <amp,claude,opencode,cursor>]

Without --agent: sets up qmd collections and embeddings
With --agent:    also installs skill file + MCP config for specified agent(s)

Examples:
  node init.mjs                        # qmd only
  node init.mjs --agent amp            # qmd + Amp skill
  node init.mjs --agent amp,claude     # qmd + Amp + Claude
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

function readJson(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    const raw = readFileSync(filePath, "utf-8").trim();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return undefined; // malformed
  }
}

function writeJson(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// ── Agent Definitions ───────────────────────────────────────────────

const AGENTS = {
  amp: {
    template:    "agent_templates/amp/SKILL.md",
    destDir:     join(HOME, ".config", "amp", "skills", "llm-wiki"),
    destFile:    "SKILL.md",
    configPath:  join(HOME, ".config", "amp", "settings.json"),
    configKey:   "mcpServers",
    configValue: { qmd: { command: "qmd", args: ["mcp"] } },
  },
  claude: {
    template:    "agent_templates/claude/CLAUDE.md",
    destDir:     join(HOME, ".claude"),
    destFile:    "CLAUDE.md",
    configPath:  join(HOME, ".claude", "settings.json"),
    configKey:   "mcpServers",
    configValue: { qmd: { command: "qmd", args: ["mcp"] } },
  },
  opencode: {
    template:    "agent_templates/opencode/AGENTS.md",
    destDir:     join(HOME, ".config", "opencode"),
    destFile:    "AGENTS.md",
    configPath:  join(HOME, ".config", "opencode", "opencode.json"),
    configKey:   "mcp",
    configValue: { qmd: { type: "local", command: ["qmd", "mcp"] } },
  },
  cursor: {
    template:    "agent_templates/cursor/.cursorrules",
    destDir:     join(HOME, ".cursor"),
    destFile:    ".cursorrules",
    configPath:  join(HOME, ".cursor", "mcp.json"),
    configKey:   "mcpServers",
    configValue: { qmd: { command: "qmd", args: ["mcp"] } },
  },
};

// ── Step 1: Prerequisites ───────────────────────────────────────────

console.log(C.cyan("\n=== LLM Wiki Init ==="));
console.log(`OS:        ${IS_WIN ? "Windows" : platform()}`);
console.log(`WIKI_ROOT: ${WIKI_ROOT}`);
console.log(`HOME:      ${HOME}\n`);

const nodeVer = run("node --version");
if (!nodeVer) { err("Node.js not found"); process.exit(1); }
ok(`Node.js ${nodeVer}`);

// ── Step 2: qmd ─────────────────────────────────────────────────────

let hasQmd = !!run("qmd --help");
if (!hasQmd) {
  warn("qmd not found — installing...");
  runLoud("npm install -g @tobilu/qmd");
  hasQmd = !!run("qmd --help");
  if (!hasQmd) { err("qmd install failed"); process.exit(1); }
}
ok("qmd installed");

// ── Step 3: Collections ─────────────────────────────────────────────

console.log(C.cyan("\n--- qmd collections ---"));

const status = run("qmd status") || "";

const wikiDir = join(WIKI_ROOT, "wiki") + (IS_WIN ? "\\" : "/");
const sourcesDir = join(WIKI_ROOT, "sources") + (IS_WIN ? "\\" : "/");

if (status.includes("wiki")) {
  warn("Collection 'wiki' exists — skipping");
} else {
  runLoud(`qmd collection add "${wikiDir}" --name wiki`);
  ok("Collection 'wiki' added");
}

if (status.includes("sources")) {
  warn("Collection 'sources' exists — skipping");
} else {
  runLoud(`qmd collection add "${sourcesDir}" --name sources`);
  ok("Collection 'sources' added");
}

run('qmd context add qmd://wiki "LLM-maintained knowledge base"');
run('qmd context add qmd://sources "Raw source documents"');
ok("Contexts attached");

// ── Step 4: Embeddings ──────────────────────────────────────────────

console.log(C.cyan("\n--- Embeddings ---"));
runLoud("qmd embed");
ok("Embeddings built");

// ── Step 5: Verify ──────────────────────────────────────────────────

const searchResult = run('qmd search "wiki" -n 1');
if (searchResult) {
  ok("Search verified — results returned");
} else {
  warn("Search returned no results (wiki may be empty)");
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

  // Copy skill file
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

  // Merge MCP config
  const existing = readJson(cfg.configPath);

  if (existing === undefined) {
    err(`${cfg.configPath} is malformed JSON — fix manually`);
    console.log(`  Add to "${cfg.configKey}": ${JSON.stringify(cfg.configValue)}`);
    continue;
  }

  const base = existing || {};
  const prev = base[cfg.configKey] || {};
  base[cfg.configKey] = { ...prev, ...cfg.configValue };
  writeJson(cfg.configPath, base);

  if (existing === null) {
    ok(`Config → created ${cfg.configPath}`);
  } else if (prev.qmd) {
    warn(`Config → updated qmd in ${cfg.configPath} (was already present)`);
  } else {
    ok(`Config → merged qmd into ${cfg.configPath}`);
  }
}

console.log(`\n${C.green("✓")} Done! Restart your agent(s), then test: "search wiki for LLM Wiki"\n`);
