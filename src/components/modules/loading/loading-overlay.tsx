"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { LoadingSpinner, LoadingSpinnerProps } from "./loading-spinner";

export type LoadingOverlayProps = {
  /** Message displayed underneath the spinner. */
  message?: string;
  /** Whether to apply a subtle background blur effect. */
  blur?: boolean;
  /** Spinner props override. */
  spinnerProps?: Partial<LoadingSpinnerProps>;
  /** If provided, render additional helper content below the message. */
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const LoadingOverlay = React.forwardRef<
  HTMLDivElement,
  LoadingOverlayProps
>(
  (
    {
      message = "Đang tải dữ liệu",
      blur = true,
      className,
      spinnerProps,
      children,
      ...props
    },
    ref
  ) => {
    const {
      label: spinnerLabel,
      showLabel: spinnerShowLabel,
      size: spinnerSize,
      ...restSpinnerProps
    } = spinnerProps ?? {};

    return (
      <div
        ref={ref}
        className={cn(
          "bg-background/80 absolute inset-0 z-50 flex flex-col items-center justify-center gap-4",
          blur && "backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <LoadingSpinner
          size={spinnerSize ?? "lg"}
          label={spinnerLabel ?? message}
          showLabel={spinnerShowLabel ?? true}
          {...restSpinnerProps}
        />
        {message && (
          <p
            className="text-sm text-muted-foreground"
            data-slot="loading-message"
          >
            {message}
          </p>
        )}
        {children}
      </div>
    );
  }
);

LoadingOverlay.displayName = "LoadingOverlay";
