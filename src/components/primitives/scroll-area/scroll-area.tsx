/// <reference types="resize-observer-browser" />

import { useComposedRefs } from "~/components/primitives/utils/compose-refs";
import { useCallbackRef } from "~/components/primitives/utils/use-callback-ref";
import { useDirection } from "~/components/primitives/direction";
import { clamp } from "~/components/primitives/utils/number";
import { composeEventHandlers } from "@radix-ui/primitive";
import { useStateMachine } from "./use-state-machine";
import type {
  CSSProperties,
  JSXChildren,
  JSXOutput,
  PropsOf,
  QRL,
  Signal,
} from "@builder.io/qwik";
import {
  $,
  component$,
  Slot,
  sync$,
  useSignal,
  useStore,
  useStyles$,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";

type Direction = "ltr" | "rtl";
type Sizes = {
  content: number;
  viewport: number;
  scrollbar: {
    size: number;
    paddingStart: number;
    paddingEnd: number;
  };
};

/* -------------------------------------------------------------------------------------------------
 * ScrollArea
 * -----------------------------------------------------------------------------------------------*/

const SCROLL_AREA_NAME = "ScrollArea";
const [createScrollAreaContext, createScrollAreaScope] =
  createContextScope(SCROLL_AREA_NAME);

type ScrollAreaContextValue = {
  type: "auto" | "always" | "scroll" | "hover";
  dir: Direction;
  scrollHideDelay: number;
  scrollArea: Signal<ScrollAreaElement | undefined>;
  viewport: Signal<ScrollAreaViewportElement | undefined>;
  onViewportChange: QRL<(viewport: ScrollAreaViewportElement) => void>;
  content: Signal<HTMLDivElement | undefined>;
  onContentChange: QRL<(content: HTMLDivElement) => void>;
  scrollbarX: Signal<ScrollAreaScrollbarElement | undefined>;
  onScrollbarXChange: QRL<(scrollbar: ScrollAreaScrollbarElement) => void>;
  scrollbarXEnabled: boolean;
  onScrollbarXEnabledChange: QRL<(rendered: boolean) => void>;
  scrollbarY: Signal<ScrollAreaScrollbarElement | undefined>;
  onScrollbarYChange: QRL<(scrollbar: ScrollAreaScrollbarElement) => void>;
  scrollbarYEnabled: boolean;
  onScrollbarYEnabledChange: QRL<(rendered: boolean) => void>;
  onCornerWidthChange: QRL<(width: number) => void>;
  onCornerHeightChange: QRL<(height: number) => void>;
};

const [ScrollAreaProvider, useScrollAreaContext] =
  createScrollAreaContext<ScrollAreaContextValue>(SCROLL_AREA_NAME);

type ScrollAreaElement = HTMLDivElement;
type PrimitiveDivProps = PropsOf<"div">;
interface ScrollAreaProps extends PrimitiveDivProps {
  type?: ScrollAreaContextValue["type"];
  dir?: ScrollAreaContextValue["dir"];
  scrollHideDelay?: number;
}

const ScrollArea = component$<ScrollAreaProps>((props) => {
  const {
    type = "hover",
    dir,
    scrollHideDelay = 600,
    ...scrollAreaProps
  } = props;
  const scrollArea = useSignal<ScrollAreaElement>();
  const viewport = useSignal<ScrollAreaViewportElement>();
  const content = useSignal<HTMLDivElement>();
  const scrollbarX = useSignal<ScrollAreaScrollbarElement>();
  const scrollbarY = useSignal<ScrollAreaScrollbarElement>();
  const cornerWidth = useSignal(0);
  const cornerHeight = useSignal(0);
  const scrollbarXEnabled = useSignal(false);
  const scrollbarYEnabled = useSignal(false);
  const composedRefs = useComposedRefs(
    props.ref,
    (node) => (scrollArea.value = node)
  );
  const direction = useDirection(dir);

  return (
    <ScrollAreaProvider
      type={type}
      dir={direction}
      scrollHideDelay={scrollHideDelay}
      scrollArea={scrollArea}
      viewport={viewport}
      onViewportChange={viewport.value}
      content={content}
      onContentChange={content.value}
      scrollbarX={scrollbarX}
      onScrollbarXChange={scrollbarX.value}
      scrollbarXEnabled={scrollbarXEnabled}
      onScrollbarXEnabledChange={scrollbarXEnabled.value}
      scrollbarY={scrollbarY}
      onScrollbarYChange={scrollbarY.value}
      scrollbarYEnabled={scrollbarYEnabled}
      onScrollbarYEnabledChange={scrollbarYEnabled.value}
      onCornerWidthChange={cornerWidth.value}
      onCornerHeightChange={cornerHeight.value}
    >
      <div
        dir={direction}
        {...scrollAreaProps}
        ref={composedRefs}
        style={{
          position: "relative",
          // Pass corner sizes as CSS vars to reduce re-renders of context consumers
          ["--scroll-area-corner-width" as any]: cornerWidth + "px",
          ["--scroll-area-corner-height" as any]: cornerHeight + "px",
          ...(props.style as CSSProperties),
        }}
      />
    </ScrollAreaProvider>
  );
});

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaViewport
 * -----------------------------------------------------------------------------------------------*/

const VIEWPORT_NAME = "ScrollAreaViewport";

type ScrollAreaViewportElement = HTMLDivElement;
interface ScrollAreaViewportProps extends PrimitiveDivProps {
  nonce?: string;
  asChild?: boolean;
}

const ScrollAreaViewport = component$<ScrollAreaViewportProps>((props) => {
  const { asChild, ...viewportProps } = props;
  useStyles$(`
    [data-scroll-area-viewport] {
      scrollbar-width: none;
      -ms-overflow-style: none;
      -webkit-overflow-scrolling: touch;
    }
    [data-scroll-area-viewport]::-webkit-scrollbar {
      display: none;
    }
    :where([data-scroll-area-viewport]) {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    :where([data-scroll-area-content]) {
      flex-grow: 1;
    }`);

  const context = useScrollAreaContext(VIEWPORT_NAME);
  const ref = useSignal<ScrollAreaViewportElement>();
  const composedRefs = useComposedRefs(
    props.ref,
    ref,
    context.onViewportChange
  );
  return (
    <>
      <div
        data-radix-scroll-area-viewport=""
        {...viewportProps}
        asChild={asChild}
        ref={composedRefs}
        style={{
          /**
           * We don't support `visible` because the intention is to have at least one scrollbar
           * if this component is used and `visible` will behave like `auto` in that case
           * https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#description
           *
           * We don't handle `auto` because the intention is for the native implementation
           * to be hidden if using this component. We just want to ensure the node is scrollable
           * so could have used either `scroll` or `auto` here. We picked `scroll` to prevent
           * the browser from having to work out whether to render native scrollbars or not,
           * we tell it to with the intention of hiding them in CSS.
           */
          overflowX: context.scrollbarXEnabled ? "scroll" : "hidden",
          overflowY: context.scrollbarYEnabled ? "scroll" : "hidden",
          ...(props.style as CSSProperties),
        }}
      >
        {getSubtree({ asChild, children }, (children) => (
          <div
            data-scroll-area-content=""
            ref={context.onContentChange}
            /**
             * When horizontal scrollbar is visible: this element should be at least
             * as wide as its children for size calculations to work correctly.
             *
             * When horizontal scrollbar is NOT visible: this element's width should
             * be constrained by the parent container to enable `text-overflow: ellipsis`
             */
            style={{
              minWidth: context.scrollbarXEnabled ? "fit-content" : undefined,
            }}
          >
            <Slot />
          </div>
        ))}
      </div>
    </>
  );
});

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaScrollbar
 * -----------------------------------------------------------------------------------------------*/

const SCROLLBAR_NAME = "ScrollAreaScrollbar";

type ScrollAreaScrollbarElement = ScrollAreaScrollbarVisibleElement;
interface ScrollAreaScrollbarProps extends ScrollAreaScrollbarVisibleProps {
  forceMount?: true;
}

const ScrollAreaScrollbar = component$<ScrollAreaScrollbarProps>((props) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME);
  const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context;
  const isHorizontal = props.orientation === "horizontal";

  useTask$(({ cleanup }) => {
    isHorizontal
      ? onScrollbarXEnabledChange(true)
      : onScrollbarYEnabledChange(true);
    cleanup(() => {
      isHorizontal
        ? onScrollbarXEnabledChange(false)
        : onScrollbarYEnabledChange(false);
    });
  });

  return context.type === "hover" ? (
    <ScrollAreaScrollbarHover
      {...scrollbarProps}
      ref={props.ref}
      forceMount={forceMount}
    />
  ) : context.type === "scroll" ? (
    <ScrollAreaScrollbarScroll
      {...scrollbarProps}
      ref={props.ref}
      forceMount={forceMount}
    />
  ) : context.type === "auto" ? (
    <ScrollAreaScrollbarAuto
      {...scrollbarProps}
      ref={props.ref}
      forceMount={forceMount}
    />
  ) : context.type === "always" ? (
    <ScrollAreaScrollbarVisible {...scrollbarProps} ref={props.ref} />
  ) : null;
});

