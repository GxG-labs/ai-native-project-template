# Autonomous model smoke run

This is a saved run of the generic [autonomous loop](../../../templates/self-improving-loop/README.md). It uses the local sample adapter with model calls. [RUN.md](RUN.md) is the run entry point; [config.json](config.json) is the copied configuration. The runtime state, results, and history live in `memory.sqlite`.

From the repository root, build and inspect the run with `npm run build` and `npm run cycle -- status --run runs/local/autonomous-smoke-20261007`. Use the template README for current execution, feedback, recovery, and migration commands. The copied Markdown state file is historical material and does not control the runtime.
