"use client";

import { Loader2 } from "lucide-react";

interface AuthLoadingProps {
  message?: string;
}

export function AuthLoading({
  message = "Checking authorization...",
}: AuthLoadingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
