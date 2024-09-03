import { sync$, useStore } from "@builder.io/qwik";

type Machine<S> = { [k: string]: { [k: string]: S } };
type MachineState<T> = keyof T;
type MachineEvent<T> = keyof UnionToIntersection<T[keyof T]>;

// 🤯 https://fettblog.eu/typescript-union-to-intersection/
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R
) => any
  ? R
  : never;

export function useStateMachine<M>(
  initialState: MachineState<M>,
  machine: M & Machine<MachineState<M>>
) {
  const state = useStore({
    currentState: initialState,
  });

  const send = sync$((event: MachineEvent<M>) => {
    const nextState = (machine[state.currentState] as any)[event];
    state.currentState = nextState ?? state.currentState;
  });

  return [state, send] as const;
}
