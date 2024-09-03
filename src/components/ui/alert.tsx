import type { HTMLAttributes } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
//
import { cn } from "~/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        success:
          "bg-success text-success-foreground [&>svg]:text-success-foreground",
        default: "bg-background dark:text-foreground",
        destructive:
          "text-black border-destructive/50 dark:bg-destructive dark:text-destructive-foreground dark:border-destructive [&>svg]:text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = component$<
  HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ class: className, variant, ...props }) => (
  <div
    role="alert"
    class={cn(alertVariants({ variant }), className)}
    {...props}
  >
    <Slot />
  </div>
));

const AlertTitle = component$<HTMLAttributes<HTMLHeadingElement>>(
  ({ class: className, ...props }) => (
    <h5
      class={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    >
      <Slot />
    </h5>
  )
);

const AlertDescription = component$<HTMLAttributes<HTMLParagraphElement>>(
  ({ class: className, ...props }) => (
    <div class={cn("text-sm [&_p]:leading-relaxed", className)} {...props}>
      <Slot />
    </div>
  )
);

export { Alert, AlertTitle, AlertDescription };