/* -----------------------------------------------------------------------------------------------*/

type ScrollAreaScrollbarHoverElement = ScrollAreaScrollbarAutoElement;
interface ScrollAreaScrollbarHoverProps extends ScrollAreaScrollbarAutoProps {
  forceMount?: true;
}

const ScrollAreaScrollbarHover = component$<ScrollAreaScrollbarHoverProps>(
  (props) => {
    const { forceMount, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME);
    const visible = useSignal(false);

    useTask$(({ cleanup }) => {
      const scrollArea = context.scrollArea;
      let hideTimer = 0;
      if (scrollArea) {
        const handlePointerEnter = $(() => {
          window.clearTimeout(hideTimer);
          visible.value = true;
        });
        const handlePointerLeave = $(() => {
          hideTimer = window.setTimeout(
            () => (visible.value = false),
            context.scrollHideDelay
          );
        });
        scrollArea.addEventListener("pointerenter", handlePointerEnter);
        scrollArea.addEventListener("pointerleave", handlePointerLeave);
        cleanup(() => {
          window.clearTimeout(hideTimer);
          scrollArea.removeEventListener("pointerenter", handlePointerEnter);
          scrollArea.removeEventListener("pointerleave", handlePointerLeave);
        });
      }
    });

    return (
      <Presence present={forceMount || visible}>
        <ScrollAreaScrollbarAuto
          data-state={visible ? "visible" : "hidden"}
          {...scrollbarProps}
          ref={props.itemRef}
        />
      </Presence>
    );
  }
);

