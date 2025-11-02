"use client";

import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function WordPuzzleHeader() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("wordPuzzle.title", { default: "Word Puzzle Games" })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("wordPuzzle.subtitle", {
            default:
              "Challenge yourself with vocabulary puzzles and compete with others",
          })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}/game/my-sets`)}
          className="gap-2"
        >
          <Star className="h-4 w-4" />
          {t("wordPuzzle.mySets", { default: "My Puzzle Sets" })}
        </Button>
        <Button
          onClick={() => router.push(`/${locale}/game/create-set`)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("wordPuzzle.createSet", { default: "Create Puzzle Set" })}
        </Button>
      </div>
    </div>
  );
}
