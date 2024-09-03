import { Link } from "@builder.io/qwik-city";
//
import { Button } from "~/components/ui/button";
import { pageTitleStyles } from "~/styles/common";
import { AUTHENTICATION_ERROR_MESSAGE } from "~/utils";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const isAuthenticationError = error.message.includes(
    AUTHENTICATION_ERROR_MESSAGE
  );

  return (
    <div class="container mx-auto py-12 min-h-screen space-y-8">
      {isAuthenticationError ? (
        <>
          <h1 class={pageTitleStyles}>Oops! You Need to Be Logged In</h1>
          <p class="text-lg">To access this page, please log in first.</p>

          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </>
      ) : (
        <>
          <h1 class={pageTitleStyles}>Oops! Something went wrong</h1>
          <p class="text-lg">{error.message}</p>
        </>
      )}
    </div>
  );
}