type ScrollAreaScrollbarScrollElement = ScrollAreaScrollbarVisibleElement;
interface ScrollAreaScrollbarScrollProps
  extends ScrollAreaScrollbarVisibleProps {
  forceMount?: true;
}

const ScrollAreaScrollbarScroll = component$<ScrollAreaScrollbarScrollProps>(
  (props) => {
    const { forceMount, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME);
    const isHorizontal = props.orientation === "horizontal";
    const debounceScrollEnd = useDebounceCallback(
      sync$(() => send("SCROLL_END")),
      100
    );
    const [state, send] = useStateMachine("hidden", {
      hidden: {
        SCROLL: "scrolling",
      },
      scrolling: {
        SCROLL_END: "idle",
        POINTER_ENTER: "interacting",
      },
      interacting: {
        SCROLL: "interacting",
        POINTER_LEAVE: "idle",
      },
      idle: {
        HIDE: "hidden",
        SCROLL: "scrolling",
        POINTER_ENTER: "interacting",
      },
    });

    useTask$(({ cleanup }) => {
      if (state === "idle") {
        const hideTimer = window.setTimeout(
          () => send("HIDE"),
          context.scrollHideDelay
        );
        cleanup(() => window.clearTimeout(hideTimer));
      }
    });

    useTask$(({ cleanup }) => {
      const viewport = context.viewport;
      const scrollDirection = isHorizontal ? "scrollLeft" : "scrollTop";

      if (viewport) {
        let prevScrollPos = viewport[scrollDirection];
        const handleScroll = () => {
          const scrollPos = viewport[scrollDirection];
          const hasScrollInDirectionChanged = prevScrollPos !== scrollPos;
          if (hasScrollInDirectionChanged) {
            send("SCROLL");
            debounceScrollEnd();
          }
          prevScrollPos = scrollPos;
        };
        viewport.addEventListener("scroll", handleScroll);
        cleanup(() => viewport.removeEventListener("scroll", handleScroll));
      }
    });

    return (
      <Presence present={forceMount || state !== "hidden"}>
        <ScrollAreaScrollbarVisible
          data-state={state === "hidden" ? "hidden" : "visible"}
          {...scrollbarProps}
          ref={props.ref}
          onPointerEnter$={composeEventHandlers(props.onPointerEnter$, () =>
            send("POINTER_ENTER")
          )}
          onPointerLeave$={composeEventHandlers(props.onPointerLeave$, () =>
            send("POINTER_LEAVE")
          )}
        />
      </Presence>
    );
  }
);

type ScrollAreaScrollbarAutoElement = ScrollAreaScrollbarVisibleElement;
interface ScrollAreaScrollbarAutoProps extends ScrollAreaScrollbarVisibleProps {
  forceMount?: true;
}

const ScrollAreaScrollbarAuto = component$<ScrollAreaScrollbarAutoProps>(
  (props) => {
    const context = useScrollAreaContext(SCROLLBAR_NAME);
    const { forceMount, ...scrollbarProps } = props;
    const visible = useSignal(false);
    const isHorizontal = props.orientation === "horizontal";
    const handleResize = useDebounceCallback(
      $(() => {
        if (context.viewport) {
          const isOverflowX =
            context.viewport.offsetWidth < context.viewport.scrollWidth;
          const isOverflowY =
            context.viewport.offsetHeight < context.viewport.scrollHeight;
          visible.value = isHorizontal ? isOverflowX : isOverflowY;
        }
      }),
      10
    );

    useResizeObserver(context.viewport, handleResize);
    useResizeObserver(context.content, handleResize);

    return (
      <Presence present={forceMount || visible}>
        <ScrollAreaScrollbarVisible
          data-state={visible.value ? "visible" : "hidden"}
          {...scrollbarProps}
          ref={props.ref}
        />
      </Presence>
    );
  }
);

/* -----------------------------------------------------------------------------------------------*/

type ScrollAreaScrollbarVisibleElement = ScrollAreaScrollbarAxisElement;
interface ScrollAreaScrollbarVisibleProps
  extends Omit<
    ScrollAreaScrollbarAxisProps,
    keyof ScrollAreaScrollbarAxisPrivateProps
  > {
  orientation?: "horizontal" | "vertical";
}

