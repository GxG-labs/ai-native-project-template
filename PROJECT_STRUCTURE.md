# Project Structure

## Core Principle

Each folder answers exactly one question. When you are not sure where a file belongs, find which question it answers.

| Folder | Question |
|---|---|
| `intent/` | What are we doing and why? |
| `context/` | What do we know? |
| `ai/` | How should AI work here? |
| `output/` | What have we produced? |

## Folder Map

```
PROJECT.md              ← why the project exists

intent/                 ← goals, briefs, tasks, campaign definitions
  README.md
  campaigns/            ← (lazy) one subfolder per campaign
  tasks/                ← (lazy) broken-down work items

context/                ← background knowledge
  README.md
  brand/                ← tone of voice, author profile, brand identity
    README.md
  sources/              ← external sources, working notes, findings
    README.md

ai/                     ← AI operating layer
  README.md
  constitution.md       ← operating principles
  context.md            ← stable facts AI needs across tasks
  methods/              ← how to approach types of work
    README.md
    general.md
    organization.md
  skills/               ← executable procedures for repeatable tasks
  workflows/            ← multi-step orchestration
  checklists/           ← (lazy) reusable quality gates

output/                 ← project outputs
  README.md
  drafts/               ← work in progress
  final/                ← accepted deliverables

workbench/              ← temporary file drop zone
  README.md
  input/                ← files provided for the current task
```

Lazy folders — create only when a real file needs a home:

```
data/                   ← structured datasets
src/                    ← implementation code
scripts/                ← utility commands
tests/                  ← automated tests
evals/                  ← AI behavior evaluation
tmp/                    ← disposable local work
```

## Rules

**Lazy creation.** Do not create a folder until a real file needs to go there. The map above is a catalog of allowed locations, not a required starting structure.

**README in every folder.** Add a `README.md` when a folder's purpose is not obvious or when misuse is likely. Keep it short: what belongs, what does not.

**Nested folders are fine.** Use subfolders when a category grows enough that a flat list becomes hard to navigate. Do not create subfolders preemptively.

**Promote reusable methods.** When a working method becomes reusable, move it from `context/sources/` or `output/drafts/` into `ai/methods/` or `ai/skills/`.

## Starting Structure

Every new project starts with this minimum:

```
PROJECT.md
README.md
PROJECT_STRUCTURE.md
CLAUDE.md / AGENTS.md / GEMINI.md
SECURITY.md
PRIVACY.md
.gitignore
.env.example

ai/
  README.md
  constitution.md
  context.md
  methods/
    general.md
    organization.md

intent/
  README.md

workbench/
  input/
```

Everything else is created lazily.

## Classification Quick Reference

When deciding where a file belongs, ask what role it plays now — not what it was when it was created.

- Starting a task, defining goals → `intent/`
- Brand, voice, author identity → `context/brand/`
- Source material, notes, findings → `context/sources/`
- AI behavioral rules, methods → `ai/methods/`
- Executable AI procedures → `ai/skills/`
- Multi-step workflows → `ai/workflows/`
- Work in progress → `output/drafts/`
- Accepted deliverables → `output/final/`
- Files dropped in for the current task → `workbench/input/`
- Structured data → `data/`
- Code → `src/`
- Scratch work → `tmp/`
