import type { RequestHandler } from "@builder.io/qwik-city";
import { generateState } from "arctic";
import { github } from "~/auth";

export const onGet: RequestHandler = async ({ cookie, redirect }) => {
  const state = generateState();
  const url = await github.createAuthorizationURL(state, {
    scopes: ["user:email"],
  });

  cookie.set("github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  redirect(302, url.toString());
};
