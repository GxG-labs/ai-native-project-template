# Project Structure Specification

This template is designed as an AI-native project workspace for software projects, AI agents, marketing systems, research pipelines, personal assistants, document automation, presentations, and other human-facing deliverables.

The main goal is not to create many folders. The goal is to make every project easy to understand, extend, audit, and hand over to another person or AI agent.

The structure follows one core rule:

> Separate intent, sources, working analysis, reusable knowledge, executable instructions, implementation, and final deliverables.

This prevents the common failure mode where briefs, downloaded PDFs, prompt experiments, code, final presentations, and temporary exports all end up in the same place.

## Design Principles

### 1. Visible AI Layer

AI instructions are stored in a visible `ai/` folder, not in a hidden `.ai/` folder.

This is intentional. In this template, AI instructions, skills, playbooks, workflows, and agent definitions are first-class project assets. They are not editor metadata or private tool configuration.

Files such as `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` should stay thin. They should only point each LLM system to the shared project AI layer:

```md
Start with `PROJECT.md`.
Use the project AI system in `ai/`.
Start with `ai/README.md`.
```

This keeps `ai/` as the single source of truth. Project skills and operating rules are edited once and reused across Codex, Claude, Gemini, and other assistants.

### 2. Human And Agent Readability

The project should be understandable both to a human teammate and to an AI agent.

A new reader should quickly answer:

- What is this project trying to do?
- What inputs were provided?
- What external sources were used?
- What has already been learned?
- What reusable methods or playbooks exist?
- What agents or workflows are available?
- Where is the implementation?
- Where are the final outputs?

### 3. Docs Are Stable Project Knowledge

`docs/` is reserved for accepted, cleaned, stable documentation about the project or system.

It should not contain random downloaded articles, task briefs, raw notes, scratch research, or one-off exports.

Those belong in purpose-specific folders such as `briefs/`, `references/`, `research/`, and `artifacts/`.

The distinction between `docs/` and `ai/` is not about the reader. Both folders should be readable by humans and AI agents.

The distinction is about purpose:

- `docs/` describes how the project or system works.
- `ai/` describes how AI assistants should work with the project or system.

### 4. Reproducibility

Every important result should be traceable:

- From a brief or task request.
- Through input data and reference materials.
- Through research or analysis.
- Through a workflow, skill, script, or agent.
- Into a final artifact.

The template should make it possible to return to a project months later and understand how a report, presentation, assistant, automation, or software feature was produced.

### 5. Private By Default, GitHub-Ready When Needed

The template assumes many projects will be private, client-related, or personally sensitive.

It should protect secrets, local data, raw exports, and temporary files by default, while still being organized enough to publish safely on GitHub when appropriate.

### 6. Lazy Folder Creation

New projects should not start with dozens of empty folders.

The template defines a full reference structure, but a new project should begin with the smallest useful set of files and folders. Additional folders are created only when a real file needs a home or when a workflow makes that folder necessary.

The full tree acts as a catalog of allowed locations, not as a requirement to create everything upfront.

This keeps new projects lightweight while preserving a consistent architecture as they grow.

## Recommended Top-Level Structure

This is the full reference structure. It documents where things should go when they exist.

Do not create every folder automatically for every new project.

The structure has three levels:

- Core: created for every project.
- Standard: created lazily during normal growth.
- Advanced: created only when project scale justifies it.

```text
project/
  PROJECT.md
  README.md
  PROJECT_STRUCTURE.md
  AGENTS.md
  CLAUDE.md
  GEMINI.md
  SECURITY.md
  PRIVACY.md
  .gitignore
  .env.example

  ai/
  workbench/
  briefs/
  references/
  research/
  docs/
  artifacts/
  data/
  src/
  modules/
  config/
  scripts/
  tests/
  tasks/
  evals/
  templates/
  examples/
  tmp/
```

## Structure Levels

### Core

Core files and folders exist in every project:

```text
README.md
PROJECT.md
PROJECT_STRUCTURE.md
AGENTS.md
CLAUDE.md
GEMINI.md
SECURITY.md
PRIVACY.md
.gitignore
.env.example
ai/
workbench/
briefs/
```

Core gives the project identity, safety rules, AI operating rules, a temporary workbench, and a home for intent.

### Standard

Standard folders are created lazily in most real projects:

```text
references/
research/
artifacts/
data/
src/
docs/
tests/
```

These cover the common lifecycle: sources, analysis, outputs, data, implementation, stable documentation, and verification.

### Advanced

Advanced folders are created only when the project is large enough to benefit from them:

```text
modules/
tasks/
templates/
evals/
scripts/
config/
examples/
```

