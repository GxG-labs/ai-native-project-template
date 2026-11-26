# Architecture: Agent fleet by voice

Status: `draft` for owner approval
Decision owner: project owner
Intent: [intent/agent-fleet/intent.md](../../../intent/agent-fleet/intent.md)
Parent spec: [spec.md](spec.md). Where this file and `spec.md` disagree, this file wins (see "Changes to the draft spec").

Applied lens: ponytail (smallest change that fully solves the task). Reviewed by an independent critic after the first draft; the owner's decisions on its findings are applied (see "Security" and "Decision for the owner").

## Decision in one paragraph

The owner talks to Claude app in voice mode. Claude app calls one small connector (an MCP server on the owner's Mac, published by Tailscale Funnel) with six tools. The connector does nothing but run fixed `orca orchestration ...` commands. Orca keeps all state (Runs, Tasks, worker questions, results, worktrees) and runs the worker agents (Claude, Codex, Pi, Gemini CLI, ...). The voice Claude is the owner's interface: it takes the request, starts one **task coordinator** (a short-lived Claude worker inside Orca), relays the few questions that reach the owner, and reads results. The task coordinator drives the whole task: it splits the work, starts builders in parallel, starts the reviewer the moment a pull request exists, sends fixes back to the builder, and asks the owner only for what needs a human. Orca wakes a coordinator the instant a worker finishes or asks; the voice Claude cannot be woken (it speaks only when the owner speaks), so nothing in the pipeline waits for it. There is no queue, no status database and no polling automation. The 5–10 agents are a catalog the coordinator can choose from; at most 4 work at the same time.

Speed rule: a person is needed only to approve a plan that touches critical parts, to answer a question that changes the outcome and cannot be defaulted, and to say "yes" to a merge. Everything else (build, review, fix, CI, next step) runs on its own and overlaps with the owner's time.

## Components

| Component | Is | Owns | Written by us |
| --- | --- | --- | --- |
| Voice front | Claude app, voice mode (paid plan, so Sonnet or Opus) | Conversation with the owner, one clarifying question at most, starting the task coordinator, reading questions, merge proposals and results aloud, relaying the owner's answers | No |
| Task coordinator | One Claude worker per request, started by `start_worker` with spec G of the template; it runs Orca commands itself (`task-create --deps`, `worker-start`, `send`, `reply`, `ask`) and is woken by Orca on every `worker_done`, `ask` and `escalation` | The pipeline of the request: splitting into tasks and dependencies, starting builders in parallel, starting the reviewer at once when a pull request exists, sending fixes to the builder, answering worker questions that follow from the task, asking the owner only at the gates, running the merge after "yes", starting dependent tasks | No |
| Connector `fleet-mcp` | Node 22 + TypeScript MCP server, Streamable HTTP, listens on `127.0.0.1` | Six tools; argument validation; agent allowlist; limit of 4 active workers; bearer-token check; limit of requests per minute; call log | Yes, about 300 lines plus tests |
| Tailscale Funnel | Already-installed Tailscale | Public HTTPS address on port 443 pointing at the connector | No (one command) |
| Orca | Orca app (or `orca serve` later) | Runs, Tasks, Dispatches, worker mail (`ask`, `worker_done`), liveness, worktrees | No |
| Workers | Agent CLIs started by `worker-start --agent <id>`: builders and reviewers | One Task each; heartbeats, `ask`, one `worker_done` | No |
| Phone console | Orca iOS app, already paired | Backup eyes and hands: notifications, terminals, manual answer when the voice path is down | No |
| Reviewer | A read-only worker of a different vendor than the builder, started by the task coordinator the moment the pull request exists (see "Independent review") | One pass: acceptance criteria check, plus a threat model when the task has critical parts; a list of blocking findings with evidence | No |
| Builder | Any agent in the allowlist, chosen by the task coordinator for the task, following the task cycle of `ai/playbooks/autonomous-dev-v3.md` (see "How a development task runs"); stays open until the task ends so fixes go to it with `send` | Implementation to a green check, pull request, fixes; never merges | No |

The connector never decides anything. It cannot run arbitrary commands: only the six fixed `orca orchestration` calls below, with arguments passed as an array (no shell).

## Connector tools

| Tool | Does | Orca call behind it |
| --- | --- | --- |
| `start_run(objective)` | New request. Returns `run_id` | `run-create --objective` |
| `start_worker(run_id, agent, spec)` | Starts one worker in its own worktree and returns at once; the worker shows as "starting" in `status` until it is up. Refuses an unknown agent or a fifth active worker | `worker-start --run --agent --spec-file --worktree new-child` |
| `status()` | Open questions first, then workers (agent, state such as "starting", "working", "waiting for you", last heartbeat), then finished results | `run-list`, `inbox --run`, `worker-list` |
| `answer(message_id, text)` | Delivers the owner's spoken answer to the waiting worker | `reply --id --run --body-file` |
| `result(run_id)` | Per worker: outcome, short summary, changed files | `inbox --run` (`worker_done` messages), `worker-show` |
| `stop_worker(dispatch_id)` | Stops a worker the owner wants gone | `worker-stop` |

Spec text goes to Orca through a temporary file (`--spec-file`), never through a shell string. Output returned to Claude is truncated to a fixed size and always labelled as worker text, not instructions.

There is no tool for approving or denying a worker's permission prompt. Prompts are prevented instead: every agent in the catalog has an allow list and a deny list in its own settings, set before its first run (playbook `ai/playbooks/autonomous-dev-v3.md`, section 5.1).

## Data flow: one full scenario

1. Owner says: "Build an agent for X; Codex writes it, Claude reviews it."
2. Voice Claude asks at most one clarifying question, says in one sentence what will happen, then calls `start_run` and `start_worker` once: the task coordinator, with the request written as spec G of the template. The voice conversation can end; nothing waits on it.
3. The coordinator splits the work into tasks, creates them with their dependencies (`task-create --deps`), and starts the ready builders in parallel (Codex builds, and so on). It then ends its turn; Orca wakes it on the next event.
4. A builder finishes and opens a pull request. Orca wakes the coordinator, which starts the reviewer (Claude, another vendor than Codex) in the same minute, while CI is already running and while other builders keep building.
5. Blocking findings go straight back to the same builder with `send`; the builder fixes and pushes. No new agent start, no new worktree, no owner involved.
6. When the review is clean, the coordinator calls `ask` with the merge proposal. Only now does a person get involved. The phone also gets an Orca notification.
7. Next time the owner speaks (or says "what's new"), Claude calls `status`, hears the open proposals and questions first and reads them aloud in one go. The owner says "yes"; Claude calls `answer`; Orca wakes the coordinator, which waits for the checks if they are still running, merges only if they are green, then starts the tasks that depended on this one.
8. Other questions are rare: a worker's question goes to the coordinator first, which answers it when the answer follows from the task and escalates to the owner only when it cannot be defaulted (see "How a development task runs").

## How a development task runs

The exact wording lives in [templates/fleet-task.md](../../../templates/fleet-task.md): how the voice Claude speaks (short, plain Russian), and the fixed spec text for the task coordinator (G), a build task (B) and a review task (C). The template does not rely on features of one vendor (skills, `/code-review`, subagents, Claude Code hooks); where one is mentioned it is optional. The connector reads that file at start and returns it as the description of `start_worker`, because the voice Claude cannot read the repository.

Why not the earlier executor → critic loop: in the GxG Hub run (thread "Анализ производительности процесса") 17.5 hours closed 3 of 16 milestones. Time went to hand-offs between sessions, a critic that raised the bar every cycle, a score threshold that forced full extra cycles for paperwork, rules changed mid-run, and checks that took hours (full mutation testing). The playbook (`ai/playbooks/autonomous-dev-v3.md`, section 7) already has the faster shape: one plan, one autonomous run to a green check, one independent review (here by an agent of another vendor), merge on the owner's decision. The fleet uses exactly that, once per task.

One task = one branch = one pull request. The task coordinator (spec G) runs the pipeline; the builder is one worker that stays open until the task ends; the reviewer is one short worker. The coordinator never waits on the owner except at the gates below, and never polls: it ends its turn and Orca wakes it.

1. **Start without a gate.** The voice Claude's one sentence ("Codex builds X, Claude reviews, I will come back with a merge question") is the only confirmation; the app's own approval of the `start_worker` call is the single prompt per request. The builder reads the intent, writes a short plan (files, order, risks, the one check command) and marks any critical parts.
2. **Plan gate only for critical parts.** If the plan has critical parts (authentication and permissions, money, personal data, deleting or overwriting data, exposure, CI and hook gates, anything the owner calls critical), the builder `ask`s once with a three-sentence summary and options "approve" and "change"; the coordinator passes it to the owner. If the task has no critical parts, the builder proceeds at once and records the plan in the pull request description. Mandatory plan approval for every task was dropped: it was the largest avoidable wait.
3. **Build to green.** The builder writes the failing test first, then the code, until the single check command passes, and reports the check output. For a Claude builder the repository's Stop hook also keeps it from finishing red; for other agents the green check is verified by CI and by the reviewer.
4. **Pull request, then immediate review.** The builder opens the pull request and stops (stays open, idle). Orca wakes the coordinator on `worker_done`; the coordinator starts the reviewer of another vendor in the same minute, with `--setup skip` and no new worktree (the reviewer reads `gh pr diff` and `gh pr view`). CI runs at the same time as the review, and other builders keep building meanwhile.
5. **Fixes go back to the builder.** If there are blocking findings, the coordinator `send`s them to the builder's dispatch: no new agent start, no new worktree, the builder keeps its context. One fix round; the check command confirms the fixes and there is no second review.
6. **Merge: the coordinator proposes, the owner says yes, the coordinator executes.** This is a deliberate departure from the playbook (section 7, step 9: "merge — only you"): the human decides by voice, the agent presses. The coordinator proposes as soon as the review is clean, without waiting for CI: the owner's "yes" means "merge when the checks are green".
   - **Proposal.** One `ask` per pull request, created by the coordinator from GitHub facts (`gh pr view`, `gh pr checks`) and from the reviewer's report, never from free text in a worker's result, which may carry an injection. It names the repository, the pull request number, the title and the check status. Example: "Merge PR 12 in telegram-service, 'Add health endpoint', review clean, checks running?".
   - **Yes is bound to the proposal.** The answer comes back through `reply` to that exact `ask` (message id), so a "yes" with no proposal, about another pull request, or after an unrelated message cannot trigger a merge. The voice Claude may read several open proposals in one go and take one spoken "yes" for exactly the ones it read out.
   - **Execution.** After the "yes" the coordinator runs `gh pr checks <number> --watch`, then `gh pr merge <number> --squash` only if every check is green. Red or missing checks: no merge, the coordinator reports which check failed and, if it is a failing test, sends it to the builder. It runs no other merge command and merges no other pull request.
   - Safeguards in GitHub that do not depend on any agent: the `fleet` `gh` token is limited to the repositories on the project list; `main` is protected by branch rules (merge only through a pull request, required green check, no force push). Where the GitHub plan has no branch rules for a private repository, this safeguard is missing (playbook section 10) and the repository is checked before it gets workers.
7. **Next step starts itself.** When a task is merged, the coordinator starts the tasks that depended on it (`task-list --ready`) without asking.

How the coordinator keeps the owner out of the loop:
- **Questions go to the coordinator first.** A builder's or reviewer's `ask` reaches the coordinator, which answers it when the answer follows from the task, the files or the owner's request (Orca's own rule for coordinators). It escalates to the owner only when the choice changes the outcome, cannot be undone, or touches a critical part.
- **Defaults instead of waiting.** For a non-critical open point the builder picks the recommended default, continues, and records the choice in the pull request description. The owner sees it in the merge proposal and can say "change it" instead of "yes".
- **One owner question per task at a time, with options and a recommended default.** Several open items are bundled into one question.
- **Parallel by default.** Independent tasks (different branches and files) start together, up to the four-worker cap. The review of one task overlaps the building of another. Only real dependencies wait, and Orca's task graph (`--deps`) holds them.

