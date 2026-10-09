# Run entry point

Read the project's RULES.md and this directory's README.md. Prepare config.json and the task-specific action/check adapter before initialization. Use the repository's `cycle init` command to create a fresh run copy and SQLite memory, then `cycle run` to execute it.

The TypeScript executor owns transitions, goal checks, limits, retries, history and recovery. Do not perform these steps manually in chat or overwrite Markdown snapshots as process memory. Resume the same database in a new process.

Human-approved corrections go through `cycle feedback`; justified working-method amendments go through `cycle method`. Read actual captured evidence before proposing a correction. Never silently modify human criteria or reduce acceptance thresholds to meet the target.
