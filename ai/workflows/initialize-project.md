# Project Initialization Workflow

This workflow guides the setup of a new project from zero to operational. Follow it sequentially.

## Phase 1: Define Purpose & Scope (30 min)

Complete `PROJECT.md` with:
- **Why This Exists**: One paragraph on the reason this project should exist
- **Main Job**: Use the formula: "This project helps {target user} do {job} by {mechanism}, so that {outcome}"
- **Ideal Final Result**: Describe the ideal end state
- **Good Result Now**: Define realistic success for this stage
- **Success Criteria**: At least 3 observable criteria
- **Non-Goals**: What this project should NOT become
- **Decision Preferences**: 3 preferences that protect the desired outcome
- **Current Focus**: What matters most right now

**Questions to clarify:**
- Who is the end user? What problems do they have?
- How will this project be different from existing alternatives?
- What constraints (time, resources, technical, legal) matter most?
- What's the definition of "done" for the MVP?

Output: A completed `PROJECT.md` that answers "why does this project exist?"

---

## Phase 2: Establish AI Operating Layer (20 min)

Update `ai/context.md` with stable facts that all AI work should remember:

- **Project purpose**: One-line summary
- **Target users/audience**: Who benefits?
- **Key constraints**: Budget, timeline, technical limits, compliance requirements
- **Glossary**: Non-obvious terms used in the project
- **Important assumptions**: What must remain true for the plan to work

Update `RULES.md` if the default principles don't fit this project's philosophy (human must approve the edit).

Output: A usable `ai/context.md` that prevents AI from making harmful assumptions.

---

## Phase 3: Discover Available Skills & Tools (45 min)

Skills are repeatable procedures that can accelerate work. Before building, review what already exists.

### Step 3a: Identify Candidate Repositories

Based on your project's goals from Phase 1, identify 3-5 repositories or skill collections that might be relevant:

**Questions to answer:**
- What's the primary domain? (e.g., AI/ML, Web, Data, Mobile, Content, DevOps)
- Are there industry-standard practice repositories? (e.g., [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) for ML, `microsoft/vscode-extension-samples` for VS Code)
- Are there existing projects in your organization that solved similar problems?
- What problem-solving patterns does your team already use?

**Where to look:**
- GitHub stars/trending in your domain
- Organization/team private repositories
- Established open-source projects (web frameworks, CLI tools, etc.)
- Consultant/agency playbooks

