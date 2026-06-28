# Project Initialization Checklist

Use this checklist to ensure a new project is fully set up and ready for productive work.

**Timeline**: ~2-3 hours for Phases 1-3, plus variable time for Phase 4

**Owner**: [Project lead name]  
**Started**: [Date]  
**Completed**: [Date]

---

## Phase 1: Define Purpose & Scope

- [ ] **PROJECT.md — Why This Exists** (5 min)
  - [ ] One clear paragraph on why the project should exist
  - [ ] Answers "Is this project solving a real problem?"

- [ ] **PROJECT.md — Main Job** (5 min)
  - [ ] Uses the formula: "This project helps {user} do {job} by {mechanism}, so that {outcome}"
  - [ ] Clear about who benefits and how

- [ ] **PROJECT.md — Ideal Final Result** (5 min)
  - [ ] Describes the perfect end state
  - [ ] Answers "What should be easy when this works?"

- [ ] **PROJECT.md — Good Result Now** (5 min)
  - [ ] Defines realistic success for current stage
  - [ ] MVP criteria are clear (not just "finish everything")

- [ ] **PROJECT.md — Success Criteria** (5 min)
  - [ ] At least 3 observable, measurable criteria
  - [ ] Each can be tracked or verified without ambiguity

- [ ] **PROJECT.md — Non-Goals** (5 min)
  - [ ] Clear about what this project is NOT
  - [ ] Prevents scope creep

- [ ] **PROJECT.md — Decision Preferences** (5 min)
  - [ ] At least 3 preferences that protect the desired outcome
  - [ ] Examples: "Prefer shipping fast over perfect", "Prefer open standards over proprietary", "Prefer proven over novel"

- [ ] **PROJECT.md — Current Focus** (5 min)
  - [ ] States what matters most right now
  - [ ] Prevents getting lost in secondary concerns

- [ ] **Team Alignment** (15 min)
  - [ ] Team has read and understood PROJECT.md
  - [ ] No major disagreements on purpose or scope

**Phase 1 Sign-Off**: [Name] on [Date] — PROJECT.md answers "why does this exist?"

---

## Phase 2: Establish AI Operating Layer

- [ ] **ai/context.md** (15 min)
  - [ ] Project purpose (one-line summary)
  - [ ] Target users or audience
  - [ ] Key constraints (budget, timeline, technical, legal)
  - [ ] Glossary of non-obvious terms
  - [ ] Important assumptions

- [ ] **RULES.md** (5 min)
  - [ ] Reviewed the default rules
  - [ ] Made edits (with human approval) if this project's philosophy differs
  - [ ] Or confirmed the defaults are suitable

