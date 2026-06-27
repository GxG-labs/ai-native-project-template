# Skills Discovery & Evaluation Method

When starting a project or realizing processes are ad-hoc, use this method to identify which practices, tools, and templates should be documented as reusable skills.

## What Is a "Skill" in This Project?

A skill is a documented, repeatable procedure that:

1. **Solves a specific problem** your team encounters repeatedly (e.g., "set up a new API endpoint", "create a test suite", "write structured data templates")
2. **Has clear steps** that can be followed mechanically, with minimal decision-making
3. **Reduces friction** compared to doing it ad-hoc each time
4. **Lives in \`ai/skills/\`** where it's easy to find and reuse

Skills are NOT:
- One-off scripts or utilities
- Raw source code or implementation details
- General-purpose frameworks (those go in \`src/\` or \`docs/\`)
- Incomplete experiments or work-in-progress ideas

---

## The Discovery Process

### Step 1: Identify Your Project's Repeating Patterns

Ask the team:

**"What tasks will we do many times before this project is done?"**

Write them down in a list. Examples:

- Setting up a new feature or component
- Writing tests
- Deploying changes
- Onboarding a new team member
- Creating a new data schema
- Reviewing code for security issues
- Creating API documentation
- Generating reports

### Step 2: Find Existing Solutions

For each repeating task, answer:

1. **Does it have a template already?** (e.g., feature branch naming, component structure)
2. **Is there a proven pattern in our org or industry?** (e.g., well-documented API gateway, load-balancing strategy)
3. **Does an open-source repository solve this?** (e.g., andrej-karpathy-skills for ML, vscode-samples for extensions)
4. **Do we have code that does this?** (e.g., an example API endpoint, a test fixture)

**Where to search:**

- GitHub: Use domain + "skills" or "template" (e.g., "react-component-skills", "kubernetes-templates")
- Organization repos: Search your company or team GitHub for example implementations
- Industry playbooks: Consultant agencies often publish checklists and procedures
- Tool docs: Major frameworks (Django, Next.js, Kubernetes) include best-practice guides
- Academic papers: For novel problems, research papers often describe replicable procedures

### Step 3: Evaluate Fit & Effort

For each candidate skill or pattern, score it on:

| Criterion | Scoring | Why It Matters |
|---|---|---|
| **Problem Fit** | Does it solve one of your repeating tasks? | Only implement skills that actually unblock work |
| **Effort to Implement** | How much work to adapt it to your project? (1=trivial, 5=weeks) | High-effort skills should be deferred or skipped |
| **Ongoing Maintenance** | Will it require updates as your project evolves? (1=never, 5=constantly) | High-maintenance skills become technical debt |
| **Team Buy-In** | Does the team agree this is a real problem? | Forcing an unwanted process creates friction |
| **Strategic Importance** | Does this skill unblock other important work? | Some skills are blockers; others are nice-to-have |

**Decision matrix:**

\`\`\`
Effort Low, Fit High, Maintenance Low, Strategic High → IMPLEMENT IMMEDIATELY
Effort Low, Fit High, Maintenance High, Strategic Low → IMPLEMENT IF TIME PERMITS
Effort High, Fit High, Maintenance Low, Strategic High → IMPLEMENT SOON (PHASE 1)
Effort High, Fit High, Maintenance High, Strategic High → IMPLEMENT GRADUALLY (PHASE 2+)
Effort High, Fit Low, Maintenance High, Strategic Low → SKIP
\`\`\`

### Step 4: Prioritize by Phase

Organize decisions into phases, as defined in the \`initialize-project.md\` workflow:

**Phase 0 (Right Now)**: Skills that block other work
- Example: "Create a new API endpoint" (must work before building features)
- Example: "Set up the development environment" (must work before writing code)

**Phase 1 (MVP Launch)**: Skills that deliver core product value
- Example: "Write a feature test suite"
- Example: "Create database migrations safely"

**Phase 2+ (Post-MVP)**: Quality, scale, and nice-to-have improvements
- Example: "Performance profiling"
- Example: "Load testing"

---

## Documenting a Skill

Once you've decided to implement a skill, create a file in \`ai/skills/\` following this structure:

\`\`\`markdown
# [Skill Name]

**Problem**: [What repeating task does this solve?]
**When to use**: [Which phases/projects?]
**Effort to learn**: [First time: X min, subsequent: Y min]

## Steps

1. [Clear, sequential step]
2. [Next step]
3. [Final step]

## Example

[Walk through a concrete example, copy-paste-able if possible]

## Common Pitfalls

- [Mistake people make]
- [Why it causes problems]
- [How to avoid it]

## When NOT to Use

[Conditions where this skill doesn't apply, or when to use an alternative]

## Links & References

- [Link to related skill or documentation]
- [Link to external standard or example]
\`\`\`

---

## When to Review & Update Skills

- **After the first person uses a skill** (other than the creator): Ask for feedback. Did they find it clear? Did they get stuck?
- **After a tool or framework changes**: If the skill depends on external dependencies, update it
- **When a pattern repeats** that isn't documented: Add it as a new skill
- **Quarterly or per-sprint**: Review all skills; deprecate ones that are no longer used

---

## Connecting Skills to Project Goals

Map each skill to the project's goals from \`PROJECT.md\`:

Example:

| Skill | Supports Goal | Effort | Phase |
|---|---|---|---|
| "Set Up TypeScript Project" | "Ensure type safety" | 15 min | Phase 0 |
| "Write Integration Tests" | "Deliver reliable features" | 30 min | Phase 1 |
| "Profile Frontend Performance" | "Keep bundle size <100KB" | 20 min | Phase 2 |

This ensures skills stay aligned with what actually matters.

---

## Anti-Pattern: Too Many Skills Too Soon

Resist the urge to document every single procedure as a skill. Wait until:

1. You've **done it at least twice** (not just once)
2. You can **articulate the steps clearly** (not just "you'll figure it out")
3. **Other people benefit** from the documentation (not just you)

Premature skill documentation creates maintenance burden without benefit.

---

## Promoting Code to a Skill

If you have working code (e.g., an example API endpoint, a test fixture), and it could be reused:

1. **Extract the pattern**: What parts of the code are template/boilerplate? What parts are project-specific?
2. **Write the skill procedure**: Document the steps to apply the pattern
3. **Include a worked example**: Show how to apply it to a real case
4. **Keep the code reference**: Link to the implementation so people can study it

Example:

> **Skill**: Create a New API Endpoint
> 
> **Steps**:
> 1. Copy \`src/api/templates/endpoint.ts\` to \`src/api/[feature]/index.ts\`
> 2. Replace \`{FEATURE}\` with your feature name
> 3. Update \`src/api/index.ts\` to export your endpoint
> 4. Run tests: \`npm test -- api/[feature]\`
> 
> **Reference implementation**: See \`src/api/users/\` for a complete example

---

## Links & Examples

- See \`ai/workflows/initialize-project.md\` for the full project initialization workflow, including the skills discovery phase
- Example skills repository: https://github.com/multica-ai/andrej-karpathy-skills (ML/AI focused)
- Related: \`ai/methods/organization.md\` — where to place skills in the project structure
