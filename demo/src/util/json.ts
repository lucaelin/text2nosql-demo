import JSON5 from "json5";

export function findJsonObject(
  response: string,
): Record<string, unknown> | undefined {
  const objectStart = response.indexOf("{");
  const objectEnd = response.lastIndexOf("}");
  if (objectStart === -1 || objectEnd === -1) {
    return undefined;
  }

  const data = JSON5.parse(
    response.slice(objectStart, objectEnd + 1),
    (key, value) => value ?? undefined,
  );
  return data;
}

export function findJsonArray(
  response: string,
): unknown[] | undefined {
  const objectStart = response.indexOf("[");
  const objectEnd = response.lastIndexOf("]");
  if (objectStart === -1 || objectEnd === -1) {
    return undefined;
  }

  const data = JSON5.parse(
    response.slice(objectStart, objectEnd + 1),
    (key, value) => value ?? undefined,
  );
  return data;
}

type JSONObjectSchema = {
  type: "object";
  properties: { [key: string]: JSONSchema };
};
type JSONArraySchema = { type: "array"; items: JSONSchema };
type JSONPrimitiveSchema =
  | { type: "string" }
  | { type: "number" }
  | { type: "boolean" };

export type JSONSchema =
  | JSONObjectSchema
  | JSONArraySchema
  | JSONPrimitiveSchema
  | true;

export type JSONValueType =
  | boolean
  | number
  | string
  | { [x: string]: JSONValueType }
  | Array<JSONValueType>;

export type FromSchema<T extends JSONSchema> = T extends JSONObjectSchema
  ? { [key in keyof T["properties"]]: FromSchema<T["properties"][key]> }
  : T extends JSONArraySchema ? Array<FromSchema<T["items"]>>
  : T extends JSONPrimitiveSchema ? PrimitiveSchema<T["type"]>
  : T extends true ? JSONValueType
  : unknown;

type PrimitiveSchema<T extends "string" | "number" | "boolean"> = T extends
  "string" ? string
  : T extends "number" ? number
  : boolean;
