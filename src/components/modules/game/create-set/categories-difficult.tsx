"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WordsetDifficulty } from "@/models";
import { Tag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { useInterestsQuery } from "@/hooks";

/* style cho badge */
const LEVEL_BADGE_STYLE: Record<"easy" | "medium" | "hard", string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

// helper estimate
const estimateMinutes = (vocabCount: number, difficulty: WordsetDifficulty) => {
  const base = 2,
    per = 1,
    diff = difficulty === "Easy" ? 0 : difficulty === "Medium" ? 2 : 4;
  return base + per * vocabCount + diff;
};

export default function CatDiff({
  categoryId,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  autoEstimate,
  onAutoEstimateChange,
  estimatedMin,
  onEstimatedMinChange,
  vocabCount,
}: {
  categoryId: string | null;
  onCategoryChange: (c: string) => void;
  difficulty: WordsetDifficulty;
  onDifficultyChange: (d: WordsetDifficulty) => void;
  autoEstimate: boolean;
  onAutoEstimateChange: (v: boolean) => void;
  estimatedMin: number;
  onEstimatedMinChange: (n: number) => void;
  vocabCount: number;
}) {
  const t = useTranslations();
  const locale = useLocale();

  const computedMin = useMemo(
    () => estimateMinutes(vocabCount, difficulty),
    [vocabCount, difficulty]
  );

  const { data: response } = useInterestsQuery({
    params: { pageNumber: 1, pageSize: 200, lang: locale },
  });

  const interests = response?.payload?.data?.items ?? [];
  const difficulties = Object.values(WordsetDifficulty);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Tag className="h-5 w-5" />
          {t("create.catDiff.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Category */}
        <div className="space-y-2">
          <Label>{t("create.catDiff.category")} *</Label>
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
            {interests.map((c) => {
              const active = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCategoryChange(c.id)}
                  className={[
                    "rounded-md border p-3 text-left transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    active
                      ? "bg-primary/10 border-primary"
                      : "bg-background hover:bg-accent",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <span>
                      <Tag className="h-4 w-4" />
                    </span>
                    <span className="font-medium line-clamp-1">
                      {t(`filters.wordset.category.${c.name}`, {
                        default: c.id,
                      })}
                    </span>
                  </div>
                  {/* có thể thêm hint i18n nếu muốn */}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-3">
          <Label>{t("create.catDiff.difficulty")} *</Label>
          <RadioGroup
            value={difficulty}
            onValueChange={(v) => onDifficultyChange(v as WordsetDifficulty)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          >
            {difficulties.map((d) => {
              const key = d.toLowerCase() as "easy" | "medium" | "hard";
              return (
                <Label
                  key={d}
                  htmlFor={`diff-${d}`}
                  className={[
                    "rounded-md border p-3 cursor-pointer",
                    "focus-within:ring-2 focus-within:ring-primary/40",
                    difficulty === d
                      ? "bg-primary/10 border-primary"
                      : "bg-background hover:bg-accent",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id={`diff-${d}`} value={d} />
                    <span className="font-medium">
                      {t(`filters.wordset.difficulty.${d}`, { default: d })}
                    </span>
                  </div>
                  <div>
                    <Badge
                      variant="secondary"
                      className={LEVEL_BADGE_STYLE[key]}
                    >
                      {t(`filters.wordset.difficulty.${d}`, { default: d })}
                    </Badge>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Estimated Time */}
        {/* <div className="grid gap-2">
          <Label htmlFor="time">{t("create.catDiff.estimate")}</Label>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative sm:w-56">
              <Input
                id="time"
                type="number"
                min={1}
                value={autoEstimate ? computedMin : estimatedMin}
                onChange={(e) =>
                  onEstimatedMinChange(Number(e.target.value || 1))
                }
                disabled={autoEstimate}
                className={autoEstimate ? "bg-muted/40" : ""}
              />
              <Timer className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                id="auto-estimate"
                checked={autoEstimate}
                onCheckedChange={onAutoEstimateChange}
              />
              <Label htmlFor="auto-estimate">
                {t("create.catDiff.autoEstimate", { minutes: computedMin })}
              </Label>
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
