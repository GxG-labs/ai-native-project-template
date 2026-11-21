# Autonomous offline verification run

This is a saved run of the generic [autonomous loop](../../../templates/self-improving-loop/README.md). Its copied [config.json](config.json) selects the local sample adapter's offline demo mode. [RUN.md](RUN.md) is the run entry point; the runtime state, results, and history live in `memory.sqlite`.

From the repository root, build and inspect the run with `npm run build` and `npm run cycle -- status --run runs/local/autonomous-verified-20261007`. Use the template README for current execution, feedback, recovery, and migration commands. The copied Markdown state file does not control the runtime.
