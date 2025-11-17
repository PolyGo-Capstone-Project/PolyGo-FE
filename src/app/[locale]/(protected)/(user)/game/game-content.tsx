"use client";

import FiltersBar from "@/components/modules/game/filter-bar";
import HowToPlay from "@/components/modules/game/how-to-play";
import PuzzleCard from "@/components/modules/game/puzzle-card";
import WordPuzzleHeader from "@/components/modules/game/word-puzzle-header";
import { useWordsetsQuery } from "@/hooks";
import {
  GetWordsetsQueryType,
  WordsetDifficulty,
  WordsetListItemType,
} from "@/models";
import { SearchX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

/** ====== Helpers ====== */
const toCardLevel = (d?: string): "easy" | "medium" | "hard" =>
  (d ?? "Medium").toLowerCase() as "easy" | "medium" | "hard";

const toInitials = (name?: string) =>
  (name || "U")
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** ====== Adapter ====== */
const adaptWordsetToCard = (it: WordsetListItemType) => ({
  id: it.id,
  title: it.title,
  description: it.description ?? "",
  language: it.language?.code ?? "",
  languageLabel: it.language?.name ?? "",
  level: toCardLevel(it.difficulty),
  category: it.interest?.name ?? "",
  wordCount: it.wordCount ?? 0,
  estTimeMin: it.estimatedTimeInMinutes ?? 0,
  plays: it.playCount ?? 0,
  bestTimeSec: it.averageTimeInSeconds ?? undefined,
  creator: {
    name: it.creator?.name ?? "Unknown",
    initials: toInitials(it.creator?.name),
    avatarUrl: it.creator?.avatarUrl ?? undefined,
  },
});

export default function GameContent() {
  const locale = useLocale();
  const t = useTranslations();
  const [q, setQ] = useState("");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<"all" | WordsetDifficulty>(
    "all"
  );
  const [catFilter, setCatFilter] = useState<string>("all");

  const params: GetWordsetsQueryType = useMemo(
    () => ({
      lang: locale,
      name: q || undefined,
      languageIds: langFilter !== "all" ? [langFilter] : undefined,
      difficulty: levelFilter === "all" ? undefined : levelFilter,
      interestIds: catFilter !== "all" ? [catFilter] : undefined,
      pageNumber: 1,
      pageSize: 30,
    }),
    [locale, q, langFilter, levelFilter, catFilter]
  );

  const { data: res, isLoading } = useWordsetsQuery({ params });

  const puzzles = useMemo(() => {
    const items = (res?.payload?.data?.items ?? []) as WordsetListItemType[];
    return items.map(adaptWordsetToCard);
  }, [res]);

  const hasNoResult = !isLoading && puzzles.length === 0;

  const handleClearFilters = () => {
    setQ("");
    setLangFilter("all");
    setLevelFilter("all");
    setCatFilter("all");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <WordPuzzleHeader />
      <HowToPlay />

      <FiltersBar
        q={q}
        onQ={setQ}
        lang={langFilter}
        onLang={setLangFilter}
        level={levelFilter}
        onLevel={setLevelFilter}
        cat={catFilter}
        onCat={setCatFilter}
        onClear={handleClearFilters}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-lg border animate-pulse" />
          ))}
        </div>
      ) : hasNoResult ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
          <SearchX className="h-10 w-10 mb-1" />
          <p className="text-base font-medium">
            {t("wordPuzzle.noResultsTitle", {
              default: "Không tìm thấy bộ từ nào phù hợp.",
            })}
          </p>
          <p className="text-sm max-w-md">
            {t("wordPuzzle.noResultsDesc", {
              default:
                "Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để xem thêm các bộ từ khác nhé.",
            })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {puzzles.map((p) => (
            <PuzzleCard key={p.id} data={p} />
          ))}
        </div>
      )}
    </div>
  );
}
