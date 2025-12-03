"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t("stats.title", { defaultValue: "Thống kê của bạn" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RowStat
          label={t("stats.xp", { defaultValue: "XP" })}
          value={xpPoints}
        />
        {/* <RowStat
          label={t("stats.hours", { defaultValue: "Giờ đã học" })}
          value={totalHours}
        /> */}
        <RowStat
          label={t("stats.streak", { defaultValue: "Chuỗi ngày" })}
          value={streakDays}
        />
        {/* <RowStat
          label={t("stats.rating", { defaultValue: "Đánh giá" })}
          value={rating}
        /> */}

        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {t("stats.levelProgress", { defaultValue: "Level Progress" })}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progressPct)}%
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {currentXP.toLocaleString()} / {totalXP.toLocaleString()} XP
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RowStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
