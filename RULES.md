# Rules

Single source of truth for how AI agents work in this project.

**Human-curated. Agents may edit this file only when a human explicitly asks them to.
Never modify it on your own initiative — not to add a rule, fix a typo, or "improve" structure.**

---

## Before Starting Work

Read in this order:

1. `PROJECT.md` — why the project exists
2. `ai/context.md` — stable facts about the project
3. `ai/methods/general.md` — how to approach work
4. `ai/methods/organization.md` — where files belong
5. `PROJECT_STRUCTURE.md` — folder map

Load only what is relevant to the current task:

- `ai/methods/` — task-type instructions
- `ai/skills/` — executable procedures for repeatable tasks
- `ai/workflows/` — multi-step orchestrations

---

## Principles

1. **Preserve intent.**
   Start from the brief or user request. If the goal is ambiguous and the next action would be risky, ask one focused question before proceeding.

2. **Keep project knowledge organized.**
   Put files where their role belongs. Follow `ai/methods/organization.md`.

3. **Use conventional names with conventional meaning.**
   If the industry already has a recognized file or folder name for a responsibility, use that name and preserve its expected meaning. Do not invent custom names for standard concepts.

4. **Keep rules in one place.**
   `RULES.md` at the project root is the single source of truth for agent behavior. All tool-specific files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/*.mdc`, etc.) are adapters: they must contain only a pointer to this file. Hidden folders (`.claude/`, `.cursor/`, etc.) must never contain substantive guides, documentation, or AI instructions — only routing config.

5. **Optimize first for understanding.**
   Make the project legible to human teammates, industry-standard tooling, and LLM agents before optimizing for token efficiency or editor-specific behavior.

6. **Prefer durable improvements.**
   When a method becomes reusable, promote it into a skill, workflow, template, or documented decision.

7. **Protect private data.**
   Follow `PRIVACY.md` and `SECURITY.md`. Do not expose secrets or sensitive materials.

8. **Verify important work.**
   Use tests for software behavior, evals for AI behavior and artifact quality, and checklists for human-facing deliverables.

9. **Keep the project lightweight.**
   Create folders lazily. Do not add empty structure unless it clarifies real work.

10. **Structure growing registries explicitly.**
    For files where new records are added repeatedly (by humans or agents): include Scope (what fits/doesn't), Structure (fields and types), and Examples (one valid, one invalid). Skip for one-time files, code, and config with standard formats.

11. **Write skills for any LLM, not for a specific tool.**
    Skills in `ai/skills/` must not reference Claude, Codex, Copilot, or any specific AI product by name. Tool-specific adapters route to skills; skills themselves must be usable by any capable AI assistant.

---

## Agent Behavior

- Prefer editing existing files over creating new ones.
- Create folders lazily — only when a real file needs a home.
- Do not add comments that restate what the code already says.
- Do not summarize what you just did unless asked.
- When a method becomes reusable, promote it to `ai/skills/` or `ai/methods/`.

## What Agents May Not Modify

The following files are human-curated. Agents may edit them only on explicit human request:

- `RULES.md` — this file
- `PROJECT.md`
- `PROJECT_STRUCTURE.md`
- `SECURITY.md`
- `PRIVACY.md`

Never modify these on your own initiative. To suggest a change, write a draft in `output/drafts/` and flag it for human review.