These are useful for modular systems, repeated work formats, AI evaluation, local task management, and template repositories. They should not be created just to make the repository look complete.

## Minimal Starter Structure

Every new project should start with this minimal structure:

```text
project/
  PROJECT.md
  README.md
  PROJECT_STRUCTURE.md
  AGENTS.md
  CLAUDE.md
  GEMINI.md
  SECURITY.md
  PRIVACY.md
  .gitignore
  .env.example

  ai/
    README.md
    constitution.md
    project-context.md
    instructions/
      general.md
      organization.md

  workbench/
    README.md
    input/
      README.md
    output/
      README.md

  briefs/
```

Why this minimum exists:

- `PROJECT.md` defines why the project exists, what its main job is, and what success means.
- `README.md` gives the project a top-level entry point.
- `PROJECT_STRUCTURE.md` preserves the structural rules and future folder catalog.
- `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` point all major assistants to the same AI layer.
- `SECURITY.md` and `PRIVACY.md` establish safe handling rules before sensitive work starts.
- `.gitignore` and `.env.example` establish privacy and reproducibility from day one.
- `ai/README.md` tells assistants how to use the project AI system.
- `ai/constitution.md` defines the project operating principles.
- `ai/project-context.md` keeps stable project facts in one compact place.
- `ai/instructions/general.md` defines default AI behavior.
- `ai/instructions/organization.md` gives assistants the short anti-sprawl rules.
- `workbench/input/` is the default drop zone for files provided for the current task.
- `workbench/output/` is the default place for intermediate generated results.
- `briefs/` gives human intent a proper home.

All other folders are created lazily.

## Lazy Creation Rules

Create a folder only when at least one of these is true:

- A real file needs to be stored there now.
- A workflow needs the folder as an expected input or output location.
- The folder clarifies a module boundary.
- The folder prevents mixing materials with different lifecycles.
- The folder is required by a tool, framework, or deployment target.

Do not create a folder merely because it exists in the reference structure.

When a new folder is created, add a short `README.md` if the folder's purpose would not be obvious to a new teammate or AI assistant.

## Anti-Sprawl Controls

Use these controls to keep a growing project organized:

1. New folders must represent a lifecycle, boundary, or tool requirement.
   Do not create folders for vague convenience.

2. Before creating a folder, check `ai/instructions/organization.md` and this file's classification rules.

3. If two folders start serving the same purpose, merge the concept and update the documentation.

4. If a folder contains mixed lifecycles, split by role:
   input, source, analysis, reusable method, code, stable docs, output, or temporary work.

5. Run a structure review before major handoff, publication, or system expansion.

6. Prefer fewer folders with clear lifecycle rules over many folders with unclear boundaries.

## Folder Responsibilities

### `ai/`

Project AI operating system.

This folder contains the shared instructions, skills, playbooks, workflows, checklists, agent definitions, and project context used by AI assistants.

A file or subfolder belongs in `ai/` only if it directs future AI work.

The practical test is:

> If an AI assistant starts a new task tomorrow, should it read this as a rule, method, role, workflow, checklist, reusable skill, or durable project context?

If yes, it belongs somewhere under `ai/`.

If the file is merely an input, source, working note, dataset, implementation file, system documentation, temporary file, or final deliverable, it should not be placed in `ai/`.

Use this folder for:

- Project-wide AI instructions.
- Codex, Claude, Gemini, and other LLM-neutral rules.
- Reusable skills.
- Playbooks derived from research.
- Agent definitions.
- Workflow descriptions.
- Checklists.
- Project facts, assumptions, and glossary.

Do not use this folder for:

- Raw downloaded references.
- Client source documents.
- Final deliverables.
- Application source code, unless the code is specifically part of an AI skill package.

Recommended structure:

```text
ai/
  README.md
  constitution.md
  project-context.md
  instructions/
  playbooks/
  skills/
  workflows/
  checklists/
  agents/
```

Why this folder exists:

AI-assisted projects need durable operating rules. If these rules are scattered across chat history, tool-specific files, and ad hoc prompts, the project becomes hard to maintain. `ai/` makes the project intelligence explicit, portable, and reviewable.

Why it is named `ai/`:

The folder is visible because AI behavior is part of the project, not hidden tool metadata. The name is short, direct, and easy for agents and humans to find.

### `workbench/`

Temporary working area for the current task.

Use this folder when the user wants a simple physical drop zone and output zone without deciding the final project classification upfront.

Recommended structure:

```text
workbench/
  README.md
  input/
    README.md
  output/
    README.md
```

Use `workbench/input/` for:

- Files manually dropped into the project for the current task.
- Mixed file types that have not yet been classified.
- One-off source files that may be deleted after the task.
- Temporary inputs when the user has not specified a more precise path.

