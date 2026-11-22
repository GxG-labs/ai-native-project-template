# Spec: Agent fleet

Status: `draft`
Decision owner: project owner
Related intent: none yet

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

The voice front has no shell, so it never calls Orca directly. The coordinator
is separate so that long waits survive the end of a voice session.

### Intake queue

Recommended carrier: a private Google Sheet `agent-fleet-inbox`, one row per
request.

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
- Workers run in their own worktrees; secrets follow `SECURITY.md` and
  `PRIVACY.md`.

## Module map

- Orca procedures: `ai/skills/orca-orchestration/SKILL.md`, `ai/skills/orca-cli/SKILL.md`.
- Coordinator queue adapter (to be built): reads and writes the queue and enforces the invariants above.

## Constraints and open questions

- Verify that Claude app voice mode can call the Google Sheets connector. If
  not, choose another carrier the voice front can reach (Apple Notes, Claude
  Docs), or check whether `orca serve --mobile-pairing` offers a usable mobile
  client.
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
