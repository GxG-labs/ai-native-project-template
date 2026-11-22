---
name: critic-loop
description: Run a project to completion as milestones, each closed by an executor → independent critic loop until a green check command AND a critic score at or above the milestone threshold, on top of the superpowers skills (brainstorming, writing-plans, TDD, subagent-driven development, code review, verification) and the autonomous-development playbook gates (intent → spec → plan artifacts, one check command, hooks, CI, human merge). Use when the user says "critic-loop", "запусти процесс разработки с критиком", "веди план до 9", "исполнитель и критик", "milestones with a critic", or wants autonomous multi-milestone development with scored reviews.
---

# Critic loop

You are the **orchestrator**. You turn a goal into milestones and drive each one through
`executor → critic → fixes` until it is done. A milestone is done when both hold:
- a **deterministic gate** is green (one check command, CI);
- an **independent critic** scores it at or above the milestone threshold.

Base documents:
- **superpowers** skills supply the procedures: how to brainstorm, plan, test, review and verify.
- the autonomous-development playbook (`ai/playbooks/autonomous-dev-v3.md`) supplies
  the control: artifacts in git, human approval points, gates. Its principles hold here too:
  - verification is the bottleneck, not generation;
  - every stage leaves a file in git;
  - an instruction advises, a gate enforces;
  - an agent never accepts its own work;
  - one check is one command with an exit code;
  - keep the number of services to a minimum.

The loop rules below come from a real run that was slow. That run lost its time to idle waiting between
threads and to moving goalposts, not to writing code.

## 0. Preconditions

- **superpowers.** Check that the superpowers skills are available:
  `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:test-driven-development`,
  `superpowers:subagent-driven-development`, `superpowers:requesting-code-review`,
  `superpowers:verification-before-completion`, `superpowers:using-git-worktrees`,
  `superpowers:finishing-a-development-branch`. If they are missing, say once: "install the
  superpowers skill library (github.com/obra/superpowers)". Then continue, using your environment's own
  equivalents: a planning mode, a fresh-context code review, an app verification run, git worktrees.
- **One check command.** The repo needs one check command (`make check` / `npm run check` / `uv run
  check-all`) that exits non-zero on any failure. If it does not exist, it is milestone 0.
- **Gates.** These must be in place: a branch guard (no commit or push to `main`), a `Stop` hook that runs
  the check before the agent may finish, and CI that runs the same command on every PR. If they are missing, add them in milestone 0,
  per playbook §5.
- **Merging.** Merging to `main` is done only by the owner.

## 1. Intake: artifacts the owner approves, once

1. `intent/<change>/intent.md`. Write the problem and the acceptance criteria in plain words, with
   `superpowers:brainstorming` (fallback: up to 5 sharp questions). The **owner approves** it.
2. `docs/spec/<scope>/spec.md`. Write it only if requirements or architecture change. The owner approves it.
3. `docs/plan/<change>/plan.md`. Write it with `superpowers:writing-plans` (fallback: your planning mode).
   For each milestone give:
   - `id`, goal, dependencies, a wave (milestones with no dependency on each other run in parallel);
   - **type**: `spike` | `tooling` | `core` | `adversarial` (security gates, auth, isolation, anything an
     attacker would try to bypass);
   - **threshold**: `spike`/`tooling` → 8, `core`/`adversarial` → 9;
   - **acceptance criteria (AC)**: each one checkable by a command. Mark manual ones `[manual]`;
   - **DoD**: the check command plus any extra tools (mutation testing, secret scan). Fix them **now**.
     Prefer standard tools over home-made ones.
4. **All owner decisions up front.** List every open question the plan touches. Ask them in one batch,
   each with a recommended default.
5. Create `reports/progress.md` (format in §5) and commit it. The **owner approves the plan**. Then start.

From here on, the rules, thresholds, DoD and rubric are **frozen**. Changes apply from the next cycle
(rule F3).

## 2. Running milestones

- **Start.**
  - Start every milestone in the current wave.
  - Each runs as a **background sub-agent** in its own git worktree (`superpowers:using-git-worktrees`).
    No more than 4 at once.
  - Use a mechanism that wakes you when a sub-agent finishes. **Never poll, never sleep.**
  - For work that must outlive this session, start one long-running remote session per milestone with
    the same brief.
- **The milestone owner.** Each subagent is the **milestone owner**. It runs the whole loop (§3) itself
  and reports to you only **closed** or **escalation**. The orchestrator stays out of the inner loop.
- **Brief.** Each milestone owner gets:
  - its plan section;
  - the frozen rules (§4);
  - the paths to `references/executor.md` and `references/critic.md` in this skill's directory;
  - the branch `<prefix>/<milestone-id>`;
  - the base commit;
  - the check command.
- **Closing a milestone.**
  1. Read the last critic report. Re-run the check command yourself.
  2. Add a row to the ledger and commit.
  3. Merge the closed branch into an integration branch and run the check there.
  4. Start the milestones it unblocks.
