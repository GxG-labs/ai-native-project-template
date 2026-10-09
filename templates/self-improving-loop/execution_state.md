# Execution state

Current state lives in memory.sqlite. Use `npm run cycle -- status --run PATH` from the repository root. Each completed phase stores input, output, decision, reason and next state atomically. This file is not overwritten by the executor and must not be used for recovery.