Use `workbench/output/` for:

- Intermediate generated files.
- Converted versions.
- Draft transformations.
- Temporary compilations.
- Working outputs that are not yet accepted final artifacts.

Default assistant rule:

> If the user asks to work with files but does not specify where the files are, first inspect `workbench/input/`.

> If the assistant creates intermediate results and the user does not specify an output path, place them in `workbench/output/`.

Promotion rule:

Files should not stay in `workbench/` once they become durable project assets.

Move or copy them to:

- `references/` if they are external sources worth preserving.
- `data/input/` if they are structured project data.
- `research/` if they are working analysis or findings.
- `artifacts/drafts/` if they are draft deliverables.
- `artifacts/final/` if they are accepted final deliverables.
- `docs/` if they become stable project documentation.
- `ai/playbooks/`, `ai/skills/`, or `ai/workflows/` if they become reusable AI operating knowledge.

Why this folder exists:

Real AI-assisted work often begins with messy files dropped into a folder. `workbench/` preserves that convenience while preventing root-level `input/` and `output/` from becoming ambiguous long-term storage.

Git rule:

Keep the folders, ignore their contents by default.

### `ai/constitution.md`

Project operating constitution for AI-assisted work.

Use this file for high-level rules that should guide every assistant and every contributor:

- How much autonomy an assistant has.
- When an assistant should ask questions before acting.
- What counts as a good result.
- How to handle uncertainty.
- How to protect private data.
- How to document decisions.
- How to distinguish quick experiments from durable work.

Why this file exists:

Instructions can become scattered and tactical. The constitution defines the project's stable operating philosophy. It should be short, explicit, and hard to accidentally override.

### `ai/project-context.md`

Stable project facts and shared context.

Use this file for:

- Project facts.
- Glossary.
- Stakeholders.
- Strategic assumptions.
- Durable context that AI assistants should remember.

Why this file exists:

Some information is neither a brief nor documentation nor a skill. It is durable context that helps assistants behave consistently across sessions.

Keep this as one file until it becomes too large. Only then split it into a folder such as `ai/context/`.

### `ai/instructions/`

General operating instructions for AI assistants.

Use this folder for stable behavioral rules that apply across many tasks:

- Coding standards.
- Document handling rules.
- Presentation creation rules.
- Data analysis rules.
- Marketing work rules.
- Security and privacy rules.
- Review expectations.

Example files:

```text
ai/instructions/general.md
ai/instructions/coding.md
ai/instructions/documents.md
ai/instructions/presentations.md
ai/instructions/data-analysis.md
ai/instructions/security.md
```

Why this folder exists:

Instructions describe how assistants should behave in the project. They are broader than a single skill and should not be mixed with source code or final documentation.

### `ai/playbooks/`

Reusable domain knowledge and best-practice summaries.

A playbook is a distilled guide for how to approach a type of work. It is more structured and opinionated than raw research, but less executable than a skill.

Use this folder for:

- CV optimization principles.
- Marketing research methods.
- Brand positioning frameworks.
- Presentation quality principles.
- Interview preparation methods.
- Content strategy rules.
- Any compact guide created by synthesizing multiple sources.

Example:

```text
ai/playbooks/cv-optimization.md
```

In the CV example:

- Downloaded articles and posts go to `references/cv-optimization/`.
- Working notes and comparisons go to `research/cv-optimization/`.
- The distilled method goes to `ai/playbooks/cv-optimization.md`.
- An executable AI routine goes to `ai/skills/tailor-cv-for-job/`.

Why this folder exists:

Many projects produce knowledge that is not documentation of the system and not yet an executable skill. `ai/playbooks/` gives this knowledge a proper home.

### `ai/skills/`

Reusable task-specific AI capabilities.

A skill tells an AI assistant how to perform a repeatable task. It should be concrete enough that an agent can follow it without re-deriving the method every time.

Use this folder for:

- CV tailoring workflow.
- Research report synthesis.
- Presentation generation.
- Dataset analysis.
- Marketing campaign planning.
- Competitive analysis.
- Personal assistant routines.
- Agent design procedures.

Recommended structure:

```text
ai/skills/
  tailor-cv-for-job/
    SKILL.md
    config.yaml
  build-research-deck/
    SKILL.md
    config.yaml
  analyze-marketing-data/
    SKILL.md
    config.yaml
```

Why this folder exists:

Skills are the operational layer between human knowledge and automated execution. They should be versioned with the project and kept independent from any specific LLM vendor.

Skill governance:

Every skill should have a clear scope. A skill should not be a random prompt collection.

Each skill should define:

