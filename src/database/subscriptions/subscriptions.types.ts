import type { subscriptionsTable } from "./subscriptions.schema";

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type NewSubscription = typeof subscriptionsTable.$inferInsert;

export type SubscriptionId = Subscription["id"];

export type Plan = "free" | "basic" | "premium";