- [ ] **ai/methods/** (5 min)
  - [ ] Reviewed \`ai/methods/general.md\` — does it fit this project?
  - [ ] Reviewed \`ai/methods/organization.md\` — does it fit this project?
  - [ ] Noted any deviations for later

**Phase 2 Sign-Off**: [Name] on [Date] — AI layer is set up and understood

---

## Phase 3: Discover Skills & Tools

- [ ] **Identify candidate repositories** (20 min)
  - [ ] Listed 3-5 repositories relevant to project domain
  - [ ] Includes industry-standard practices (if applicable)
  - [ ] Includes organization/team patterns (if applicable)

- [ ] **Evaluate against project goals** (20 min)
  - [ ] Scored each candidate on problem-fit, effort, maintenance, fit
  - [ ] Documented which skills would unblock work
  - [ ] Noted which skills are nice-to-have

- [ ] **Create SKILLS_REVIEW.md** (10 min)
  - [ ] Listed all candidates with fit scores
  - [ ] Assigned each to Phase 0, Phase 1, Phase 2, or Deferred
  - [ ] Team has reviewed and agreed on priorities

- [ ] **Team consensus** (10 min)
  - [ ] Team agrees on Phase 0 priorities
  - [ ] Team understands why some skills were deferred
  - [ ] No one feels surprised by the decisions

**Phase 3 Sign-Off**: [Name] on [Date] — SKILLS_REVIEW.md is complete and agreed

---

## Phase 4: Bootstrap Core Infrastructure

This phase depends heavily on project type. Check only what applies:

### If this is a software project:

- [ ] **Development environment** (30 min - 2 hours)
  - [ ] \`README.md\` explains how to set up local dev
  - [ ] Dev environment works for all team members
  - [ ] Dependencies are documented (language version, package manager, system tools)
  - [ ] \`Makefile\` or equivalent script automates setup

- [ ] **Version control** (15 min)
  - [ ] \`.gitignore\` is set up
  - [ ] \`.env.example\` shows required environment variables
  - [ ] Initial commit is clean (no secrets, binaries, or generated files)

- [ ] **Continuous Integration** (1-2 hours if Phase 0, else defer)
  - [ ] CI pipeline runs on each commit
  - [ ] Pipeline includes: type checking, linting, tests
  - [ ] Pipeline blocks merge on failure
  - [ ] Configuration is documented

- [ ] **Code organization** (30 min)
  - [ ] Folder structure matches \`PROJECT_STRUCTURE.md\`
  - [ ] No random root-level files
  - [ ] Clear separation between intent, context, output, and code

### If this is a content/creative project:

- [ ] **Asset management** (20 min)
  - [ ] Explain where source files live vs. final outputs
  - [ ] Version control strategy for large files (if needed)
  - [ ] Naming conventions are clear

- [ ] **Review & approval workflow** (30 min)
  - [ ] Document how drafts move to final
  - [ ] Who approves what?
  - [ ] How are revisions tracked?

- [ ] **Publishing workflow** (varies)
  - [ ] How does content go from "final" to "published"?
  - [ ] Who can publish? What's the review process?

### For all projects:

- [ ] **Security review** (20 min)
  - [ ] \`SECURITY.md\` is populated with basic rules
  - [ ] Team understands what's off-limits
  - [ ] No secrets are checked in

- [ ] **Privacy review** (20 min)
  - [ ] \`PRIVACY.md\` is populated with basic commitments
  - [ ] Team understands data handling rules
  - [ ] GDPR/CCPA implications noted (if applicable)

- [ ] **Collaboration rules** (20 min)
  - [ ] Decision-making process is clear (who decides what?)
  - [ ] Communication norms are documented (async vs. sync, escalation path)
  - [ ] Pull request or review process is documented

- [ ] **AI layer populated** (30 min)
  - [ ] \`ai/methods/\` has been reviewed and updated
  - [ ] \`ai/skills/\` includes at least one reusable procedure (or is marked as "to be populated")
  - [ ] \`ai/workflows/\` includes this initialization workflow for reference

**Phase 4 Sign-Off**: [Name] on [Date] — Core infrastructure works and is documented

---

## Phase 5: Populate Intent

- [ ] **intent/README.md** (5 min)
  - [ ] Explains what goes in this folder
  - [ ] Notes if work is organized by campaign or task

- [ ] **First campaign or task** (15 min)
  - [ ] Created \`intent/campaigns/[campaign-name]/\` or \`intent/tasks/[task-name].md\` for the first major piece of work
  - [ ] Brief clearly states the goal and success criteria
  - [ ] Links back to relevant \`PROJECT.md\` success criteria

- [ ] **Team alignment** (10 min)
  - [ ] Team has read the first campaign/task brief
  - [ ] Everyone understands what's being built and why
  - [ ] Owner and timeline are clear

**Phase 5 Sign-Off**: [Name] on [Date] — First work is defined and ready

---

## Phase 6: Kickoff & First Sprint

- [ ] **Full project review** (30 min)
  - [ ] Walk through PROJECT.md with the team
  - [ ] Walk through SKILLS_REVIEW.md — confirm Phase 0 & 1 priorities
  - [ ] Walk through the first campaign/task

- [ ] **Assign first work items** (20 min)
  - [ ] Phase 0 skills are assigned to owners
  - [ ] First feature or content piece has an assignee and timeline
  - [ ] Blockers are noted

- [ ] **Check for alignment** (20 min)
  - [ ] Ask: "Does everyone understand why we're doing this?"
  - [ ] Ask: "What questions do you have?"
  - [ ] Address any misalignments before starting

- [ ] **Document deviations** (10 min)
  - [ ] Note any ways this project deviates from the template
  - [ ] Add a README section or update CLAUDE.md if relevant
  - [ ] Future team members should understand the choice

- [ ] **Confirm tools & access** (15 min)
  - [ ] Everyone has access to repositories, project management, communication channels
  - [ ] Dependencies (services, APIs, databases) are accessible
  - [ ] No blockers on day 1

**Phase 6 Sign-Off**: [Name] on [Date] — Team is aligned and ready to build

---

## Post-Initialization

After initialization is complete:

- [ ] Archive this checklist or mark as done
- [ ] Update \`CLAUDE.md\` or project-specific CLAUDE.md with any deviations from the template
- [ ] Move Phase 1 & 2 skills into \`ai/skills/\` as they become reusable
- [ ] Review SKILLS_REVIEW.md quarterly; promote skills from Phase 2 to Phase 1 if priorities shift

---

## Troubleshooting

**"We don't have time to do all this"**
→ Do Phases 1-3 only (1.5 hours). Phase 4-6 can happen gradually as you build.

**"Some of our team disagreed on purpose"**
→ Pause before Phase 4. Clarify PROJECT.md. A misaligned team will thrash.

**"We can't find any relevant skills to implement"**
→ That's OK. Leave SKILLS_REVIEW.md with "Phase 1: TBD — to be identified as patterns emerge". Revisit after your first sprint.

**"This feels like extra work before we start"**
→ It is — by design. Clear intent now saves 10x the rework later. Most projects spend more time on misalignment than on initialization.

---

## Time Budget Summary

| Phase | Time | Outcome |
|---|---|---|
| 1: Define Purpose | ~30 min | Completed PROJECT.md |
| 2: Operating Layer | ~20 min | Populated ai/context.md |
| 3: Discover Skills | ~45 min | Completed SKILLS_REVIEW.md |
| 4: Bootstrap | Variable | Working dev environment |
| 5: Populate Intent | ~20 min | First task/brief |
| 6: Kickoff | ~1.5 hours | Team alignment |
| **Phases 1-3** | **~1.5 hours** | **Ready to build** |
| **All phases** | **3-5 hours + project setup** | **Fully operational** |

Start Phases 1-3 immediately. Phase 4 depends on your project type; Phases 5-6 happen in parallel with Phase 4.
