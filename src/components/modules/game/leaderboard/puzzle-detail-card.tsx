"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

/** ---------------- Helper Row ---------------- */
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/** ---------------- Types + Helpers ---------------- */
type Difficulty = "easy" | "medium" | "hard";

type Details = {
  words: number;
  level: Difficulty;
  estTimeMin: number;
  plays: number;
  avgTimeSec: number;
};

const mmss = (s: number) => {
  const m = Math.floor(s / 60).toString();
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
};

/** ---------------- Main ---------------- */
export default function PuzzleDetailsCard({
  details,
  loading,
}: {
  details?: Details;
  loading?: boolean;
}) {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          {t("lb.details", { default: "Puzzle Details" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {loading ? (
          <div className="text-sm text-muted-foreground">
            {t("common.loading", { default: "Loading..." })}
          </div>
        ) : details ? (
          <>
            <Row
              label={t("lb.words", { default: "Words" })}
              value={details.words}
            />
            <Row
              label={t("lb.difficulty", { default: "Difficulty" })}
              value={details.level[0].toUpperCase() + details.level.slice(1)}
            />
            <Row
              label={t("lb.estTime", { default: "Estimated Time" })}
              value={`${details.estTimeMin} ${t("lb.min", { default: "min" })}`}
            />
            <Row
              label={t("lb.totalPlays", { default: "Total Plays" })}
              value={details.plays}
            />
            <Row
              label={t("lb.avgTime", { default: "Average Time" })}
              value={mmss(details.avgTimeSec)}
            />
          </>
        ) : (
          <div className="text-sm text-muted-foreground">—</div>
        )}
      </CardContent>
    </Card>
  );
}
