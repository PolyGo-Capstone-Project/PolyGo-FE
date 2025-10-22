"use client";

import {
  IconCalendar,
  IconCrown,
  IconLoader2,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { AutoRenewDialog, CancelSubscriptionDialog } from "@/components";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  ScrollArea,
  Separator,
  Switch,
} from "@/components/ui";
import { PlanTypeEnum } from "@/constants";
import {
  useCurrentSubscriptionQuery,
  useSubscriptionUsageQuery,
} from "@/hooks";

export function SubscriptionCard() {
  const t = useTranslations("wallet.subscription");
  const locale = useLocale();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAutoRenewDialog, setShowAutoRenewDialog] = useState(false);

  // Fetch data
  const { data: currentSubscriptionData, isLoading } =
    useCurrentSubscriptionQuery({
      params: { lang: locale },
    });

  const { data: usageData, isLoading: isLoadingUsage } =
    useSubscriptionUsageQuery({
      params: { lang: locale },
    });

  if (isLoading || isLoadingUsage) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconCrown className="size-5" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const subscription = currentSubscriptionData?.payload?.data;
  const usage = usageData?.payload?.data?.items ?? [];

  const planColors = {
    [PlanTypeEnum.FREE]:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    [PlanTypeEnum.PLUS]:
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    [PlanTypeEnum.PREMIUM]:
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  };

  const isFreeplan = subscription?.planType === PlanTypeEnum.FREE;
  const statusVariant = subscription?.active ? "default" : "secondary";

  const handleAutoRenewToggle = () => {
    setShowAutoRenewDialog(true);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconCrown className="size-5" />
              {t("title")}
            </CardTitle>
            {!isFreeplan && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => setShowCancelDialog(true)}
              >
                <IconX className="size-4" />
                <span className="hidden sm:inline">
                  {t("cancelSubscription")}
                </span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Plan Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("plan")}</span>
              <Badge
                className={
                  planColors[subscription?.planType ?? PlanTypeEnum.FREE]
                }
              >
                {t(
                  subscription?.planType?.toLowerCase() ??
                    PlanTypeEnum.FREE.toLowerCase()
                )}
              </Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("status")}
              </span>
              <Badge variant={statusVariant}>
                {t(subscription?.active ? "active" : "inactive")}
              </Badge>
            </div>

            <Separator />

            {subscription?.endAt && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <IconCalendar className="size-4" />
                    {t("nextBilling")}
                  </span>
                  <span className="text-sm font-medium">
                    {format(new Date(subscription.endAt), "MMM dd, yyyy")}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("daysRemaining", {
                      days: subscription.daysRemaining ?? 0,
                    })}
                  </span>
                </div>

                <Separator />
              </>
            )}

            {!isFreeplan && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("autoRenew")}
                </span>
                <Switch
                  checked={subscription?.autoRenew ?? false}
                  onCheckedChange={handleAutoRenewToggle}
                />
              </div>
            )}
          </div>

          {/* Usage Section */}
          {usage.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{t("features")}</h4>
                  <IconSettings className="size-4 text-muted-foreground" />
                </div>

                <ScrollArea className="h-[250px] pr-3">
                  <div className="space-y-4">
                    {usage.map((feature, index) => {
                      // For unlimited features, show full progress
                      const percentage = feature.isUnlimited
                        ? 0
                        : feature.limitValue > 0
                          ? (feature.usageCount / feature.limitValue) * 100
                          : 0;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">
                              {feature.featureName}
                            </span>
                            <span className="text-muted-foreground">
                              {feature.isUnlimited
                                ? "Unlimited"
                                : `${feature.usageCount}/${feature.limitValue}`}
                            </span>
                          </div>
                          <Progress
                            value={feature.isUnlimited ? 100 : percentage}
                            className="h-2"
                            indicatorClassName={
                              feature.isUnlimited
                                ? "bg-green-500"
                                : percentage > 80
                                  ? "bg-destructive"
                                  : percentage > 50
                                    ? "bg-yellow-500"
                                    : "bg-primary"
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {/* Upgrade Button for Free Plan */}
          {isFreeplan && (
            <Link href={`/${locale}/pricing`} className="block">
              <Button className="w-full" variant="default">
                {t("upgradeNow")}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CancelSubscriptionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
      />
      <AutoRenewDialog
        open={showAutoRenewDialog}
        onOpenChange={setShowAutoRenewDialog}
        currentAutoRenew={subscription?.autoRenew ?? false}
      />
    </>
  );
}
