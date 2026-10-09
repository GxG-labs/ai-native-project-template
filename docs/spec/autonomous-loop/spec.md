# Autonomous loop

User-approved scope: implement the four gaps identified in chat in the universal template: measurable target and stopping, adaptive bounded recovery, human correction through reassessment to fresh planning context, and full-process restart verification.

The generic runtime executes plan → act → assess → save → observe. Domain knowledge, authorized actions and acceptance checks belong to copied run configuration and its adapter, not the engine. Existing Reddit code and database are not migrated or started by this change.

SQLite is the only process memory. Completed steps atomically retain inputs/references, output, decision/reason and next state. Results are retained at every acceptance level. Ratings, criteria revisions, feedback and method revisions are append-only history. Recovery reads current state, not event replay. External effects before a committed checkpoint require adapter idempotency using a stable action key; no general exactly-once external-effect claim.

Goal: a configurable number of distinct results passing all run criteria, with current evaluation revision or explicit human override. Global limits bound iterations, calls and consecutive failure/no-progress. Completion never bypasses pending reassessment. Retry feedback includes rejected output and reason; access failures do not count as negative task evidence. Budget exhaustion needs explicit human extension. Human criteria updates never originate from model output.

Each fresh model input includes the task/criteria, current method/state, the current artifact and a few matching observations refreshed with current ratings. Total input and output size bounded. Adapter protocol uses JSON stdin/stdout with explicit tools and process timeout. No model-generated shell command execution.

Human feedback updates criteria, queues existing machine-rated results for reassessment, records explicit result overrides and preserves history. Revision checks reject in-flight assessments made against superseded criteria. Human method edits are one justified amendment tested on three completed subsequent passes; keep/revert is persisted. Normal planning does not require a method edit. Evaluation controls are separate from ordinary execution.

Acceptance: real SQLite/CLI/process tests demonstrate restart after every phase, no repeated committed action, error then recovery with changed input, criteria change during in-flight assessment, human overrides, all records/history retained, method rollback after three completed passes, and a standalone local demo reaching a configured target. A live model smoke run validates the configured model protocol separately from deterministic correctness tests.


The template owns schema.sql for base fields and tables. Initialization copies the schema and creates an independent run database; process logs remain tables in that database for atomic commits. Optional numbered SQL migrations extend an individual run under its runner lock, with transactional application, an applied checksum ledger and no replay of completed migrations. Existing run databases are never recreated from the template.