- Purpose.
- Inputs.
- Outputs.
- Required context.
- Step-by-step procedure.
- Tools or capabilities it may use.
- Quality checks.
- Failure modes.
- Example usage.

Create a new skill only when the task is repeatable enough that the project benefits from preserving the method.

### `ai/agents/`

Definitions of project-specific AI agents.

Use this folder for agent roles, responsibilities, boundaries, tools, inputs, outputs, and escalation rules.

Examples:

```text
ai/agents/personal-assistant.md
ai/agents/research-agent.md
ai/agents/marketing-operator.md
ai/agents/deck-builder.md
```

Why this folder exists:

An agent is not just a prompt. It has a role, operating scope, expected outputs, and constraints. Keeping agent definitions here makes a modular marketing system easier to reason about and hand over.

This is an advanced folder. Create it only when the project has multiple named agent roles or agent boundaries that need to be maintained.

### `ai/workflows/`

Repeatable multi-step processes.

Use this folder for task flows that may involve several skills, agents, scripts, datasets, documents, or external tools.

Examples:

```text
ai/workflows/create-research-report.md
ai/workflows/create-presentation.md
ai/workflows/analyze-dataset.md
ai/workflows/launch-marketing-campaign.md
```

Why this folder exists:

Workflows describe orchestration. They answer "what happens first, next, and last" across a larger process. They are not the same as skills, which are narrower task capabilities.

### `ai/checklists/`

Reusable quality standards and completion checklists.

Use this folder for:

- Definition of done.
- Review checklists.
- Artifact quality checklists.
- Presentation QA rules.
- Data analysis validation rules.
- Security review rules.

Example files:

```text
ai/checklists/definition-of-done.md
ai/checklists/review-checklist.md
ai/checklists/artifact-checklist.md
```

Why this folder exists:

AI-generated work needs explicit quality gates. This folder makes review standards durable instead of relying on vague expectations.

### `briefs/`

Task statements, project requests, requirements, and human intent.

Use this folder for:

- Initial project briefs.
- Client requests.
- Internal task definitions.
- Feature requests.
- Marketing campaign briefs.
- Research questions.
- Personal automation requests.

Example files:

```text
briefs/2026-06-cv-optimization.md
briefs/2026-06-marketing-agent-system.md
briefs/2026-06-research-deck.md
```

Why this folder exists:

Briefs are input, not documentation. They describe what someone asked for, not necessarily what the final system became. Keeping them separate preserves the original intent without polluting stable docs.

### `tasks/`

Managed work items derived from briefs, decisions, bugs, experiments, or project goals.

This is an advanced folder. Create it only when local task tracking is more useful than keeping the work in the brief, GitHub issues, or an external task manager.

Use this folder for:

- Backlog items.
- Active task definitions.
- Implementation plans.
- Task-level acceptance criteria.
- Completed task summaries.

Recommended structure when needed:

```text
tasks/
  README.md
  backlog/
  active/
  done/
```

Why this folder exists:

`briefs/` captures intent. `tasks/` turns intent into managed work. This distinction matters when a large brief produces many implementation tasks, research tasks, artifact tasks, or agent-building tasks.

Do not create `tasks/` for tiny one-off projects unless task tracking is actually useful.

### `references/`

External source materials.

Use this folder for raw or lightly organized materials gathered from outside the project:

- Downloaded articles.
- PDF guides.
- Blog posts.
- Screenshots.
- Competitor examples.
- Public research.
- Vendor docs snapshots.
- Inspiration files.
- Benchmark examples.

Example:

```text
references/
  cv-optimization/
    articles/
    posts/
    guides/
    examples/
  competitor-research/
  presentation-examples/
```

Why this folder exists:

References are evidence and background material. They are not the project's own conclusions. Separating them protects the project from mixing raw source material with accepted guidance.

### `research/`

Working analysis, synthesis, findings, and investigation notes.

Use this folder for:

- Notes created while studying references.
- Source comparisons.
- Findings.
- Research synthesis.
- Exploratory analysis.
- Draft conclusions.
- Method notes.

Example:

```text
research/
  cv-optimization/
    notes.md
    findings.md
    source-comparison.md
  market-analysis/
    findings.md
```

Why this folder exists:

Research is where raw sources become understanding. It is more processed than `references/`, but less stable than `docs/` or `ai/playbooks/`.

### `docs/`

Stable project and system documentation.

Use this folder for accepted, maintained documentation about how the project works. This documentation is intended for both humans and AI agents.

- Architecture.
- Operations.
- User guides.
- API documentation.
- System overview.
- Decision records.
- Maintenance guides.

Recommended structure:

```text
docs/
  README.md
  architecture/
  decisions/
  operations/
  operations/runbooks/
  guides/
```

