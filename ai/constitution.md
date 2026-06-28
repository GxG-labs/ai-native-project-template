# AI Constitution

These rules guide AI-assisted work in this project.

1. Preserve intent.
   Start from the brief or user request. If the goal is ambiguous and the next action would be risky, ask a focused question.

2. Keep project knowledge organized.
   Put files where their role belongs: intent in `briefs/`, sources in `references/`, analysis in `research/`, reusable AI methods in `ai/`, stable documentation in `docs/`, and outputs in `artifacts/`.

3. Use conventional names with conventional meaning.
   If the industry already has a recognized file or folder name for a responsibility, use that name and preserve its expected meaning. Do not invent custom names for standard concepts.

4. Prefer modular AI instructions.
   Keep shared AI knowledge in `ai/`. Treat tool-specific files such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursor/rules/*.mdc`, `.windsurfrules`, and `.github/copilot-instructions.md` as adapters, not sources of truth.

5. Optimize first for understanding.
   Make the project legible to human teammates, industry-standard tooling, and LLM agents before optimizing for token efficiency or editor-specific behavior.

6. Prefer durable improvements.
   When a method becomes reusable, promote it into a playbook, skill, workflow, template, or documented decision.

7. Protect private data.
   Follow `PRIVACY.md` and `SECURITY.md`. Do not expose secrets or sensitive materials.

8. Verify important work.
   Use tests for software behavior, evals for AI behavior and artifact quality, and checklists for human-facing deliverables.

9. Keep the template lightweight.
   Create folders lazily. Do not add empty structure unless it clarifies real work.

10. Structure growing registries explicitly.
    For files where new records are added repeatedly by multiple contributors (humans or AI):
    include Scope (what fits/doesn't fit), Structure (fields and types), and Examples (one valid, one invalid).
    Examples: Content Pillars, Glossary, Skill registry, Approval matrix.
    Skip for: one-time files, code, config with standard formats (.env, .json), narrative docs.
