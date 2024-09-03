import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
//
import { cn } from "~/lib/utils";

const Card = component$<PropsOf<"div">>(({ class: className, ...props }) => (
  <div
    class={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  >
    <Slot />
  </div>
));

const CardHeader = component$<PropsOf<"div">>(
  ({ class: className, ...props }) => (
    <div class={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      <Slot />
    </div>
  )
);

const CardTitle = component$<PropsOf<"h3">>(
  ({ class: className, ...props }) => (
    <h3
      class={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      <Slot />
    </h3>
  )
);

const CardDescription = component$<PropsOf<"p">>(
  ({ class: className, ...props }) => (
    <p class={cn("text-sm text-muted-foreground", className)} {...props}>
      <Slot />
    </p>
  )
);

const CardContent = component$<PropsOf<"div">>(
  ({ class: className, ...props }) => (
    <div class={cn("p-6 pt-0", className)} {...props}>
      <Slot />
    </div>
  )
);

const CardFooter = component$<PropsOf<"div">>(
  ({ class: className, ...props }) => (
    <div class={cn("flex items-center p-6 pt-0", className)} {...props}>
      <Slot />
    </div>
  )
);

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
