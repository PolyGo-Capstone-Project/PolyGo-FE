"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import CreatorCard from "@/components/modules/game/leaderboard/creator-card";
import LeaderboardHeader from "@/components/modules/game/leaderboard/leaderboard-header";
import PuzzleDetailsCard from "@/components/modules/game/leaderboard/puzzle-detail-card";
import TopPlayersCard from "@/components/modules/game/leaderboard/top-player-card";
import YourBestCard from "@/components/modules/game/leaderboard/your-best-card";
import { useWordsetDetailQuery } from "@/hooks"; // đường dẫn hook của bạn

export default function LeaderboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const wordsetId = params?.id;

  const { data, isLoading } = useWordsetDetailQuery({
    id: wordsetId,
    lang: locale,
    enabled: Boolean(wordsetId),
  });

  const wd = data?.data; // GetWordsetByIdResType["data"]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <LeaderboardHeader
        summary={
          wd
            ? {
                id: wd.id,
                title: wd.title,
                languageLabel: wd.language?.name ?? "",
                category: wd.category,
                // chuyển "Easy" | "Medium" | "Hard" -> "easy" | "medium" | "hard"
                level:
                  (wd.difficulty?.toLowerCase() as
                    | "easy"
                    | "medium"
                    | "hard") ?? "medium",
              }
            : undefined
        }
        loading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopPlayersCard
          className="lg:col-span-2"
          wordsetId={wordsetId}
          lang={locale}
        />

        <div className="space-y-4">
          <PuzzleDetailsCard
            details={
              wd
                ? {
                    words: wd.wordCount,
                    level:
                      (wd.difficulty?.toLowerCase() as
                        | "easy"
                        | "medium"
                        | "hard") ?? "medium",
                    estTimeMin: wd.estimatedTimeInMinutes,
                    plays: wd.playCount,
                    avgTimeSec: wd.averageTimeInSeconds,
                  }
                : undefined
            }
            loading={isLoading}
          />
          <YourBestCard wordsetId={wordsetId} lang={locale} />
          <CreatorCard
            creator={
              wd
                ? {
                    name: wd.creator?.name ?? "",
                    avatar: wd.creator?.avatarUrl ?? undefined,
                    createdAt: wd.createdAt,
                    rating: wd.averageRating, // dùng rating của wordset
                  }
                : undefined
            }
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
