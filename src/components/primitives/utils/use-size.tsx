import type { Signal } from "@builder.io/qwik";
import { useStore, useTask$ } from "@builder.io/qwik";

interface Size {
  width?: number;
  height?: number;
}

function useSize(ref: Signal<HTMLElement | undefined>) {
  const size = useStore<Size>({
    width: undefined,
    height: undefined,
  });

  useTask$(({ track }) => {
    const element = track(ref);

    if (element) {
      // Provide size as early as possible
      size.width = element.offsetWidth;
      size.height = element.offsetHeight;

      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }

        const entry = entries[0];
        let width: number;
        let height: number;

        if ("borderBoxSize" in entry) {
          const borderSizeEntry = entry["borderBoxSize"];
          // Iron out differences between browsers
          const borderSize = Array.isArray(borderSizeEntry)
            ? borderSizeEntry[0]
            : borderSizeEntry;
          width = borderSize["inlineSize"];
          height = borderSize["blockSize"];
        } else {
          // For browsers that don't support `borderBoxSize`
          // we calculate it ourselves to get the correct border box.
          width = element.offsetWidth;
          height = element.offsetHeight;
        }

        size.width = width;
        size.height = height;
      });

      resizeObserver.observe(element, { box: "border-box" });

      return () => resizeObserver.unobserve(element);
    } else {
      // We only want to reset to `undefined` when the element becomes `null`,
      // not if it changes to another element.
      size.width = undefined;
      size.height = undefined;
    }
  });

  return size;
}

export { useSize };
