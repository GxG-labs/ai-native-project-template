# Standalone Reddit research loop

A local TypeScript program searches public Reddit posts, reads their original text, scores relevance, accumulates evidence in SQLite, and experiments with improvements to its search and assessment instructions. A run continues without an open chat. It uses a locally authenticated Codex CLI for separate, bounded model calls and public Reddit RSS for sources.

## Install and start

From the project root, with Node.js **22.16 or newer**, npm and a logged-in `codex` executable on PATH:

```sh
npm ci
npm run build
codex login status
npm run loop -- init --run runs/local/my-research --from 2026-06-05 --through 2026-10-05
npm run loop -- run --run runs/local/my-research --iterations 3
```

The dates are inclusive original publication dates. Choose the window required by your task; initialization freezes it for reproducibility. The checked-in dates are an example from the October 5, 2026 research task, so override them for a new task.

`init` creates a run database containing copies of this template's config, criteria, initial method and calibration examples. Edit those template files before initialization, or copy this template directory and pass `--template PATH`. Subsequent template edits do not alter existing runs. Define the task and rating criteria in `criteria.txt`; `method.txt` supplies starting search ideas. `config.json` sets the date window, queries per iteration, posts per query, call budget, call timeout and consecutive empty-batch limit. There are no required placeholders.

To continue an existing local run, if you have one:

```sh
npm run loop -- run --run runs/local/reddit-jtbd --iterations 3
```

A terminal process must remain running. No scheduler, server or open conversation is required. Ctrl-C pauses at a recoverable checkpoint; network and model failures are recorded. Continue an interrupted/failed run with:

```sh
npm run loop -- resume --run runs/local/reddit-jtbd
```

A model call whose validated response has been saved is reused for the same step and inputs on resume, even if the process exited before committing the transition or exhausted its call budget. Only external requests whose responses were not persisted may repeat. Completed steps and saved findings are not repeated or discarded. Call attempts, including failures, consume the budget. To explicitly extend an exhausted budget: `resume --run PATH --calls 200`.

## Main cycle

**Plan → search → assess → save → observations → next plan.** Reading an original post is a checkpoint within search; assessment and saving have separate checkpoints. Observations are assembled from saved evidence without an extra model call. An ordinary batch calls the model to plan and to score accessible originals, then continues; it does not create a method version or run calibration.

The next plan receives recent query outcomes, scores, communities and short quotations from authors, including irrelevant results, duplicates and access failures. It creatively varies phrases and communities. A useful starting balance is two queries developing successful directions and one exploring something new; this is guidance, not a quota. With no successful direction, try different hypotheses. Exact previously executed queries are excluded. All observations stay in SQLite; only three recent summaries enter planning context.

### Occasional instruction changes

Default to changing concrete queries. The planner may propose **one short general search rule** only when a repeated search error or accumulated observations justify it, or the person explicitly corrected the search approach. Automatic proposals must cite at least two saved, complete batches. Unsupported proposals are deferred while their queries can still execute. Human search feedback is supplied with `feedback --scope search`.

An accepted amendment appends one rule to the current search instruction, preserving the previous version and recording its observation, reason and evidence. Only one trial can be active. It is reviewed after **three complete search passes** using their outcomes and the amendment's purpose. The model records a reasoned keep/revert decision; a single lower-yield batch never automatically reverts a method. Access-limited passes do not count toward the three passes and cannot justify a strategy change. A trial can span multiple bounded executions. Its completion is not an extra required procedure for normal searching.

Search changes never modify scoring instructions or user criteria and never run scoring calibration. To explicitly change scoring instructions, use the optional `assessment-guide` command below. It compares the old and proposed instruction on the same saved control examples, accepting it only when total absolute rating error does not increase. It runs no searches. Initial examples are synthetic regression checks, not Reddit findings; verified human-rated posts can add examples. At most eight examples enter a comparison. Finish any active search trial before starting a scoring-instruction change so the experiment changes one thing at a time.

Each model call starts fresh with bounded, step-specific context. It cannot edit the database or code. Criteria, source validation, retention and checkpoint rules are enforced outside the model. A model's evidence-based judgment is still fallible; keep/revert decisions are inspectable, not causal proof.

## Bundled example criteria

The bundled `criteria.txt` targets people with roughly similar problems reserving for obligations, calculating a safe remainder and coordinating money across sources. Replace it when initializing a different research task. For this example, explore irregular and stablecoin income, cross-border households, shared housing costs, family finances and debts. Multiple currencies/accounts, recurring coordination and costly mistakes are clues, not mandatory requirements.

- **5:** a strong financial coordination problem, or an author building a similar product. Developer threads are audience leads; comments require separate evidence.
- **4:** a clear similar difficulty with some missing details; explain the concrete calculation, reserve or funding-coordination action that could help.
- **3:** a promising adjacent situation, with uncertainty explained.
- **2:** superficial overlap; service-freeze/access discussion or receipt-only payment questions without coordination. Also at most 2 when the main obstacle is refusal to pay, debt recovery or interpersonal conflict and calculations are only background. Shared bills alone do not justify a high rating.
- **1:** unrelated material. Similar-product promotion is still 5.

All discovered posts remain, including low scores, outside-window dates and inaccessible originals. The `score` column contains only an integer from 0 to 5: 0 means not assessed because the original is unavailable; 1–5 are relevance ratings. Comments and explanations belong only in `reason`, never in the score cell. No stars, `/5`, labels or other decorations are added. Scores require an exact quote from captured original text. Original body text supplied by Reddit's search RSS can support scoring if the separate comment request fails; this limitation is recorded. Comments are auxiliary evidence and do not prove the author's own situation.

