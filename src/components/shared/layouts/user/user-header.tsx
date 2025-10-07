"use client";

import {
  CalendarDays,
  Home,
  Menu,
  MessageSquare,
  Sparkles,
  Users2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { ModeToggle } from "@/components/modules";
import { LanguageSwitcher } from "@/components/shared/layouts/language-switcher";
import {
  Button,
  Logo,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui";

export function UserHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("header");

  const navigation = [
    {
      name: t("userdashboard"),
      href: `/${locale}/dashboard`,
      icon: Home,
    },
    { name: t("chat"), href: `/${locale}/chat`, icon: MessageSquare },
    { name: t("event"), href: `/${locale}/event`, icon: CalendarDays },
    { name: t("matching"), href: `/${locale}/matching`, icon: Sparkles },
    { name: t("social"), href: `/${locale}/social`, icon: Users2 },
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
                className="flex items-center justify-center text-2sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex md:items-center md:space-x-4">
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
                    <div className="space-y-2"></div>
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