Record candidates with:
\`\`\`
| Repository | Domain | Why Relevant | Link |
|---|---|---|---|
| example-repo | ML/AI | Feature engineering patterns | https://github.com/... |
\`\`\`

### Step 3b: Evaluate Skills Against Project Goals

For each candidate, ask:

1. **Solves a real problem?** Does this skill address one of your project's goals or constraints?
2. **Reduces friction?** Does it save time on a task you'll do repeatedly?
3. **Brings risk?** Does adopting it create new dependencies, maintenance burden, or learning curves?
4. **Fits the philosophy?** Does it align with your team's approach and the project's decision preferences?

Create an evaluation table:

\`\`\`
| Skill | Problem It Solves | Effort to Implement | Ongoing Maintenance | Fit Score (1-5) | Decision |
|---|---|---|---|---|---|
| Example: Data pipeline templates | Repeatable data ETL | 2-3 days | Low | 4 | IMPLEMENT NOW |
| Example: Frontend component kit | UI consistency | 1 week | Medium | 3 | IMPLEMENT LATER |
| Example: DevOps CI/CD | Release automation | 3-4 days | Medium | 5 | IMPLEMENT NOW |
\`\`\`

**Scoring guidance:**
- **5 = Implement immediately**: Solves critical friction, low effort, clear fit
- **4 = Implement in Phase 1**: Important but can be deferred slightly
- **3 = Implement in Phase 2**: Useful but not blocking; revisit after MVP
- **2 = Implement only if time permits**: Nice-to-have; not part of core flow
- **1 = Skip for now**: Doesn't fit goals or creates risk

### Step 3c: Decide Implementation Order

Organize decisions into phases:

- **Phase 0 (right now)**: Skills needed before any real work starts (e.g., project structure, CI/CD, security checks)
- **Phase 1 (MVP launch)**: Skills that unlock the core product value
- **Phase 2 (post-MVP)**: Quality, scale, and nice-to-have improvements

Output: A \`SKILLS_REVIEW.md\` with your evaluation and phase assignments (see template below).

---

## Phase 4: Bootstrap Core Infrastructure (varies)

Implement Phase 0 skills in order:

1. **Project structure**: Ensure folders match \`PROJECT_STRUCTURE.md\`
2. **Development environment**: If applicable, set up local dev, containers, or build tooling
3. **CI/CD pipeline**: Add automated checks (tests, type checking, security scans)
4. **Collaboration rules**: Document how the team will work (e.g., PR process, code review, communication)
5. **AI operating layer**: Populate \`ai/methods/\`, \`ai/skills/\`, \`ai/workflows/\` with reusable patterns
6. **Security**: Review and complete \`SECURITY.md\` and \`PRIVACY.md\`

Only implement skills that unblock other work. Everything else goes into Phase 1 or 2.

Output: A functional development environment and documented AI layer.

---

## Phase 5: Populate Intent (20 min)

Create the first campaign or task:

1. Add \`intent/README.md\` if not present
2. Create \`intent/campaigns/\` subfolder if this is longer-term work (e.g., a product launch, research project)
3. Write the first brief or task definition that articulates what the team is building
4. Link it to the success criteria from \`PROJECT.md\`

Output: Clear written intent that drives Phase 1 work.

---

## Phase 6: Kickoff & First Sprint (1-2 hours)

- **Review** all completed documents with the team
- **Assign** first Phase 1 implementation tasks
- **Check in** on any questions or misalignments before starting real work
- **Document** any deviations from the template that make sense for this project

Output: Alignment, clear next steps, and a working team.

---

## Template: SKILLS_REVIEW.md

Use this template to record your skills discovery and decisions:

\`\`\`markdown
# Skills Review

Completed: [DATE]
Team: [NAME(S)]

## Project Goals (from PROJECT.md)

[Copy the top 3-4 goals that would benefit from repeated, documented procedures]

## Candidate Repositories & Frameworks

| Name | Domain | Purpose | Fit Score | Decision |
|---|---|---|---|---|
| [Example] | [Category] | [What it does] | [1-5] | [IMPLEMENT NOW / PHASE 1 / PHASE 2 / SKIP] |

## Phase 0: Right Now (Blocking Work)

Skills needed before any real work starts:

- [ ] [Skill name] — [Why it's critical]
- [ ] [Skill name] — [Why it's critical]

## Phase 1: MVP Launch (Core Value)

Skills for reaching MVP:

- [ ] [Skill name] — [Benefit, estimated effort]
- [ ] [Skill name] — [Benefit, estimated effort]

## Phase 2: Post-MVP (Quality & Scale)

Skills for improvement after MVP:

- [ ] [Skill name] — [Benefit, estimated effort]

## Deferred or Skipped

Repositories we decided NOT to implement (and why):

- [Name] — [Reason: complexity, not-a-fit, low priority, etc.]

## Next Steps

1. [First implementation task]
2. [Second implementation task]
3. [Review and align with team by DATE]
\`\`\`

---

## When to Use This Workflow

- **New projects**: Run the full workflow (Phases 1-6) before starting any substantive work
- **Existing projects**: Jump to Phase 3 (Discover Skills) when you realize processes are ad-hoc or repeated
- **Major pivots**: Re-run Phase 1 (Define Purpose) and Phase 3 (Discover Skills) to realign

---

## Key Principles

1. **Purpose first, tools second**: Define why the project exists before deciding how to build it
2. **Visible decisions**: Document which skills/approaches you chose and why — this helps the team stay aligned and makes knowledge reusable
3. **Phased rollout**: Don't implement everything at once; prioritize what unblocks other work
4. **Revisit regularly**: As the project matures, move items from Phase 2 to Phase 1 or Phase 0 when they become important

---

## Time Budget

| Phase | Time | Outcome |
|---|---|---|
| 1: Define Purpose | 30 min | Completed PROJECT.md |
| 2: Operating Layer | 20 min | Populated ai/context.md |
| 3: Discover Skills | 45 min | Completed SKILLS_REVIEW.md |
| 4: Bootstrap | Variable | Working dev environment |
| 5: Populate Intent | 20 min | First task/brief |
| 6: Kickoff | 1-2 hours | Team alignment |
| **Total (Phases 1-3)** | **1.5 hours** | **Ready to build** |

Start with Phases 1-3 (1.5 hours). Phase 4 depends on your project type; Phase 5-6 happen in parallel.
