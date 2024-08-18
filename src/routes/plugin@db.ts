import { type RequestHandler } from "@builder.io/qwik-city";
import { drizzle } from "drizzle-orm/d1";
import { type AppDatabase, initializeDbIfNeeded } from "~/database";

export const onRequest: RequestHandler = async ({ platform }) => {
  const env = platform.env;
  await initializeDbIfNeeded(initD1(env));
};

function initD1(env: Env): () => Promise<AppDatabase> {
  return async () => drizzle(env.DB);
}