const ScrollAreaScrollbarVisible = component$<ScrollAreaScrollbarVisibleProps>(
  (props) => {
    const { orientation = "vertical", ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME);
    const thumbRef = useSignal<ScrollAreaThumbElement>();
    const pointerOffsetRef = useSignal(0);
    const sizes = useStore<Sizes>({
      content: 0,
      viewport: 0,
      scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 },
    });
    const thumbRatio = getThumbRatio(sizes.viewport, sizes.content);

    type UncommonProps =
      | "onThumbPositionChange"
      | "onDragScroll"
      | "onWheelScroll";
    const commonProps: Omit<
      ScrollAreaScrollbarAxisPrivateProps,
      UncommonProps
    > = {
      ...scrollbarProps,
      sizes,
      onSizesChange: sizes,
      hasThumb: Boolean(thumbRatio > 0 && thumbRatio < 1),
      onThumbChange$: $((thumb) => (thumbRef.value = thumb)),
      onThumbPointerUp$: $(() => (pointerOffsetRef.value = 0)),
      onThumbPointerDown$: $(
        (pointerPos) => (pointerOffsetRef.value = pointerPos)
      ),
    };

    const getScrollPosition = $((pointerPos: number, dir?: Direction) => {
      return getScrollPositionFromPointer(
        pointerPos,
        pointerOffsetRef.value,
        sizes,
        dir
      );
    });

    if (orientation === "horizontal") {
      return (
        <ScrollAreaScrollbarX
          {...commonProps}
          ref={props.ref}
          onThumbPositionChange$={$(() => {
            if (context.viewport && thumbRef.value) {
              const scrollPos = context.viewport.scrollLeft;
              const offset = getThumbOffsetFromScroll(
                scrollPos,
                sizes,
                context.dir
              );
              thumbRef.value.style.transform = `translate3d(${offset}px, 0, 0)`;
            }
          })}
          onWheelScroll$={$((scrollPos) => {
            if (context.viewport) context.viewport.scrollLeft = scrollPos;
          })}
          onDragScroll$={$((pointerPos) => {
            if (context.viewport) {
              context.viewport.scrollLeft = getScrollPosition(
                pointerPos,
                context.dir
              );
            }
          })}
        />
      );
    }

    if (orientation === "vertical") {
      return (
        <ScrollAreaScrollbarY
          {...commonProps}
          ref={props.ref}
          onThumbPositionChange$={$(() => {
            if (context.viewport && thumbRef.value) {
              const scrollPos = context.viewport.scrollTop;
              const offset = getThumbOffsetFromScroll(scrollPos, sizes);
              thumbRef.value.style.transform = `translate3d(0, ${offset}px, 0)`;
            }
          })}
          onWheelScroll$={$((scrollPos) => {
            if (context.viewport) context.viewport.scrollTop = scrollPos;
          })}
          onDragScroll$={$((pointerPos) => {
            if (context.viewport)
              context.viewport.scrollTop = getScrollPosition(pointerPos);
          })}
        />
      );
    }

    return null;
  }
);

/* -----------------------------------------------------------------------------------------------*/

type ScrollAreaScrollbarAxisPrivateProps = {
  hasThumb: boolean;
  sizes: Sizes;
  onSizesChange$: QRL<(sizes: Sizes) => void>;
  onThumbChange$: QRL<(thumb: ScrollAreaThumbElement | undefined) => void>;
  onThumbPointerDown$: QRL<(pointerPos: number) => void>;
  onThumbPointerUp$: QRL<() => void>;
  onThumbPositionChange$: QRL<() => void>;
  onWheelScroll$: QRL<(scrollPos: number) => void>;
  onDragScroll$: QRL<(pointerPos: number) => void>;
};

type ScrollAreaScrollbarAxisElement = ScrollAreaScrollbarImplElement;
interface ScrollAreaScrollbarAxisProps
  extends Omit<
      ScrollAreaScrollbarImplProps,
      keyof ScrollAreaScrollbarImplPrivateProps
    >,
    ScrollAreaScrollbarAxisPrivateProps {}

