# Autonomous loop template

A reusable local TypeScript executor for **plan → act → assess → save → observe → next plan**. Each run owns a task, acceptance criteria, authorized tools, a target and limits. SQLite is its process memory. No open chat, scheduler, separate event store or memory graph is required.

The executor is domain-independent. A run adapter supplies actions and assessments for the task. There are no built-in posts, websites, financial criteria, dates or numeric relevance scores. The bundled adapter demonstrates reading local sample items; it is an example, not a general-purpose action tool.

## Quick start

From the repository root, use Node.js 22.16+ and the installed dependencies:

```sh
npm ci
npm run build
npm run cycle -- init --run runs/local/example --demo
npm run cycle -- run --run runs/local/example
npm run cycle -- status --run runs/local/example
```

The offline demonstration executes actual child processes and SQLite transitions. It deterministically collects two accepted sample items. `--demo` validates orchestration, not model judgment.

For the same example with fresh model calls, ensure a locally authenticated `codex` CLI is on PATH, then omit `--demo`:

```sh
npm run cycle -- init --run runs/local/model-example
npm run cycle -- run --run runs/local/model-example
```

Model calls have no shell or browsing tools; actions go through the explicitly configured adapter. A terminal process must remain alive. `run` is a blocking local command, not a background service. Closing the process does not lose committed steps; it does not automatically start a replacement process either.

## Create a real task

1. Copy this directory to a task-specific template directory.
2. Edit `config.json`: task, criteria, method, target, allowed tools and limits.
3. Implement the task's actions and acceptance checks in its adapter. The bundled `adapter.mjs` and `sample.json` are a working example to replace. An agent can prepare this configuration from the user's request; the runtime itself does not invent tool access or permissions.
4. Initialize a new run with `init --template PATH --run PATH` and run it. Initialization copies adapter files, excludes any source memory.sqlite and its journal files, and creates a fresh SQLite database from the copied schema.sql in the new run directory; changing the original template does not affect existing runs.

`target` is the number of distinct accepted results needed. Use 1 for a single deliverable that must satisfy all criteria. An assessment must check **all** acceptance criteria for that result; an objective command/check should be implemented in the adapter where possible. The engine validates structure and transitions, but an LLM's `accepted: true` is not proof that external reality matches its claim.

The target is checked using current criteria revisions and explicit human overrides. Rejected results remain in memory. A result with an obsolete machine assessment does not count until reassessed. The runtime drains pending reassessments before taking the next ordinary step or declaring completion.

`config.json` fields:

| Field | Meaning |
| --- | --- |
| `task`, `criteria` | Desired outcome and human-owned acceptance rules |
| `method` | Initial working instruction; concrete actions normally change instead |
| `target` | Positive count of distinct accepted results |
| `tools` | Allowed action names; the adapter enforces their actual scope |
| `adapter` | Executable plus argument array; JSON over stdin/stdout, no shell interpolation |
| `maxCalls` | Global child-call budget, including failures and reviews |
| `maxIterations` | Maximum ordinary iterations |
| `maxFailures` | Consecutive failed attempts before human attention |
| `noProgress` | Completed iterations without an accepted result before human attention |
| `timeoutSeconds`, `retryDelayMs` | Per-call timeout and persisted retry delay |

An adapter is trusted code, not a security sandbox. It must enforce permitted paths, validate action inputs and use idempotency keys for external mutations. Do not install a generic model-to-shell bridge. Scope and approvals belong to the task and tool implementation.

## Execution, checkpoints and recovery

Every completed phase commits its input or references, output, decision/reason and next state in one SQLite transaction. An action result is retained immediately, before assessment. Accepted and rejected evaluations append to history. Ordinary steps never rewrite human criteria.

```sh
npm run cycle -- step --run runs/local/example
npm run cycle -- run --run runs/local/example
npm run cycle -- resume --run runs/local/example
npm run cycle -- resume --run runs/local/example --extra-calls 20
```

`step` advances one phase; it is useful for inspection and process-restart checks. `run` continues a ready/running/retrying run and reopens a completed run if human feedback invalidates completion. `resume` explicitly releases a paused/attention state. It preserves the global call budget unless `--extra-calls` is supplied. An exhausted iteration limit requires explicit extension using `--extra-iterations N`. Resume resets the consecutive no-progress counter, not historical results.

Statuses: `ready`, `running`, `retrying`, `paused`, `needs_input`, `complete`. Only `complete` means the configured target is met. `needs_input` returns exit code 2 and a reason; runtime/configuration/storage errors return 1. Ctrl-C terminates the current adapter and persists a pause. A crashed process can be replaced by a fresh process; a stale PID lock is reclaimed. Concurrent runners are rejected, but human feedback uses independent short SQLite transactions.

A saved valid external response is reused for identical step inputs if a crash happened before its checkpoint. Already committed action keys cannot be executed again. **An external action performed before its response was durably saved can repeat after a crash.** The adapter must make such actions idempotent with `action.key`; SQLite cannot provide exactly-once effects in another service. Local sample actions are read-only.

## Failure feedback

Adapters can return `{"error":{"kind":"transient","reason":"..."}}`, `invalid`, or `blocked`.

- `transient`: retry the same phase after a delay; pass the prior error.
- `invalid`: pass the rejected response and reason to the next attempt. An invalid action returns to planning so the approach can change.
- `blocked`: stop with a concrete reason for human attention.

Malformed output, forbidden tool names and already-completed action keys are rejected by the engine. Retries receive the rejected candidate and cause; they are not identical blind repeats. Attempts consume the global budget. A failed action does not create a successful action key, a rejected result or a negative assessment. Infrastructure errors do not count as evidence against the working method.

## Human correction

