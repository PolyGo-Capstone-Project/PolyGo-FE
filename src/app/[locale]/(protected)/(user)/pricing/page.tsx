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
  useSubscribeMutation, // NEW
} from "@/hooks/query/use-subscriptionPlan";
import { PaginationLangQueryType } from "@/models";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

// NEW: Dialog + Switch + Label
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

// NEW: toast helpers (theo ví dụ của bạn)
import { showErrorToast, showSuccessToast } from "@/lib/utils";

export default function PricingPage() {
  const t = useTranslations("pricing");
  const tWallet = useTranslations("wallet.subscription"); // dùng text cho auto-renew label
  const tBuy = useTranslations("pricing.buy");

  const locale = useLocale();
  const router = useRouter();
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

  const displayedPlans = plans;

  // Helpers
  const humanize = (s?: string) => {
    if (!s) return "";
    const spaced = s
      .replace(/[_-]/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const translateFeature = (featureName?: string, featureType?: string) => {
    const candidates = [
      featureName,
      featureName?.toLowerCase?.(),
      featureType,
      featureType?.toLowerCase?.(),
    ].filter(Boolean) as string[];
    for (const c of candidates) {
      const key = `features.${c}`;
      const res = t(key, { defaultValue: key });
      if (res && res !== key) return res;
    }
    return humanize(featureName ?? featureType);
  };

  const buildFeatureList = (plan: any | undefined) => {
    if (!plan?.features || plan.features.length === 0) return [];
    return plan.features.map((f: any) =>
      translateFeature(f.featureName, f.featureType)
    );
  };

  const formatPrice = (
    price: number | string | undefined,
    planType?: string
  ) => {
    const isFreeType = planType?.toLowerCase?.() === "free";
    if (isFreeType) return t("freeTier.price");
    if (price === undefined || price === null) return "";
    const num = typeof price === "string" ? Number(price) : price;
    if (num > 100000) return t("freeTier.price");
    try {
      return new Intl.NumberFormat(locale ?? "en", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(num);
    } catch {
      return String(num);
    }
  };

  const isMostPopular = (plan: any) =>
    plan?.planType?.toLowerCase() === "plus" &&
    Number(plan?.durationInDays) === 30;

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

  // ❌ isCurrentPlan đã loại bỏ theo yêu cầu
  // ✅ Thay vì redirect checkout, mở popup xác nhận mua
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);

  const subscribeMutation = useSubscribeMutation();

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
          // Theo mẫu của bạn:
          showSuccessToast(response?.payload?.message ?? "Subscribe", tBuy);
          setConfirmOpen(false);
          setSelectedPlan(null);
        },
        onError: (err: any) => {
          showErrorToast(err?.payload?.message ?? "Purchase failed", tBuy);
        },
      }
    );
  }, [selectedPlan, autoRenew, subscribeMutation, tBuy]);

  const handlePurchase = useCallback(
    (plan: any) => {
      // Mở dialog xác nhận mua thay vì chuyển trang
      openBuyDialog(plan);
    },
    [openBuyDialog]
  );

  // FAQs (unchanged)
  const faqs = [
    { question: t("faq.q1.question"), answer: t("faq.q1.answer") },
    { question: t("faq.q2.question"), answer: t("faq.q2.answer") },
    { question: t("faq.q3.question"), answer: t("faq.q3.answer") },
  ];

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
                {t("current.title", { defaultValue: "Gói hiện tại của bạn" })}
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
                      {subData.planName}{" "}
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
                    {t("current.ends", { defaultValue: "Hết hạn" })}:{" "}
                    <span className="font-medium text-foreground">
                      {formatDate(subData.endAt)}
                    </span>
                    <Separator
                      className="inline-block mx-3 h-4 align-middle"
                      orientation="vertical"
                    />
                    {t("current.autoRenew", {
                      defaultValue: "Gia hạn tự động",
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
                  {t("current.empty", { defaultValue: "Bạn chưa có gói nào." })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plans grid */}
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-12 sm:mb-16 lg:mb-20">
          {displayedPlans.length === 0 ? (
            <div className="lg:col-span-3 sm:col-span-2 text-center py-10 text-muted-foreground">
              {"No paid subscription plans (monthly or yearly) available yet."}
            </div>
          ) : (
            displayedPlans.map((plan: any) => {
              const features = buildFeatureList(plan);
              const priceLabel = plan.price; // Giữ VNĐ như bạn đang hiển thị
              const planType = String(plan.planType ?? "").toLowerCase();
              const isFreePlan = planType === "free";

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${
                    isMostPopular(plan) ? "border-primary shadow-lg" : ""
                  }`}
                >
                  {isMostPopular(plan) && (
                    <Badge className="absolute -top-3 right-3 bg-primary text-primary-foreground px-3 py-1 text-xs sm:text-sm">
                      {t("mostPopular")}
                    </Badge>
                  )}

                  <CardHeader className="pb-6 sm:pb-8">
                    <CardTitle className="text-xl sm:text-2xl min-h-[2.25rem]">
                      {plan.name ?? plan.planType}
                    </CardTitle>

                    <div className="mt-3 sm:mt-4">
                      <span className="text-2xl sm:text-2xl font-bold">
                        {priceLabel} VNĐ
                      </span>
                      <span className="text-base sm:text-lg text-muted-foreground ml-1">
                        {plan.durationInDays
                          ? plan.durationInDays === 30
                            ? t("plusTier.period")
                            : plan.durationInDays === 365
                              ? t("plusTier.periodYearly", {
                                  defaultValue: "/năm",
                                })
                              : `/ ${plan.durationInDays} ${t("plusTier.days") ?? "days"}`
                          : ""}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 min-h-[2.25rem]">
                      {plan.description || <>&nbsp;</>}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-1 pb-6">
                    <ul className="space-y-3 sm:space-y-4">
                      {features.length === 0 ? (
                        <li className="text-sm text-muted-foreground">
                          {t("noFeatures") ?? "No features available"}
                        </li>
                      ) : (
                        features.map((feature: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex gap-2 sm:gap-3 text-sm sm:text-base"
                          >
                            <span className="text-green-600 flex-shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span className="leading-relaxed text-foreground">
                              {feature}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  </CardContent>

                  {!isFreePlan && (
                    <CardFooter className="flex flex-col gap-1">
                      <Button
                        variant="default"
                        className="w-full"
                        disabled={subscribeMutation.isPending}
                        onClick={() => handlePurchase(plan)}
                      >
                        {`${t("plusTier.button")} →`}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
            {t("faq.title")}
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b pb-4 sm:pb-6 last:border-b-0"
              >
                <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                  {faq.question}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* NEW: Dialog xác nhận mua */}
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
                    ? t("plusTier.periodPopup", { defaultValue: "/tháng" })
                    : selectedPlan.durationInDays === 365
                      ? t("plusTier.periodYearlyPopup", {
                          defaultValue: "/năm",
                        })
                      : ` ${selectedPlan.durationInDays} ${t("plusTier.days") ?? "days"}`
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
                    defaultValue: "Hệ thống sẽ tự gia hạn khi đến hạn.",
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