Budget rules (enforced by the task template, not by goodwill): the check command finishes in about five minutes (no mutation testing per task; run it nightly if wanted); at most 90 minutes of wall-clock per builder or fix round and 20 minutes for the reviewer; if blockers remain after the one fix round or the time is up, the coordinator asks the owner ("accept the risk, fix by hand, or drop?"). No new cycles, no scores, no changing the rules while a task runs.

Bigger work is split by the task coordinator at planning time into independent tasks (different branches and files), started in parallel on different agents. Sequential steps are separate tasks held back by `--deps` and started by the coordinator the moment the previous one is merged.

### Independent review

Every task gets exactly one review pass, by a read-only worker of a different vendor than the builder (Codex reviews Claude's work, Claude reviews Codex's work, Pi's or Gemini's, and so on). Different vendor, because the same model repeats its own blind spots, and because it works for any builder. `/code-review` is an optional extra for a Claude builder, not a requirement.

- **Who starts it:** the task coordinator, with `worker-start`, the moment the builder reports the pull request, with `--setup skip` and no new worktree; it runs while CI runs.
- **What it does, one pass:** reads the plan and the diff and checks each acceptance criterion. When the task has critical parts it also lists attack paths or failure cases for them. It returns only blocking findings (critical or major), each with a file, a line and a concrete failing case. No score, no verdict scale, no minor findings.
- **Critical means:** authentication and permissions, money, personal data, deleting or overwriting data, the connector and Funnel exposure, CI and hook gates, and anything the owner calls critical. The builder marks such parts in the plan (step 1); the owner confirms by voice in the same approval.
- **After it:** one fix round sent to the builder (step 5); the check command confirms the fixes. The reviewer is not run again. Findings that survive, or that the owner declines, are recorded in the pull request description as accepted risk.
- **Not a gate on time:** the reviewer has a 20-minute cap and never starts a new cycle.

