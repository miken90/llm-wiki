# Phase 03 — Docs

> Parent: [plan.md](plan.md) | Depends on: [Phase 02](phase-02-agent-templates.md)

## Overview

- **Date:** 2026-04-07
- **Priority:** P2
- **Status:** pending
- **Effort:** 0.5h

Update README with register workflow and multi-project usage pattern.

## Implementation Steps

### 1. Update Operations table in README

Add:
```markdown
| **Register** | `register <project>` | Scan project → propose topics/feeds → append to config.yaml |
| **Unregister** | `unregister <project>` | Remove project's registered topics/feeds |
```

### 2. Add Multi-Project section to Discovery docs

After the existing Discovery → Config Example section:

```markdown
### Multi-Project Setup

Each project can register its own topics into the shared wiki:

```
# From any project repo, ask your agent:
register my-react-app
register my-api-server
```

Topics are tagged with `registered_by` for traceability. To remove a project's topics:

```
unregister my-react-app
```

The wiki compounds knowledge across all registered projects.
```

## Todo

- [ ] Update Operations table
- [ ] Add Multi-Project section
- [ ] Verify README renders correctly

## Success Criteria

- README documents register/unregister
- Multi-project workflow is clear (3 steps)
- No broken links or references
