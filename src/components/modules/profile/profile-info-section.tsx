"use client";

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconFlame,
  IconInfoCircle,
  IconShieldCheck,
  IconSnowflake,
  IconSparkles,
  IconTrophy,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ProfileInfoSectionProps = {
  experiencePoints: number;
  merit: number;
  streakDays: number;
  longestStreakDays: number;
  bannedStreakDays: number;
};

export function ProfileInfoSection({
  experiencePoints,
  merit,
  streakDays,
  longestStreakDays,
  bannedStreakDays,
}: ProfileInfoSectionProps) {
  const t = useTranslations("profile");
  const tXp = useTranslations("profile");
  const tStreak = useTranslations("profile.streak");
  const tMerit = useTranslations("profile.merit");

  // If user is banned, only show banned streak warning
  if (bannedStreakDays > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("sections.experiencePoints")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Banned Streak - Full width warning */}
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border-2 p-6",
              "bg-gradient-to-br from-red-500/20 to-rose-500/15",
              "border-red-500/40",
              "animate-in fade-in slide-in-from-bottom-4 duration-500",
              "shadow-xl"
            )}
          >
            {/* Warning pulse effect */}
            <div className="absolute inset-0 bg-red-500/10 animate-pulse" />

            {/* Radial glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse" />

            <div className="relative space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/50 rounded-xl blur-xl animate-pulse" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg animate-pulse">
                      <span className="text-2xl">⚠️</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                      {tStreak("warning")}
                    </p>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80">
                      {tStreak("bannedStreak")}
                    </p>
                  </div>
                </div>
                <div className="text-3xl animate-pulse">⛔</div>
              </div>

              {/* Number display */}
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-black text-red-600 dark:text-red-400">
                  {bannedStreakDays}
                </p>
                <p className="text-lg font-bold text-red-600/70 dark:text-red-400/70">
                  {bannedStreakDays > 1 ? tStreak("days") : tStreak("day")}
                </p>
              </div>

              {/* Warning message */}
              <div className="pt-2 border-t border-red-500/30">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Account restricted. Contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Normal flow - no banned streak
  // Level thresholds
  const levelThresholds = [
    { level: 1, xp: 0 },
    { level: 2, xp: 2000 },
    { level: 3, xp: 4000 },
    { level: 4, xp: 6000 },
    { level: 5, xp: 8000 },
    { level: 6, xp: 10000 },
    { level: 7, xp: 12000 },
    { level: 8, xp: 14000 },
    { level: 9, xp: 16000 },
    { level: 10, xp: 18000 },
  ];

  // Calculate current level based on XP
  let currentLevel = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 2000;

  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (experiencePoints >= levelThresholds[i].xp) {
      currentLevel = levelThresholds[i].level;
      xpForCurrentLevel = levelThresholds[i].xp;

      // Set XP for next level (if not at max level)
      if (i < levelThresholds.length - 1) {
        xpForNextLevel = levelThresholds[i + 1].xp;
      } else {
        // Max level reached
        xpForNextLevel = levelThresholds[i].xp;
      }
      break;
    }
  }

  const xpProgress = experiencePoints - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = xpNeeded > 0 ? (xpProgress / xpNeeded) * 100 : 100;

  // Merit classification
  const getMeritLevel = (score: number) => {
    if (score <= 40) return "banned"; // 0-40: Cấm
    if (score <= 70) return "stable"; // 41-70: Ổn định
    return "veryTrusted"; // 71-100: Rất đáng tin cậy
  };

  const meritLevel = getMeritLevel(merit);

  // Merit config based on level
  const meritConfig = {
    banned: {
      gradient: "from-red-500/15 to-rose-500/10",
      border: "border-red-500/30",
      iconBg: "from-red-500 to-rose-600",
      textColor: "text-red-600 dark:text-red-400",
      icon: IconAlertTriangle,
      label: tMerit("banned"),
      description: tMerit("bannedDesc"),
      emoji: "⛔",
    },
    stable: {
      gradient: "from-blue-500/15 to-cyan-500/10",
      border: "border-blue-500/30",
      iconBg: "from-blue-500 to-cyan-600",
      textColor: "text-blue-600 dark:text-blue-400",
      icon: IconCircleCheck,
      label: tMerit("stable"),
      description: tMerit("stableDesc"),
      emoji: "✓",
    },
    veryTrusted: {
      gradient: "from-green-500/15 to-emerald-500/10",
      border: "border-green-500/30",
      iconBg: "from-green-500 to-emerald-600",
      textColor: "text-green-600 dark:text-green-400",
      icon: IconShieldCheck,
      label: tMerit("veryTrusted"),
      description: tMerit("veryTrustedDesc"),
      emoji: "✓",
    },
  };

  const currentMeritConfig = meritConfig[meritLevel];
  const MeritIcon = currentMeritConfig.icon;

  // Calculate grid columns based on visible cards
  const visibleStreakCards = [longestStreakDays > 0, merit >= 0].filter(
    Boolean
  ).length;

  // Determine streak state: 0 = cold, 1-6 = warm, 7+ = hot
  const isHotStreak = streakDays >= 7;
  const isWarmStreak = streakDays >= 1 && streakDays < 7;
  const isColdStreak = streakDays === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t("sections.experiencePoints")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-lg px-4 py-1">
              {t("sections.level")} {currentLevel}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {xpProgress} / {xpNeeded} {tXp("xp.toNextLevel")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{experiencePoints}</p>
            <p className="text-xs text-muted-foreground">{tXp("xp.label")}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {xpNeeded - xpProgress} {tXp("xp.untilLevel")} {currentLevel + 1}
          </p>
        </div>

        {/* Streak Section - Enhanced Design */}
        <div className="space-y-3 pt-2">
          {/* HOT Streak (7+ days) - Rực cháy */}
          {isHotStreak && (
            <div className="relative overflow-hidden rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-red-500/20 p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Multiple animated background layers for intense effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 animate-pulse" />
              <div
                className="absolute inset-0 bg-gradient-to-l from-red-500/0 via-red-500/10 to-red-500/0 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />

              {/* Radial glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />

              <div className="relative flex items-center gap-4">
                {/* Fire icon with intense glow effect */}
                <div className="relative animate-in zoom-in duration-700">
                  <div className="absolute inset-0 rounded-full bg-orange-500/50 blur-2xl animate-pulse" />
                  <div
                    className="absolute inset-0 rounded-full bg-red-500/30 blur-xl animate-pulse"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 shadow-2xl ring-2 ring-orange-400/50">
                    <IconFlame
                      className="h-8 w-8 text-white animate-bounce"
                      strokeWidth={2.5}
                    />
                  </div>
                  {/* Sparkles around fire */}
                  <IconSparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
                </div>

                {/* Streak info */}
                <div className="flex-1 animate-in slide-in-from-left-4 duration-700 delay-150">
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-300 uppercase tracking-wide">
                    {tStreak("currentStreak")} 🔥
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
                      {streakDays}
                    </p>
                    <p className="text-sm font-bold text-orange-600/90 dark:text-orange-400/90">
                      {streakDays > 1 ? tStreak("days") : tStreak("day")}
                    </p>
                  </div>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1 font-medium">
                    {tStreak("keepItUp")} {tStreak("hot")}
                  </p>
                </div>

                {/* Animated flame emoji */}
                <div className="text-5xl opacity-30 animate-bounce">🔥</div>
              </div>
            </div>
          )}

          {/* WARM Streak (1-6 days) - Ấm áp */}
          {isWarmStreak && (
            <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Warm background */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 animate-pulse" />

              <div className="relative flex items-center gap-4">
                {/* Flame icon - less intense */}
                <div className="relative animate-in zoom-in duration-700">
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                    <IconFlame
                      className="h-8 w-8 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                {/* Streak info */}
                <div className="flex-1 animate-in slide-in-from-left-4 duration-700 delay-150">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    {tStreak("currentStreak")}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {streakDays}
                    </p>
                    <p className="text-sm font-medium text-amber-600/80 dark:text-amber-400/80">
                      {streakDays > 1 ? tStreak("days") : tStreak("day")}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tStreak("warm")} 🔥
                  </p>
                </div>

                {/* Flame emoji */}
                <div className="text-4xl opacity-20 animate-pulse">🔥</div>
              </div>
            </div>
          )}

          {/* COLD Streak (0 days) - Lạnh lẽo */}
          {isColdStreak && (
            <div className="relative overflow-hidden rounded-xl border-2 border-slate-500/20 bg-gradient-to-br from-slate-500/10 via-gray-500/5 to-slate-500/10 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Subtle cold background */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/0 via-slate-500/5 to-slate-500/0 animate-pulse" />

              <div className="relative flex items-center gap-4">
                {/* Snowflake icon */}
                <div className="relative animate-in zoom-in duration-700">
                  <div className="absolute inset-0 rounded-full bg-slate-500/20 blur-xl animate-pulse" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-gray-500 shadow-lg">
                    <IconSnowflake
                      className="h-8 w-8 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                {/* Streak info */}
                <div className="flex-1 animate-in slide-in-from-left-4 duration-700 delay-150">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {tStreak("currentStreak")}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                      0
                    </p>
                    <p className="text-sm font-medium text-slate-600/80 dark:text-slate-400/80">
                      {tStreak("days")}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tStreak("cold")} ❄️
                  </p>
                </div>

                {/* Snowflake emoji */}
                <div className="text-4xl opacity-20 animate-pulse">❄️</div>
              </div>
            </div>
          )}

          {/* Streak Stats Grid - Dynamic columns */}
          {visibleStreakCards > 0 && (
            <div
              className={cn(
                "grid gap-3",
                visibleStreakCards === 1 ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              {/* Longest Streak - REDESIGNED */}
              {longestStreakDays > 0 && (
                <div
                  className={cn(
                    "relative overflow-hidden rounded-xl border-2 p-3",
                    "bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/15",
                    "border-amber-500/30",
                    "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300",
                    "hover:scale-105 hover:shadow-2xl transition-all duration-300",
                    "group cursor-default"
                  )}
                >
                  {/* Shimmering gold effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                  {/* Radial glow */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/30 rounded-full blur-2xl" />

                  <div className="relative space-y-2">
                    {/* Header with trophy */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-amber-500/50 rounded-lg blur-md animate-pulse" />
                          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-lg group-hover:rotate-12 transition-transform duration-300">
                            <IconTrophy
                              className="h-4 w-4 text-white"
                              strokeWidth={2.5}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                            {tStreak("record")}
                          </p>
                          <p className="text-[9px] text-amber-600/70 dark:text-amber-400/70">
                            {tStreak("longestStreak")}
                          </p>
                        </div>
                      </div>
                      <div className="text-xl animate-pulse">🏆</div>
                    </div>

                    {/* Number display */}
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-3xl font-black bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent">
                        {longestStreakDays}
                      </p>
                      <p className="text-xs font-bold text-amber-600/70 dark:text-amber-400/70">
                        {longestStreakDays > 1
                          ? tStreak("days")
                          : tStreak("day")}
                      </p>
                    </div>

                    {/* Achievement badge */}
                    <div className="flex items-center gap-1.5">
                      <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-500/50 to-amber-500/30" />
                      <span className="text-[9px] text-amber-600/60 dark:text-amber-400/60 font-medium">
                        Personal Best
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Merit Score Card - NEW */}
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl border-2 p-3",
                  `bg-gradient-to-br ${currentMeritConfig.gradient}`,
                  currentMeritConfig.border,
                  "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500",
                  "hover:scale-105 hover:shadow-xl transition-all duration-300",
                  "group cursor-default"
                )}
              >
                {/* Subtle pulse effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

                <div className="relative space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div
                          className={cn(
                            "absolute inset-0 rounded-lg blur-md animate-pulse",
                            `bg-gradient-to-br ${currentMeritConfig.iconBg} opacity-50`
                          )}
                        />
                        <div
                          className={cn(
                            "relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-lg",
                            currentMeritConfig.iconBg
                          )}
                        >
                          <MeritIcon
                            className="h-4 w-4 text-white"
                            strokeWidth={2.5}
                          />
                        </div>
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wide",
                            currentMeritConfig.textColor
                          )}
                        >
                          {tMerit("trustScore")}
                        </p>
                        <p
                          className={cn(
                            "text-[9px]",
                            currentMeritConfig.textColor,
                            "opacity-70"
                          )}
                        >
                          {currentMeritConfig.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-xl animate-pulse">
                      {currentMeritConfig.emoji}
                    </div>
                  </div>

                  {/* Merit score display */}
                  <div className="flex items-baseline gap-1.5">
                    <p
                      className={cn(
                        "text-3xl font-black",
                        currentMeritConfig.textColor
                      )}
                    >
                      {merit}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-bold opacity-70",
                        currentMeritConfig.textColor
                      )}
                    >
                      / 100
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-[10px] text-muted-foreground">
                    {currentMeritConfig.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
