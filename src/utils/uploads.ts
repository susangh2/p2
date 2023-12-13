import { mkdirSync } from "fs";

export let uploadDir = "uploads";

mkdirSync(uploadDir, { recursive: true });

export function toArray<T>(field: T[] | T | undefined): T[] {
  return Array.isArray(field) ? field : field ? [field] : [];
}