Why this folder exists:

`docs/` is the clean manual for the project. It should describe the current accepted state of the system, not contain every document-like file.

`docs/` does not define AI behavior. AI behavior, agent roles, workflows, skills, and checklists belong in `ai/`.

Decision records:

Important architectural, operational, and organizational decisions should be recorded in `docs/decisions/`.

Recommended format:

```text
docs/decisions/0001-use-visible-ai-folder.md
docs/decisions/0002-separate-references-from-research.md
```

Each decision record should include:

- Context.
- Options considered.
- Decision.
- Consequences.

Runbooks:

Operational procedures should live in `docs/operations/runbooks/`.

Examples:

```text
docs/operations/runbooks/create-new-module.md
docs/operations/runbooks/release-artifact.md
docs/operations/runbooks/rotate-secrets.md
```

A runbook answers "what should be done in this situation?" It is system documentation, not AI behavior. If a runbook requires AI-specific execution rules, link to the relevant `ai/workflows/` file.

What should not go here:

- Raw briefs.
- Downloaded articles.
- Scratch notes.
- Draft reports.
- Client source files.
- Temporary exports.

### `artifacts/`

Human-facing outputs and deliverables.

Use this folder for files produced by the project:

- Presentations.
- Reports.
- PDFs.
- DOCX files.
- Spreadsheets.
- Exported images.
- Generated decks.
- Client-ready files.
- Draft and final deliverables.

Recommended structure:

```text
artifacts/
  README.md
  registry.md
  drafts/
  final/
  exports/
```

Why this folder exists:

Deliverables need a place separate from source data, code, and documentation. This keeps final outputs easy to find and prevents them from being confused with inputs.

Artifact registry:

For projects that produce multiple deliverables, maintain:

```text
artifacts/registry.md
```

Use it to track:

- Artifact name.
- Status.
- Owner or recipient.
- Source brief or task.
- Inputs used.
- Current final location.
- Publication or sharing restrictions.

### `data/`

Structured project data.

Use this folder for datasets, tables, extracts, and structured files used by scripts, agents, analyses, or applications.

Recommended structure:

```text
data/
  input/
  working/
  processed/
  reference/
```

Folder meaning:

- `data/input/`: structured input data received or collected for the project.
- `data/working/`: intermediate data created during processing.
- `data/processed/`: cleaned or transformed datasets.
- `data/reference/`: stable lookup tables, taxonomies, or reusable structured references.

Why this folder exists:

Data has different lifecycle rules than documents or references. A CSV used by an analysis should not be hidden among PDFs, briefs, or final presentations.

### `src/`

Primary source code.

Use this folder for application code, libraries, backend logic, frontend code, data processing code, agent runtime code, or automation code.

Examples:

```text
src/
  app/
  lib/
  server/
  workers/
```

Why this folder exists:

Many projects will include real software. `src/` gives implementation code a conventional, recognizable home without forcing every project to be software-only.

### `modules/`

Project modules with a shared internal pattern.

Use this folder for larger functional units in a modular system, especially when building a marketing operating system, agent suite, or multi-part automation.

Examples:

```text
modules/
  research-agent/
  deck-generator/
  content-pipeline/
  lead-analysis/
  cv-optimizer/
```

Each module may contain its own README, source code, tests, local configs, workflows, or artifacts, depending on scope.

Why this folder exists:

Some systems are not a single app. A modular AI marketing system may contain many capabilities that need consistent organization. `modules/` makes those boundaries visible.

### `config/`

Project configuration that is safe to version.

Use this folder for:

- Non-secret configuration.
- Tool settings.
- Agent runtime config templates.
- Pipeline config.
- Environment-specific examples.
- Mapping files.

Do not put secrets here. Secrets belong in local environment files that are ignored by Git.

Why this folder exists:

Configuration should be easy to inspect and version when it is not sensitive. Keeping it separate from code and AI instructions makes operational behavior clearer.

### `scripts/`

Utility scripts and operational helpers.

Use this folder for:

- One-off helpers.
- Import/export scripts.
- Data conversion utilities.
- Maintenance scripts.
- Local automation commands.
- Setup helpers.

Why this folder exists:

Projects often need useful commands that are not part of the main application. `scripts/` keeps them discoverable without mixing them into `src/`.

### `tests/`

Tests and verification assets.

Use this folder for:

- Unit tests.
- Integration tests.
- Snapshot tests.
- Fixture-based checks.
- Workflow verification.
- Artifact validation scripts.

Why this folder exists:

Even AI-heavy and document-heavy projects need verification. Tests make behavior repeatable and protect against regressions.

### `evals/`

AI and artifact evaluation layer.

