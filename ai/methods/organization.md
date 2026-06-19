# Organization Rules

Core rule: organize by the role a file plays, not by its file type or when it was created.

## Where files belong

| Question | Folder |
|---|---|
| What are we trying to do? Brief, goal, campaign, task | `intent/` |
| Who are we? Brand, author, tone of voice | `context/brand/` |
| What do we know from the world? Sources, notes, findings | `context/sources/` |
| How should AI work here? Instructions, playbooks, rules | `ai/methods/` |
| Executable AI procedure for a repeatable task | `ai/skills/` |
| Multi-step orchestration across several skills or tools | `ai/workflows/` |
| Work in progress, intermediate generated results | `output/drafts/` |
| Accepted final deliverables | `output/final/` |
| Files the user dropped in without classification | `workbench/input/` |
| Stable facts AI needs across all tasks | `ai/context.md` |
| Why the project exists | `PROJECT.md` |
| Structured datasets | `data/` |
| Implementation code | `src/` |
| Disposable scratch work | `tmp/` |

## Lazy creation

Create a folder only when a real file needs to go there. Do not create folders to match a reference structure.

## README rule

Add a `README.md` when a folder's purpose is not obvious or misuse is likely. Keep it short: what belongs, what does not.
