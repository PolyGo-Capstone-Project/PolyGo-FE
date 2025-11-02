"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tag, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

/* ===== types & mock data chỉ dùng ở CatDiff ===== */
type Difficulty = "easy" | "medium" | "hard";
type CategoryOption = { id: string; label: string; hint?: string };

const CATEGORIES: CategoryOption[] = [
  { id: "food", label: "Food & Cooking", hint: "Culinary vocabulary" },
  { id: "travel", label: "Travel & Places", hint: "Tourism and geography" },
  { id: "business", label: "Business & Work", hint: "Professional vocabulary" },
  { id: "technology", label: "Technology", hint: "Tech and digital terms" },
  { id: "culture", label: "Culture & Arts", hint: "Culture and art" },
  { id: "daily", label: "Daily Life", hint: "Everyday vocabulary" },
  { id: "education", label: "Education", hint: "Academic terms" },
  { id: "health", label: "Health & Body", hint: "Medical vocabulary" },
];

const LEVEL_BADGE_STYLE: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

// local helper (CatDiff tự tính thời gian)
const estimateMinutes = (vocabCount: number, difficulty: Difficulty) => {
  const base = 2,
    per = 1,
    diff = difficulty === "easy" ? 0 : difficulty === "medium" ? 2 : 4;
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
  onCategoryChange: (id: string) => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  autoEstimate: boolean;
  onAutoEstimateChange: (v: boolean) => void;
  estimatedMin: number;
  onEstimatedMinChange: (n: number) => void;
  vocabCount: number;
}) {
  const t = useTranslations();
  const computedMin = useMemo(
    () => estimateMinutes(vocabCount, difficulty),
    [vocabCount, difficulty]
  );

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
            {CATEGORIES.map((c) => {
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
                    <span className="font-medium line-clamp-1">{c.label}</span>
                  </div>
                  {c.hint && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {c.hint}
                    </div>
                  )}
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
            onValueChange={(v) => onDifficultyChange(v as Difficulty)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          >
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
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
                    {t(`create.catDiff.level.${d}`)}
                  </span>
                </div>
                <div>
                  <Badge variant="secondary" className={LEVEL_BADGE_STYLE[d]}>
                    {t(`create.catDiff.level.${d}`)}
                  </Badge>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Estimated Time */}
        <div className="grid gap-2">
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
        </div>
      </CardContent>
    </Card>
  );
}
