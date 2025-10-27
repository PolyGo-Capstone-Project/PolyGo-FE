"use client";

import {
  Avatar, // Import AvatarImage
  AvatarFallback, // Import Avatar
  AvatarImage,
  LoadingSpinner,
} from "@/components"; // Assuming components are imported from "@/components"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const isValidAvatarUrl = (url: any) => !!url; // Thay bằng logic kiểm tra URL thực tế
const getInitials = (name: any) =>
  name
    .split(/\s+/)
    .map((n: any) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

import { useAuthMe, useGetUsersMatching } from "@/hooks";
import { UserMatchingItemType } from "@/models";
import { useMemo } from "react";

/* ========================================================================================= */
/* ===================================== MOCK DATA CÒN LẠI ================================= */
/* ========================================================================================= */

// Dữ liệu mock cho các trường chưa có trong useAuthMe (giữ nguyên)
const MOCK_TOTAL_HOURS = 15;
const MOCK_RATING = 4.8;
const MOCK_LEVEL_PROGRESS = { current: 1250, total: 2000, level: 5 };

// MOCK DATA KHÁC (giữ nguyên)
const mockQuickActions = [
  {
    id: 1,
    icon: "🔎",
    title: "findPartner",
    description: "findPartnerDesc",
    color: "bg-blue-500",
  },
  {
    id: 2,
    icon: "💬",
    title: "startChat",
    description: "startChatDesc",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    icon: "🎟️",
    title: "joinEvent",
    description: "joinEventDesc",
    color: "bg-violet-500",
  },
  {
    id: 4,
    icon: "⭐",
    title: "upgradePlus",
    description: "upgradePlusDesc",
    color: "bg-amber-500",
  },
  {
    id: 5,
    icon: "💳",
    title: "myWallet",
    description: "myWalletDesc",
    color: "bg-pink-500",
  },
  {
    id: 6,
    icon: "🎮",
    title: "games",
    description: "gamesDesc",
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

const mockRecentChats = [
  { id: 1, name: "An craft", last: "Ready for our practice?", ago: "3m" },
  { id: 2, name: "Davis", last: "Study plan for Spanish practice…", ago: "5m" },
];

/* ========================================================================================= */
/* ========================================= CUSTOM HOOK CHO SUGGESTED PARTNERS ================================= */
/* ========================================================================================= */

// Custom hook để chỉ lấy 6 partners gợi ý đầu tiên
const useSuggestedPartners = () => {
  const { data, isLoading } = useGetUsersMatching({
    pageNumber: 1,
    pageSize: 6, // Chỉ lấy 6 users
  });

  const suggestedPartners: UserMatchingItemType[] = useMemo(() => {
    return data?.payload.data?.items ?? [];
  }, [data]);

  return { suggestedPartners, isLoading };
};

/* ========================================================================================= */
/* ========================================= PAGE ========================================== */
/* ========================================================================================= */
export default function DashboardPage() {
  const t = useTranslations("dashboard");

  // Sử dụng hook useAuthMe để lấy dữ liệu người dùng
  const { data: authData, isLoading: isLoadingAuth } = useAuthMe();

  // SỬ DỤNG HOOK MỚI ĐỂ LẤY 6 PARTNERS
  const { suggestedPartners, isLoading: isLoadingPartners } =
    useSuggestedPartners();

  // Xử lý trạng thái Loading chung
  if (isLoadingAuth || isLoadingPartners) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Xử lý lỗi hoặc không có dữ liệu người dùng
  if (!authData?.payload.data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile data</p>
      </div>
    );
  }

  const user = authData.payload.data;

  // Sử dụng dữ liệu thực tế từ API và dữ liệu mock
  const userName = user.name;
  const xpPoints = user.experiencePoints;
  const streakDays = user.streakDays;
  const totalHours = MOCK_TOTAL_HOURS; // Vẫn dùng mock
  const rating = MOCK_RATING; // Vẫn dùng mock
  const levelProgress = MOCK_LEVEL_PROGRESS; // Vẫn dùng mock

  // Tính toán tiến trình cấp độ
  const progressPct = (levelProgress.current / levelProgress.total) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* ======= MAIN GRID: Left (2 cols) | Right (1 col) ======= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ================= LEFT COLUMN (span 2) ================= */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Banner (Giữ nguyên) */}
            <div className="rounded-2xl p-6 sm:p-8 text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                      {t("welcome", { name: userName })} 👋
                    </h1>
                    <p className="text-purple-100 text-sm mt-1">
                      {t("dailyGoal")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                      <span className="text-lg">⭐</span>
                      <span>{xpPoints}</span>
                      <span className="text-purple-100">{t("xpPoints")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <span>{t("streak", { count: streakDays })}</span>
                  </div>
                  <div className="w-px h-5 bg-white/30" />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    <span>{totalHours}h learning</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Giữ nguyên) */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {t("quickActions.title", { defaultValue: "Hành động nhanh" })}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {mockQuickActions.map((a) => (
                  <Card
                    key={a.id}
                    className="hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div
                          className={`${a.color} text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
                        >
                          {a.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {t(`quickActions.${a.title}`, {
                              defaultValue: a.title,
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* PARTNER GỢI Ý - ĐÃ CẬP NHẬT DỮ LIỆU AVATAR */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-900">
                    {t("suggestedPartners.title", {
                      defaultValue: "Partner gợi ý",
                    })}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-semibold"
                  >
                    {t("seeAll", { defaultValue: "Xem tất cả" })} →
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedPartners.map((p) => {
                    const initials = getInitials(p.name);
                    // Giả định isOnline là 1 trường boolean trong p
                    // const isOnline = p.isOnline || Math.random() > 0.5;

                    return (
                      <Card
                        key={p.id}
                        className="hover:shadow-md hover:border-purple-200 transition-all border group"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-3 mb-4">
                            {/* Thay thế logic avatar */}
                            <div className="relative">
                              <Avatar className="h-12 w-12 border-2 border-background shadow-md transition-transform group-hover:scale-105">
                                <AvatarImage
                                  src={
                                    p.avatarUrl && isValidAvatarUrl(p.avatarUrl)
                                      ? p.avatarUrl
                                      : undefined
                                  }
                                  alt={p.name}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              {/* {isOnline && (
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                              )} */}
                            </div>
                            {/* Hết logic avatar */}

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-bold text-slate-900 truncate">
                                {p.name}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <span>⭐</span>
                                {/* API không trả về rating, dùng rating mock 4.8 */}
                                <span>{MOCK_RATING}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-4 h-9 overflow-hidden">
                            {/* Dùng ngôn ngữ đang nói của user làm tags */}
                            {p.speakingLanguages.slice(0, 3).map((lang) => (
                              <Badge
                                key={lang.id}
                                variant="secondary"
                                className="text-[11px] bg-slate-100 text-slate-700"
                              >
                                {lang.name}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs h-8 border-slate-200 hover:bg-slate-50 bg-transparent"
                            >
                              {t("profile", { defaultValue: "Profile" })}
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
                            >
                              {t("chat", { defaultValue: "Chat" })}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {/* Hiển thị thông báo nếu không có partner nào */}
                  {suggestedPartners.length === 0 && (
                    <div className="lg:col-span-3 text-center py-4 text-muted-foreground">
                      {t("suggestedPartners.noPartners", {
                        defaultValue: "Không tìm thấy partner gợi ý nào.",
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sự kiện sắp tới (Giữ nguyên) */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-900">
                    {t("upcomingEvents.title", {
                      defaultValue: "Sự kiện sắp tới",
                    })}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-semibold"
                  >
                    {t("upcomingEvents.viewDashboard", {
                      defaultValue: "View All",
                    })}{" "}
                    →
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {mockUpcomingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex gap-4 p-4 rounded-lg border border-slate-200 hover:border-purple-200 hover:bg-purple-50/30 transition-all"
                  >
                    <div className="text-3xl flex-shrink-0">📅</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-semibold text-sm text-slate-900 truncate">
                          {ev.title}
                        </div>
                        {ev.isPlus ? (
                          <Badge className="bg-indigo-600 text-white text-[10px] rounded-full flex-shrink-0">
                            Plus
                          </Badge>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-600 mb-2 line-clamp-1">
                        {ev.description}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                        <span>📅 {ev.date}</span>
                        <span>🕒 {ev.time}</span>
                      </div>
                      <Button
                        size="sm"
                        className="text-xs bg-indigo-600 hover:bg-indigo-700"
                      >
                        {t("upcomingEvents.join", { defaultValue: "Tham gia" })}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ================= RIGHT COLUMN (Giữ nguyên) ================= */}
          <div className="space-y-6">
            {/* Overview (Stats) (Giữ nguyên) */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold text-slate-900">
                  {t("stats.title", { defaultValue: "Thống kê của bạn" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <RowStat
                  label={t("stats.xp", { defaultValue: "XP" })}
                  value={xpPoints}
                />
                <RowStat
                  label={t("stats.hours", { defaultValue: "Giờ đã học" })}
                  value={`${totalHours}h`}
                />
                <RowStat
                  label={t("stats.streak", { defaultValue: "Chuỗi ngày" })}
                  value={streakDays}
                />
                <RowStat
                  label={t("stats.rating", { defaultValue: "Đánh giá" })}
                  value={rating}
                />
                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    {t("stats.levelProgress", {
                      defaultValue: "Level Progress",
                    })}
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {levelProgress.current}/{levelProgress.total} XP
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Chats (Giữ nguyên) */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold text-slate-900">
                  {t("recentChats.title", { defaultValue: "Cuộc trò chuyện" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {mockRecentChats.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {c.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {c.last}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 flex-shrink-0">
                      {c.ago}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upgrade Plus (Giữ nguyên) */}
            <Card className="border-0 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative z-10">
                <div className="text-xs font-semibold text-amber-100 mb-2 uppercase tracking-wide">
                  {t("upgradePlus.badge", {
                    defaultValue: "Nâng cấp lên Plus",
                  })}
                </div>
                <h3 className="text-lg font-bold mb-4 leading-tight">
                  {t("upgradePlus.title", {
                    defaultValue: "Mở khóa cuộc gọi không giới hạn",
                  })}
                </h3>
                <Button className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold h-10">
                  {t("upgradePlus.button", { defaultValue: "Nâng cấp ngay" })} →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Row stat nhỏ cho card Overview (Giữ nguyên) ===== */
function RowStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}
