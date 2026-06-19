---
name: align-project-rules
description: Audit and realign a project to this template's shared AI operating rules, lifecycle-based folder structure, adapter contract, and lightweight anti-sprawl conventions. Use when the user asks to clean up, normalize, reorganize, repair, bring a project back to rules, review structure, move files into proper homes, update AI instruction adapters, or make a project conform to PROJECT.md, ai/, and PROJECT_STRUCTURE.md.
---

# Align Project Rules

## Overview

Bring a project back into alignment with its own source-of-truth rules. Treat `PROJECT.md`, `ai/`, and `PROJECT_STRUCTURE.md` as the authority; treat tool-specific files such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, Cursor rules, Windsurf rules, and Copilot instructions as adapters.

## Required Reading

Before auditing or changing anything, read these files in order from the project root:

1. `PROJECT.md`
2. `ai/README.md`
3. `ai/constitution.md`
4. `ai/project-context.md`
5. `ai/instructions/general.md`
6. `ai/instructions/organization.md`
7. `PROJECT_STRUCTURE.md`

If any of these files are missing, damaged, or contradictory, stop broad reorganization and first repair or ask about the source of truth.

## Workflow

1. Inspect current state.
   - Check repository status before editing and preserve unrelated user changes.
   - List top-level files and folders.
   - Inspect AI adapters and the `ai/` layer.
   - Look for obvious misplaced files, duplicated rules, stale TODO-heavy project identity, empty folder sprawl, and mixed lifecycles.

2. Classify each issue by lifecycle.
   - Intent and requirements belong in `briefs/`.
   - Temporary task inputs belong in `workbench/input/`.
   - Intermediate generated work belongs in `workbench/output/`.
   - External sources and raw background materials belong in `references/`.
   - Working analysis belongs in `research/`.
   - Reusable structured inputs for later steps, automation, monitoring, or repeat workflows belong in `data/`.
   - Reusable AI methods belong in `ai/playbooks/`, `ai/skills/`, or `ai/workflows/`.
   - Reusable quality gates belong in `ai/checklists/`.
   - Stable project or system documentation belongs in `docs/`.
   - Final deliverables belong in `artifacts/final/` unless a more specific artifact location exists.
   - Primary implementation belongs in `src/`; tests belong in `tests/`; helper automation belongs in `scripts/`; disposable local work belongs in `tmp/`.
   - If a generated result becomes an input for later work, classify it by its new durable role rather than leaving it in `artifacts/` or `workbench/output/`.

3. Plan the smallest useful change set.
   - Prefer moving or editing only files needed to restore the project rules.
   - Do not create every folder from the reference structure.
   - Create folders lazily only when a real file needs that home, a workflow requires it, or the folder clarifies a durable boundary.
   - Add a short `README.md` only when a new or existing folder's purpose is not obvious or misuse is likely.

4. Apply safe corrections.
   - Keep AI adapters thin. They should route agents to the shared `ai/` system rather than duplicate rules.
   - Keep shared AI rules in `ai/`; do not move stable product/system documentation into `ai/`.
   - Keep raw inputs, analysis, reusable methods, final outputs, data, and implementation separate.
   - Preserve conventional names and conventional meaning.
   - Do not rename or move files whose purpose is unclear without evidence from the brief, README, project context, or user request.

5. Verify alignment.
   - Re-read the changed files or directory listing that proves the correction.
   - Check that adapters still point to the required reading order.
   - Check that no empty reference-structure folders were created just for completeness.
   - Run available tests or lightweight validation when the change touches executable behavior.
   - Report remaining ambiguities, especially if `PROJECT.md` is still vague or mostly TODOs.

## Decision Rules

- If `PROJECT.md` is empty, vague, or mostly TODOs, help clarify it before large structural, strategic, or irreversible changes.
- If the user asks for "make it follow the rules" without specifying scope, start with structure, AI adapters, and obvious lifecycle violations. Avoid rewriting project intent unless requested.
- If two rules conflict, prefer the more specific project file over a generic template rule, and surface the conflict in the final report.
- If a folder contains mixed lifecycles, split by role rather than by file type.
- If a file was produced as an output but will be consumed by a later workflow, monitoring process, or agent run, promote it to `data/`, `research/`, or `docs/` according to its current role. Do not use `artifacts/` as the default memory store for future work.
- If a method becomes reusable during cleanup, promote it into `ai/playbooks/`, `ai/skills/`, `ai/workflows/`, or `ai/checklists/` only when it is genuinely reusable.
- Protect private data. Follow `PRIVACY.md` and `SECURITY.md` when present; if they are missing and sensitive materials exist, flag the gap.

## Output

End with a compact report:

- What was brought back into alignment.
- What files or folders changed.
- What was deliberately left untouched and why.
- What still needs a human decision, if anything.
