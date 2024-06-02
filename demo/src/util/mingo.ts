import { Context, OperatorType } from "mingo/core";
import { resolve } from "mingo/util";
import { createSyncFn } from "./sync_worker.cjs";

export const createEmbedding = await createSyncFn(
  new URL("./mingo-embed.cjs", import.meta.url).pathname,
) as (input: { query?: string; passage?: string }) => number[];

export function cosinesim(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const magnitudeA = Math.sqrt(
    a.reduce((sum, value) => sum + value * value, 0),
  );
  const magnitudeB = Math.sqrt(
    b.reduce((sum, value) => sum + value * value, 0),
  );
  return dotProduct / (magnitudeA * magnitudeB);
}

/*
      "`{ $keyword: string }` - Matches IDs, enums, and strictly equal strings. Use this for exact matches, like IDs or enums.",
      "`{ $text: string }` - Matches properties that contain the given search and common synonyms. Use this for semantic matches.",
      "`{ $year: number }` - Matches ISO dates that have the given year.",
      "`{ $month: number }` - Matches ISO dates that have the given month.",
      "`{ $day: number }` - Matches ISO dates that have the given day.",
      "`{ $dayOfWeek: 1-7 }` - Matches ISO dates that have the given day of the week, where 1 is Monday and 7 is Sunday.",
      '`{ $time: "HH:mm:ss" }` - Matches ISO dates that have the given time.',
      '`{ $date: "YYYY-MM-DD" }` - Matches ISO dates that have the given date.',
*/
export const mingoContext = Context.init({
  [OperatorType.QUERY]: {
    $keyword: (selector, configIn, options) => {
      const config = typeof configIn === "string"
        ? { $search: configIn }
        : configIn as { $search: string };
      if (!config.$search) throw new Error("Expected $search option");
      return ((obj) => {
        const actual = resolve(obj, selector, {});
        if (typeof actual !== "string") {
          throw new Error("Expected string, got " + typeof actual);
        }
        return actual.toLocaleLowerCase().includes(
          config.$search.toLocaleLowerCase(),
        );
      });
    },
    $text: (selector, configIn, options) => {
      const config = typeof configIn === "string"
        ? { $search: configIn }
        : configIn as { $search: string };
      if (!config.$search) throw new Error("Expected $search option");
      const searchEmb = createEmbedding({ query: config.$search });
      const tokens = config.$search.split(/[^A-Za-z0-9]/g).filter((x) => x);
      return ((obj) => {
        const value = resolve(obj, selector, {});
        if (typeof value !== "string") {
          throw new Error("Expected string, got " + typeof value);
        }
        const valueEmb = createEmbedding({ passage: value });

        const similarity = cosinesim(searchEmb, valueEmb);
        const similar = similarity > 0.85;
        const match = tokens
          .every((word: string) =>
            value.toLocaleLowerCase().includes(word.toLocaleLowerCase())
          );

        return match || similar;
      });
    },
    $year: (selector, value, options) => {
      return ((obj) => {
        const actual = resolve(obj, selector, {});
        if (typeof actual !== "string") {
          throw new Error("Expected string value");
        }
        const date = new Date(actual);
        return date.getFullYear() === value;
      });
    },
    $month: (selector, value, options) => {
      return ((obj) => {
        const actual = resolve(obj, selector, {});
        if (typeof actual !== "string") {
          throw new Error("Expected string value");
        }
        const date = new Date(actual);
        return date.getMonth() + 1 === value;
      });
    },
    $day: (selector, value, options) => {
      return ((obj) => {
        const actual = resolve(obj, selector, {});
        if (typeof actual !== "string") {
          throw new Error("Expected string value");
        }
        const date = new Date(actual);
        return date.getDate() === value;
      });
    },
    $dayOfWeek: (selector, value, options) => {
      return ((obj) => {
        const actual = resolve(obj, selector, {});
        if (typeof actual !== "string") {
          throw new Error("Expected string value");
        }
        const date = new Date(actual);
        return date.getDay() + 1 === value;
      });
    },
    $time: (selector, value, options) => {
      return ((obj) => {
        const actual = resolve(obj, selector, {});
        if (typeof actual !== "string") {
          throw new Error("Expected string, got " + typeof actual);
        }
        const date = new Date(actual);
        const time = date.toISOString().split("T")[1];
        return time.startsWith(value + "");
      });
    },
    $date: (selector, value: any, options) => {
      let lte = "9999-12-31T23:59:59.999Z";
      let gte = "0000-01-01T00:00:00.000Z";
      if (typeof value === "object") {
        if (
          !("$eq" in value || "$lt" in value || "$lte" in value ||
            "$gt" in value || "$gte" in value)
        ) {
          throw new Error(
            "$date expected object with $eq, $lt, $lte, $gt, or $gte",
          );
        }
        if (value!.$lte) lte = value!.$lte + "T23:59:59.999Z";
        if (value!.$gte) gte = value!.$gte + "T00:00:00.000Z";
        if (value!.$lt) lte = value!.$lt + "T00:00:00.000Z";
        if (value!.$gt) gte = value!.$gt + "T23:59:59.999Z";
        if (value!.$eq) {
          lte = value!.$eq + "T23:59:59.999Z";
          gte = value!.$eq + "T00:00:00.000Z";
        }
      }
      if (typeof value === "string") {
        lte = value + "T23:59:59.999Z";
        gte = value + "T00:00:00.000Z";
      }
      return ((obj) => {
        const actual = resolve(obj, selector, {});
        if (typeof actual !== "string") {
          throw new Error("Expected string, got " + typeof actual);
        }
        const date = new Date(actual);
        return date.getTime() <= new Date(lte).getTime() &&
          date.getTime() >= new Date(gte).getTime();
      });
    },
  },
});

export const operators = [
  { "$eq": {} },
  { "$gt": {} },
  { "$gte": {} },
  { "$lt": {} },
  { "$lte": {} },
  { "$ne": {} },

  { "$not": {} },
  { "$or": [] },
  { "$and": [] },

  { "$in": [] },
  { "$nin": [] },

  { "$size": "number" },
  { "$elemMatch": {} },
  { "$all": {} },

  { "$text": "string" },
  { "$regex": "string" },
  { "$keyword": "string" },

  { "$type": "string" },
  { "$exists": "boolean" },

  { "$date": "string" },
  { "$time": "string" },
  { "$dayOfWeek": "number" },
  { "$day": "number" },
  { "$month": "number" },
  { "$year": "number" },
];
