// "use client"

// import { useTranslations } from "next-intl"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"

// export default function PricingPage() {
//   const t = useTranslations("pricing")

//   const freeTierFeatures = [
//     t("freeTier.features.matching"),
//     t("freeTier.features.chat"),
//     t("freeTier.features.calls"),
//     t("freeTier.features.events"),
//     t("freeTier.features.gamification"),
//     t("freeTier.features.ads"),
//   ]

//   const plusTierFeatures = [
//     t("plusTier.features.chat"),
//     t("plusTier.features.calls"),
//     t("plusTier.features.matching"),
//     t("plusTier.features.events"),
//     t("plusTier.features.gamification"),
//     t("plusTier.features.tools"),
//     t("plusTier.features.adFree"),
//   ]

//   const faqs = [
//     {
//       question: t("faq.q1.question"),
//       answer: t("faq.q1.answer"),
//     },
//     {
//       question: t("faq.q2.question"),
//       answer: t("faq.q2.answer"),
//     },
//     {
//       question: t("faq.q3.question"),
//       answer: t("faq.q3.answer"),
//     },
//   ]

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-6xl">
//         {/* Header */}
//         <div className="text-center mb-8 sm:mb-12">
//           <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">{t("title")}</h1>
//           <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">{t("subtitle")}</p>
//         </div>

//         {/* Pricing Cards */}
//         <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 mb-12 sm:mb-16 lg:mb-20">
//           {/* Free Tier */}
//           <Card className="relative flex flex-col">
//             <CardHeader className="pb-6 sm:pb-8">
//               <CardTitle className="text-xl sm:text-2xl">{t("freeTier.name")}</CardTitle>
//               <div className="mt-3 sm:mt-4">
//                 <span className="text-4xl sm:text-5xl font-bold">{t("freeTier.price")}</span>
//               </div>
//             </CardHeader>
//             <CardContent className="flex-1 pb-6">
//               <ul className="space-y-3 sm:space-y-4">
//                 {freeTierFeatures.map((feature, index) => (
//                   <li key={index} className="flex gap-2 sm:gap-3 text-sm sm:text-base">
//                     <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
//                     <span className="text-muted-foreground leading-relaxed">{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//             <CardFooter>
//               <Button variant="outline" className="w-full bg-transparent" disabled>
//                 {t("freeTier.button")}
//               </Button>
//             </CardFooter>
//           </Card>

//           {/* Plus Tier */}
//           <Card className="relative flex flex-col border-primary shadow-lg">
//             <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs sm:text-sm">
//               {t("mostPopular")}
//             </Badge>
//             <CardHeader className="pb-6 sm:pb-8">
//               <CardTitle className="text-xl sm:text-2xl">{t("plusTier.name")}</CardTitle>
//               <div className="mt-3 sm:mt-4">
//                 <span className="text-4xl sm:text-5xl font-bold">{t("plusTier.price")}</span>
//                 <span className="text-base sm:text-lg text-muted-foreground ml-1">{t("plusTier.period")}</span>
//               </div>
//             </CardHeader>
//             <CardContent className="flex-1 pb-6">
//               <ul className="space-y-3 sm:space-y-4">
//                 {plusTierFeatures.map((feature, index) => (
//                   <li key={index} className="flex gap-2 sm:gap-3 text-sm sm:text-base">
//                     <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
//                     <span className="text-foreground leading-relaxed">{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//             <CardFooter>
//               <Button className="w-full">{t("plusTier.button")} →</Button>
//             </CardFooter>
//           </Card>
//         </div>

//         {/* FAQ Section */}
//         <div className="max-w-3xl mx-auto">
//           <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">{t("faq.title")}</h2>
//           <div className="space-y-4 sm:space-y-6">
//             {faqs.map((faq, index) => (
//               <div key={index} className="border-b pb-4 sm:pb-6 last:border-b-0">
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">{faq.question}</h3>
//                 <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{faq.answer}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlansQuery } from "@/hooks/query/use-subscriptionPlan";
import { PaginationLangQueryType } from "@/models";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

