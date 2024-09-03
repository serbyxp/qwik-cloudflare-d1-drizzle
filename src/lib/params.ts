import { useLocation } from "@builder.io/qwik-city";
import { z } from "zod";

export function useSafeParams<T extends z.AnyZodObject>(schema: T) {
  const params = useLocation().params;
  const result = schema.parse(params);
  return result as Zod.infer<T>;
}

export function useSafeSearchParams<T extends z.AnyZodObject>(schema: T) {
  const params = useLocation().url.searchParams;
  const result = schema.parse(params);
  return result as Zod.infer<T>;
}
