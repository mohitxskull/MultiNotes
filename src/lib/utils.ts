import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";
import { TanStackFormError } from "./types";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const zodErrorToFormError = (
  error: z.ZodError<any>,
): TanStackFormError => {
  const { fieldErrors, formErrors } = z.flattenError(error);

  return {
    form: formErrors.length > 0 ? formErrors.join(", ") : undefined,
    fields: fieldErrors
      ? Object.entries(fieldErrors).reduce(
          (acc, [key, value]) => {
            if (value && value.length > 0) {
              acc[key] = value.join(", ");
            }
            return acc;
          },
          {} as Record<string, string>,
        )
      : undefined,
  };
};
