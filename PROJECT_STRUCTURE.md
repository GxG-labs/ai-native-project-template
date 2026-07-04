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
  campaigns/            ← (lazy) one subfolder per campaign
  tasks/                ← (lazy) broken-down work items

context/                ← background knowledge
  sources/              ← external sources, working notes, findings

ai/                     ← AI operating layer
  README.md
  context.md            ← stable facts AI needs across tasks
  methods/              ← how to approach types of work
    general.md
    organization.md
    structured-data.md  ← pattern for growing registry files
  skills/               ← executable procedures for repeatable tasks
  workflows/            ← multi-step orchestration
  checklists/           ← (lazy) reusable quality gates
  references/           ← (lazy) curated lists of external tools and repositories

output/                 ← project outputs
  drafts/               ← work in progress
  final/                ← accepted deliverables

workbench/              ← temporary file drop zone
  input/                ← files provided for the current task
```

Lazy folders — create only when a real file needs a home:

```
data/                   ← structured datasets
src/                    ← implementation code
scripts/                ← utility commands
tests/                  ← automated tests
evals/                  ← AI behavior evaluation
templates/              ← blank templates for recurring project artifacts
tmp/                    ← disposable local work
```

## Rules

**Lazy creation.** Do not create a folder until a real file needs to go there. The map above is a catalog of allowed locations, not a required starting structure.

**README only at branch points.** Add a folder `README.md` only when the folder has more than one subfolder and the split needs explanation. Do not add README files to empty folders or folders with a single obvious child.

**Nested folders are fine.** Use subfolders when a category grows enough that a flat list becomes hard to navigate. Do not create subfolders preemptively.

**Promote reusable methods.** When a working method becomes reusable, move it from `context/sources/` or `output/drafts/` into `ai/methods/` or `ai/skills/`.

## Starting Structure

Every new project starts with this minimum:

```
PROJECT.md
README.md
PROJECT_STRUCTURE.md
RULES.md               ← agent behavior SSOT (human-curated)
AGENTS.md              ← adapter: points to RULES.md
CLAUDE.md              ← adapter: points to RULES.md
GEMINI.md              ← adapter: points to RULES.md
SECURITY.md
PRIVACY.md
.gitignore
.env.example

ai/
  README.md
  context.md
  methods/
    general.md
    organization.md
  workflows/
    initialize-project.md
    INITIALIZATION_QUICK_START.md

intent/
  .gitkeep

workbench/
  input/
    .gitkeep
```

`intent/.gitkeep` and `workbench/input/.gitkeep` keep the two empty startup folders in Git. Everything else is created lazily.

## Classification Quick Reference

When deciding where a file belongs, ask what role it plays now — not what it was when it was created.

- Starting a task, defining goals → `intent/`
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
