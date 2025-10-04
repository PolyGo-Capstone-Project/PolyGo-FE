import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function Logo({ className, size = "default" }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center justify-between">
      <Link
        href="/"
        className={cn(
          "font-bold text-primary flex items-center space-x-2",
          sizes[size],
          className
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="m2 17 10 5 10-5" />
            <path d="m2 12 10 5 10-5" />
          </svg>
        </div>
        <span className="font-bold">PolyGo</span>
      </Link>
    </div>
  );
}