const ScrollAreaScrollbarX = component$<ScrollAreaScrollbarAxisProps>(
  (props) => {
    const {
      sizes,
      onThumbPointerDown$,
      onDragScroll$,
      onWheelScroll$,
      onSizesChange$,
      ...scrollbarProps
    } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME);
    const computedStyle = useSignal<CSSStyleDeclaration>();
    const ref = useSignal<ScrollAreaScrollbarAxisElement>();
    const composeRefs = useComposedRefs(
      props.ref,
      ref,
      context.onScrollbarXChange
    );

    useTask$(() => {
      if (ref.value) computedStyle.value = getComputedStyle(ref.value);
    });

    return (
      <ScrollAreaScrollbarImpl
        data-orientation="horizontal"
        {...scrollbarProps}
        ref={composeRefs}
        sizes={sizes}
        style={{
          bottom: 0,
          left: context.dir === "rtl" ? "var(--scroll-area-corner-width)" : 0,
          right: context.dir === "ltr" ? "var(--scroll-area-corner-width)" : 0,
          ["--scroll-area-thumb-width" as any]: getThumbSize(sizes) + "px",
          ...(props.style as CSSProperties),
        }}
        onThumbPointerDown$={$((pointerPos) =>
          onThumbPointerDown$(pointerPos.x)
        )}
        onDragScroll$={$((pointerPos) => onDragScroll$(pointerPos.x))}
        onWheelScroll$={$((event, maxScrollPos) => {
          if (context.viewport) {
            const scrollPos = context.viewport.scrollLeft + event.deltaX;
            onWheelScroll$(scrollPos);
            // prevent window scroll when wheeling on scrollbar
            if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
              event.preventDefault();
            }
          }
        })}
        onResize$={() => {
          if (ref.value && context.viewport && computedStyle.value) {
            onSizesChange$({
              content: context.viewport.scrollWidth,
              viewport: context.viewport.offsetWidth,
              scrollbar: {
                size: ref.value.clientWidth,
                paddingStart: toInt(computedStyle.value.paddingLeft),
                paddingEnd: toInt(computedStyle.value.paddingRight),
              },
            });
          }
        }}
      />
    );
  }
);

const ScrollAreaScrollbarY = component$<ScrollAreaScrollbarAxisProps>(
  (props) => {
    const {
      sizes,
      onDragScroll$,
      onThumbPointerDown$,
      onWheelScroll$,
      onSizesChange$,
      ...scrollbarProps
    } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME);
    let computedStyle: CSSStyleDeclaration;
    const ref = useSignal<ScrollAreaScrollbarAxisElement>();
    const composeRefs = useComposedRefs(
      props.ref,
      ref,
      context.onScrollbarYChange
    );

    useTask$(() => {
      if (ref.value) computedStyle = getComputedStyle(ref.value);
    });

    return (
      <ScrollAreaScrollbarImpl
        data-orientation="vertical"
        {...scrollbarProps}
        ref={composeRefs}
        sizes={sizes}
        style={{
          top: 0,
          right: context.dir === "ltr" ? 0 : undefined,
          left: context.dir === "rtl" ? 0 : undefined,
          bottom: "var(--radix-scroll-area-corner-height)",
          ["--radix-scroll-area-thumb-height" as any]:
            getThumbSize(sizes) + "px",
          ...(props.style as CSSProperties),
        }}
        onThumbPointerDown$={$((pointerPos) =>
          onThumbPointerDown$(pointerPos.y)
        )}
        onDragScroll$={$((pointerPos) => onDragScroll$(pointerPos.y))}
        onWheelScroll$={$((event, maxScrollPos) => {
          if (context.viewport) {
            const scrollPos = context.viewport.scrollTop + event.deltaY;
            onWheelScroll$(scrollPos);
            // prevent window scroll when wheeling on scrollbar
            if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
              event.preventDefault();
            }
          }
        })}
        onResize$={$(() => {
          if (ref.value && context.viewport && computedStyle.value) {
            onSizesChange$({
              content: context.viewport.scrollHeight,
              viewport: context.viewport.offsetHeight,
              scrollbar: {
                size: ref.value.clientHeight,
                paddingStart: toInt(computedStyle.paddingTop),
                paddingEnd: toInt(computedStyle.paddingBottom),
              },
            });
          }
        })}
      />
    );
  }
);

/* -----------------------------------------------------------------------------------------------*/

type ScrollbarContext = {
  hasThumb: boolean;
  scrollbar: Signal<ScrollAreaScrollbarElement | undefined>;
  onThumbChange: QRL<(thumb: ScrollAreaThumbElement | undefined) => void>;
  onThumbPointerUp: QRL<() => void>;
  onThumbPointerDown: QRL<(pointerPos: { x: number; y: number }) => void>;
  onThumbPositionChange: QRL<() => void>;
};

const [ScrollbarProvider, useScrollbarContext] =
  createScrollAreaContext<ScrollbarContext>(SCROLLBAR_NAME);

type ScrollAreaScrollbarImplElement = HTMLDivElement;
type ScrollAreaScrollbarImplPrivateProps = {
  sizes: Sizes;
  hasThumb: boolean;
  onThumbChange$: ScrollbarContext["onThumbChange"];
  onThumbPointerUp$: ScrollbarContext["onThumbPointerUp"];
  onThumbPointerDown$: ScrollbarContext["onThumbPointerDown"];
  onThumbPositionChange$: ScrollbarContext["onThumbPositionChange"];
  onWheelScroll$: QRL<(event: WheelEvent, maxScrollPos: number) => void>;
  onDragScroll$: QRL<(pointerPos: { x: number; y: number }) => void>;
  onResize$: QRL<() => void>;
};
interface ScrollAreaScrollbarImplProps
  extends Omit<PrimitiveDivProps, keyof ScrollAreaScrollbarImplPrivateProps>,
    ScrollAreaScrollbarImplPrivateProps {}

