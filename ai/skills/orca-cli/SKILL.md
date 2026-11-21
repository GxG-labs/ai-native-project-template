---
name: orca-cli
description: >-
  Operate Orca-managed worktrees, folder workspaces, terminals, repos,
  automations, worktree comments, and Orca's embedded browser through the
  `orca` CLI. Use for "Orca worktree", "child worktree", "start an agent CLI in
  a worktree", reading, waiting on, or sending to an Orca terminal, and
  unsupervised handoffs ("hand off", "give this to another agent"). Prefer it
  over raw git worktree or ad hoc PTYs when Orca state is involved. For
  supervised coordination use `orca-orchestration`.
---

# Orca CLI

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
ORCA skills get orca-cli
```

Prefer `--json`. Use `ORCA <command> --help` for anything the guide does not
cover; agent ids accepted by `--agent` are listed there. If Orca is not
running, start it with `ORCA open --json` and retry. On
`runtime_access_denied`, re-run with escalated permissions instead of
restarting Orca.

## Project notes

- A handoff creates no Run, Task, or Dispatch and is not monitored. When the
  user wants results tracked, switch to `orca-orchestration`.
- Scheduled wake-ups for the coordinator described in
  `docs/spec/agent-fleet/spec.md` are Orca automations (`ORCA automations`).
