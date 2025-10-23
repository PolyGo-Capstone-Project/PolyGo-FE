"use client";

import { IconCheck, IconSparkles } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { PlanTypeEnum, PlanTypeEnumType } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { SubscriptionPlanItemType } from "@/models";

import { ConfirmPurchaseDialog } from "./confirm-purchase-dialog";

type PlusPricingCardProps = {
  plans: SubscriptionPlanItemType[];
  isCurrent?: boolean;
  userBalance: number;
};

export function PlusPricingCard({
  plans,
  isCurrent,
  userBalance,
}: PlusPricingCardProps) {
  const t = useTranslations("pricing");
  const locale = useLocale();

  // Find plans by duration
  const monthlyPlan = plans.find((p) => p.durationInDays === 30);
  const quarterlyPlan = plans.find((p) => p.durationInDays === 90);
  const yearlyPlan = plans.find((p) => p.durationInDays === 365);

  // Set default to yearly (best value)
  const [selectedDuration, setSelectedDuration] = useState<30 | 90 | 365>(
    yearlyPlan ? 365 : quarterlyPlan ? 90 : 30
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Get currently selected plan
  const selectedPlan = plans.find((p) => p.durationInDays === selectedDuration);

  if (!selectedPlan) return null;

  // Helper functions
  const getDurationText = (days: number) => {
    if (days === 30) return t("plus.monthly.duration");
    if (days === 90) return t("plus.quarterly.duration");
    if (days === 365) return t("plus.yearly.duration");
    return "";
  };

  const getSaveText = (days: number) => {
    if (days === 90) return t("plus.quarterly.save");
    if (days === 365) return t("plus.yearly.save");
    return "";
  };

  const getDurationLabel = (days: number) => {
    if (days === 30) return t("plus.monthly.name");
    if (days === 90) return t("plus.quarterly.name");
    if (days === 365) return t("plus.yearly.name");
    return "";
  };

  const handleUpgrade = () => {
    if (!isCurrent) {
      setShowConfirmDialog(true);
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden transition-all hover:shadow-lg border-primary ring-2 ring-primary ring-opacity-50">
        {/* Popular Badge */}
        <div className="absolute -right-10 top-6 rotate-45 bg-primary px-12 py-1 text-xs font-semibold text-primary-foreground">
          {t("plus.popular")}
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold">{t("plus.name")}</h3>
              <IconSparkles className="size-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("plus.description")}
            </p>
          </div>

          {/* Duration Tabs */}
          <Tabs
            value={selectedDuration.toString()}
            onValueChange={(value) =>
              setSelectedDuration(Number(value) as 30 | 90 | 365)
            }
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-3 gap-2 p-1">
              {monthlyPlan && (
                <TabsTrigger value="30" className="relative">
                  {getDurationLabel(30)}
                </TabsTrigger>
              )}
              {quarterlyPlan && (
                <TabsTrigger value="90" className="relative">
                  {getDurationLabel(90)}
                  {getSaveText(90) && (
                    <span className="absolute -top-2 -right-2 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                      -7%
                    </span>
                  )}
                </TabsTrigger>
              )}
              {yearlyPlan && (
                <TabsTrigger value="365" className="relative">
                  {getDurationLabel(365)}
                  {getSaveText(365) && (
                    <span className="absolute -top-2 -right-2 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                      -25%
                    </span>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {/* Save Badge */}
          {getSaveText(selectedDuration) && (
            <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              {getSaveText(selectedDuration)}
            </Badge>
          )}

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {formatCurrency(selectedPlan.price, locale)}
              </span>
              <span className="text-sm text-muted-foreground">
                {getDurationText(selectedDuration)}
              </span>
            </div>
          </div>

          {/* Features */}
          <ScrollArea className="h-[300px] pr-4">
            <ul className="space-y-3 mb-6">
              {selectedPlan.features.map((feature, index) => {
                const featureText = getFeatureText(
                  feature,
                  t,
                  selectedPlan.planType
                );
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
            variant={isCurrent ? "outline" : "default"}
            disabled={isCurrent}
            onClick={handleUpgrade}
          >
            {isCurrent ? t("free.cta") : t("plus.cta")}
          </Button>
        </div>
      </Card>

      {/* Confirm Purchase Dialog */}
      <ConfirmPurchaseDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        plan={selectedPlan}
        userBalance={userBalance}
      />
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
