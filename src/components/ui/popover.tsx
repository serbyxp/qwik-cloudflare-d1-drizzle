import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import * as PopoverPrimitive from "~/components/primitives/popover";

import { cn } from "~/lib/utils";

const Popover = component$<PropsOf<typeof PopoverPrimitive.Root>>(
  ({ floating = "bottom", gutter = 4, ...props }) => (
    <PopoverPrimitive.Root floating={floating} gutter={gutter} {...props} />
  )
);

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = component$<PropsOf<typeof PopoverPrimitive.Panel>>(
  ({ class: className, ...props }) => (
    <PopoverPrimitive.Panel
      class={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <Slot />
    </PopoverPrimitive.Panel>
  )
);

export { Popover, PopoverTrigger, PopoverContent };
