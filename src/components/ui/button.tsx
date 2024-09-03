import type { PropsOf } from "@builder.io/qwik";
import { component$, Slot } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-white bg-slate-600 hover:bg-slate-600/80 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "hover:underline bg-white border border-black dark:bg-gray-300  dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type ButtonBaseProps = ButtonVariantProps & {
  class?: string;
  asChild?: boolean;
};

export type ButtonElementProps = ButtonBaseProps & PropsOf<"button">;
export type DivElementProps = ButtonBaseProps & PropsOf<"div">;

export type ButtonProps = ButtonElementProps | DivElementProps;

export const Button = component$<ButtonProps>((props) => {
  const {
    class: className,
    variant,
    size,
    asChild = false,
    ...restProps
  } = props;

  const classes = cn(buttonVariants({ variant, size, className }));

  if (asChild) {
    return (
      <div class={classes} {...(restProps as DivElementProps)}>
        <Slot />
      </div>
    );
  }

  return (
    <button class={classes} {...(restProps as ButtonElementProps)}>
      <Slot />
    </button>
  );
});

export { buttonVariants };
