import type { accountsTable, accountTypeEnum } from "./accounts.schema";

export type AccountType = (typeof accountTypeEnum)[number];

export type Account = typeof accountsTable.$inferSelect;
export type NewAccount = typeof accountsTable.$inferInsert;
export type AccountId = Account["id"];
