export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export function toJsonValue(input: unknown): JsonValue {
  return JSON.parse(JSON.stringify(input));
}
