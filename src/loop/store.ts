import { DatabaseSync } from "node:sqlite";
import { mkdirSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { checkConfig, type Config, type State, type Source } from "./model.js";
const postsSchema = `CREATE TABLE IF NOT EXISTS posts(post_id TEXT PRIMARY KEY,url TEXT NOT NULL UNIQUE,title TEXT NOT NULL,subreddit TEXT NOT NULL,published TEXT NOT NULL,date_evidence TEXT NOT NULL,accessed TEXT NOT NULL,jtbd TEXT NOT NULL,score INTEGER NOT NULL DEFAULT 0,text_verified INTEGER NOT NULL CHECK(text_verified IN(0,1)),quote TEXT NOT NULL,reason TEXT NOT NULL,query TEXT NOT NULL,batch INTEGER NOT NULL CHECK(batch>0),evidence_summary TEXT NOT NULL,CHECK(typeof(score)='integer' AND ((score=0 AND text_verified=0) OR (score BETWEEN 1 AND 5 AND text_verified=1))));`;
export class Store {
  db: DatabaseSync;
  dir: string;
  constructor(dir: string) {
    this.dir = dir;
    mkdirSync(dir, { recursive: true });
    this.db = new DatabaseSync(join(dir, "findings.sqlite"));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
   ${postsSchema}
   CREATE TABLE IF NOT EXISTS rating_history(id INTEGER PRIMARY KEY,post_id TEXT NOT NULL,changed_at TEXT NOT NULL DEFAULT(strftime('%Y-%m-%dT%H:%M:%fZ','now')),old_score INTEGER,new_score INTEGER,old_reason TEXT,new_reason TEXT NOT NULL);
   CREATE TRIGGER IF NOT EXISTS initial_rating AFTER INSERT ON posts BEGIN INSERT INTO rating_history(post_id,new_score,new_reason) VALUES(NEW.post_id,NEW.score,NEW.reason); END;
   CREATE TRIGGER IF NOT EXISTS changed_rating AFTER UPDATE ON posts WHEN OLD.score IS NOT NEW.score OR OLD.reason IS NOT NEW.reason BEGIN INSERT INTO rating_history(post_id,old_score,new_score,old_reason,new_reason) VALUES(NEW.post_id,OLD.score,NEW.score,OLD.reason,NEW.reason); END;
   CREATE TRIGGER IF NOT EXISTS retain_posts BEFORE DELETE ON posts BEGIN SELECT RAISE(ABORT,'Findings are cumulative'); END;
   CREATE TABLE IF NOT EXISTS loop_kv(key TEXT PRIMARY KEY,value TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS loop_events(id INTEGER PRIMARY KEY,at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,iteration INTEGER NOT NULL,phase TEXT NOT NULL,detail TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS loop_methods(id INTEGER PRIMARY KEY,parent INTEGER,status TEXT NOT NULL,search_guide TEXT NOT NULL,assess_guide TEXT NOT NULL,lesson TEXT NOT NULL,baseline REAL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
   CREATE TABLE IF NOT EXISTS loop_plans(iteration INTEGER PRIMARY KEY,method INTEGER NOT NULL,content TEXT NOT NULL,metrics TEXT);
   CREATE TABLE IF NOT EXISTS loop_calls(id INTEGER PRIMARY KEY,iteration INTEGER NOT NULL,kind TEXT NOT NULL,input TEXT NOT NULL,output TEXT,error TEXT,elapsed_ms INTEGER,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
   CREATE TABLE IF NOT EXISTS loop_sources(post_id TEXT PRIMARY KEY,content TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS loop_queries(query TEXT PRIMARY KEY,iteration INTEGER NOT NULL,result TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS loop_calibration(id TEXT PRIMARY KEY,content TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS loop_feedback(id INTEGER PRIMARY KEY,text TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
   CREATE TABLE IF NOT EXISTS loop_human_scores(post_id TEXT PRIMARY KEY,score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),reason TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS loop_observations(iteration INTEGER PRIMARY KEY,method INTEGER NOT NULL,content TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS loop_lock(id INTEGER PRIMARY KEY CHECK(id=1),pid INTEGER NOT NULL);
  `);
    this.tx(() => {
      if (
        !this.db
          .prepare("PRAGMA table_info(posts)")
          .all()
          .find((c) => c.name === "score")!.notnull
      ) {
        const definitions = this.db
          .prepare(
            "SELECT sql FROM sqlite_master WHERE tbl_name='posts' AND type IN ('trigger','index') AND sql IS NOT NULL",
          )
          .all();
        this.db.exec("ALTER TABLE posts RENAME TO posts_previous_schema");
        this.db.exec(postsSchema);
        this.db.exec(
          `INSERT INTO posts SELECT post_id,url,title,subreddit,published,date_evidence,accessed,jtbd,COALESCE(score,0),text_verified,quote,reason,query,batch,evidence_summary FROM posts_previous_schema`,
        );
        this.db.exec("DROP TABLE posts_previous_schema");
        for (const definition of definitions)
          this.db.exec(String(definition.sql));
      }
      if (
        !this.db
          .prepare("PRAGMA table_info(loop_feedback)")
          .all()
          .some((c) => c.name === "scope")
      )
        this.db.exec(
          "ALTER TABLE loop_feedback ADD COLUMN scope TEXT NOT NULL DEFAULT 'criteria'",
        );
      if (
        !this.db
          .prepare("PRAGMA table_info(loop_calls)")
          .all()
          .some((c) => c.name === "step_key")
      ) {
        this.db.exec("ALTER TABLE loop_calls ADD COLUMN step_key TEXT");
      }
      this.db.exec(
        "CREATE INDEX IF NOT EXISTS loop_calls_step ON loop_calls(step_key)",
      );
    });
  }
  tx<T>(fn: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const r = fn();
      this.db.exec("COMMIT");
      return r;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
  get<T = any>(key: string): T | undefined {
    const row = this.db
      .prepare("SELECT value FROM loop_kv WHERE key=?")
      .get(key);
    return row ? JSON.parse(String(row.value)) : undefined;
  }
  set(key: string, value: any) {
    this.db
      .prepare(
        "INSERT INTO loop_kv VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      )
      .run(key, JSON.stringify(value));
  }
  config(): Config {
    const c = this.get<Config>("config");
    if (!c) throw Error("Run is not initialized; use init first");
    return c;
  }
  initialize(c: Config, criteria: string, guide: string) {
    checkConfig(c);
    if (this.get("config")) throw Error("Run is already initialized");
    if (!criteria.trim() || criteria.length > 18000)
      throw Error("Criteria must contain 1–18000 characters");
    this.tx(() => {
      this.set("policy", 2);
      this.set("config", c);
      this.set("criteria", criteria);
      const id = Number(
        this.db
          .prepare(
            "INSERT INTO loop_methods(status,search_guide,assess_guide,lesson) VALUES('active',?,'Use the human criteria and original evidence.','Initial method')",
          )
          .run(guide).lastInsertRowid,
      );
      this.set("activeMethod", id);
      const previous = Number(
        this.db.prepare("SELECT COALESCE(MAX(batch),0) n FROM posts").get()!.n,
      );
      this.set("state", {
        status: "stopped",
        phase: "plan",
        iteration: previous,
        target: previous,
        calls: 0,
        empty: 0,
        queryIndex: 0,
        postIndex: 0,
        evalIndex: 0,
        evaluations: [],
        queue: [],
        queries: [],
        newRelevant: 0,
        known: 0,
        method: id,
        candidate: null,
        error: null,
        mode: "search",
      });
    });
    this.snapshot();
  }
  state(): State {
    const s = this.get<State>("state");
    if (!s) throw Error("Initialize the run first");
    return s;
  }
  event(s: State, detail: any) {
    this.db
      .prepare("INSERT INTO loop_events(iteration,phase,detail) VALUES(?,?,?)")
      .run(s.iteration, s.phase, JSON.stringify(detail));
  }
  checkpoint(s: State, detail: any, write?: () => void) {
    this.tx(() => {
      write?.();
      this.set("state", s);
      this.event(s, detail);
    });
    this.snapshot();
  }
  snapshot() {
    const s = this.state();
    const plan = this.db
      .prepare("SELECT content FROM loop_plans ORDER BY iteration DESC LIMIT 1")
      .get();
    for (const [name, text] of [
      [
        "execution_state.md",
        `# Generated execution state\n\nSQLite is authoritative.\n\n\`\`\`json\n${JSON.stringify({ ...s, pendingAssessment: s.pendingAssessment ? "Stored in SQLite" : null, queue: s.queue.map((p) => p.id) }, null, 2)}\n\`\`\`\n`,
      ],
      [
        "search-plan.md",
        `# Generated current plan\n\nFull versions and metrics: SQLite loop_plans.\n\n${plan ? String(plan.content) : "No plan yet."}\n`,
      ],
    ]) {
      writeFileSync(join(this.dir, name + ".tmp"), text);
      renameSync(join(this.dir, name + ".tmp"), join(this.dir, name));
    }
  }
  begin(iterations: number) {
    if (!Number.isInteger(iterations) || iterations < 1 || iterations > 50)
      throw Error("Iterations must be 1–50");
    const s = this.state();
    if (
      s.status === "running" ||
      s.status === "paused" ||
      s.status === "failed"
    )
      throw Error("Unfinished execution: use resume");
    s.target = s.iteration + iterations;
    s.iteration++;
    s.status = "running";
    s.phase = "plan";
    s.calls = 0;
    s.empty = 0;
    s.error = null;
    s.mode = "search";
    s.method = this.get<number>("activeMethod")!;
    this.checkpoint(s, { started: iterations }, () => this.upgradePolicy(s));
  }
  resume() {
    const s = this.state();
    if (!["running", "paused", "failed"].includes(s.status))
      throw Error("No unfinished execution");
    s.status = "running";
    s.error = null;
    this.checkpoint(s, { resumed: true }, () => this.upgradePolicy(s));
  }
  method(id: number | undefined): any {
    if (id === undefined) throw Error("Missing method");
    return this.db.prepare("SELECT * FROM loop_methods WHERE id=?").get(id);
  }
  criteria(): string {
    return this.get<string>("criteria")!;
  }
  addCalibration(value: any) {
    this.db
      .prepare(
        "INSERT INTO loop_calibration VALUES(?,?) ON CONFLICT(id) DO UPDATE SET content=excluded.content",
      )
      .run(value.id, JSON.stringify(value));
  }
  calibrations(): any[] {
    return this.db
      .prepare("SELECT content FROM loop_calibration ORDER BY id LIMIT 8")
      .all()
      .map((x) => JSON.parse(String(x.content)));
  }
  feedback(text: string, scope = "criteria") {
    if (!["criteria", "search"].includes(scope))
      throw Error("Feedback scope must be criteria or search");
    if (!text.trim() || text.length > 4000)
      throw Error("Feedback must be 1–4000 characters");
    if ((this.feedbackText(scope) + "\n" + text).length > 8000)
      throw Error(
        "Feedback context would exceed 8000 characters; consolidate criteria before adding more",
      );
    this.tx(() => {
      const id = Number(
        this.db
          .prepare("INSERT INTO loop_feedback(text,scope) VALUES(?,?)")
          .run(text, scope).lastInsertRowid,
      );
      if (scope === "search") this.set("pendingSearchFeedback", id);
      this.set(
        "feedbackRevision",
        Number(this.get("feedbackRevision") ?? 0) + 1,
      );
    });
  }
  feedbackText(scope = "criteria"): string {
    return this.db
      .prepare("SELECT text FROM loop_feedback WHERE scope=? ORDER BY id")
      .all(scope)
      .map((x) => String(x.text))
      .join("\n");
  }
  rate(id: string, score: number, reason: string) {
    if (!Number.isInteger(score) || score < 1 || score > 5 || !reason.trim())
      throw Error("Human rating requires score 1–5 and reason");
    const row = this.db.prepare("SELECT * FROM posts WHERE post_id=?").get(id);
    if (!row) throw Error("Unknown post");
    this.tx(() => {
      const previous = this.db
        .prepare("SELECT score,reason FROM loop_human_scores WHERE post_id=?")
        .get(id);
      this.event(this.state(), {
        humanRating: { id, score, reason, previous: previous ?? null },
      });
      this.db
        .prepare(
          "INSERT INTO loop_human_scores VALUES(?,?,?) ON CONFLICT(post_id) DO UPDATE SET score=excluded.score,reason=excluded.reason",
        )
        .run(id, score, reason);
      // Existing table requires text_verified for scored records. Do not fabricate source verification.
      if (row.text_verified === 1)
        this.db
          .prepare("UPDATE posts SET score=?,reason=? WHERE post_id=?")
          .run(score, "Human: " + reason, id);
      const source = this.source(id);
      if (source?.verified) this.addCalibration({ ...source, expected: score });
    });
  }
  upgradePolicy(s: State) {
    if (this.get("policy") === 2) return;
    const active = this.method(this.get<number>("activeMethod"));
    if (active.status === "trial")
      this.db
        .prepare("UPDATE loop_methods SET status='active' WHERE id=?")
        .run(active.id);
    if (s.phase === "improve" || s.phase === "evaluate") {
      if (s.candidate)
        this.db
          .prepare(
            "UPDATE loop_methods SET status='superseded' WHERE id=? AND status='proposed'",
          )
          .run(s.candidate);
      s.phase = "observe";
      s.candidate = null;
    }
    this.set("policy", 2);
    this.event(s, {
      policy: 2,
      reason:
        "Adopt observation-driven search; retain historical methods and stop mandatory batch calibration.",
    });
  }
  observations(limit = 3): any[] {
    return this.db
      .prepare(
        "SELECT content FROM loop_observations ORDER BY iteration DESC LIMIT ?",
      )
      .all(limit)
      .map((x) => JSON.parse(String(x.content)));
  }
  observe(s: State) {
    const c = this.config();
    const queries = this.db
      .prepare("SELECT query,result FROM loop_queries WHERE iteration=?")
      .all(s.iteration)
      .map((row) => {
        const result = JSON.parse(String(row.result));
        const posts = result.sources
          .map((p: Source) =>
            this.db
              .prepare(
                "SELECT post_id,title,subreddit,score,quote,reason,published,batch FROM posts WHERE post_id=?",
              )
              .get(p.id),
          )
          .filter(Boolean);
        return {
          query: row.query,
          error: result.error,
          found: posts.length,
          newRelevant: posts.filter(
            (p: any) =>
              p.batch === s.iteration &&
              p.score >= 3 &&
              p.published >= c.from &&
              p.published <= c.through,
          ).length,
          examples: posts
            .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
            .slice(0, 3)
            .map((p: any) => ({
              ...p,
              title: p.title.slice(0, 200),
              reason: p.reason.slice(0, 400),
              quote: p.quote.slice(0, 600),
            })),
        };
      });
    return {
      iteration: s.iteration,
      method: s.method,
      queries,
      newRelevant: s.newRelevant,
      duplicates: s.known,
      complete: queries.every((q) => !q.error),
      lesson:
        "Use author wording and query outcomes to choose the next queries; access errors are not relevance evidence.",
    };
  }
  beginAssessment(guide: string, reason: string) {
    if (!guide.trim() || guide.length > 4000 || !reason.trim())
      throw Error(
        "Assessment guide and reason required (guide <=4000 characters)",
      );
    const s = this.state(),
      m = this.method(this.get<number>("activeMethod"));
    if (s.status !== "stopped" || m.status === "search_trial")
      throw Error("Finish the current execution/search trial first");
    if (!this.calibrations().length)
      throw Error(
        "Add labeled control examples before changing assessment instructions",
      );
    if (guide === m.assess_guide)
      throw Error("Assessment instruction is unchanged");
    s.iteration++;
    s.target = s.iteration;
    s.phase = "evaluate";
    s.mode = "calibrate";
    s.status = "running";
    s.calls = 0;
    s.evalIndex = 0;
    s.evaluations = [];
    s.queue = [];
    s.queries = [];
    s.newRelevant = 0;
    s.empty = 0;
    s.method = m.id;
    s.error = null;
    this.checkpoint(s, { assessmentChange: guide, reason }, () => {
      s.candidate = Number(
        this.db
          .prepare(
            "INSERT INTO loop_methods(parent,status,search_guide,assess_guide,lesson) VALUES(?,'proposed',?,?,?)",
          )
          .run(m.id, m.search_guide, guide, reason).lastInsertRowid,
      );
    });
  }
  source(id: string): Source | undefined {
    const row = this.db
      .prepare("SELECT content FROM loop_sources WHERE post_id=?")
      .get(id);
    return row ? JSON.parse(String(row.content)) : undefined;
  }
  saveLead(p: Source, query: string, batch: number) {
    this.db
      .prepare(
        "INSERT INTO loop_sources VALUES(?,?) ON CONFLICT(post_id) DO UPDATE SET content=excluded.content",
      )
      .run(p.id, JSON.stringify(p));
    this.db
      .prepare(
        "INSERT OR IGNORE INTO posts VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .run(
        p.id,
        p.url,
        p.title,
        p.subreddit,
        p.published,
        p.evidence,
        new Date().toISOString().slice(0, 10),
        "[]",
        0,
        0,
        "",
        "Awaiting source assessment",
        query,
        batch,
        p.body.slice(0, 400),
      );
  }
  saveScore(p: Source, a: any) {
    const human = this.db
      .prepare("SELECT * FROM loop_human_scores WHERE post_id=?")
      .get(p.id);
    this.db
      .prepare(
        "UPDATE posts SET title=?,published=?,date_evidence=?,accessed=?,jtbd=?,score=?,text_verified=1,quote=?,reason=?,evidence_summary=? WHERE post_id=?",
      )
      .run(
        p.title,
        p.published,
        p.evidence,
        new Date().toISOString().slice(0, 10),
        JSON.stringify(a.jobs),
        human?.score ?? a.score,
        a.quote,
        human ? "Human: " + String(human.reason) : a.reason,
        p.comments.length
          ? `Read ${p.comments.length} RSS comment excerpts; not an exhaustive comment export.`
          : "No comments captured.",
        p.id,
      );
  }
  lock() {
    this.tx(() => {
      const r = this.db.prepare("SELECT pid FROM loop_lock WHERE id=1").get();
      if (r) {
        let alive = true;
        try {
          process.kill(Number(r.pid), 0);
        } catch (e: any) {
          if (e.code === "ESRCH") alive = false;
        }
        if (alive) throw Error("Another runner is active for this database");
      }
      this.db
        .prepare("INSERT OR REPLACE INTO loop_lock VALUES(1,?)")
        .run(process.pid);
    });
  }
  unlock() {
    this.db.prepare("DELETE FROM loop_lock WHERE pid=?").run(process.pid);
  }
  close() {
    this.db.close();
  }
}
