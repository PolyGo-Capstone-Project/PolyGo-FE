"use client";

import { IconCheck, IconSparkles } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { Button, Card } from "@/components/ui";

export default function ThankYouPage() {
  const t = useTranslations("pricing.thankYou");
  const locale = useLocale();

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[70vh] px-4 py-8">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <div className="relative bg-primary/10 rounded-full p-4">
              <IconCheck className="size-16 text-primary" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            {t("title")}
            <IconSparkles className="size-6 text-primary" />
          </h1>
          <p className="text-lg font-medium text-primary">{t("message")}</p>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Link href={`/${locale}/wallet`} className="block">
            <Button className="w-full" size="lg">
              {t("backToWallet")}
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard`} className="block">
            <Button variant="outline" className="w-full" size="lg">
              {t("backHome")}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
