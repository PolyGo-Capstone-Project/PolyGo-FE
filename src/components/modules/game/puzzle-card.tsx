"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Circle, Clock, Flag, Play, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type Creator = { name: string; avatarUrl?: string; initials: string };
export type PuzzleCardData = {
  id: string;
  title: string;
  description: string;
  languageLabel: string;
  level: "easy" | "medium" | "hard";
  category: string;
  wordCount: number;
  estTimeMin: number;
  plays: number;
  bestTimeSec?: number;
  creator: Creator;
};

const LEVEL_BADGE_STYLE: Record<PuzzleCardData["level"], string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function secondsToMMSS(s?: number) {
  if (!s && s !== 0) return undefined;
  const m = Math.floor(s / 60)
    .toString()
    .padStart(1, "0");
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
}

export default function PuzzleCard({ data: p }: { data: PuzzleCardData }) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base md:text-lg line-clamp-1">
          {p.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 text-sm">
        <p className="text-muted-foreground line-clamp-2 h-10">
          {p.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <Circle className="h-3 w-3 text-blue-500" />
            {p.languageLabel}
          </Badge>
          <Badge className={LEVEL_BADGE_STYLE[p.level]} variant="secondary">
            {p.level}
          </Badge>
          <Badge variant="outline">{p.category}</Badge>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1" title="Words">
            <BookOpen className="h-4 w-4" />
            <span>
              {p.wordCount} {t("meta.words", { default: "words" })}
            </span>
          </div>
          <div className="flex items-center gap-1" title="Estimated time">
            <Clock className="h-4 w-4" />
            <span>~{p.estTimeMin}min</span>
          </div>
          <div className="flex items-center gap-1" title="Total plays">
            <Play className="h-4 w-4" />
            <span>
              {p.plays} {t("meta.plays", { default: "plays" })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {p.creator.avatarUrl ? (
              <AvatarImage src={p.creator.avatarUrl} alt={p.creator.name} />
            ) : (
              <AvatarFallback>{p.creator.initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="text-sm">
            <div className="font-medium leading-none">{p.creator.name}</div>
            {p.bestTimeSec !== undefined && (
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Flag className="h-3 w-3" />
                <span>
                  {t("meta.bestTime", { default: "Best time:" })}{" "}
                  {secondsToMMSS(p.bestTimeSec)}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1 gap-2"
            onClick={() => router.push(`/${locale}/game/${p.id}/play`)}
          >
            <Play className="h-4 w-4" />
            {t("actions.playNow", { default: "Play Now" })}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => router.push(`/${locale}/game/${p.id}/leaderboard`)}
          >
            <Trophy className="h-4 w-4" />
            {t("actions.leaderboard", { default: "Leaderboard" })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
