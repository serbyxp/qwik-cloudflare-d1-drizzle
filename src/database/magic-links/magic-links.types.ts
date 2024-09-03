import type { magicLinksTable } from "./magic-links.schema";

export type MagicLinks = typeof magicLinksTable.$inferSelect;
export type NewMagicLinks = typeof magicLinksTable.$inferInsert;

export type MagicLinksId = MagicLinks["id"];
