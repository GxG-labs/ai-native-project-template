# Rules

Single source of truth for how AI agents work in this project.

**Human-curated. Agents may edit this file only when a human explicitly asks them to.
Never modify it on your own initiative — not to add a rule, fix a typo, or "improve" structure.**

---

## Entry Point

`RULES.md` is the entry point for agents working inside this project.

External, platform-level, or globally reusable agents must stay project-agnostic
by default. Do not bake an absolute path to this project's `RULES.md` into a
global agent, workspace agent, skill, runtime, or platform prompt unless a human
explicitly asks for a project-specific agent. Instead, when the task points to
this project, tell the agent to read this file from the project root.

## Before Starting Work

Read the universal context in this order:

1. `PROJECT.md` — why the project exists
2. `ai/context.md` — stable facts about the project
3. `ai/methods/general.md` — how to approach work
4. `ai/methods/organization.md` — where files belong
5. `PROJECT_STRUCTURE.md` — folder map

Then classify the task before editing and load the smallest owner source set:

- **Project organization or file placement:** read
  `ai/methods/organization.md` and `PROJECT_STRUCTURE.md`.
- **Task-type behavior:** read the relevant file in `ai/methods/`.
- **Repeatable procedure behavior:** read the relevant `ai/skills/.../SKILL.md`
  and directly linked reference files.
- **Multi-step orchestration:** read the relevant `ai/workflows/...` file and
  every skill, checklist, or method it references.
- **Quality gate or review behavior:** read the relevant file in
  `ai/checklists/` or the checklist referenced by the workflow or skill.
- **Stable system or product documentation:** read only the relevant files in
  `docs/` when that folder exists.

If the owner layer is unclear, stop and identify where the rule belongs before
editing. Do not patch an adapter, prompt, or workflow to compensate for behavior
owned by a method, skill, checklist, or project rule.

---

## Principles

1. **Preserve intent.**
   If the goal is ambiguous and the next action would be risky, ask one focused question before proceeding.

2. **Put files where they belong, use conventional names.**
   Follow `ai/methods/organization.md`. If the industry has a recognized name for a responsibility, use it.

3. **Keep rules in one place.**
   `RULES.md` at the project root is the single source of truth for agent behavior. All tool-specific files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/*.mdc`, etc.) are adapters: they must contain only a pointer to this file. Hidden folders (`.claude/`, `.cursor/`, etc.) must never contain substantive guides, documentation, or AI instructions — only routing config.

4. **Optimize first for understanding.**
   Legibility for humans and agents comes before token efficiency or editor-specific optimization.

5. **Prefer durable improvements.**
   When a method becomes reusable, promote it into a skill, workflow, template, or documented decision.

6. **Protect private data.**
   Follow `PRIVACY.md` and `SECURITY.md`. Do not expose secrets or sensitive materials.

7. **Verify important work.**
   Use tests for software behavior, evals for AI behavior and artifact quality, and checklists for human-facing deliverables.

8. **Keep the project lightweight.**
   Create folders lazily. Do not add empty structure unless it clarifies real work.

9. **Structure growing registries explicitly.**
   For files where new records are added repeatedly (by humans or agents): include Scope (what fits/doesn't), Structure (fields and types), and Examples (one valid, one invalid). Skip for one-time files, code, and config with standard formats.

10. **Write skills for any LLM, not for a specific tool.**
    Skills in `ai/skills/` must not reference Claude, Codex, Copilot, or any specific AI product by name.

11. **Each component owns one concern. Components reference each other — they never absorb.**
    A prompt says what and why. A skill says how — portable, reusable, context-free. A tool executes what an LLM cannot do itself. If content belongs to a different component, move it there. If the same information exists in two places, one of them is wrong.

12. **Make important rules operational.**
    Durable rules and architectural decisions must be reachable from the agent entry path. If a document contains a rule that agents must follow, either move the rule into `RULES.md` or add a routing rule in `RULES.md` that tells agents exactly when to load that document.

13. **Keep agents project-agnostic by default.**
    Repository rules belong in the repository. Global agents, workspace agents, platform agents, shared skills, and reusable prompts should not assume this project unless the task explicitly points them here.

---

## Agent Behavior

- Think, write prompts, and search in English.
- Reply to the user and write human-readable comments in files in Russian.
- Prefer editing existing files over creating new ones.
- Create folders lazily — only when a real file needs a home.
- Do not add comments that restate what the code already says.
- Do not summarize what you just did unless asked.

## Change Completion Gate

Before finishing a change to instructions, workflows, skills, prompts,
checklists, or architecture:

- Confirm that the changed behavior lives in the owner layer.
- Check that adapter layers still route to the owner instead of duplicating it.
- Search related layers for stale copies or contradictory instructions.
- If you changed a workflow, check referenced skills, methods, checklists,
  artifact paths, and downstream adapters.
- If you changed a skill, check every workflow, prompt, or checklist that
  references it.
- If you changed a global or platform-level agent, confirm it remains
  project-agnostic unless a human explicitly requested a project-specific agent.
- State remaining ambiguity in the final note instead of silently creating a new
  convention.

## What Agents May Not Modify

The following files are human-curated. Agents may edit them only on explicit human request:

- `RULES.md` — this file
- `PROJECT.md`
- `PROJECT_STRUCTURE.md`
- `SECURITY.md`
- `PRIVACY.md`

Never modify these on your own initiative. To suggest a change, write a draft in `output/drafts/` and flag it for human review.
