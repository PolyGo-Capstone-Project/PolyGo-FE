"use client";

import {
  Calendar,
  CalendarDays,
  Globe,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Sparkles,
  Users,
  Users2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  LanguageSwitcher,
  Logo,
  ModeToggle,
  NotificationBell,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components";
import { UserMenu } from "@/components/shared";
import { useAuthMe } from "@/hooks";

export function UserHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("header");
  const { data: userData } = useAuthMe();
  const user = userData?.payload;
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
            <Logo redirectTo="dashboard" />
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
            <NotificationBell />
            {user && <UserMenu user={user} />}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-md hover:bg-accent/60 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="flex flex-col justify-between h-full p-0"
              >
                {/* Top navigation items */}
                <div className="flex flex-col overflow-y-auto">
                  {/* logo + close */}
                  <div className="flex items-center gap-2 p-4 border-b">
                    <Logo redirectTo="dashboard" />
                  </div>

                  {/* menu items */}
                  <div className="flex flex-col gap-5 p-6">
                    <Button variant="ghost" className="justify-start gap-4">
                      <Home className="h-4 w-4" /> Home
                    </Button>
                    <Button variant="ghost" className="justify-start gap-4">
                      <MessageSquare className="h-4 w-4" /> Chat
                    </Button>
                    <Button variant="ghost" className="justify-start gap-4">
                      <Calendar className="h-4 w-4" /> Event
                    </Button>
                    <Button variant="ghost" className="justify-start gap-4">
                      <Users className="h-4 w-4" /> Matching
                    </Button>
                    <Button variant="ghost" className="justify-start gap-4">
                      <Globe className="h-4 w-4" /> Social
                    </Button>
                  </div>
                </div>

                {/* Bottom fixed actions */}
                <div className="p-3 flex flex-col gap-3 border-t bg-background">
                  {/* Bottom actions: Notification + Mode + Language */}
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-background/80 p-2">
                    <NotificationBell />
                    <ModeToggle />
                    <LanguageSwitcher />
                  </div>

                  {/* User info */}
                  <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="/avatars/user.jpg" alt="@user" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col flex-1">
                      <p className="text-sm font-medium">Lê Quang Huy</p>
                      <p className="text-xs text-muted-foreground truncate">
                        huy@example.com
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        /* TODO: handle logout action */
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
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
