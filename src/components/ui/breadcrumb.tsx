import type { JSXOutput, PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
//
import { LuChevronRight, LuMoreHorizontal } from "@qwikest/icons/lucide";
import { cn } from "~/lib/utils";
import { ALink } from "../primitives/ALink";

const Breadcrumb = component$<
  PropsOf<"nav"> & {
    separator?: JSXOutput;
  }
>(({ ...props }) => (
  <nav aria-label="breadcrumb" {...props}>
    <Slot />
  </nav>
));

const BreadcrumbList = component$<PropsOf<"ol">>(
  ({ class: className, ...props }) => (
    <ol
      class={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        className
      )}
      {...props}
    >
      <Slot />
    </ol>
  )
);

const BreadcrumbItem = component$<PropsOf<"li">>(
  ({ class: className, ...props }) => (
    <li class={cn("inline-flex items-center gap-1.5", className)} {...props}>
      <Slot />
    </li>
  )
);

const BreadcrumbLink = component$<
  (PropsOf<"a"> | PropsOf<"div">) & {
    asChild?: boolean;
  }
>(({ asChild, class: className, ...props }) => {
  return asChild ? (
    <div
      class={cn("transition-colors hover:text-foreground", className)}
      {...(props as PropsOf<"div">)}
    >
      <Slot />
    </div>
  ) : (
    <ALink
      class={cn("transition-colors hover:text-foreground", className)}
      {...(props as PropsOf<"a">)}
    >
      <Slot />
    </ALink>
  );
});

const BreadcrumbPage = component$<PropsOf<"span">>(
  ({ class: className, ...props }) => (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      class={cn("font-normal text-foreground", className)}
      {...props}
    >
      <Slot />
    </span>
  )
);

interface BreadcrumbSeparatorProps extends PropsOf<"li"> {
  icon: JSXOutput;
}

const BreadcrumbSeparator = component$<BreadcrumbSeparatorProps>(
  ({ icon, class: className, ...props }) => (
    <li
      role="presentation"
      aria-hidden="true"
      class={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {icon ?? <LuChevronRight />}
    </li>
  )
);

const BreadcrumbEllipsis = component$<PropsOf<"span">>(
  ({ class: className, ...props }) => (
    <span
      role="presentation"
      aria-hidden="true"
      class={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <LuMoreHorizontal class="h-4 w-4" />
      <span class="sr-only">More</span>
    </span>
  )
);

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
