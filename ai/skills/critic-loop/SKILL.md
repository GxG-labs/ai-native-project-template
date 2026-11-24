---
name: critic-loop
description: Run a project to completion as milestones, each closed by an executor → independent critic loop until a green check command AND a critic verdict with every AC passed and no open critical or major finding, on top of the superpowers skills (brainstorming, writing-plans, TDD, subagent-driven development, code review, verification) and the autonomous-development playbook gates (intent → spec → plan artifacts, one check command, hooks, CI, human merge). Use when the user says "critic-loop", "запусти процесс разработки с критиком", "исполнитель и критик", "milestones with a critic", or wants autonomous multi-milestone development with independent reviews.
---

# Critic loop

You are the **orchestrator**. You turn a goal into milestones and drive each one through
`executor → critic → fixes`. A milestone is **done** when all of these hold:
- the **check command** is green on the head commit;
- every **AC** passed (or is `[manual]` and waiting for the owner);
- the **critic** reports no open `critical` or `major` finding.

There is no numeric score. In a real run the scores were only caps (5 = critical open, 8 = major open,
9 = clean), and arguing over 8.5 against 9 cost whole cycles. The verdict is the list of open findings.

Base documents:
- **superpowers** skills supply the procedures: brainstorm, plan, test, review, verify.
- the autonomous-development playbook (`ai/playbooks/autonomous-dev-v3.md`) supplies
  the control: artifacts in git, human approval points, gates. An instruction advises, a gate enforces;
  an agent never accepts its own work; one check is one command with an exit code.

Rules F1–F17 are in `references/rules.md`. Put that file's path in every brief.

## 0. Preconditions

- **superpowers.** Check for `superpowers:brainstorming`, `writing-plans`, `test-driven-development`,
  `subagent-driven-development`, `requesting-code-review`, `verification-before-completion`,
  `using-git-worktrees`, `finishing-a-development-branch`. If missing, say once: "install the
  superpowers skill library (github.com/obra/superpowers)", then use your environment's own equivalents:
  a planning mode, a fresh-context code review, an app verification run, git worktrees.
- **One check command** (`make check` / `npm run check` / `uv run check-all`) that exits non-zero on any
  failure, with time limits (F11). If it does not exist, it is milestone 0.
- **Gates:** a branch guard (no commit or push to `main`), a hook that runs the check before the agent may finish, CI that runs
  the same command on every PR. Missing ones go into milestone 0 (playbook §5).
- **Environment preflight (F17).** Before the first thread starts:
  - list every tool and access a thread will need (repositories to add, messaging, secrets, stands) and
    get it allowed or granted **now**; a thread that hits a permission prompt stalls until the owner
    wakes up;
  - tell threads not to use tools that ask for approval mid-run; they report through commits instead;
  - make long jobs (mutation runs, stands) resumable: run them in parts and commit each part.
- **Merging** to `main` is done only by the owner.

## Reports to the owner: What | Why | Why it's needed

Only for messages to the owner: plans, statuses, escalations, `blocked_on_owner` notices, the final
report. Not for briefs, cycle plans, ledger rows or any other file. It changes how a message is written,
not how you work. One bullet per item, three short parts, in the owner's language (Russian: **Что |
Зачем | Почему**): the action; what it achieves; what breaks without it.

## 1. Intake: artifacts the owner approves, once

1. `intent/<change>/intent.md`: the problem and the acceptance criteria in plain words
   (`superpowers:brainstorming`; fallback: up to 5 sharp questions). The **owner approves** it.
2. `docs/spec/<scope>/spec.md`, only if requirements or architecture change. The owner approves it.
3. `docs/plan/<change>/plan.md` (`superpowers:writing-plans`; fallback: your planning mode). Per milestone:
   - `id`, goal, dependencies, wave (milestones without mutual dependencies run in parallel);
   - **type**: `spike` | `tooling` | `core` | `security` (auth, approval, policy, tokens, secrets,
     isolation: anything an attacker would try to bypass);
   - **AC**, each checkable by a command; manual ones marked `[manual]`;
   - **DoD**: the check command plus extra tools. Mutation testing only on changed files in `security`
     modules; one full mutation run, once, before the merge to `main` (F13);
   - **executor**: `subagent` (default) or `external` (another tool run by the owner, §2);
   - **budget**: at most 3 cycles and a time limit (F15).
4. **Design review.** Before any code, one critic pass (`references/critic.md`, design mode) over the spec
   and the plan. Errors in the spec are the most expensive findings when they are caught in code.
5. **All owner decisions and all access up front**, in one batch, each with a recommended default.
6. Create `reports/progress.md` (§5), commit it, show the plan in the owner format; the **owner approves**.

From here on, rules, AC and DoD are **frozen** (F3). Process changes wait for a wave boundary (F16).

## 2. Running milestones

- **Start** every milestone of the wave, at most 3 at once, each as a **background sub-agent** in its own git
  worktree (`superpowers:using-git-worktrees`). Use a mechanism that wakes you when one finishes:
  **never poll, never sleep.** Work that must outlive this session: one long-running remote session per
  milestone.
- **Milestone owner.** Each subagent owns its milestone, runs the loop (§3) itself and reports only
  **closed**, **blocked_on_owner** or **escalation**.
