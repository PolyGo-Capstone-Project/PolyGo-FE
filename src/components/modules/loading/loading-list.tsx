import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type LoadingListProps = {
  /** Number of list rows to render. */
  items?: number;
  /** Whether to display an avatar placeholder on each row. */
  withAvatar?: boolean;
  /** Optional heading skeleton at the top of the list. */
  withHeading?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function LoadingList({
  items = 5,
  withAvatar = true,
  withHeading = true,
  className,
  children,
  ...props
}: LoadingListProps) {
  const rows = Array.from({ length: items });

  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border bg-card p-6 shadow-sm",
        className
      )}
      {...props}
    >
      {withHeading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      ) : null}
      <div className="space-y-4">
        {rows.map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4"
            data-slot="loading-list-item"
          >
            {withAvatar ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : null}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
