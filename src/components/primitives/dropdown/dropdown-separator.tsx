import type { PropsOf } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";

export const HDropdownSeparator = component$<PropsOf<"hr">>((props) => {
  return <hr {...props} />;
});
