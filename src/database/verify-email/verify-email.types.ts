import type { verifyEmailTokensTable } from "./verify-email.schema";

export type VerifyEmailToken = typeof verifyEmailTokensTable.$inferSelect;
export type NewVerifyEmailToken = typeof verifyEmailTokensTable.$inferInsert;

export type VerifyEmailTokenId = VerifyEmailToken["id"];
