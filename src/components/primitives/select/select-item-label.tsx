import type { PropsOf } from "@builder.io/qwik";
import { Slot, component$ } from "@builder.io/qwik";

type SelectOptionLabelProps = PropsOf<"span">;

export const HSelectItemLabel = component$((props: SelectOptionLabelProps) => {
  return (
    <span tabIndex={-1} {...props}>
      <Slot />
    </span>
  );
});
