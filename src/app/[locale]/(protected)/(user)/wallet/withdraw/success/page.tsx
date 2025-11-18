"use client";

import { CheckCircle2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WithdrawSuccessPage() {
  const t = useTranslations("wallet.withdraw.success");
  const locale = useLocale();

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center p-3 md:p-6">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">{t("description")}</p>

          <div className="rounded-lg bg-muted p-4 text-left">
            <h4 className="mb-2 font-semibold">{t("whatNext.title")}</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• {t("whatNext.processing")}</li>
              <li>• {t("whatNext.notification")}</li>
              <li>• {t("whatNext.checkHistory")}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/${locale}/wallet`}>{t("backToWallet")}</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href={`/${locale}/wallet`}>{t("viewHistory")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
