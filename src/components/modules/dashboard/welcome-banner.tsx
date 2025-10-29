"use client";

import { useTranslations } from "next-intl";
// ✨ FIX: Import các icon Lucide mới
import { BookOpen, Flame, Star } from "lucide-react";

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
    <div className="rounded-2xl p-6 sm:p-8 text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t("welcome", { name: userName })}{" "}
              {/* <Star className="inline w-6 h-6 ml-1 align-sub" />  */}
            </h1>
            <p className="text-purple-100 text-sm mt-1">{t("dailyGoal")}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
              <Star className="w-5 h-5 text-yellow-300" />
              <span>{xpPoints}</span>
              <span className="text-purple-100">{t("xpPoints")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400" />
            <span>{t("streak", { count: streakDays })}</span>
          </div>
          <div className="w-px h-5 bg-white/30" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-300" />
            <span>{totalHours}h learning</span>
          </div>
        </div>
      </div>
    </div>
  );
}
