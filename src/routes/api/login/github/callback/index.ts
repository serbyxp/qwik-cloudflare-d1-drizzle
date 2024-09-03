import type { RequestHandler } from "@builder.io/qwik-city";
import { OAuth2RequestError } from "arctic";
//
import { afterLoginUrl } from "~/app-config";
import { github } from "~/auth";
import { setSession } from "~/lib/session";
import { getAccountByGithubIdUseCase } from "~/use-cases/accounts";
import { createGithubUserUseCase } from "~/use-cases/users";

export interface GitHubUser {
  id: string;
  login: string;
  avatar_url: string;
  email: string;
}

interface Email {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export const onGet: RequestHandler = async ({
  cookie,
  query,
  redirect,
  send,
  url,
}) => {
  const code = query.get("code");
  const state = query.get("state");
  const storedState = cookie.get("github_oauth_state")?.value ?? null;
  if (!code || !state || !storedState || state !== storedState) {
    throw send(
      new Response(null, {
        status: 400,
      })
    );
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const githubUser: GitHubUser = await githubUserResponse.json();

    const existingAccount = await getAccountByGithubIdUseCase(githubUser.id);

    if (existingAccount) {
      await setSession(existingAccount.userId, cookie);
      redirect(302, afterLoginUrl);
    }

    if (!githubUser.email) {
      const githubUserEmailResponse = await fetch(
        "https://api.github.com/user/emails",
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      const githubUserEmails: Email[] = await githubUserEmailResponse.json();

      githubUser.email = getPrimaryEmail(githubUserEmails);
    }

    const userId = await createGithubUserUseCase(githubUser);
    await setSession(userId, cookie);
    redirect(302, new URL(afterLoginUrl, url).toString());
  } catch (e) {
    console.error(e);
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

function getPrimaryEmail(emails: Email[]): string {
  const primaryEmail = emails.find((email) => email.primary);
  return primaryEmail!.email;
}
