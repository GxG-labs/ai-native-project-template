import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../src/loop/store.js";
import { Engine } from "../src/loop/engine.js";
import { parseFeed, canonical } from "../src/loop/providers.js";

const config = {
  from: "2026-06-05",
  through: "2026-10-05",
  queries: 1,
  postsPerQuery: 2,
  maxCalls: 40,
  timeoutSeconds: 120,
  noProgress: 2,
};
const source = {
  id: "abc123",
  url: "https://www.reddit.com/r/budget/comments/abc123/",
  subreddit: "budget",
  title: "Safe to spend",
  published: "2026-09-01",
  body: "I reserve bill money and calculate what is safe to spend.",
  comments: [],
  evidence: "RSS published: 2026-09-01",
  verified: true,
};
function setup() {
  const dir = mkdtempSync(join(tmpdir(), "research-loop-test-"));
  const store = new Store(dir);
  store.initialize(
    config,
    "Find financial coordination problems.",
    "Explore varied everyday phrases.",
  );
  return {
    dir,
    store,
    done: () => {
      store.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
function provider(regress = false) {
  return {
    async ask(kind: string, input: any): Promise<any> {
      if (kind === "plan")
        return {
          queries: ["safe spending " + input.iteration],
          reason: "Test another phrase",
        };
      if (kind === "assess")
        return {
          score:
            input.calibration && regress && input.guide === "bad"
              ? 1
              : (input.expected ?? 4),
          quote: "I reserve bill money",
          reason: "Allocation problem",
          jobs: ["J2"],
        };
      if (kind === "improve")
        return {
          searchGuide: "Explore paydays and bills.",
          assessGuide: regress ? "bad" : "Use the supplied criteria.",
          lesson: "A specific money action was useful.",
        };
      throw Error("unexpected kind");
    },
    async search() {
      return [source];
    },
    async read() {
      return source;
    },
  };
}
test("persists each stage, resumes without repeated search, keeps old records and rating history", async () => {
  const f = setup();
  try {
    let searches = 0;
    const p = provider();
    p.search = async () => {
      searches++;
      return [source];
    };
    f.store.begin(1);
    let e = new Engine(f.store, p);
    await e.step();
    await e.step(); // plan, search
    assert.equal(searches, 1);
    e = new Engine(f.store, p);
    await e.run();
    assert.equal(searches, 1);
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM posts").get()!.n,
      1,
    );
    assert.equal(f.store.state().status, "stopped");
    f.store.rate("abc123", 1, "Not relevant to me");
    f.store.begin(1);
    await new Engine(f.store, p).run();
    assert.equal(f.store.db.prepare("SELECT score FROM posts").get()!.score, 1);
    assert.ok(
      Number(
        f.store.db.prepare("SELECT count(*) n FROM rating_history").get()!.n,
      ) >= 2,
    );
    assert.throws(() => f.store.db.exec("DELETE FROM posts"));
  } finally {
    f.done();
  }
});
test("validates original RSS identity, date and body; never treats removed content as evidence", () => {
  const xml = `<feed><entry><id>t3_abc123</id><title>Safe money</title><published>2026-09-01T00:00:00Z</published><category term="budget"/><link href="https://www.reddit.com/r/budget/comments/abc123/title/"/><content type="html">&lt;div class="md"&gt;&lt;p&gt;I reserve bills.&lt;/p&gt;&lt;/div&gt;</content></entry></feed>`;
  assert.equal(parseFeed(xml)[0].body, "I reserve bills.");
  assert.equal(
    parseFeed(xml.replace("I reserve bills.", "[removed]"))[0].verified,
    false,
  );
  assert.throws(() =>
    canonical("https://evil.example/r/budget/comments/abc123/"),
  );
  assert.throws(() =>
    canonical("https://www.reddit.com/r/budget/comments/abc123/title/comment/"),
  );
});
test("quote fabrication fails without losing prior checkpoint", async () => {
  const f = setup();
  try {
    const p = provider();
    const base = p.ask;
    p.ask = async (k, i) =>
      k === "assess"
        ? { score: 5, quote: "invented evidence", reason: "bad", jobs: [] }
        : base(k, i);
    f.store.begin(1);
    const e = new Engine(f.store, p);
    await assert.rejects(e.run(), /quote/i);
    assert.equal(f.store.state().phase, "assess");
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM posts").get()!.n,
      1,
    ); // discovered lead survives
    assert.equal(f.store.db.prepare("SELECT score FROM posts").get()!.score, 0);
  } finally {
    f.done();
  }
});
test("exclusive runner lock and atomic checkpoint survive a failed write", () => {
  const f = setup();
  try {
    f.store.lock();
    assert.throws(() => f.store.lock(), /active/);
    const original = f.store.state();
    assert.throws(() =>
      f.store.checkpoint(
        { ...original, phase: "assess" },
        { bad: true },
        () => {
          throw Error("write failure");
        },
      ),
    );
    assert.equal(f.store.state().phase, original.phase);
    f.store.unlock();
    f.store.lock();
    f.store.unlock();
  } finally {
    f.done();
  }
});
test("feedback persists and is included in subsequent bounded calls", async () => {
  const f = setup();
  try {
    f.store.feedback("Similar product builders always score 5.");
    const p = provider();
    const ask = p.ask;
    let seen = false;
    p.ask = async (k, i) => {
      assert.match(i.humanFeedback, /builders always score 5/);
      seen = true;
      return ask(k, i);
    };
    f.store.begin(1);
    await new Engine(f.store, p).run();
    assert.ok(seen);
  } finally {
    f.done();
  }
});
test("call budget stops execution at a resumable checkpoint", async () => {
  const f = setup();
  try {
    f.store.set("config", { ...config, maxCalls: 1 });
    f.store.begin(1);
    await assert.rejects(
      new Engine(f.store, provider()).run(),
      /budget exhausted/,
    );
    assert.equal(f.store.state().calls, 1);
    assert.equal(f.store.state().phase, "assess");
    f.store.set("config", config);
    f.store.resume();
    await new Engine(f.store, provider()).run();
    assert.equal(f.store.state().status, "stopped");
  } finally {
    f.done();
  }
});
test("keeps original RSS evidence when the optional detail/comment request fails", async () => {
  const f = setup();
  try {
    const p = provider();
    p.read = async () => {
      throw Error("Reddit HTTP 429");
    };
    f.store.begin(1);
    await new Engine(f.store, p).run();
    assert.equal(f.store.db.prepare("SELECT score FROM posts").get()!.score, 4);
    assert.match(f.store.source(source.id)!.evidence, /detail read failed/);
  } finally {
    f.done();
  }
});
test("a separate process resumes a saved model response without repeating search or spending budget", async () => {
  const f = setup();
  try {
    f.store.feedback("Preserve this human correction.");
    f.store.addCalibration({ ...source, expected: 4 });
    f.store.begin(1);
    const { spawnSync } = await import("node:child_process");
    const engineUrl = new URL("../src/loop/engine.js", import.meta.url).href;
    const storeUrl = new URL("../src/loop/store.js", import.meta.url).href;
    const script = `import {Store} from ${JSON.stringify(storeUrl)};
      import {Engine} from ${JSON.stringify(engineUrl)};
      const s=new Store(${JSON.stringify(f.dir)});s.lock();
      const p=(${provider.toString()})(); const source=${JSON.stringify(source)};
      const e=new Engine(s,p);await e.step();await e.step();await e.step();
      s.set('config',{...s.config(),maxCalls:2});
      const checkpoint=s.checkpoint.bind(s);s.checkpoint=(state,detail,write)=>{if(state.phase==='save')process.exit(73);checkpoint(state,detail,write);};
      await e.step();`;
    const first = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", script],
      { encoding: "utf8" },
    );
    assert.equal(first.status, 73, first.stderr);
    assert.equal(f.store.state().phase, "assess");
    const resume = `import {Store} from ${JSON.stringify(storeUrl)};
      import {Engine} from ${JSON.stringify(engineUrl)};
      const s=new Store(${JSON.stringify(f.dir)});s.lock();s.resume();
      const fail=async()=>{throw Error('Unexpected external call');};
      const e=new Engine(s,{ask:fail,search:fail,read:fail});await e.step();await e.step();s.unlock();s.close();`;
    const second = spawnSync(
      process.execPath,
      ["--input-type=module", "-e", resume],
      { encoding: "utf8" },
    );
    assert.equal(second.status, 0, second.stderr);
    assert.equal(f.store.state().phase, "observe");
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM loop_queries").get()!.n,
      1,
    );
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM loop_calls").get()!.n,
      2,
    );
    assert.equal(f.store.db.prepare("SELECT score FROM posts").get()!.score, 4);
    assert.match(f.store.feedbackText(), /Preserve/);
    assert.equal(f.store.calibrations().length, 1);
    const detail = JSON.parse(
      String(
        f.store.db
          .prepare("SELECT detail FROM loop_events ORDER BY id DESC LIMIT 1")
          .get()!.detail,
      ),
    );
    assert.equal(detail.completedStep.phase, "save");
    assert.equal(detail.next.phase, "observe");
    assert.ok(
      f.store.db
        .prepare("SELECT output FROM loop_calls WHERE kind='assess'")
        .get()!.output,
    );
    assert.ok(detail.reason);
  } finally {
    f.done();
  }
});
test("failed amendment commits neither method nor plan and reuses the saved response", async () => {
  const f = setup();
  try {
    f.store.feedback("Prefer concise community-specific queries.", "search");
    f.store.begin(1);
    let calls = 0;
    const p = provider();
    const ask = p.ask;
    p.ask = async (k, i) => {
      calls++;
      return {
        ...(await ask(k, i)),
        amendment: {
          rule: "Prefer concise community-specific queries.",
          reason: "Explicit human correction.",
          trigger: "human",
          evidenceIterations: [],
        },
      };
    };
    f.store.db.exec(
      "CREATE TRIGGER fail_method BEFORE INSERT ON loop_methods BEGIN SELECT RAISE(ABORT,'injected failure'); END;",
    );
    const e = new Engine(f.store, p);
    await assert.rejects(e.step(), /injected failure/);
    assert.equal(f.store.get("activeMethod"), 1);
    assert.equal(f.store.state().phase, "plan");
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM loop_plans").get()!.n,
      0,
    );
    f.store.db.exec("DROP TRIGGER fail_method");
    await e.step();
    assert.equal(calls, 1);
    assert.equal(
      f.store.method(f.store.get<number>("activeMethod")).status,
      "search_trial",
    );
  } finally {
    f.done();
  }
});

