import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "~/lib/utils";

const ScrollArea = component$<PropsOf<typeof ScrollAreaPrimitive.Root>>(
  ({ class: className, ...props }) => (
    <ScrollAreaPrimitive.Root
      class={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport class="h-full w-full rounded-[inherit]">
        <Slot />
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
);

const ScrollBar = component$<
  PropsOf<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ class: className, orientation = "vertical", ...props }) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    orientation={orientation}
    class={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb class="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));

export { ScrollArea, ScrollBar };
