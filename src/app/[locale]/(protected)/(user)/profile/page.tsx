"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { LoadingSpinner } from "@/components/modules/loading";
import {
  EditProfileDialog,
  ProfileAchievementsSection,
  ProfileGiftsSection,
  ProfileHeader,
  ProfileInfoSection,
  ProfileInterestsSection,
  ProfileLanguagesSection,
  ProfileStats,
} from "@/components/modules/profile";
import { useAuthMe } from "@/hooks/query/use-auth";
import { useUserInterestsQuery } from "@/hooks/query/use-interest";
import {
  useUserLanguagesLearningQuery,
  useUserLanguagesSpeakingQuery,
} from "@/hooks/query/use-language";

// NEW: UI cho mục mới
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components/ui";
// NEW: hooks subscription (cùng file use-subscriptionPlan.tsx)
import {
  useCurrentSubscriptionQuery,
  useSubscriptionUsageQuery,
  useToggleAutoRenewMutation,
} from "@/hooks/query/use-subscriptionPlan";
import { locales } from "@/i18n/config";

// Mock data for features not yet implemented
const MOCK_STATS = {
  totalSessions: 45,
  averageRating: 4.8,
  responseRate: 95,
  totalHours: 150,
  eventsHosted: 2,
};

const MOCK_GIFTS = [
  {
    id: "1",
    name: "☕",
    value: 5,
    from: {
      name: "AnnaFR",
      avatarUrl: null,
    },
    message: "Thank you for the amazing Vietnamese cooking class!",
    receivedAt: "2025-10-06T10:00:00Z",
  },
  {
    id: "2",
    name: "📚",
    value: 12,
    from: {
      name: "JohnEN",
      avatarUrl: null,
    },
    message: "Your teaching style is incredible! Keep inspiring others 📖",
    receivedAt: "2025-10-09T14:30:00Z",
  },
];

const MOCK_ACHIEVEMENTS = [
  {
    id: "1",
    name: "First Chat",
    description: "Had your first conversation",
    icon: "💬",
    unlockedAt: "2025-09-01T10:00:00Z",
    isUnlocked: true,
  },
  {
    id: "2",
    name: "10 Hours Spoken",
    description: "Spoken for 10+ hours",
    icon: "🎤",
    unlockedAt: "2025-09-15T16:30:00Z",
    isUnlocked: true,
  },
  {
    id: "3",
    name: "Early Bird",
    description: "Join a session before 8 AM",
    icon: "🌅",
    isUnlocked: false,
  },
  {
    id: "4",
    name: "Night Owl",
    description: "Join a session after 10 PM",
    icon: "🦉",
    unlockedAt: "2025-10-01T22:45:00Z",
    isUnlocked: true,
  },
  {
    id: "5",
    name: "Social Butterfly",
    description: "Connect with 10 different people",
    icon: "🦋",
    isUnlocked: false,
  },
  {
    id: "6",
    name: "Polyglot",
    description: "Learn 3 or more languages",
    icon: "🌍",
    isUnlocked: false,
  },
  {
    id: "7",
    name: "Helpful Hand",
    description: "Receive 5 gifts from others",
    icon: "🤝",
    unlockedAt: "2025-10-10T09:00:00Z",
    isUnlocked: true,
  },
  {
    id: "8",
    name: "Marathon",
    description: "Complete a 3-hour session",
    icon: "🏃",
    isUnlocked: false,
  },
];

