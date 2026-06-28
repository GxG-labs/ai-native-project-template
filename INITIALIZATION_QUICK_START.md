# Project Initialization — Quick Start

New to this template? Use this guide to get your project off the ground in 1.5-5 hours.

## What You're About to Do

You're going to:
1. Define why your project exists
2. Decide which repeatable processes (skills) to implement
3. Set up your project structure and AI operating layer
4. Get your team on the same page

This prevents misalignment and rework later.

## The 1.5-Hour Path (Phases 1-3 Only)

If you're in a hurry, start with these three phases. They take ~90 minutes and will get you ready to build.

**Phase 1: Define Purpose (30 min)**
1. Open \`PROJECT.md\`
2. Fill in each section: Why, Job, Final Result, Good Result Now, Success Criteria, Non-Goals, Decision Preferences, Current Focus
3. **Output**: You can now explain to anyone why this project should exist

**Phase 2: Set Up AI Layer (20 min)**
1. Open \`ai/context.md\`
2. Add: project purpose, target users, key constraints, glossary, assumptions
3. **Output**: AI assistants (and new team members) know what not to assume

**Phase 3: Discover & Choose Skills (45 min)**
1. Read \`ai/methods/skills-discovery.md\` (~10 min)
2. Identify 3-5 relevant repositories or skill collections for your domain
3. Score each on fit, effort, and maintenance
4. Create \`SKILLS_REVIEW.md\` using the template in \`ai/workflows/initialize-project.md\`
5. **Output**: You've made explicit decisions about which practices to standardize

→ **You're now ready to build.** Proceed with Phase 4, or skip to your first sprint.

## The Full 5-Hour Path (All Phases)

For a more complete setup, continue with Phases 4-6:

**Phase 4: Bootstrap Infrastructure (1-2 hours, varies by project type)**
- Set up development environment
- Add version control, CI/CD, security rules
- Organize folder structure
- Document collaboration norms

**Phase 5: Populate Intent (20 min)**
- Create your first task or campaign brief
- Link it to success criteria in PROJECT.md

**Phase 6: Kickoff (1.5 hours)**
- Team review of PROJECT.md and SKILLS_REVIEW.md
- Assign first work items
- Confirm alignment and tools

→ **Your project is fully operational.**

## The Files You'll Read & Edit

### Must Read First
- \`PROJECT.md\` — The one file everyone reads (filled in during Phase 1)

### During Initialization
- \`ai/workflows/initialize-project.md\` — The full 6-phase workflow
- \`ai/methods/skills-discovery.md\` — How to evaluate skills for your domain
- \`ai/checklists/project-initialization.md\` — Detailed checklist for each phase

### Will Create
- \`SKILLS_REVIEW.md\` — Your decisions about which skills to implement (created in Phase 3)
- \`ai/context.md\` — What AI assistants should remember (filled in Phase 2)

### May Update
- \`RULES.md\` — Operating principles (human-curated; edit only with explicit approval)
- \`SECURITY.md\` and \`PRIVACY.md\` — Security and data handling rules (Phase 4)

## Example: Initializing a Data Science Project

**Phase 1** (30 min):
- Purpose: "Help data teams build and deploy models faster by standardizing our processes"
- Main job: "Helps data engineers do end-to-end ML development by providing templates and runbooks, so that we ship models in days not months"
- Success criteria: (1) First model deployed in <1 week, (2) <2 deployment failures per release, (3) New team members productive in <3 days

**Phase 2** (20 min):
- Key constraints: "Must work offline (no internet)", "Must support GPU and CPU nodes"
- Assumptions: "Team has Python 3.11+", "We use DuckDB for analytics"

**Phase 3** (45 min):
- Review candidate skills:
  - ✅ [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) (ML workflow templates) — Fit: 5, Effort: 2, Phase 0
  - ✅ [cookiecutter-data-science](https://github.com/drivendata/cookiecutter-data-science) (project template) — Fit: 5, Effort: 1, Phase 0
  - ⏸ [MLflow](https://mlflow.org/) (experiment tracking) — Fit: 4, Effort: 3, Phase 1
  - ⏸ Ray Tuning (hyperparameter optimization) — Fit: 3, Effort: 4, Phase 2+

→ Phase 0: Use cookiecutter template + andrej-karpathy patterns  
→ Phase 1: Integrate MLflow  
→ Phase 2+: Evaluate Ray Tuning

**Phase 4** (2 hours):
- Set up development environment (Python, GPU drivers, DuckDB)
- CI/CD: Add automated model validation before merge
- Document: "How to Run a Training Job" as a skill in \`ai/skills/\`

**Phase 5** (20 min):
- First task: "Build a churn prediction model"
- Links to success criteria: "Deploy model in <1 week" (criteria #1)

**Phase 6** (1.5 hours):
- Team alignment: Everyone agrees on the data pipeline
- Start building

**Total time: ~5 hours. You now have a standard process for every future model.**

---

## FAQ

**Q: Do I really need all this before writing code?**
→ At minimum, Phases 1-3 (90 min). They prevent thrashing. Phase 4 can happen alongside your first sprint.

**Q: What if my team disagrees on the project's purpose?**
→ Stop before Phase 4. Clarify PROJECT.md. A misaligned team thrashes more than an under-prepared one.

**Q: We already have some code/templates. Do we restart?**
→ No. Jump to Phase 2. Use Phase 3 to catalog what you've already done and make decisions about what's reusable.

**Q: Can we skip skills discovery?**
→ If your domain has no established practices (novel research), yes — skip Phase 3. If your domain is mature (web, ML, data), Phase 3 saves weeks of rework.

**Q: How often do we revisit this?**
→ Major pivots: re-run Phases 1 and 3. Quarterly: review SKILLS_REVIEW.md and move Phase 2 items to Phase 1 if priorities shift.

---

## Next Steps

1. **Pick your path**: 90 minutes (Phases 1-3) or 5 hours (Phases 1-6)?
2. **Open \`ai/workflows/initialize-project.md\`** and follow the instructions
3. **Use \`ai/checklists/project-initialization.md\`** to track progress
4. **When done**: Share PROJECT.md and SKILLS_REVIEW.md with your team for alignment

Good luck! 🚀
