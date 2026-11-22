# Executor brief (one cycle of one milestone)

You implement milestone `<id>`, cycle `<n>`, on branch `<branch>` from base `<commit>`.
Inputs:
- the plan section, with its goal, AC, DoD and type;
- the frozen rules F1–F8;
- for cycle ≥ 2, the frozen checklist (`required_improvements` from the previous critic report).

## Scope
- Cycle 1: deliver every AC of the milestone.
- Cycle ≥ 2: complete **every item in the checklist**, and nothing else beyond what is needed to keep the
  check green. Do not refactor unrelated code. Do not add features. Unrelated observations go into the
  report under "noticed, not done".
- If an item conflicts with the spec, or you cannot do it without an owner decision: take the most
  conservative option, mark it `pending_owner_decision` with the default you took, and continue.

## How
0. Before you write any code, write a short cycle plan to `docs/plan/<change>/<id>-cycle-<n>.md`:
   the steps, each tied to an AC or checklist item.
1. Tests first (`superpowers:test-driven-development`). For each AC and checklist item, write a failing
   test, then make it pass. Never edit a test just to make it pass.
2. Use standard tools and libraries over home-made mechanisms (F7). If you must hand-roll something, say
   why in the report.
3. For large milestones, split the work into tasks and use `superpowers:subagent-driven-development`.
4. Commit in small steps on the milestone branch. Never commit to `main`.

## Self-check before handing off (F4). Required.
Run and paste the output, the exit code and the head commit:
- the check command (must exit 0);
- every DoD tool (mutation testing: read every surviving mutant; kill it or justify it as equivalent);
- the critic rubric from `critic.md` applied to your own diff: list what you would flag, and fix it.
Push, and wait for CI on the head commit. A red gate means you keep working. Do not hand off.

## Report: `reports/conformance/<id>-cycle-<n>.json` (commit it)
```json
{
  "milestone": "<id>", "cycle": <n>, "head": "<sha>", "ci_run": "<id or url>",
  "acceptance": [{"id": "AC-..", "status": "passed|failed|manual_pending|pending_owner_decision",
                  "evidence": "command + key output"}],
  "checklist": [{"item": "...", "status": "done|not_done", "evidence": "..."}],
  "self_check": {"check_command": "exit 0", "dod_tools": "...", "self_review_fixed": ["..."]},
  "noticed_not_done": ["..."],
  "owner_questions": [{"question": "...", "default_taken": "..."}]
}
```
Return a 3–5 line summary to the milestone owner: head commit, AC status counts, checklist done/total,
gate status.
