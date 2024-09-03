import type { PropsOf } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import { LuCheck } from "@qwikest/icons/lucide";
//
import * as CheckboxPrimitive from "~/components/primitives/checkbox";
import { cn } from "~/lib/utils";

const Checkbox = component$<PropsOf<typeof CheckboxPrimitive.Root>>(
  ({ class: className, ...props }) => (
    <CheckboxPrimitive.Root
      class={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        class={cn("flex items-center justify-center text-current")}
      >
        <LuCheck class="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
);

export { Checkbox };
