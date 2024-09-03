import type { InputHTMLAttributes } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
//
import { cn } from "~/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = component$<InputProps>(({ class: className, type, ...props }) => {
  return (
    <input
      type={type}
      class={cn(
        "text-base flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

export { Input };