## Human feedback

Use ordinary language; no rubric form is needed. Criteria feedback and individual human ratings can be submitted while search is running; they commit in short SQLite transactions without taking over the runner or changing its checkpoint. New model calls read the correction. A call already in flight may still use its earlier inputs, so saved high ratings affected by the correction must be reassessed.

```sh
npm run loop -- feedback --run runs/local/reddit-jtbd --text "Account-freeze discussions are irrelevant. Similar-product builders should score 5."
npm run loop -- reassess --run runs/local/reddit-jtbd
```

The criteria correction is stored and passed to subsequent planning and scoring calls. Reassessment revisits stored posts and appends rating history. It is separately resumable and keeps old evidence. To correct one post and protect your rating from later automated overwrites:

```sh
npm run loop -- rate --run runs/local/reddit-jtbd --id REDDIT_ID --score 5 --text "This developer thread is an audience lead."
npm run loop -- reassess --run runs/local/reddit-jtbd --id REDDIT_ID
```

Your rating is saved even if original text is unavailable; the displayed score remains 0 until evidence verification succeeds. Feedback is cumulative (8,000 characters per scope), not silently forgotten. Criteria feedback is blocked only during an explicit scoring calibration so that comparison retains consistent criteria. Chat comments can be translated into these commands, but the running program needs no chat participation.

For a search-approach correction:

```sh
npm run loop -- feedback --run runs/local/reddit-jtbd --scope search --text "Search community-specific everyday problem phrases instead of long product descriptions."
```

Search feedback goes to planning, not scoring. It authorizes a justified single-rule proposal; it does not force a method rewrite every batch. For a deliberate scoring-instruction change (user criteria stay unchanged):

```sh
npm run loop -- assessment-guide --run runs/local/reddit-jtbd --text "Apply the human criteria; distinguish the author's situation from commenters' situations." --reason "Repeated confusion between author and commenter evidence."
```

That optional command alone starts a resumable control-example comparison. Ordinary searches do not run it. `feedback` corrects the user's criteria directly; `assessment-guide` changes how the evaluator applies them.

## Results, history and recovery

```sh
npm run loop -- list --run runs/local/reddit-jtbd --limit 100
npm run loop -- status --run runs/local/reddit-jtbd
npm run loop -- history --run runs/local/reddit-jtbd
```

`list` includes the post date, community, numeric 0–5 score, separate reason, URL and `within_window`. The post-date column (`published`) always uses `YYYY-MM-DD`, for example `2026-10-05`, with a four-digit year and two-digit month/day; no relative dates or time-of-day suffixes. Open `findings.sqlite` with any SQLite viewer. For the requested in-window shortlist:

```sql
SELECT title, published, subreddit, score, reason, url
FROM posts
WHERE published BETWEEN '2026-06-05' AND '2026-10-05' AND score >= 3
ORDER BY score DESC, published DESC;
```

| SQLite table | Purpose |
| --- | --- |
| `posts`, `rating_history` | Cumulative findings and score/reason history; deletion blocked |
| `loop_sources`, `loop_queries` | Captured bodies/comments, executed searches and access failures |
| `loop_plans`, `loop_observations` | Search plans, batch metrics, author wording and query outcomes |
| `loop_methods` | Guidance versions, parent, lesson, calibration/trial decisions |
| `loop_calls`, `loop_events` | Actual model inputs/outputs/errors and step history |
| `loop_kv` | Frozen task/config, active method and recoverable state |
| `loop_feedback`, `loop_human_scores`, `loop_calibration` | Human corrections and evaluation examples |
| `source_archive` | Earlier files when upgrading an existing run |

Each completed step commits its result (or source/call references), inputs, decision and reason, and next state in one SQLite transaction. Method keep/revert decisions participate in that same transaction. `loop_events` records the completed phase and the next phase explicitly; no event replay is needed for recovery. All human rating revisions, including ratings of unverified posts, are retained there.

`execution_state.md` and `search-plan.md` are generated convenience views, rewritten after checkpoints. SQLite owns their history. Findings are never exported to Markdown. Upgrading an existing findings database is additive and makes a `before-ts-*.sqlite` backup. One execution runner per run is enforced; human feedback/rating transactions may run concurrently with it.

The process stops on the requested iteration limit, consecutive complete batches without new relevant findings, interruption, model budget or an error. “Stopped” means the bounded execution ended, not that all relevant Reddit posts have been found. RSS search can omit results and enforce rate limits; requests are spaced and transient 429/503 responses receive one delayed retry. No failure is replaced with invented findings.

## Verification

`npm test` builds TypeScript and runs Node's built-in tests for retention, checkpoints, source validation, feedback, quote checking, call limits, ordinary batches without calibration, justified multi-pass trials, explicit scoring calibration and access failures. The recovery test exits one Node process after a model response is saved and launches another against the same database; completed searches and the saved response must not be repeated. Tests also exit and restart between every phase through two full batches. Injected SQLite failures verify that method decisions and observations roll back with the step. Real model judgments remain probabilistic; human corrections improve calibration without promising perfect relevance.

Existing databases migrate additively. Legacy per-batch proposals remain in history but unfinished mandatory calibration is superseded by observations; the current active guide is retained without applying the old one-batch rollback policy.
