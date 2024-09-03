// import { rateLimitByIp } from "~/lib/limiter";
import type { RequestHandler } from "@builder.io/qwik-city";
import { verifyEmailUseCase } from "~/use-cases/users";

export const dynamic = "force-dynamic";

export const onGet: RequestHandler = async ({ query, redirect, url }) => {
  try {
    // await rateLimitByIp({ key: "verify-email", limit: 5, window: 60000 });
    const token = query.get("token");

    if (!token) {
      throw redirect(302, new URL("/sign-in", url).toString());
    }

    await verifyEmailUseCase(token);

    redirect(302, new URL("/verify-success", url).toString());
  } catch (err) {
    console.error(err);
    throw redirect(302, new URL("/sign-in", url).toString());
  }
};
