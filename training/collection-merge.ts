import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const collectionFilePath = fileURLToPath(
  new URL(
    "./dataset.json",
    import.meta.url,
  ),
);

type CollectionEntry = {
  task: string; // "You are given the schema of a NoSQL collection, some context information about the environment, and a request from a user. Your task is to first write down your interpretation of the request and then generate a NoSQL query object in JSON that answers the request.\nHere is a list of available operators:\n`{ $keyword: string }` - Matches Names, IDs, enums, and similar strings, uses fuzzy matching to correct for typos. Use this for exact, syntactic matches.\n`{ $text: string }` - Matches properties that contain the given search and common synonyms. Use this for semantic matches, like titles, descriptions, details, species, classes of objects etc.\n`{ $year: number }` - Matches ISO dates that have the given year.\n`{ $month: number }` - Matches ISO dates that have the given month.\n`{ $day: number }` - Matches ISO dates that have the given day.\n`{ $dayOfWeek: 1-7 }` - Matches ISO dates that have the given day of the week, where 1 is Monday and 7 is Sunday.\n`{ $time: \"HH:mm:ss\" }` - Matches ISO dates that have the given time.\n`{ $date: \"YYYY-MM-DD\" }` - Matches ISO dates that have the given date.\nYou can use the following common operators: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$and`, `$or`, `$not`, `$nor`, `$exists`, `$where`, `$all`, `$elemMatch` and `$size`.",
  schema: string; // "{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"title\":\"Shift Report\",\"type\":\"object\",\"properties\":{\"reportId\":{\"description\":\"Unique identifier for the shift report\",\"type\":\"string\"},\"patientName\":{\"description\":\"Name of the patient\",\"type\":\"string\"},\"patientId\":{\"description\":\"Unique identifier for the patient\",\"type\":\"string\"},\"date\":{\"description\":\"Date when the shift report was prepared\",\"type\":\"string\",\"format\":\"date\"},\"time\":{\"description\":\"Time when the shift report was prepared\",\"type\":\"string\",\"format\":\"time\"},\"nurseName\":{\"description\":\"Name of the nurse who prepared the shift report\",\"type\":\"string\"},\"nurseId\":{\"description\":\"Unique identifier for the nurse who prepared the shift report\",\"type\":\"string\"},\"patientCondition\":{\"description\":\"Current medical condition of the patient\",\"type\":\"string\"},\"treatments\":{\"description\":\"List of treatments given to the patient during the shift\",\"type\":\"array\",\"items\":{\"type\":\"object\",\"properties\":{\"treatmentName\":{\"description\":\"Name of the treatment\",\"type\":\"string\"},\"treatmentTime\":{\"description\":\"Time when the treatment was given\",\"type\":\"string\",\"format\":\"time\"},\"nurseName\":{\"description\":\"Name of the nurse who administered the treatment\",\"type\":\"string\"},\"nurseId\":{\"description\":\"Unique identifier for the nurse who administered the treatment\",\"type\":\"string\"}},\"required\":[\"treatmentName\",\"treatmentTime\",\"nurseName\",\"nurseId\"]}},\"statusChanges\":{\"description\":\"List of any changes in the patient's status during the shift\",\"type\":\"array\",\"items\":{\"type\":\"object\",\"properties\":{\"statusChangeTime\":{\"description\":\"Time when the status change occurred\",\"type\":\"string\",\"format\":\"time\"},\"oldStatus\":{\"description\":\"Previous status of the patient\",\"type\":\"string\"},\"newStatus\":{\"description\":\"Current status of the patient\",\"type\":\"string\"},\"nurseName\":{\"description\":\"Name of the nurse who reported the status change\",\"type\":\"string\"},\"nurseId\":{\"description\":\"Unique identifier for the nurse who reported the status change\",\"type\":\"string\"}},\"required\":[\"statusChangeTime\",\"oldStatus\",\"newStatus\",\"nurseName\",\"nurseId\"]}}},\"required\":[\"reportId\",\"patientName\",\"patientId\",\"date\",\"time\",\"nurseName\",\"nurseId\",\"patientCondition\",\"treatments\",\"statusChanges\"]}",
  context: string; // "{\"today\":\"2024-08-29T08:45:42.362Z\",\"user\":{\"name\":\"Elmar Jackson\",\"age\":47,\"language\":\"en\",\"timezone\":\"Europe/London\",\"location\":{\"city\":\"Paris\",\"country\":\"France\"}}}",
  request: string; // "\"Patient 'J' report ID 789012\"",
  interpretation: string; // "[{\"phrase\":\"Patient 'J'\",\"interpretation\":\"This phrase likely refers to the `patientName` field in the schema. It should contain a value that starts with the letter 'J' (case-insensitive).\"},{\"phrase\":\"report ID 789012\",\"interpretation\":\"This phrase likely refers to the `reportId` field in the schema. It should contain the exact value '789012'.\"}]",
  query: string; // "{\"$and\":[{\"patientName\":{\"$text\":{\"$search\":\"J*\"}}},{\"reportId\":{\"$keyword\":\"789012\"}}]}",
  example: string; // "{\"request\":\"physiotherapy during day patient\",\"interpretation\":[{\"phrase\":\"physiotherapy\",\"interpretation\":\"This phrase refers to the `treatmentName` field in an element of the `treatments` array. It should semantically refer to physiotherapy or its synonyms.\"},{\"phrase\":\"during\",\"interpretation\":\"This phrase is used to indicate that the `treatmentTime` field in the `treatments` array should match the time when physiotherapy was given. It could also indicate that the `statusChanges` array should contain an entry for the time when physiotherapy was given.\"},{\"phrase\":\"day\",\"interpretation\":\"This phrase could have different meanings depending on the context. It could refer to the `time` field in the top-level schema, indicating that the shift report was prepared during the daytime (between 00:00 and 23:59). Alternatively, it could refer to the `statusChanges` array, indicating that the patient's status was changed during the day. It could also refer to the `treatmentTime` field in the `treatments` array, indicating that physiotherapy was given during the daytime (between 00:00 and 23:59).\"},{\"phrase\":\"patient\",\"interpretation\":\"This phrase refers to the top-level `patient` object, indicating that the search term is in the context of a specific patient.\"}],\"query\":{\"$and\":[{\"treatments\":{\"$elemMatch\":{\"treatmentName\":{\"$text\":\"physiotherapy\"},\"treatmentTime\":{\"$gte\":\"00:00:00\",\"$lte\":\"23:59:59\"}}}},{\"time\":{\"$gte\":\"00:00:00\",\"$lte\":\"23:59:59\"}}]},\"context\":{\"today\":\"2025-05-17T09:04:09.837Z\",\"user\":{\"name\":\"Andreea Gega\",\"age\":25,\"language\":\"en-gb\",\"timezone\":\"-0\",\"location\":{\"city\":\"Rome\",\"country\":\"Italy\"}}}}",
  input: string; // "Schema:\n```json\n{\n  \"$schema\": \"http://json-schema.org/draft-07/schema#\",\n  \"title\": \"Shift Report\",\n  \"type\": \"object\",\n  \"properties\": {\n    \"reportId\": {\n      \"description\": \"Unique identifier for the shift report\",\n      \"type\": \"string\"\n    },\n    \"patientName\": {\n      \"description\": \"Name of the patient\",\n      \"type\": \"string\"\n    },\n    \"patientId\": {\n      \"description\": \"Unique identifier for the patient\",\n      \"type\": \"string\"\n    },\n    \"date\": {\n      \"description\": \"Date when the shift report was prepared\",\n      \"type\": \"string\",\n      \"format\": \"date\"\n    },\n    \"time\": {\n      \"description\": \"Time when the shift report was prepared\",\n      \"type\": \"string\",\n      \"format\": \"time\"\n    },\n    \"nurseName\": {\n      \"description\": \"Name of the nurse who prepared the shift report\",\n      \"type\": \"string\"\n    },\n    \"nurseId\": {\n      \"description\": \"Unique identifier for the nurse who prepared the shift report\",\n      \"type\": \"string\"\n    },\n    \"patientCondition\": {\n      \"description\": \"Current medical condition of the patient\",\n      \"type\": \"string\"\n    },\n    \"treatments\": {\n      \"description\": \"List of treatments given to the patient during the shift\",\n      \"type\": \"array\",\n      \"items\": {\n        \"type\": \"object\",\n        \"properties\": {\n          \"treatmentName\": {\n            \"description\": \"Name of the treatment\",\n            \"type\": \"string\"\n          },\n          \"treatmentTime\": {\n            \"description\": \"Time when the treatment was given\",\n            \"type\": \"string\",\n            \"format\": \"time\"\n          },\n          \"nurseName\": {\n            \"description\": \"Name of the nurse who administered the treatment\",\n            \"type\": \"string\"\n          },\n          \"nurseId\": {\n            \"description\": \"Unique identifier for the nurse who administered the treatment\",\n            \"type\": \"string\"\n          }\n        },\n        \"required\": [\n          \"treatmentName\",\n          \"treatmentTime\",\n          \"nurseName\",\n          \"nurseId\"\n        ]\n      }\n    },\n    \"statusChanges\": {\n      \"description\": \"List of any changes in the patient's status during the shift\",\n      \"type\": \"array\",\n      \"items\": {\n        \"type\": \"object\",\n        \"properties\": {\n          \"statusChangeTime\": {\n            \"description\": \"Time when the status change occurred\",\n            \"type\": \"string\",\n            \"format\": \"time\"\n          },\n          \"oldStatus\": {\n            \"description\": \"Previous status of the patient\",\n            \"type\": \"string\"\n          },\n          \"newStatus\": {\n            \"description\": \"Current status of the patient\",\n            \"type\": \"string\"\n          },\n          \"nurseName\": {\n            \"description\": \"Name of the nurse who reported the status change\",\n            \"type\": \"string\"\n          },\n          \"nurseId\": {\n            \"description\": \"Unique identifier for the nurse who reported the status change\",\n            \"type\": \"string\"\n          }\n        },\n        \"required\": [\n          \"statusChangeTime\",\n          \"oldStatus\",\n          \"newStatus\",\n          \"nurseName\",\n          \"nurseId\"\n        ]\n      }\n    }\n  },\n  \"required\": [\n    \"reportId\",\n    \"patientName\",\n    \"patientId\",\n    \"date\",\n    \"time\",\n    \"nurseName\",\n    \"nurseId\",\n    \"patientCondition\",\n    \"treatments\",\n    \"statusChanges\"\n  ]\n}\n```\n\nExample Context:\n```json\n{\n  \"today\": \"2025-05-17T09:04:09.837Z\",\n  \"user\": {\n    \"name\": \"Andreea Gega\",\n    \"age\": 25,\n    \"language\": \"en-gb\",\n    \"timezone\": \"-0\",\n    \"location\": {\n      \"city\": \"Rome\",\n      \"country\": \"Italy\"\n    }\n  }\n}\n```\nExample Request: \"physiotherapy during day patient\"\nExample Interpretation:\n```json\n[\n  {\n    \"phrase\": \"physiotherapy\",\n    \"interpretation\": \"This phrase refers to the `treatmentName` field in an element of the `treatments` array. It should semantically refer to physiotherapy or its synonyms.\"\n  },\n  {\n    \"phrase\": \"during\",\n    \"interpretation\": \"This phrase is used to indicate that the `treatmentTime` field in the `treatments` array should match the time when physiotherapy was given. It could also indicate that the `statusChanges` array should contain an entry for the time when physiotherapy was given.\"\n  },\n  {\n    \"phrase\": \"day\",\n    \"interpretation\": \"This phrase could have different meanings depending on the context. It could refer to the `time` field in the top-level schema, indicating that the shift report was prepared during the daytime (between 00:00 and 23:59). Alternatively, it could refer to the `statusChanges` array, indicating that the patient's status was changed during the day. It could also refer to the `treatmentTime` field in the `treatments` array, indicating that physiotherapy was given during the daytime (between 00:00 and 23:59).\"\n  },\n  {\n    \"phrase\": \"patient\",\n    \"interpretation\": \"This phrase refers to the top-level `patient` object, indicating that the search term is in the context of a specific patient.\"\n  }\n]\n```\nExample Query:\n```json\n{\n  \"$and\": [\n    {\n      \"treatments\": {\n        \"$elemMatch\": {\n          \"treatmentName\": {\n            \"$text\": \"physiotherapy\"\n          },\n          \"treatmentTime\": {\n            \"$gte\": \"00:00:00\",\n            \"$lte\": \"23:59:59\"\n          }\n        }\n      }\n    },\n    {\n      \"time\": {\n        \"$gte\": \"00:00:00\",\n        \"$lte\": \"23:59:59\"\n      }\n    }\n  ]\n}\n```\n\nContext:\n```json\n{\n  \"today\": \"2024-08-29T08:45:42.362Z\",\n  \"user\": {\n    \"name\": \"Elmar Jackson\",\n    \"age\": 47,\n    \"language\": \"en\",\n    \"timezone\": \"Europe/London\",\n    \"location\": {\n      \"city\": \"Paris\",\n      \"country\": \"France\"\n    }\n  }\n}\n```\nRequest: \"Patient 'J' report ID 789012\"",
  output: string; // "Interpretation:\n```json\n[\n  {\n    \"phrase\": \"Patient 'J'\",\n    \"interpretation\": \"This phrase likely refers to the `patientName` field in the schema. It should contain a value that starts with the letter 'J' (case-insensitive).\"\n  },\n  {\n    \"phrase\": \"report ID 789012\",\n    \"interpretation\": \"This phrase likely refers to the `reportId` field in the schema. It should contain the exact value '789012'.\"\n  }\n]\n```\nQuery:\n```json\n{\n  \"$and\": [\n    {\n      \"patientName\": {\n        \"$text\": {\n          \"$search\": \"J*\"\n        }\n      }\n    },\n    {\n      \"reportId\": {\n        \"$keyword\": \"789012\"\n      }\n    }\n  ]\n}\n```"
};

