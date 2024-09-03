import type { SyncQRL } from "@builder.io/qwik";
import { useSignal, type QRL, sync$ } from "@builder.io/qwik";

export type UseControllableStateParams<T> = {
  prop?: T | undefined;
  defaultProp?: T | undefined;
  onChange$?: QRL<(state: T) => void>;
};

export type SetStateFn<T> = SyncQRL<(prevState: T | undefined) => T>;

export function useControllableState<T>({
  prop,
  defaultProp,
  onChange$,
}: UseControllableStateParams<T>) {
  const uncontrolledState = useSignal<T | undefined>(defaultProp);
  const isControlled = prop !== undefined;
  const state = isControlled ? prop : uncontrolledState.value;

  const setState = sync$(async (newState: T | SetStateFn<T>) => {
    const newStateValue =
      typeof newState === "function"
        ? (newState as SetStateFn<T>)(state)
        : newState;

    if (!isControlled) {
      uncontrolledState.value = newStateValue;
    }

    onChange$?.(newStateValue);
  });

  return [state, setState] as const;
}
