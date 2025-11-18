"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components";
import { PlanTypeEnum } from "@/constants";
import { useCurrentSubscriptionQuery } from "@/hooks";
import { ArrowDownToLine, ArrowUpFromLine, Gift, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DepositDialog } from "./deposit-dialog";

export function QuickActionsCard() {
  const t = useTranslations("wallet.quickActions");
  const locale = useLocale();
  const router = useRouter();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

  // Fetch current subscription to check plan type
  const { data: currentSubscriptionData } = useCurrentSubscriptionQuery({
    params: { lang: locale },
  });

  const subscription = currentSubscriptionData?.payload?.data;
  const isFreeplan = subscription?.planType === PlanTypeEnum.FREE;

  const handleUpgradeSubscription = () => {
    router.push(`/${locale}/pricing`);
  };

  const handleBuyGift = () => {
    router.push(`/${locale}/gifts`);
  };

  const handleDeposit = () => {
    setDepositDialogOpen(true);
  };

  const handleWithdraw = () => {
    router.push(`/${locale}/wallet/withdraw`);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 md:space-y-3">
          <div className="grid grid-cols-2 gap-2.5 mb-6 md:gap-3">
            <Button
              onClick={handleDeposit}
              className="flex h-auto  gap-1.5 py-3 md:gap-2 md:py-4"
              variant="default"
            >
              <ArrowDownToLine className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs font-medium md:text-sm">
                {t("deposit")}
              </span>
            </Button>

            <Button
              onClick={handleWithdraw}
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
            onClick={handleBuyGift}
            className="h-9 w-full gap-2 text-sm md:h-10"
            variant="secondary"
          >
            <Gift className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {t("buyGift")}
          </Button>

          {/* Only show Upgrade button for Free plan users */}
          {isFreeplan && (
            <Button
              onClick={handleUpgradeSubscription}
              className="h-9 w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-sm hover:from-purple-600 hover:to-pink-600 md:h-10"
            >
              <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {t("upgradeSubscription")}
            </Button>
          )}
        </CardContent>
      </Card>

      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
      />
    </>
  );
}
