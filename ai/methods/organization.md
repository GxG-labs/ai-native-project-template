# Organization Rules

Core rule: organize by the role a file plays, not by its file type or when it was created.

## Where files belong

| Question | Folder |
|---|---|
| What are we trying to do? Brief, goal, campaign, task | `intent/` |
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

## Skill folder shape

Before placing a skill, check whether its name describes one procedure or a broader capability:

- One procedure -> `ai/skills/[skill-name]/SKILL.md`
- Several related procedures -> `ai/skills/[family-name]/[skill-name]/SKILL.md`
- Broad capability that coordinates nested procedures -> `ai/skills/[capability-name]/SKILL.md` plus nested skill folders
- Fixed orchestration across skills/tools/human steps -> `ai/workflows/[workflow-name].md`

Do not let a broad folder name contain only one narrower `SKILL.md` without making the narrower step explicit. The folder name and the `SKILL.md` job must be at the same abstraction level.

## README rule

Add a folder `README.md` only when the folder has more than one subfolder and the split needs explanation. Do not add README files to empty folders or folders with a single obvious child.
