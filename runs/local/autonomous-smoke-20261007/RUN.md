# Run the loop

Read `RULES.md` first. Paths below are relative to this run directory. Follow `program.md`; it cannot override project rules or the task's permitted scope.

1. Fill `task.md` from the user's request, then run `python3 preflight.py` from this run directory. Before changing the system, require a concrete result, permitted paths, excluded paths, objective acceptance criteria, and a runnable check for each criterion. Resolve missing or ambiguous fields with the task owner.
2. Read `skills/auto-loop/SKILL.md` and execute it. It calls the other skills in order. Read each skill when its step starts.
3. At every step, read `execution_state.md`, perform one action, verify its result, and overwrite the snapshot. Keep only the latest observation and decision there; put durable lessons in `lessons.md`. Do not use accumulated chat history as the run state.
4. Stop after acceptance criteria pass with fresh evidence, or at a human decision gate, or after two consecutive iterations without measurable progress. Report the actual status and evidence.

Use `task.md` as the single source for the requested result and acceptance criteria. For project software changes, follow `ai/workflows/software-change.md`; for Gauntlet work, follow `ai/workflows/gauntlet-loop.md`. Do not copy or weaken those owners in this run.
