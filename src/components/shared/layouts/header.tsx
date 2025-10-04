"use client";

import { Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { ModeToggle } from "@/components/modules";
import {
  Button,
  Logo,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui";
import { useAuthStore } from "@/hooks";

import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const isAuthenticated = useAuthStore((state) => state.isAuth);
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("header");

  const navigation = [
    { name: t("products"), href: `/${locale === "en" ? "" : locale}/product` },
    { name: t("features"), href: `/${locale === "en" ? "" : locale}#features` },
    { name: t("pricing"), href: `/${locale === "en" ? "" : locale}#pricing` },
    { name: t("contact"), href: `/${locale === "en" ? "" : locale}/contact` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
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

          {/* Desktop CTA */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href={`/${locale === "en" ? "" : locale}/login`}>
                    {t("login")}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/${locale === "en" ? "" : locale}/register`}>
                    {t("getStarted")}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link
                    href={`/${locale === "en" ? "" : locale}/manage/dashboard`}
                  >
                    {t("dashboard")}
                  </Link>
                </Button>
              </>
            )}
            <LanguageSwitcher />
            <ModeToggle />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <div className="flex h-full flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b p-6">
                    <Logo size="sm" />
                    <ModeToggle />
                  </div>

                  {/* Navigation */}
                  <div className="flex-1 py-6">
                    <nav className="px-6 space-y-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  {/* Bottom Actions */}
                  <div className="border-t p-6 space-y-4">
                    <div className="space-y-2">
                      {!isAuthenticated ? (
                        <>
                          <Button
                            variant="outline"
                            className="w-full justify-center"
                            asChild
                          >
                            <Link
                              href={`/${locale === "en" ? "" : locale}/login`}
                              onClick={() => setIsOpen(false)}
                            >
                              {t("login")}
                            </Link>
                          </Button>
                          <Button className="w-full" asChild>
                            <Link
                              href={`/${locale === "en" ? "" : locale}/register`}
                              onClick={() => setIsOpen(false)}
                            >
                              {t("getStarted")}
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full justify-center"
                          asChild
                        >
                          <Link
                            href={`/${locale === "en" ? "" : locale}/manage/dashboard`}
                            onClick={() => setIsOpen(false)}
                          >
                            {t("dashboard")}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
