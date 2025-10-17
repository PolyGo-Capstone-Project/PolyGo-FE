"use client";

import { Crown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  useCancelSubscriptionMutation,
  useToggleAutoRenewMutation,
} from "@/hooks/query/use-subscriptionPlan";

// NEW: types (tuỳ dự án, có thể import từ models)
type FeatureUsage = {
  featureType: string;
  featureName: string;
  usageCount: number;
  limitValue: number;
  limitType?: string | null;
  isUnlimited: boolean;
  lastUsedAt?: string | null;
  resetAt?: string | null;
  canUse: boolean;
};

type CurrentSub = {
  id: string;
  planType: string;
  planName: string;
  startAt: string;
  endAt: string;
  active: boolean;
  autoRenew: boolean;
  daysRemaining: number;
};

interface SubscriptionCardProps {
  // legacy props
  plan?: "free" | "basic" | "premium";
  status?: "active" | "inactive";
  nextBilling?: string;
  autoRenew?: boolean;

  // NEW
  current?: CurrentSub | null;
  usage?: FeatureUsage[];
  loadingCurrent?: boolean;
  loadingUsage?: boolean;
}

export function SubscriptionCard({
  plan = "free",
  status = "active",
  nextBilling = "N/A",
  autoRenew = false,

  current = null,
  usage = [],
  loadingCurrent = false,
  loadingUsage = false,
}: SubscriptionCardProps) {
  const t = useTranslations("wallet.subscription");
  const locale = useLocale();

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const toggleAutoRenew = useToggleAutoRenewMutation();
  const cancelSubscription = useCancelSubscriptionMutation();

  const planColors = {
    free: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    basic: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    premium:
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white dark:from-purple-600 dark:to-pink-600",
  } as const;

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(locale ?? "en");
    } catch {
      return String(iso);
    }
  };

  const translateFeatureKey = (name: string) => {
    const key = `features.${name}`;
    const res = t(key as any, { defaultValue: key });
    return res && res !== key ? res : name;
  };

  // 👈 Hàm xử lý hủy gói
  const handleCancelSubscription = () => {
    // Lý do mặc định nếu người dùng không nhập
    const reason =
      cancelReason.trim() ||
      t("cancelDefaultReason", {
        defaultValue: "Người dùng yêu cầu hủy gói (Không có lý do chi tiết)",
      });

    // Gọi mutation
    cancelSubscription.mutate(reason, {
      onSuccess: () => {
        setIsCancelDialogOpen(false);
        setCancelReason("");
      },
      // Có thể thêm onError, onSettled nếu cần
    });
  };

  const renderLegacy = () => (
    <div className="space-y-3 md:space-y-4">
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
          <span className="text-xs font-medium md:text-sm">{nextBilling}</span>
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
    </div>
  );

  const renderCurrent = () => (
    <div className="space-y-4">
      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {t("planName", { defaultValue: "Tên gói" })}
          </span>
          <span className="text-sm sm:text-base font-semibold truncate max-w-[60%] text-right">
            {current?.planName ?? "—"}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {t("daysRemaining", { defaultValue: "Số ngày còn lại" })}
          </span>
          <span className="text-sm sm:text-base font-semibold tabular-nums">
            {current?.daysRemaining ?? 0}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 sm:col-span-2">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {t("period", { defaultValue: "Thời hạn" })}
          </span>
          <span className="text-xs sm:text-sm font-medium text-right">
            {formatDate(current?.endAt)}
          </span>
        </div>
      </div>

      {/* Auto renew */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-secondary/10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {t("autoRenew", { defaultValue: "Tự động gia hạn" })}:
          </span>
          <Badge
            variant={current?.autoRenew ? "default" : "secondary"}
            className="text-xs font-semibold"
          >
            {current?.autoRenew
              ? t("on", { defaultValue: "Bật" })
              : t("off", { defaultValue: "Tắt" })}
          </Badge>
        </div>

        <Button
          size="sm"
          variant={current?.autoRenew ? "secondary" : "default"}
          className="h-8 w-full sm:w-auto text-xs"
          disabled={toggleAutoRenew.isPending}
          onClick={() => toggleAutoRenew.mutate(!current?.autoRenew)}
        >
          {toggleAutoRenew.isPending
            ? t("loading", { defaultValue: "Đang xử lý..." })
            : current?.autoRenew
              ? t("turnOff", { defaultValue: "Tắt gia hạn" })
              : t("turnOn", { defaultValue: "Bật gia hạn" })}
        </Button>
      </div>

      {/* Features */}
      <div>
        <div className="mb-2 font-medium">
          {t("featuresTitle", { defaultValue: "Chức năng của gói" })}
        </div>

        {loadingUsage ? (
          <div className="py-2 text-sm text-muted-foreground">
            {t("featuresLoading", { defaultValue: "Đang tải chức năng..." })}
          </div>
        ) : !usage || usage.length === 0 ? (
          <div className="py-2 text-sm text-muted-foreground">
            {t("noFeatures", { defaultValue: "Chưa có chức năng nào." })}
          </div>
        ) : (
          <ul className="space-y-3">
            {usage.map((f, idx) => {
              const limitLabel = f.isUnlimited
                ? t("unlimited", { defaultValue: "Không giới hạn" })
                : `${f.usageCount}/${f.limitValue}${
                    f.limitType ? ` (${f.limitType})` : ""
                  }`;
              return (
                <li
                  key={`${f.featureType}-${idx}`}
                  className="rounded-xl border bg-background px-3 sm:px-4 py-3 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">
                          {translateFeatureKey(f.featureName)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t("resetAt", { defaultValue: "Reset lúc" })}:{" "}
                        {formatDate(f.resetAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 my-4 shrink-0">
                      <Badge
                        variant={f.canUse ? "default" : "secondary"}
                        className="rounded-full px-2 py-0.5 text-xs"
                      >
                        {f.canUse
                          ? t("canUse", { defaultValue: "Có thể dùng" })
                          : t("cannotUse", { defaultValue: "Không thể dùng" })}
                      </Badge>
                      <span className="text-xs font-bold tabular-nums">
                        {limitLabel}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Cancel button — chỉ hiện nếu là Plus/Premium */}
      {String(current?.planType ?? "").toLowerCase() === "plus" ||
      String(current?.planType ?? "").toLowerCase() === "premium" ? (
        <div className="pt-1">
          {/* 👈 Thay thế Button bằng AlertDialogTrigger */}
          <AlertDialog
            open={isCancelDialogOpen}
            onOpenChange={setIsCancelDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-full sm:w-100% text-xs"
                disabled={cancelSubscription.isPending}
              >
                {t("cancel", { defaultValue: "Hủy gói" })}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("cancelDialogTitle", { defaultValue: "Xác nhận hủy gói" })}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("cancelDialogDescription", {
                    defaultValue:
                      "Xin vui lòng nhập lý do hủy gói để chúng tôi cải thiện dịch vụ (nếu không nhập sẽ dùng lý do mặc định).",
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>

              {/* Input for reason */}
              <Textarea
                placeholder={t("cancelReasonPlaceholder", {
                  defaultValue: "Lý do hủy gói...",
                })}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                disabled={cancelSubscription.isPending}
              />

              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsCancelDialogOpen(false);
                    setCancelReason(""); // Xóa input khi hủy
                  }}
                  disabled={cancelSubscription.isPending}
                >
                  {t("cancelDialogCancel", { defaultValue: "Đóng" })}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelSubscription} // 👈 Gọi hàm xử lý hủy gói
                  disabled={cancelSubscription.isPending}
                >
                  {cancelSubscription.isPending
                    ? t("loading", { defaultValue: "Đang xử lý..." })
                    : t("cancelDialogConfirm", {
                        defaultValue: "Xác nhận Hủy",
                      })}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}
    </div>
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Crown className="h-4 w-4 md:h-5 md:w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4">
        {loadingCurrent ? (
          <div className="py-2 text-sm text-muted-foreground">
            {t("loading", { defaultValue: "Đang tải gói hiện tại..." })}
          </div>
        ) : current ? (
          renderCurrent()
        ) : (
          renderLegacy()
        )}
      </CardContent>
    </Card>
  );
}
