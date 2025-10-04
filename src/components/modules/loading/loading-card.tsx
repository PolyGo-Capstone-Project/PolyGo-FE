import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type LoadingCardProps = {
  /** Number of skeleton lines rendered inside the card content. */
  lines?: number;
  /** Whether to render an action placeholder in the header. */
  withAction?: boolean;
} & React.ComponentProps<typeof Card>;

export function LoadingCard({
  lines = 3,
  withAction = false,
  className,
  children,
  ...props
}: LoadingCardProps) {
  const contentLines = Array.from({ length: lines });

  return (
    <Card className={cn("min-h-[220px]", className)} {...props}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-36" />
          <CardDescription>
            <Skeleton className="h-4 w-56" />
          </CardDescription>
        </div>
        {withAction ? <Skeleton className="h-9 w-24 rounded-lg" /> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {contentLines.map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
        {children}
      </CardContent>
      <CardFooter className="mt-auto flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </CardFooter>
    </Card>
  );
}
