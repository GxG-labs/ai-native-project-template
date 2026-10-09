import { Ajv } from "ajv";
export type Config = {
  from: string;
  through: string;
  queries: number;
  postsPerQuery: number;
  maxCalls: number;
  timeoutSeconds: number;
  noProgress: number;
};
export type Source = {
  id: string;
  url: string;
  subreddit: string;
  title: string;
  published: string;
  body: string;
  comments: string[];
  evidence: string;
  verified: boolean;
};
export type Phase =
  | "plan"
  | "search"
  | "read"
  | "assess"
  | "save"
  | "observe"
  | "improve"
  | "evaluate"
  | "finish";
export type State = {
  status: string;
  phase: Phase;
  iteration: number;
  target: number;
  calls: number;
  empty: number;
  queryIndex: number;
  postIndex: number;
  evalIndex: number;
  evaluations: any[];
  queue: Source[];
  queries: string[];
  newRelevant: number;
  known: number;
  method: number;
  candidate: number | null;
  error: string | null;
  mode: "search" | "reassess" | "calibrate";
  pendingAssessment?: any;
};
const str = { type: "string", minLength: 1, maxLength: 4000 };
const obj = (properties: any) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
export const schemas: Record<string, any> = {
  plan: obj({
    queries: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string", minLength: 3, maxLength: 240 },
    },
    reason: str,
    amendment: {
      anyOf: [
        { type: "null" },
        obj({
          rule: { type: "string", minLength: 1, maxLength: 1000 },
          reason: str,
          trigger: { enum: ["repeated_error", "general_rule", "human"] },
          evidenceIterations: {
            type: "array",
            maxItems: 3,
            items: { type: "integer", minimum: 1 },
          },
        }),
      ],
    },
  }),
  assess: obj({
    score: { type: "integer", minimum: 1, maximum: 5 },
    quote: { type: "string", maxLength: 600 },
    reason: str,
    jobs: {
      type: "array",
      maxItems: 4,
      uniqueItems: true,
      items: { enum: ["J1", "J2", "J3", "J4"] },
    },
  }),
  review: obj({ decision: { enum: ["keep", "revert"] }, reason: str }),
};
const ajv = new Ajv({ allErrors: true });
const validators = Object.fromEntries(
  Object.entries(schemas).map(([k, v]) => [k, ajv.compile(v)]),
);
export function checked(kind: string, value: any): any {
  if (kind === "plan" && value && value.amendment === undefined)
    value = { ...value, amendment: null };
  if (!validators[kind]?.(value))
    throw Error(
      `Invalid ${kind} output: ${ajv.errorsText(validators[kind]?.errors)}`,
    );
  return value;
}
export function day(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function checkConfig(c: Config) {
  if (!day(c.from) || !day(c.through) || c.from > c.through)
    throw Error("Invalid publication window");
  for (const [key, max] of Object.entries({
    queries: 4,
    postsPerQuery: 10,
    maxCalls: 500,
    timeoutSeconds: 600,
    noProgress: 10,
  })) {
    const v = c[key as keyof Config];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > max)
      throw Error(`Invalid ${key} (1–${max})`);
  }
}
export const norm = (s: string) => s.replace(/\s+/g, " ").trim();
export function checkAssessment(result: any, source: Source) {
  checked("assess", result);
  if (!source.verified) throw Error("Cannot assess unverified source");
  if (
    !norm(result.quote) ||
    !norm(source.body).includes(norm(result.quote)) ||
    result.quote.split(/\s+/).length > 50
  )
    throw Error("Assessment quote is not in original post or exceeds 50 words");
}
