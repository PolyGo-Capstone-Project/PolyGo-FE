"use client";

import { Flame, Star } from "lucide-react";
import { useTranslations } from "next-intl";

export function WelcomeBanner({
  userName,
  xpPoints,
  streakDays,
  totalHours,
  t,
}: {
  userName: string;
  xpPoints: number;
  streakDays: number;
  totalHours: number;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="rounded-xl p-6 sm:p-8 text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 dark:from-indigo-500 dark:via-purple-500 dark:to-purple-600 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            {t("welcome", { name: userName })}
          </h1>
          <p className="text-purple-100 dark:text-purple-200 text-sm">
            {t("dailyGoal")}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
          <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          <span className="font-bold">{xpPoints}</span>
          <span className="text-sm text-purple-100">{t("xpPoints")}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-300" />
          <span>{t("streak", { count: streakDays })}</span>
        </div>
        {/* <div className="w-px h-4 bg-white/30" /> */}
        <div className="flex items-center gap-2">
          {/* <BookOpen className="w-4 h-4 text-sky-300" />
          <span>{totalHours}h learning</span> */}
        </div>
      </div>
    </div>
  );
}
