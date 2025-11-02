"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

type Best = {
  timeSec: number;
  rankStr: string;
  score: number;
  mistakes: number;
  hints: number;
};

const DEFAULT_BEST: Best = {
  timeSec: 145,
  rankStr: "#1 of 2",
  score: 98,
  mistakes: 0,
  hints: 0,
};

const mmss = (s: number) => {
  const m = Math.floor(s / 60).toString();
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
};

export default function YourBestCard({ best }: { best?: Best }) {
  const t = useTranslations();
  const b = best ?? DEFAULT_BEST;

  return (
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
        <div className="text-2xl font-bold">{mmss(b.timeSec)}</div>
        <div className="text-xs text-muted-foreground">
          {t("lb.rankOf", { default: "Rank" })} {b.rankStr}
        </div>
        <Separator className="my-2" />
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>☆ {b.score}</span>
          <span>Ⓧ {b.mistakes}</span>
          <span>💡 {b.hints}</span>
        </div>
      </CardContent>
    </Card>
  );
}
