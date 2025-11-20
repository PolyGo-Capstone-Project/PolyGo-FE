"use client";

import FiltersBar from "@/components/modules/game/filter-bar";
import HowToPlay from "@/components/modules/game/how-to-play";
import PuzzleCard from "@/components/modules/game/puzzle-card";
import WordPuzzleHeader from "@/components/modules/game/word-puzzle-header";
import { Button } from "@/components/ui/button";
import { useWordsetsQuery } from "@/hooks";
import {
  GetWordsetsQueryType,
  WordsetDifficulty,
  WordsetListItemType,
} from "@/models";
import { SearchX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

/** ====== Helpers ====== */
const PAGE_SIZE = 6;

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

  // ==== Load more state ====
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedWordsets, setLoadedWordsets] = useState<WordsetListItemType[]>(
    []
  );
  const [isLoadMorePending, setIsLoadMorePending] = useState(false);

  const params: GetWordsetsQueryType = useMemo(
    () => ({
      lang: locale,
      name: q || undefined,
      languageIds: langFilter !== "all" ? [langFilter] : undefined,
      difficulty: levelFilter === "all" ? undefined : levelFilter,
      interestIds: catFilter !== "all" ? [catFilter] : undefined,
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
    }),
    [locale, q, langFilter, levelFilter, catFilter, currentPage]
  );

  const { data: res, isLoading } = useWordsetsQuery({ params });

  // Reset khi filter/search/lang đổi
  useEffect(() => {
    setCurrentPage(1);
    setLoadedWordsets([]);
    setIsLoadMorePending(false);
  }, [locale, q, langFilter, levelFilter, catFilter]);

  // Cập nhật danh sách đã load mỗi khi data mới về
  useEffect(() => {
    const items =
      (res?.payload?.data?.items as WordsetListItemType[] | undefined) ?? [];
    if (!items.length) {
      if (isLoadMorePending) setIsLoadMorePending(false);
      return;
    }

    setLoadedWordsets((prev) => {
      if (currentPage === 1) {
        // Trang đầu: replace
        return items;
      }

      // Trang sau: append, tránh trùng id
      const existingIds = new Set(prev.map((p) => p.id));
      const unique = items.filter((p) => !existingIds.has(p.id));
      return [...prev, ...unique];
    });

    if (isLoadMorePending) setIsLoadMorePending(false);
  }, [res, currentPage, isLoadMorePending]);

  const puzzles = useMemo(
    () => loadedWordsets.map(adaptWordsetToCard),
    [loadedWordsets]
  );

  const hasNoResult = !isLoading && puzzles.length === 0;

  const hasMore = useMemo(() => {
    const meta = res?.payload?.data;
    if (!meta) return false;
    const { hasNextPage, totalItems } = meta;
    return hasNextPage && loadedWordsets.length < (totalItems ?? 0);
  }, [res, loadedWordsets.length]);

  const handleClearFilters = () => {
    setQ("");
    setLangFilter("all");
    setLevelFilter("all");
    setCatFilter("all");
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoading || isLoadMorePending) return;
    setIsLoadMorePending(true);
    setCurrentPage((prev) => prev + 1);
  };

  const isFirstPageLoading = isLoading && currentPage === 1;

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

      {isFirstPageLoading ? (
        // Skeleton trang đầu
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="h-56 rounded-lg border animate-pulse" />
          ))}
        </div>
      ) : hasNoResult ? (
        // Empty state
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
        <>
          {/* Grid card */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {puzzles.map((p) => (
              <PuzzleCard key={p.id} data={p} />
            ))}
          </div>

          {/* Skeleton khi load thêm trang sau */}
          {(isLoading || isLoadMorePending) && currentPage > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="h-56 rounded-lg border animate-pulse" />
              ))}
            </div>
          )}

          {/* Nút Load more */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoading || isLoadMorePending}
              >
                {isLoading || isLoadMorePending
                  ? t("wordPuzzle.loading", { default: "Đang tải..." })
                  : t("wordPuzzle.loadMore", { default: "Xem thêm" })}
              </Button>
            </div>
          )}

          {/* Đã load hết */}
          {!hasMore && puzzles.length > 0 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t("wordPuzzle.allLoaded", {
                default: "Bạn đã xem hết tất cả bộ từ hiện có.",
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
