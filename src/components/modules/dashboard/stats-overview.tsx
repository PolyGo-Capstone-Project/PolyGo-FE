"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function StatsOverviewCard({
  xpPoints,
  totalHours,
  streakDays,
  rating,
  progressPct,
  currentXP,
  totalXP,
  t,
}: {
  xpPoints: number;
  totalHours: number | string;
  streakDays: number;
  rating: number;
  progressPct: number;
  currentXP: number;
  totalXP: number;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg font-bold text-slate-900">
          {t("stats.title", { defaultValue: "Thống kê của bạn" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <RowStat
          label={t("stats.xp", { defaultValue: "XP" })}
          value={xpPoints}
        />
        <RowStat
          label={t("stats.hours", { defaultValue: "Giờ đã học" })}
          value={totalHours}
        />
        <RowStat
          label={t("stats.streak", { defaultValue: "Chuỗi ngày" })}
          value={streakDays}
        />
        <RowStat
          label={t("stats.rating", { defaultValue: "Đánh giá" })}
          value={rating}
        />
        <div className="pt-4 border-t">
          <p className="text-xs font-semibold text-slate-700 mb-2">
            {t("stats.levelProgress", { defaultValue: "Level Progress" })}
          </p>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {currentXP}/{totalXP} XP
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RowStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}
