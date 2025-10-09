// app/about/page.tsx
"use client";

import { useMessages, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  const t = useTranslations("about");
  const allMessages = useMessages();
  const aboutMessages = allMessages.about as any;

  useEffect(() => {
    if (typeof document !== "undefined") {
      const title = t("meta.title") || "About";
      document.title = title;
    }
  }, [t]);

  // Lấy chuỗi JSON thô từ messages object
  const statsString = aboutMessages.statsData;
  const valuesString = aboutMessages.valuesData;
  const teamString = aboutMessages.teamData;
  const ctaString = aboutMessages.ctaData;
  const timelineItemsString = aboutMessages.timelineItemsData;
  const faqItemsString = aboutMessages.faqItemsData;

  // Phân tích chuỗi JSON thành Object/Array
  const stats = JSON.parse(statsString || "[]");
  const values = JSON.parse(valuesString || "[]");

  const teamData = JSON.parse(teamString || "{}");
  const ctaData = JSON.parse(ctaString || "{}");

  const timelineTitle = t("timelineTitle");
  const timeline = JSON.parse(timelineItemsString || "[]");

  const faqTitle = t("faqTitle");
  const faq = JSON.parse(faqItemsString || "[]");

  const team = teamData || { members: [] };
  const cta = ctaData || {};

  return (
    <div className="min-h-screen w-full">
      <section className="container mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-3 text-xs sm:text-sm" variant="secondary">
              {t("hero.kicker")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {t("hero.title")}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s: any, idx: number) => (
            <Card key={idx} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">
                  {s.value}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                {s.note}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="container mx-auto px-4 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            {t("mission.title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("mission.desc")}</p>
          <Button className="mt-4" size="sm">
            {t("mission.cta")}
          </Button>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {values.map((v: any, idx: number) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">{v.title}</CardTitle>
                <CardDescription>{v.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="container mx-auto px-4 py-10 sm:py-14">
        <h2 className="text-2xl sm:text-3xl font-semibold">{timelineTitle}</h2>
        <div className="mt-6 space-y-4">
          {timeline.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="w-28 shrink-0 text-sm font-medium text-muted-foreground">
                {item.when}
              </div>
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg">
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.subtitle}</CardDescription>
                </CardHeader>
                {item.note && (
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    {item.note}
                  </CardContent>
                )}
              </Card>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="container mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-semibold">{team.title}</h2>
          <Badge variant="outline">{team.badge}</Badge>
        </div>
        <p className="mt-2 text-muted-foreground max-w-2xl">{team.desc}</p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {team.members.map((m: any, idx: number) => (
            <Card key={idx}>
              <CardContent className="pt-6 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={m.image || ""} alt={m.name} />
                  <AvatarFallback>{m.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium leading-tight">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="container mx-auto px-4 py-10 sm:py-14">
        <h2 className="text-2xl sm:text-3xl font-semibold">{faqTitle}</h2>
        <Accordion type="single" collapsible className="mt-4">
          {faq.map((f: any, idx: number) => (
            <AccordionItem key={idx} value={`q${idx}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Contact Section */}
      <Separator />

      <section className="container mx-auto px-4 py-10 sm:py-14">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          {t("contact.title")}
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          {t("contact.desc")}{" "}
          <Link
            href="mailto:polygocorp@gmail.com"
            className="text-blue-600 hover:underline"
          >
            polygocorp@gmail.com
          </Link>
        </p>
      </section>

      <Separator />

      <section className="container mx-auto px-4 py-10 sm:py-14">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">{cta.title}</CardTitle>
            <CardDescription>{cta.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button asChild>
              <Link href="/signup">{cta.primary}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/events">{cta.secondary}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