Any further review (for example the owner says "have Codex look at PR 12") is the same read-only worker started on request through a new coordinator request.

Per target repository, once: a single `npm run check`-style command, CI, and protection of `main` in GitHub. The branch guard hook and the Stop hook from the playbook (`scripts/hooks/`) work only for Claude builders; for other agents the GitHub rules, the limited token and CI are the protection. A repository without a check command gets one before it gets workers.

### Accepted decision: who builds

A builder can be any agent in the allowlist; the task coordinator picks it for the task. All builders pass the same gates: they reach `worker_done` without a permission prompt (allow and deny lists set beforehand), open a pull request and never merge. An agent that fails this at build step 4 is removed from the allowlist.

## Build ready-made vs. write

| Need | Taken ready-made | Written by us |
| --- | --- | --- |
| Voice in and out, speech recognition | Claude app voice mode | nothing |
| Task graph, worker lifecycle, questions, results, worktrees | Orca | nothing |
| Remote access with HTTPS and a stable name | Tailscale Funnel | nothing |
| MCP protocol | `@modelcontextprotocol/sdk` (official), Streamable HTTP | nothing |
| Bridge from tools to Orca | none exists | `fleet-mcp`, about 300 lines |
| Auto-start and keep awake | launchd + `caffeinate` | one plist file |

