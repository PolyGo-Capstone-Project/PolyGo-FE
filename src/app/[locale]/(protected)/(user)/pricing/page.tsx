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
import ConfirmBuyDialog from "./pricing-confirmDialog";
import CurrentPlanSummary from "./pricing-curentPlan";
import FreeCard from "./pricing-freeCard";
import HeaderSection from "./pricing-header";
import PlusCard from "./pricing-plusCard";
import PlusListDialog from "./pricing-plusDialog";

// Sections & Components

export default function PricingPage() {
  const t = useTranslations("pricing");
  const tBuy = useTranslations("pricing.buy");
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

  const apiPlusPlans = useMemo(
    () =>
      plans.filter(
        (p: any) => String(p.planType ?? "").toLowerCase() === "plus"
      ),
    [plans]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <HeaderSection />
        <CurrentPlanSummary
          isLoading={currentSubQuery.isLoading}
          subData={subData}
          formatDate={formatDate}
        />

        {/* Two cards only: Free + Plus (hardcoded) */}
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-2 mb-12 sm:mb-16 lg:mb-20">
          <FreeCard freeFeatures={freeFeatures} />
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
        onConfirm={onConfirmBuy}
      />
    </div>
  );
}