test("human corrections to unverified findings retain every revision", () => {
  const f = setup();
  try {
    f.store.saveLead({ ...source, verified: false, body: "" }, "test", 1);
    f.store.rate(source.id, 5, "Audience lead");
    f.store.rate(source.id, 2, "Correction after review");
    const events = f.store.db
      .prepare("SELECT detail FROM loop_events")
      .all()
      .map((x) => JSON.parse(String(x.detail)))
      .filter((x) => x.humanRating);
    assert.deepEqual(
      events.map((x) => x.humanRating.score),
      [5, 2],
    );
    assert.equal(f.store.db.prepare("SELECT score FROM posts").get()!.score, 0);
  } finally {
    f.done();
  }
});

test("ordinary batches only plan and assess; next plan sees author wording and failed searches", async () => {
  const f = setup();
  try {
    const p = provider();
    let kinds: string[] = [];
    const ask = p.ask;
    p.ask = async (k, i) => {
      kinds.push(k);
      if (k === "plan" && i.iteration === 2) {
        assert.match(JSON.stringify(i), /I reserve bill money/);
        assert.match(JSON.stringify(i), /safe spending 1/);
      }
      return ask(k, i);
    };
    f.store.begin(2);
    await new Engine(f.store, p).run();
    assert.deepEqual(kinds, ["plan", "assess", "plan"]);
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM loop_methods").get()!.n,
      1,
    );
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM loop_observations").get()!.n,
      2,
    );
  } finally {
    f.done();
  }
});
test("one justified search amendment waits for three complete passes and never calibrates scoring", async () => {
  const f = setup();
  try {
    f.store.set("config", { ...config, noProgress: 10 });
    const p = provider();
    const ask = p.ask;
    let reviewed = 0;
    p.ask = async (k, i) => {
      if (k === "plan") {
        const r = await ask(k, i);
        return {
          ...r,
          amendment:
            i.iteration === 3
              ? {
                  rule: "Try short problem phrases in relevant communities.",
                  reason: "Two batches show duplicated broad results.",
                  trigger: "repeated_error",
                  evidenceIterations: [1, 2],
                }
              : null,
        };
      }
      if (k === "review") {
        reviewed++;
        assert.equal(i.passes.length, 3);
        return {
          decision: "revert",
          reason:
            "The specific rule did not help across three complete passes.",
        };
      }
      assert.equal(k, "assess");
      return ask(k, i);
    };
    f.store.begin(3);
    await new Engine(f.store, p).run();
    const trial = f.store.get<number>("activeMethod")!;
    assert.equal(f.store.method(trial).status, "search_trial");
    assert.equal(reviewed, 0);
    const search = p.search;
    p.search = async () => {
      throw Error("HTTP 429");
    };
    f.store.begin(1);
    await new Engine(f.store, p).run();
    assert.equal(f.store.method(trial).status, "search_trial");
    assert.equal(reviewed, 0);
    p.search = search;
    f.store.begin(2);
    await new Engine(f.store, p).run();
    assert.equal(reviewed, 1);
    assert.equal(f.store.method(trial).status, "reverted");
    assert.equal(
      f.store.method(trial).assess_guide,
      f.store.method(1).assess_guide,
    );
  } finally {
    f.done();
  }
});
test("assessment examples run only for an explicit assessment-guide change", async () => {
  const f = setup();
  try {
    f.store.addCalibration({ ...source, expected: 5 });
    (f.store as any).beginAssessment(
      "bad",
      "Human requested a scoring instruction change.",
    );
    await new Engine(f.store, provider(true)).run();
    assert.equal(f.store.method(f.store.state().candidate!).status, "rejected");
    assert.equal(f.store.get<number>("activeMethod"), 1);
    const criteria = f.store.criteria();
    f.store.beginAssessment(
      "Apply the human criteria carefully.",
      "Explicit refinement.",
    );
    await new Engine(f.store, provider()).run();
    assert.equal(
      f.store.method(f.store.get<number>("activeMethod")).status,
      "active",
    );
    assert.equal(f.store.criteria(), criteria);
  } finally {
    f.done();
  }
});
test("every committed phase resumes in a fresh process through two whole batches", async () => {
  const f = setup();
  try {
    f.store.feedback("Keep these criteria.");
    f.store.begin(2);
    const { spawnSync } = await import("node:child_process");
    const engineUrl = new URL("../src/loop/engine.js", import.meta.url).href,
      storeUrl = new URL("../src/loop/store.js", import.meta.url).href;
    let steps = 0;
    const phases: string[] = [];
    while (f.store.state().status === "running" && steps++ < 25) {
      phases.push(f.store.state().phase);
      const code = `import {Store} from ${JSON.stringify(storeUrl)};import {Engine} from ${JSON.stringify(engineUrl)};
    const s=new Store(${JSON.stringify(f.dir)});s.lock();s.resume();const source=${JSON.stringify(source)};
    const p=(${provider.toString()})();const search=p.search;p.search=async()=>{s.set('testSearchCount',(s.get('testSearchCount')??0)+1);return search();};
    await new Engine(s,p).step();process.exit(0);`;
      const child = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", code],
        { encoding: "utf8", timeout: 10000 },
      );
      assert.equal(child.status, 0, child.stderr);
    }
    assert.equal(f.store.state().status, "stopped");
    assert.equal(f.store.get("testSearchCount"), 2);
    for (const phase of [
      "plan",
      "search",
      "read",
      "assess",
      "save",
      "observe",
      "finish",
    ])
      assert.ok(phases.includes(phase));
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM posts").get()!.n,
      1,
    );
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM rating_history").get()!.n,
      2,
    );
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM loop_calls").get()!.n,
      3,
    );
    assert.match(f.store.feedbackText(), /Keep/);
  } finally {
    f.done();
  }
});
test("access errors inform planning but cannot justify a search-instruction amendment", async () => {
  const f = setup();
  try {
    f.store.set("config", { ...config, noProgress: 10 });
    const p = provider();
    p.search = async () => {
      throw Error("HTTP 429");
    };
    p.ask = async (k, i) => {
      assert.equal(k, "plan");
      if (i.iteration > 1)
        assert.match(JSON.stringify(i.observations), /HTTP 429/);
      return {
        queries: ["access test " + i.iteration],
        reason: "Try another query",
        amendment:
          i.iteration === 3
            ? {
                rule: "Change the search strategy.",
                reason: "Requests failed.",
                trigger: "general_rule",
                evidenceIterations: [1, 2],
              }
            : null,
      };
    };
    f.store.begin(3);
    await new Engine(f.store, p).run();
    assert.equal(
      f.store.db.prepare("SELECT count(*) n FROM loop_methods").get()!.n,
      1,
    );
    assert.equal(f.store.state().empty, 0);
  } finally {
    f.done();
  }
});
test("observation and trial decision roll back together; review response is reused", async () => {
  const f = setup();
  try {
    f.store.feedback("Try concise queries.", "search");
    f.store.set("config", { ...config, noProgress: 10 });
    const p = provider(),
      ask = p.ask;
    let reviews = 0;
    p.ask = async (k, i) => {
      if (k === "review") {
        reviews++;
        return {
          decision: "revert",
          reason: "Three complete passes did not support this rule.",
        };
      }
      const r = await ask(k, i);
      return k === "plan"
        ? {
            ...r,
            amendment:
              i.iteration === 1
                ? {
                    rule: "Try concise queries.",
                    reason: "Human correction.",
                    trigger: "human",
                    evidenceIterations: [],
                  }
                : null,
          }
        : r;
    };
    f.store.begin(2);
    await new Engine(f.store, p).run();
    const trial = f.store.get<number>("activeMethod")!;
    f.store.begin(1);
    const e = new Engine(f.store, p);
    await e.step();
    await e.step();
    assert.equal(f.store.state().phase, "observe");
    f.store.db.exec(
      "CREATE TRIGGER fail_observation BEFORE INSERT ON loop_observations BEGIN SELECT RAISE(ABORT,'injected failure'); END;",
    );
    await assert.rejects(e.step(), /injected failure/);
    assert.equal(f.store.get("activeMethod"), trial);
    assert.equal(f.store.method(trial).status, "search_trial");
    f.store.db.exec("DROP TRIGGER fail_observation");
    await e.step();
    assert.equal(reviews, 1);
    assert.equal(f.store.method(trial).status, "reverted");
    assert.equal(f.store.state().phase, "finish");
  } finally {
    f.done();
  }
});
test("legacy unfinished batch calibration migrates to observations without losing findings", async () => {
  const f = setup();
  try {
    f.store.saveLead(source, "legacy query", 1);
    f.store.saveScore(source, {
      score: 4,
      quote: "I reserve bill money",
      reason: "Original assessment",
      jobs: ["J2"],
    });
    const before = f.store.db.prepare("SELECT * FROM posts").all(),
      history = f.store.db.prepare("SELECT * FROM rating_history").all();
    const candidate = Number(
      f.store.db
        .prepare(
          "INSERT INTO loop_methods(parent,status,search_guide,assess_guide,lesson) VALUES(1,'proposed','legacy search','legacy scoring','Old automatic proposal')",
        )
        .run().lastInsertRowid,
    );
    const s = f.store.state();
    s.iteration = 1;
    s.target = 1;
    s.phase = "evaluate";
    s.status = "failed";
    s.candidate = candidate;
    f.store.set("state", s);
    f.store.set("policy", 1);
    f.store.resume();
    assert.equal(f.store.state().phase, "observe");
    const fail = async () => {
      throw Error("Unexpected model call");
    };
    await new Engine(f.store, { ask: fail, read: fail, search: fail }).run();
    assert.equal(f.store.method(candidate).status, "superseded");
    assert.deepEqual(f.store.db.prepare("SELECT * FROM posts").all(), before);
    assert.deepEqual(
      f.store.db.prepare("SELECT * FROM rating_history").all(),
      history,
    );
  } finally {
    f.done();
  }
});
test("score column contains only integers 0–5; zero represents an unassessed original", () => {
  const f = setup();
  try {
    f.store.saveLead(source, "test", 1);
    assert.equal(f.store.db.prepare("SELECT score FROM posts").get()!.score, 0);
    for (const bad of [null, "5 stars", "5/5", -1, 6, 2.5])
      assert.throws(() =>
        f.store.db.prepare("UPDATE posts SET score=?").run(bad),
      );
    f.store.saveScore(source, {
      score: 5,
      quote: "I reserve bill money",
      reason: "Separate explanation",
      jobs: [],
    });
    assert.equal(f.store.db.prepare("SELECT score FROM posts").get()!.score, 5);
    assert.equal(
      f.store.db.prepare("SELECT reason FROM posts").get()!.reason,
      "Separate explanation",
    );
  } finally {
    f.done();
  }
});
test("human feedback and rating commands work while the search runner keeps its lock", async () => {
  const f = setup();
  try {
    f.store.saveLead(source, "test", 1);
    f.store.saveScore(source, {
      score: 5,
      quote: "I reserve bill money",
      reason: "Before correction",
      jobs: [],
    });
    f.store.begin(1);
    f.store.lock();
    const before = f.store.state();
    const { spawnSync } = await import("node:child_process");
    const cli = new URL("../src/loop/cli.js", import.meta.url);
    const { fileURLToPath } = await import("node:url");
    for (const args of [
      ["feedback", "--text", "Refusal to pay is not financial coordination."],
      ["rate", "--id", source.id, "--score", "2", "--text", "Human correction"],
    ]) {
      const result = spawnSync(
        process.execPath,
        [fileURLToPath(cli), ...args, "--run", f.dir],
        { encoding: "utf8" },
      );
      assert.equal(result.status, 0, result.stderr);
    }
    assert.deepEqual(f.store.state(), before);
    assert.equal(
      f.store.db.prepare("SELECT pid FROM loop_lock").get()!.pid,
      process.pid,
    );
    assert.equal(f.store.db.prepare("SELECT score FROM posts").get()!.score, 2);
    assert.match(f.store.feedbackText(), /Refusal/);
    f.store.unlock();
  } finally {
    f.done();
  }
});
