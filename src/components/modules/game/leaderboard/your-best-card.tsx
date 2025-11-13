"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMyBestWordsetScoreQuery } from "@/hooks";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

const mmss = (s: number) => {
  const m = Math.floor(s / 60).toString();
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
};

export default function YourBestCard({
  wordsetId,
  lang = "vi",
}: {
  wordsetId?: string;
  lang?: string;
}) {
  const t = useTranslations();

  const { data, isLoading } = useMyBestWordsetScoreQuery(
    wordsetId,
    { lang },
    { enabled: Boolean(wordsetId) }
  );

  const best = data?.data;

  const hasPlayed = best?.hasPlayed ?? false;
  const timeSec = best?.completionTimeInSecs ?? 0;
  const score = best?.score ?? 0;
  const mistakes = best?.mistakes ?? 0;
  const hints = best?.hintsUsed ?? 0;
  const rankStr =
    hasPlayed && best?.rank != null && best?.totalPlayers != null
      ? `#${best.rank} of ${best.totalPlayers}`
      : t("lb.noRank", { default: "—" });

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

        {isLoading ? (
          <div className="text-sm text-muted-foreground">
            {t("common.loading", { default: "Loading..." })}
          </div>
        ) : hasPlayed ? (
          <>
            <div className="text-2xl font-bold">{mmss(timeSec)}</div>
            <div className="text-xs text-muted-foreground">
              {t("lb.rankOf", { default: "Rank" })} {rankStr}
            </div>
            <Separator className="my-2" />
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <span>☆ {score}</span>
              <span>Ⓧ {mistakes}</span>
              <span>💡 {hints}</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {t("lb.noBestYet", {
                default: "You haven't played this puzzle yet.",
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
