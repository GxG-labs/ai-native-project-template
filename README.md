# AI project template

A starting structure for software, research, content, and operational work. Read [RULES.md](RULES.md) first; it is the entry point for agent behavior. [PROJECT.md](PROJECT.md) and [ai/context.md](ai/context.md) are still placeholders for this project's purpose and stable facts.

## Start here

1. Define the outcome and boundaries in [PROJECT.md](PROJECT.md).
2. Create the first task in `intent/` using [templates/intent.md](templates/intent.md).
3. Follow [software-change.md](ai/workflows/software-change.md) for software work, [compile-knowledge.md](ai/workflows/compile-knowledge.md) for growing knowledge, or [gauntlet-loop.md](ai/workflows/gauntlet-loop.md) for iterative system improvement.

[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) owns file placement and the rules for adding folders and README files. The directories below are navigation, not a second set of rules.

| Need | Entry point |
| --- | --- |
| Project purpose | [PROJECT.md](PROJECT.md) |
| Stable project facts | [ai/context.md](ai/context.md) |
| Requirements and target architecture | [docs/spec/](docs/spec/README.md) |
| Implementation plans | [docs/plan/](docs/plan/README.md) |
| Methods, skills, workflows | [ai/](ai/) |
| Reusable artifact templates | [templates/](templates/) |

## Executable examples

This repository also contains two independent local TypeScript loops. They require Node.js 22.16 or newer; run `npm ci` and `npm run build` from the repository root.

- [Autonomous loop](templates/self-improving-loop/README.md): a generic `cycle` CLI with a task-specific adapter, SQLite checkpoints, and an offline demo. Start with `npm run cycle -- init --run runs/local/example --demo`.
- [Reddit research loop](templates/reddit-research/README.md): a domain-specific `loop` CLI using public Reddit RSS and a locally authenticated Codex CLI. Its template README covers setup, execution, and recovery.

`npm test` builds and runs the Node test suite for both loops. If present, `runs/local/` contains individual run records; their databases and captured evidence are not reusable templates.
