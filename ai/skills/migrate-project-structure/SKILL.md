---
name: migrate-project-structure
description: Migrate a project from the original lifecycle-based folder structure to the simplified question-based structure. Use when the user asks to restructure, simplify, or modernize an existing project.
---

# Migrate Project Structure

## What This Skill Does

Converts a project from the original structure (many overlapping folders) to the simplified structure (four clear folders, each answering one question).

## New Structure

```
PROJECT.md          ← why the project exists

intent/             ← what we are doing and why
context/            ← what we know
  brand/            ← who we are and how we communicate
  sources/          ← external materials and working notes
ai/                 ← how AI assistants work here
  context.md        ← stable facts AI needs across tasks
  methods/          ← how to approach types of work
  skills/
  workflows/
output/             ← what we produce
  drafts/
  final/
workbench/          ← temporary file drop zone
  input/
```

## Folder Logic

Each top-level folder answers exactly one question:

| Folder | Question |
|---|---|
| `intent/` | What are we doing and why? |
| `context/` | What do we know? |
| `ai/` | How should AI work here? |
| `output/` | What have we produced? |

## Migration Steps

### 1. Read the project first

Before moving anything, read:
- `PROJECT.md` — understand the project intent
- `ai/constitution.md` or equivalent — understand operating rules
- List all top-level folders and their contents

### 2. Create the new folders

Create these folders with their README files if they do not exist:

```
intent/README.md
context/README.md
context/brand/README.md
context/sources/README.md
output/README.md
output/drafts/README.md
output/final/README.md
ai/methods/README.md
```

### 3. Migrate content by role

Use this mapping:

| Old location | New location | Rule |
|---|---|---|
| `briefs/` | `intent/` | Intent and goals |
| `references/` | `context/sources/` | External sources |
| `research/` | `context/sources/` | Working notes and findings |
| `docs/` | `context/sources/` | Project knowledge (if not system docs) |
| `ai/instructions/` | `ai/methods/` | Behavioral rules |
| `ai/playbooks/` | `ai/methods/` | Domain methods |
| `ai/project-context.md` | `ai/context.md` | Stable AI facts |
| `artifacts/` | `output/final/` | Final deliverables |
| `workbench/output/` | `output/drafts/` | Intermediate results |
| `workbench/input/` | `workbench/input/` | No change |

### 4. Update ai/README.md

Replace the read order with:

```
1. ../PROJECT.md
2. constitution.md
3. context.md
4. methods/general.md
5. methods/organization.md
```

### 5. Update AI adapters

Files like `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` should point to the new read order. Keep them thin — they are adapters, not the source of truth.

### 6. Remove or redirect deprecated folders

If `briefs/`, `references/`, `research/`, `artifacts/` are now empty, either delete them or leave a short note redirecting to the new folder.

Do not delete a folder if it still has content that has not been migrated.

### 7. Verify

After migration, check:
- Every file has a clear home
- No folder has an ambiguous or overlapping purpose with another
- `ai/README.md` read order is correct
- AI adapters point to the right files

## What Changes in Mindset

Old structure tried to separate lifecycle stages: sources → research → playbooks → artifacts.

New structure separates by the question each folder answers. Files can evolve in place without needing to move between folders as their role matures.

The old split between `references/` and `research/` is gone: a file can start as a raw source and gain annotations over time, staying in `context/sources/` throughout.

The old split between `ai/instructions/` and `ai/playbooks/` is gone: both answered "how to approach work" and now live together in `ai/methods/`.

## Output

Report:
- What was moved and where
- What was left in place and why
- What still needs a decision from the project owner
