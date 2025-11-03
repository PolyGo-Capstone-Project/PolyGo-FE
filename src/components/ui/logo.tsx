import { useLocale } from "next-intl";
import Image from "next/image";
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

const imageDimensions: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 45,
  default: 70,
  lg: 100,
};

function LogoContent({ size }: { size: NonNullable<LogoProps["size"]> }) {
  return (
    <>
      <Image
        src="/assets/logo/Primary.png"
        alt="PolyGo logo"
        width={imageDimensions[size]}
        height={imageDimensions[size]}
        className="rounded-lg"
        priority
      />
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
        <LogoContent size={size} />
      </div>
    );
  }

  return (
    <Link href={href} className={containerClass}>
      <LogoContent size={size} />
    </Link>
  );
}