This is an advanced folder. Create it when AI behavior or artifact quality needs repeatable evaluation beyond ordinary tests and checklists.

Use this folder for:

- Prompt or agent evaluation cases.
- Expected outputs.
- Rubrics.
- Quality criteria.
- Regression checks for AI behavior.
- Evaluation results.
- Human review notes for generated artifacts.

Recommended structure when needed:

```text
evals/
  README.md
  criteria/
  cases/
  results/
```

Why this folder exists:

AI-native projects need a way to judge whether outputs are improving or degrading. `tests/` verifies software behavior; `evals/` evaluates AI behavior, reasoning quality, factuality, usefulness, style, and artifact quality.

### `templates/`

Reusable file templates.

This is an advanced folder. Create it when repeated file formats are emerging and copy-pasting old files is starting to create inconsistency.

Use this folder for:

- Brief templates.
- Project charter templates.
- Task templates.
- Decision record templates.
- Module README templates.
- Skill templates.
- Playbook templates.
- Workflow templates.
- Artifact release note templates.

Example:

```text
templates/
  project-charter.md
  brief.md
  task.md
  decision-record.md
  module-readme.md
  skill.md
  playbook.md
  workflow.md
  artifact-release-note.md
```

Why this folder exists:

Consistency should not depend on memory. Templates make new project elements easy to create in the same format every time.

### `examples/`

Reference examples showing correct use of the template.

This is usually a template-repository folder, not a normal project folder. In a project created from the template, create `examples/` only when examples are part of the actual project deliverable or onboarding material.

Use this folder for:

- Example project slices.
- Example module layouts.
- Example AI skills.
- Example research-to-playbook transformations.
- Example artifact release records.

Examples:

```text
examples/
  cv-optimization/
  research-deck/
  marketing-agent-module/
```

Why this folder exists:

Examples teach the structure better than abstract rules alone. They should demonstrate the intended pattern without becoming the main working area.

### `tmp/`

Temporary local workspace.

Use this folder for scratch files, temporary conversions, local experiments, and disposable intermediate outputs.

This folder should normally be ignored by Git except for a placeholder such as `tmp/.gitkeep`.

Why this folder exists:

AI-assisted work creates many temporary files. Giving them an explicit local home helps keep the rest of the repository clean.

## Root Files

### `PROJECT.md`

The project charter.

This is the first meaning-oriented file humans and AI assistants should read.

It should explain:

- Why the project exists.
- The project's main job.
- The ideal final result.
- What counts as a good result now.
- Success criteria.
- Non-goals.
- Current focus.

`PROJECT.md` is not a task brief and not an AI instruction file. It is the durable project intent that helps everyone avoid losing the point of the work.

Use `templates/project-charter.md` when creating or rewriting it.

### `README.md`

The top-level entry point for the project.

It should explain:

- What the project is.
- How to use it.
- Where key materials live.
- How to run or reproduce important workflows.
- What is private or public.

### `PROJECT_STRUCTURE.md`

The structural guide and future folder catalog.

It should explain:

- The project organization philosophy.
- The minimal starter structure.
- The full reference structure.
- Lazy folder creation rules.
- Folder responsibilities.
- Classification rules.
- Execution order.

This file allows new projects to start small while still preserving the intended growth path.

### `AGENTS.md`

Entry point for Codex and other agentic coding systems that read `AGENTS.md`.

This should be a thin adapter pointing to `ai/`.

### `CLAUDE.md`

Entry point for Claude-based workflows.

This should be a thin adapter pointing to `ai/`.

### `GEMINI.md`

Entry point for Gemini-based workflows.

This should be a thin adapter pointing to `ai/`.

### `.env.example`

Example environment configuration without secrets.

This file documents required variables while keeping real credentials out of Git.

### `SECURITY.md`

Security policy and reporting rules.

Use this file for:

- Supported security assumptions.
- How to report vulnerabilities.
- Secret handling expectations.
- Dependency and supply-chain expectations.
- Local development security notes.

### `PRIVACY.md`

Privacy and sensitive data rules.

Use this file for:

- What must never be committed.
- How to handle client files.
- How to handle personal data.
- What can and cannot be shared with external AI tools.
- How to label sensitive materials.
- How to prepare a project for public GitHub release.

### `.gitignore`

Git ignore rules.

This should exclude:

- Secrets.
- Local environment files.
- Temporary files.
- Large generated outputs when appropriate.
- Local databases.
- Tool caches.
- Private raw data when appropriate.

## Execution Order

This section defines the preferred order of work for a professional AI-assisted project.

The order is not bureaucracy. It exists so that an assistant can move from vague intent to reliable output without mixing sources, analysis, code, instructions, and deliverables.

### 1. Start With The Project Charter

