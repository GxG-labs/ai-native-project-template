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

## Reports to the owner: What | Why | Why it's needed

This format is **only for messages to the owner**: the overall plan at intake, each wave, every
intermediate step you announce to the owner, statuses, `blocked_on_owner` notices and the final report.
It is **not** for briefs and prompts to subagents or milestone owners, cycle plans, status lines,
ledger rows, escalations between agents, or any other file. Write those in their normal form.
It only changes how messages to the owner are written, so the owner can read them easily. It does not
change how you think, plan or work.
One bullet per step, three parts, one short line each, in the owner's language (for a Russian-speaking owner: **Что | Зачем | Почему**):

- **What**: the concrete action you are about to take.
- **Why (goal)**: what it achieves, and for which goal or AC.
- **Why it's needed**: why it cannot be skipped. Name what breaks, or which AC or gate fails, without it.

Example:
- **What:** add pytest-timeout to check-all | **Why:** a hanging test turns the gate red after 5 min, not
  after 4 h | **Why it's needed:** without it the milestone owner hangs silently and the milestone stalls.

## 1. Intake: artifacts the owner approves, once

1. `intent/<change>/intent.md`. Write the problem and the acceptance criteria in plain words, with
   `superpowers:brainstorming` (fallback: up to 5 sharp questions). The **owner approves** it.
2. `docs/spec/<scope>/spec.md`. Write it only if requirements or architecture change. The owner approves it.
3. `docs/plan/<change>/plan.md`. Write it with `superpowers:writing-plans` (fallback: your planning mode).
   For each milestone give:
   - `id`, goal, dependencies, a wave (milestones with no dependency on each other run in parallel);
   - **type**: `spike` | `tooling` | `core` | `adversarial` (security gates, auth, isolation, anything an
     attacker would try to bypass);
   - **threshold**: 8 for every milestone; 9 only for `security` milestones (auth, approval, policy,
     tokens, secrets);
   - **acceptance criteria (AC)**: each one checkable by a command. Mark manual ones `[manual]`;
   - **DoD**: the check command plus any extra tools (mutation testing, secret scan). Fix them **now**.
     Mutation testing runs only on the files the milestone changed, and only in security modules. One
     full mutation run happens once, before the merge to `main`.
     Prefer standard tools over home-made ones.
4. **All owner decisions up front.** List every open question the plan touches. Ask them in one batch,
   each with a recommended default.
5. Create `reports/progress.md` (format in §5) and commit it. Show the plan in the What | Why | Why it's
   needed format, and the **owner approves it**. Then start.

From here on, the rules, thresholds, DoD and rubric are **frozen**. Changes apply from the next cycle
(rule F3).

## 2. Running milestones

- **Start.**
  - Start every milestone in the current wave.
  - Each runs as a **background sub-agent** in its own git worktree (`superpowers:using-git-worktrees`).
    No more than 3 at once.
    Pick each subagent's model by its role (see "Models for subagents" below).
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

## Models for subagents

Tokens are the main cost of this process. Give each role the cheapest model that does it well.

| Role | Model |
| --- | --- |
| Orchestrator; spec and design decisions; the pre-code design review | the strongest model |
| Critic of a `security` milestone | the strongest model |
| Critic of a `spike`, `tooling` or `core` milestone | a mid-tier model |
| Executor (default) | a mid-tier model |
| Executor for formal items (F10): evidence, stale ids, report regeneration, lint, renames | the smallest model |
| Heartbeat, status lines, ledger rows, re-running the gate, reading logs, searching the repo | the smallest model |

- Move an executor up one tier only on evidence: the same finding survived two cycles at the lower tier.
  Record it in the ledger.
- Never move the critic below the executor's tier for the same milestone.
- Add a `model` column to the ledger rows, so the cost of each milestone is visible.

