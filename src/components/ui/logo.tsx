import { useLocale } from "next-intl";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  redirectTo?: string;
  withLink?: boolean;
}

const sizeClasses: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-lg",
  default: "text-xl",
  lg: "text-2xl",
};

function LogoContent() {
  return (
    <>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="text-lg font-extrabold">P</span>
      </span>
      <span className="font-bold text-black dark:text-white">PolyGo</span>
    </>
  );
}

export function Logo({
  className,
  size = "default",
  redirectTo,
  withLink = true,
}: LogoProps) {
  const locale = useLocale();
  const href = `/${locale}${redirectTo ? `/${redirectTo}` : ""}`;
  const containerClass = cn(
    "flex items-center space-x-2 font-bold text-primary",
    sizeClasses[size],
    className
  );

  if (!withLink) {
    return (
      <div className={containerClass}>
        <LogoContent />
      </div>
    );
  }

  return (
    <Link href={href} className={containerClass}>
      <LogoContent />
    </Link>
  );
}
