import type { CSSProperties, PropsOf, QRL, Signal } from "@builder.io/qwik";
import {
  component$,
  useSignal,
  useContextProvider,
  useContext,
  useStore,
  $,
  createContextId,
  useTask$,
  sync$,
  Slot,
} from "@builder.io/qwik";
//
import { useSize } from "../utils/use-size";
import { computedStyle } from "../utils/computed-style";
import { usePrevious } from "../utils/use-previous";

/* -------------------------------------------------------------------------------------------------
 * Switch
 * -----------------------------------------------------------------------------------------------*/

export interface SwitchContextType {
  checked: boolean;
  disabled?: boolean;
}

export const SwitchContext = createContextId<SwitchContextType>("app.switch");

export interface SwitchProps extends PropsOf<"button"> {
  checked?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onCheckedChange?: QRL<(checked: boolean) => void>;
}

const Switch = component$((props: SwitchProps) => {
  const {
    checked: checkedProp,
    defaultChecked,
    required,
    disabled,
    value = "on",
    onCheckedChange,
    ...switchProps
  } = props;

  const buttonRef = useSignal<HTMLButtonElement>();
  const hasConsumerStoppedPropagationRef = useSignal(false);
  const isFormControl = buttonRef.value
    ? Boolean(buttonRef.value.closest("form"))
    : true;
  const state = useStore({
    checked: checkedProp ?? defaultChecked ?? false,
  });

  useContextProvider(SwitchContext, { checked: state.checked, disabled });

  const handleClick = $((event: Event) => {
    state.checked = !state.checked;
    onCheckedChange?.(state.checked);
    if (isFormControl) {
      if (!hasConsumerStoppedPropagationRef.value) {
        event.stopPropagation();
        hasConsumerStoppedPropagationRef.value = true;
      }
    }
  });

  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={state.checked}
        aria-required={required}
        data-state={getState(state.checked)}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        value={value}
        {...switchProps}
        ref={buttonRef}
        onClick$={handleClick}
      />
      {isFormControl && (
        <BubbleInput
          control={buttonRef}
          bubbles={!hasConsumerStoppedPropagationRef.value}
          value={value}
          checked={state.checked}
          required={required}
          disabled={disabled}
          style={{ transform: "translateX(-100%)" }}
        />
      )}
    </div>
  );
});

/* -------------------------------------------------------------------------------------------------
 * SwitchThumb
 * -----------------------------------------------------------------------------------------------*/

export type SwitchThumbProps = PropsOf<"span">;

const SwitchThumb = component$<SwitchThumbProps>((props) => {
  const context = useContext(SwitchContext);
  return (
    <span
      data-state={getState(context.checked)}
      data-disabled={context.disabled ? "" : undefined}
      {...props}
    >
      <Slot />
    </span>
  );
});

/* ---------------------------------------------------------------------------------------------- */

export interface BubbleInputProps extends Omit<PropsOf<"input">, "checked"> {
  checked: boolean;
  control: Signal<HTMLElement | undefined>;
  bubbles: boolean;
}

const BubbleInput = component$<BubbleInputProps>((props) => {
  const { control, checked, bubbles = true, ...inputProps } = props;
  const ref = useSignal<HTMLInputElement>();
  const prevChecked = usePrevious(checked);
  const controlSize = useSize(control);

  useTask$(({ track }) => {
    track(() => checked);
    const input = track(ref);
    if (input) {
      if (prevChecked.value !== checked) {
        const event = new Event("click", { bubbles });
        input.checked = checked;
        input.dispatchEvent(event);
      }
    }
  });

  const additionalStyles: CSSProperties = {
    ...controlSize,
    position: "absolute",
    pointerEvents: "none",
    opacity: 0,
    margin: 0,
  };

  const styles = computedStyle(props.style, additionalStyles);

  return (
    <input
      type="checkbox"
      aria-hidden
      defaultChecked={checked}
      {...inputProps}
      tabIndex={-1}
      ref={ref}
      style={styles}
    />
  );
});

const getState = sync$((checked: boolean) => {
  return checked ? "checked" : "unchecked";
});

const Root = Switch;
const Thumb = SwitchThumb;

export {
  //
  Switch,
  SwitchThumb,
  //
  Root,
  Thumb,
};
