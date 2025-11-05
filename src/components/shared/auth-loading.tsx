"use client";

import { LoadingSpinner } from "@/components/modules";

interface AuthLoadingProps {
  message?: string;
}

export function AuthLoading({
  message = "Checking authorization...",
}: AuthLoadingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
