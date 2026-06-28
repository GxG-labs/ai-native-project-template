# Workflows

Multi-step orchestrations that guide complex processes.

Use workflows when you need to coordinate multiple methods, skills, and decisions in a clear sequence.

## Available Workflows

### initialize-project.md

**When**: Start of a new project  
**Time**: 1.5-5 hours  
**Outcome**: Fully set up project with clear purpose, team alignment, and initial work defined

Guides a project from zero to operational in 6 phases:

1. Define purpose and scope (PROJECT.md)
2. Establish the AI operating layer (RULES.md, ai/context.md)
3. Discover and evaluate available skills and tools (SKILLS_REVIEW.md)
4. Bootstrap core infrastructure (dev environment, CI/CD, security)
5. Populate intent (first campaign or task)
6. Kickoff and align the team

**Start here**: Read \`initialize-project.md\` when launching a new project.

**Supporting materials**:
- \`ai/methods/skills-discovery.md\` — How to find and evaluate skills for your domain
- \`ai/checklists/project-initialization.md\` — Detailed checklist for each phase

---

## Creating New Workflows

A workflow is appropriate when:

- It orchestrates multiple methods or skills in a fixed sequence
- The sequence is complex enough that people get lost without explicit guidance
- The workflow will be reused by multiple people or projects

A workflow is NOT appropriate for:
- One-off procedures (put in \`ai/skills/\` instead)
- Single methods (put in \`ai/methods/\` instead)
- Lists of choices without sequencing (put in \`ai/checklists/\` instead)

To create a new workflow:

1. Draft the sequence of steps
2. Link each step to relevant methods or skills
3. Include time estimates and expected outputs
4. Add a troubleshooting section for common blockers
5. Store in \`ai/workflows/[name].md\`
6. Update this README with an entry

---

## Files in This Folder

\`\`\`
ai/workflows/
├── README.md              ← You are here
├── initialize-project.md  ← Project initialization workflow
└── [future workflows]
\`\`\`
