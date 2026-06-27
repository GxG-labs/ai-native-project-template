# Structured Data Convention

How to create and maintain lists, schemas, and configuration files that AI agents and humans can understand without external context.

## Pattern

Every structured data file must have this shape:

```
# [File Title]

## About

What is this? (1–2 sentences)
Why does it exist? (1 sentence)

## Schema

Field name | Type | Required | Notes
--- | --- | --- | ---
`name` | string | yes | 2–4 words
`description` | string | yes | One sentence
...

Rules for adding entries (if not obvious from fields):
- Rule 1
- Rule 2

## Examples

[Your actual data using the schema]
```

## Why This Works for AI

1. **Self-contained.** An LLM can read the file and understand the rules without searching elsewhere.
2. **Explicit structure.** The schema section removes ambiguity about what's required vs. optional.
3. **Clear scope.** The "About" section tells AI whether new content belongs here or in a different file.
4. **Operational.** AI agents can generate new entries, validate existing ones, and suggest improvements using the schema as ground truth.

## Common Patterns

### Lists (Content Pillars, Blog Topics, Campaigns)

```
## Schema

- **Name** (required): Short, memorable label
- **Description** (required): One sentence on purpose
- **Examples** (required): 2–3 concrete instances
- **Notes** (optional): Edge cases or caveats

Rules:
- Entries should not overlap (if they do, consolidate)
- New entries need [approver] sign-off before merging
```

### Configuration (Feature flags, API endpoints)

```
## Schema

| Key | Value Type | Default | Purpose |
|---|---|---|---|
| `name` | string | — | Unique identifier |
| `enabled` | boolean | false | Is this active? |

Rules:
- Changes to production flags require a deploy
- Test all changes in staging first
```

### Glossary (Domain terms, abbreviations)

```
## Schema

- **Term** (required): The exact phrase used in this project
- **Definition** (required): 1–2 sentences for someone new to the project
- **Related** (optional): Cross-references to related terms

Rules:
- One definition per term (if ambiguous, split into separate entries)
- Keep definitions jargon-free
```

## Before and After

❌ **Without structure:**
```
# Topics

Just add topics here as you think of them.

- AI safety
- Prompt engineering
- Best practices
- Tools
```

✓ **With structure:**
```
# Topics

## About
Recurring themes that organize our content. Each topic should have 2+ pieces planned or completed.

## Schema
- **Name** (required): 2–3 words
- **Focus** (required): What specific angle or outcome?
- **Examples** (required): Existing or planned content for this topic

## Topics

| Name | Focus | Examples |
|---|---|---|
| Prompt Engineering | Practical techniques to improve model output | "5 prompt patterns", "When few-shot works" |
| AI Safety | Responsible use and boundary-setting | "Rate-limiting guide", "Jailbreak taxonomy" |
```

## When to Use This

- Any file that will grow (pillars, topics, glossary, config)
- Files that AI agents will read or edit
- Lists shared across multiple workflows
- Data that needs version control and review

## When NOT to Use This

- One-off notes or temporary work (use `workbench/`)
- Narrative docs where structure would harm readability (essays, tutorials)
- Private or sensitive configuration (keep in `.env.local`, not in files)
