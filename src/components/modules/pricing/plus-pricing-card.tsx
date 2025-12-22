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
import { PlanTypeEnum, type PlanTypeEnumType } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import type { SubscriptionPlanItemType } from "@/models";

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

  const monthlyPlan = plans.find((p) => p.durationInDays === 30);
  const quarterlyPlan = plans.find((p) => p.durationInDays === 90);
  const yearlyPlan = plans.find((p) => p.durationInDays === 365);

  const [selectedDuration, setSelectedDuration] = useState<30 | 90 | 365>(
    yearlyPlan ? 365 : quarterlyPlan ? 90 : 30
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const selectedPlan = plans.find((p) => p.durationInDays === selectedDuration);

  if (!selectedPlan) return null;

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
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-primary/50 shadow-xl shadow-primary/20 ring-2 ring-primary/30 bg-gradient-to-br from-card to-card/95 flex flex-col h-full">
        <div className="absolute -right-10 top-6 rotate-45 bg-gradient-to-r from-primary via-primary to-primary/80 px-12 py-1.5 text-xs font-bold text-primary-foreground shadow-xl shadow-primary/50 z-10">
          {t("plus.popular")}
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative p-8 flex flex-col flex-grow">
          <div className="flex-grow">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-3xl font-bold">{t("plus.name")}</h3>
                <IconSparkles className="size-7 text-primary animate-pulse" />
              </div>
              <p className="text-base text-muted-foreground leading-relaxed">
                {t("plus.description")}
              </p>
            </div>

            <Tabs
              value={selectedDuration.toString()}
              onValueChange={(value) =>
                setSelectedDuration(Number(value) as 30 | 90 | 365)
              }
              className="mb-8"
            >
              <TabsList className="grid w-full grid-cols-3 gap-2 p-1.5 bg-muted/50 h-auto">
                {monthlyPlan && (
                  <TabsTrigger
                    value="30"
                    className="relative py-3 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                  >
                    <span className="font-semibold">
                      {getDurationLabel(30)}
                    </span>
                  </TabsTrigger>
                )}
                {quarterlyPlan && (
                  <TabsTrigger
                    value="90"
                    className="relative py-3 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                  >
                    <span className="font-semibold">
                      {getDurationLabel(90)}
                    </span>
                    {getSaveText(90) && (
                      <span className="absolute -top-2 -right-2 text-[10px] bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full font-bold shadow-lg">
                        -7%
                      </span>
                    )}
                  </TabsTrigger>
                )}
                {yearlyPlan && (
                  <TabsTrigger
                    value="365"
                    className="relative py-3 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                  >
                    <span className="font-semibold">
                      {getDurationLabel(365)}
                    </span>
                    {getSaveText(365) && (
                      <span className="absolute -top-2 -right-2 text-[10px] bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full font-bold shadow-lg animate-pulse">
                        -25%
                      </span>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>

            {getSaveText(selectedDuration) && (
              <Badge className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1.5 text-sm font-semibold shadow-lg shadow-green-500/30">
                {getSaveText(selectedDuration)}
              </Badge>
            )}

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {formatCurrency(selectedPlan.price, locale)}
                </span>
                <span className="text-base text-muted-foreground font-medium">
                  {getDurationText(selectedDuration)}
                </span>
              </div>
            </div>

            <ScrollArea className="h-[300px] pr-4 mb-8">
              <ul className="space-y-4">
                {selectedPlan.features.map((feature, index) => {
                  const featureText = getFeatureText(
                    feature,
                    t,
                    selectedPlan.planType
                  );
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
                : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02]"
            }`}
            variant={isCurrent ? "outline" : "default"}
            disabled={isCurrent}
            onClick={handleUpgrade}
          >
            {isCurrent ? t("free.cta") : t("plus.cta")}
          </Button>
        </div>
      </Card>

      <ConfirmPurchaseDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        plan={selectedPlan}
        userBalance={userBalance}
      />
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
    if (limitValue >= 0) {
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
