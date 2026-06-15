# AI-Native Project Template

This repository is a template for AI-assisted projects: software, agents, research pipelines, marketing systems, personal assistants, document automation, presentations, and other deliverables.

It is designed for projects that may involve code, documents, datasets, research, presentations, generated artifacts, and reusable AI instructions.

## Start Here

- `PROJECT.md` explains why this project exists, its main job, and what a good result means.
- `PROJECT_STRUCTURE.md` explains the project organization model.
- `ai/README.md` explains the shared AI operating system.
- `ai/project-context.md` stores stable project context.
- `ai/instructions/organization.md` gives short file placement rules.
- `briefs/` stores project intent and task requests.
- `workbench/input/` is the default place to drop files for the current task.
- `workbench/output/` is the default place for intermediate generated results.

The template uses lazy folder creation. New projects start small. Additional folders are created only when real work requires them.

## How To Start A New Project

1. Rename the project and update this `README.md`.
2. Fill in `PROJECT.md` with the project's purpose, main job, ideal result, and success criteria.
3. Fill in `ai/project-context.md` with durable facts: audience, constraints, glossary, and assumptions.
4. Create a brief in `briefs/` that captures the first real goal.
5. Drop current task files into `workbench/input/` if no better location exists yet.
6. Ask the assistant to work from `PROJECT.md`, the brief, and `workbench/input/`.
7. Review outputs in `workbench/output/`.
8. Promote durable results into the right long-term location.

## Default File Flow

```text
briefs/             -> what is being asked
workbench/input/    -> temporary files for the current task
workbench/output/   -> intermediate generated results
references/         -> external sources worth keeping
research/           -> working analysis and findings
ai/playbooks/       -> reusable domain methods
ai/skills/          -> repeatable AI procedures
docs/               -> stable project/system documentation
artifacts/          -> draft and final deliverables
data/               -> structured datasets
src/                -> implementation code
```

## Growth Rule

Do not create the full folder tree upfront.

Create a folder only when:

- a real file needs that location;
- the folder represents a clear lifecycle or module boundary;
- a workflow or tool requires it.

Use `PROJECT_STRUCTURE.md` as the full reference catalog.

## AI Assistants

All AI assistants should use the same project operating layer:

```text
ai/
```

The root files `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` are thin adapters. They point different assistant systems to the same shared instructions.

Read `PROJECT.md` first. It is the project charter: why the project exists, what its main job is, and what success means.