const ScrollAreaScrollbarImpl = component$<ScrollAreaScrollbarImplProps>(
  (props) => {
    const {
      sizes,
      hasThumb,
      onThumbChange$,
      onThumbPointerUp$,
      onThumbPointerDown$,
      onThumbPositionChange$,
      onDragScroll$,
      onWheelScroll$,
      onResize$,
      ...scrollbarProps
    } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME);
    const scrollbar = useSignal<ScrollAreaScrollbarElement>();
    const composeRefs = useComposedRefs(
      props.ref,
      (node) => (scrollbar.value = node)
    );
    const rectRef = useSignal<{
      height: number;
      width: number;
      x: number;
      y: number;
      /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/bottom) */
      readonly bottom: number;
      /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/left) */
      readonly left: number;
      /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/right) */
      readonly right: number;
      /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/top) */
      readonly top: number;
    }>();
    const prevWebkitUserSelectRef = useSignal<string>("");
    const viewport = context.viewport;
    const maxScrollPos = sizes.content - sizes.viewport;
    const handleWheelScroll = useCallbackRef(onWheelScroll$);
    const handleThumbPositionChange = useCallbackRef(onThumbPositionChange$);
    const handleResize = useDebounceCallback(onResize$, 10);

    const handleDragScroll = $((event: PointerEvent) => {
      if (rectRef.value) {
        const x = event.clientX - rectRef.value.left;
        const y = event.clientY - rectRef.value.top;
        onDragScroll$({ x, y });
      }
    });

    /**
     * We bind wheel event imperatively so we can switch off passive
     * mode for document wheel event to allow it to be prevented
     */
    useTask$(({ cleanup }) => {
      const handleWheel = $((event: WheelEvent) => {
        const element = event.target as HTMLElement;
        const isScrollbarWheel = scrollbar.value?.contains(element);
        if (isScrollbarWheel) handleWheelScroll(event, maxScrollPos);
      });
      document.addEventListener("wheel", handleWheel, { passive: false });
      cleanup(() =>
        document.removeEventListener("wheel", handleWheel, {
          passive: false,
        } as any)
      );
    });

    /**
     * Update thumb position on sizes change
     */
    useTask$(handleThumbPositionChange);

    useResizeObserver(scrollbar, handleResize);
    useResizeObserver(context.content, handleResize);

    return (
      <ScrollbarProvider
        scrollbar={scrollbar}
        hasThumb={hasThumb}
        onThumbChange={useCallbackRef(onThumbChange$)}
        onThumbPointerUp={useCallbackRef(onThumbPointerUp$)}
        onThumbPositionChange={handleThumbPositionChange}
        onThumbPointerDown={useCallbackRef(onThumbPointerDown$)}
      >
        <div
          {...scrollbarProps}
          ref={composeRefs}
          style={{
            position: "absolute",
            ...(scrollbarProps.style as CSSProperties),
          }}
          onPointerDown$={composeEventHandlers(
            props.onPointerDown$,
            $((event) => {
              const mainPointer = 0;
              if (event.button === mainPointer) {
                const element = event.target as HTMLElement;
                element.setPointerCapture(event.pointerId);
                rectRef.value = scrollbar.value!.getBoundingClientRect();
                // pointer capture doesn't prevent text selection in Safari
                // so we remove text selection manually when scrolling
                prevWebkitUserSelectRef.value =
                  document.body.style.webkitUserSelect;
                document.body.style.webkitUserSelect = "none";
                if (context.viewport)
                  context.viewport.style.scrollBehavior = "auto";
                handleDragScroll(event);
              }
            })
          )}
          onPointerMove$={composeEventHandlers(
            props.onPointerMove$,
            handleDragScroll
          )}
          onPointerUp$={composeEventHandlers(
            props.onPointerUp$,
            $((event) => {
              const element = event.target as HTMLElement;
              if (element.hasPointerCapture(event.pointerId)) {
                element.releasePointerCapture(event.pointerId);
              }
              document.body.style.webkitUserSelect =
                prevWebkitUserSelectRef.value;
              if (context.viewport) context.viewport.style.scrollBehavior = "";
              rectRef.value = null;
            })
          )}
        />
      </ScrollbarProvider>
    );
  }
);

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaThumb
 * -----------------------------------------------------------------------------------------------*/

const THUMB_NAME = "ScrollAreaThumb";

type ScrollAreaThumbElement = ScrollAreaThumbImplElement;
interface ScrollAreaThumbProps extends ScrollAreaThumbImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

const ScrollAreaThumb = component$<ScrollAreaThumbProps>((props) => {
  const { forceMount, ...thumbProps } = props;
  const scrollbarContext = useScrollbarContext(THUMB_NAME);
  return (
    <Presence present={forceMount || scrollbarContext.hasThumb}>
      <ScrollAreaThumbImpl ref={props.ref} {...thumbProps} />
    </Presence>
  );
});

type ScrollAreaThumbImplElement = HTMLDivElement;
interface ScrollAreaThumbImplProps extends PrimitiveDivProps {}

