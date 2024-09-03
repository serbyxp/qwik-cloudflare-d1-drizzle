import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import * as DrawerPrimitive from "./dialog";

import { cn } from "~/lib/utils";

const Drawer = component$<PropsOf<typeof DrawerPrimitive.Root>>(
  ({ shouldScaleBackground = true, ...props }) => (
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    >
      <Slot />
    </DrawerPrimitive.Root>
  )
);

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = "fixed inset-0 z-50 bg-black/80";

const DrawerContent = component$<PropsOf<typeof DrawerPrimitive.Content>>(
  ({ class: className, ...props }) => (
    <DrawerPrimitive.Content
      class={cn(
        "fixed inset-x-0 max-h-[95%] bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      <div class="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      <Slot />
    </DrawerPrimitive.Content>
  )
);

const DrawerHeader = component$<PropsOf<"header">>(
  ({ class: className, ...props }) => (
    <header
      class={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
      {...props}
    >
      <Slot />
    </header>
  )
);

const DrawerFooter = component$<PropsOf<"footer">>(
  ({ class: className, ...props }) => (
    <footer class={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props}>
      <Slot />
    </footer>
  )
);

const DrawerTitle = component$<PropsOf<typeof DrawerPrimitive.Title>>(
  ({ class: className, ...props }) => (
    <DrawerPrimitive.Title
      class={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      <Slot />
    </DrawerPrimitive.Title>
  )
);

const DrawerDescription = component$<
  PropsOf<typeof DrawerPrimitive.Description>
>(({ class: className, ...props }) => (
  <DrawerPrimitive.Description
    class={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    <Slot />
  </DrawerPrimitive.Description>
));

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
