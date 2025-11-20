"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import {
  EditProfileDialog,
  LoadingSpinner,
  ProfileBadgesSection,
  ProfileGiftsSection,
  ProfileHeader,
  ProfileInfoSection,
  ProfileInterestsSection,
  ProfileLanguagesSection,
  ProfileStats,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  UserPostsList,
} from "@/components";
import { useUserCommunicationHubContext } from "@/components/providers";
import {
  useAuthMe,
  useCurrentSubscriptionQuery,
  useMyPurchasedGiftsQuery,
  useUserBadgesQuery,
  useUserInterestsQuery,
  useUserLanguagesLearningQuery,
  useUserLanguagesSpeakingQuery,
} from "@/hooks";

// Mock data for features not yet implemented
const MOCK_STATS = {
  totalSessions: 45,
  averageRating: 4.8,
  responseRate: 95,
  totalHours: 150,
  eventsHosted: 2,
};

export default function ProfilePage() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const lang = useMemo(() => (locale ? locale.split("-")[0] : "en"), [locale]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Get presence context for online status
  const { isUserOnline } = useUserCommunicationHubContext();

  // Fetch user data
  const { data: authData, isLoading: isLoadingAuth } = useAuthMe();
  const { data: nativeLanguagesData, isLoading: isLoadingNative } =
    useUserLanguagesSpeakingQuery({ params: { lang } });
  const { data: learningLanguagesData, isLoading: isLoadingLearning } =
    useUserLanguagesLearningQuery({ params: { lang } });
  const { data: interestsData, isLoading: isLoadingInterests } =
    useUserInterestsQuery({ params: { lang } });

  // Fetch subscription to get planType
  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useCurrentSubscriptionQuery({
      params: { lang: locale },
    });

  // Fetch user badges
  const { data: badgesData, isLoading: isLoadingBadges } = useUserBadgesQuery({
    params: { lang: locale, pageNumber: 1, pageSize: 100 },
  });

  // Fetch received gifts (only accepted ones - isRead: true)
  const { data: receivedGiftsData, isLoading: isLoadingGifts } =
    useMyPurchasedGiftsQuery({
      params: { lang: locale, pageNumber: 1, pageSize: 20 },
    });

  const isLoading =
    isLoadingAuth ||
    isLoadingNative ||
    isLoadingLearning ||
    isLoadingInterests ||
    isLoadingGifts ||
    isLoadingSubscription ||
    isLoadingBadges;

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
  const badges = (badgesData?.payload.data?.items || []).map((badge) => ({
    ...badge,
    iconUrl: badge.iconUrl ?? null,
  }));

  // Get planType from subscription
  const planType = subscriptionData?.payload.data?.planType;

  // Transform gifts to match ProfileGiftsSection format
  const transformedGifts =
    receivedGiftsData?.payload.data?.items.map((gift) => ({
      id: gift.id,
      name: gift.name,
      iconUrl: gift.iconUrl,
      quantity: gift.quantity,
    })) || [];

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-4">
      {/* Header Section */}
      <ProfileHeader
        name={user.name}
        email={user.mail}
        avatarUrl={user.avatarUrl}
        merit={user.merit}
        gender={user.gender}
        introduction={user.introduction}
        isOnline={isUserOnline(user.id)}
        onEdit={() => setEditDialogOpen(true)}
      />

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="social">{t("tabs.social")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
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

              {/* Badges */}
              <ProfileBadgesSection badges={badges} />

              {/* Gifts */}
              <ProfileGiftsSection gifts={transformedGifts} />
            </div>

            {/* Right Column - Stats & XP */}
            <div className="space-y-6">
              {/* XP & Level */}
              <ProfileInfoSection
                experiencePoints={user.experiencePoints}
                merit={user.merit}
                streakDays={user.streakDays}
                longestStreakDays={user.longestStreakDays}
                nextUnbannedAt={user.nextUnbannedAt}
              />
              {/* Stats */}
              <ProfileStats
                totalSessions={MOCK_STATS.totalSessions}
                averageRating={MOCK_STATS.averageRating}
                responseRate={MOCK_STATS.responseRate}
                totalHours={MOCK_STATS.totalHours}
                streakDays={user.streakDays}
                eventsHosted={MOCK_STATS.eventsHosted}
                planType={planType}
              />
            </div>
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Posts */}
            <div className="lg:col-span-2">
              <UserPostsList
                currentUserAuthor={{
                  id: user.id,
                  name: user.name || "",
                  avatar: user.avatarUrl || "",
                  initials: (user.name || "")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2),
                }}
                locale={locale}
              />
            </div>

            {/* Right Column - Stats & XP (same as overview) */}
            <div className="space-y-6">
              <ProfileStats
                totalSessions={MOCK_STATS.totalSessions}
                averageRating={MOCK_STATS.averageRating}
                responseRate={MOCK_STATS.responseRate}
                totalHours={MOCK_STATS.totalHours}
                streakDays={user.streakDays}
                eventsHosted={MOCK_STATS.eventsHosted}
                planType={planType}
              />
              <ProfileInfoSection
                experiencePoints={user.experiencePoints}
                merit={user.merit}
                streakDays={user.streakDays}
                longestStreakDays={user.longestStreakDays}
                nextUnbannedAt={user.nextUnbannedAt}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