- **Owner questions never block.**
  - Write each one under "Waiting for owner" in `progress.md`, with the default you took.
  - Keep going on that default. Keep going on every milestone the question does not touch.
  - A different answer from the owner later becomes `new_scope` for the next cycle.

## 3. The loop inside one milestone (the milestone owner runs it)

```
cycle = 1
loop:
  EXECUTE  — subagent with references/executor.md (fresh context, same worktree)
             tests first (superpowers:test-driven-development), then code, then a self-check:
             check command + DoD tools + critic rubric, output attached to the report
  GATE     — the check command must exit 0 (CI green on the pushed head); if not → back to EXECUTE,
             this does not count as a cycle and the critic is not started
  CRITIQUE — subagent with references/critic.md (fresh context, never the executor)
             cycle 1: exhaustive list of findings (+ threat model for `adversarial`)
             cycle ≥ 2: the frozen checklist from cycle N-1 + regressions
  commit report → reports/critic/<id>-cycle-<n>.json
  if score ≥ threshold and every AC passed (or is [manual] and waiting) → CLOSE
  if cycle == 5, or the score rose by less than 0.5 two cycles in a row → ESCALATE
  checklist = critic.required_improvements   (frozen for the next cycle)
  cycle += 1
```

**CLOSE**:
1. Run `superpowers:verification-before-completion` (fallback: run the app and check the change yourself). Run the AC commands yourself
   and read their output.
2. Run `superpowers:finishing-a-development-branch`. Push the branch and open a PR. Its description holds
   what changed, the check output, the critic report and what the owner should check by hand. **Do not
   merge.**

**ESCALATE** to the orchestrator with:
- the last score;
- the open findings with their `origin`;
- one concrete choice for the owner: accept them as a known risk (recorded in the report), narrow the AC,
  or allow one more cycle.

## 4. Frozen rules against idle cycles (put them in every brief)

- **F1 Origin.** Every finding carries an `origin`:
  - `new_regression`: introduced by this cycle;
  - `missed_earlier`: existed before, and a past critic should have caught it;
  - `new_scope`: follows from a requirement added after the cycle started.

  The ledger counts these. The counts show who creates the cycles: the executor, the critic or the rules.
- **F2 Fixed bar.** From cycle 2, the critic scores against the frozen checklist plus `new_regression`.
  Findings that are `missed_earlier` and `major` or lower go to `docs/backlog.md` and do **not** lower
  the score. Only `critical` blocks, whatever its origin. For `adversarial` milestones, the threat model
  from cycle 1 is the full list of paths. A new path outside it is `new_scope`.
- **F3 No mid-cycle rule changes.** A new DoD tool, rubric line or requirement applies from the next
  cycle. Findings that follow only from it are `new_scope` and never lower the current score.
- **F4 Gate before critic.** The critic never sees a red check. The executor runs every DoD tool and the
  rubric itself. A critic finding that a DoD tool would have caught counts against the executor in the
  ledger.
- **F5 Proportion.**
  - In a `spike`, findings about a fallback or a rejected option are `minor`.
  - `minor` findings never block a score at or above the threshold. They go to the backlog with the
    milestone id.
- **F6 Adversarial cap.** If the last allowed cycle still has open `major` findings, and every one needs
  an agent acting against the owner with the owner's own account, escalate with "accept as a known
  risk". Do not run another cycle.
- **F7 Prefer what exists.** For every home-made mechanism, the critic asks: "is there a standard tool or
  library?" (field `existing_solutions`). A replacement follows F3.
- **F8 Push a repeated finding down a layer** (playbook §3, §7.10). If the same kind of finding shows up
  in two milestones, don't let a third critic find it again. Turn it into a gate:
  - a lint rule;
  - a test;
  - a hook;
  - a CI step;
  - or, if it cannot be checked mechanically, a line in `RULES.md` or a path-scoped rules file.

  The change is made between cycles and follows F3. Editing protected files (`RULES.md`, CI workflows)
  needs the owner's OK. Put it under "Waiting for owner".

## 5. Ledger `reports/progress.md`

```markdown
# Progress
## Waiting for owner
- [ ] <question> — default taken: <x> — affects: <milestones>

## Metrics
| milestone | cycles | first-critic score | gate red before critic | new_regression | missed_earlier | new_scope | intent→PR (h) |

## Log
| milestone | cycle | role | branch | commit | score | decision | time (UTC) |
```

Add one row per event and commit it together with the work it describes. No commits that only touch the
progress file. The metrics follow playbook §9. A low first-critic score points to an unclear plan or AC.
Many `missed_earlier` findings point to a weak critic. Many `new_scope` findings point to rules changed
mid-run.

## 6. Done

The goal is reached when, for every milestone:
- the check command is green;
- the last critic score is at or above its threshold;
- every AC has passed, or is `[manual]` and confirmed by the owner.

Report to the owner:
- the metrics table;
- the open "Waiting for owner" items;
- the PRs to merge, in merge order;
- gates added under F8.
