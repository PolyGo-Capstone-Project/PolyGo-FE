"use client";

import { Badge, Button, Card, ScrollArea } from "@/components/ui";
import { PlanTypeEnum, PlanTypeEnumType } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { SubscriptionPlanItemType } from "@/models";
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

  // Tính duration text
  const getDurationText = () => {
    const days = plan.durationInDays;
    if (days === 30) return t("plus.monthly.duration");
    if (days === 90) return t("plus.quarterly.duration");
    if (days === 365) return t("plus.yearly.duration");
    return t("free.duration");
  };

  // Tính save percentage - chỉ cho Plus plan
  const getSaveText = () => {
    if (!isPlusPlan) return ""; // Free plan không có save badge
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
        className={`relative overflow-hidden transition-all hover:shadow-lg ${
          isPlusPlan && plan.durationInDays === 365
            ? "border-primary ring-2 ring-primary ring-opacity-50"
            : ""
        }`}
      >
        {/* Popular Badge for Yearly Plus */}
        {isPlusPlan && plan.durationInDays === 365 && (
          <div className="absolute -right-10 top-6 rotate-45 bg-primary px-12 py-1 text-xs font-semibold text-primary-foreground">
            {t("plus.popular")}
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold">
                {isFreePlan ? t("free.name") : t("plus.name")}
              </h3>
              {isPlusPlan && <IconSparkles className="size-6 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">
              {plan.description ||
                (isFreePlan ? t("free.description") : t("plus.description"))}
            </p>
          </div>

          {/* Save Badge - chỉ hiển thị cho Plus plan */}
          {isPlusPlan && getSaveText() && (
            <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              {getSaveText()}
            </Badge>
          )}

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              {isFreePlan ? (
                <span className="text-4xl font-bold">{t("free.price")}</span>
              ) : (
                <>
                  <span className="text-4xl font-bold">
                    {formatCurrency(plan.price, locale)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getDurationText()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Features */}
          <ScrollArea className="h-[300px] pr-4">
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => {
                const featureText = getFeatureText(feature, t, plan.planType);
                // Only render if feature text is not empty
                if (!featureText) return null;

                return (
                  <li key={index} className="flex items-start gap-3">
                    <IconCheck className="size-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{featureText}</span>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>

          {/* CTA Button */}
          <Button
            className="w-full"
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

      {/* Confirm Purchase Dialog */}
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

// Helper function to get feature text
function getFeatureText(
  feature: SubscriptionPlanItemType["features"][0],
  t: any,
  planType: PlanTypeEnumType
): string {
  const { featureType, limitValue } = feature;

  const featureKey = featureType.toLowerCase();
  const planKey = planType === PlanTypeEnum.FREE ? "free" : "plus";

  // Define which features should show count
  const featuresWithCount = [
    "chat",
    "translation",
    "voicecall",
    "videocall",
    "eventparticipation",
    "eventcreation",
  ];

  // Define which features are boolean (no count)
  const booleanFeatures = [
    "advancedmatching",
    "premiumbadges",
    "analytics",
    "prioritysupport",
    "basicsupport",
  ];

  // Check if this feature should show count
  if (featuresWithCount.includes(featureKey)) {
    if (limitValue > 0) {
      return t(`${planKey}.features.${getFeatureTranslationKey(featureKey)}`, {
        count: limitValue,
      });
    }
    return ""; // Don't show features with 0 or negative limit
  }

  // Check if this is a boolean feature
  if (booleanFeatures.includes(featureKey)) {
    return t(`${planKey}.features.${getFeatureTranslationKey(featureKey)}`);
  }

  // Fallback to feature name from API
  return feature.featureName;
}

// Helper to map feature type to translation key
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