Create a JSON file with ordinary-language feedback and submit it while the runner is active or stopped:

```json
{
  "criteria": "Accept only items containing the word blue.",
  "reason": "Human narrows the task's acceptance rule.",
  "ratings": [{"id":"red","accepted":false,"reason":"Explicit human exclusion."}]
}
```

```sh
npm run cycle -- feedback --run runs/local/example --file correction.json
```

`criteria` replaces the active criteria text; the complete previous version is retained. `ratings` is optional, and individual overrides can be submitted without changing criteria. The command records feedback atomically, applies overrides and makes all older machine ratings pending reassessment through the revision mismatch. No destructive clearing or separate review queue is needed.

The runner reassesses saved evidence without repeating the action. Responses based on superseded criteria are discarded before acceptance, including when feedback arrives during a model call. Explicit human overrides remain protected until another human override changes them. New plans receive observations joined with **current** ratings rather than treating old success labels as authoritative.

An agent handling conversational feedback should read the underlying saved evidence, propose a general rule if warranted, then submit the human-approved correction. The model cannot submit criteria changes itself. Do not infer universal rules from one unexplained rejection.

## Context and method changes

Each call receives task/criteria, current state/method, current item or action, the last failure, a few recent human corrections and at most three matching past observations. Observation retrieval ranks a bounded recent pool using terms from the current item/task, with recency as a tie-breaker. This simple lexical retrieval has a 50-observation horizon; use richer retrieval only when demonstrated misses justify it. Full history stays in SQLite. Calls are capped at 65 KiB input and 256 KiB output.

By default, change the next action. A justified instruction amendment is explicit:

```json
{"instruction":"The revised working instruction with one change.","reason":"Repeated evidence or a human correction justifies this change."}
```

```sh
npm run cycle -- method --run runs/local/example --file method-change.json
```

The prior instruction is retained. One trial runs at a time; after three completed passes without infrastructure/validation failure the observation step must record `keep` or `revert` and a reason. Revert switches back to the parent instruction, retaining all results. One poor pass cannot automatically revert a method. If the task completes earlier, a remaining trial stays explicitly unresolved in history; this does not create extra work beyond the task goal.

Working-method trials concern action selection. They do not grant permission to change criteria or acceptance checks. When changing the adapter's assessment logic, check it against saved positive and negative human examples before adopting it; the included restart/regression tests cover the engine, not arbitrary domain judgment. There is no mandatory per-iteration calibration or autonomous rewriting of the adapter.

## SQLite and output

Each run owns its own `<run>/memory.sqlite`. The template contains no process database and never receives run findings, feedback or checkpoints. Two runs have independent databases, histories and state, even when initialized from the same template. Existing databases are never copied during initialization. The base tables and fields are defined in the template’s `schema.sql`, which is copied into each run and executed only at initialization. Opening an existing run does not recreate its schema.

The run’s `memory.sqlite` is its source of truth. Markdown files in this directory are setup guides, not mutable process memory. Directly editing `config.json` after initialization does not alter the database.

| Tables | Purpose |
| --- | --- |
| `kv` | Frozen configuration, current checkpoint, revisions |
| `steps`, `attempts` | Atomic phase history and persisted external responses/errors |
| `actions`, `results` | Completed action identities and retained evidence |
| `ratings`, `criteria_versions`, `feedback` | Append-only assessment and human-correction history |
| `methods`, `observations` | Instruction versions, trial decisions and reusable observations |
| `lock` | Single local runner ownership |
| `migrations` | Applied SQL filenames, SHA-256 checksums and timestamps |

Inspect results with SQLite, for example `SELECT id,accepted,revision,human,reason FROM results`. `accepted` is null before assessment, 0 for rejected, 1 for accepted. Task-specific score scales, exports and display languages belong to the run adapter/exporter. No domain-specific export format is imposed.

## Extend a run database

Create `migrations/` in the task template or a particular run only when needed. Use ordered filenames such as `001-details.sql`, `002-evidence.sql`. These are trusted, reviewed SQL scripts, not model-generated commands. Preserve all existing results and history; add nullable fields or fields with defaults so the runtime can still insert its standard columns.

Example `migrations/001-details.sql`:

```sql
ALTER TABLE results ADD COLUMN detail TEXT;
CREATE TABLE evidence_files (
  result_id TEXT NOT NULL REFERENCES results(id),
  path TEXT NOT NULL
);
```

Initialization applies migrations copied from the template to the new database. For a run that already exists, finish or stop its runner, then explicitly apply new migrations:

```sh
npm run cycle -- migrate --run runs/local/example
```

The command acquires the same lock as the runner. The entire pending batch and its ledger entries commit in one transaction; an SQL error rolls the batch back. Repeating the command skips applied files. Applied files must remain present and unchanged; corrections belong in a new file with a later filename. Do not include transaction-control statements, PRAGMA, ATTACH, DETACH or VACUUM: the runtime owns the transaction and connection.

Run-local migrations do not affect the template or other runs. Template changes affect future runs only. Older runs without a copied `schema.sql` can continue using their existing database and use the same explicit migration command; the base schema is never replayed over their data. Runtime `steps` and `attempts` remain in the main database, so log records and checkpoints retain their atomic relationship.

## Verification

`npm test` includes fresh-process tests for every phase, persisted response reuse after an injected transaction failure, adaptive duplicate-plan recovery, transient tool errors, exhausted retry budgets, human corrections both between phases and during a live child call, current planner ratings, result retention and method rollback after three complete passes. The offline example can run without credentials. A real model run is a separate integration check and requires local CLI access.

Implementation: `src/cycle/`. Existing `src/loop/` and `templates/reddit-research/` are a separate legacy domain implementation; this update does not silently migrate or restart its runs.