const ScrollAreaThumbImpl = component$<ScrollAreaThumbImplProps>((props) => {
  const { style, ...thumbProps } = props;
  const scrollAreaContext = useScrollAreaContext(THUMB_NAME);
  const scrollbarContext = useScrollbarContext(THUMB_NAME);
  const { onThumbPositionChange } = scrollbarContext;
  const composedRef = useComposedRefs(props.ref, (node) =>
    scrollbarContext.onThumbChange(node)
  );
  const removeUnlinkedScrollListenerRef = useSignal<QRL<() => void>>();
  const debounceScrollEnd = useDebounceCallback(
    $(() => {
      if (removeUnlinkedScrollListenerRef.value) {
        removeUnlinkedScrollListenerRef.value();
        removeUnlinkedScrollListenerRef.value = undefined;
      }
    }),
    100
  );

  useTask$(() => {
    const viewport = scrollAreaContext.viewport;
    if (viewport) {
      /**
       * We only bind to native scroll event so we know when scroll starts and ends.
       * When scroll starts we start a requestAnimationFrame loop that checks for
       * changes to scroll position. That rAF loop triggers our thumb position change
       * when relevant to avoid scroll-linked effects. We cancel the loop when scroll ends.
       * https://developer.mozilla.org/en-US/docs/Mozilla/Performance/Scroll-linked_effects
       */
      const handleScroll = $(() => {
        debounceScrollEnd();
        if (!removeUnlinkedScrollListenerRef.value) {
          const listener = addUnlinkedScrollListener(
            viewport,
            onThumbPositionChange
          );
          removeUnlinkedScrollListenerRef.value = listener;
          onThumbPositionChange();
        }
      });
      onThumbPositionChange();
      viewport.addEventListener("scroll", handleScroll);
      return () => viewport.removeEventListener("scroll", handleScroll);
    }
  });

  return (
    <div
      data-state={scrollbarContext.hasThumb ? "visible" : "hidden"}
      {...thumbProps}
      ref={composedRef}
      style={{
        width: "var(--radix-scroll-area-thumb-width)",
        height: "var(--radix-scroll-area-thumb-height)",
        ...(style as CSSProperties),
      }}
      onPointerDownCapture$={composeEventHandlers(
        props.onPointerDownCapture$,
        $((event) => {
          const thumb = event.target as HTMLElement;
          const thumbRect = thumb.getBoundingClientRect();
          const x = event.clientX - thumbRect.left;
          const y = event.clientY - thumbRect.top;
          scrollbarContext.onThumbPointerDown({ x, y });
        })
      )}
      onPointerUp$={composeEventHandlers(
        props.onPointerUp$,
        scrollbarContext.onThumbPointerUp
      )}
    />
  );
});

ScrollAreaThumb.displayName = THUMB_NAME;

/* -------------------------------------------------------------------------------------------------
 * ScrollAreaCorner
 * -----------------------------------------------------------------------------------------------*/

const CORNER_NAME = "ScrollAreaCorner";

type ScrollAreaCornerElement = ScrollAreaCornerImplElement;
interface ScrollAreaCornerProps extends ScrollAreaCornerImplProps {}

const ScrollAreaCorner = React.forwardRef<
  ScrollAreaCornerElement,
  ScrollAreaCornerProps
>((props: ScopedProps<ScrollAreaCornerProps>, forwardedRef) => {
  const context = useScrollAreaContext(CORNER_NAME, props.__scopeScrollArea);
  const hasBothScrollbarsVisible = Boolean(
    context.scrollbarX && context.scrollbarY
  );
  const hasCorner = context.type !== "scroll" && hasBothScrollbarsVisible;
  return hasCorner ? (
    <ScrollAreaCornerImpl {...props} ref={forwardedRef} />
  ) : null;
});

ScrollAreaCorner.displayName = CORNER_NAME;

/* -----------------------------------------------------------------------------------------------*/

type ScrollAreaCornerImplElement = HTMLDivElement;
interface ScrollAreaCornerImplProps extends PrimitiveDivProps {}

const ScrollAreaCornerImpl = component$<ScrollAreaCornerImplProps>((props) => {
  const { style, ...cornerProps } = props;
  const context = useScrollAreaContext(CORNER_NAME);
  const width = useSignal(0);
  const height = useSignal(0);
  const hasSize = Boolean(width.value && height.value);

  useResizeObserver(context.scrollbarX, () => {
    const height = context.scrollbarX?.offsetHeight || 0;
    context.onCornerHeightChange(height);
    height.value = height;
  });

  useResizeObserver(context.scrollbarY, () => {
    const width = context.scrollbarY?.offsetWidth || 0;
    context.onCornerWidthChange(width);
    width.value = width;
  });

  return hasSize ? (
    <div
      {...cornerProps}
      ref={props.ref}
      style={{
        width,
        height,
        position: "absolute",
        right: context.dir === "ltr" ? 0 : undefined,
        left: context.dir === "rtl" ? 0 : undefined,
        bottom: 0,
        ...style,
      }}
    />
  ) : null;
});

