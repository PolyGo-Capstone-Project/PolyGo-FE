"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components/ui";
import {
  useCurrentSubscriptionQuery,
  usePlansQuery,
  useSubscribeMutation,
} from "@/hooks/query/use-subscriptionPlan";
import { PaginationLangQueryType } from "@/models";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

// Dialogs
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter as DialogFooterUI,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { showErrorToast, showSuccessToast } from "@/lib/utils";

export default function PricingPage() {
  const t = useTranslations("pricing");
  const tWallet = useTranslations("wallet.subscription");
  const tBuy = useTranslations("pricing.buy");

  const locale = useLocale();
  const lang = useMemo(() => (locale ? locale.split("-")[0] : "en"), [locale]);

  const defaultParams: PaginationLangQueryType = {
    lang,
    pageNumber: 1,
    pageSize: 10,
  };

  const plansQuery = usePlansQuery({ params: defaultParams, enabled: true });
  const plansPayload = plansQuery.data?.payload?.data;
  const plans = plansPayload?.items ?? [];

  // Current subscription
  const currentSubQuery = useCurrentSubscriptionQuery(true);
  const subData = currentSubQuery.data?.payload?.data;

  // ===== Helpers =====
  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(locale ?? "en", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso ?? "";
    }
  };

  // Free tier feature list from i18n
  const freeFeatures: string[] = useMemo(
    () => [
      t("freeTier.features.matching"),
      t("freeTier.features.chat"),
      t("freeTier.features.calls"),
      t("freeTier.features.events"),
      t("freeTier.features.gamification"),
    ],
    [t]
  );

  // Plus hardcoded features (order given by user) -> map via pricing.features.*
  const plusFeatureKeys = [
    "EventCreation",
    "VideoCall",
    "PrioritySupport",
    "VoiceCall",
    "PremiumBadges",
    "AdvancedMatching",
    "Analytics",
    "Chat",
    "EventParticipation",
    "Translation",
  ] as const;
  const plusFeatures: string[] = useMemo(
    () => plusFeatureKeys.map((k) => t(`features.${k}` as any)),
    [t]
  );

  // ===== Purchase flows =====
  const [listOpen, setListOpen] = useState(false); // Modal danh sách gói Plus từ API
  const [confirmOpen, setConfirmOpen] = useState(false); // Modal xác nhận mua
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);

  const subscribeMutation = useSubscribeMutation();

  const openPlusList = useCallback(() => {
    setListOpen(true);
  }, []);

  const openBuyDialog = useCallback((plan: any) => {
    setSelectedPlan(plan);
    setAutoRenew(true);
    setConfirmOpen(true);
  }, []);

  const onConfirmBuy = useCallback(() => {
    if (!selectedPlan?.id) return;
    subscribeMutation.mutate(
      { subscriptionPlanId: selectedPlan.id, autoRenew },
      {
        onSuccess: (response: any) => {
          showSuccessToast(
            response?.payload?.message ??
              tBuy("success", { defaultValue: "Plan purchased successfully!" }),
            tBuy
          );
          setConfirmOpen(false);
          setSelectedPlan(null);
        },
        onError: (err: any) => {
          showErrorToast(
            err?.payload?.message ??
              tBuy("error", {
                defaultValue:
                  "Unable to complete purchase. Please try again later.",
              }),
            tBuy
          );
        },
      }
    );
  }, [selectedPlan, autoRenew, subscribeMutation, tBuy]);

  // Filter Plus plans from API for list modal
  const apiPlusPlans = useMemo(
    () =>
      plans.filter(
        (p: any) => String(p.planType ?? "").toLowerCase() === "plus"
      ),
    [plans]
  );

  const renderFeatureItem = (text: string, idx: number) => (
    <li key={idx} className="flex gap-2 sm:gap-3 text-sm sm:text-base">
      <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
      <span className="leading-relaxed text-foreground">{text}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t("subtitle")}
          </p>
        </div>

        {/* Current plan summary */}
        <div className="mb-8 sm:mb-10">
          <Card className="border-primary/30">
            <CardHeader className="py-3 sm:py-4">
              <CardTitle className="flex flex-wrap items-center font-semibold gap-3 text-base sm:text-lg">
                {t("current.title", { defaultValue: "Gói hiện tại" })}
                {currentSubQuery.isLoading ? null : subData?.active ? (
                  <Badge className="rounded-full px-2 py-0.5 text-xs">
                    {t("current.active", { defaultValue: "Đang hoạt động" })}
                  </Badge>
                ) : subData ? (
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2 py-0.5 text-xs"
                  >
                    {t("current.inactive", { defaultValue: "Không hoạt động" })}
                  </Badge>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 sm:py-5">
              {currentSubQuery.isLoading ? (
                <div className="text-sm text-muted-foreground">
                  {t("current.loading", {
                    defaultValue: "Đang tải gói hiện tại...",
                  })}
                </div>
              ) : subData ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-md text-muted-foreground">
                      {t("current.plan", { defaultValue: "Gói" })}:
                    </span>
                    <span className="text-lg font-semibold">
                      {subData.planName}
                    </span>
                    {subData.planType && (
                      <Badge
                        variant="outline"
                        className="rounded-full px-2 py-0.5 text-[10px] background-primary text-primary"
                      >
                        {subData.planType}
                      </Badge>
                    )}
                  </div>
                  <div className="text-md sm:text-sm text-muted-foreground">
                    {t("current.ends", { defaultValue: "Kết thúc" })}:{" "}
                    <span className="font-medium text-foreground">
                      {formatDate(subData.endAt)}
                    </span>
                    <Separator
                      className="inline-block mx-3 h-4 align-middle"
                      orientation="vertical"
                    />
                    {t("current.autoRenew", {
                      defaultValue: "Tự động gia hạn",
                    })}
                    :{" "}
                    <Badge
                      variant={subData.autoRenew ? "default" : "secondary"}
                      className="align-middle px-2 mx-2"
                    >
                      {subData.autoRenew
                        ? t("current.yes", { defaultValue: "Có" })
                        : t("current.no", { defaultValue: "Không" })}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {t("current.empty", {
                    defaultValue: "Bạn hiện không có gói đăng ký nào.",
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* === Two cards only: Free (static) + Plus (hardcoded) === */}
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-2 mb-12 sm:mb-16 lg:mb-20">
          {/* Free Card */}
          <Card className="relative flex flex-col">
            <CardHeader className="pb-6 sm:pb-0">
              <CardTitle className="text-xl sm:text-2xl min-h-[2.25rem]">
                {t("freeTier.name")}
              </CardTitle>
              <div className="mt-3 sm:mt-4">
                <span className="text-3xl sm:text-3xl font-bold">
                  {t("freeTier.price")}
                </span>
                <span className="text-base sm:text-lg text-muted-foreground ml-1">
                  {t("freeTier.period")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 min-h-[2.25rem]">
                <>&nbsp;</>
              </p>
            </CardHeader>
            <CardContent className="flex-1 pb-6">
              <ul className="space-y-3 sm:space-y-4">
                {freeFeatures.map(renderFeatureItem)}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full">
                {t("freeTier.button")}
              </Button>
            </CardFooter>
          </Card>

          {/* Plus Card (hardcoded) */}
          <Card className="relative flex flex-col border-primary shadow-lg">
            <Badge className="absolute -top-3 right-3 bg-primary text-primary-foreground px-3 py-1 text-xs sm:text-sm">
              {t("mostPopular")}
            </Badge>
            <CardHeader className="pb-6 sm:pb-0">
              <CardTitle className="text-xl sm:text-2xl min-h-[2.25rem]">
                {t("plusTier.name")}
              </CardTitle>
              <div className="mt-3 sm:mt-4">
                <span className="text-3xl sm:text-3xl font-bold">
                  {t("plusTier.price")}
                </span>
                <span className="text-base sm:text-lg text-muted-foreground ml-1">
                  {t("plusTier.period")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 min-h-[2.25rem]">
                <>&nbsp;</>
              </p>
            </CardHeader>
            <CardContent className="flex-1 pb-6">
              <ul className="space-y-3 sm:space-y-4">
                {plusFeatures.map(renderFeatureItem)}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={openPlusList}>
                {t("plusTier.listButton", {
                  defaultValue: "Danh sách gói Plus",
                })}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
            {t("faq.title")}
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {["q1", "q2", "q3"].map((k) => (
              <div key={k} className="border-b pb-4 sm:pb-6 last:border-b-0">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                  {t(`faq.${k}.question`)}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t(`faq.${k}.answer`)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* === Modal: Danh sách gói Plus từ API === */}
      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("plusTier.listTitle", { defaultValue: "Danh sách gói Plus" })}
            </DialogTitle>
            <DialogDescription>
              {t("plusTier.listDesc", {
                defaultValue: "Chọn một gói Plus hiện có để mua hoặc gia hạn.",
              })}
            </DialogDescription>
          </DialogHeader>

          {/* Loading / Empty / List */}
          {plansQuery.isLoading ? (
            <div className="text-sm text-muted-foreground py-6">
              {t("loading")}
            </div>
          ) : apiPlusPlans.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6">
              {t("noFeatures", { defaultValue: "No features available" })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {apiPlusPlans.map((plan: any) => (
                <Card key={plan.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {plan.name ?? plan.planType}
                    </CardTitle>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <span className="font-semibold">{plan.price} VNĐ</span>
                      {plan.durationInDays ? (
                        <span className="ml-1">
                          {plan.durationInDays === 30
                            ? t("plusTier.period")
                            : plan.durationInDays === 365
                              ? t("plusTier.periodYearly")
                              : `/ ${plan.durationInDays} ${t("plusTier.days")}`}
                        </span>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <p className="text-xs text-muted-foreground min-h-[2rem]">
                      {plan.description ?? " "}
                    </p>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button
                      className="w-full"
                      onClick={() => openBuyDialog(plan)}
                    >
                      {t("plusTier.button", { defaultValue: "Nâng cấp ngay" })}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <DialogFooterUI>
            <Button variant="outline" onClick={() => setListOpen(false)}>
              {t("buy.cancel", { defaultValue: "Đóng" })}
            </Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>

      {/* === Modal: Xác nhận mua === */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("buy.confirmTitle", { defaultValue: "Xác nhận mua gói" })}
            </DialogTitle>
            <DialogDescription>
              {t("buy.desc", {
                defaultValue:
                  "Vui lòng kiểm tra thông tin gói trước khi xác nhận.",
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">
                {t("planName", { defaultValue: "Tên gói" })}
              </span>
              <span className="text-sm font-semibold">
                {selectedPlan?.name ?? selectedPlan?.planType ?? "—"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">
                {t("price", { defaultValue: "Giá" })}
              </span>
              <span className="text-sm font-semibold">
                {selectedPlan?.price != null
                  ? `${selectedPlan.price} VNĐ`
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">
                {t("duration", { defaultValue: "Thời hạn" })}
              </span>
              <span className="text-sm font-semibold">
                {selectedPlan?.durationInDays
                  ? selectedPlan.durationInDays === 30
                    ? t("plusTier.period", { defaultValue: "/tháng" })
                    : selectedPlan.durationInDays === 365
                      ? t("plusTier.periodYearly", { defaultValue: "/năm" })
                      : `/ ${selectedPlan.durationInDays} ${t("plusTier.days")}`
                  : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div className="flex flex-col">
                <Label htmlFor="auto-renew" className="text-sm font-medium">
                  {tWallet("autoRenew", { defaultValue: "Tự động gia hạn" })}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t("buy.autoRenewHint", {
                    defaultValue: "Hệ thống sẽ tự động gia hạn khi đến hạn.",
                  })}
                </span>
              </div>
              <Switch
                id="auto-renew"
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
              />
            </div>
          </div>

          <DialogFooterUI className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={subscribeMutation.isPending}
            >
              {t("buy.cancel", { defaultValue: "Đóng" })}
            </Button>
            <Button
              onClick={onConfirmBuy}
              disabled={!selectedPlan?.id || subscribeMutation.isPending}
            >
              {subscribeMutation.isPending
                ? t("buy.processing", { defaultValue: "Đang xử lý..." })
                : t("buy.confirm", { defaultValue: "Xác nhận mua" })}
            </Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>
    </div>
  );
}
