import { ThemeProvider } from "qwik-themes";
import { RootProvider } from "fumadocs-ui/provider";
import { component$, Slot } from "@builder.io/qwik";

export const Providers = component$(() => {
  return (
    <RootProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Slot />
      </ThemeProvider>
    </RootProvider>
  );
});
