import type { resetTokensTable } from "./reset-tokens.schema";

export type ResetTokens = typeof resetTokensTable.$inferSelect;
export type NewResetTokens = typeof resetTokensTable.$inferInsert;

export type ResetTokenId = ResetTokens["id"];
