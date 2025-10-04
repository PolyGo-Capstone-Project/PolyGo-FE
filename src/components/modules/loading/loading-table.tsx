import * as React from "react";

import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

export type LoadingTableProps = {
  /** Number of columns the table skeleton should render. */
  columns?: number;
  /** Number of body rows to display. */
  rows?: number;
  /** Optional caption skeleton below the table. */
  withCaption?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function LoadingTable({
  columns = 4,
  rows = 6,
  withCaption = false,
  className,
  children,
  ...props
}: LoadingTableProps) {
  const headerCells = Array.from({ length: columns });
  const bodyRows = Array.from({ length: rows });

  return (
    <div
      className={cn("rounded-xl border bg-card p-4 shadow-sm", className)}
      {...props}
    >
      <div className="relative w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {headerCells.map((_, index) => (
                <th key={index} className="px-3 pb-3 text-left font-medium">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b last:border-0">
                {headerCells.map((_, colIndex) => (
                  <td key={colIndex} className="px-3 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {withCaption ? (
        <div className="mt-4">
          <Skeleton className="h-4 w-48" />
        </div>
      ) : null}
      {children}
    </div>
  );
}
