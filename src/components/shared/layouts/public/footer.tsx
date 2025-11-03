"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Logo } from "@/components/ui";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const year = new Date().getFullYear();

  // Giữ logic prefix đúng cho i18n routes
  const prefix = locale === "" ? "" : `/${locale}`;

  const navigation = [
    { name: t("about"), href: `${prefix}/about` },
    { name: t("terms"), href: `${prefix}/terms` },
    { name: t("privacy"), href: `${prefix}/policy` },
    { name: t("supportCenter"), href: `${prefix}/support` },
  ];

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        {/* Block logo + brand */}
        <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:justify-between">
          <Logo withLink={false} />

          {/* Nav desktop (giống cũ) */}
          <nav
            aria-label="Footer navigation"
            className="hidden md:flex md:flex-wrap md:items-center md:gap-5 text-sm text-muted-foreground"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Nav mobile: lưới 2 cột, tap-target lớn */}
        <nav
          aria-label="Footer navigation mobile"
          className="mt-6 grid grid-cols-2 gap-3 md:hidden"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border bg-card/30 px-4 py-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Divider + copyright */}
        <div className="mt-8 border-t" />
        <div className="pt-4 text-center text-xs text-muted-foreground">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}