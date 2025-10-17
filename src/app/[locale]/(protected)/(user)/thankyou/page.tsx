// src/app/thank-you/page.tsx
"use client";

import { Button } from "@/components";
import { CheckCircle2, Home, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

export default function ThankYouPage() {
  const t = useTranslations("pricing.thankyou");
  const locale = useLocale();
  const search = useSearchParams();
  const planId = search.get("planId");
  const router = useRouter();

  return (
    <main className="min-h-[calc(100vh-80px)] w-full bg-gradient-to-b from-background to-muted/30">
      <section className="mx-auto max-w-3xl px-4 py-16 sm:py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {t("badge", { defaultValue: "Thank you!" })}
        </div>

        {/* Title */}
        <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          {t("title", { defaultValue: "Your purchase is confirmed 🎉" })}
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t("subtitle", {
            defaultValue:
              "Thanks for upgrading! Your benefits are now active. You’ll receive an email receipt shortly.",
          })}
        </p>

        {/* Card */}
        <div className="mx-auto mt-8 w-full max-w-xl rounded-2xl border bg-background shadow-sm p-6 sm:p-8">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <h2 className="mt-3 text-xl font-semibold">
              {t("cardTitle", { defaultValue: "Payment Successful" })}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("cardDesc", {
                defaultValue:
                  "Your subscription is now active. Enjoy the premium experience!",
              })}
            </p>

            {/* Optional: show planId if present */}
            {planId ? (
              <div className="mt-4 text-xs text-muted-foreground">
                {t("orderId", { defaultValue: "Order / Plan ID" })}:{" "}
                <span className="font-mono">{planId}</span>
              </div>
            ) : null}

            {/* CTA */}
            <div className="mt-6">
              <Button
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                <Home className="h-4 w-4" />
                {t("goHome", { defaultValue: "Back to Home" })}
              </Button>
            </div>
          </div>
        </div>

        {/* Helper text */}
        <p className="mt-6 text-xs sm:text-sm text-muted-foreground">
          {t("help", {
            defaultValue: "Need support? Reach us anytime via the Help Center.",
          })}
        </p>
      </section>
    </main>
  );
}
