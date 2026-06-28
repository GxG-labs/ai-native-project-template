# AI References & Recommendations

Curated lists of proven tools, repositories, and MCP servers. Use these as starting points for your project initialization.

## Files in This Folder

### VERIFIED_REPOSITORIES.md
**7 проверенных репозиториев** с готовыми скиллами для разных доменов:
- andrej-karpathy-skills (ML/AI)
- cookiecutter-data-science (Data Science)
- Vercel Next.js (Frontend/Full-stack)
- Google styleguide (Code standards)
- Kubernetes examples (DevOps)
- VS Code extension samples (Developer tools)
- Anthropic cookbook (LLM applications)

**Use in**: Фаза 3 инициализации (`ai/workflows/initialize-project.md`)

### RECOMMENDED_MCP_SERVERS.md
**7 рекомендуемых MCP-серверов** для расширения Claude:
- Context 7 (Documentation lookup)
- Claude-in-Chrome (Browser automation)
- WebFetch/WebSearch (External data)
- GitHub API (Repo management)
- Google Drive/Sheets/Notion (Cloud collaboration)
- Clay (Data enrichment)
- Slack (Team communication)

**Use in**: Фаза 4 инициализации (bootstrap infrastructure)

---

## Quick Start

1. **Выбираешь домен проекта?**
   → Открой `VERIFIED_REPOSITORIES.md`, найди 3-5 релевантных репозиториев для твоей области

2. **Интегрируешь с AI инструментами?**
   → Открой `RECOMMENDED_MCP_SERVERS.md`, выбери 3-4 MCP-сервера для твоего стека

3. **Создаешь SKILLS_REVIEW.md?**
   → Используй оба файла как reference при оценке fit-score и effort

---

## How These Lists Were Curated

**Criteria for inclusion**:
- ✅ Actively maintained (updates in last 3 months)
- ✅ Well-documented (README, examples, tutorials)
- ✅ Proven in practice (used in real projects)
- ✅ Adaptable (works for multiple project types)
- ✅ Scalable (MVP to production)

**Not included**:
- ❌ Niche tools (use WebSearch to find domain-specific ones)
- ❌ Experimental/unmaintained projects
- ❌ Heavy-weight solutions (unnecessary for MVP)

---

## Adding New References

Found a great repository or MCP server? 

1. Check it meets the criteria above
2. Write a short description (domain, key skills, fit-score)
3. Create a PR with the addition

Goal: Keep these lists **selective and high-quality**, not exhaustive.

---

## Related Files

- `ai/workflows/initialize-project.md` — Full project initialization (Phase 3 uses repositories)
- `ai/methods/skills-discovery.md` — How to evaluate repositories and skills
- `examples/SKILLS_REVIEW_example.md` — Example SKILLS_REVIEW.md with recommendations
