---
name: write-checks
description: Use when a loop candidate needs objective evidence before a keep-or-revert decision.
---

# Write checks

For each applicable acceptance criterion in `task.md`, use its runnable check or exact observable scenario. Add or update the smallest reusable test when the existing checks cannot detect the candidate's failure. Put durable software checks in the project's `tests/` or existing test location; keep run-specific commands and evidence in this run. Confirm each check would fail for the relevant wrong behavior. Record the commands and expected results in the state.
