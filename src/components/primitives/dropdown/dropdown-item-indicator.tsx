import { Slot, component$ } from "@builder.io/qwik";
import type { CheckboxIndicatorProps } from "../checkbox/checkbox-indicator";
import { CheckboxIndicator } from "../checkbox/checkbox-indicator";

type DropdownItemIndicatorProps = CheckboxIndicatorProps;

export const HDropdownItemIndicator = component$<DropdownItemIndicatorProps>(
  (props) => {
    return (
      <CheckboxIndicator data-indicator {...props}>
        <Slot />
      </CheckboxIndicator>
    );
  },
);