Create or update `PROJECT.md`.

It should capture:

- Why the project exists.
- The main job.
- The ideal final result.
- What counts as a good result.
- Success criteria.
- Non-goals.
- Current focus.

This file should stay short. It is the project's sense-making anchor.

### 2. Capture The Task Intent

Create or update a brief in `briefs/`.

The brief should capture:

- Goal.
- Audience or user.
- Inputs available.
- Expected output.
- Constraints.
- Privacy level.
- Success criteria.

If the project is too small for a full brief, create a short note anyway. Intent should be explicit.

### 3. Load The AI Operating Context

Before doing substantive work, assistants should read:

```text
PROJECT.md
ai/README.md
ai/constitution.md
ai/project-context.md
ai/instructions/general.md
ai/instructions/organization.md
```

Then read only the relevant additional files:

- `ai/instructions/*` for task-specific behavior.
- `ai/playbooks/*` for domain method.
- `ai/skills/*` for executable repeatable tasks.
- `ai/workflows/*` for multi-step processes.
- `docs/*` for stable system context.

### 4. Create Tasks Only When Needed

If the brief requires multiple steps, create managed tasks in `tasks/`.

Use `tasks/` when work needs:

- Prioritization.
- Status tracking.
- Multiple contributors or agents.
- Acceptance criteria.
- Separation between research, implementation, and artifact creation.

For a tiny project, skip `tasks/` and work directly from the brief.

### 5. Collect Inputs And References

If the user has dropped files into the project without specifying a precise location, start with:

```text
workbench/input/
```

Put raw external materials in `references/`.

Put structured data in `data/input/`.

Do not summarize or rewrite sources in place. Keep raw sources separate so later conclusions can be traced back.

### 6. Analyze In Research

Use `research/` for working notes, findings, comparisons, and synthesis.

This is where sources become understanding.

Do not put final guidance directly into `research/` unless it is still exploratory. Once a method becomes reusable, promote it to `ai/playbooks/`.

### 7. Promote Reusable Knowledge

When research produces a durable method, create or update a playbook in `ai/playbooks/`.

When a repeatable task can be executed by an assistant, create or update a skill in `ai/skills/`.

When a process coordinates several steps, create or update a workflow in `ai/workflows/`.

Promotion rule:

- `research/` is what was learned.
- `ai/playbooks/` is how to think or act next time.
- `ai/skills/` is how an assistant executes a repeatable task.
- `ai/workflows/` is how several tasks are orchestrated.

### 8. Implement Or Assemble

Use the appropriate implementation location:

- `src/` for primary code.
- `modules/` for bounded system capabilities.
- `scripts/` for utility commands.
- `config/` for safe versioned configuration.
- `data/working/` and `data/processed/` for data transformation.

Create these folders lazily as soon as they are truly needed.

### 9. Verify

Use the right verification layer:

- `tests/` for software correctness.
- `evals/` for AI behavior, artifact quality, rubric-based review, prompt quality, and regression cases.
- `ai/checklists/` for reusable quality checklists.

For document, presentation, and marketing work, verification should include output inspection, not just successful file creation.

### 10. Produce Artifacts

Put intermediate outputs in `workbench/output/` when the user has not requested a final destination.

Put generated outputs in `artifacts/`.

Use:

- `artifacts/drafts/` for work in progress.
- `artifacts/final/` for accepted deliverables.
- `artifacts/exports/` for generated formats and external exports.
- `artifacts/registry.md` when the project has multiple deliverables to track.

### 11. Document Stable Decisions

When a decision changes the project direction, architecture, operating model, or reusable method, record it.

Use:

- `docs/decisions/` for accepted project decisions.
- `docs/architecture/` for system structure.
- `docs/operations/` for operating instructions.
- `docs/operations/runbooks/` for step-by-step operational procedures.

Do not put unstable research notes in `docs/`.

### 12. Clean Up

Before considering work complete:

- Move final outputs to the correct artifact location.
- Move reusable methods into playbooks, skills, or workflows.
- Record important decisions.
- Remove or ignore temporary files.
- Update `README.md` if project usage changed.
- Update `PROJECT_STRUCTURE.md` only if the template rules changed.

## Classification Rules

When deciding where a file belongs, ask what role it plays.

