"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-balance">
          {t("title")}
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground mb-6">
          {t("subtitle")}
        </p>
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("hero.description")}
          </p>
        </div>
      </div>

      {/* Hero Image Placeholder */}
      <div className="mb-16">
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden border-2 shadow-lg">
          <Image
            src="https://www.thechairmansbao.com/wp-content/uploads/2019/12/41640701601_573d849991_b.jpg"
            alt="PolyGo Platform"
            fill
            style={{ objectFit: "cover" }}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Problem Statement */}
      <section className="mb-16">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              {t("problem.title")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("problem.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-destructive text-xl mt-0.5">❌</span>
                <span className="text-foreground">
                  {t("problem.points.p1")}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive text-xl mt-0.5">❌</span>
                <span className="text-foreground">
                  {t("problem.points.p2")}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive text-xl mt-0.5">❌</span>
                <span className="text-foreground">
                  {t("problem.points.p3")}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Solution */}
      <section className="mb-16">
        <Card className="border-2 shadow-lg bg-primary/5">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              {t("solution.title")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("solution.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[250px] sm:h-[300px] rounded-lg overflow-hidden border">
              <Image
                src="https://dss-www-production.s3.amazonaws.com/uploads/2023/06/hero-1-scaled-1.jpg"
                alt="PolyGo Solution"
                fill
                style={{ objectFit: "cover" }}
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Core Features */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          {t("features.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Matching */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 text-4xl">🎯</div>
              <h3 className="text-xl font-semibold mb-2">
                {t("features.matching.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("features.matching.description")}
              </p>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 text-4xl">💬</div>
              <h3 className="text-xl font-semibold mb-2">
                {t("features.chat.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("features.chat.description")}
              </p>
            </CardContent>
          </Card>

          {/* AI */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 text-4xl">🤖</div>
              <h3 className="text-xl font-semibold mb-2">
                {t("features.ai.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("features.ai.description")}
              </p>
            </CardContent>
          </Card>

          {/* Events */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 text-4xl">🌍</div>
              <h3 className="text-xl font-semibold mb-2">
                {t("features.events.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("features.events.description")}
              </p>
            </CardContent>
          </Card>

          {/* Gamification */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 text-4xl">🏆</div>
              <h3 className="text-xl font-semibold mb-2">
                {t("features.gamification.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("features.gamification.description")}
              </p>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 text-4xl">💎</div>
              <h3 className="text-xl font-semibold mb-2">
                {t("features.subscription.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("features.subscription.description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* USPs */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          {t("usps.title")}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-2 shadow-lg bg-accent/50">
            <CardHeader>
              <div className="mb-2 text-3xl">✨</div>
              <CardTitle className="text-xl">{t("usps.usp1.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("usps.usp1.description")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg bg-accent/50">
            <CardHeader>
              <div className="mb-2 text-3xl">🎭</div>
              <CardTitle className="text-xl">{t("usps.usp2.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("usps.usp2.description")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg bg-accent/50">
            <CardHeader>
              <div className="mb-2 text-3xl">🤝</div>
              <CardTitle className="text-xl">{t("usps.usp3.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("usps.usp3.description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          {t("stats.title")}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-extrabold text-primary mb-2">
                {t("stats.users")}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("stats.usersLabel")}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-extrabold text-primary mb-2">
                {t("stats.languages")}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("stats.languagesLabel")}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-extrabold text-primary mb-2">
                {t("stats.events")}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("stats.eventsLabel")}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-extrabold text-primary mb-2">
                {t("stats.satisfaction")}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("stats.satisfactionLabel")}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Competitors Comparison */}
      <section className="mb-16">
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              {t("competitors.title")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("competitors.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
              <div className="font-semibold text-primary mb-2">
                🚀 {t("usps.title")}
              </div>
              <p className="text-sm text-foreground">
                {t("competitors.ourEdge")}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="mb-16">
        <Card className="border-2 shadow-lg bg-primary text-primary-foreground">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-lg mb-8 opacity-90">{t("cta.description")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 h-12"
              >
                {t("cta.button")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-12 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                {t("cta.learnMore")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Email Section - NEW */}
      <section className="mb-8">
        <div className="text-center p-6 border-2 rounded-lg bg-muted/50">
          <p className="text-lg font-semibold mb-2">{t("contact.title")}</p>
          <p className="text-muted-foreground mb-4">
            {t("contact.description")}
          </p>
          <Link
            href="mailto:polygocorp@gmail.com"
            className="text-primary hover:underline font-medium text-xl flex items-center justify-center gap-2"
          >
            📧 polygocorp@gmail.com
          </Link>
        </div>
      </section>
    </main>
  );
}