export default function ProfilePage() {
  const t = useTranslations("profile");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch user data
  const { data: authData, isLoading: isLoadingAuth } = useAuthMe();
  const { data: nativeLanguagesData, isLoading: isLoadingNative } =
    useUserLanguagesSpeakingQuery();
  const { data: learningLanguagesData, isLoading: isLoadingLearning } =
    useUserLanguagesLearningQuery();
  const { data: interestsData, isLoading: isLoadingInterests } =
    useUserInterestsQuery();
  const toggleAutoRenew = useToggleAutoRenewMutation();

  const currentSubQuery = useCurrentSubscriptionQuery(true);
  const usageQuery = useSubscriptionUsageQuery(
    { pageNumber: 1, pageSize: 10 },
    true
  );

  const isLoading =
    isLoadingAuth || isLoadingNative || isLoadingLearning || isLoadingInterests;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const user = authData?.payload.data;
  const nativeLanguages = nativeLanguagesData?.payload.data?.items || [];
  const learningLanguages = learningLanguagesData?.payload.data?.items || [];
  const interests = interestsData?.payload.data?.items || [];

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile data</p>
      </div>
    );
  }

  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString(locales ?? "en");
    } catch {
      return iso ?? "";
    }
  };

  const subData = currentSubQuery.data?.payload?.data;
  const usageItems = usageQuery.data?.payload?.data?.items ?? [];

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-0">
      {/* Header Section */}
      <ProfileHeader
        name={user.name}
        email={user.mail}
        avatarUrl={user.avatarUrl}
        meritLevel={user.meritLevel}
        gender={user.gender}
        introduction={user.introduction}
        isOnline={true}
        onEdit={() => setEditDialogOpen(true)}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Languages */}
          <ProfileLanguagesSection
            nativeLanguages={nativeLanguages}
            learningLanguages={learningLanguages}
          />

          {/* Interests */}
          <ProfileInterestsSection interests={interests} />

          {/* Gifts */}
          <ProfileGiftsSection gifts={MOCK_GIFTS} />

          {/* Achievements */}
          <ProfileAchievementsSection achievements={MOCK_ACHIEVEMENTS} />
        </div>

        {/* Right Column - Stats & XP */}
        <div className="space-y-6">
          {/* Stats */}
          <ProfileStats
            totalSessions={MOCK_STATS.totalSessions}
            averageRating={MOCK_STATS.averageRating}
            responseRate={MOCK_STATS.responseRate}
            totalHours={MOCK_STATS.totalHours}
            streakDays={user.streakDays}
            eventsHosted={MOCK_STATS.eventsHosted}
          />

          {/* XP & Level */}
          <ProfileInfoSection
            experiencePoints={user.experiencePoints}
            streakDays={user.streakDays}
          />
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/40 border-b px-4 sm:px-6 py-3">
              {/* TITLE: Giảm từ lg/xl xuống base/lg */}
              <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                {t("subscription.title", { defaultValue: "Gói hiện tại" })}
                {subData?.planType && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-2 py-0.5 text-[10px]"
                  >
                    {subData.planType}
                  </Badge>
                )}
                {subData?.active ? (
                  <Badge className="ml-auto sm:ml-0 rounded-full px-2 py-0.5 text-xs">
                    {t("subscription.active", {
                      defaultValue: "Đang hoạt động",
                    })}
                  </Badge>
                ) : subData ? (
                  <Badge
                    variant="secondary"
                    className="ml-auto sm:ml-0 rounded-full px-2 py-0.5 text-xs"
                  >
                    {t("subscription.inactive", {
                      defaultValue: "Không hoạt động",
                    })}
                  </Badge>
                ) : null}
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 py-4">
              {/* Trạng thái gói */}
              {currentSubQuery.isLoading ? (
                <div className="py-2 text-sm text-muted-foreground">
                  {t("subscription.loading", {
                    defaultValue: "Đang tải gói hiện tại...",
                  })}
                </div>
              ) : subData ? (
                <div className="space-y-4">
                  {/* 1. Info grid (KHÔNG CÓ Auto-Renew) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {t("subscription.planName", {
                          defaultValue: "Tên gói",
                        })}
                      </span>
                      <span className="text-sm sm:text-base font-semibold truncate max-w-[60%] text-right">
                        {subData.planName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {t("subscription.daysRemaining", {
                          defaultValue: "Số ngày còn lại",
                        })}
                      </span>
                      <span className="text-sm sm:text-base font-semibold tabular-nums">
                        {subData.daysRemaining}
                      </span>
                    </div>

                    {/* Dòng Thời hạn - Chiếm 2 cột */}
                    <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 sm:col-span-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {t("subscription.period", { defaultValue: "Thời hạn" })}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-right">
                        {formatDate(subData.startAt)}{" "}
                        <span className="mx-1 opacity-70">→</span>{" "}
                        {formatDate(subData.endAt)}
                      </span>
                    </div>
                  </div>

                  {/* 2. Auto-Renew Action (Nằm riêng biệt dưới cùng) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-secondary/10">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {t("subscription.autoRenew", {
                          defaultValue: "Tự động gia hạn",
                        })}
                        :
                      </span>
                      <Badge
                        variant={subData.autoRenew ? "default" : "secondary"}
                        className="text-xs font-semibold"
                      >
                        {subData.autoRenew
                          ? t("subscription.yes", { defaultValue: "Có" })
                          : t("subscription.no", { defaultValue: "Không" })}
                      </Badge>
                    </div>

                    <Button
                      size="sm"
                      variant={subData.autoRenew ? "secondary" : "default"}
                      className="h-8 w-full sm:w-auto text-xs"
                      disabled={toggleAutoRenew.isPending}
                      onClick={() => toggleAutoRenew.mutate(!subData.autoRenew)}
                    >
                      {toggleAutoRenew.isPending
                        ? t("loading", { defaultValue: "Đang xử lý..." })
                        : subData.autoRenew
                          ? t("subscription.turnOff", {
                              defaultValue: "Tắt gia hạn",
                            })
                          : t("subscription.turnOn", {
                              defaultValue: "Bật gia hạn",
                            })}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-sm text-muted-foreground">
                  {t("subscription.empty", {
                    defaultValue: "Chưa có thông tin gói.",
                  })}
                </div>
              )}

              <Separator className="my-5" />

              {/* Danh sách chức năng */}
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold text-sm">
                  {t("subscription.featuresTitle", {
                    defaultValue: "Chức năng của gói",
                  })}
                </div>
                {/* {!usageQuery.isLoading && usageItems.length > 0 && (
                <div className="text-xs text-muted-foreground">
                    {usageItems.length} {t("items", { defaultValue: "mục" })}
                </div>
            )} */}
              </div>

              {usageQuery.isLoading ? (
                <div className="py-2 text-sm text-muted-foreground">
                  {t("subscription.featuresLoading", {
                    defaultValue: "Đang tải chức năng...",
                  })}
                </div>
              ) : usageItems.length === 0 ? (
                <div className="py-2 text-sm text-muted-foreground">
                  {t("subscription.noFeatures", {
                    defaultValue: "Chưa có chức năng nào.",
                  })}
                </div>
              ) : (
                <ul className="space-y-3">
                  {usageItems.map((f, idx) => {
                    const limitLabel = f.isUnlimited
                      ? t("subscription.unlimited", {
                          defaultValue: "Không giới hạn",
                        })
                      : `${f.usageCount}/${f.limitValue}${f.limitType ? ` (${f.limitType})` : ""}`;

                    return (
                      <li
                        key={`${f.featureType}-${idx}`}
                        className="rounded-xl border bg-background px-3 sm:px-4 py-3 hover:shadow-sm transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold truncate">
                                {t(`features.${f.featureName}`)}
                              </span>
                              {/* {f.limitType && (
                                            <span className="text-[10px] tracking-wide rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                                                {f.limitType}
                                            </span>
                                        )} */}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {t("subscription.resetAt", {
                                defaultValue: "Reset lúc",
                              })}
                              : {formatDate(f.resetAt)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 my-4 shrink-0">
                            <Badge
                              variant={f.canUse ? "default" : "secondary"}
                              className="rounded-full px-2 py-0.5 text-xs"
                            >
                              {f.canUse
                                ? t("subscription.canUse", {
                                    defaultValue: "Có thể dùng",
                                  })
                                : t("subscription.cannotUse", {
                                    defaultValue: "Không thể dùng",
                                  })}
                            </Badge>
                            <span className="text-xs font-bold tabular-nums">
                              {limitLabel}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
