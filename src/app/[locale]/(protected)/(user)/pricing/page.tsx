"use client";

import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo } from "react";

import { PricingCard } from "@/components/modules/pricing";
import { Button } from "@/components/ui";
import { PlanTypeEnum } from "@/constants";
import {
  useAuthMe,
  useCurrentSubscriptionQuery,
  useSubscriptionPlansQuery,
} from "@/hooks";

export default function PricingPage() {
  const t = useTranslations("pricing");
  const locale = useLocale();

  // Fetch data
  const { data: userData, isLoading: isLoadingUser } = useAuthMe();
  const { data: plansData, isLoading: isLoadingPlans } =
    useSubscriptionPlansQuery({
      params: { lang: locale },
    });
  const { data: currentSubscription } = useCurrentSubscriptionQuery({
    params: { lang: locale },
  });

  const userBalance = userData?.payload.data.balance ?? 0;
  const currentPlanType = currentSubscription?.payload.data.planType;

  // Group plans by type
  const { freePlan, plusPlans } = useMemo(() => {
    const plans = plansData?.payload.data.items ?? [];

    const free = plans.find((p) => p.planType === PlanTypeEnum.FREE);
    const plus = plans
      .filter((p) => p.planType === PlanTypeEnum.PLUS)
      .sort((a, b) => a.durationInDays - b.durationInDays); // Sort by duration: monthly, quarterly, yearly

    return { freePlan: free, plusPlans: plus };
  }, [plansData]);

  if (isLoadingUser || isLoadingPlans) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <IconLoader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:py-12 md:px-6">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <Link href={`/${locale}/wallet`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <IconArrowLeft className="size-4" />
            {t("backToWallet")}
          </Button>
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
        {/* Free Plan */}
        {freePlan && (
          <PricingCard
            plan={freePlan}
            isCurrent={currentPlanType === PlanTypeEnum.FREE}
            userBalance={userBalance}
          />
        )}

        {/* Plus Plans - Show as one card with variants */}
        {plusPlans.length > 0 && (
          <div className="space-y-4">
            {plusPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isCurrent={currentPlanType === PlanTypeEnum.PLUS}
                userBalance={userBalance}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
