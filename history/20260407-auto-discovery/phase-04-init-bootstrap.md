# Phase 04 — Init Script & Bootstrap

> Parent: [plan.md](plan.md) | Depends on: [Phase 01](phase-01-config-state-infra.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P2
- **Status:** pending
- **Effort:** 1h

Extend `init.mjs` to bootstrap `config.yaml` and `.discoveries/` state directory. Update `.gitignore`.

## Key Insights

- init.mjs already handles qmd setup + agent skill install
- New bootstrap should be **non-destructive** — never overwrite existing config/state
- Discovery bootstrap runs alongside existing qmd setup (not gated on --agent)
- Keep it simple — just file creation + gitignore update

## Requirements

1. Copy `config.example.yaml` → `config.yaml` if absent
2. Create `.discoveries/` with empty-but-valid JSON files if absent
3. Update `.gitignore` idempotently
4. Report what was created/skipped

## Related Code Files

- `init.mjs` — main file to edit
- `.gitignore` — update with new entries

## Implementation Steps

### 1. Add discovery bootstrap to init.mjs

Insert after Step 5 (qmd verify), before Step 6 (agent setup):

```javascript
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
```

### 2. Update .gitignore

Add these entries (check before appending to avoid duplicates):

```gitignore
# Discovery state (runtime)
.discoveries/*.json

# User config
config.yaml
```

Implementation in init.mjs:

```javascript
// .gitignore update
const gitignorePath = join(WIKI_ROOT, ".gitignore");
const ignoreEntries = [
  ".discoveries/*.json",
  "config.yaml",
];

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
```

### 3. Add copyFileSync import

Add `copyFileSync` to the existing `import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"` line.

## Todo

- [ ] Add `copyFileSync` to fs import
- [ ] Add discovery bootstrap section to init.mjs
- [ ] Add .gitignore update logic to init.mjs
- [ ] Test: run init.mjs on fresh clone → config.yaml + .discoveries/ created
- [ ] Test: run init.mjs again → nothing overwritten
- [ ] Test: .gitignore entries not duplicated on re-run

## Success Criteria

- `node init.mjs` creates config.yaml from example (if absent)
- `node init.mjs` creates .discoveries/ with valid empty JSON files (if absent)
- Re-running is idempotent — no overwrites, no duplicate .gitignore entries
- Existing init.mjs behavior unchanged (qmd setup, agent install)

## Risk Assessment

| Component | Risk | Mitigation |
|-----------|------|------------|
| Overwriting user config | MEDIUM | Check existsSync before copy |
| Non-idempotent gitignore | LOW | Check content.includes before append |
| Breaking existing init flow | LOW | Insert as separate step, don't modify existing steps |

## Security Considerations

- None — no secrets involved in bootstrap

## Next Steps

→ Phase 05: Document the full workflow in README
