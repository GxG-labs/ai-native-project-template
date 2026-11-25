# Frozen rules (put this file in every brief)

Each rule comes from a real run. It names the waste it prevents.

- **F1 Origin.** Every finding carries an `origin`:
  - `new_regression`: introduced by this cycle;
  - `missed_earlier`: existed before, and a past critic should have caught it;
  - `new_scope`: follows from a requirement added after the cycle started.

  The ledger counts them: they show whether the executor, the critic or the rules create the cycles.
- **F2 Fixed bar.** From cycle 2 the critic checks the frozen checklist plus `new_regression`.
  `missed_earlier` findings at `major` or below go to `docs/backlog.md` and do **not** block. Only
  `critical` blocks whatever its origin. For `security` milestones the cycle-1 threat model is the full
  list of paths; a new path outside it is `new_scope`.
- **F3 No mid-cycle rule changes.** A new DoD tool, checklist line or requirement applies from the next
  cycle. Findings that follow only from it are `new_scope` and do not block the current one.
- **F4 Gate before critic.** The critic never sees a red check. The executor runs every DoD tool and the
  critic checklist itself. A critic finding a DoD tool would have caught counts against the executor.
- **F5 Proportion.** `minor` findings never block; they go to the backlog with the milestone id. In a
  `spike`, findings about a fallback or a rejected option are `minor`.
- **F6 Adversarial cap.** If the last allowed cycle still has open `major` findings that all need an agent
  acting against the owner with the owner's own account, escalate with "accept as a known risk".
- **F7 Prefer what exists.** For every home-made mechanism the critic names the standard tool or library,
  if there is one (`existing_solutions`). A replacement follows F3.
- **F8 Push a repeated finding down a layer.** The same kind of finding in two milestones becomes a gate:
  a lint rule, a test, a hook, a CI step, or a line in `RULES.md` or a path-scoped rules file. Made between
  cycles (F3). Protected files need the owner's OK: put it under "Waiting for owner".
- **F9 Blocked on owner: no empty cycles.** If only AC that need an owner action or outside access (a
  repository, a secret, an account, a manual GitHub step) block, and nothing `critical` or `major` is
  open, the milestone stops as `blocked_on_owner` right after that report. Ask for likely-blocked access
  at intake (F17), not after the first critic.
- **F10 Gate closure.** Formal items (uncommitted evidence, a stale mutant id, a report to regenerate,
  lint) never start a critic cycle. If every AC passed and only formal items remain, close by the gate.
- **F11 Timeouts.** The check command enforces limits: a per-test timeout, timeouts on every call to a
  stand, network stream or external service, and mutation testing limited to the changed files. A hang
  turns the gate red. It never means waiting.
- **F12 Heartbeat and self-watch.** A milestone owner commits or writes a status line at least every 30
  minutes. The orchestrator schedules its own check every 30–60 minutes; after 60 minutes of silence it
  looks at the thread (connected? waiting on a permission prompt? container gone?) and restarts it from
  the last commit with a narrow brief, with a ledger row.
- **F13 Proportionate cost.** Spend checks where they change a decision.
  - One critic per cycle. No extra "final" or second critic once the verdict is clean.
  - Test stand: one fresh run per cycle. The triple run (fresh, after restart, after recreate) only for
    milestones with persistent state (a database, a queue, stored tokens) and at integration.
  - Extra reviewers and full mutation runs only at integration.
  - No cycles after a milestone closes; new findings go to the backlog.
  - No cosmetic rewrites of reports or status files.
- **F14 Plateau escalation.** If the same blocking finding (or the same AC) is open in two cycles in a row,
  the critic states its root cause and the milestone escalates at once. Do not run a third cycle on it.
- **F15 Budget.** Each milestone has at most 3 cycles and a time limit set at intake. The ledger shows the
  budget used. When it is spent, escalate to the owner; do not quietly continue.
- **F16 Process changes at wave boundaries.** Changes to these rules, the DoD or the models are collected
  during a wave and applied after its retro, never mid-wave. Exception: a change the owner orders, or one
  that only removes work (it may apply at once, from the next cycle).
- **F17 Environment preflight.** Before threads start, grant every tool and access they will need, tell
  them not to use tools that prompt for approval, and make long jobs resumable (parts with a commit each).
  A permission prompt in an unattended thread is a stall, not a question.
