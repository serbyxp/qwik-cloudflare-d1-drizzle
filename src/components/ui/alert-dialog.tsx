import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
//
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import * as AlertDialogPrimitive from "./dialog/dialog";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay =
  "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

const AlertDialogContent = component$<
  PropsOf<typeof AlertDialogPrimitive.Content>
>(({ class: className, ...props }) => {
  return (
    <AlertDialogPrimitive.Content
      class={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  );
});

const AlertDialogHeader = component$<PropsOf<"header">>(
  ({ class: className, ...props }) => (
    <header
      class={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    >
      <Slot />
    </header>
  )
);

const AlertDialogFooter = component$<PropsOf<"footer">>(
  ({ class: className, ...props }) => (
    <footer
      class={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    >
      <Slot />
    </footer>
  )
);

const AlertDialogTitle = component$<PropsOf<typeof AlertDialogPrimitive.Title>>(
  ({ class: className, ...props }) => (
    <AlertDialogPrimitive.Title
      class={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
);

const AlertDialogDescription = component$<
  PropsOf<typeof AlertDialogPrimitive.Description>
>(({ class: className, ...props }) => (
  <AlertDialogPrimitive.Description
    class={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

const AlertDialogAction = component$<
  PropsOf<typeof AlertDialogPrimitive.Close>
>(({ class: className, ...props }) => (
  <AlertDialogPrimitive.Close
    class={cn(buttonVariants(), className)}
    {...props}
  />
));

const AlertDialogCancel = component$<
  PropsOf<typeof AlertDialogPrimitive.Close>
>(({ class: className, ...props }) => {
  return (
    <AlertDialogPrimitive.Close
      class={cn(
        buttonVariants({ variant: "outline" }),
        "mt-2 sm:mt-0",
        className
      )}
      {...props}
    >
      <Slot />
    </AlertDialogPrimitive.Close>
  );
});

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
