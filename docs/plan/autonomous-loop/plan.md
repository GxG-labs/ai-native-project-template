# Autonomous loop implementation plan

Implement inline under the user's approved request.

1. Add CLI integration tests first: initialize a generic run, execute one step per new process, inject duplicate plans and transient failures, change criteria between assessment and saving, verify accepted target and history without repeated actions.
2. Implement generic SQLite runtime and command protocol in src/cycle. Keep domain code in adapters; use existing Node, SQLite and Ajv dependencies.
3. Make templates/self-improving-loop executable with task configuration, a model adapter and a local read-only example action/check adapter. Document all commands and recovery boundaries. Replace obsolete manual state instructions.
4. Test concurrency/revision handling, rollback and terminal limits; run existing tests, fresh-process scenario and local live-model smoke run. Record evidence and remaining limits here.

Do not mutate the existing Reddit run, protected project rules, unrelated edits or external services. No new dependency, event sourcing, graph, scheduling service or mandatory per-batch method calibration.

## Verification evidence — 2026-10-07

- `npm test`: 33 tests passed, including 14 universal-runtime tests and 19 existing domain-runtime tests.
- Every phase resumed in a separate CLI process. SIGTERM during a live adapter call persisted a pause; a new process completed without repeating the committed action.
- Injected transaction failure rolled back the result/checkpoint together and reused the persisted response.
- Human-feedback race at the commit boundary, method attribution, consecutive failure reset and two-run database isolation have regression coverage.
- Independent review found three defects; all three were reproduced, fixed and re-reviewed without remaining material findings.
- `runs/local/autonomous-verified-20261007`: final offline local run completed, 2/2 accepted, 8 calls.
- `runs/local/autonomous-smoke-20261007`: real local model integration completed, 2/2 accepted, 11 calls. Initial sandbox restrictions prevented the model CLI from accessing its own service database; those failures were recorded and surfaced, then the explicitly escalated local command resumed the same run successfully.
- The template contains no process database. Initialization excludes source memory.sqlite and journal files, including when a populated run is used as the source.

Remaining boundaries: arbitrary tasks need an authorized domain adapter; external mutations need adapter idempotency. Exactly-once external effects cannot be guaranteed by local SQLite. No daemon or scheduler was added.


## Template-owned schema extension — 2026-10-07

Approved follow-up: extract baseline DDL to the copied template schema.sql; initialize run-local databases from it. Add explicit locked, transactional SQL migrations with filename/checksum history. Preserve old run databases and keep process logs in the same database. Verify template-specific schema, additional runtime table fields, exactly-once migration application, rollback, modified-file rejection and isolation through the real CLI.

Verification: full `npm test` passed 34/34. The extended migration integration test also passed after adding the active-run lock check. It initializes two isolated runs from a customized schema, runs the actual cycle with added base-table columns, verifies single application, rollback and checksum rejection. No existing task databases were migrated.
