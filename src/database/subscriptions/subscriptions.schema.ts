import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
//
import { userTable } from "~/database/schema";

export const subscriptionsTable = sqliteTable("subscriptions", {
  id: text("id").primaryKey().$defaultFn(crypto.randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" })
    .unique(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeCurrentPeriodEnd: integer("expires", {
    mode: "timestamp_ms",
  }).notNull(),
});
