# Project AI System

Shared AI operating layer for this project.

## Entry Point

For any agent working inside this project, the entry point is `../RULES.md`.
This README is a map of the AI layer after the rules have routed the task.

Do not copy this project's `RULES.md` path into global agents, workspace agents,
platform prompts, or reusable skills by default. Those agents should stay
project-agnostic until a task explicitly points them to this project.

## Starting a New Project?

→ Read `workflows/initialize-project.md` (about 1-5 hours to full setup)

This workflow guides you through:
1. Defining purpose and scope
2. Setting up the AI layer
3. Optionally discovering and choosing skills to implement
4. Bootstrapping core infrastructure
5. Defining initial work
6. Team alignment

**Supported by**:
- `methods/skills-discovery.md` — How to find and evaluate skills for your domain
- `checklists/project-initialization.md` — Detailed per-phase checklist

## For Ongoing Work

Read the universal context in this order:

1. `../RULES.md` — Operating rules (human-curated, agent behavior SSOT)
2. `../PROJECT.md` — Why the project exists
3. `context.md` — Stable facts AI should remember
4. `methods/general.md` — How to approach work
5. `methods/organization.md` — Where files belong

Then classify the task using `../RULES.md` and load only the owner sources:

- `methods/` — Task-type instructions and domain rules
- `methods/skills-discovery.md` — When identifying repeatable procedures to document
- `methods/structured-data.md` — Pattern for files where new records are added repeatedly
- `skills/` — Executable, repeatable procedures
- `workflows/` — Multi-step orchestrations
- `checklists/` — Quality gates and verification lists

## What This Folder Contains

`ai/` contains instructions for how AI assistants (and humans) should work.
It does NOT contain:
- Raw sources or external materials (put in `../context/sources/`)
- Final deliverables or outputs (put in `../output/`)
- Implementation code (put in `../src/` or equivalent)
- Work in progress (put in `../output/drafts/`)

## Reference Lists

→ `references/` contains curated lists of proven tools and repositories:

- `references/VERIFIED_REPOSITORIES.md` — Proven repositories by domain (ML, Web, Data, DevOps, etc.)
- `references/RECOMMENDED_MCP_SERVERS.md` — MCP servers to extend AI assistant capabilities

Use these during optional **Phase 3 (Discover Skills)** of project initialization.
