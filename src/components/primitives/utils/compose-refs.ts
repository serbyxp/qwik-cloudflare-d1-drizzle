import { type Signal } from "@builder.io/qwik";

type PossibleRef<EL extends Element = Element> =
  | Signal<Element | undefined>
  | RefFnInterface<EL>
  | undefined;

type RefFnInterface<EL> = {
  (el: EL): void;
};

export function setRef<EL extends Element = Element>(
  ref: PossibleRef<EL>,
  value: EL
) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref !== undefined) {
    ref.value = value;
  }
}

export const composeRefs = <EL extends Element = Element>(
  ...refs: PossibleRef<EL>[]
) => {
  return (node: EL) => refs.forEach((ref) => setRef(ref, node));
};

export function useComposedRefs<EL extends Element = Element>(
  ...refs: PossibleRef<EL>[]
) {
  return composeRefs<EL>(...refs);
}
