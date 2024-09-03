import type { userTable } from "./users.schema";

export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;

export type UserId = User["id"];
