import express from "express";
import data from "./data.json.ts";
import schema from "./schema.json.ts";
import { Query } from "mingo";
import { cosinesim, mingoContext } from "./util/mingo.js";
import { genFilterQuery, genFilterQueryPrompt } from "./util/model.js";
import { createEmbedding } from "./util/mingo.js";

const app = express();
const port = 3000;

app.use(express.json());

const examples: {
  context?: any;
  request: string;
  interpretation: { request: string; interpretation: string }[];
  query: any;
  vec: number[];
}[] = [{
  request: "checkout 10.1. around 2pm",
  interpretation: [
    {
      request: "checkout",
      interpretation: "This phrase refers to the checkout field.",
    },
    {
      request: "10.1.",
      interpretation: "This phrase refers to the 1st of January of this year.",
    },
    {
      request: "around 2pm",
      interpretation:
        "This phrase refers to the time of day within 10 minutes, between 13:50 and 14:10.",
    },
  ],
  query: {
    $and: [
      {
        "bookingDetails.checkOut": {
          $time: { $gte: "13:50", $lte: "14:10" },
        },
      },
      {
        "bookingDetails.checkOut": {
          $date: "2024-01-10",
        },
      },
    ],
  },
  vec: await createEmbedding({ query: "checkout 10.1. around 2pm" }),
}];

// Serve the HTML page
app.get("/", (req, res) => {
  res.sendFile(new URL("./index.html", import.meta.url).pathname);
});

// The /search endpoint
app.get("/search", async (req, res) => {
  const search = req.query.q;
  console.log("incoming search", search);
  if (!search || search === "everything") {
    return res.json({ interpretation: "", query: {}, results: data });
  }

  const context = {
    today: new Date().toISOString(),
    user: { id: "EMP3991", name: "Andy Siemens", age: 42 },
  };

  try {
    const { example, interpretation, query } = await genResultQuery(
      schema,
      context,
      search as string,
    );

    console.log(interpretation);
    console.log(JSON.stringify(query, null, 2));

    const mingoQ = new Query(query, { context: mingoContext });

    const results = data.filter((d) => mingoQ.test(d));

    res.json({ example, context, search, interpretation, query, results });
  } catch (e: any) {
    console.error(e);
    res.json({
      context,
      search,
      interpretation: e.message,
      query: {},
      error: e,
      results: data,
    });
  }
});

app.post("/vote", async (req, res) => {
  const { context, search, interpretation, query, vote } = req.body;
  console.log("incoming vote", req.body);
  if (vote === "good") {
    const vec = await createEmbedding({ query: search });
    examples.push({ context, request: search, interpretation, query, vec });
  }
  res.json(req.body);
});

// The /schema endpoint
app.get("/schema", async (req, res) => {
  res.json(schema);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

async function genResultQuery(
  schema: any,
  context: any,
  request: string,
) {
  const provider = genFilterQuery;

  const targetVec = await createEmbedding({ query: request });
  const exampleSimilarities = examples.map((e) => ({
    ...e,
    similarity: cosinesim(e.vec, targetVec),
  })).sort(
    (a, b) => b.similarity - a.similarity,
  );
  const example = exampleSimilarities[0];
  console.log("using example", example);

  const { interpretation, query } = await provider({
    schema,
    context,
    request,
    example,
  });

  console.log("interpretation", interpretation);
  console.log("query", query);

  return {
    example: { request: example.request, similarity: example.similarity },
    context,
    interpretation,
    query,
  };
}
