# Research Loop Implementation Plan

**Goal:** executable local TS research and improvement loop preserving the existing SQLite store.
**Architecture:** CLI → persistent engine → restricted Codex JSON calls and Reddit RSS. SQLite owns checkpoints, source evidence, methods and audit history.
**Tech Stack:** Node >=22.16, TypeScript, node:sqlite, Cheerio, Ajv.
**Spec:** ../../spec/research-loop/spec.md

- [x] Write end-to-end failure tests covering persistent state, retention and rejected method regression before implementation.
- [x] Implement contracts/source parsing in src/loop/model.ts and providers.ts; use strict JSON schemas and verified RSS timestamps/body.
- [x] Implement store.ts: additive schema, atomic checkpoints, exclusive local runner and automatic rating history.
- [x] Implement engine.ts: bounded stages, fresh calls, checkpoints, calibration and measured keep/revert; feedback and resumable reassessment.
- [x] Implement cli.ts and reusable templates/reddit-research configuration; migrate existing run by additive initialization.
- [x] Run npm test, inspect migration counts/history, run a real small cycle through the CLI, document commands and actual limits.

Tests use a deterministic provider only for reproducible orchestration checks; production never substitutes fake findings on network/model failure. Live verification uses the real Codex login and Reddit sources. No automatic commits or external publishing.

## Verification, 2026-10-05

- `npm test`: 10 passing tests after the final build. Access-failure regression was reproduced before its fix, then passed.
- Real CLI run completed search iterations 10 and 11 through fresh authenticated Codex calls, original Reddit RSS, scoring, calibration, method decisions and a finite stop. An unsupported output-schema keyword failed first; removing it from the outgoing schema while retaining local validation allowed checkpointed recovery.
- Reddit 429 responses were observed. Requests now use spacing and a bounded delayed retry; captured original search-feed bodies remain usable when comments cannot be fetched. Incomplete search batches do not judge method yield.
- Existing 33 posts and their rating-history rows compared equal to the automatic pre-runtime backup. Current store has 38 posts; SQLite integrity check returned `ok`.
- `npm audit --omit=dev`: 0 vulnerabilities. `git diff --check`: clean.
- Review: execution lives in the TS engine, the run entrypoint routes there, generic instruction-only template is labeled separately, and the README distinguishes heuristics/coverage limits from guarantees. No commit or deployment requested.

## Accepted recovery refinement plan

1. Reproduce lost-response reuse and premature method mutation using real SQLite and separate Node processes.
2. Link model outputs to stable step identity; reuse validated saved outputs before spending call budget.
3. Commit results, method decisions, input references and next state atomically; preserve every human rating correction.
4. Run regression tests and a local CLI smoke check; document the unpersisted-response boundary.

### Recovery refinement verification

- Three new regression tests failed on the original implementation: saved-response reuse in a new process, transactional method rollback, and human corrections to unverified posts.
- `npm test`: 13 passing after changes. The separate-process test exits with a saved response and a stale runner lock; a new process resumes without search/model calls, even with the call budget exhausted. Injected SQL failure leaves method and state unchanged; retry commits the revert.
- Real local CLI reassessment completed at iteration 15 with one model call. Its event links the saved response by step identity and records the assess → finish transition; run status is stopped, all 38 findings remain, SQLite integrity is `ok`.
- `git diff --check`: clean. SQLite remains the only process store; no replay layer, graph or additional runtime dependency was added.

## Observation-driven simplification

User-approved change: replace mandatory batch improvement/calibration with plan, search/read, assess, save, observations and next plan. Keep SQLite recovery and history. Add evidence-gated single-rule search amendments with three-complete-pass reviews; score-guide calibration is explicit only. Update existing CLI/README, migrate legacy pending states without losing records, test ordinary calls and real process exits at every phase, then verify two local batches.

### Simplification verification

- `npm test`: 17 passing tests. Ordinary batches call only plan/assess; next plans receive author wording and query outcomes. Search amendments require complete cited evidence or explicit search feedback, wait for three complete passes, ignore access failures, and preserve assessment instructions. Explicit assessment-guide changes alone run calibration. Legacy pending calibration safely migrates to observations.
- Recovery: tests exit/restart a separate Node process after every phase through two full batches; committed searches and findings/history are preserved. Saved model-response recovery and transaction-failure tests also pass.
- Real CLI iterations 16–17 completed. Sent SIGINT to the verified runner during assessment, observed `paused`, then started a new CLI process with `resume`. Exact saved query rows were unchanged after resume: no completed search repeated.
- Live results: 44 total posts; all 38 pre-change posts and every previous rating-history row compared equal to the pre-change SQLite backup. Two observations saved, zero calibration calls and zero method-version creations during the ordinary run. Iteration 17 planner input contained iteration 16 observations. Final status stopped; SQLite integrity `ok`; `git diff --check` clean.

## Live scoring correction

Human-approved change: distinguish financial coordination from refusal to pay a known debt. Applied as append-only criteria feedback while collection PID 80355 continued; fixed the identified post to 2 with a protected human rating and preserved history. Added its previously captured original as a control; the reusable template has a synthetic counterpart. All five live control examples matched expected ratings, including refusal=2, similar-product builder=5 and reserves=5.

`npm test`: 19 passing, including a separate CLI process applying feedback and a rating while the runner lock remains held and its state is unchanged. Updated README and template. A separate audited correction pass (`tmp/correct-scores.mjs`, progress in `loop_kv.scoringCorrection`) is reassessing the 28 saved high-rated posts without taking over the collector's checkpoint. Monitoring reports aggregate reassessment progress. Unavailable full originals may use previously verified original quotations only, explicitly labeled as limited evidence; no invented text. Collection remains active toward 100 qualified posts.
