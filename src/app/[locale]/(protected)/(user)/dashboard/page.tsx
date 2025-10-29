"use client";

import { LoadingSpinner } from "@/components";
import { useAuthMe, useGetUsersMatching } from "@/hooks";
import { UserMatchingItemType } from "@/models";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  QuickActionItemType,
  QuickActionsGrid,
} from "@/components/modules/dashboard/quick-action-grid";
import {
  RecentChatItemType,
  RecentChats,
} from "@/components/modules/dashboard/recent-chat";
import { StatsOverviewCard } from "@/components/modules/dashboard/stats-overview";
import { SuggestedPartnersGrid } from "@/components/modules/dashboard/suggested-partner-grid";
import { UpcomingEventsList } from "@/components/modules/dashboard/upcoming-events-list";
import { UpgradePlusCard } from "@/components/modules/dashboard/upgrade-plus-card";
import { WelcomeBanner } from "@/components/modules/dashboard/welcome-banner";

/* ✅ Thêm icon từ shadcn/ui (lucide-react) */
import {
  CreditCard,
  Gamepad2,
  MessageSquare,
  Search,
  Star,
  Ticket,
} from "lucide-react";

/* ======================================================= */
/* ================= MOCK DATA + UTILITIES ================ */
/* ======================================================= */

const MOCK_TOTAL_HOURS = 15;
const MOCK_RATING = 4.8;
const MOCK_LEVEL_PROGRESS = { current: 1250, total: 2000, level: 5 };

/* ✅ Dùng icon lucide thay cho emoji, giữ nguyên color/title/id */
const mockQuickActions: QuickActionItemType[] = [
  {
    id: 1,
    icon: <Search className="w-6 h-6 text-white" />,
    title: "findPartner",
    color: "bg-blue-500",
  },
  {
    id: 2,
    icon: <MessageSquare className="w-6 h-6 text-white" />,
    title: "startChat",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    icon: <Ticket className="w-6 h-6 text-white" />,
    title: "joinEvent",
    color: "bg-violet-500",
  },
  {
    id: 4,
    icon: <Star className="w-6 h-6 text-white" />,
    title: "upgradePlus",
    color: "bg-amber-500",
  },
  {
    id: 5,
    icon: <CreditCard className="w-6 h-6 text-white" />,
    title: "myWallet",
    color: "bg-pink-500",
  },
  {
    id: 6,
    icon: <Gamepad2 className="w-6 h-6 text-white" />,
    title: "games",
    color: "bg-red-500",
  },
];

const mockUpcomingEvents = [
  {
    id: 1,
    title: "American Museum Tour - Learn Language via Culture",
    description: "Learn culture while learning English with native speakers.",
    date: "28/09/2025",
    time: "14:00",
    isPlus: true,
  },
  {
    id: 2,
    title: "Vietnamese Cooking Class - Pho & Spring Rolls",
    description: "Practice Vietnamese while cooking classic dishes.",
    date: "02/10/2025",
    time: "18:00",
    isPlus: true,
  },
  {
    id: 3,
    title: "Vietnamese Business Language Workshop",
    description: "Professional communication and business etiquette.",
    date: "10/10/2025",
    time: "19:00",
    isPlus: false,
  },
];

const mockRecentChats: RecentChatItemType[] = [
  {
    id: 1,
    name: "An craft",
    last: "Ready for our practice?",
    ago: "3m",
    avatarUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc9APxkj0xClmrU3PpMZglHQkx446nQPG6lA&s", // Ví dụ có avatar
  },
  {
    id: 2,
    name: "Davis",
    last: "Study plan for Spanish practice…",
    ago: "5m",
    avatarUrl: null, // Ví dụ không có avatar
  },
  {
    id: 3,
    name: "Tâm",
    last: "Bài học ngữ pháp tiếng Việt mới",
    ago: "1h",
    avatarUrl: "https://i.pravatar.cc/150?img=53",
  },
];

const isValidAvatarUrl = (url?: string | null) => !!url;
const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

/* ======================================================= */
/* ================== CUSTOM HOOK ========================= */
/* ======================================================= */
const useSuggestedPartners = () => {
  const { data, isLoading } = useGetUsersMatching({
    pageNumber: 1,
    pageSize: 6,
  });

  const suggestedPartners: UserMatchingItemType[] = useMemo(
    () => data?.payload.data?.items ?? [],
    [data]
  );

  return { suggestedPartners, isLoading };
};

/* ======================================================= */
/* ======================== PAGE ========================== */
/* ======================================================= */
export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const { data: authData, isLoading: isLoadingAuth } = useAuthMe();
  const { suggestedPartners, isLoading: isLoadingPartners } =
    useSuggestedPartners();

  if (isLoadingAuth || isLoadingPartners) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!authData?.payload.data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile data</p>
      </div>
    );
  }

  const user = authData.payload.data;
  const userName = user.name;
  const xpPoints = user.experiencePoints;
  const streakDays = user.streakDays;
  const totalHours = MOCK_TOTAL_HOURS;
  const rating = MOCK_RATING;
  const levelProgress = MOCK_LEVEL_PROGRESS;
  const progressPct = (levelProgress.current / levelProgress.total) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* =============== LEFT COLUMN (span 2) =============== */}
          <div className="lg:col-span-2 space-y-6">
            <WelcomeBanner
              t={t}
              userName={userName}
              xpPoints={xpPoints}
              streakDays={streakDays}
              totalHours={totalHours}
            />

            <QuickActionsGrid
              t={t}
              actions={mockQuickActions}
              locale={locale}
            />

            <SuggestedPartnersGrid
              t={t}
              partners={suggestedPartners.map((p) => ({
                id: p.id,
                name: p.name,
                avatarUrl: p.avatarUrl,
                speakingLanguages: p.speakingLanguages || [],
              }))}
              rating={rating}
              getInitials={getInitials}
              isValidAvatarUrl={isValidAvatarUrl}
              locale={locale}
            />

            <UpcomingEventsList
              events={mockUpcomingEvents}
              t={t}
              locale={locale}
            />
          </div>

          {/* =============== RIGHT COLUMN ================= */}
          <div className="space-y-6">
            <StatsOverviewCard
              xpPoints={xpPoints}
              totalHours={totalHours}
              streakDays={streakDays}
              rating={rating}
              progressPct={progressPct}
              currentXP={levelProgress.current}
              totalXP={levelProgress.total}
              t={t}
            />

            <RecentChats
              chats={mockRecentChats}
              isValidAvatarUrl={isValidAvatarUrl} // Hàm kiểm tra URL
              getInitials={getInitials} // Hàm lấy chữ viết tắt
            />

            {/* Upgrade Plus Card */}
            <UpgradePlusCard t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}
