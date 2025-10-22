"use client";

import { IconAlertCircle, IconLoader2 } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from "@/components/ui";
import { useSubscribeMutation } from "@/hooks";
import { formatCurrency, handleErrorApi, showSuccessToast } from "@/lib/utils";
import { SubscriptionPlanItemType } from "@/models";

type ConfirmPurchaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlanItemType;
  userBalance: number;
};

export function ConfirmPurchaseDialog({
  open,
  onOpenChange,
  plan,
  userBalance,
}: ConfirmPurchaseDialogProps) {
  const t = useTranslations("pricing.confirmPurchase");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();
  const router = useRouter();

  const subscribeMutation = useSubscribeMutation({ lang: locale });
  const [isProcessing, setIsProcessing] = useState(false);

  const afterPurchaseBalance = userBalance - plan.price;
  const isInsufficientBalance = afterPurchaseBalance < 0;

  // Tính duration text
  const getDurationText = () => {
    const days = plan.durationInDays;
    if (days === 30) return "1 month";
    if (days === 90) return "3 months";
    if (days === 365) return "1 year";
    return `${days} days`;
  };

  const handleConfirm = async () => {
    if (isInsufficientBalance) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await subscribeMutation.mutateAsync({
        subscriptionPlanId: plan.id,
        autoRenew: true,
      });

      showSuccessToast(result.payload?.message, tSuccess);
      onOpenChange(false);

      // Redirect to thank you page
      router.push(`/${locale}/pricing/thank-you`);
    } catch (error: any) {
      handleErrorApi({
        error,
        tError,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Confirm your subscription purchase
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Plan Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("plan")}</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("duration")}</span>
              <span className="font-medium">{getDurationText()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("price")}</span>
              <span className="font-semibold text-lg">
                {formatCurrency(plan.price, locale)}
              </span>
            </div>
          </div>

          {/* Balance Information */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("currentBalance")}
              </span>
              <span className="font-medium">
                {formatCurrency(userBalance, locale)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("afterPurchase")}
              </span>
              <span
                className={`font-semibold ${
                  isInsufficientBalance
                    ? "text-destructive"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {formatCurrency(afterPurchaseBalance, locale)}
              </span>
            </div>
          </div>

          {/* Warning for insufficient balance */}
          {isInsufficientBalance && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <IconAlertCircle className="size-5 flex-shrink-0 mt-0.5" />
              <span>{t("insufficientBalance")}</span>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            {t("cancel")}
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={isInsufficientBalance || isProcessing}
          >
            {isProcessing ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                {t("processing")}
              </>
            ) : (
              t("confirm")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
