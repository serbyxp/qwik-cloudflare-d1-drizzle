import type { PropsOf, Signal } from "@builder.io/qwik";
import {
  Slot,
  component$,
  useContextProvider,
  useId,
  useSignal,
} from "@builder.io/qwik";
import type { PopoverContext } from "./popover-context";
import { popoverContextId } from "./popover-context";

export type PopoverRootProps = {
  popover?: "manual" | "auto";
  manual?: boolean;
  ref?: Signal<HTMLElement | undefined>;
  floating?: boolean | TPlacement;
  hover?: boolean;
  id?: string;
  "bind:anchor"?: Signal<HTMLElement | undefined>;
  "bind:panel"?: Signal<HTMLElement | undefined>;
};

export type FloatingProps = {
  ancestorScroll?: boolean;
  ancestorResize?: boolean;
  elementResize?: boolean;
  layoutShift?: boolean;
  animationFrame?: boolean;
  gutter?: number;
  shift?: boolean;
  flip?: boolean;
  size?: boolean;
  hide?: "referenceHidden" | "escaped";
  inline?: boolean;
  transform?: string;
  arrow?: boolean;
};

export type TPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

export type PopoverProps = PopoverRootProps & {
  floating?: boolean | TPlacement;
} & FloatingProps &
  PropsOf<"div">;

export const HPopoverRoot = component$<PopoverProps>((props) => {
  const {
    id,
    "bind:anchor": givenAnchorRef,
    "bind:panel": givenPanelRef,
    floating = true,
    manual,
    hover = false,
    gutter,
    flip = true,
    shift,
    hide,
    arrow,
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = true,
    animationFrame = false,
    transform,
    ...rest
  } = props;

  // refs
  const anchorRef = givenAnchorRef;
  const rootRef = useSignal<HTMLElement>();
  const defaultPanelRef = useSignal<HTMLElement>();
  const panelRef = givenPanelRef ?? defaultPanelRef;
  const triggerRef = useSignal<HTMLElement>();
  const arrowRef = useSignal<HTMLElement>();

  // state
  const isOpenSig = useSignal(false);

  // id's
  const localId = useId();
  const compId = id ?? localId;
  const rootId = `${compId}-root`;

  const context: PopoverContext = {
    anchorRef,
    compId,
    floating,
    hover,
    panelRef,
    triggerRef,
    arrowRef,
    isOpenSig,
    localId,
    manual,
    arrow,
    gutter,
    flip,
    shift,
    hide,
    ancestorScroll,
    ancestorResize,
    elementResize,
    animationFrame,
    transform,
  };

  useContextProvider(popoverContextId, context);

  return (
    <div ref={rootRef} id={rootId} {...rest}>
      <Slot />
    </div>
  );
});
