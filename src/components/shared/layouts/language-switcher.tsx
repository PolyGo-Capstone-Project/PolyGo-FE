"use client";

import { ChevronsUpDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  defaultLocale,
  type Locale,
  localeFlags,
  localeNames,
  locales,
} from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("languageSwitcher");

  const activeLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  const switchLocale = (newLocale: Locale) => {
    if (activeLocale === newLocale) {
      return;
    }

    const segments = pathname.split("/").filter(Boolean);

    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }

    const newPath = `/${segments.join("/")}`;

    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 px-3">
          <span className="text-lg leading-none">
            {localeFlags[activeLocale]}
          </span>
          <ChevronsUpDown className="ml-1 size-3 opacity-60" />
          <span className="sr-only">{t("label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuRadioGroup
          value={activeLocale}
          onValueChange={(value) => switchLocale(value as Locale)}
        >
          {locales.map((loc) => (
            <DropdownMenuRadioItem
              key={loc}
              value={loc}
              className="flex items-center gap-3"
            >
              <span className="text-lg leading-none">{localeFlags[loc]}</span>
              <span className="flex flex-col text-left">
                <span className="text-sm font-medium">{localeNames[loc]}</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {loc}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
