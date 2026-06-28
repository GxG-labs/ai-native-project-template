# Recommended MCP Servers — Essential Tools

Топовые MCP (Model Context Protocol) серверы, которые имеют смысл добавить в большинство проектов. Эти серверы расширяют возможности Claude Code и других AI инструментов.

---

## 1. **Context 7** — Documentation & Framework Lookup
**Status**: ✅ Production-ready  
**Integration**: Via `claude-api` skill

**Домен**: Documentation, API References, Framework Knowledge  
**Когда использовать**: Для любого проекта с внешними зависимостями

**Ключевые возможности**:
- Instant access to library/framework docs (React, Django, FastAPI, etc.)
- API reference lookup without web search
- Version-specific documentation
- Code examples from official docs
- Works even when external internet is slow/blocked

**Setup**:
```
1. Use context7 skill when needing docs
2. Automatically invoked for library/framework questions
3. No configuration needed
```

**Когда это экономит время**: 
- Architecture decisions (React vs Vue, FastAPI vs Django)
- API usage questions (how to use function X?)
- Version compatibility checks

**Fit Score**: ⭐⭐⭐⭐⭐ — Must-have for any technical project

---

## 2. **Claude-in-Chrome** — Browser Automation
**Status**: ✅ Production-ready  
**Integration**: Via browser automation tools

**Домен**: Web Scraping, Form Filling, Screenshot Capture, Testing  
**Когда использовать**: Для проектов с web UI, testing, или когда нужна visual verification

**Ключевые возможности**:
- Click elements, fill forms, navigate pages
- Capture screenshots and record GIF videos
- Read console logs and network requests
- Execute JavaScript on a page
- Interact with web apps without API

**Setup**:
```
1. Install Claude Code extension in Chrome
2. Grant site-level permissions
3. Use mcp__claude-in-chrome__* tools in tasks
```

**Когда это экономит время**: 
- Visual testing of frontend changes
- Recording demos or bug reproductions
- Automating web-based workflows

**Fit Score**: ⭐⭐⭐⭐ — Essential if you have frontend work

---

## 3. **WebFetch & WebSearch** — External Information
**Status**: ✅ Production-ready  
**Integration**: Via Bash tool or direct fetch

**Домен**: Research, External API Lookup, Latest Information  
**Когда использовать**: Когда нужна информация за пределами твоего кода и docs

**Ключевые возможности**:
- Fetch content from any public URL
- Search the web for current information
- Look up API docs from live sources
- Check GitHub releases and latest versions
- Find security advisories and CVE info

**Setup**:
```
No setup needed — tools are always available
```

**Когда это экономит время**: 
- Looking up current best practices
- Checking latest package versions
- Finding security updates
- Discovering new tools in your domain

**Fit Score**: ⭐⭐⭐⭐ — Very useful for staying current

---

## 4. **Google Drive, Notion, Sheets** — Cloud Collaboration
**Status**: ✅ Production-ready  
**Integration**: Via MCP servers

**Домен**: Documentation, Project Planning, Data Management  
**Когда использовать**: Для проектов, где нужна синхронизация с cloud tools

**Ключевые возможности**:

**Google Sheets**:
- Read/write spreadsheet data
- Update cells, add rows, create charts
- Useful for: tracking metrics, managing databases in sheets

**Google Drive**:
- Search and read documents
- Share large files
- Useful for: documentation, design files, raw data

**Notion**:
- Create/update pages and databases
- Query and filter data
- Useful for: project planning, knowledge base, runbooks

**Setup**:
```
1. Authenticate via OAuth
2. Grant permissions for specific Google Account/Notion workspace
3. Can read/write data programmatically
```

**Когда это экономит время**: 
- Pulling real-time data into AI workflows
- Updating project dashboards automatically
- Creating documentation from code/data

**Fit Score**: ⭐⭐⭐ — Nice-to-have if you use these tools heavily

---

## 5. **GitHub API** — Repository Management
**Status**: ✅ Production-ready (via Bash `gh` command)  
**Integration**: Via Bash tool

**Домен**: Repository Management, PR/Issue Automation, CI/CD  
**Когда использовать**: Для любого проекта на GitHub

**Ключевые возможности**:
- Create/update/close PRs and issues
- Read PR comments and reviews
- Trigger actions and check CI status
- Manage releases and branches
- Useful for: automating releases, bulk issue updates, checking build status

**Setup**:
```
gh auth login  # One-time setup
# Then use: gh pr list, gh pr create, gh issue create, etc.
```

