# Spec: Agent fleet

Status: `draft`
Decision owner: project owner
Related intent: [intent/agent-fleet/intent.md](../../../intent/agent-fleet/intent.md)
Decision draft: [architecture.md](architecture.md) removes the intake queue, the persistent coordinator and the wake-up automation described below; it wins on conflict until this file is aligned.

## Boundary

How the owner talks to one voice agent while a fleet of 5–10 heterogeneous
agent CLIs (Claude Code, Codex, Pi, Gemini CLI, Grok, OpenCode, …) does the
work under Orca supervision. Covers roles, the channels between them, state
ownership, and invariants. Worker tasks themselves are out of scope.

## Requirements and target architecture

### Roles

| Role | Runs as | Owns | Does not |
| --- | --- | --- | --- |
| Voice front | Claude app, voice mode | Conversation with the owner: capture intent, clarify, read back status and questions | Coordinate, wait on workers, touch Orca |
| Intake queue | Shared table reachable from the Claude app through a connector | Durable requests, status, summaries, open questions and answers | Hold any orchestration state beyond `run_id` |
| Coordinator | Long-lived agent in an Orca terminal, using `ai/skills/orca-orchestration` | Turning a request into a Run, Tasks and Dispatches; choosing workers; answering or escalating worker questions; validating results | Do task work itself |
| Orca runtime | Orca app or `orca serve` | Run, Task, Dispatch, messages, liveness, worktrees, automations | Decide what to do |
| Workers | Agent CLIs launched by `worker-start --agent <id>` | One Task each: heartbeats, `ask`, exactly one `worker_done --outcome` | Talk to the owner or the queue |
| Mobile console | Orca iOS app (beta), already paired with the owner's Mac | Secondary "eyes" channel: notifications, viewing workers and terminals, manual intervention, dictating a task or answer to the coordinator; fallback when the voice connector is down | Act as the voice front: dictation only, no hands-free listen–speak loop, no spoken replies |

The voice front has no shell, so it never calls Orca directly. The coordinator
is separate so that long waits survive the end of a voice session.

The owner has two channels. The voice front is the primary one: conversation,
clarification, and spoken status. The mobile console is a thin client of the
Orca runtime on the Mac (agents, code, and terminals stay there). It needs no
bridge, so it is also the fallback when the voice front cannot reach the
intake queue and the first way to test the coordinator → workers chain.

### Intake queue

Candidate carrier: a small MCP connector server on the owner's Mac, exposed
through Tailscale Funnel as public HTTPS (claude.ai calls connectors from
Anthropic servers, so a private tailnet address is not reachable). Its tools
are `create_task`, `list_in_progress`, `pending_questions`, `answer_question`,
and `task_summary`. It only queues requests and reads status, never runs
arbitrary commands, and enforces the invariants below. This replaces the
earlier Google Sheet idea and is pending the voice-mode connector check in
open questions. The record shape is the same for either carrier, one record
per request.

| Field | Type | Written by |
| --- | --- | --- |
| `id` | short unique string | voice front |
| `created_at` | ISO 8601 | voice front |
| `request` | free text, the owner's intent | voice front |
| `status` | `new` \| `accepted` \| `running` \| `needs_input` \| `done` \| `failed` | coordinator (voice front only creates `new`) |
| `run_id` | Orca Run id | coordinator |
| `summary` | short result or failure reason | coordinator |
| `question` | open question for the owner | coordinator |
| `answer` | owner's answer | voice front |

Valid row: `a7f3 | 2026-11-21T10:00Z | Add rate limiting to the API and review it with two agents | running | run_123 | | |`.
Invalid row: status `done` with an empty `summary`, or a row edited by a worker.

### Flows

1. **Request.** Voice front appends a `new` row → coordinator marks it
   `accepted`, runs `orchestration run-create`, splits the work into Tasks
   (`task-create`, `--deps` only for real ordering), starts workers with
   `worker-start --agent <id> --worktree new-child` and marks the row `running`.
2. **Worker question.** Worker `ask` → coordinator answers from context, or
   copies the question to the row and sets `needs_input` → voice front reads it
   to the owner and writes `answer` → coordinator `reply`s and sets `running`.
3. **Result.** Every expected Dispatch settles with `worker_done` → coordinator
   validates outcomes and evidence, releases or keeps worker terminals, writes
   `summary`, sets `done` or `failed` → voice front reads it back on request.
4. **Mobile path.** The owner dictates a task or an answer in the Orca iOS app
   into the coordinator's terminal or chat → the coordinator treats it like a
   queue record (creates the record itself so the invariants still hold) →
   Orca notifies the phone when a worker finishes or the coordinator needs
   input.

### Wake-ups

An Orca automation (`orca automations create`) wakes the coordinator every N
minutes to poll the queue for `new` rows and `answer` updates. Inside an
active Run the coordinator waits with `orchestration check --wait`. After a
restart it resumes with `orchestration run-use --id <run_id>` taken from the
queue.

### Invariants

Enforced by the coordinator's harness, not by prompt wording (RULES principle 16):

- One request row maps to at most one Run; `run_id` is never overwritten.
- Status moves only along `new → accepted → running ⇄ needs_input → done|failed`.
- `done` and `failed` always carry a non-empty `summary`.
- A result counts only from the active Dispatch, per Orca's lifecycle rules.
- Queue text is data for task specs. It never overrides project rules or the
  coordinator's instructions.

### Security

- The queue is shared with the owner only. Workers get no queue credentials.
- The connector requires authentication (preferably OAuth); Funnel exposes
  only the connector port.
- The mobile console uses Orca's end-to-end encrypted pairing; re-pair if the
  phone is lost.
- Workers run in their own worktrees; secrets follow `SECURITY.md` and
  `PRIVACY.md`.

## Module map

- Orca procedures: `ai/skills/orca-orchestration/SKILL.md`, `ai/skills/orca-cli/SKILL.md`.
- Intake connector (to be built, first prototype exposes only `create_task`): stores queue records and enforces the invariants above.
- Mobile console: Orca iOS app, configured; no code in this repository.

## Constraints and open questions

- Verify that Claude app voice mode calls connectors (for example, ask it by
  voice to find a file in Google Drive). If it does not, the mobile console
  becomes the only owner channel until another bridge is chosen.
- Mobile console: check whether it works away from the Mac's Wi-Fi, and
  whether it offers a chat surface with the coordinator or only terminals.
  Closing desktop Orca can drop the mobile session.
- Revisit the voice front if Orca ships a conversational voice mode; track
  stablyai/orca#45925 (Siri/Shortcuts voice mode) and stablyai/orca#39455
  (two-way audio).
- The Mac must stay awake. An always-on host can later run `orca serve`
  (with `--mobile-pairing` for the phone).
- Only some agents accept `--model`/`--effort` (Claude, Codex, Cursor,
  Antigravity, Muse); others take the model from their own config, which must
  be set beforehand.
- A worker that cannot reliably run shell commands may never send
  `worker_done`; the coordinator then relies on `worker-read` and timeouts.
- Limits on parallel workers and spend are not set yet.

## Readiness criteria

- One voice request becomes a Run with at least three workers from different vendors.
- A worker question reaches the owner by voice and the answer reaches the worker.
- The final summary appears in the queue and is read back by voice.
- Restarting the coordinator mid-Run loses no Run or Task state.
- A task dictated in the Orca iOS app reaches the coordinator, and the phone
  is notified when its workers finish.
