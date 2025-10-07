"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const year = new Date().getFullYear();
  const prefix = locale === "" ? "" : `/${locale}`;

  const navigation = [
    { name: t("about"), href: `${prefix}/about` },
    { name: t("terms"), href: `${prefix}/terms` },
    { name: t("privacy"), href: `${prefix}/policy` },
    { name: t("supportCenter"), href: `${prefix}/support-center` },
  ];

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            P
          </div>
          <span className="font-semibold">PolyGo</span>
        </div>

        <nav className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
