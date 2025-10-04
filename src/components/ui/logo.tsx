import { useLocale } from "next-intl";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function Logo({ className, size = "default" }: LogoProps) {
  const locale = useLocale();

  const sizes = {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center justify-between">
      <Link
        href={`/${locale}`}
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
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <span className="font-bold">PolyGo</span>
      </Link>
    </div>
  );
}
