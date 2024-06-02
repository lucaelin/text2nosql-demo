import { cosinesim, createEmbedding } from "./mingo.js";
import { findJsonArray, findJsonObject } from "./json.js";
import { createPredibaseCompletion } from "./predibase.js";

type Interpretation = { phrase: string; interpretation: string }[];

type Example = {
  context?: any;
  request: string;
  interpretation: Interpretation;
  query: any;
};

export class ExampleCache {
  private examples: (Example & {
    vec: number[];
  })[] = [];

  async find(search: string): Promise<(Example & { similarity: number })[]> {
    const targetVec = await createEmbedding({ query: search });
    const exampleSimilarities = this.examples.map((e) => ({
      ...e,
      similarity: cosinesim(e.vec, targetVec),
    })).sort(
      (a, b) => b.similarity - a.similarity,
    );

    return exampleSimilarities;
  }

  async add(example: Example) {
    const vec = await createEmbedding({ passage: example.request });
    this.examples.push({ ...example, vec });
  }
}

export function genFilterQueryPrompt(
  { schema, context, request, example, interpretation, query }: {
    schema: any;
    context?: any;
    request: string;
    example?: Example;
    interpretation?: Interpretation;
    query?: any;
  },
): { task: string; input: string; output?: string } {
  return {
    task: [
      "You are given the schema of a NoSQL collection, some context information about the environment, and a request from a user. Your task is to first write down your interpretation of the request and then generate a NoSQL query object in JSON that answers the request.",
      "Here is a list of available operators:",
      "`{ $keyword: string }` - Matches Names, IDs, enums, and similar strings, uses fuzzy matching to correct for typos. Use this for exact, syntactic matches.",
      "`{ $text: string }` - Matches properties that contain the given search and common synonyms. Use this for semantic matches, like titles, descriptions, details, species, classes of objects etc.",
      "`{ $year: number }` - Matches ISO dates that have the given year.",
      "`{ $month: number }` - Matches ISO dates that have the given month.",
      "`{ $day: number }` - Matches ISO dates that have the given day.",
      "`{ $dayOfWeek: 1-7 }` - Matches ISO dates that have the given day of the week, where 1 is Monday and 7 is Sunday.",
      '`{ $time: "HH:mm:ss" }` - Matches ISO dates that have the given time.',
      '`{ $date: "YYYY-MM-DD" }` - Matches ISO dates that have the given date.',
      "You can use the following common operators: `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$and`, `$or`, `$not`, `$nor`, `$exists`, `$where`, `$all`, `$elemMatch` and `$size`.",
    ].join("\n"),
    input: [
      "Schema:",
      "```json",
      JSON.stringify("items" in schema ? schema.items : schema, null, 2),
      "```",
      ...(example
        ? [
          "",
          ...(example.context
            ? [
              "Example Context:",
              "```json",
              JSON.stringify(example.context, null, 2),
              "```",
            ]
            : []),
          `Example Request: ${JSON.stringify(example.request, null, 2)}`,
          "Example Interpretation:",
          "```json",
          JSON.stringify(example.interpretation, null, 2),
          "```",
          "Example Query:",
          "```json",
          JSON.stringify(example.query, null, 2),
          "```",
          "",
        ]
        : []),
      ...(context
        ? [
          "Context:",
          "```json",
          JSON.stringify(context, null, 2),
          "```",
        ]
        : []),
      `Request: "${request}"`,
    ].join("\n"),
    output: (interpretation || query)
      ? [
        "Interpretation:",
        "```json",
        JSON.stringify(interpretation, null, 2),
        "```",
        ...(query
          ? [
            "Query:",
            "```json",
            JSON.stringify(query, null, 2),
            "```",
          ]
          : []),
      ].join("\n")
      : undefined,
  };
}

export async function genFilterQuery(
  { schema, context, request, example, interpretation, additionalOptions }: {
    schema: any;
    context?: any;
    example?: { request: string; interpretation: any; query: any };
    request: string;
    interpretation?: Interpretation;
    additionalOptions?: Partial<
      Parameters<typeof createPredibaseCompletion>[0]
    >;
  },
): Promise<
  { interpretation: { phrase: string; interpretation: string }[]; query: any }
> {
  const timeStart = Date.now();
  const prompt = genFilterQueryPrompt({
    schema,
    context,
    request,
    example,
    interpretation,
  });

  const config: {
    adapter: string;
    base_model: string;
    prompt: (config: typeof prompt) => string;
  } = [{
    prompt: ({ task, input }) => [task, input].join("\n"),
    adapter: "filter_v2/2", // mixtral single epoch
    base_model: "mixtral-8x7b-instruct-v0-1",
  }, {
    prompt: ({ task, input }) => [task, input].join("\n"),
    adapter: "filter_v2/3", // mistral on instruct 1 epoch
    base_model: "mistral-7b-instruct-v0-3",
  }, {
    prompt: ({ task, input }) =>
      [
        "<s>[INST] <<SYS>>",
        task,
        "<</SYS>>",
        `${input} [/INST]`,
      ].join("\n"),
    adapter: "filter_v2/5", // codellama-70b-instruct 1 epoch
    base_model: "codellama-70b-instruct",
  }, {
    prompt: ({ task, input }) =>
      [
        "<s>[INST] <<SYS>>",
        task,
        "<</SYS>>",
        `${input} [/INST]`,
      ].join("\n"),
    adapter: "filter_v2/4", // codellama-13b-instruct 1 epoch
    base_model: "codellama-13b-instruct",
    active: true,
  }].find((v) => v.active)!;

  const response = await createPredibaseCompletion({
    input: config.prompt(prompt),
    ...config,
  });

  console.log("response", response);
  const timeEnd = Date.now();
  console.log("time", timeEnd - timeStart);

  const interpretationResult = findJsonArray(
    response.split("\n```\n")[0],
  ) as any[];
  const queryResult = findJsonObject(response.split("\n```\n")[1]) ?? {};

  return {
    interpretation: interpretationResult,
    query: Object.keys(queryResult).every((k) => k === "$eq")
      ? queryResult["$eq"]
      : queryResult,
  };
}
