---
name: llm-wiki
description: Query and maintain the shared LLM Wiki knowledge base from any project. Use when researching topics, before non-trivial work, or when discovering durable knowledge worth preserving. Trigger phrases - "search wiki", "query wiki", "ingest", "lint wiki", "add source", "wiki".
---

# LLM Wiki

## Config

- WIKI_ROOT: {{WIKI_ROOT}}
- Search: qmd MCP server (must be configured in agent MCP settings)

## When to use

- Before non-trivial work → search wiki for prior knowledge
- When discovering durable knowledge → write back to wiki
- When asked to "ingest", "query wiki", "lint wiki", "search wiki", "add source"

## Workflow

1. Search wiki via qmd MCP: `query "your search terms"`
2. Read matched wiki pages for context
3. Apply knowledge to current project task
4. If new durable knowledge discovered → create/update wiki pages
5. Follow {{WIKI_ROOT}}/wiki-schema.md for all conventions

## Write Rules

- Read wiki-schema.md before first wiki write in a session
- Search before creating — update existing pages, don't duplicate
- One topic per page, use [[wikilinks]]
- Append new information — don't overwrite existing content
- Add YAML frontmatter (title, type, sources, created, updated, tags)
- Commit wiki changes separately from project changes

## Operations

- **Ingest**: Read wiki-schema.md "Operation — Ingest" section, follow steps
- **Query**: Search via qmd, read pages, synthesize answer with [[citations]]
- **Lint**: Read wiki-schema.md "Operation — Lint" section, follow steps
