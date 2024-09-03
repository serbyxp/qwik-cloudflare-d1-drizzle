import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export const ALink = component$<PropsOf<"a">>((props) => {
  return props.target === "_blank" ? (
    <a {...props} rel="noreferrer">
      <Slot />
    </a>
  ) : (
    <Link {...props}>
      <Slot />
    </Link>
  );
});
