import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = component$<PropsOf<"label"> & VariantProps<typeof labelVariants>>(
  ({ class: className, ...props }) => (
    <label class={cn(labelVariants(), className)} {...props}>
      <Slot />
    </label>
  )
);

export { Label };
