"use client";

import { ArrowDownToLine, ArrowUpFromLine, Gift, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActionsCard() {
  const t = useTranslations("wallet.quickActions");
  const tToast = useTranslations("wallet.toast");

  const handleAction = (action: string) => {
    toast.info(tToast("comingSoon"));
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base md:text-lg">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 md:space-y-3">
        <div className="grid grid-cols-2 gap-2.5 mb-6 md:gap-3">
          <Button
            onClick={() => handleAction("deposit")}
            className="flex h-auto  gap-1.5 py-3 md:gap-2 md:py-4"
            variant="default"
          >
            <ArrowDownToLine className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs font-medium md:text-sm">
              {t("deposit")}
            </span>
          </Button>

          <Button
            onClick={() => handleAction("withdraw")}
            className="flex h-auto  gap-1.5 py-3 md:gap-2 md:py-4"
            variant="outline"
          >
            <ArrowUpFromLine className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs font-medium md:text-sm">
              {t("withdraw")}
            </span>
          </Button>
        </div>

        <Button
          onClick={() => handleAction("buyGift")}
          className="h-9 w-full gap-2 text-sm md:h-10"
          variant="secondary"
        >
          <Gift className="h-3.5 w-3.5 md:h-4 md:w-4" />
          {t("buyGift")}
        </Button>

        <Button
          onClick={() => handleAction("upgradeSubscription")}
          className="h-9 w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-sm hover:from-purple-600 hover:to-pink-600 md:h-10"
        >
          <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
          {t("upgradeSubscription")}
        </Button>
      </CardContent>
    </Card>
  );
}