Everything we write lives in `src/fleet/` (`server.ts`, `orca.ts`) with tests in `tests/`. Estimated work: the six tools are about 200 lines; the token check, the per-minute limit and the call log add about 100, so plan on 300 lines (the task coordinator, reviewer and merge step are template text and need no code) and about one and a half focused days for steps 1–5 (the `fleet` account, agent logins and permission lists are most of the unknowns), plus step 6 on a real task. This is an estimate, not a measurement.

## Build order

Each step ends with a check the owner can see. Do not start a step before the previous one passes.

0. **Prove Orca works headless and that a worker can coordinate.** From a plain shell: `run-create`, `worker-start --run <id> --agent claude --worktree new-child` with the spec "ask which colour, then write it to a file", read the question in `inbox --run`, `reply`, see `worker_done`. Done when (a) the whole loop works without a coordinator terminal, (b) the worker's `ask` is visible in `inbox --run` with no coordinator terminal open, (c) the worker reaches `worker_done` without a single permission prompt, because the allow and deny lists of its agent were set beforehand, and (d) the task coordinator works: a Claude worker started with spec G runs `task-create --deps` and `worker-start` for two child workers (one `codex`, one `claude`), is woken by Orca when each finishes with no polling, `send`s a follow-up to a finished child, and `ask`s the owner once with the answer arriving through `reply`. If a command insists on `--from <terminal handle>`, the fix is one extra argument in `orca.ts`. If (d) fails because a worker cannot start workers or is not woken, the fallback is to move the pipeline into the connector as a small state machine (about 150 more lines: on a builder's `worker_done` start the reviewer, on findings `send` them to the builder, on a clean review create the merge `ask`), which keeps the same owner experience; decide this at step 0, not later. If Orca refuses headless use entirely, stop and return to the persistent-coordinator design in `spec.md`.
1. **Hello connector over Funnel.** `fleet-mcp` with one tool `ping` and bearer-token auth; `tailscale funnel --bg 8787` (public side is port 443, the only port Claude accepts); add it in Claude app under Settings > Connectors as a custom connector with the token in the "Request headers" section. For the connector's tools set "Always allow" on the read tools (`status`, `result`) and "Needs approval" on `start_worker`, `answer` and `stop_worker`. Done when, in voice mode, the owner says "call ping" and hears the answer, a read tool runs without an approval prompt, and `start_worker`, `answer` and `stop_worker` do ask for approval. This is the gate for the whole plan.
2. **Start and read.** Add `start_run`, `start_worker`, `status`, `result` for the `claude` agent only. Done when a trivial task given by voice finishes and its summary is read back by voice.
3. **Questions and the pipeline.** Add `answer`. Done when a worker's deliberate question is read by voice, the spoken answer reaches it, and it finishes; and when one spoken request given to the task coordinator runs build, review and fix on its own while the owner is silent, and the owner's first interruption is the merge proposal.
4. **Other vendors.** Repeat the step-3 task with `codex`, `pi`, `gemini`. Then give each a small build task in a test repository. An agent that does not send `worker_done` reliably, raises a permission prompt, fails to open a pull request, or merges one is removed from the allowlist. Done when at least three vendors pass, each reaching `worker_done` without a permission prompt and opening a pull request without merging it.
5. **Hardening and security** (all items from "Security" below). Concurrency limit of 4, agent allowlist, output truncation, per-minute request limit and call log, Orca and workers moved under the `fleet` account with its limited GitHub token, unit tests for argument building, limits and the token check, launchd agent with keep-alive, `caffeinate` while the connector runs. Done when (a) a request with no token or a wrong token is refused and logged, (b) the `fleet` token cannot reach a repository outside its list, (c) merge by voice: when the review is clean the coordinator's proposal names the repository, number, title and check status; "yes" leads to the merge once the checks are green; no "yes" means no merge; a red check means no merge and a report; a "yes" to a different or missing proposal does nothing; an attempt to merge into `main` without a pull request is rejected, (d) after a Mac restart and login the voice test from step 3 still passes with no terminal touched.
6. **Real work.** Give a real agent-development task using the task template from "How a development task runs". Done when the owner was interrupted only for the merge proposal (and for the plan if a part was marked critical), its pull request exists with a green check, and the review result is in the description, with at least one such task built by a non-Claude agent and reviewed by an agent of another vendor, every worker within its cap, and the time from the end of the build to the review start under two minutes. Measure the owner's waiting and the idle gaps on this task and write them down; that is the first real number for speed. Then run one task with a part marked critical and check that the reviewer returns findings for it with evidence.

