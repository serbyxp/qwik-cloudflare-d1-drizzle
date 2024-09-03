import type { RequestHandler } from "@builder.io/qwik-city";
// import { rateLimitByIp } from "~/lib/limiter";
import { afterLoginUrl } from "~/app-config";
import { setSession } from "~/lib/session";
import { loginWithMagicLinkUseCase } from "~/use-cases/magic-link";

export const dynamic = "force-dynamic";

export const onGet: RequestHandler = async ({
  cookie,
  query,
  redirect,
  url,
}) => {
  try {
    // await rateLimitByIp({
    //   key: "magic-token",
    //   limit: 5,
    //   window: 60000,
    //   request,
    // });
    const token = query.get("token");

    if (!token) {
      throw redirect(302, new URL("/sign-in", url).toString());
    }
    const user = await loginWithMagicLinkUseCase(token);

    await setSession(user.id, cookie);
    redirect(302, new URL(afterLoginUrl, url).toString());
  } catch (err) {
    throw redirect(302, new URL("/sign-in/magic/error", url).toString());
  }
};
