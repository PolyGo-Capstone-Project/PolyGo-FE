"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldWrapperProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Field({
  label,
  error,
  required,
  children,
  className,
}: FieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
