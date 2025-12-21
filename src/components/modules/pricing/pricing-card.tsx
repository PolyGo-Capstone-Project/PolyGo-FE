"use client";

import { Badge, Button, Card, ScrollArea } from "@/components/ui";
import { PlanTypeEnum, type PlanTypeEnumType } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import type { SubscriptionPlanItemType } from "@/models";
import { IconCheck, IconSparkles } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { ConfirmPurchaseDialog } from "./confirm-purchase-dialog";

type PricingCardProps = {
  plan: SubscriptionPlanItemType;
  isCurrent?: boolean;
  userBalance: number;
};

export function PricingCard({
  plan,
  isCurrent,
  userBalance,
}: PricingCardProps) {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isFreePlan = plan.planType === PlanTypeEnum.FREE;
  const isPlusPlan = plan.planType === PlanTypeEnum.PLUS;

  const getDurationText = () => {
    const days = plan.durationInDays;
    if (days === 30) return t("plus.monthly.duration");
    if (days === 90) return t("plus.quarterly.duration");
    if (days === 365) return t("plus.yearly.duration");
    return t("free.duration");
  };

  const getSaveText = () => {
    if (!isPlusPlan) return "";
    const days = plan.durationInDays;
    if (days === 90) return t("plus.quarterly.save");
    if (days === 365) return t("plus.yearly.save");
    return "";
  };

  const handleUpgrade = () => {
    if (!isCurrent && !isFreePlan) {
      setShowConfirmDialog(true);
    }
  };

  return (
    <>
      <Card
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col h-full ${
          isPlusPlan && plan.durationInDays === 365
            ? "border-primary/50 shadow-xl shadow-primary/20 ring-2 ring-primary/30"
            : "border-border/50 hover:border-primary/30"
        }`}
      >
        {isPlusPlan && plan.durationInDays === 365 && (
          <div className="absolute -right-10 top-6 rotate-45 bg-gradient-to-r from-primary to-primary/80 px-12 py-1.5 text-xs font-bold text-primary-foreground shadow-lg z-10">
            {t("plus.popular")}
          </div>
        )}

        <div className="p-8 flex flex-col flex-grow">
          <div className="flex-grow">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-3xl font-bold">
                  {isFreePlan ? t("free.name") : t("plus.name")}
                </h3>
                {isPlusPlan && (
                  <IconSparkles className="size-7 text-primary animate-pulse" />
                )}
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                {plan.description ||
                  (isFreePlan ? t("free.description") : t("plus.description"))}
              </p>
            </div>

            {isPlusPlan && getSaveText() && (
              <Badge className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1.5 text-sm font-semibold shadow-lg shadow-green-500/30">
                {getSaveText()}
              </Badge>
            )}

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                {isFreePlan ? (
                  <span className="text-5xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                    {t("free.price")}
                  </span>
                ) : (
                  <>
                    <span className="text-5xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                      {formatCurrency(plan.price, locale)}
                    </span>
                    <span className="text-base text-muted-foreground font-medium">
                      {getDurationText()}
                    </span>
                  </>
                )}
              </div>
            </div>

            <ScrollArea className="h-[300px] pr-4 mb-8">
              <ul className="space-y-4">
                {plan.features.map((feature, index) => {
                  const featureText = getFeatureText(feature, t, plan.planType);
                  if (!featureText) return null;

                  return (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className="mt-0.5 rounded-full bg-primary/10 p-1 group-hover:bg-primary/20 transition-colors">
                        <IconCheck className="size-4 text-primary flex-shrink-0" />
                      </div>
                      <span className="text-sm leading-relaxed">
                        {featureText}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </div>

          <Button
            className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
              isCurrent
                ? ""
                : isPlusPlan
                  ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02]"
                  : ""
            }`}
            variant={
              isCurrent ? "outline" : isPlusPlan ? "default" : "secondary"
            }
            disabled={isCurrent || (isFreePlan && !isCurrent)}
            onClick={handleUpgrade}
          >
            {isCurrent
              ? t("free.cta")
              : isFreePlan
                ? t("free.cta")
                : t("plus.cta")}
          </Button>
        </div>
      </Card>

      {!isFreePlan && (
        <ConfirmPurchaseDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          plan={plan}
          userBalance={userBalance}
        />
      )}
    </>
  );
}

function getFeatureText(
  feature: SubscriptionPlanItemType["features"][0],
  t: any,
  planType: PlanTypeEnumType
): string {
  const { featureType, limitValue } = feature;
  const featureKey = featureType.toLowerCase();
  const planKey = planType === PlanTypeEnum.FREE ? "free" : "plus";
  const featuresWithCount = [
    "chat",
    "translation",
    "voicecall",
    "videocall",
    "eventparticipation",
    "eventcreation",
  ];
  const booleanFeatures = [
    "advancedmatching",
    "premiumbadges",
    "analytics",
    "prioritysupport",
    "basicsupport",
  ];

  if (featuresWithCount.includes(featureKey)) {
    if (limitValue > 0) {
      return t(`${planKey}.features.${getFeatureTranslationKey(featureKey)}`, {
        count: limitValue,
      });
    }
    return "";
  }
  if (booleanFeatures.includes(featureKey)) {
    return t(`${planKey}.features.${getFeatureTranslationKey(featureKey)}`);
  }
  return feature.featureName;
}

function getFeatureTranslationKey(featureKey: string): string {
  const keyMap: Record<string, string> = {
    chat: "chat",
    translation: "translation",
    voicecall: "voiceCall",
    videocall: "videoCall",
    eventparticipation: "eventParticipation",
    eventcreation: "eventCreation",
    advancedmatching: "advancedMatching",
    premiumbadges: "premiumBadges",
    analytics: "analytics",
    prioritysupport: "prioritySupport",
    basicsupport: "basicSupport",
  };
  return keyMap[featureKey] || featureKey;
}
