import { resolve, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { Store } from "./store.js";
import { Engine } from "./engine.js";
import { LiveProvider } from "./providers.js";
import { checkConfig, type Source } from "./model.js";

const { values: v, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    run: { type: "string" },
    template: { type: "string" },
    iterations: { type: "string" },
    calls: { type: "string" },
    model: { type: "string" },
    text: { type: "string" },
    scope: { type: "string" },
    reason: { type: "string" },
    id: { type: "string" },
    score: { type: "string" },
    limit: { type: "string" },
    from: { type: "string" },
    through: { type: "string" },
  },
});
const command = positionals[0] ?? "help";
if (command === "help") {
  console.log(`Local research loop (Node >=22.16 + logged-in Codex CLI)
init --run PATH [--template PATH] [--from YYYY-MM-DD --through YYYY-MM-DD]
run --run PATH [--iterations 3] [--model MODEL]
resume --run PATH [--calls NEW_TOTAL_LIMIT]
status | list | history --run PATH [--limit 30]
feedback --run PATH [--scope criteria|search] --text "Your correction"
assessment-guide --run PATH --text "New scoring instruction" --reason "Why"
rate --run PATH --id POST_ID --score 1..5 --text "Why"
reassess --run PATH [--id POST_ID] [--limit 1000]
Ctrl-C checkpoints a pause; resume continues without requiring this chat.`);
  process.exit(0);
}
if (!v.run) throw Error("--run is required");
const dir = resolve(v.run);
const store = new Store(dir);
let locked = false;
const controller = new AbortController();
const stop = () => controller.abort();
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
try {
  if (
    ["init", "run", "resume", "reassess", "assessment-guide"].includes(command)
  ) {
    store.lock();
    locked = true;
  }
  if (command === "init") {
    const template = resolve(
      v.template ??
        fileURLToPath(
          new URL("../../../templates/reddit-research/", import.meta.url),
        ),
    );
    const config = JSON.parse(
      readFileSync(join(template, "config.json"), "utf8"),
    );
    if (v.from) config.from = v.from;
    if (v.through) config.through = v.through;
    const count = store.db.prepare("SELECT count(*) n FROM posts").get()!.n;
    if (Number(count) > 0)
      store.db
        .prepare("VACUUM INTO ?")
        .run(join(dir, `before-ts-${Date.now()}.sqlite`));
    store.db.exec(
      "CREATE TABLE IF NOT EXISTS source_archive(name TEXT PRIMARY KEY,content TEXT NOT NULL)",
    );
    for (const name of ["execution_state.md", "search-plan.md"])
      if (existsSync(join(dir, name)))
        store.db
          .prepare("INSERT OR IGNORE INTO source_archive VALUES(?,?)")
          .run("before-ts/" + name, readFileSync(join(dir, name), "utf8"));
    store.initialize(
      config,
      readFileSync(join(template, "criteria.txt"), "utf8"),
      readFileSync(join(template, "method.txt"), "utf8"),
    );
    for (const c of JSON.parse(
      readFileSync(join(template, "calibration.json"), "utf8"),
    ))
      store.addCalibration(c);
    console.log(
      `Initialized ${dir}; preserved ${count} posts. Window ${config.from}–${config.through}.`,
    );
  } else if (command === "status") {
    console.log(
      JSON.stringify(
        {
          state: store.state(),
          config: store.config(),
          posts: store.db.prepare("SELECT count(*) total FROM posts").get(),
          method: store.method(store.get<number>("activeMethod")),
        },
        null,
        2,
      ),
    );
  } else if (command === "list") {
    const limit = Number(v.limit ?? 30);
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000)
      throw Error("limit must be 1–1000");
    console.log(
      JSON.stringify(
        store.db
          .prepare(
            "SELECT post_id,title,published,subreddit,score,reason,url,(published BETWEEN ? AND ?) AS within_window FROM posts ORDER BY within_window DESC,score DESC,published DESC LIMIT ?",
          )
          .all(store.config().from, store.config().through, limit),
        null,
        2,
      ),
    );
  } else if (command === "history") {
    console.log(
      JSON.stringify(
        {
          methods: store.db
            .prepare("SELECT * FROM loop_methods ORDER BY id DESC LIMIT 20")
            .all(),
          steps: store.db
            .prepare("SELECT * FROM loop_events ORDER BY id DESC LIMIT 30")
            .all(),
        },
        null,
        2,
      ),
    );
  } else if (command === "feedback") {
    if (!v.text) throw Error("--text required");
    const s = store.state();
    if (s.mode === "calibrate" && s.status !== "stopped")
      throw Error(
        "Finish the active scoring calibration before changing its criteria.",
      );
    store.feedback(v.text, v.scope ?? "criteria");
    console.log(
      "Feedback saved. Used by future model calls; run reassess to update existing scores.",
    );
  } else if (command === "rate") {
    const s = store.state();
    if (s.mode === "calibrate" && s.status !== "stopped")
      throw Error(
        "Finish the active scoring calibration before changing its control ratings.",
      );
    store.rate(v.id ?? "", Number(v.score), v.text ?? "");
    console.log("Human rating saved and protected from automated overwrite.");
  } else if (
    ["run", "resume", "reassess", "assessment-guide"].includes(command)
  ) {
    if (v.calls) {
      const c = store.config();
      c.maxCalls = Number(v.calls);
      checkConfig(c);
      store.set("config", c);
    }
    if (command === "run") store.begin(Number(v.iterations ?? 3));
    if (command === "resume") store.resume();
    if (command === "assessment-guide")
      store.beginAssessment(v.text ?? "", v.reason ?? "");
    if (command === "reassess") {
      const limit = Number(v.limit ?? 1000);
      if (!Number.isInteger(limit) || limit < 1 || limit > 1000)
        throw Error("limit must be 1–1000");
      const selected = v.id
        ? store.db.prepare("SELECT * FROM posts WHERE post_id=?").all(v.id)
        : store.db
            .prepare("SELECT * FROM posts ORDER BY post_id LIMIT ?")
            .all(limit);
      if (!selected.length) throw Error("No posts to reassess");
      store.begin(1);
      const s = store.state();
      s.mode = "reassess";
      s.phase = "read";
      s.postIndex = 0;
      s.queries = [];
      s.newRelevant = 0;
      s.queue = selected.map(
        (p) =>
          store.source(String(p.post_id)) ??
          ({
            id: String(p.post_id),
            url: String(p.url),
            subreddit: String(p.subreddit),
            title: String(p.title),
            published: String(p.published),
            body: "",
            comments: [],
            evidence: String(p.date_evidence),
            verified: false,
          } satisfies Source),
      );
      store.checkpoint(s, { reassess: selected.length });
    }
    const c = store.config();
    await new Engine(
      store,
      new LiveProvider(c.timeoutSeconds, controller.signal, v.model),
      controller.signal,
    ).run();
  } else throw Error(`Unknown command: ${command}`);
} catch (e) {
  console.error(String(e));
  process.exitCode = 1;
} finally {
  if (locked) store.unlock();
  store.close();
  process.removeListener("SIGINT", stop);
  process.removeListener("SIGTERM", stop);
}
