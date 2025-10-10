"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  ModeToggle,
LanguageSwitcher,
  Button,
  Logo,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components";
import { Role } from "@/constants";
import { useAuthStore } from "@/hooks";

export function Header() {
  const isAuthenticated = useAuthStore((state) => state.isAuth);
  const role = useAuthStore((state) => state.role);
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("header");

  const dashboardLink =
    role === Role.Admin
      ? `/${locale}/manage/dashboard`
      : `/${locale}/dashboard`;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <ModeToggle />
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link href={`/${locale}/login`}>{t("login")}</Link>
              </Button>
              <Button asChild>
                <Link href={`/${locale}/register`}>{t("getStarted")}</Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link href={dashboardLink}>{t("dashboard")}</Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[80vw] max-w-sm p-0">
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <Logo size="sm" />
                  <ModeToggle />
                </div>

                {/* Menu content */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex flex-col gap-3 px-6 py-6">
                    {!isAuthenticated ? (
                      <>
                        <Button
                          variant="outline"
                          className="w-full"
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href={`/${locale}/login`}>{t("login")}</Link>
                        </Button>
                        <Button
                          className="w-full"
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href={`/${locale}/register`}>
                            {t("getStarted")}
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href={dashboardLink}>{t("dashboard")}</Link>
                      </Button>
                    )}
                  </div>

                  <div className="border-t px-6 py-4 text-sm text-muted-foreground">
                    <p>© 2025 PolyGo. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
