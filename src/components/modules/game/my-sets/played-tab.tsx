"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  BarChart3,
  BookOpen,
  CalendarClock,
  Clock,
  Star,
  Swords,
  Trophy,
} from "lucide-react";

import { useInterestsQuery } from "@/hooks";
import { useMyPlayedWordsetsQuery } from "@/hooks/query/use-wordset";

/* ==================== Helpers ==================== */
type UiDifficulty = "easy" | "medium" | "hard";

const LEVEL_BADGE_STYLE: Record<UiDifficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function toUiLevel(d?: string): UiDifficulty {
  switch ((d || "").toLowerCase()) {
    case "easy":
      return "easy";
    case "hard":
      return "hard";
    default:
      return "medium";
  }
}

function secondsToMMSS(s?: number) {
  if (s == null) return "-";
  const m = Math.floor(s / 60).toString();
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
}

function timeAgo(iso?: string): string {
  if (!iso) return "-";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(1, Math.floor((now - then) / 1000));
  const mins = Math.floor(diffSec / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return `${diffSec}s ago`;
}

/* ==================== UI ==================== */
export default function PlayedTab() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  // Call real API
  const { data, isLoading, isError, refetch } = useMyPlayedWordsetsQuery({
    lang: locale,
    pageNumber: 1,
    pageSize: 50,
  });

  // Lấy master interests
  const { data: interestsData } = useInterestsQuery({
    params: { pageNumber: 1, pageSize: 200, lang: locale },
  });

  const interests = interestsData?.payload?.data?.items ?? [];

  const interestMap = useMemo(() => {
    const m = new Map<string, any>();
    interests.forEach((it: any) => {
      if (it?.id) m.set(it.id, it);
    });
    return m;
  }, [interests]);

  const memoItems = useMemo(() => data?.data?.items ?? [], [data?.data?.items]);
  const totalItems = data?.data?.totalItems ?? memoItems.length;

  // Stats derived from API
  const totals = useMemo(() => {
    const plays = memoItems.reduce(
      (acc, it: any) => acc + (it.playCount ?? 0),
      0
    );
    const bestScores = memoItems.map((it: any) => it.bestScore ?? 0);
    const bestScore =
      bestScores.length > 0 ? Math.max(...bestScores) : undefined;
    const avgBestScore =
      bestScores.length > 0
        ? (bestScores.reduce((a, b) => a + b, 0) / bestScores.length).toFixed(1)
        : undefined;
    return { plays, bestScore, avgBestScore };
  }, [memoItems]);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title={t("played.setsPlayed", { default: "Sets Played" })}
          value={totalItems}
          Icon={BookOpen}
          color="text-blue-600"
        />
        <StatCard
          title={t("played.completions", { default: "Completions" })}
          value={totals.plays}
          Icon={Trophy}
          color="text-emerald-600"
        />
        <StatCard
          title={t("played.bestScore", { default: "Best Score" })}
          value={totals.bestScore ?? "-"}
          Icon={Star}
          color="text-yellow-600"
        />
        <StatCard
          title={t("played.avgBestScore", { default: "Avg. Best Score" })}
          value={totals.avgBestScore ?? "-"}
          Icon={BarChart3}
          color="text-purple-600"
        />
      </div>

      {/* List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">
            {t("played.section.history", { default: "Game History" })}
          </CardTitle>
          <Badge variant="secondary">{memoItems.length} sets</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <ListSkeleton />
          ) : isError ? (
            <div className="text-center text-muted-foreground py-8">
              {t("Error.common", { default: "Something went wrong." })}{" "}
              <Button variant="link" onClick={() => refetch()}>
                {t("actions.retry", { default: "Retry" })}
              </Button>
            </div>
          ) : memoItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t("mysets.noPlayedSets", {
                default: "You haven't played any puzzle sets yet.",
              })}
            </div>
          ) : (
            memoItems.map((it: any) => (
              <div
                key={it.id}
                className="rounded-lg border p-4 md:p-5 bg-card hover:bg-accent/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  {/* left */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {it.creator?.avatarUrl ? (
                          <AvatarImage
                            src={it.creator.avatarUrl}
                            alt={it.creator?.name ?? "creator"}
                          />
                        ) : (
                          <AvatarFallback>
                            {(it.creator?.name ?? "?")
                              .split(" ")
                              .map((w: string) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{it.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {t("played.createdBy", { default: "Created by" })}{" "}
                          {it.creator?.name ?? "-"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarClock className="h-4 w-4" />
                        {t("played.lastPlayed", {
                          default: "Last played",
                        })}
                        : {timeAgo(it.lastPlayed)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {t("played.bestRank", { default: "Best Score" })}:{" "}
                        {it.bestScore ?? "-"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {t("played.best", { default: "Best" })}:{" "}
                        {secondsToMMSS(it.bestTime)}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {(() => {
                          const interest = interestMap.get(
                            it.interestId ?? it.interest?.id ?? ""
                          );
                          return interest?.name ?? it.category ?? "-";
                        })()}
                      </Badge>
                      <Badge
                        className={LEVEL_BADGE_STYLE[toUiLevel(it.difficulty)]}
                        variant="secondary"
                      >
                        {toUiLevel(it.difficulty)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      >
                        {it.playCount}{" "}
                        {t("played.completions2", { default: "completions" })}
                      </Badge>
                    </div>
                  </div>

                  {/* right */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0 md:pt-1 md:flex-row md:items-start md:justify-end">
                    <Button
                      className="gap-2 h-9 px-3 w-full sm:w-auto"
                      onClick={() =>
                        router.push(`/${locale}/game/${it.id}/play`)
                      }
                    >
                      <Swords className="h-4 w-4" />
                      {t("actions.playAgain", { default: "Play Again" })}
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 h-9 px-3 w-full sm:w-auto"
                      onClick={() =>
                        router.push(`/${locale}/game/${it.id}/leaderboard`)
                      }
                    >
                      <Trophy className="h-4 w-4" />
                      {t("actions.leaderboard", { default: "Leaderboard" })}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}

/* ==================== Small components ==================== */
function StatCard({
  title,
  value,
  Icon,
  color,
}: {
  title: string;
  value: string | number;
  Icon: any;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4 flex items-center justify-between">
        <div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {title}
          </div>
          <div className="text-lg sm:text-xl font-semibold mt-1">{value}</div>
        </div>
        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color ?? ""}`} />
      </CardContent>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
