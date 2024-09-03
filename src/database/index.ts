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

export * from "./accounts";
export * from "./events";
export * from "./following";
export * from "./groups";
export * from "./invites";
export * from "./magic-links";
export * from "./magic-links";
export * from "./membership";
export * from "./newsletters";
export * from "./notifications";
export * from "./posts";
export * from "./profiles";
export * from "./replies";
export * from "./reset-tokens";
export * from "./sessions";
export * from "./subscriptions";
export * from "./users";
export * from "./verify-email";
export * from "./utils";