export default function PricingPage() {
  const t = useTranslations("pricing");
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

  // LỌC: Chỉ giữ lại các gói Plus có thời hạn 30 ngày hoặc 365 ngày
  const paidPlans = plans.filter((plan: any) => {
    // Loại bỏ nếu planType là 'free' (case-insensitive) hoặc giá lớn bất thường
    const isExplicitlyFree = plan.planType?.toLowerCase() === "free";
    const isImplicitlyFree = Number(plan.price) > 100000;

    // CHỈ GIỮ LẠI: plans có thời hạn là 30 ngày hoặc 365 ngày
    const duration = Number(plan.durationInDays);
    const isDesiredDuration = duration === 30 || duration === 365;

    return !(isExplicitlyFree || isImplicitlyFree) && isDesiredDuration;
  });

  // humanize: PremiumBadges -> "Premium Badges"
  const humanize = (s?: string) => {
    if (!s) return "";
    const spaced = s
      .replace(/[_-]/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  // safe translate feature: try a few keys, fallback to humanize
  const translateFeature = (featureName?: string, featureType?: string) => {
    const candidates = [
      featureName,
      featureName?.toLowerCase?.(),
      featureType,
      featureType?.toLowerCase?.(),
    ].filter(Boolean) as string[];

    for (const c of candidates) {
      const key = `features.${c}`;
      // Sử dụng key làm giá trị mặc định để kiểm tra bản dịch
      const res = t(key, { defaultValue: key });
      if (res && res !== key) return res;
    }

    return humanize(featureName ?? featureType);
  };

  // build feature list for a plan
  const buildFeatureList = (plan: any | undefined) => {
    if (!plan?.features || plan.features.length === 0) return [];
    return plan.features.map((f: any) =>
      translateFeature(f.featureName, f.featureType)
    );
  };

  // format price nicely using user's locale if available
  const formatPrice = (price: number | string | undefined) => {
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

  // Determine whether a plan should show "Most popular" badge.
  const isMostPopular = (plan: any) =>
    plan?.planType?.toLowerCase() === "plus" &&
    Number(plan?.durationInDays) === 30;

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

        {/* Pricing Cards: render all paid plans with 30 or 365 days duration */}
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-2 mb-12 sm:mb-16 lg:mb-20">
          {paidPlans.length === 0 ? (
            // Nếu không có plans có phí nào thỏa mãn điều kiện, hiển thị một thông báo
            <div className="lg:col-span-3 sm:col-span-2 text-center py-10 text-muted-foreground">
              {"No paid subscription plans (monthly or yearly) available yet."}
            </div>
          ) : (
            // Map all filtered paid plans to cards
            paidPlans.map((plan: any) => {
              const features = buildFeatureList(plan);
              const priceLabel = formatPrice(plan.price);
              const isFree = false; // Luôn là false vì đã lọc

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${isMostPopular(plan) ? "border-primary shadow-lg" : ""}`}
                >
                  {isMostPopular(plan) && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs sm:text-sm">
                      {t("mostPopular")}
                    </Badge>
                  )}
                  <CardHeader className="pb-6 sm:pb-8">
                    {/* Tiêu đề */}
                    <CardTitle className="text-xl sm:text-2xl min-h-[2.25rem]">
                      {plan.name ?? plan.planType}
                    </CardTitle>

                    {/* Giá tiền và thời hạn */}
                    <div className="mt-3 sm:mt-4">
                      <span className="text-3xl sm:text-3xl font-bold">
                        {priceLabel}
                      </span>
                      <span className="text-base sm:text-lg text-muted-foreground ml-1">
                        {plan.durationInDays
                          ? plan.durationInDays === 30
                            ? t("plusTier.period")
                            : // Cập nhật: Sử dụng t("plusTier.periodYearly") cho gói 365 ngày
                              plan.durationInDays === 365
                              ? t("plusTier.periodYearly", {
                                  defaultValue: "/năm",
                                })
                              : `/ ${plan.durationInDays} ${t("plusTier.days") ?? "days"}`
                          : ""}
                      </span>
                    </div>

                    {/* Sử dụng min-h-[1.25rem] và placeholder &nbsp; để căn chỉnh UI */}
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

                  <CardFooter>
                    {/* Nút luôn là default vì đây là gói trả phí */}
                    <Button variant="default" className="w-full">
                      {`${t("plusTier.button")} →`}
                    </Button>
                  </CardFooter>
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
    </div>
  );
}
