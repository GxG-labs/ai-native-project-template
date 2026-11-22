---
name: auto-loop
description: Use when a copied self-improving loop run has a defined task and is ready to execute autonomously.
---

# Auto loop

1. Validate `task.md`: no placeholders; owner, result, permitted and excluded scope, acceptance criteria, and runnable checks are present. Stop if a required field is missing.
2. Read `project-context/SKILL.md` and load the current context.
3. Select the smallest unchecked acceptance criterion. For a multi-part feature, read `feature-builder/SKILL.md`; otherwise run `build/SKILL.md`, `write-checks/SKILL.md`, and `approve-checks/SKILL.md` in order.
4. Read `self-improve/SKILL.md` and perform the inner loop after the keep-or-revert decision.
5. Overwrite `execution_state.md` after every step with the task, iteration, current step, latest observation, check status, measures, decision, and next action. Read it before the next step. Do not accumulate the full action history in chat or state.
6. Repeat while an unchecked criterion has a safe next step. Stop when all acceptance criteria pass on the changed system with fresh evidence, two iterations make no measurable progress, or a human decision gate is reached. Report the status and evidence.

Human decision gates include deployment, money, external side effects, irreversible operations, security-sensitive access, and a change outside the approved scope. A task's specific risk or project rule may add more gates.
