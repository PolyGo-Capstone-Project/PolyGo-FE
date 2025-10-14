"use client";

import type { TranslationValues } from "next-intl";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { SubscriptionListItemType } from "@/models";

const EMPTY_ICON = "—";

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type SubscriptionDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: SubscriptionListItemType | null;
  safeTranslate: SafeTranslate;
  lang: string;
};

export function SubscriptionDetailDialog({
  open,
  onOpenChange,
  subscription,
  safeTranslate,
  lang,
}: SubscriptionDetailDialogProps) {
  if (!subscription) return null;

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat(lang, {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return price.toLocaleString();
    }
  };

  const planTypeTranslated = safeTranslate(
    `planTypes.${subscription.planType}`,
    subscription.planType
  );

  const statusKey = subscription.isActive ? "active" : "inactive";
  const statusText = safeTranslate(`status.${statusKey}`, statusKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {safeTranslate("detailDialog.title", "Subscription details")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {subscription.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.planType", "Plan type")}
              </span>
              <Badge variant="outline" className="w-fit text-base py-1">
                {planTypeTranslated}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.status", "Status")}
              </span>
              <Badge
                variant={subscription.isActive ? "default" : "secondary"}
                className="w-fit text-base py-1"
              >
                {statusText}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.price", "Price")}
              </span>
              <span className="text-xl font-bold">
                {formatPrice(subscription.price)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  VND
                </span>
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.duration", "Duration")}
              </span>
              <span className="text-xl font-bold">
                {subscription.durationInDays}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {safeTranslate("detailDialog.days", "days")}
                </span>
              </span>
            </div>
          </div>

          {/* Description */}
          {subscription.description && (
            <div className="flex flex-col gap-2 p-4 border rounded-lg">
              <span className="text-sm font-semibold">
                {safeTranslate("detailDialog.description", "Description")}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {subscription.description}
              </p>
            </div>
          )}

          {/* Features Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {safeTranslate("detailDialog.features", "Features")}
              </h3>
              <Badge variant="outline" className="text-sm">
                {subscription.features?.length ?? 0}{" "}
                {subscription.features?.length === 1 ? "feature" : "features"}
              </Badge>
            </div>

            {subscription.features && subscription.features.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subscription.features.map((feature, index) => {
                  const featureTypeText = safeTranslate(
                    `featureTypes.${feature.featureType}`,
                    feature.featureType
                  );
                  const limitTypeText = safeTranslate(
                    `limitTypes.${feature.limitType}`,
                    feature.limitType
                  );

                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-3 p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-base">
                            {featureTypeText}
                          </span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono font-semibold text-primary">
                              {feature.limitValue}
                            </span>
                            <span>•</span>
                            <span>{limitTypeText}</span>
                          </div>
                        </div>
                        <Badge
                          variant={feature.isEnable ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {feature.isEnable
                            ? safeTranslate("status.active", "Active")
                            : safeTranslate("status.inactive", "Inactive")}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border border-dashed rounded-lg">
                <span className="text-sm text-muted-foreground">
                  {safeTranslate(
                    "detailDialog.noFeatures",
                    "No features configured"
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {safeTranslate("detailDialog.close", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
