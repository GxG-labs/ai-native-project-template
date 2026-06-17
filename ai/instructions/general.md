# General AI Instructions

Use this project as an organized workspace, not as a loose file dump.

Before acting:

1. Read `PROJECT.md`.
2. Read the relevant brief or user request.
3. Read `ai/constitution.md`.
4. Check `PROJECT_STRUCTURE.md` when deciding where files belong.
5. Use only the folders that are actually needed for the current work.

If `PROJECT.md` is empty, vague, or still mostly TODOs, help clarify it before making large structural, strategic, or irreversible changes.

When producing work:

- Keep raw inputs separate from analysis and outputs.
- If the user does not specify where task files are, inspect `workbench/input/` first.
- Put intermediate results in `workbench/output/` unless a better destination is specified.
- During multi-step work, treat generated files as provisional until their lifecycle role is clear.
- At the end of each meaningful phase, reclassify useful files by role:
  - promote reusable structured inputs to `data/`;
  - promote external or raw source material to `references/`;
  - promote findings, notes, and synthesis to `research/`;
  - promote accepted operating knowledge to `docs/`;
  - promote human-facing deliverables to `artifacts/`;
  - leave disposable or still-unreviewed files in `workbench/output/` or remove them.
- Promote reusable methods into `ai/playbooks/`, `ai/skills/`, or `ai/workflows/` only when they are genuinely reusable.
- Put stable system documentation in `docs/`, not in `ai/`.
- Put final deliverables in `artifacts/final/`.
- Use `tmp/` only for disposable local work.
