import { routeAction$ } from "@builder.io/qwik-city";
import { rateLimitByKey } from "~/lib/limiter";
import { assertAuthenticated } from "~/lib/session";
import { PublicError } from "~/use-cases/errors";

function shapeErrors({ err }: any) {
  const isAllowedError = err instanceof PublicError;
  // let's all errors pass through to the UI so debugging locally is easier
  const isDev = import.meta.env.DEV
  if (isAllowedError || isDev) {
    console.error(err);
    return {
      code: err.code ?? "ERROR",
      message: `${!isAllowedError && isDev ? "DEV ONLY ENABLED - " : ""}${
        err.message
      }`,
    };
  } else {
    return {
      code: "ERROR",
      message: "Something went wrong",
    };
  }
}

export const authenticatedAction = routeAction$(async (_,{cookie}) => {
    const user = await assertAuthenticated(cookie);
    await rateLimitByKey({
      key: `${user.id}-global`,
      limit: 10,
      window: 10000,
    });
    return { user };
  });

export const unauthenticatedAction = routeAction$(async () => {
    await rateLimitByKey({
      key: `unauthenticated-global`,
      limit: 10,
      window: 10000,
    });
  });
