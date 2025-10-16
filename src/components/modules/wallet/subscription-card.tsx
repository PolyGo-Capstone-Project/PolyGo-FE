"use client";

import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SubscriptionCardProps {
  plan?: "free" | "basic" | "premium";
  status?: "active" | "inactive";
  nextBilling?: string;
  autoRenew?: boolean;
}

export function SubscriptionCard({
  plan = "free",
  status = "active",
  nextBilling = "N/A",
  autoRenew = false,
}: SubscriptionCardProps) {
  const t = useTranslations("wallet.subscription");

  const planColors = {
    free: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    basic: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    premium:
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white dark:from-purple-600 dark:to-pink-600",
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Crown className="h-4 w-4 md:h-5 md:w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <div className="space-y-2.5 md:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground md:text-sm">
              {t("plan")}
            </span>
            <Badge className={planColors[plan]}>{t(plan)}</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground md:text-sm">
              {t("status")}
            </span>
            <Badge variant={status === "active" ? "default" : "secondary"}>
              {t(status)}
            </Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground md:text-sm">
              {t("nextBilling")}
            </span>
            <span className="text-xs font-medium md:text-sm">
              {nextBilling}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground md:text-sm">
              {t("autoRenew")}
            </span>
            <Badge variant={autoRenew ? "default" : "outline"}>
              {t(autoRenew ? "on" : "off")}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
