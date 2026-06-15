# Organization Rules

Use this short guide when deciding where files belong.

Core rule:

> Organize by lifecycle, not by file type.

Use these locations:

- `briefs/` for intent, requests, requirements, and goals.
- `workbench/input/` for temporary files dropped in for the current task.
- `workbench/output/` for intermediate generated results.
- `references/` for external sources and raw background materials.
- `research/` for working analysis, notes, findings, and synthesis.
- `ai/playbooks/` for reusable domain methods.
- `ai/skills/` for repeatable executable AI procedures.
- `ai/workflows/` for multi-step orchestration.
- `ai/checklists/` for reusable quality gates.
- `docs/` for stable project and system documentation.
- `artifacts/` for drafts, final deliverables, and exports.
- `data/` for structured datasets and processed data.
- `src/` for primary implementation code.
- `modules/` only for bounded capabilities in larger systems.
- `tmp/` only for disposable local work.

Before creating a new folder, answer:

1. What lifecycle or boundary does it represent?
2. Why does an existing folder not fit?
3. Will this folder still make sense in three months?

If the answer is weak, do not create the folder.

Do not let `workbench/` become permanent storage. Promote durable files into the correct project folder or delete them when the task is complete.
