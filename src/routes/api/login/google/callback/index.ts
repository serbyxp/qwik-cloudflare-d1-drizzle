import type { RequestHandler } from "@builder.io/qwik-city";
import { OAuth2RequestError } from "arctic";
//
import { afterLoginUrl } from "~/app-config";
import { googleAuth } from "~/auth";
import { setSession } from "~/lib/session";
import { createGoogleUserUseCase } from "~/use-cases/users";
import { getAccountByGoogleIdUseCase } from "~/use-cases/accounts";

export const onGet: RequestHandler = async ({
  cookie,
  query,
  redirect,
  send,
  url,
}) => {
  const code = query.get("code");
  const state = query.get("state");
  const storedState = cookie.get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookie.get("google_code_verifier")?.value ?? null;

  if (
    !code ||
    !state ||
    !storedState ||
    state !== storedState ||
    !codeVerifier
  ) {
    throw send(
      new Response(null, {
        status: 400,
      })
    );
  }

  try {
    const tokens = await googleAuth.validateAuthorizationCode(
      code,
      codeVerifier
    );
    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const googleUser: GoogleUser = await response.json();

    const existingAccount = await getAccountByGoogleIdUseCase(googleUser.sub);

    if (existingAccount) {
      await setSession(existingAccount.userId, cookie);
      redirect(302, new URL(afterLoginUrl, url).toString());
    }
    const userId = await createGoogleUserUseCase(googleUser);
    await setSession(userId, cookie);
    redirect(302, new URL(afterLoginUrl, url).toString());
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      throw send(
        new Response(null, {
          status: 400,
        })
      );
    }
    throw send(
      new Response(null, {
        status: 500,
      })
    );
  }
};

export interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}
