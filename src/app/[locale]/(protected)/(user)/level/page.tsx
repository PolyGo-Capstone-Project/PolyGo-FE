"use client";

import { CheckCircle2, Gift, Lock, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthMe, useClaimLevelMutation, useUserLevelsQuery } from "@/hooks";

import { LoadingSpinner } from "@/components";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { PaginationLangQueryType } from "@/models";
import { useRouter } from "next/navigation";

const buildParams = (lang: string): PaginationLangQueryType => ({
  lang,
  pageNumber: -1,
  pageSize: -1,
});

type LevelState = "locked" | "claimable" | "claimed";

const getLevelState = (
  levelOrder: number,
  isClaimed: boolean | undefined,
  currentLevel: number
): LevelState => {
  if (levelOrder > currentLevel) return "locked";
  if (isClaimed) return "claimed";
  return "claimable";
};

export default function LevelsPage() {
  const t = useTranslations("levels");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const router = useRouter();
  const locale = useLocale();
  const lang = useMemo(() => (locale ? locale.split("-")[0] : "en"), [locale]);

  // Lấy thông tin user (level, XP, ...)
  const { data: authData, isLoading: isLoadingAuth } = useAuthMe();
  const user = authData?.payload?.data;

  // Lấy danh sách level của user (có isClaimed)
  const { data: userLevelsData, isLoading: isLoadingLevels } =
    useUserLevelsQuery({
      params: buildParams(lang),
    });

  const levels =
    userLevelsData?.payload?.data?.items?.sort((a, b) => a.order - b.order) ??
    [];

  const currentLevel = user?.level ?? 1;
  const xpInCurrentLevel = user?.xpInCurrentLevel ?? 0;
  const xpToNextLevel = user?.xpToNextLevel ?? 0;
  const totalXp = user?.experiencePoints ?? 0;

  const isMaxLevel = currentLevel >= 7 || xpToNextLevel <= 0;
  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, (xpInCurrentLevel / xpToNextLevel) * 100);

  const paramsForMutation = buildParams(lang);

  const claimMutation = useClaimLevelMutation(paramsForMutation, {
    onSuccess: (res) => {
      showSuccessToast(res?.payload?.message ?? "Claimed", tSuccess);
    },
  });

  const handleClaim = (order: number) => {
    if (claimMutation.isPending) return;
    claimMutation.mutate(order, {
      onError: () => {
        showErrorToast("Claim", tError);
      },
    });
  };

  if (isLoadingAuth || isLoadingLevels) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">
          {t("errors.loadUserFailed", { default: "Failed to load user data" })}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-8xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {t("title", { default: "Level & Rewards" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", {
              default:
                "Track your level progress and claim rewards when you level up.",
            })}
          </p>
        </div>

        {/* Nút quay về Profile */}
        <Button
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium md:text-sm"
          onClick={() => router.push(`/${locale || "en"}/profile`)}
        >
          {t("backToProfile", { default: "Back to profile" })}
        </Button>
      </div>

      {/* XP Summary + Progress */}
      <Card className="border-primary/10 bg-primary/5">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("xpSummary.title", { default: "Your Progress" })}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {t("xpSummary.description", {
                default:
                  "Earn XP by joining sessions, events, and contributing to the community.",
              })}
            </p>
          </div>

          {/* Level hiện tại + tổng XP nổi bật hơn */}
          <div className="flex flex-col items-end gap-2 text-right">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
              <span className="rounded-full bg-primary px-4 py-1.5 text-s font-bold text-primary-foreground md:text-sm">
                Level {currentLevel}
              </span>
            </div>
            {/* <span className="text-sm font-semibold md:text-base">
              {t("xpSummary.totalXp", {
                default: "Total XP",
              })}
              :{" "}
              <span className="text-primary">
                {new Intl.NumberFormat(locale || "en-US").format(totalXp)} XP
              </span>
            </span> */}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Level labels 2 bên */}
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground md:text-sm">
            <span>
              {t("xpSummary.levelLabel", { default: "Level" })} {currentLevel}
            </span>
            <span>
              {isMaxLevel
                ? t("xpSummary.maxLevel", { default: "Max level" })
                : t("xpSummary.levelLabel", { default: "Level" }) +
                  " " +
                  (currentLevel + 1)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted md:h-3.5">
            {/* Thanh fill */}
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* XP text ở dưới + giữa */}
          {!isMaxLevel && (
            <div className="flex w-full justify-center text-[11px] font-semibold text-primary md:text-sm">
              {xpInCurrentLevel} / {xpToNextLevel} XP
            </div>
          )}

          {/* Note khi max level */}
          {isMaxLevel && (
            <div className="flex items-center justify-center text-xs text-muted-foreground md:text-sm">
              {t("xpSummary.maxLevelReached", {
                default: "You have reached the maximum level.",
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Levels list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold md:text-xl">
          {t("levelsList.title", { default: "Level Rewards" })}
        </h2>

        {/* Hàng ngang scrollable, ẩn scrollbar, card to & cao hơn */}
        <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
          {levels.map((level) => {
            const state = getLevelState(
              level.order,
              level.isClaimed,
              currentLevel
            );

            const baseCardClasses =
              "flex min-w-[300px] max-w-[360px] min-h-[260px] sm:min-h-[300px] flex-shrink-0 flex-col justify-between rounded-2xl border p-6 sm:p-7 transition-shadow";

            const stateClasses =
              state === "locked"
                ? "border-border bg-muted/30 opacity-70"
                : state === "claimed"
                  ? "border-emerald-200/60 bg-emerald-50/40 shadow-sm shadow-emerald-200/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                  : "border-primary/70 bg-primary/10 shadow-lg shadow-primary/30";

            const headerAccentClasses =
              state === "locked"
                ? "bg-muted text-muted-foreground"
                : state === "claimed"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-100"
                  : "bg-primary text-primary-foreground";

            const showClaimButton = state === "claimable";
            const showLocked = state === "locked";
            const showClaimed = state === "claimed";

            return (
              <div
                key={level.id}
                className={baseCardClasses + " " + stateClasses}
              >
                {/* Top section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={
                        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold md:text-sm " +
                        headerAccentClasses
                      }
                    >
                      <span>
                        {t("levelBadge", {
                          default: "Level {order}",
                          order: level.order,
                        })}
                      </span>
                    </div>

                    {showLocked ? (
                      <div className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground md:text-xs">
                        <Lock className="h-4 w-4" />
                        <span>{t("status.locked", { default: "Locked" })}</span>
                      </div>
                    ) : showClaimed ? (
                      <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-100 md:text-xs">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {t("status.claimed", { default: "Claimed" })}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground md:text-xs">
                        <Gift className="h-4 w-4" />
                        <span>
                          {t("status.readyToClaim", {
                            default: "Ready to claim",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Required XP */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("requiredXp.label", { default: "Required XP" })}
                    </p>
                    <p className="text-base font-semibold md:text-lg">
                      {new Intl.NumberFormat(locale || "en-US").format(
                        level.requiredXP
                      )}{" "}
                      XP
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground md:text-base">
                    {level.description}
                  </p>
                </div>

                {/* CTA section */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                  <div className="text-[11px] text-muted-foreground md:text-xs">
                    {level.order <= currentLevel ? (
                      <span>
                        {t("status.reached", {
                          default: "You reached this level",
                        })}
                      </span>
                    ) : (
                      <span>
                        {t("status.needMoreXp", {
                          default: "Keep earning XP to unlock this level",
                        })}
                      </span>
                    )}
                  </div>

                  {showClaimButton ? (
                    <Button
                      size="lg"
                      className="relative inline-flex items-center gap-2 rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-wide md:px-7 md:py-2.5 md:text-sm"
                      onClick={() => handleClaim(level.order)}
                      disabled={claimMutation.isPending}
                    >
                      <span className="absolute inset-0 rounded-full bg-primary/30 blur-sm" />
                      <span className="relative inline-flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        {t("actions.claim", { default: "Claim" })}
                      </span>
                    </Button>
                  ) : showLocked ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground md:text-xs">
                      <Lock className="h-3.5 w-3.5" />
                      <span>
                        {t("status.lockedShort", { default: "Locked" })}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100 md:text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        {t("status.claimedShort", { default: "Claimed" })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