- **Brief:** the plan section, `references/rules.md`, `references/executor.md`, `references/critic.md`,
  the branch `<prefix>/<id>`, the base commit, the check command, the budget.
- **External executor.** For `executor: external`, write the cycle prompt to
  `reports/prompts/<id>-cycle-<n>.md` (plan section, checklist, rules, report schema from `executor.md`)
  and put "run this prompt" under "Waiting for owner". The external tool writes the same conformance
  report; the critic is still yours.
- **Self-watch (F12).** Schedule your own check every 30–60 minutes while threads run: last commit per
  branch, open permission prompts, budget. Restart a stuck thread from its last commit with a narrow brief.
- **Closing a milestone:** read the critic report, re-run the check yourself, add a ledger row, merge the
  branch into the integration branch **right away** and run the check there, start what it unblocks.
- **Owner questions never block.** Write each under "Waiting for owner" with the default you took and keep
  going. A different answer later is `new_scope` for the next cycle.

### Models for subagents

Tokens are the main cost. Give each role the cheapest model that does it well.

| Role | Model |
| --- | --- |
| Orchestrator; spec and design decisions; design review | the strongest model |
| Critic of a `security` milestone | the strongest model |
| Critic of a `spike`, `tooling` or `core` milestone | a mid-tier model |
| Executor (default) | a mid-tier model |
| Executor for formal items (F10): evidence, stale ids, report regeneration, lint, renames | the smallest model |
| Heartbeat, status lines, ledger rows, re-running the gate, reading logs, searching the repo | the smallest model |

Move an executor up a tier only when the same finding survived two cycles. Never put the critic below the
executor's tier. Set the model when you start each sub-agent or session, and a lower reasoning
effort for routine work. Some tools fix a session's model at start, so choose first.

## 3. The loop inside one milestone

```
cycle = 1
loop:
  EXECUTE  — references/executor.md: tests first, code, self-check (check + DoD tools + critic checklist)
  GATE     — check command exits 0 on the pushed head; if not → EXECUTE again (not a cycle, no critic)
  CRITIQUE — references/critic.md, fresh context, never the executor
             cycle 1: every finding (+ threat model for `security`); cycle ≥ 2: frozen checklist + regressions
  commit reports/critic/<id>-cycle-<n>.json
  if every AC passed and no open critical/major                         → CLOSE
  if only formal items remain and every AC passed                        → GATE_CLOSE (F10)
  if only AC that need an owner action or access block, no critical/major → BLOCKED_ON_OWNER (F9)
  if the same blocking finding is open for the 2nd cycle in a row        → ESCALATE (F14)
  if cycle == 3 or the budget is spent                                   → ESCALATE (F15)
  checklist = critic.required_improvements (frozen); cycle += 1
```

- **CLOSE:** `superpowers:verification-before-completion` (fallback: run the app and check the change yourself), run the AC commands and
  read the output; `superpowers:finishing-a-development-branch`, push, open a PR with what changed, the
  check output, the critic report and what to check by hand. **Do not merge.**
- **GATE_CLOSE:** fix the formal items, check green, commit; the orchestrator re-runs check and AC and
  closes. No new critic.
- **BLOCKED_ON_OWNER:** stop the cycles, record it, put the exact action under "Waiting for owner",
  report it to the owner. Other milestones keep running.
- **ESCALATE** to the owner, in the owner format: the open blocking findings with their `origin`, the
  critic's root cause for each, and one choice: accept as a known risk, narrow the AC, or one more cycle.

## 4. Rules

See `references/rules.md`. In short: F1 origin of findings · F2 fixed bar from cycle 2 · F3 no mid-cycle
rule changes · F4 gate before critic · F5 minors never block · F6 adversarial cap · F7 prefer what
exists · F8 push a repeated finding down a layer · F9 blocked on owner · F10 gate closure · F11 timeouts
· F12 heartbeat and self-watch · F13 proportionate cost · F14 plateau escalation · F15 budget · F16
process changes at wave boundaries · F17 environment preflight.

## 5. Ledger `reports/progress.md`

```markdown
# Progress
## Waiting for owner
- [ ] <question> — default taken: <x> — affects: <milestones>
- [ ] <milestone> blocked_on_owner — action: <exact step> — unblocks: <AC ids>
- [ ] run reports/prompts/<id>-cycle-<n>.md in <tool>        (external executor)

## Metrics
| milestone | cycles | budget used | open after cycle 1 (crit/major) | gate red before critic | new_regression | missed_earlier | new_scope | models | intent→PR (h) |

## Log
| milestone | cycle | role | model | branch | commit | verdict | decision | time (UTC) |
```

One row per event, committed with the work it describes. No commits that only touch the ledger.
Many findings open after cycle 1 point to an unclear plan; many `missed_earlier` to a weak critic; many
`new_scope` to rules changed mid-run.

## 6. Wave boundary and done

At the end of each wave: a short **retro** from the metrics (cycles, budget, stalls, origins) and at most
a few process changes, shown to the owner in the owner format and applied from the next wave (F16).

The goal is reached when every milestone is closed (§3). Report to the owner, in the owner format: the
metrics table, open "Waiting for owner" items, PRs to merge in order, gates added under F8, and milestones
still `blocked_on_owner` with the action that unblocks each.
