"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type Summary = {
  id: string;
  title: string;
  languageLabel: string;
  category: string;
  level: "easy" | "medium" | "hard";
};

const DEFAULT_SUMMARY: Summary = {
  id: "fr-cinema",
  title: "French Cinema Vocabulary",
  languageLabel: "French",
  category: "culture",
  level: "medium",
};

export default function LeaderboardHeader({ summary }: { summary?: Summary }) {
  const data = summary ?? DEFAULT_SUMMARY;
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("lb.title", { default: "Leaderboard" })}
        </h1>
        <div className="text-muted-foreground">{data.title}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary">{data.languageLabel}</Badge>
          <Badge variant="outline">{data.category}</Badge>
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            {data.level}
          </Badge>
        </div>
      </div>

      <Button
        className="gap-2 w-full sm:w-auto"
        onClick={() => router.push(`/${locale}/game/${data.id}/play`)}
      >
        <Play className="h-4 w-4" />
        {t("lb.playNow", { default: "Play Now" })}
      </Button>
    </div>
  );
}
