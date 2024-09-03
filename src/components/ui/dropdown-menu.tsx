import { LuCheck, LuChevronRight, LuCircle } from "@qwikest/icons/lucide";
//
import * as DropdownMenuPrimitive from "~/components/primitives/dropdown";
import type { DropdownItemProps } from "~/components/primitives/dropdown/dropdown-item";
import type { DropdownCheckboxItemProps } from "~/components/primitives/dropdown/dropdown-checkbox-item";
import type { PopoverProps } from "~/components/primitives/popover/popover-root";
import type { DropdownRadioItemProps } from "~/components/primitives/dropdown/dropdown-radio-item";
import type { DropdownLabelProps } from "~/components/primitives/dropdown/dropdown-group-label";
import type { DropdownTriggerProps } from "~/components/primitives/dropdown/dropdown-trigger";

import { cn } from "~/lib/utils";
import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Popover;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
type SubTrigger = DropdownTriggerProps & {
  inset: boolean;
};
const DropdownMenuSubTrigger = component$<SubTrigger>(
  ({ class: className, inset, ...props }) => (
    <DropdownMenuPrimitive.Trigger
      class={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      <Slot />
      <LuChevronRight class="ml-auto h-4 w-4" />
    </DropdownMenuPrimitive.Trigger>
  )
);

const DropdownMenuSubContent = component$<
  PropsOf<typeof DropdownMenuPrimitive.Content>
>(({ class: className, ...props }) => (
  <DropdownMenuPrimitive.Content
    class={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  >
    <Slot />
  </DropdownMenuPrimitive.Content>
));

const DropdownMenuContent = component$<PopoverProps>(
  ({ class: className, gutter = 4, ...props }) => (
    <DropdownMenuPrimitive.Popover
      gutter={gutter}
      class={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <Slot />
    </DropdownMenuPrimitive.Popover>
  )
);

export type DropDownMenuItemProps = DropdownItemProps & {
  inset?: boolean;
};
const DropdownMenuItem = component$<DropDownMenuItemProps>(
  ({ class: className, inset, ...props }) => (
    <DropdownMenuPrimitive.Item
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      <Slot />
    </DropdownMenuPrimitive.Item>
  )
);

const DropdownMenuCheckboxItem = component$<DropdownCheckboxItemProps>(
  ({ class: className, "bind:checked": checked, ...props }) => (
    <DropdownMenuPrimitive.CheckboxItem
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      bind:checked={checked}
      {...props}
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <LuCheck class="h-4 w-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      <Slot />
    </DropdownMenuPrimitive.CheckboxItem>
  )
);

const DropdownMenuRadioItem = component$<DropdownRadioItemProps>(
  ({ class: className, ...props }) => (
    <DropdownMenuPrimitive.RadioItem
      class={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <LuCircle class="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      <Slot />
    </DropdownMenuPrimitive.RadioItem>
  )
);

type MenuLabelProps = DropdownLabelProps & {
  inset?: boolean;
};
const DropdownMenuLabel = component$<MenuLabelProps>(
  ({ class: className, inset, ...props }) => (
    <DropdownMenuPrimitive.GroupLabel
      class={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      <Slot />
    </DropdownMenuPrimitive.GroupLabel>
  )
);

const DropdownMenuSeparator = component$<PropsOf<"hr">>(
  ({ class: className, ...props }) => (
    <DropdownMenuPrimitive.Separator
      class={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
);

const DropdownMenuShortcut = component$<PropsOf<"span">>(
  ({ class: className, ...props }) => (
    <span
      class={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    >
      <Slot />
    </span>
  )
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