| Question | Folder |
|---|---|
| Did the user drop files for the current task without classifying them? | `workbench/input/` |
| Is this an intermediate generated result without a final destination? | `workbench/output/` |
| Is this a human request, project requirement, or task statement? | `briefs/` |
| Is this managed work derived from a brief or goal? | `tasks/` |
| Is this an external article, guide, PDF, example, or source? | `references/` |
| Is this a working note, finding, comparison, or analysis? | `research/` |
| Is this a distilled method or best-practice guide? | `ai/playbooks/` |
| Is this an executable AI instruction for a repeatable task? | `ai/skills/` |
| Is this a defined AI role or agent? | `ai/agents/` |
| Is this a multi-step process? | `ai/workflows/` |
| Is this stable documentation of the system? | `docs/` |
| Is this final or draft output for a human/client? | `artifacts/` |
| Is this structured data? | `data/` |
| Is this implementation code? | `src/` |
| Is this a bounded subsystem? | `modules/` |
| Is this non-secret configuration? | `config/` |
| Is this a helper command or maintenance utility? | `scripts/` |
| Is this an AI behavior or artifact quality evaluation? | `evals/` |
| Is this a reusable starter format for future files? | `templates/` |
| Is this a demonstration of the intended structure? | `examples/` |
| Is this disposable? | `tmp/` |

## Example: CV Optimization Project

Suppose the project is to improve a CV for job search.

Raw downloaded materials:

```text
references/cv-optimization/articles/
references/cv-optimization/posts/
references/cv-optimization/guides/
references/cv-optimization/examples/
```

Working analysis:

```text
research/cv-optimization/notes.md
research/cv-optimization/findings.md
research/cv-optimization/source-comparison.md
```

Distilled playbook:

```text
ai/playbooks/cv-optimization.md
```

Executable AI skill:

```text
ai/skills/tailor-cv-for-job/SKILL.md
```

Input files:

```text
data/input/current-cv.docx
data/input/target-job-description.md
```

Draft and final outputs:

```text
artifacts/drafts/cv-v2.docx
artifacts/final/cv-target-company.docx
artifacts/final/cover-letter-target-company.docx
```

Stable documentation, if needed:

```text
docs/guides/cv-workflow.md
```

The important distinction:

- `references/` contains what others wrote.
- `research/` contains what the project learned.
- `ai/playbooks/` contains the reusable method.
- `ai/skills/` contains executable AI behavior.
- `artifacts/` contains the outputs.
- `docs/` contains stable project documentation.

## Example: Modular Marketing Agent System

For a larger marketing system built with AI agents, Mastra Backend, or similar infrastructure:

```text
modules/
  research-agent/
  positioning-agent/
  deck-generator/
  content-pipeline/
  analytics-pipeline/

ai/
  agents/
    research-agent.md
    positioning-agent.md
    deck-builder.md
  workflows/
    create-market-research-report.md
    build-campaign-deck.md
  skills/
    synthesize-research/
    generate-positioning/
    build-presentation/

src/
  server/
  workers/
  integrations/

config/
  agents/
  pipelines/

docs/
  architecture/
  operations/
  decisions/
```

The rule is simple:

- `modules/` defines product or business capability boundaries.
- `src/` contains implementation code.
- `ai/` contains LLM-neutral intelligence and operating procedures.
- `config/` contains versioned non-secret settings.
- `docs/` explains the accepted architecture and operations.

## What Makes This Structure CTO-Friendly

This structure is designed to be audit-friendly because it makes boundaries explicit:

- Inputs are separate from outputs.
- Raw sources are separate from conclusions.
- Research is separate from stable documentation.
- Playbooks are separate from executable skills.
- AI instructions are centralized and LLM-neutral.
- Code is separate from configuration.
- Modules are explicit.
- Temporary work has a defined place.
- Sensitive local files can be ignored cleanly.

A strong reviewer should be able to inspect the repository and understand not just what files exist, but what stage of work each file represents.

## Minimal Version

For a small project, not every folder needs to be populated immediately.

The minimal useful version is the starter structure defined near the top of this document:

```text
project/
  PROJECT.md
  README.md
  PROJECT_STRUCTURE.md
  AGENTS.md
  CLAUDE.md
  GEMINI.md
  SECURITY.md
  PRIVACY.md
  .gitignore
  .env.example

  ai/
    README.md
    constitution.md
    project-context.md
    instructions/
      general.md
      organization.md

  workbench/
    README.md
    input/
      README.md
    output/
      README.md

  briefs/
```

Folders should be added when they clarify ownership or lifecycle. Empty folders should exist only when they help the template teach the intended structure.

The correct growth pattern is:

```text
Need external sources?       Create `references/`.
Need working analysis?       Create `research/`.
Need deliverables?           Create `artifacts/`.
Need structured data?        Create `data/`.
Need implementation code?    Create `src/`.
Need bounded capabilities?   Create `modules/`.
Need verification?           Create `tests/` or `evals/`.
Need reusable formats?       Create `templates/`.
Need project examples?       Usually avoid; create `examples/` only if examples are a real deliverable.
```