const textToSqlFilePath = fileURLToPath(
  new URL(
    "./texttosqlv2.jsonl",
    import.meta.url,
  ),
);

const mergedFilePath = fileURLToPath(
  new URL(
    "./dataset_merged_predibase.json",
    import.meta.url,
  ),
);

console.log("Read the collection file");
const collectionData = await fs.readFile(collectionFilePath, "utf-8");

console.log("Read the text to sql file");
const textToSqlData = await fs.readFile(textToSqlFilePath).then((res) =>
  res.subarray(0, 10000000).toString("utf-8")
);

console.log("Merge the data");
const mergedData = mergeResults(collectionData, textToSqlData);

console.log("Write the merged data");
await fs.writeFile(mergedFilePath, mergedData, "utf-8");

function mergeResults(
  collectionString: string,
  textToSqlString: string,
): string {
  const collectionInput = JSON.parse(collectionString) as {
    train: CollectionEntry[];
    eval: CollectionEntry[];
  };
  const textToSql = textToSqlString.split("\n").map((line) => {
    try {
      return JSON.parse(line);
    } catch (e) {
      console.error(e);
    }
  }).filter((v) => v) as {
    instruction: string; // "Name the home team for carlton away team",
    input: string; // "CREATE TABLE table_name_77 (\n    home_team VARCHAR,\n    away_team VARCHAR\n)",
    response: string; // "SELECT home_team FROM table_name_77 WHERE away_team = \"carlton\"",
    source: string; // "sql_create_context",
    text: string; // "Below are sql tables schemas paired with instruction that describes a task. Using valid SQLite, write a response that appropriately completes the request for the provided tables. ### Instruction: Name the home team for carlton away team ### Input: CREATE TABLE table_name_77 (\n    home_team VARCHAR,\n    away_team VARCHAR\n) ### Response: SELECT home_team FROM table_name_77 WHERE away_team = \"carlton\""
  }[];
  console.log("adding", textToSql.length, "entries to the collection.");

  const dataset: {
    prompt: string;
    completion: string;
    split: "train" | "evaluation";
  }[] = [];

  for (const entry of textToSql.slice(0, 2000)) {
    dataset.push({
      prompt: [
        "You are given the schema of a SQLite database and a request from a user. Your task generate a SQLite query that answers the request.",
        "Schema:",
        "```sql",
        entry.input,
        "```",
        `Request: "${entry.instruction}"`,
      ].join("\n"),
      completion: [
        "Query:",
        "```sql",
        entry.response,
        "```",
      ].join("\n"),
      split: "train",
    });
  }

  for (const entry of collectionInput.train) {
    dataset.push({
      prompt: `${entry.task}\n${entry.input}`,
      completion: entry.output,
      split: "train",
    });
  }

  for (const entry of collectionInput.eval) {
    dataset.push({
      prompt: `${entry.task}\n${entry.input}`,
      completion: entry.output,
      split: "evaluation",
    });
  }

  return JSON.stringify(dataset);
}
