"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const SPINNER_SIZES = {
  sm: {
    container: "h-6 w-6",
    ring: "h-6 w-6 border-2",
  },
  md: {
    container: "h-8 w-8",
    ring: "h-8 w-8 border-[3px]",
  },
  lg: {
    container: "h-12 w-12",
    ring: "h-12 w-12 border-4",
  },
} as const;

export type LoadingSpinnerProps = {
  /** Optional accessible label. If omitted, a default "Loading" label is announced. */
  label?: string;
  /** Visual size of the spinner. */
  size?: keyof typeof SPINNER_SIZES;
  /** Additional classes applied to the outer wrapper. */
  className?: string;
  /** Whether to render the label visually. */
  showLabel?: boolean;
} & React.HTMLAttributes<HTMLSpanElement>;

export const LoadingSpinner = React.forwardRef<
  HTMLSpanElement,
  LoadingSpinnerProps
>(
  (
    {
      label = "Loading",
      showLabel = false,
      size = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const sizeConfig = SPINNER_SIZES[size] ?? SPINNER_SIZES.md;

    return (
      <span
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex items-center gap-3 text-muted-foreground",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "relative inline-flex items-center justify-center",
            sizeConfig.container
          )}
        >
          <span
            className={cn(
              "border-primary/70 border-b-transparent rounded-full animate-spin",
              sizeConfig.ring
            )}
          />
        </span>
        {showLabel ? (
          <span
            className="font-medium text-sm text-foreground"
            data-slot="spinner-label"
          >
            {label}
          </span>
        ) : (
          <span className="sr-only">{label}</span>
        )}
        {children}
      </span>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";