Set the model when you start each subagent or session, and a lower reasoning effort for routine
work where the tool allows it. Some tools fix the model when a session starts, so choose first.

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
  if the score is capped only by AC that need an owner action or outside access,
     and there is no open critical/major                                → BLOCKED_ON_OWNER (F9)
  if every AC passed, there is no open critical/major, and the only
     required_improvements are formal                                  → GATE_CLOSE (F10)
  if cycle == 3, or the score rose by less than 0.5 two cycles in a row → ESCALATE
  checklist = critic.required_improvements   (frozen for the next cycle)
  cycle += 1
```

**CLOSE**:
1. Run `superpowers:verification-before-completion` (fallback: run the app and check the change yourself). Run the AC commands yourself
   and read their output.
2. Run `superpowers:finishing-a-development-branch`. Push the branch and open a PR. Its description holds
   what changed, the check output, the critic report and what the owner should check by hand. **Do not
   merge.**

**BLOCKED_ON_OWNER**: stop the cycles at once. Record the milestone as `blocked_on_owner` in the ledger, put
the exact owner action under "Waiting for owner", and report it to the owner in the What | Why | Why
it's needed format. The milestone resumes with a new cycle only when the owner has acted. Milestones that do not
depend on it keep running.

**GATE_CLOSE**: the milestone owner fixes the formal items, runs the check command until it is green,
commits, and reports. The orchestrator re-runs the check and the AC commands itself and closes the
milestone. No new critic cycle.

**ESCALATE** to the orchestrator (the orchestrator reports it to the owner in the What | Why | Why
it's needed format), with:
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

- **F9 Blocked on owner: no empty cycles.** A cycle that cannot raise the score is not run. If a critic
  score is capped only by AC that need an owner action or outside access (a repository, a secret, an
  account, a manual GitHub step), and there is no open `critical` or `major`, the milestone stops as
  `blocked_on_owner` right after that report. The owner action goes into the cycle-1 plan as soon as it
  is known. If an AC is likely to be blocked, ask for the access at intake, not after the first critic.
- **F10 Gate closure.** Formal items are evidence not committed, a stale mutant id, a report to
  regenerate, lint. They never start a new critic cycle. If every AC passed and only formal items remain,
  close by the gate (see GATE_CLOSE).
- **F11 Timeouts.** The check command enforces time limits: a per-test timeout (for example
  pytest-timeout), timeouts on every call to a test stand, network stream or external service, and
  mutation testing limited to the modules the milestone changed. A hang beyond the limit turns the gate
  red. It never means waiting.
- **F12 Heartbeat.** A milestone owner commits, or writes a status line to its branch, at least every 30
  minutes. After 60 minutes of silence the orchestrator
  checks it. If it is stuck, the orchestrator restarts it from the last commit with a narrow brief and
  adds a ledger row.
- **F13 Proportionate cost.** Checks cost tokens and hours, so spend them where they change a decision.
  - One critic per cycle. No extra "final" or second independent critic once a critic scored at or
    above the threshold.
  - Test stand: a normal cycle runs it once, on a fresh stand. The triple run (fresh, after restart,
    after recreate) is only for milestones with persistent state (a database, a queue, stored tokens)
    and at integration.
  - Extra reviewers (for example `ponytail-review`) and full mutation runs happen only at integration,
    not in every cycle.
  - No cycles after a milestone closes. New findings go to the backlog for a later milestone.
  - No cosmetic rewrites of reports or status files.

## 5. Ledger `reports/progress.md`

```markdown
# Progress
## Waiting for owner
- [ ] <question> — default taken: <x> — affects: <milestones>
- [ ] <milestone> blocked_on_owner — action needed: <exact step> — unblocks: <AC ids>

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

Report to the owner in the What | Why | Why it's needed format, one bullet per item:
- the metrics table;
- the open "Waiting for owner" items;
- the PRs to merge, in merge order;
- gates added under F8;
- milestones still `blocked_on_owner`, with the exact action that unblocks each one.
