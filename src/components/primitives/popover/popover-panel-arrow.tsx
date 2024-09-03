import type { PropsOf } from "@builder.io/qwik";
import { component$, useContext } from "@builder.io/qwik";

import { popoverContextId } from "./popover-context";

export const HPopoverPanelArrow = component$<PropsOf<"div">>((props) => {
  const context = useContext(popoverContextId);

  return <div ref={context.arrowRef} {...props} />;
});
