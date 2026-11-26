# Architecture: Agent fleet by voice

Status: `draft` for owner approval
Decision owner: project owner
Intent: [intent/agent-fleet/intent.md](../../../intent/agent-fleet/intent.md)
Parent spec: [spec.md](spec.md). Where this file and `spec.md` disagree, this file wins (see "Changes to the draft spec").

Applied lens: ponytail (smallest change that fully solves the task). Reviewed once after the first draft: two security ideas that failed the test were dropped (see "Security").

## Decision in one paragraph

The owner talks to Claude app in voice mode. Claude app calls one small connector (an MCP server on the owner's Mac, published by Tailscale Funnel) with six tools. The connector does nothing but run fixed `orca orchestration ...` commands. Orca keeps all state (Runs, Tasks, worker questions, results, worktrees) and runs the worker agents (Claude, Codex, Pi, Gemini CLI, ...). The voice Claude is the coordinator: it splits the request, picks agents, relays worker questions, reads results. There is no queue, no separate coordinator agent, no status database and no polling automation.

## Components

| Component | Is | Owns | Written by us |
| --- | --- | --- | --- |
| Voice front | Claude app, voice mode (paid plan, so Sonnet or Opus) | Conversation, splitting the request into worker specs, choosing agents, reading questions and results aloud | No |
| Connector `fleet-mcp` | Node 22 + TypeScript MCP server, Streamable HTTP, listens on `127.0.0.1` | Six tools; argument validation; agent allowlist; limit of 4 active workers; sign-in check (Google OAuth, owner's account only; a bearer token only for the first test in step 1); call log | Yes, about 200 lines plus tests |
| Tailscale Funnel | Already-installed Tailscale | Public HTTPS address on port 443 pointing at the connector | No (one command) |
| Orca | Orca app (or `orca serve` later) | Runs, Tasks, Dispatches, worker mail (`ask`, `worker_done`), liveness, worktrees | No |
| Workers | Agent CLIs started by `worker-start --agent <id>` | One Task each; heartbeats, `ask`, one `worker_done` | No |
| Phone console | Orca iOS app, already paired | Backup eyes and hands: notifications, terminals, manual answer when the voice path is down | No |
| Critic | A read-only worker of a different vendor than the builder, started only for critical parts (see "Critic role") | One pass: threat model, acceptance criteria check, a list of blocking findings with evidence | No |
| Development process | The task cycle of `ai/playbooks/autonomous-dev-v3.md`, run inside one Claude worker (see "How a development task runs") | Plan, implementation, check, one independent review, pull request, all inside one worker, so the connector needs no task graph | No |

The connector never decides anything. It cannot run arbitrary commands: only the six fixed `orca orchestration` calls below, with arguments passed as an array (no shell).

## Connector tools

| Tool | Does | Orca call behind it |
| --- | --- | --- |
| `start_run(objective)` | New request. Returns `run_id` | `run-create --objective` |
| `start_worker(run_id, agent, spec)` | Starts one worker in its own worktree. Refuses an unknown agent or a fifth active worker | `worker-start --run --agent --spec-file --worktree new-child` |
| `status()` | Open questions first, then workers (agent, state, last heartbeat), then finished results | `run-list`, `inbox --run`, `worker-list` |
| `answer(message_id, text)` | Delivers the owner's spoken answer to the waiting worker | `reply --id --run --body-file` |
| `result(run_id)` | Per worker: outcome, short summary, changed files | `inbox --run` (`worker_done` messages), `worker-show` |
| `stop_worker(dispatch_id)` | Stops a worker the owner wants gone | `worker-stop` |

Spec text goes to Orca through a temporary file (`--spec-file`), never through a shell string. Output returned to Claude is truncated to a fixed size and always labelled as worker text, not instructions.

## Data flow: one full scenario

1. Owner says: "Build an agent for X; Codex writes it, Claude reviews it."
2. Voice Claude clarifies if needed, then calls `start_run`, then `start_worker` twice with self-contained specs (target, change, limits, proof of done).
3. Connector runs the Orca commands. Orca creates worktrees and starts Codex and Claude. The voice conversation can end; nothing waits on it.
4. A worker needs a decision and runs `ask`. Orca parks that worker (parked is healthy, not failed). The question sits in the Run mailbox. The phone also gets an Orca notification.
5. Next time the owner speaks (or says "what's new"), Claude calls `status`, hears the open question first and reads it aloud.
6. Owner answers by voice. Claude calls `answer`. Orca wakes the worker with the answer.
7. A worker finishes with `worker_done`. Owner asks "what's ready?". Claude calls `result` and reads a short summary.
8. For development work, the worker spec is the task template from the next section: the worker plans, asks the owner to approve the plan by voice (step 4–6 above), builds, reviews itself with a fresh reviewer, and ends with a pull request.

## How a development task runs

The exact wording lives in [templates/fleet-task.md](../../../templates/fleet-task.md): how the voice Claude speaks (short, plain Russian, confirm before starting), and the fixed spec text for a build task, a critic task and a merge task. The connector reads that file at start and returns it as the description of `start_worker`, because the voice Claude cannot read the repository.

Why not the earlier executor → critic loop: in the GxG Hub run (thread "Анализ производительности процесса") 17.5 hours closed 3 of 16 milestones. Time went to hand-offs between sessions, a critic that raised the bar every cycle, a score threshold that forced full extra cycles for paperwork, rules changed mid-run, and checks that took hours (full mutation testing). The playbook (`ai/playbooks/autonomous-dev-v3.md`, section 7) already has the faster shape: one plan, one autonomous run to a green check, one independent review, human merge. The fleet uses exactly that, once per task.

One task = one worker = one branch = one pull request:

1. **Plan, approved once.** The worker reads the intent and writes a short plan (files, order, risks, the one check command) and marks any critical parts. It calls `ask` with a three-sentence summary; the owner approves or corrects by voice, including the critical marks. This is the only mandatory question.
2. **Build to green.** The worker writes the failing test first, then the code, until the single check command passes. The repository's Stop hook keeps it from finishing red.
3. **One independent review.** Development tasks are built by a Claude worker, because `/code-review` is a Claude Code feature; other vendors take research, parallel and critic tasks. The worker runs `/code-review` and `ponytail-review` (fresh contexts, read-only). Only critical and major findings count; minor ones go into the pull request description.
4. **One fix round.** The worker fixes the blockers and reruns the check command. No second review: the check command, not another opinion, confirms the fixes.
5. **Pull request.** Description: what changed, the check output, review result, what to look at by hand. CI repeats the check.
6. **Merge by the owner's word.** The voice Claude reads the title and result and asks "merge?". On a clear yes it starts a short worker whose only job is `gh pr merge` after CI is green. The phone's GitHub button works as well.

Budget rules (enforced by the task template, not by goodwill): the check command finishes in about five minutes (no mutation testing per task; run it nightly if wanted); at most 90 minutes of wall-clock per task; if blockers remain after the one fix round or the time is up, the worker stops and calls `ask` ("accept the risk, fix by hand, or drop?"). No new cycles, no scores, no changing the rules while a task runs.

Bigger work is split by the voice Claude at planning time into independent tasks (different branches and files), started in parallel on different agents. Sequential steps are separate tasks started when the previous one is merged.

### Critic role

The critic is the earlier idea, kept where it pays and dropped where it only cost time. It runs only on critical parts and only once.

- **Critical means:** authentication and permissions, money, personal data, deleting or overwriting data, the connector and Funnel exposure, CI and hook gates, and anything the owner calls critical. The builder marks such parts in the plan (step 1); the owner confirms by voice in the same approval. Everything else gets only the built-in review.
- **Who:** a read-only worker of a different vendor than the builder (Codex reviews Claude's work, Claude reviews Codex's), started by the voice Claude with `start_worker` once the pull request exists. Different vendor, because the same model repeats its own blind spots.
- **What it does, one pass:** reads the plan and the diff, lists attack paths or failure cases for the critical parts, checks each acceptance criterion, and returns only blocking findings (critical or major), each with a file, a line and a concrete failing case. No score, no verdict scale, no minor findings.
- **After it:** one fix round by the builder; the check command confirms the fixes. The critic is not run again. Findings that survive, or that the owner declines, are recorded in the pull request description as accepted risk.
- **Not a gate on time:** the critic has the same 90-minute cap and never starts a new cycle; it runs in parallel with the owner's own reading of the pull request.

Any further vendor review (for example the owner says "have Codex look at PR 12") is the same read-only worker started on request.

Per target repository, once: a single `npm run check`-style command, the branch guard and the Stop hook from the playbook (`scripts/hooks/`), and CI. A repository without a check command gets one before it gets workers.

## Build ready-made vs. write

| Need | Taken ready-made | Written by us |
| --- | --- | --- |
| Voice in and out, speech recognition | Claude app voice mode | nothing |
| Task graph, worker lifecycle, questions, results, worktrees | Orca | nothing |
| Remote access with HTTPS and a stable name | Tailscale Funnel | nothing |
| MCP protocol | `@modelcontextprotocol/sdk` (official), Streamable HTTP | nothing |
| Bridge from tools to Orca | none exists | `fleet-mcp`, about 200 lines |
| Auto-start and keep awake | launchd + `caffeinate` | one plist file |

Everything we write lives in `src/fleet/` (`server.ts`, `orca.ts`) with tests in `tests/`. Estimated work: the six tools are about 200 lines; Google OAuth, lockout and the call log add roughly as much again, so plan on 400 lines and about two focused days for steps 1–5 (the `fleet` account and agent logins are most of the unknowns), plus step 6 on a real task. This is an estimate, not a measurement.

## Build order

Each step ends with a check the owner can see. Do not start a step before the previous one passes.

0. **Prove Orca works with no coordinator agent.** From a plain shell: `run-create`, `worker-start --run <id> --agent claude --worktree new-child` with the spec "ask which colour, then write it to a file", read the question in `inbox --run`, `reply`, see `worker_done`. Done when the whole loop works without a coordinator terminal. If a command insists on `--from <terminal handle>`, the fix is one extra argument in `orca.ts`; if Orca refuses headless use entirely, stop and return to the persistent-coordinator design in `spec.md`.
1. **Hello connector over Funnel.** `fleet-mcp` with one tool `ping` and bearer-token auth; `tailscale funnel --bg 8787` (public side is port 443, the only port Claude accepts); add it in Claude app under Settings > Connectors as a custom connector with the token in request headers. Done when, in voice mode, the owner says "call ping" and hears the answer. This is the gate for the whole plan.
2. **Start and read.** Add `start_run`, `start_worker`, `status`, `result` for the `claude` agent only. Done when a trivial task given by voice finishes and its summary is read back by voice.
3. **Questions.** Add `answer`. Done when a worker's deliberate question is read by voice, the spoken answer reaches it, and it finishes.
4. **Other vendors.** Repeat the step-3 task with `codex`, `pi`, `gemini`. An agent that does not send `worker_done` reliably is removed from the allowlist. Done when at least three vendors pass.
5. **Hardening and security** (all items from "Security" below). Concurrency limit of 4, agent allowlist, output truncation, Google OAuth replacing the test token, lockout and call log, Orca and workers moved under the `fleet` account, unit tests for argument building, limits and the sign-in check, launchd agent with keep-alive, `caffeinate` while the connector runs. Done when (a) a request with no sign-in, a wrong Google account or a stale token is refused and logged, (b) after a Mac restart and login the voice test from step 3 still passes with no terminal touched.
6. **Real work.** Give a real agent-development task using the task template from "How a development task runs". Done when its plan was approved by voice, its pull request exists with a green check and the one review result in the description, and the whole task took under 90 minutes of wall-clock. Then run one task with a part marked critical and check that a critic of another vendor returns findings with evidence.

## Security

The connector is on the public internet and a stolen sign-in would let a stranger start agents that have shell access, so these controls are part of the build, not later polish.

1. **Google OAuth.** The connector is its own OAuth front for Google sign-in (the official MCP SDK has a proxy helper for this); Claude app is given our client ID and secret under "use your own OAuth client". After sign-in the connector accepts only the owner's verified Google account (one address in the config) and short-lived access tokens. Step 1 uses a bearer token only to prove the voice path; step 5 removes it.
2. **Lockout and log.** After 5 failed attempts in 10 minutes, all sign-ins are refused for 30 minutes. Every call (time, tool, agent, first 200 characters of the spec, result) goes to an append-only log on the Mac; `status` includes "last 5 calls" so the owner hears unfamiliar ones.
3. **Everything runs under a dedicated macOS account `fleet`.** Orca (`orca serve`), the connector and all workers run as that user, with their own agent logins and only the project repositories they need. It has no access to the owner's keychain, SSH keys, browser profile or personal folders. This is the real damage limit: if sign-in is ever bypassed, a stranger controls agents that can touch only `fleet`'s files. A worktree alone is not a sandbox. Orca's iOS pairing is redone against this instance. Unverified: that `orca serve` with `ORCA_SERVE_RUNTIME=orcad` runs well in a second user's session; step 0 checks it.
4. **Already planned:** fixed six tools, no shell, agent allowlist, four-worker cap, truncated and labelled output, secrets in the `fleet` keychain.
5. **Soft rule, not a control:** the task template tells the voice Claude to read back and confirm anything that deletes data, handles secrets or money, or pushes to `main`. It is advice to the model, so it is not counted as protection.

Dropped after review: a keyword filter on specs (easy to bypass, gives false comfort) and switching Funnel off when idle (then voice could not switch it back on). OAuth, the allowlist, the lockout and the `fleet` account carry the weight.

If Claude app cannot use a custom Google-backed OAuth flow when tested at step 5, the token goes in the connector form's request headers and is rotated weekly; items 2–4 still apply.

## Risks

| Risk | Handling |
| --- | --- |
| Voice mode may not call custom connectors (Anthropic's help says it uses connected tools; not yet shown for ours) | Step 1 is exactly this test. If it fails, the phone console is the only channel until voice supports it |
| No push: Claude cannot speak first when a question arrives | The worker waits safely; `status` shows questions first at the start of each talk; the phone is notified by Orca |
| Public address on the internet | Google sign-in limited to the owner's account, lockout, call log, everything under the `fleet` Mac account (see "Security"); only six fixed calls; Funnel exposes only the connector port; secrets in the `fleet` keychain, not in the repository |
| Prompt injection through worker output | Output is truncated and labelled as data; the connector has no tool that runs free text as a command |
| Mac asleep or off | `caffeinate`; later move `fleet-mcp` and `orca serve` to an always-on machine |
| A CLI that cannot report back | Allowlist only agents that passed step 4 |
| Runaway cost | Four active workers at most, enforced in code; owner reviews spend after step 4 |
| A task never converges | One fix round, 90-minute cap, then the worker asks the owner instead of starting another cycle |
| Spoken "merge" misheard | Claude reads the pull request title back and merges only on a clear yes; CI must be green |
| Custom headers missing in the connector form | Put the token in the secret URL path (`/mcp/<random>`); same code path |

## Not doing

- No intake queue, status table or Google Sheet: Orca already holds the state.
- No persistent coordinator agent and no wake-up automation: the voice Claude coordinates, Orca remembers.
- No task graph in the connector: one task is one worker.
- No `critic-loop` (milestone cycles, scores, repeated critics): it was the slowest part of the GxG Hub run. Its useful part survives as the one-pass critic on critical parts. The skill stays in the repository, unused unless the owner asks for it.
- No critic on non-critical work and no second critic pass.
- No mutation testing or other hour-long checks in the per-task gate.
- No Anthropic MCP tunnels: Enterprise-only research preview.
- No Codeman, Multica, CodeG: a second control layer on top of Orca adds nothing to the goal.
- No web dashboard or custom UI; the phone console covers the "look" need.
- No spoken push notifications in this version.

## Changes to the draft spec

[spec.md](spec.md) describes an intake queue, a persistent coordinator and a wake-up automation. This architecture removes all three (see "Not doing"). Its roles for voice front, Orca, workers and the phone console, its security rules and its readiness criteria still hold, except "coordinator" there now means the voice Claude and "queue" means the Orca Run mailbox. Align `spec.md` after the owner approves this file.

## Readiness criteria

- One spoken request becomes a Run with workers from at least three vendors.
- A worker's question is heard by voice and the spoken answer reaches it.
- A finished result is read back by voice.
- After a Mac restart the voice path works with no manual steps.
- A real agent-development task goes from spoken request to a reviewed pull request with a green check in under 90 minutes, with one voice approval of the plan and one voice merge decision.
