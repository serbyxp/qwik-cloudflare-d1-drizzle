import type { UserId } from "~/database";
import type { sessionTable } from "./sessions.schema";

export type Sessions = typeof sessionTable.$inferSelect;
export type NewSession = typeof sessionTable.$inferInsert;

export type SessionId = Sessions["id"];

export type UserSession = {
  id: UserId;
};