## Security

The connector is on the public internet and a stolen token would let a stranger start agents that have shell access, so these controls are part of the build, not later polish.

1. **One authentication method: a long random token.** The connector requires it in a request header on every call; it is entered once in the connector form under "Request headers" and kept in the `fleet` keychain. Google OAuth is postponed until there is a real need for it.
2. **Rate limit and log.** The connector accepts a limited number of requests per minute. Every call (time, tool, agent, first 200 characters of the spec, result) goes to an append-only log on the Mac; `status` includes "last 5 calls" so the owner hears unfamiliar ones. There is no sign-in lockout.
3. **Everything runs under a dedicated macOS account `fleet`.** Orca (`orca serve`), the connector and all workers run as that user, with their own agent logins and only the project repositories they need. It has no access to the owner's keychain, SSH keys, browser profile or personal folders. Its `gh` token is limited to the repositories on the project list, and `main` in those repositories is protected by branch rules, so `fleet` cannot reach other repositories or push to `main`. Branch rules on a private repository depend on the GitHub plan; where the plan lacks them, only the branch guard hook and the token limits protect `main` (playbook section 10), which is a known risk to check per repository. This is the real damage limit: if the token is ever stolen, a stranger controls agents that can touch only `fleet`'s files. A worktree alone is not a sandbox. Orca's iOS pairing is redone against this instance. Unverified: that `orca serve` with `ORCA_SERVE_RUNTIME=orcad` runs well in a second user's session; step 0 checks it.
4. **Already planned:** fixed six tools, no shell, agent allowlist, four-worker cap, truncated and labelled output, secrets in the `fleet` keychain.
5. **Permission prompts are prevented, not answered:** each agent's allow and deny lists are set before it runs (playbook section 5.1); the connector has no approve or deny tool. Steps 0 and 4 check that workers finish without a prompt.
6. **Merge is the owner's spoken decision, executed by an agent.** The task coordinator proposes with `ask` once the review is clean; the "yes" is bound to that `ask`; the merge happens only when every check is green and goes only through `gh pr merge` with a limited token and a protected `main` (see "How a development task runs", step 6). The coordinator holds the `fleet` `gh` token, so worker output reaches it only as labelled data, and its spec forbids any merge or push to `main` that is not tied to an owner's answer.
7. **Soft rule, not a control:** the task template tells the voice Claude to read back and confirm anything that deletes data or handles secrets or money. It is advice to the model, so it is not counted as protection.

