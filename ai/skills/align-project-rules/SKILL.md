---
name: align-project-rules
description: Audit and realign a project to this template's shared AI operating rules, lifecycle-based folder structure, adapter contract, and lightweight anti-sprawl conventions. Use when the user asks to clean up, normalize, reorganize, repair, bring a project back to rules, review structure, move files into proper homes, update AI instruction adapters, or make a project conform to PROJECT.md, ai/, and PROJECT_STRUCTURE.md.
---

# Align Project Rules

## Overview

Bring a project back into alignment with its own source-of-truth rules. Treat `RULES.md` as the authority for agent behavior; treat `PROJECT.md`, `ai/context.md`, `ai/methods/`, and `PROJECT_STRUCTURE.md` as the authority for project intent, durable context, working methods, and structure. Treat tool-specific instruction files and editor rule files as adapters.

## Required Reading

Before auditing or changing anything, read `RULES.md` first, then follow the startup order it defines. For this template, the required order is:

1. `RULES.md`
2. `PROJECT.md`
3. `ai/context.md`
4. `ai/methods/general.md`
5. `ai/methods/organization.md`
6. `PROJECT_STRUCTURE.md`

Read additional `ai/methods/`, `ai/skills/`, and `ai/workflows/` files only when relevant to the task. If required files are missing, damaged, or contradictory, stop broad reorganization and first repair or ask about the source of truth.

## Workflow

1. Inspect current state.
   - Check repository status before editing and preserve unrelated user changes.
   - List top-level files and folders.
   - Inspect AI adapters and the `ai/` layer.
   - Look for obvious misplaced files, duplicated rules, stale TODO-heavy project identity, empty folder sprawl, and mixed lifecycles.

2. Classify each issue by lifecycle.
   - Intent, requirements, briefs, goals, campaigns, and task definitions belong in `intent/`.
   - Temporary task inputs belong in `workbench/input/`.
   - Intermediate generated work belongs in `output/drafts/`.
   - Accepted final deliverables belong in `output/final/`.
   - External sources, raw background materials, findings, and working notes belong in `context/sources/`.
   - Stable facts AI needs across tasks belong in `ai/context.md`.
   - Reusable structured inputs for later steps, automation, monitoring, or repeat workflows belong in `data/`.
   - Reusable AI methods belong in `ai/methods/`, `ai/skills/`, or `ai/workflows/`.
   - Reusable quality gates belong in `ai/checklists/`.
   - Primary implementation belongs in `src/`; tests belong in `tests/`; helper automation belongs in `scripts/`; disposable local work belongs in `tmp/`.
   - If a generated result becomes an input for later work, classify it by its new durable role rather than leaving it in `output/drafts/`.

3. Plan the smallest useful change set.
   - Prefer moving or editing only files needed to restore the project rules.
   - Do not create every folder from the reference structure.
   - Create folders lazily only when a real file needs that home, a workflow requires it, or the folder clarifies a durable boundary.
   - Add a short `README.md` only when a folder has more than one subfolder and the split needs explanation.

4. Apply safe corrections.
   - Keep AI adapters thin. They should contain only a pointer to `RULES.md`.
   - Keep hidden tool-specific folders limited to routing config; do not store substantive guides, documentation, or AI instructions there.
   - Keep shared AI methods in `ai/`; keep reusable skills portable and avoid references to a specific AI product.
   - Keep raw inputs, sources, reusable methods, draft outputs, final deliverables, data, and implementation separate.
   - Preserve conventional names and conventional meaning.
   - Do not rename or move files whose purpose is unclear without evidence from the intent, README, project context, or user request.

5. Verify alignment.
   - Re-read the changed files or directory listing that proves the correction.
   - Check that adapters point only to `RULES.md`.
   - Check that no empty reference-structure folders were created just for completeness.
   - Run available tests or lightweight validation when the change touches executable behavior.
   - Report remaining ambiguities, especially if `PROJECT.md` is still vague or mostly TODOs.

## Decision Rules

- If `PROJECT.md` is empty, vague, or mostly TODOs, help clarify it before large structural, strategic, or irreversible changes.
- If the user asks for "make it follow the rules" without specifying scope, start with structure, AI adapters, and obvious lifecycle violations. Avoid rewriting project intent unless requested.
- If two rules conflict, prefer `RULES.md` for agent behavior and the more specific project file for project content; surface the conflict in the final report.
- If a folder contains mixed lifecycles, split by role rather than by file type.
- If a file was produced as an output but will be consumed by a later workflow, monitoring process, or agent run, promote it to `data/`, `context/sources/`, `ai/context.md`, or another role-appropriate home. Do not use `output/` as the default memory store for future work.
- If a method becomes reusable during cleanup, promote it into `ai/methods/`, `ai/skills/`, `ai/workflows/`, or `ai/checklists/` only when it is genuinely reusable.
- For growing registries that agents or humans will extend repeatedly, include Scope, Structure, and Examples unless the format is already standard.
- Protect private data. Follow `PRIVACY.md` and `SECURITY.md` when present; if they are missing and sensitive materials exist, flag the gap.

## Output

End with a compact report:

- What was brought back into alignment.
- What files or folders changed.
- What was deliberately left untouched and why.
- What still needs a human decision, if anything.
