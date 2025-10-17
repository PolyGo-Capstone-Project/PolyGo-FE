"use client";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import FeaturesList from "./pricing-featureList";

export default function CurrentPlanCard({
  subData,
  formatDate,
}: {
  subData: {
    planName: string;
    planType: string;
    endAt?: string | null;
    autoRenew?: boolean;
    daysRemaining?: number;
  };
  formatDate: (iso?: string | null) => string;
}) {
  const t = useTranslations("pricing");

  // Build info lines (giữ nguyên logic cũ)
  const infoLines: string[] = [
    `${t("current.plan", { defaultValue: "Gói" })}: ${subData.planName}`,
    `${t("current.ends", { defaultValue: "Kết thúc" })}: ${formatDate(subData.endAt)}`,
    `${t("current.autoRenew", { defaultValue: "Tự động gia hạn" })}: ${
      subData.autoRenew
        ? t("current.yes", { defaultValue: "Có" })
        : t("current.no", { defaultValue: "Không" })
    }`,
    `${t("current.daysRemaining", { defaultValue: "Số ngày còn lại" })}: ${
      subData.daysRemaining ?? "—"
    }`,
  ];

  return (
    <Card
      className={[
        "relative flex flex-col overflow-hidden",
        // viền & glow nhẹ để nổi bật
        "border-primary/40 shadow-lg",
        "ring-1 ring-primary/10 hover:ring-primary/20 transition",
      ].join(" ")}
      aria-label={t("current.title", { defaultValue: "Gói hiện tại" })}
    >
      {/* Banner ngang trên cùng */}
      <div className="relative w-full">
        <div className="h-10 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-primary-foreground bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
            {t("current.title", { defaultValue: "Gói hiện tại" })}
          </span>
        </div>

        {/* Ribbon chéo góc phải */}
        {/* <div
          className="absolute -right-14 -top-6 rotate-45 bg-primary text-primary-foreground text-[10px] font-semibold px-16 py-1.5 shadow-sm"
          aria-hidden="true"
        >
          {t("current.badge", { defaultValue: "Đang sử dụng" })}
        </div> */}
      </div>

      <CardHeader className="pb-6 sm:pb-0">
        <CardTitle className="text-xl sm:text-2xl min-h-[2.25rem] flex items-center gap-2">
          <span className="inline-flex items-center gap-2">
            {/* Dot xịn xò ở tiêu đề */}
            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_3px] shadow-primary/20" />
            {subData.planName}
          </span>

          {subData.planType ? (
            <Badge
              variant="outline"
              className="ml-3 text-xs sm:text-sm border-primary/40 text-primary"
              title={subData.planType}
            >
              {subData.planType}
            </Badge>
          ) : null}
        </CardTitle>

        {/* Placeholder giữ bố cục y nguyên với FreeCard */}
        <div className="mt-3 sm:mt-4">
          <span className="text-3xl sm:text-3xl font-bold">&nbsp;</span>
          <span className="text-base sm:text-lg text-muted-foreground ml-1">
            &nbsp;
          </span>
        </div>

        <p className="text-sm text-muted-foreground mt-2 min-h-[2.25rem]">
          <>&nbsp;</>
        </p>
      </CardHeader>

      <CardContent className="flex-1 pb-6">
        {/* Viền nền nhẹ cho khu feature */}
        <div className="rounded-xl border border-primary/10 bg-gradient-to-b from-primary/5 to-transparent p-2 sm:p-3">
          <FeaturesList items={infoLines} />
        </div>
      </CardContent>

      {/* Không có footer để giữ nguyên flow nâng cấp qua PlusCard */}
    </Card>
  );
}
