"use client";

import {
  useCurrentSubscriptionQuery,
  usePlansQuery,
  useSubscribeMutation,
} from "@/hooks/query/use-subscription";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { PaginationLangQueryType } from "@/models";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

// UI
import ConfirmBuyDialog from "@/components/modules/pricing/pricing-confirmDialog";
import FreeCard from "@/components/modules/pricing/pricing-freeCard";
import HeaderSection from "@/components/modules/pricing/pricing-header";
import PlusCard from "@/components/modules/pricing/pricing-plusCard";
import PlusListDialog from "@/components/modules/pricing/pricing-plusDialog";
// ✅ Card mới cho gói hiện tại (không phải free)
import CurrentPlanCard from "@/components/modules/pricing/pricing-currentCard";

export default function PricingPage() {
  const t = useTranslations("pricing");
  const tBuy = useTranslations("pricing.buy");

  const tSuccess = useTranslations("pricing.buy");
  const tError = useTranslations("pricing.buy");

  const locale = useLocale();
  const lang = useMemo(() => (locale ? locale.split("-")[0] : "en"), [locale]);

  const defaultParams: PaginationLangQueryType = useMemo(
    () => ({ lang, pageNumber: 1, pageSize: 10 }),
    [lang]
  );

  const plansQuery = usePlansQuery({ params: defaultParams, enabled: true });
  const plansPayload = plansQuery.data?.payload?.data;
  const plans = plansPayload?.items ?? [];

  const currentSubQuery = useCurrentSubscriptionQuery(true);
  const subData = currentSubQuery.data?.payload?.data;

  const formatDate = useCallback(
    (iso?: string | null) => {
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
    },
    [locale]
  );

  const freeFeatures = useMemo(
    () => [
      t("freeTier.features.matching"),
      t("freeTier.features.chat"),
      t("freeTier.features.calls"),
      t("freeTier.features.events"),
      t("freeTier.features.gamification"),
    ],
    [t]
  );

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
  const plusFeatures = useMemo(
    () => plusFeatureKeys.map((k) => t(`features.${k}` as any)),
    [t]
  );

  // Dialog states & purchase
  const [listOpen, setListOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [autoRenew, setAutoRenew] = useState(true);

  const subscribeMutation = useSubscribeMutation();

  const openPlusList = useCallback(() => setListOpen(true), []);

  const openBuyDialog = useCallback((plan: any) => {
    setSelectedPlan(plan);
    setAutoRenew(true);
    setConfirmOpen(true);
  }, []);

  const onConfirmBuyAsync = useCallback(async () => {
    if (!selectedPlan?.id) return false;

    try {
      // Sử dụng mutateAsync để chờ kết quả và dùng try/catch
      const response = await subscribeMutation.mutateAsync({
        subscriptionPlanId: selectedPlan.id,
        autoRenew,
      }); // ĐÃ SỬA: Sử dụng tSuccess

      showSuccessToast(response.payload?.message, tSuccess);
      return true; // TRẢ VỀ TRUE để kích hoạt chuyển trang
    } catch (err: any) {
      showErrorToast(
        err?.payload?.message ??
          tBuy("error", {
            defaultValue:
              "Unable to complete purchase. Please try again later.",
          }),
        tError // ĐÃ SỬA: Thay tBuy bằng tError
      );
      return false; // TRẢ VỀ FALSE nếu có lỗi
    }
  }, [selectedPlan, autoRenew, subscribeMutation, tBuy, tSuccess, tError]); // ĐÃ SỬA: Thêm dependency tSuccess, tError

  const apiPlusPlans = useMemo(
    () =>
      plans.filter(
        (p: any) => String(p.planType ?? "").toLowerCase() === "plus"
      ),
    [plans]
  );

  // Quyết định hiển thị card bên trái: FreeCard hoặc CurrentPlanCard (nếu không phải free)
  const isCurrentFree =
    String(subData?.planType ?? "").toLowerCase() === "free" || !subData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <HeaderSection />

        {/* Two cards only: Left (Free OR CurrentPlan) + Plus (hardcoded) */}
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-2 mb-12 sm:mb-16 lg:mb-20">
          {isCurrentFree ? (
            <FreeCard freeFeatures={freeFeatures} />
          ) : (
            <CurrentPlanCard subData={subData} formatDate={formatDate} />
          )}
          <PlusCard plusFeatures={plusFeatures} onOpenList={openPlusList} />
        </div>

        {/* FAQ Section (unchanged) */}
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

      {/* Modals */}
      <PlusListDialog
        open={listOpen}
        onOpenChange={setListOpen}
        isLoading={plansQuery.isLoading}
        apiPlusPlans={apiPlusPlans}
        onChoose={openBuyDialog}
      />

      <ConfirmBuyDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        selectedPlan={selectedPlan}
        autoRenew={autoRenew}
        setAutoRenew={setAutoRenew}
        isPending={subscribeMutation.isPending}
        onConfirmAsync={onConfirmBuyAsync}
        onConfirm={() => {}} // ĐÃ SỬA: Truyền hàm async mới vào prop `onConfirmAsync`
      />
    </div>
  );
}
