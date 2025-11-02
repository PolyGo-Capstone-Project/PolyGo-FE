// src/components/modules/game/leaderboard/PuzzleDetailsCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

/** ---------------- Helper Component: Row ---------------- */
// Tách biệt helper Row khỏi component chính nhưng nằm trong cùng file
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/** ---------------- Types + Helpers (for PuzzleDetailsCard) ---------------- */
type Difficulty = "easy" | "medium" | "hard";

type Details = {
  words: number;
  level: Difficulty;
  estTimeMin: number;
  plays: number;
  avgTimeSec: number;
};

const DEFAULT_DETAILS: Details = {
  words: 5,
  level: "medium",
  estTimeMin: 12,
  plays: 89,
  avgTimeSec: 400,
};

// Chuyển đổi giây sang định dạng m:ss
const mmss = (s: number) => {
  const m = Math.floor(s / 60).toString();
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
};

/** ---------------- Main Component: PuzzleDetailsCard ---------------- */
export default function PuzzleDetailsCard({ details }: { details?: Details }) {
  const t = useTranslations();
  const d = details ?? DEFAULT_DETAILS;

  // Hàm chuyển đổi 'easy'/'medium'/'hard' thành 'Easy'/'Medium'/'Hard'
  const formatDifficulty = (level: Difficulty) => {
    return level[0].toUpperCase() + level.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          {t("lb.details", { default: "Puzzle Details" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label={t("lb.words", { default: "Words" })} value={d.words} />
        <Row
          label={t("lb.difficulty", { default: "Difficulty" })}
          value={formatDifficulty(d.level)}
        />
        <Row
          label={t("lb.estTime", { default: "Estimated Time" })}
          value={`${d.estTimeMin} ${t("lb.min", { default: "min" })}`}
        />
        <Row
          label={t("lb.totalPlays", { default: "Total Plays" })}
          value={d.plays}
        />
        <Row
          label={t("lb.avgTime", { default: "Average Time" })}
          value={mmss(d.avgTimeSec)}
        />
      </CardContent>
    </Card>
  );
}
