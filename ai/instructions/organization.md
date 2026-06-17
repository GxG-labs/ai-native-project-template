# Organization Rules

Use this short guide when deciding where files belong.

Core rule:

> Organize by lifecycle, not by file type.

Lifecycle promotion rule:

> A file may start as an output and later become an input. Store it by its current durable role, not by how it was originally created.

Naming rule:

> Use conventional names with conventional meaning. If a standard file or folder name already exists for the responsibility, use it instead of inventing a project-specific name.

Folder explanation rule:

> Use `README.md` as the local explanation file for a directory when the directory's purpose is not obvious, when it has meaningful subfolders, or when it has rules that prevent misuse.

Use these locations:

- `briefs/` for meaning input: intent, requests, requirements, goals, and success criteria.
- `workbench/input/` for file input: temporary files dropped in for the current task.
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
- `config/` for project-level configuration when it is not owned by a specific tool.
- `scripts/` for helper scripts and local automation.
- `tests/` for automated tests.
- `tasks/` for explicit task tracking when the project needs file-based task management.
- `evals/` for AI behavior or artifact quality evaluation.
- `templates/` for reusable project templates.
- `examples/` for examples of usage or expected output.
- `tmp/` only for disposable local work.

Skill structure rule:

> Store each durable skill as `ai/skills/<skill-id>/SKILL.md`, with optional supporting files inside the same skill directory. This follows the common Agent Skills pattern used by Codex, Claude Code, and Google Antigravity: a skill is a folder, and `SKILL.md` is its entry point.

Use kebab-case for `<skill-id>`. Keep the `SKILL.md` focused on the trigger, scope, procedure, inputs, outputs, and quality checks. Put large references, examples, templates, assets, or scripts next to it in subfolders such as `references/`, `examples/`, `templates/`, `assets/`, and `scripts/`.

Do not put unrelated skill files directly under `ai/skills/` unless they are deliberately tiny one-file notes and cannot reasonably grow. Prefer a skill directory by default.

Before creating a new folder, answer:

1. What lifecycle or boundary does it represent?
2. Why does an existing folder not fit?
3. Is there already a conventional industry name for this responsibility?
4. Will this folder still make sense in three months?

If the answer is weak, do not create the folder.

When creating a non-obvious folder, add a short `README.md` that explains:

- what belongs there;
- what does not belong there;
- important subfolders, if any;
- where durable work should be promoted next, if relevant.

Do not let `workbench/` become permanent storage. Promote durable files into the correct project folder or delete them when the task is complete.

When working in goal mode or any other multi-step agentic workflow:

1. Start new uncertain outputs in `workbench/output/`.
2. Keep raw user-provided files in `workbench/input/` until their durable role is known.
3. After each phase, classify every useful created file by its next role:
   - source material or raw background -> `references/`;
   - working analysis, findings, or synthesis -> `research/`;
   - structured reusable inputs for later steps, automation, or monitoring -> `data/`;
   - stable project or system knowledge -> `docs/`;
   - final or reviewable human-facing deliverables -> `artifacts/`;
   - reusable AI procedure -> `ai/skills/`, `ai/playbooks/`, or `ai/workflows/`;
   - disposable scratch work -> `tmp/` or delete it.
4. If a result will be read by a later workflow, prefer `data/`, `research/`, or `docs/` over `artifacts/`.
5. Use `artifacts/` for deliverables and exports, not as the default memory store for future work.
