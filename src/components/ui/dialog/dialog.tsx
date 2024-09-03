import type { PropsOf, QRL, Signal } from "@builder.io/qwik";
import {
  $,
  component$,
  createContextId,
  Slot,
  sync$,
  useContext,
  useContextProvider,
  useId,
  useSignal,
  useStyles$,
  useTask$,
} from "@builder.io/qwik";
import { LuX } from "@qwikest/icons/lucide";
//
import { cn } from "~/lib/utils";
import styles from "./dialog.css?inline";
import { useModal } from "./use-modal";

export type DialogContext = {
  localId: string;
  showSig: Signal<boolean>;
  onShow$?: QRL<() => void>;
  onClose$?: QRL<() => void>;
  closeOnBackdropClick?: boolean;
  alert?: boolean;
};
export const dialogContextId = createContextId<DialogContext>("app-modal");

type DialogRootProps = {
  onShow$?: QRL<() => void>;
  onClose$?: QRL<() => void>;
  "bind:show"?: Signal<boolean>;
  closeOnBackdropClick?: boolean;
  alert?: boolean;
} & PropsOf<"div">;

const Dialog = component$<DialogRootProps>(
  ({
    "bind:show": givenShowSig,
    closeOnBackdropClick,
    onShow$,
    onClose$,
    alert,
    ...props
  }) => {
    const localId = useId();

    const defaultShowSig = useSignal<boolean>(false);
    const showSig = givenShowSig ?? defaultShowSig;

    const context: DialogContext = {
      localId,
      showSig,
      closeOnBackdropClick,
      onShow$,
      onClose$,
      alert,
    };

    useContextProvider(dialogContextId, context);

    return (
      <div {...props}>
        <Slot />
      </div>
    );
  }
);

export type DialogProps = Omit<PropsOf<"dialog">, "open"> & {
  onShow$?: QRL<() => void>;
  onClose$?: QRL<() => void>;
  "bind:show": Signal<boolean>;
  closeOnBackdropClick?: boolean;
  alert?: boolean;
};

const DialogPortal = component$<DialogProps>((props) => {
  useStyles$(styles);
  const {
    activateFocusTrap,
    closeModal,
    deactivateFocusTrap,
    showModal,
    trapFocus,
    wasModalBackdropClicked,
  } = useModal();
  const context = useContext(dialogContextId);
  const panelRef = useSignal<HTMLDialogElement>();

  useTask$(async function toggleModal({ track, cleanup }) {
    const isOpen = track(() => context.showSig.value);

    if (!panelRef.value) return;

    const focusTrap = await trapFocus(panelRef.value);

    if (isOpen) {
      // HACK: keep modal scroll position in place with iOS
      const storedRequestAnimationFrame = window.requestAnimationFrame;
      window.requestAnimationFrame = () => 42;

      await showModal(panelRef.value);
      window.requestAnimationFrame = storedRequestAnimationFrame;
      await context.onShow$?.();
      activateFocusTrap(focusTrap);
    } else {
      await closeModal(panelRef.value);
      await context.onClose$?.();
    }

    cleanup(async () => {
      await deactivateFocusTrap(focusTrap);
    });
  });

  const closeOnBackdropClick$ = $(async (e: MouseEvent) => {
    if (context.alert === true || context.closeOnBackdropClick === false) {
      return;
    }

    // We do not want to close elements that dangle outside of the modal
    if (!(e.target instanceof HTMLDialogElement)) {
      return;
    }

    if (await wasModalBackdropClicked(panelRef.value, e)) {
      context.showSig.value = false;
    }
  });

  const handleKeyDownSync$ = sync$((e: KeyboardEvent) => {
    const keys = [" ", "Enter"];

    if (e.target instanceof HTMLDialogElement && keys.includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === "Escape") {
      e.preventDefault();
    }
  });

  const handleKeyDown$ = $((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      context.showSig.value = false;
      e.stopPropagation();
    }
  });

  return (
    <dialog
      {...props}
      id={`${context.localId}-root`}
      aria-labelledby={`${context.localId}-title`}
      aria-describedby={`${context.localId}-description`}
      // TODO: deprecate data-state in favor of data-open, data-closing, and data-closed
      data-state={context.showSig.value ? "open" : "closed"}
      data-open={context.showSig.value && ""}
      data-closed={!context.showSig.value && ""}
      role={context.alert === true ? "alertdialog" : "dialog"}
      ref={panelRef}
      onKeyDown$={[handleKeyDownSync$, handleKeyDown$, props.onKeyDown$]}
      onClick$={async (e) => {
        e.stopPropagation();
        await closeOnBackdropClick$(e);
      }}
    >
      <Slot />
    </dialog>
  );
});

const DialogClose = component$<PropsOf<"button">>((props) => {
  const context = useContext(dialogContextId);

  return (
    <button onClick$={() => (context.showSig.value = false)} {...props}>
      <Slot />
    </button>
  );
});

const DialogTrigger = component$((props: PropsOf<"button">) => {
  const context = useContext(dialogContextId);

  const handleClick$ = $(() => {
    context.showSig.value = !context.showSig.value;
  });

  return (
    <button
      aria-haspopup="dialog"
      aria-expanded={context.showSig.value}
      data-open={context.showSig.value ? "" : undefined}
      data-closed={!context.showSig.value ? "" : undefined}
      onClick$={[handleClick$, props.onClick$]}
      {...props}
    >
      <Slot />
    </button>
  );
});

const DialogOverlay =
  "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

const DialogContent = component$<PropsOf<"div">>(
  ({ class: className, ...props }) => (
    <div>
      <div
        class={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        {...props}
      >
        <Slot />
        <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <LuX class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </DialogClose>
      </div>
    </div>
  )
);

const DialogHeader = component$<PropsOf<"header">>(
  ({ class: className, ...props }) => (
    <header
      class={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    >
      <Slot />
    </header>
  )
);

const DialogFooter = component$<PropsOf<"footer">>(
  ({ class: className, ...props }) => {
    return (
      <footer
        class={cn(
          "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
          className
        )}
        {...props}
      >
        <Slot />
      </footer>
    );
  }
);

const DialogTitle = component$<PropsOf<"h2">>(
  ({ class: className, ...props }) => {
    const context = useContext(dialogContextId);

    const titleId = `${context.localId}-title`;
    return (
      <h2
        id={titleId}
        class={cn(
          "text-lg font-semibold leading-none tracking-tight",
          className
        )}
        {...props}
      >
        <Slot />
      </h2>
    );
  }
);

const DialogDescription = component$<PropsOf<"p">>(
  ({ class: className, ...props }) => {
    const context = useContext(dialogContextId);

    const descriptionId = `${context.localId}-description`;
    return (
      <p
        id={descriptionId}
        class={cn("text-sm text-muted-foreground", className)}
        {...props}
      >
        <Slot />
      </p>
    );
  }
);
const Root = Dialog;
const Trigger = DialogTrigger;
const Portal = DialogPortal;
const Content = DialogContent;
const Title = DialogTitle;
const Description = DialogDescription;
const Close = DialogClose;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  //
  Root,
  Trigger,
  Portal,
  Content,
  Title,
  Description,
  Close,
  //
};
