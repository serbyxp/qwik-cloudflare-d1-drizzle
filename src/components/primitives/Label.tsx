import type { PropsOf } from "@builder.io/qwik";
import { $, component$, Slot } from "@builder.io/qwik";

/* -------------------------------------------------------------------------------------------------
 * Label
 * -----------------------------------------------------------------------------------------------*/

type PrimitiveLabelProps = PropsOf<"label">;
interface LabelProps extends PrimitiveLabelProps {}

const Label = component$<LabelProps>(({ ...props }) => {
  return (
    <label
      {...props}
      onMouseDown$={$((event) => {
        // only prevent text selection if clicking inside the label itself
        const target = event.target as HTMLElement;
        if (target.closest("button, input, select, textarea")) return;
        // prevent text selection when double clicking label
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      })}
    >
      <Slot />
    </label>
  );
});

/* -----------------------------------------------------------------------------------------------*/

const Root = Label;

export {
  Label,
  //
  Root,
};
export type { LabelProps };
