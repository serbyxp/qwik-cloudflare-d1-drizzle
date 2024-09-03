import {
  $,
  createContextId,
  useContextProvider,
  useOnWindow,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { isBrowser } from "@builder.io/qwik/build";

export const mediaQueryContext = createContextId("media-query");

export default function useMediaQuery() {
  const device = useSignal<"mobile" | "tablet" | "desktop" | null>(null);
  const dimensions = useSignal<{ width: number; height: number } | null>(null);

  const checkDevice = $(() => {
    if (window.matchMedia("(max-width: 640px)").matches) {
      device.value = "mobile";
    } else if (
      window.matchMedia("(min-width: 641px) and (max-width: 1024px)").matches
    ) {
      device.value = "tablet";
    } else {
      device.value = "desktop";
    }
    dimensions.value = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useOnWindow("resize", checkDevice);

  useTask$(() => {
    if (isBrowser) {
      checkDevice();
    }
  });

  useContextProvider(mediaQueryContext, {
    width: dimensions.value?.width,
    height: dimensions.value?.height,
    isMobile: device.value === "mobile",
    isTablet: device.value === "tablet",
    isDesktop: device.value === "desktop",
  });

  return { dimensions, device };
}
