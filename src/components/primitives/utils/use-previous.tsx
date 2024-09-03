import { useComputed$, useStore } from "@builder.io/qwik";

function usePrevious<T>(value: T) {
  const ref = useStore({ value, previous: value });

  // We compare values before making an update to ensure that
  // a change has been made. This ensures the previous value is
  // persisted correctly between renders.
  return useComputed$(() => {
    if (ref.value !== value) {
      ref.previous = ref.value;
      ref.value = value;
    }
    return ref.previous;
  });
}

export { usePrevious };
