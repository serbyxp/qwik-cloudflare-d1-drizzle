import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import {
  LuChevronLeft,
  LuChevronRight,
  LuMoreHorizontal,
} from "@qwikest/icons/lucide";

import { cn } from "~/lib/utils";
import type { ButtonProps } from "~/components/ui/button";
import { buttonVariants } from "~/components/ui/button";
import { ALink } from "../primitives/ALink";

const Pagination = component$<PropsOf<"nav">>(
  ({ class: className, ...props }) => (
    <nav
      role="navigation"
      aria-label="pagination"
      class={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <Slot />
    </nav>
  )
);

const PaginationContent = component$<PropsOf<"ul">>(
  ({ class: className, ...props }) => (
    <ul class={cn("flex flex-row items-center gap-1", className)} {...props}>
      <Slot />
    </ul>
  )
);

const PaginationItem = component$<PropsOf<"li">>(
  ({ class: className, ...props }) => (
    <li class={cn("", className)} {...props}>
      <Slot />
    </li>
  )
);

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  PropsOf<"a">;

const PaginationLink = component$<PaginationLinkProps>(
  ({ class: className, isActive, size = "icon", ...props }) => (
    <ALink
      aria-current={isActive ? "page" : undefined}
      class={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  )
);

const PaginationPrevious = component$<PaginationLinkProps>(
  ({ class: className, ...props }) => (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      class={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <LuChevronLeft class="h-4 w-4" />
      <span>Previous</span>
    </PaginationLink>
  )
);

const PaginationNext = component$<PaginationLinkProps>(
  ({ class: className, ...props }) => (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      class={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>Next</span>
      <LuChevronRight class="h-4 w-4" />
    </PaginationLink>
  )
);

const PaginationEllipsis = component$<PropsOf<"span">>(
  ({ class: className, ...props }) => (
    <span
      aria-hidden
      class={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <LuMoreHorizontal class="h-4 w-4" />
      <span class="sr-only">More pages</span>
    </span>
  )
);

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
