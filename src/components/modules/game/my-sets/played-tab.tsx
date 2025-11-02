"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

/* ==================== Types & Mock API (chỉ dùng trong PlayedTab) ==================== */
type Difficulty = "easy" | "medium" | "hard";
type Creator = { name: string; avatarUrl?: string; initials: string };

type BaseSet = {
  id: string;
  title: string;
  description: string;
  language: string;
  languageLabel: string;
  category: string;
  level: Difficulty;
  wordCount: number;
  estTimeMin: number;
  plays: number;
};

type PlayedItem = BaseSet & {
  creator: Creator;
  lastPlayedAgo: string;
  bestTimeSec?: number;
  rankStr?: string;
  completions: number;
};

async function fetchPlayedHistory(): Promise<{
  summary: {
    setsPlayed: number;
    completions: number;
    bestRank: string;
    avgRank: string;
  };
  items: PlayedItem[];
}> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    summary: { setsPlayed: 2, completions: 3, bestRank: "#3", avgRank: "#5.0" },
    items: [
      {
        id: "fr-cinema",
        title: "French Cinema Vocabulary",
        description: "Essential terms for discussing French films and cinema",
        language: "fr",
        languageLabel: "French",
        category: "culture",
        level: "medium",
        wordCount: 5,
        estTimeMin: 12,
        plays: 89,
        creator: {
          name: "AnnaFR",
          initials: "AF",
          avatarUrl: "https://i.pravatar.cc/150?img=32",
        },
        lastPlayedAgo: "2d ago",
        bestTimeSec: 145,
        rankStr: "#3 of 15",
        completions: 2,
      },
      {
        id: "en-business",
        title: "Business English Essentials",
        description: "Key vocabulary for professional English communication",
        language: "en",
        languageLabel: "English",
        category: "business",
        level: "hard",
        wordCount: 5,
        estTimeMin: 15,
        plays: 234,
        creator: {
          name: "JohnEN",
          initials: "JE",
          avatarUrl: "https://i.pravatar.cc/150?img=53",
        },
        lastPlayedAgo: "5d ago",
        bestTimeSec: 320,
        rankStr: "#7 of 23",
        completions: 1,
      },
    ],
  };
}

const LEVEL_BADGE_STYLE: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function secondsToMMSS(s?: number) {
  if (s == null) return "-";
  const m = Math.floor(s / 60).toString();
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
}

/* ==================== UI ==================== */
export default function PlayedTab() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [data, setData] =
    useState<Awaited<ReturnType<typeof fetchPlayedHistory>>>();

  useEffect(() => {
    fetchPlayedHistory().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const playedCount = data?.items.length ?? 0;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title={t("played.setsPlayed", { default: "Sets Played" })}
          value={data?.summary.setsPlayed ?? 0}
          Icon={BookOpen}
          color="text-blue-600"
        />
        <StatCard
          title={t("played.completions", { default: "Completions" })}
          value={data?.summary.completions ?? 0}
          Icon={Trophy}
          color="text-emerald-600"
        />
        <StatCard
          title={t("played.bestRank", { default: "Best Rank" })}
          value={data?.summary.bestRank ?? "#-"}
          Icon={Star}
          color="text-yellow-600"
        />
        <StatCard
          title={t("played.avgRank", { default: "Avg Rank" })}
          value={data?.summary.avgRank ?? "#-"}
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
          <Badge variant="secondary">{playedCount} sets</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <ListSkeleton />
          ) : data?.items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t("mysets.noPlayedSets", {
                default: "You haven't played any puzzle sets yet.",
              })}
            </div>
          ) : (
            data?.items.map((it) => (
              <div
                key={it.id}
                className="rounded-lg border p-4 md:p-5 bg-card hover:bg-accent/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  {/* left */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {it.creator.avatarUrl ? (
                          <AvatarImage
                            src={it.creator.avatarUrl}
                            alt={it.creator.name}
                          />
                        ) : (
                          <AvatarFallback>{it.creator.initials}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{it.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {t("played.createdBy", { default: "Created by" })}{" "}
                          {it.creator.name}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarClock className="h-4 w-4" />
                        {t("played.lastPlayed", {
                          default: "Last played",
                        })}
                        : {it.lastPlayedAgo}
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {t("played.rank", { default: "Rank" })}:{" "}
                        {it.rankStr ?? "#-"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {t("played.best", { default: "Best" })}:{" "}
                        {secondsToMMSS(it.bestTimeSec)}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">{it.languageLabel}</Badge>
                      <Badge variant="outline">{it.category}</Badge>
                      <Badge
                        className={LEVEL_BADGE_STYLE[it.level]}
                        variant="secondary"
                      >
                        {it.level}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      >
                        {it.completions}{" "}
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

/* ==================== Small components (cục bộ) ==================== */
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
