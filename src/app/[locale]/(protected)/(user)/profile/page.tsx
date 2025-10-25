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
} from "@/components";
import {
  useAuthMe,
  useCurrentSubscriptionQuery,
  useMyReceivedGiftsQuery,
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
    useMyReceivedGiftsQuery({
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

  // Filter only accepted gifts (isRead: true)
  const acceptedGifts =
    receivedGiftsData?.payload.data.items.filter((gift) => gift.isRead) || [];

  // Transform gifts to match ProfileGiftsSection format
  const transformedGifts = acceptedGifts.map((gift) => ({
    id: gift.presentationId,
    name: gift.giftName,
    value: 0, // Price not provided in received gifts
    from: {
      name: gift.isAnonymous ? "Anonymous" : gift.senderName,
      avatarUrl: gift.isAnonymous ? null : gift.senderAvatarUrl,
    },
    message: gift.message,
    receivedAt: gift.createdAt,
    iconUrl: gift.giftIconUrl,
  }));

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

          {/* Badges */}
          <ProfileBadgesSection badges={badges} />

          {/* Gifts */}
          <ProfileGiftsSection gifts={transformedGifts} />
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
            planType={planType}
          />

          {/* XP & Level */}
          <ProfileInfoSection
            experiencePoints={user.experiencePoints}
            streakDays={user.streakDays}
          />
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
