"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  LoadingSpinner,
  ProfileBadgesSection,
  ProfileGiftsSection,
  ProfileHeader,
  ProfileInfoSection,
  ProfileInterestsSection,
  ProfileLanguagesSection,
  ProfileStats,
  SendGiftDialog,
} from "@/components";
import { UserNotFound } from "@/components/modules/matching";
import { useGetUserProfile } from "@/hooks";

// Mock data for features not yet implemented
const MOCK_STATS = {
  totalSessions: 45,
  averageRating: 4.8,
  responseRate: 95,
  totalHours: 150,
  eventsHosted: 2,
};

export default function UserProfilePage() {
  const params = useParams();
  const locale = useLocale();
  const initialLang = useMemo(
    () => (locale ? locale.split("-")[0] : "en"),
    [locale]
  );
  const t = useTranslations("profile");
  const [sendGiftDialogOpen, setSendGiftDialogOpen] = useState(false);
  const [lang] = useState(initialLang);

  const userId = params.userId as string;

  // Fetch user profile
  const {
    data: userData,
    isLoading,
    error: userError,
    refetch,
  } = useGetUserProfile(userId, lang, { enabled: !!userId });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Handle error - Check if it's a 404 or other error
  if (userError) {
    const is404Error =
      userError.message?.includes("404") ||
      userError.message?.includes("not found") ||
      !userData;

    return (
      <UserNotFound
        locale={locale}
        errorType={is404Error ? "notFound" : "loadFailed"}
        onRetry={() => refetch()}
      />
    );
  }

  const user = userData?.payload.data;

  // Additional check if user data is null/undefined
  if (!user) {
    return (
      <UserNotFound
        locale={locale}
        errorType="notFound"
        onRetry={() => refetch()}
      />
    );
  }

  // Extract data
  const speakingLanguages = user.speakingLanguages || [];
  const learningLanguages = user.learningLanguages || [];
  const interests = (user.interests || []).map((interest) => ({
    ...interest,
    description: interest.name,
  }));

  // Get badges from user data and normalise icon to null when missing
  const badges = (user.badges || []).map((badge) => ({
    ...badge,
    iconUrl: badge.iconUrl ?? null,
  }));

  // Transform gifts from user data
  const transformedGifts = (user.gifts || []).map((gift) => ({
    id: gift.id,
    name: gift.name,
    value: 0,
    from: {
      name: "Anonymous", // We don't have sender info in this context
      avatarUrl: null,
    },
    message: "",
    receivedAt: new Date().toISOString(),
    iconUrl: gift.iconUrl,
  }));

  // Handle share profile
  const handleShare = () => {
    const url = `${window.location.origin}/${locale}/matching/${userId}`;
    navigator.clipboard.writeText(url);
    toast.success(t("share") + " - " + "Link copied!");
  };

  const handleAddFriend = () => {
    toast("Feature coming soon!");
  };

  // Handle send gift
  const handleSendGift = () => {
    setSendGiftDialogOpen(true);
  };

  return (
    <>
      <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        {/* Header Section */}
        <ProfileHeader
          name={user.name}
          email={user.mail}
          avatarUrl={user.avatarUrl}
          meritLevel={user.meritLevel}
          gender={user.gender}
          introduction={user.introduction}
          isOnline={true}
          variant="other"
          onSendGift={handleSendGift}
          onShare={handleShare}
          onAddFriend={handleAddFriend}
        />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Languages */}
            <ProfileLanguagesSection
              nativeLanguages={speakingLanguages}
              learningLanguages={learningLanguages}
            />

            {/* Interests */}
            <ProfileInterestsSection interests={interests} />

            {/* Badges */}
            <ProfileBadgesSection badges={badges} />

            {/* Gifts */}
            {transformedGifts.length > 0 && (
              <ProfileGiftsSection gifts={transformedGifts} />
            )}
          </div>

          {/* Right Column - Stats & XP */}
          <div className="space-y-6">
            {/* Stats */}
            <ProfileStats
              totalSessions={MOCK_STATS.totalSessions}
              averageRating={MOCK_STATS.averageRating}
              responseRate={MOCK_STATS.responseRate}
              totalHours={MOCK_STATS.totalHours}
              streakDays={user.streakDays ?? 0}
              eventsHosted={MOCK_STATS.eventsHosted}
              planType={user.planType}
            />

            {/* XP & Level */}
            <ProfileInfoSection
              experiencePoints={user.experiencePoints ?? 0}
              streakDays={user.streakDays ?? 0}
            />
          </div>
        </div>
      </div>

      {/* Send Gift Dialog */}
      <SendGiftDialog
        open={sendGiftDialogOpen}
        onOpenChange={setSendGiftDialogOpen}
        receiverId={userId}
        receiverName={user.name}
        locale={locale}
      />
    </>
  );
}
