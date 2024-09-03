import type { PropsOf } from "@builder.io/qwik";
import { Slot, component$, useContext } from "@builder.io/qwik";

import { dropdownGroupContextId } from "./dropdown-context";

export type DropdownLabelProps = PropsOf<"span">;

export const HDropdownGroupLabel = component$<DropdownLabelProps>((props) => {
  const groupContext = useContext(dropdownGroupContextId);

  return (
    <span id={groupContext.groupLabelId} {...props}>
      <Slot />
    </span>
  );
});
