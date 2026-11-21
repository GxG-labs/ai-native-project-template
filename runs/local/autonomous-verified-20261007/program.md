# Execution boundaries

The task and authorized scope are configured before initialization. The SQLite run owns their active versions afterward. Only the human feedback command changes criteria. The adapter enforces domain-specific tool permissions and checks; the model cannot execute arbitrary commands.

The runtime executes plan → act → assess → save → observe. Each completed phase is atomically checkpointed. Retain every result and rating revision. Default to new actions, not instruction edits. See README.md for method trials, failure recovery, limits and external-effect idempotency requirements.
