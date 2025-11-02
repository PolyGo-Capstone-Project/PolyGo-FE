"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

// shadcn/ui
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// icons
import { Medal, Play, Star, Trophy } from "lucide-react";

/** ---------------- Types + Mock inside component ---------------- */
type LeaderRow = {
  id: string;
  name: string;
  avatar?: string;
  timeSec: number;
  isYou?: boolean;
  score: number;
  mistakes: number;
  hints: number;
  lastPlayedAgo: string;
};

type PuzzleSummary = {
  id: string;
  title: string;
  languageLabel: string;
  category: string;
  level: "easy" | "medium" | "hard";
  words: number;
  estTimeMin: number;
  plays: number;
  avgTimeSec: number;
  creator: { name: string; avatar?: string; joinedAt: string; rating: number };
  yourBest?: {
    timeSec: number;
    rankStr: string;
    score: number;
    mistakes: number;
    hints: number;
  };
};

function mmss(s: number) {
  const m = Math.floor(s / 60).toString();
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
}

/** ---------------- Page ---------------- */
export default function LeaderboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  // === Mock ===
  const SUMMARY: PuzzleSummary = useMemo(
    () => ({
      id: "fr-cinema",
      title: "French Cinema Vocabulary",
      languageLabel: "French",
      category: "culture",
      level: "medium",
      words: 5,
      estTimeMin: 12,
      plays: 89,
      avgTimeSec: 400, // 6:40
      creator: {
        name: "AnnaFR",
        avatar: "https://i.pravatar.cc/150?img=32",
        joinedAt: "12/10/2025",
        rating: 4.9,
      },
      yourBest: {
        timeSec: 145,
        rankStr: "#1 of 2",
        score: 98,
        mistakes: 0,
        hints: 0,
      },
    }),
    []
  );

  const LEADERS: LeaderRow[] = useMemo(
    () => [
      {
        id: "1",
        name: "NguyenMinh",
        avatar: "https://i.pravatar.cc/150?img=5",
        timeSec: 145,
        isYou: true,
        score: 98,
        mistakes: 0,
        hints: 0,
        lastPlayedAgo: "2d ago",
      },
      {
        id: "2",
        name: "JohnEN",
        avatar: "https://i.pravatar.cc/150?img=53",
        timeSec: 190,
        score: 85,
        mistakes: 2,
        hints: 1,
        lastPlayedAgo: "4d ago",
      },
    ],
    []
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("lb.title", { default: "Leaderboard" })}
          </h1>
          <div className="text-muted-foreground">{SUMMARY.title}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{SUMMARY.languageLabel}</Badge>
            <Badge variant="outline">{SUMMARY.category}</Badge>
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              {SUMMARY.level}
            </Badge>
          </div>
        </div>
        <Button
          className="gap-2 w-full sm:w-auto"
          onClick={() => router.push(`/${locale}/game/${SUMMARY.id}/play`)}
        >
          <Play className="h-4 w-4" />
          {t("lb.playNow", { default: "Play Now" })}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Top players */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base md:text-lg">
              {t("lb.topPlayers", { default: "Top Players" })}
            </CardTitle>
            <Select defaultValue="all">
              <SelectTrigger className="w-36">
                <SelectValue
                  placeholder={t("lb.range", { default: "All Time" })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("lb.rangeAll", { default: "All Time" })}
                </SelectItem>
                <SelectItem value="week">
                  {t("lb.rangeWeek", { default: "This Week" })}
                </SelectItem>
                <SelectItem value="month">
                  {t("lb.rangeMonth", { default: "This Month" })}
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-3">
            {LEADERS.map((row, i) => (
              <div
                key={row.id}
                className={`rounded-lg border p-4 flex items-center justify-between gap-3 ${row.isYou ? "bg-amber-50 dark:bg-amber-950/30" : "bg-card"}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    {i === 0 ? (
                      <Medal className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Medal className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <Avatar className="h-8 w-8">
                    {row.avatar ? (
                      <AvatarImage src={row.avatar} alt={row.name} />
                    ) : (
                      <AvatarFallback>{row.name.slice(0, 2)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {row.name}{" "}
                      {row.isYou && (
                        <Badge className="ml-1" variant="secondary">
                          {t("lb.you", { default: "You" })}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.lastPlayedAgo}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm hidden sm:flex gap-3 text-muted-foreground">
                    <span>☆ {row.score}</span>
                    <span>Ⓧ {row.mistakes}</span>
                    <span>💡 {row.hints}</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {mmss(row.timeSec)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right: details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                {t("lb.details", { default: "Puzzle Details" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row
                label={t("lb.words", { default: "Words" })}
                value={SUMMARY.words}
              />
              <Row
                label={t("lb.difficulty", { default: "Difficulty" })}
                value={SUMMARY.level[0].toUpperCase() + SUMMARY.level.slice(1)}
              />
              <Row
                label={t("lb.estTime", { default: "Estimated Time" })}
                value={`${SUMMARY.estTimeMin} ${t("lb.min", { default: "min" })}`}
              />
              <Row
                label={t("lb.totalPlays", { default: "Total Plays" })}
                value={SUMMARY.plays}
              />
              <Row
                label={t("lb.avgTime", { default: "Average Time" })}
                value={mmss(SUMMARY.avgTimeSec)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                {t("lb.yourBest", { default: "Your Best Score" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="text-2xl font-bold">
                {mmss(SUMMARY.yourBest?.timeSec ?? 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("lb.rankOf", { default: "Rank" })}{" "}
                {SUMMARY.yourBest?.rankStr ?? "-"}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                <span>☆ {SUMMARY.yourBest?.score ?? 0}</span>
                <span>Ⓧ {SUMMARY.yourBest?.mistakes ?? 0}</span>
                <span>💡 {SUMMARY.yourBest?.hints ?? 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                {t("lb.creator", { default: "Created By" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {SUMMARY.creator.avatar ? (
                    <AvatarImage
                      src={SUMMARY.creator.avatar}
                      alt={SUMMARY.creator.name}
                    />
                  ) : (
                    <AvatarFallback>
                      {SUMMARY.creator.name.slice(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{SUMMARY.creator.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {SUMMARY.creator.joinedAt} •{" "}
                    <Star className="inline h-3 w-3 -mt-0.5" />{" "}
                    {SUMMARY.creator.rating}{" "}
                    {t("lb.rating", { default: "rating" })}
                  </div>
                </div>
              </div>
              <Button className="w-full">
                {t("lb.messageCreator", { default: "Message Creator" })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