**Когда это экономит время**: 
- Automating repetitive GitHub tasks
- Checking build status before deploying
- Creating releases with changelogs

**Fit Score**: ⭐⭐⭐⭐ — Essential if using GitHub for code

---

## 6. **Clay** — Data Enrichment
**Status**: ✅ Production-ready  
**Integration**: Via MCP server

**Домен**: Data, B2B Scraping, Lead Generation, Data Enrichment  
**Когда использовать**: Для projects that need enriched business data

**Ключевые возможности**:
- Lookup company and people data
- Find verified contact information
- Enrich datasets with additional fields
- Useful for: sales automation, research, lead gen

**Setup**:
```
1. Create Clay account (clay.com)
2. Authenticate MCP server
3. Can query data programmatically
```

**Когда это экономит время**: 
- Automatic data enrichment in workflows
- Finding accurate contact info
- Building prospect lists

**Fit Score**: ⭐⭐ — Only if you do B2B/data-heavy work

---

## 7. **Slack** — Team Communication
**Status**: ✅ Production-ready  
**Integration**: Via MCP server

**Домен**: Team Collaboration, Notifications, Automation  
**Когда использовать**: Для любого проекта с командой в Slack

**Ключевые возможности**:
- Send messages to channels
- Post alerts and notifications
- Read channel history
- Thread management
- Useful for: deployment notifications, status updates, alerts

**Setup**:
```
1. Create Slack bot token
2. Grant permissions (chat:write, channels:read, etc.)
3. Can post/read Slack data
```

**Когда это экономит время**: 
- Automated deployment notifications
- Status alerts for long-running tasks
- Sending reports to the team

**Fit Score**: ⭐⭐⭐⭐ — Very useful for team projects

---

## Quick Decision Matrix

| MCP Server | Setup Effort | Benefit | Priority |
|---|---|---|---|
| **Context 7** | 0 min | Documentation instant access | 🔴 Must-Have |
| **Claude-in-Chrome** | 5 min | Visual testing + automation | 🔴 Must-Have (if frontend) |
| **WebFetch/Search** | 0 min | Current external info | 🟡 Should-Have |
| **GitHub API** | 5 min | Repo automation | 🟡 Should-Have |
| **Google Drive/Sheets** | 10 min | Cloud integration | 🟢 Nice-to-Have |
| **Notion** | 10 min | Knowledge base integration | 🟢 Nice-to-Have |
| **Clay** | 15 min | Data enrichment | 🟢 Specialized (B2B only) |
| **Slack** | 10 min | Team notifications | 🟡 Should-Have |

---

## How to Add to Your Project

### In CLAUDE.md or AGENTS.md:

```markdown
## MCP Servers

We use these MCP servers to extend Claude's capabilities:

1. **Context 7** — Documentation lookup (auto-loaded)
2. **Claude-in-Chrome** — Browser automation for testing
3. **WebFetch/WebSearch** — External information lookup
4. **GitHub API** — PR/issue automation (via gh command)
5. **Slack** — Team notifications

Setup instructions in: `ai/references/RECOMMENDED_MCP_SERVERS.md`
```

### Enable in Claude Code Settings:

```json
{
  "mcp": {
    "enabled": ["context7", "claude-in-chrome", "github"],
    "maxRetries": 3,
    "timeout": 30000
  }
}
```

---

## Когда Использовать в Инициализации

**Фаза 0** (сейчас):
- Context 7 — для быстрого access к docs
- WebFetch/Search — для исследования (если нужно)

**Фаза 1** (MVP):
- Claude-in-Chrome — если есть frontend
- GitHub API — для automation

**Фаза 2+** (post-MVP):
- Slack — для production monitoring
- Google Drive/Sheets — для dashboards
- Clay — только если нужна data enrichment

---

## Troubleshooting

**"Context 7 doesn't have docs for my library"**
→ Use WebFetch to get docs directly from source, or check if library is in context7's supported list

**"Chrome automation is slow"**
→ Network latency is normal. Use GIF recording only for important demos, not every interaction

**"GitHub API rate limits"**
→ Each gh command counts toward limits. Batch requests where possible. Check limits with `gh api rate_limit`

---

## Related Files

- `ai/references/VERIFIED_REPOSITORIES.md` — Verified code repositories
- `CLAUDE.md` / `AGENTS.md` — Project-specific tool configuration
- `/config` — Claude Code settings for MCP servers
