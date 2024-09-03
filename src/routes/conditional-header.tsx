import { Link, useLocation } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";
import { LuLogOut, LuSettings2, LuBook, LuRocket } from "@qwikest/icons/lucide";
import type { Session } from "lucia";

import ImgGroup from "~/media/group.jpeg?jsx";

import { applicationName } from "~/app-config";
import {
  Avatar,
  AvatarFallback,
  //  AvatarImage
} from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ModeToggle } from "~/components/mode-toggle";

export const ConditionalHeader = component$<{
  isPremium: boolean;
  session: Session | null;
}>(({ session }) => {
  const path = useLocation().url.pathname;
  const isDashboard =
    path.startsWith("/dashboard") || path.startsWith("/purchases");
  const isSignedIn = !!session;

  return (
    <div class="border-b py-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex gap-8 items-center">
          <Link href="/" class="flex gap-2 items-center text-xl">
            <ImgGroup class="rounded w-8 h-8" alt="hero image" />
            {applicationName}
          </Link>

          {isDashboard && (
            <div class="flex items-center gap-2">
              <Button
                variant={"link"}
                asChild
                class="flex items-center justify-center gap-2"
              >
                <Link href={"/docs"}>
                  <LuBook class="w-4 h-4" /> Documentation
                </Link>
              </Button>

              <Button
                variant={"link"}
                asChild
                class="flex items-center justify-center gap-2"
              >
                <Link href={"/purchases"}>
                  <LuRocket class="w-4 h-4" /> Dashboard
                </Link>
              </Button>
            </div>
          )}

          {!isDashboard && (
            <div>
              <Button variant={"link"} asChild>
                <Link href="/#features">Features</Link>
              </Button>

              <Button variant={"link"} asChild>
                <Link href="/#pricing">Pricing</Link>
              </Button>
            </div>
          )}
        </div>

        <div class="flex justify-between gap-4">
          {isSignedIn ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    {/* <AvatarImage src={session?.user?.image || undefined} /> */}
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link
                      href="/dashboard/settings"
                      class="flex gap-2 items-center"
                    >
                      <LuSettings2 class="w-4 h-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/api/auth/signout?callbackUrl=/"
                      class="flex gap-2 items-center"
                    >
                      <LuLogOut class="w-4 h-4" /> Sign Out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="secondary">
                <Link href="/api/auth/signin/google">Sign In</Link>
              </Button>
            </>
          )}

          <ModeToggle />
        </div>
      </div>
    </div>
  );
});
