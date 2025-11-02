"use client";

import { useTranslations } from "next-intl";

import CreatorCard from "@/components/modules/game/leaderboard/creator-card";
import LeaderboardHeader from "@/components/modules/game/leaderboard/leaderboard-header";
import PuzzleDetailsCard from "@/components/modules/game/leaderboard/puzzle-detail-card";
import TopPlayersCard from "@/components/modules/game/leaderboard/top-player-card";
import YourBestCard from "@/components/modules/game/leaderboard/your-best-card";

export default function LeaderboardPage() {
  const t = useTranslations();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <LeaderboardHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopPlayersCard className="lg:col-span-2" />

        <div className="space-y-4">
          <PuzzleDetailsCard />
          <YourBestCard />
          <CreatorCard />
        </div>
      </div>
    </div>
  );
}
