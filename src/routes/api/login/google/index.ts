import type { RequestHandler } from "@builder.io/qwik-city";
import { generateCodeVerifier, generateState } from "arctic";
//
import { googleAuth } from "~/auth";

export const onGet: RequestHandler = async ({ cookie, redirect }) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await googleAuth.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });

  cookie.set("google_oauth_state", state, {
    secure: true,
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10,
  });

  cookie.set("google_code_verifier", codeVerifier, {
    secure: true,
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10,
  });

  redirect(302, url.toString());
};