/* -----------------------------------------------------------------------------------------------*/

function toInt(value?: string) {
  return value ? parseInt(value, 10) : 0;
}

function getThumbRatio(viewportSize: number, contentSize: number) {
  const ratio = viewportSize / contentSize;
  return isNaN(ratio) ? 0 : ratio;
}

function getThumbSize(sizes: Sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding =
    sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  // minimum of 18 matches macOS minimum
  return Math.max(thumbSize, 18);
}

const getScrollPositionFromPointer = $(
  (
    pointerPos: number,
    pointerOffset: number,
    sizes: Sizes,
    dir: Direction = "ltr"
  ) => {
    const thumbSizePx = getThumbSize(sizes);
    const thumbCenter = thumbSizePx / 2;
    const offset = pointerOffset || thumbCenter;
    const thumbOffsetFromEnd = thumbSizePx - offset;
    const minPointerPos = sizes.scrollbar.paddingStart + offset;
    const maxPointerPos =
      sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
    const maxScrollPos = sizes.content - sizes.viewport;
    const scrollRange =
      dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
    const interpolate = linearScale(
      [minPointerPos, maxPointerPos],
      scrollRange as [number, number]
    );
    return interpolate(pointerPos);
  }
);

function getThumbOffsetFromScroll(
  scrollPos: number,
  sizes: Sizes,
  dir: Direction = "ltr"
) {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding =
    sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange =
    dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(
    scrollPos,
    scrollClampRange as [number, number]
  );
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}

// https://github.com/tmcw-up-for-adoption/simple-linear-scale/blob/master/index.js
function linearScale(
  input: readonly [number, number],
  output: readonly [number, number]
) {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}

function isScrollingWithinScrollbarBounds(
  scrollPos: number,
  maxScrollPos: number
) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}

// Custom scroll handler to avoid scroll-linked effects
// https://developer.mozilla.org/en-US/docs/Mozilla/Performance/Scroll-linked_effects
const addUnlinkedScrollListener = $((node: HTMLElement, handler = () => {}) => {
  let prevPosition = { left: node.scrollLeft, top: node.scrollTop };
  let rAF = 0;
  (function loop() {
    const position = { left: node.scrollLeft, top: node.scrollTop };
    const isHorizontalScroll = prevPosition.left !== position.left;
    const isVerticalScroll = prevPosition.top !== position.top;
    if (isHorizontalScroll || isVerticalScroll) handler();
    prevPosition = position;
    rAF = window.requestAnimationFrame(loop);
  })();
  return () => window.cancelAnimationFrame(rAF);
});

export const useDebounceCallback = (
  fn: QRL<(args: any) => void>,
  delay: number
) => {
  const timeoutId = useSignal<number>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return $((args?: any) => {
    clearTimeout(timeoutId.value);
    timeoutId.value = Number(setTimeout(() => fn(args), delay));
  });
};

function useResizeObserver(
  element: Signal<HTMLElement | undefined>,
  onResize: () => void
) {
  const handleResize = useCallbackRef(onResize);
  useVisibleTask$(() => {
    let rAF = 0;
    if (element.value) {
      /**
       * Resize Observer will throw an often benign error that says `ResizeObserver loop
       * completed with undelivered notifications`. This means that ResizeObserver was not
       * able to deliver all observations within a single animation frame, so we use
       * `requestAnimationFrame` to ensure we don't deliver unnecessary observations.
       * Further reading: https://github.com/WICG/resize-observer/issues/38
       */
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(handleResize);
      });
      resizeObserver.observe(element.value);
      return () => {
        window.cancelAnimationFrame(rAF);
        resizeObserver.unobserve(element.value!);
      };
    }
  });
}

/**
 * This is a helper function that is used when a component supports `asChild`
 * using the `Slot` component but its implementation contains nested DOM elements.
 *
 * Using it ensures if a consumer uses the `asChild` prop, the elements are in
 * correct order in the DOM, adopting the intended consumer `children`.
 */
function getSubtree(
  options: { asChild: boolean | undefined; children: JSXChildren },
  content: JSXOutput | ((children: JSXChildren) => JSXOutput)
) {
  const { asChild, children } = options;
  if (!asChild)
    return typeof content === "function" ? content(children) : content;

  const firstChild = React.Children.only(children) as React.ReactElement;
  return React.cloneElement(firstChild, {
    children:
      typeof content === "function"
        ? content(firstChild.props.children)
        : content,
  });
}

/* -----------------------------------------------------------------------------------------------*/

const Root = ScrollArea;
const Viewport = ScrollAreaViewport;
const Scrollbar = ScrollAreaScrollbar;
const Thumb = ScrollAreaThumb;
const Corner = ScrollAreaCorner;

export {
  createScrollAreaScope,
  //
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
  //
  Root,
  Viewport,
  Scrollbar,
  Thumb,
  Corner,
};
export type {
  ScrollAreaProps,
  ScrollAreaViewportProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
  ScrollAreaCornerProps,
};
