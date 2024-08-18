import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as DatabaseSchema from "./schema";

export * from "./schema";

export type AppDatabase = DrizzleD1Database<typeof DatabaseSchema>;

let _db: AppDatabase;

export function getDB() {
  // eslint-disable-next-line
  if (!_db) {
    throw new Error("DB not set");
  }
  return _db;
}

export async function initializeDbIfNeeded(
  factory: () => Promise<AppDatabase>
) {
  // eslint-disable-next-line
  if (!_db) {
    _db = await factory();
  }
}
