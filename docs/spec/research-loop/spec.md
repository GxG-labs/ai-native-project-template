# Local research loop

The user's implementation request authorizes this executable realization of the discussed loop.

- Node.js >=22.16, TypeScript, built-in SQLite; reuse existing findings.sqlite without losing records or history.
- A CLI owns plan → search/read → assess → save → observe → next plan, persisting each completed action and its next state transactionally. Restart resumes the last committed step. One execution runner per local database; explicit human feedback and ratings use short concurrent SQLite transactions without changing runner state.
- Fresh noninteractive Codex invocations with bounded input, no chat/session resume, shell disabled, no user plugins/config. Existing ChatGPT login is used; no credential copying. Timeouts, attempt limits and Ctrl-C preserve state. Each call's input, output, elapsed time and error are retained locally.
- Search/read uses Reddit public RSS with fixed Reddit-only URLs, timeouts, response-size caps, original publication dates and body evidence. Access failure is recorded, never silently scored from a snippet.
- Every discovered post remains in SQLite at any relevance, including unknown/unverified and old posts; no deletion. Scores use original evidence; short quotations must occur in the captured source. Human scores override automated reassessments.
- User criteria stay fixed unless the human corrects them. Ordinary batches change queries and save observations; they neither version methods nor calibrate scoring. Planner context includes author wording, communities, successes and failed queries. Two exploitation queries and one exploratory query are a guideline, not a quota.
- A single general planner amendment needs repeated errors, accumulated observations (at least two complete cited batches), or explicit human search feedback. Review it after three complete passes, record keep/revert and reason, and exclude access failures. Never automatically revert after one smaller yield. Only one search trial runs at a time.
- Assessment instructions change only on explicit request, through a saved-example comparison. No automatic scoring changes; no calibration after routine search batches. Preserve methods and trial decisions without deleting findings.
- Save plan/method versions, all step outputs, metrics and decisions in SQLite. Markdown state/plan are generated convenience views, not authoritative state. Full archives are not injected into each model call.
- Feedback is plain text via CLI, versioned and used by future calls; human post ratings are persistent calibration examples. Reassessment of existing posts is an explicit resumable operation.
- Finite iteration and call budgets; no-progress stop; run/status/list/history/feedback/rate/reassess commands. No contacts, posts, payments, scheduling or deployment.
- Verify with deterministic end-to-end tests: interruption/resume, duplicates, retention, source/quote checks, multi-pass method review, explicit assessment calibration, feedback, human overrides, lock, invalid output and migration. Also perform a real local live cycle and report real limitations.

## Accepted recovery refinement

SQLite alone is process memory. Each completed step atomically stores its result, input or durable references, decision/reason and next step. Saved model responses are linked to step identity and reused after a crash before the transition commits. Only requests whose responses were not persisted may repeat. Method keep/revert writes belong to the same step transaction. All human rating corrections, including unverified posts, retain history. Tests must kill/exit a process between steps and start a separate process on the same database, checking no repeated committed search, no repeated persisted model response, retention and failed-method rollback. Context remains bounded; no event replay architecture or memory graph is introduced.

The current score column is always an integer 0–5, with no decorations or comments. Zero represents an unassessed original; 1–5 retain the existing relevance rubric. Keep explanations separate and preserve historical ratings when migrating earlier NULL values to zero.

Human scoring correction: distinguish refusal to pay/debt recovery from a need to calculate, reserve or coordinate money. Refusal/conflict as the main obstacle is at most 2; 4–5 requires a concrete helpful product action, with the similar-product-builder exception still 5. Human corrections apply to subsequent calls without stopping search; affected saved scores require an audited reassessment, retaining old ratings.
