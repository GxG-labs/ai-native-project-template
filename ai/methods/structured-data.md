# Growing Registries: Structure Template

When a file will accumulate records repeatedly (added by multiple contributors), make the pattern explicit so AI agents and new humans understand the rules without asking.

## Pattern

Every growing registry file should have:

```
# [File Title]

## Scope

What records belong here?
What does NOT belong here?
When do you create a new entry (vs. updating existing)?

## Structure

[Fields, types, required vs. optional]

## Examples

One entry that IS valid:
[example that shows correct structure + satisfies constraints]

One entry that is NOT valid:
[counter-example showing a mistake — wrong format, doesn't fit scope, etc.]
```

## Real Examples

### Content Pillars

```markdown
# Content Pillars

## Scope
Main thematic categories that organize our content.
New content should fit into exactly one pillar.
If new content doesn't fit any pillar → discuss if we need a new one (don't stretch existing definitions).

## Structure
- **Name** (required): 2–4 words, distinct from others
- **Purpose** (required): One sentence — what outcome does this drive?
- **What fits** (required): 2–3 bullet examples of content that belongs here

## Examples

### Valid: Thought Leadership
- **Purpose:** Establish credibility through original research and opinions
- **What fits:** Original analysis, contrarian takes, behind-the-scenes decisions

### Invalid (overlaps with another pillar)
- **Purpose:** Interesting content
- **What fits:** Random posts, anything related to our industry
```

### Glossary (for multi-project teams)

```markdown
# Shared Glossary

## Scope
Formal definitions for domain terms used across projects.
Add a term if: (1) multiple projects reference it, (2) misunderstanding causes real bugs, (3) definition is non-obvious.
Don't add: common English words, project-internal jargon.

## Structure
- **Term** (required): Exact phrase as used in code/docs
- **Definition** (required): 1–2 sentences for someone new to the domain
- **Example** (optional): How it's actually used

## Examples

### Valid: RLS (Row-Level Security)
- **Definition:** Database-level authorization that filters data per user at query time
- **Example:** "User sees only their own records because RLS enforces this in the database"

### Invalid (too vague)
- **Definition:** Security stuff
```

## When to Apply This

✓ Content Pillars, Topic categories  
✓ Skills / Workflows registry (growing list of capabilities)  
✓ Glossary (formal domain terms shared across projects)  
✓ Governance matrices (who can do what, approval rules)  
✓ Any file where new entries follow a predictable pattern

## When NOT to Apply

✗ Config files with standard formats (.env, .json, .yaml)  
✗ Code files  
✗ One-time files (PROJECT.md, charters)  
✗ Narrative docs (essays, tutorials)  
✗ Simple markdown lists that rarely change  

## Why This Works

- **LLM agents** can generate new entries that follow the pattern
- **Code review** can check if new entry violates constraints (e.g., overlapping categories)
- **Humans** understand boundaries without context-jumping
- **Prevents drift** — explicit rules catch scope creep early
