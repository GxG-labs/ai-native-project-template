---
name: orca-orchestration
description: >-
  Coordinate supervised Orca workers, or act as a dispatched Orca worker:
  Runs, Tasks, Dispatches, task DAGs, blocking ask/reply, heartbeats,
  worker_done and escalation waits, coordinator loops, and decomposing work
  across several agent CLIs. Use when asked to supervise, monitor, wait for
  results, or coordinate a DAG, or when the prompt carries a live Orca
  preamble with Task and Dispatch IDs. For unsupervised handoffs, terminal
  control, and worktree management use `orca-cli` instead.
---

# Orca orchestration

This file is a discovery stub. The full procedure is served by the `orca`
binary itself so it always matches the version that runs the commands. Do not
copy that guide into this repository.

## Resolve the CLI

Pick the executable once and reuse it for every later command:

- If `ORCA_CLI_COMMAND` is set, use its value.
- Otherwise, in a dev checkout that exposes `ORCA_DEV_REPO_ROOT`, use `orca-dev`.
- Otherwise, on Linux outside an Orca-managed terminal, use `orca-ide`. Never
  run bare `orca` there: it usually resolves to the GNOME screen reader.
- Otherwise, use `orca`.

`ORCA` below stands for the resolved executable. If it cannot run, report the
exact error and stop; do not fall back to another executable.

## Load the version-matched guide

```text
ORCA skills get orchestration
```

For a conditional gate the guide names (remote placement, release recovery,
expanded DAG work), load only that reference:
`ORCA skills get orchestration --reference references/<file>.md`
(`--references` lists them; if `--reference` is rejected, use `--full`).

Prefer `--json`. Use `ORCA <command> --help` for anything the guide does not
cover; agent ids accepted by `--agent` are listed there. If Orca is not
running, start it with `ORCA open --json` and retry. On
`runtime_access_denied`, re-run with escalated permissions instead of
restarting Orca.

## Project notes

- Roles in this project (voice front, intake queue, coordinator, workers) are
  defined in `docs/spec/agent-fleet/spec.md`. Read it before acting as the
  coordinator.
- Orchestration requires real Orca runtime state. Never substitute a
  different subagent mechanism when Orca provenance was requested.
