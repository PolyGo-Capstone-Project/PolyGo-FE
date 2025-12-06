"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthLoading } from "@/components/shared/auth-loading";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Role } from "@/constants";
import { useAuthStore } from "@/hooks";

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const { isAuth, role } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isAuth && role) {
      setIsRedirecting(true);

      const timer = setTimeout(() => {
        if (role === Role.Admin) {
          router.push(`/${locale}/manage/dashboard`);
        } else if (role === Role.User) {
          router.push(`/${locale}/dashboard`);
        }
      }, 500); // Small delay for smooth UX

      return () => clearTimeout(timer);
    }
  }, [isAuth, role, router, locale]);

  // Show loading state while redirecting
  if (isRedirecting) {
    return <AuthLoading message="" />;
  }

  const navigation = [
    {
      id: 1,
      name: t("firstCard.name"),
      icon: "💬",
      desc: t("firstCard.description"),
    },
    {
      id: 2,
      name: t("secondCard.name"),
      icon: "🎥",
      desc: t("secondCard.description"),
    },
    {
      id: 3,
      name: t("thirdCard.name"),
      icon: "🎎",
      desc: t("thirdCard.description"),
    },
    {
      id: 4,
      name: t("fourthCard.name"),
      icon: "🔎",
      desc: t("fourthCard.description"),
    },
    {
      id: 5,
      name: t("fifthCard.name"),
      icon: "🌐",
      desc: t("fifthCard.description"),
    },
    {
      id: 6,
      name: t("sixthCard.name"),
      icon: "🏆",
      desc: t("sixthCard.description"),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      {/* HERO */}
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {t.rich("heroTitle", {
              highlight: (chunks) => (
                <span className="text-primary">{chunks}</span>
              ),
            })}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href={`/${locale}/register`}>{t("getStarted")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/${locale}/register`}>{t("Demo")}</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 pt-2 text-sm md:text-base">
            <div>
              <div className="font-semibold">{t("usersCount")}</div>
              <div className="text-muted-foreground">{t("users")}</div>
            </div>
            <div>
              <div className="font-semibold">{t("languageCount")}</div>
              <div className="text-muted-foreground">{t("language")}</div>
            </div>
            <div>
              <div className="font-semibold">{t("eventsCount")}</div>
              <div className="text-muted-foreground">{t("events")}</div>
            </div>
          </div>
        </div>

        {/* Hero image + bubble */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
            <Image
              src="/assets/home/home.png"
              alt="PolyGo live session"
              width={960}
              height={540}
              className="h-auto w-full object-cover aspect-video"
              priority
            />
          </div>
          <div
            aria-label={t("live")}
            className="absolute -bottom-4 left-6 md:-left-8 md:bottom-6 rounded-xl bg-background/90 backdrop-blur border shadow px-4 py-2 text-sm"
          >
            <span className="font-medium">{t("live")}</span>
            <span className="ml-2 text-muted-foreground">France → English</span>
          </div>
        </div>
      </section>

      {/* WHY POLYGO */}
      <section className="mt-16 md:mt-24 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">{t("whyTitle")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("whySubtitle")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navigation.map((f) => (
            <Card key={f.id} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span aria-hidden>{f.icon}</span>
                  {f.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {f.desc}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="mt-16 md:mt-24 rounded-2xl bg-primary text-primary-foreground px-6 py-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold">
            {t("bannerTitle")}
          </h3>
          <p className="opacity-90">{t("bannerSubtitle")}</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href={`/${locale}/register`}>{t("bannerButtonOne")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent text-primary-foreground border-primary-foreground/40"
            >
              <Link href={`/${locale}/login`}>{t("bannerButtonTwo")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
