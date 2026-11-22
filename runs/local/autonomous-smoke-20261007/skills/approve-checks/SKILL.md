---
name: approve-checks
description: Use when a loop candidate and its acceptance checks are ready for a keep-or-revert decision.
---

# Approve checks

Run the task's applicable checks and relevant existing checks on the changed system. Record exact commands, exit status, and observed evidence in `execution_state.md`. If all pass, keep the candidate and record the verified change in the project's required artifact or Git history. If a check fails, repair and rerun once when the cause is clear; otherwise revert only this run's candidate, preserving unrelated work. Never commit or report success with a failed or skipped required check. Give the failure and cause to `self-improve`.
