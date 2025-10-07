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
          <span className="text-lg font-extrabold">P</span>
        </div>
        <span className="font-bold text-black">PolyGo</span>
      </Link>
    </div>
  );
}