Dropped after review: a keyword filter on specs (easy to bypass, gives false comfort), switching Funnel off when idle (then voice could not switch it back on), sign-in lockout and Google OAuth for now. The token, the allowlist, the rate limit and the `fleet` account carry the weight.

## Risks

| Risk | Handling |
| --- | --- |
| Voice mode may not call custom connectors (Anthropic's help says it uses connected tools; not yet shown for ours) | Step 1 is exactly this test. If it fails, the phone console is the only channel until voice supports it |
| No push: Claude cannot speak first when a question arrives | Only the merge proposals and the rare question wait for the owner; everything else runs without them; `status` shows these first at the start of each talk; the phone is notified by Orca |
| Public address on the internet | Long random token in a request header, rate limit, call log, everything under the `fleet` Mac account with a limited GitHub token (see "Security"); only six fixed calls; Funnel exposes only the connector port; secrets in the `fleet` keychain, not in the repository |
| Prompt injection through worker output | Output is truncated and labelled as data; the connector has no tool that runs free text as a command |
| Mac asleep or off | `caffeinate`; later move `fleet-mcp` and `orca serve` to an always-on machine |
| A worker cannot start workers, or the task coordinator is not woken by Orca (unverified) | Step 0(d) tests it before anything else is built; fallback is the connector state machine described there |
| The task coordinator is an agent that follows instructions and could be steered by text in a pull request | It reads GitHub facts and reports, not free text; merge needs an owner's answer bound to its `ask`; `fleet` token limits and `main` rules hold even if it errs |
| A CLI that cannot report back | Allowlist only agents that passed step 4 |
| Runaway cost | Four active workers at most, enforced in code; owner reviews spend after step 4 |
| A task never converges | One fix round, 90-minute cap, then the coordinator asks the owner instead of starting another cycle |
| A worker stops on a permission prompt and waits for a human | Allow and deny lists set per agent beforehand; steps 0 and 4 require `worker_done` with no prompt; an agent that fails this is removed from the allowlist |
| The connector form has no "Request headers" section | Step 1 shows it. If it is missing, stop and revisit authentication before going further |

## Not doing

- No intake queue, status table or Google Sheet: Orca already holds the state.
- No persistent coordinator agent and no wake-up automation: one short-lived task coordinator per request, woken by Orca; the voice Claude only talks and relays. No mandatory plan approval for tasks without critical parts.
- No task graph in the connector: Orca's own task graph (`--deps`) holds dependencies, and the coordinator reads it.
- No `critic-loop` (milestone cycles, scores, repeated critics): it was the slowest part of the GxG Hub run. Its useful part survives as the single independent review by another vendor. The skill stays in the repository, unused unless the owner asks for it.
- No second review pass and no review by the same vendor as the builder.
- No mutation testing or other hour-long checks in the per-task gate.
- No approve or deny tool for worker permission prompts, and no separate merge tool (the coordinator merges after the owner's bound answer).
- No Google OAuth and no sign-in lockout for now.
- No Anthropic MCP tunnels: Enterprise-only research preview.
- No Codeman, Multica, CodeG: a second control layer on top of Orca adds nothing to the goal.
- No web dashboard or custom UI; the phone console covers the "look" need.
- No spoken push notifications in this version.

## Changes to the draft spec

[spec.md](spec.md) describes an intake queue, a persistent coordinator and a wake-up automation. This architecture removes all three (see "Not doing"). Its roles for voice front, Orca, workers and the phone console, its security rules and its readiness criteria still hold, except "coordinator" there now means the short-lived task coordinator worker (one per request) and "queue" means the Orca Run mailbox. Align `spec.md` after the owner approves this file.

## Readiness criteria

- One spoken request becomes a Run with workers from at least three vendors.
- A worker's question is heard by voice and the spoken answer reaches it.
- A finished result is read back by voice.
- After a Mac restart the voice path works with no manual steps.
- At least one agent-development task goes from spoken request to a reviewed pull request with a green check, built by a non-Claude agent and reviewed by an agent of another vendor, with no owner interruption except the voice "yes" to the merge proposal (and one plan approval when a part is marked critical); every worker stays within its cap, and the gap between the builder's pull request and the start of the review is under two minutes.
- The coordinator starts dependent and independent tasks without asking, and the owner's total waiting time on a task is measured at step 6.
