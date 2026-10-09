import { Store } from "./store.js";
import { checked, checkAssessment, type Source, type State } from "./model.js";
export type Provider = {
  ask(kind: string, input: any): Promise<any>;
  search(query: string, limit: number): Promise<Source[]>;
  read(source: Source): Promise<Source>;
};
const stepKey = (s: State) =>
  [s.iteration, s.phase, s.queryIndex, s.postIndex, s.evalIndex].join(":");
const briefObservations = (rows: any[]) =>
  rows.map((o) => ({
    ...o,
    queries: o.queries.map((q: any) => ({
      ...q,
      examples: q.examples
        .slice(0, 1)
        .map((p: any) => ({
          ...p,
          title: p.title.slice(0, 120),
          reason: p.reason.slice(0, 160),
          quote: p.quote.slice(0, 240),
        })),
    })),
  }));
export class Engine {
  constructor(
    public store: Store,
    public provider: Provider,
    public signal: AbortSignal = new AbortController().signal,
  ) {}
  async call(kind: string, input: any): Promise<any> {
    const s = this.store.state(),
      c = this.store.config();
    if (this.signal.aborted) throw Error("Interrupted");
    const payload = {
      instruction:
        kind === "plan"
          ? "Plan creative Reddit queries and communities, including subreddit: filters where useful. Usually develop two successful directions and explore one new direction; this is guidance, not a quota. With no successful direction try different hypotheses. Use author wording, outcomes and failed queries from observations. Omit site:reddit.com and avoid executed queries. Default amendment=null: change queries, not the planner instruction. Propose at most ONE general search rule only for a repeated search error, an accumulated useful general lesson (cite at least two complete observed iterations), or explicit human search feedback. Never change assessment instructions or criteria. Keep queries consistent with any proposed rule."
          : kind === "assess"
            ? "Score original post evidence under human criteria. Similar-product builders score 5 as audience leads. Quote 1–50 exact words from the original body. Comments are auxiliary evidence, not the author’s own situation."
            : "Review the single search instruction amendment against at least three complete passes and its stated reason. Decide keep or revert with a concrete evidence-based reason. Do not compare just one small batch against its predecessor. Access failures are not evidence of poor search. Never change criteria or assessment instructions.",
      criteria: this.store.criteria(),
      humanFeedback: this.store.feedbackText(),
      observations:
        kind === "plan"
          ? []
          : [{ method: s.method, lesson: this.store.method(s.method).lesson }],
      state: {
        iteration: s.iteration,
        phase: s.phase,
        mode: s.mode,
        postIndex: s.postIndex,
        evalIndex: s.evalIndex,
      },
      ...input,
    };
    const serialized = JSON.stringify(payload);
    if (serialized.length > 60000) throw Error("Bounded context exceeded");
    const key = stepKey(s);
    const cached = this.store.db
      .prepare(
        "SELECT output FROM loop_calls WHERE step_key=? AND kind=? AND input=? AND output IS NOT NULL AND error IS NULL ORDER BY id DESC LIMIT 1",
      )
      .get(key, kind, serialized);
    if (cached) return checked(kind, JSON.parse(String(cached.output)));
    if (s.calls >= c.maxCalls)
      throw Error(
        "Model call budget exhausted; increase maxCalls explicitly before resume",
      );
    let id = 0;
    this.store.tx(() => {
      s.calls++;
      this.store.set("state", s);
      id = Number(
        this.store.db
          .prepare(
            "INSERT INTO loop_calls(iteration,kind,input,step_key) VALUES(?,?,?,?)",
          )
          .run(s.iteration, kind, serialized, key).lastInsertRowid,
      );
    });
    const start = Date.now();
    try {
      const result = checked(kind, await this.provider.ask(kind, payload));
      if (kind === "assess") checkAssessment(result, input.source);
      if (
        kind === "plan" &&
        !result.queries.some(
          (q: string) =>
            q.trim() &&
            !this.store.db
              .prepare("SELECT 1 FROM loop_queries WHERE query=?")
              .get(q.trim()),
        )
      )
        throw Error("Planner repeated only completed queries");
      this.store.db
        .prepare("UPDATE loop_calls SET output=?,elapsed_ms=? WHERE id=?")
        .run(JSON.stringify(result), Date.now() - start, id);
      return result;
    } catch (e) {
      this.store.db
        .prepare("UPDATE loop_calls SET error=?,elapsed_ms=? WHERE id=?")
        .run(String(e), Date.now() - start, id);
      throw e;
    }
  }
  commit(s: State, detail: any, write?: () => void) {
    const previous = this.store.state();
    s.calls = previous.calls;
    const position = (state: State) => ({
      iteration: state.iteration,
      phase: state.phase,
      queryIndex: state.queryIndex,
      postIndex: state.postIndex,
      evalIndex: state.evalIndex,
      status: state.status,
    });
    const reasons: Record<string, string> = {
      plan: "Validated a new query plan.",
      search: "Retain all discoveries and record access failures.",
      read: "Preserve captured original evidence and access limitations.",
      assess:
        "Apply human criteria and exact source evidence; retain every relevance level.",
      save: "Persist assessment and retain every finding.",
      observe: "Save query outcomes and author wording for the next plan.",
      evaluate:
        "Compare candidate and baseline against the same labeled examples.",
      finish: "Record batch metrics and apply the explicit stop limits.",
    };
    this.store.checkpoint(
      s,
      {
        ...detail,
        completedStep: position(previous),
        inputs: {
          method: previous.method,
          sourceId: previous.queue[previous.postIndex]?.id ?? null,
          assessment:
            previous.phase === "save" ? previous.pendingAssessment : null,
          criteria: "loop_kv.criteria",
          feedbackRevision: this.store.get("feedbackRevision") ?? 0,
          query: previous.queries[previous.queryIndex] ?? null,
          source:
            previous.phase === "read"
              ? (previous.queue[previous.postIndex] ?? null)
              : null,
          calls: this.store.db
            .prepare("SELECT id FROM loop_calls WHERE step_key=?")
            .all(stepKey(previous))
            .map((x) => x.id),
        },
        decision: detail.decision ?? (detail.stop ? "stop" : "continue"),
        reason: detail.reason ?? detail.lesson ?? reasons[previous.phase],
        next: position(s),
      },
      write,
    );
  }
  async step() {
    let s = this.store.state();
    if (s.status !== "running") return;
    if (this.signal.aborted) throw Error("Interrupted");
    const c = this.store.config();
    const db = this.store.db;
    if (s.phase === "plan") {
      s.method = this.store.get<number>("activeMethod")!;
      const m = this.store.method(s.method);
      const result = await this.call("plan", {
        iteration: s.iteration,
        guide: m.search_guide,
        maxQueries: c.queries,
        window: [c.from, c.through],
        recentQueries: db
          .prepare(
            "SELECT query FROM loop_queries ORDER BY iteration DESC LIMIT 20",
          )
          .all(),
        observations: briefObservations(this.store.observations()),
        humanSearchFeedback: this.store.feedbackText("search"),
        amendmentAllowed: m.status !== "search_trial",
        explicitSearchCorrection:
          this.store.get("pendingSearchFeedback") ?? null,
      });
      const queries = [
        ...new Set<string>(result.queries.map((q: string) => q.trim())),
      ]
        .filter(
          (q) => !db.prepare("SELECT 1 FROM loop_queries WHERE query=?").get(q),
        )
        .slice(0, c.queries);
      if (!queries.length)
        throw Error("Planner repeated only completed queries");
      s.queries = queries;
      s.queue = [];
      s.queryIndex = 0;
      s.postIndex = 0;
      s.newRelevant = 0;
      s.known = 0;
      s.phase = "search";
      s.candidate = null;
      s.evaluations = [];
      s.evalIndex = 0;
      const amendment = result.amendment;
      const evidence = amendment
        ? [...new Set<number>(amendment.evidenceIterations)].filter((id) =>
            this.store
              .observations()
              .some((o) => o.iteration === id && o.complete),
          )
        : [];
      const justified =
        amendment &&
        m.status !== "search_trial" &&
        (amendment.trigger === "human"
          ? !!this.store.get("pendingSearchFeedback")
          : evidence.length >= 2);
      const guide = amendment
        ? m.search_guide + "\n" + amendment.rule
        : m.search_guide;
      const apply = justified && guide.length <= 8000;
      this.commit(
        s,
        {
          plan: result,
          reason: result.reason,
          amendmentDecision: apply
            ? "trial"
            : amendment
              ? "defer"
              : "unchanged",
        },
        () => {
          if (apply) {
            s.method = Number(
              db
                .prepare(
                  "INSERT INTO loop_methods(parent,status,search_guide,assess_guide,lesson) VALUES(?,'search_trial',?,?,?)",
                )
                .run(
                  m.id,
                  guide,
                  m.assess_guide,
                  JSON.stringify({
                    rule: amendment.rule,
                    reason: amendment.reason,
                    trigger: amendment.trigger,
                    evidenceIterations: evidence,
                    humanFeedback:
                      this.store.get("pendingSearchFeedback") ?? null,
                  }),
                ).lastInsertRowid,
            );
            this.store.set("activeMethod", s.method);
            if (amendment.trigger === "human")
              this.store.set("pendingSearchFeedback", null);
          }
          db.prepare(
            "INSERT INTO loop_plans(iteration,method,content) VALUES(?,?,?)",
          ).run(s.iteration, s.method, JSON.stringify({ ...result, queries }));
        },
      );
    } else if (s.phase === "search") {
      const query = s.queries[s.queryIndex];
      let sources: Source[] = [],
        error: string | null = null;
      try {
        sources = await this.provider.search(query, c.postsPerQuery);
      } catch (e) {
        if (this.signal.aborted) throw e;
        error = String(e);
      }
      const seen = new Set(s.queue.map((x) => x.id));
      const fresh = sources.filter((p) => {
        if (
          seen.has(p.id) ||
          db.prepare("SELECT 1 FROM posts WHERE post_id=?").get(p.id)
        ) {
          s.known++;
          return false;
        }
        seen.add(p.id);
        return true;
      });
      s.queue.push(...fresh);
      s.queryIndex++;
      if (s.queryIndex >= s.queries.length)
        s.phase = s.queue.length ? "read" : "observe";
      this.commit(
        s,
        { query, found: sources.length, added: fresh.length, error },
        () => {
          db.prepare("INSERT INTO loop_queries VALUES(?,?,?)").run(
            query,
            s.iteration,
            JSON.stringify({ sources, error }),
          );
          for (const p of fresh) this.store.saveLead(p, query, s.iteration);
        },
      );
    } else if (s.phase === "read") {
      const lead = s.queue[s.postIndex];
      let p: Source;
      try {
        p = await this.provider.read(lead);
        if (p.id !== lead.id || p.url !== lead.url)
          throw Error("Read changed the post identity");
      } catch (e) {
        if (this.signal.aborted) throw e;
        p = {
          ...lead,
          evidence:
            lead.evidence +
            "; detail read failed (using captured original search-feed body, comments unavailable): " +
            String(e),
        };
      }
      s.queue[s.postIndex] = p;
      s.phase = "assess";
      this.commit(s, { read: p.id, verified: p.verified, source: p }, () =>
        this.store.saveLead(p, "Resumed source read", s.iteration),
      );
    } else if (s.phase === "assess") {
      const p = s.queue[s.postIndex];
      s.pendingAssessment = p.verified
        ? await this.call("assess", {
            guide: this.store.method(s.method).assess_guide,
            source: p,
          })
        : null;
      s.phase = "save";
      this.commit(s, {
        assessed: p.id,
        assessment: s.pendingAssessment,
        reason:
          s.pendingAssessment?.reason ??
          "Original text unavailable; keep existing evidence and rating.",
      });
    } else if (s.phase === "save") {
      const p = s.queue[s.postIndex],
        a = s.pendingAssessment;
      const human = db
        .prepare("SELECT score,reason FROM loop_human_scores WHERE post_id=?")
        .get(p.id);
      const score = a ? (human?.score ?? a.score) : null;
      if (a) checkAssessment(a, p);
      if (
        score !== null &&
        Number(score) >= 3 &&
        p.published >= c.from &&
        p.published <= c.through
      )
        s.newRelevant++;
      s.postIndex++;
      s.phase =
        s.postIndex < s.queue.length
          ? "read"
          : s.mode === "reassess"
            ? "finish"
            : "observe";
      s.pendingAssessment = null;
      this.commit(
        s,
        {
          saved: p.id,
          score,
          reason: human
            ? "Human: " + String(human.reason)
            : (a?.reason ?? "Unverified source; preserve previous record."),
        },
        () => {
          if (a) this.store.saveScore(p, a);
          else
            db.prepare(
              "UPDATE posts SET reason=? WHERE post_id=? AND score=0",
            ).run("Original body unavailable; " + p.evidence, p.id);
        },
      );
    } else if (s.phase === "observe") {
      const observation = this.store.observe(s),
        m = this.store.method(s.method);
      const passes = this.store
        .observations(50)
        .filter((o) => o.method === s.method && o.complete)
        .reverse();
      if (observation.complete) passes.push(observation);
      let decision: any = null;
      if (m.status === "search_trial" && passes.length >= 3) {
        decision = await this.call("review", {
          amendment: m.lesson,
          passes: briefObservations(passes.slice(-3)),
          baseline: briefObservations(
            this.store
              .observations(50)
              .filter((o) => o.method === m.parent && o.complete)
              .slice(0, 3),
          ),
        });
      }
      s.phase = "finish";
      this.commit(
        s,
        {
          observation,
          methodDecision: decision,
          reason: decision?.reason ?? observation.lesson,
        },
        () => {
          db.prepare("INSERT INTO loop_observations VALUES(?,?,?)").run(
            s.iteration,
            s.method,
            JSON.stringify(observation),
          );
          if (decision) {
            db.prepare("UPDATE loop_methods SET status=? WHERE id=?").run(
              decision.decision === "keep" ? "active" : "reverted",
              s.method,
            );
            if (decision.decision === "revert")
              this.store.set("activeMethod", m.parent);
          }
        },
      );
    } else if (s.phase === "evaluate") {
      const cases = this.store.calibrations();
      const candidate = this.store.method(s.candidate!);
      const base = this.store.method(candidate.parent);
      if (s.evalIndex < cases.length * 2) {
        const index = Math.floor(s.evalIndex / 2),
          isCandidate = s.evalIndex % 2 === 1;
        const { expected, ...source } = cases[index];
        const a = await this.call("assess", {
          calibration: true,
          guide: isCandidate ? candidate.assess_guide : base.assess_guide,
          source,
        });
        checkAssessment(a, source);
        s.evaluations.push({
          id: source.id,
          method: isCandidate ? "candidate" : "baseline",
          loss: Math.abs(a.score - expected),
        });
        s.evalIndex++;
        this.commit(s, {
          calibration: source.id,
          variant: isCandidate ? "candidate" : "baseline",
          loss: Math.abs(a.score - expected),
        });
      } else {
        const sum = (variant: string) =>
          s.evaluations
            .filter((x) => x.method === variant)
            .reduce((n, x) => n + x.loss, 0);
        const pass = cases.length > 0 && sum("candidate") <= sum("baseline");
        s.phase = "finish";
        this.commit(
          s,
          {
            candidate: s.candidate,
            decision: pass ? "keep" : "reject",
            loss: { baseline: sum("baseline"), candidate: sum("candidate") },
            cases: cases.length,
            reason: pass
              ? "Assessment instruction passed its control examples; keep it."
              : "No control examples or calibration loss increased; reject the candidate.",
          },
          () => {
            db.prepare("UPDATE loop_methods SET status=? WHERE id=?").run(
              pass ? "active" : "rejected",
              s.candidate!,
            );
            if (pass) this.store.set("activeMethod", s.candidate);
          },
        );
      }
    } else if (s.phase === "finish") {
      const metrics = {
        newRelevant: s.newRelevant,
        reviewed: s.queue.length,
        queries: s.queries.length,
        calls: s.calls,
      };
      const accessErrors = db
        .prepare("SELECT result FROM loop_queries WHERE iteration=?")
        .all(s.iteration)
        .filter((x) => JSON.parse(String(x.result)).error).length;
      s.empty = s.newRelevant ? 0 : accessErrors ? s.empty : s.empty + 1;
      if (
        s.mode !== "search" ||
        s.iteration >= s.target ||
        s.empty >= c.noProgress
      )
        s.status = "stopped";
      else {
        s.iteration++;
        s.phase = "plan";
      }
      this.commit(
        s,
        {
          completed: true,
          metrics,
          stop:
            s.status === "stopped"
              ? s.empty >= c.noProgress
                ? "no progress"
                : "budget completed"
              : null,
        },
        () =>
          db
            .prepare("UPDATE loop_plans SET metrics=? WHERE iteration=?")
            .run(
              JSON.stringify(metrics),
              s.status === "stopped" ? s.iteration : s.iteration - 1,
            ),
      );
    }
  }
  async run() {
    try {
      while (this.store.state().status === "running") {
        await this.step();
        const s = this.store.state();
        console.log(
          `iteration ${s.iteration} | ${s.phase} | ${s.status} | calls ${s.calls}`,
        );
      }
    } catch (e) {
      const s = this.store.state();
      s.status = this.signal.aborted ? "paused" : "failed";
      s.error = String(e);
      this.store.checkpoint(s, { error: s.error });
      throw e;
    }
  }
}
