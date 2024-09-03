import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import { LuCheck, LuChevronDown, LuChevronUp } from "@qwikest/icons/lucide";

import * as SelectPrimitive from "~/components/primitives/select";
import { cn } from "~/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.DisplayValue;

const SelectTrigger = component$<PropsOf<typeof SelectPrimitive.Trigger>>(
  ({ class: className, ...props }) => (
    <SelectPrimitive.Trigger
      class={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      <Slot />
      <span aria-hidden={true}>
        <LuChevronDown class="h-4 w-4 opacity-50" />
      </span>
    </SelectPrimitive.Trigger>
  )
);

const SelectScrollUpButton = component$<
  PropsOf<typeof SelectPrimitive.ScrollUpButton>
>(({ class: className, ...props }) => (
  <div
    aria-hidden={true}
    class={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <LuChevronUp class="h-4 w-4" />
  </div>
));

const SelectScrollDownButton = component$<
  PropsOf<typeof SelectPrimitive.ScrollDownButton>
>(({ class: className, ...props }) => (
  <SelectPrimitive.ScrollDownButton
    class={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <LuChevronDown class="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));

const SelectContent = component$<PropsOf<typeof SelectPrimitive.Content>>(
  ({ class: className, position = "popper", ...props }) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        class={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          class={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          <Slot />
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);

const SelectLabel = component$<PropsOf<typeof SelectPrimitive.Label>>(
  ({ class: className, ...props }) => (
    <SelectPrimitive.Label
      class={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...props}
    />
  )
);

const SelectItem = component$<PropsOf<typeof SelectPrimitive.Item>>(
  ({ class: className, ...props }) => (
    <SelectPrimitive.Item
      class={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <LuCheck class="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>
        <Slot />
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
);

const SelectSeparator = component$<PropsOf<typeof SelectPrimitive.Separator>>(
  ({ class: className, ...props }) => (
    <SelectPrimitive.Separator
      class={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
);

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
