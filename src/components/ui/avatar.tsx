import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
//
import { cn } from "~/lib/utils";

const Avatar = component$<PropsOf<"span">>(
  ({ class: className, ref, ...props }) => (
    <span
      ref={ref}
      class={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
);

const AvatarImage = component$<PropsOf<"img">>(
  ({ class: className, ref, ...props }) => (
    <img
      ref={ref}
      class={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  )
);

const AvatarFallback = component$<PropsOf<"span">>(
  ({ class: className, ...props }) => (
    <span
      class={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <Slot />
    </span>
  )
);

export { Avatar, AvatarImage, AvatarFallback };
