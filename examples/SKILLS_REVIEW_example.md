# Skills Review — Example (AI-Native SaaS Platform)

This is an example of a completed SKILLS_REVIEW.md from a hypothetical AI-native SaaS platform project. Use it as a template for your own project.

**Completed**: June 1, 2025  
**Team**: Sarah (PM), Alex (Tech Lead), Maya (Design)  
**Project**: AI-native SaaS platform for multi-tenant agent workflows

---

## Project Goals (from PROJECT.md)

1. **Deliver reliable agent workflows** — end-to-end orchestration with clear failure handling
2. **Minimize deployment friction** — ship features in days, not weeks
3. **Scale to 10,000+ users** — performance and cost-efficient multi-tenancy
4. **Maintain security & privacy** — production-grade auth, RBAC, data isolation

---

## Candidate Repositories & Frameworks

| Name | Domain | Purpose | Fit Score | Decision |
|---|---|---|---|---|
| Mastra | Agent framework | Agent orchestration, RAG, tool use | 5 | IMPLEMENT NOW (Phase 0) |
| LangChain | Agent framework | Chain composition, LLM integration | 4 | IMPLEMENT LATER (Phase 2) |
| Vercel AI SDK | Frontend AI | Real-time streaming, React hooks | 5 | IMPLEMENT NOW (Phase 0) |
| OpenTelemetry | Observability | Structured logging, traces, metrics | 4 | IMPLEMENT PHASE 1 |
| andrej-karpathy-skills | ML practices | Experiment tracking, eval patterns | 3 | IMPLEMENT PHASE 2 |
| Supabase | Database + Auth | PostgreSQL + JWT + RLS | 5 | IMPLEMENT NOW (Phase 0) |
| Railway | Deployment | Container hosting, easy CI/CD | 5 | IMPLEMENT NOW (Phase 0) |
| Stripe | Billing | Payments, subscriptions, webhooks | 4 | IMPLEMENT PHASE 1 |
| Temporal.io | Workflows | Durable task orchestration | 3 | SKIP (Mastra sufficient) |
| Apache Airflow | Workflows | DAG orchestration | 2 | SKIP (Overkill for MVP) |

---

## Phase 0: Right Now (Blocking Work)

**These skills must exist before any real feature work starts.**

- [x] **Agent Framework Selection (Mastra)** — Choosing Mastra over alternatives unblocks "define how agents work"
- [x] **Database Setup (Supabase)** — Can't build features without a database
- [x] **Authentication & RBAC** — Multi-tenant system requires user/org separation before day 1
- [x] **Frontend Architecture (Next.js + Vercel AI SDK)** — Real-time agent output requires streaming setup
- [x] **Deployment Pipeline (Railway)** — Must be able to deploy before shipping features
- [x] **Local Development Environment** — Every engineer needs this on day 1
- [ ] **Agent Deployment & Lifecycle** — How do agents run? Where? How do we manage versions?
- [ ] **API Rate Limiting** — Prevent runaway costs before customers arrive

**Time estimate**: 1-2 weeks (largely infrastructure setup, can be parallelized)

---

## Phase 1: MVP Launch (Core Value)

**Skills that deliver the core product.**

- [ ] **Create a New Workflow** — Repeatable procedure for users to build agent workflows (documentation + UI)
- [ ] **Run an Agent Safely** — Execute an agent with timeout, error handling, and resource limits
- [ ] **Log Agent Execution** — Capture input, output, cost, latency for debugging and monitoring
- [ ] **Stream Agent Output to Frontend** — Real-time UI updates as agent runs
- [ ] **Test Agent Workflows** — Unit and integration tests for agents (eval framework)
- [ ] **Monitor Agent Health** — Dashboards showing error rates, latency, cost per workflow
- [ ] **OpenTelemetry Integration** — Structured logging and tracing across backend & frontend
- [ ] **Stripe Integration** — Basic billing (subscription + per-agent-run charges)

**Effort estimate**: 4-6 weeks  
**Outcome**: Users can build, run, and pay for agent workflows

---

## Phase 2: Post-MVP (Quality & Scale)

**Skills for improving reliability, performance, and developer experience after MVP.**

- [ ] **A/B Test Agent Versions** — Route traffic between workflow versions
- [ ] **Agent Performance Profiling** — Identify bottlenecks (LLM cost, API latency, etc.)
- [ ] **Backfill Metrics** — Retrospective analysis for historical workflows
- [ ] **Bulk Workflow Scheduling** — Cron jobs, webhooks, or scheduled runs
- [ ] **Agent Rollback Procedures** — Safely revert a broken workflow
- [ ] **Data Export & Audit Logs** — GDPR compliance, audit trails
- [ ] **LangChain Integration** — Chain composition (if Mastra becomes limiting)
- [ ] **andrej-karpathy ML Evals** — Formal eval framework for agent output quality

**Effort estimate**: 3-4 weeks (per feature)  
**Outcome**: Production-grade reliability and observability

---

## Deferred or Skipped

**Repositories we decided NOT to implement (and why):**

- **Temporal.io** — Reason: Mastra provides sufficient orchestration for MVP. Temporal adds operational complexity (requires a daemon). Revisit only if we need true temporal semantics or durability across infrastructure restarts.
- **Apache Airflow** — Reason: Overkill for agent workflows. Airflow is designed for batch ETL DAGs, not real-time agent execution. Stick with Mastra.
- **LangChain (Phase 0)** — Reason: Mastra covers 80% of our needs with cleaner abstractions. LangChain has a larger ecosystem but also higher switching costs. Defer to Phase 2 only if we hit limitations.
- **Ray Tuning** — Reason: Not needed for MVP. Revisit only if we do hyperparameter optimization at scale.

---

## Decision Rationale

**Why these choices?**

1. **Mastra + Supabase + Railway**: Single tech stack minimizes context switching and deployment complexity
2. **Vercel AI SDK**: Real-time streaming is table-stakes for agent UX; this framework makes it trivial
3. **Phase 0 first**: We can't ship anything without core infra. Better to get this right before feature work
4. **OpenTelemetry in Phase 1**: Observability isn't MVP-blocking, but adding it early is cheaper than retrofitting
5. **Stripe in Phase 1**: Billing can follow MVP demo; not blocking customer development

---

## Next Steps

1. **This week**: Implement Phase 0 (infra + auth + basic agent execution)
2. **Week 2-3**: First agent workflow (Phase 1 core)
3. **Week 4-5**: Monitoring + billing (remaining Phase 1)
4. **Post-MVP**: Revisit Phase 2 based on actual usage patterns and customer feedback

---

## Sign-Offs

- [ ] Sarah (PM) — Agrees on Phase 0 + 1 priorities
- [ ] Alex (Tech Lead) — Agrees on technical approach
- [ ] Maya (Design) — Aware of what we're building and timeline

Once all sign off, proceed to Phase 4 (bootstrap infrastructure) in the main initialization workflow.
