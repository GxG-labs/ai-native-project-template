# General AI Instructions

Use this project as an organized workspace, not as a loose file dump.

Before acting:

1. Read the relevant brief or user request.
2. Read `ai/constitution.md`.
3. Check `PROJECT_STRUCTURE.md` when deciding where files belong.
4. Use only the folders that are actually needed for the current work.

When producing work:

- Keep raw inputs separate from analysis and outputs.
- If the user does not specify where task files are, inspect `workbench/input/` first.
- Put intermediate results in `workbench/output/` unless a better destination is specified.
- Promote reusable methods into `ai/playbooks/`, `ai/skills/`, or `ai/workflows/` only when they are genuinely reusable.
- Put stable system documentation in `docs/`, not in `ai/`.
- Put final deliverables in `artifacts/final/`.
- Use `tmp/` only for disposable local work.
