"use client";

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  UserNotFound,
  UserPostsList,
} from "@/components";
import { ReportDialog } from "@/components/modules/report";
import { useUserCommunicationHubContext } from "@/components/providers";
import { FriendStatus } from "@/constants";
import {
  useAcceptFriendRequestMutation,
  useGetConversationsByUserId,
  useGetUserProfile,
  useRejectFriendRequestMutation,
  useSendFriendRequestMutation,
  useUserLevelsQuery,
} from "@/hooks";
import { showErrorToast, showSuccessToast } from "@/lib";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// Mock data for features not yet implemented
const MOCK_STATS = {
  totalSessions: 0,
  averageRating: 0,
  responseRate: 0,
  totalHours: 0,
  eventsHosted: 0,
};

export default function UserProfilePage() {
  const params = useParams();
  const locale = useLocale();
  const router = useRouter();
  const initialLang = useMemo(
    () => (locale ? locale.split("-")[0] : "en"),
    [locale]
  );
  const t = useTranslations("profile");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const [sendGiftDialogOpen, setSendGiftDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [lang] = useState(initialLang);

  const userId = params.userId as string;

  // Get presence context for online status
  const { isUserOnline } = useUserCommunicationHubContext();

  // Fetch user profile
  const {
    data: userData,
    isLoading,
    error: userError,
    refetch,
  } = useGetUserProfile(userId, lang, { enabled: !!userId });

  // Fetch conversation with this user (only enabled when they are friends)
  const { data: conversationData } = useGetConversationsByUserId(userId, {
    enabled:
      !!userId && userData?.payload.data.friendStatus === FriendStatus.Friends,
  });

  // Levels của user (để biết còn quà chưa nhận)
  const { data: userLevelsData, isLoading: isLoadingLevels } =
    useUserLevelsQuery({
      params: { lang, pageNumber: -1, pageSize: -1 },
    });

  // Friend mutations
  const sendFriendRequestMutation = useSendFriendRequestMutation({
    onSuccess: () => {
      showSuccessToast("friendRequestSent", tSuccess);
      refetch();
    },
    onError: () => {
      showErrorToast("friendRequestFailed", tError);
    },
  });

  const acceptFriendRequestMutation = useAcceptFriendRequestMutation({
    onSuccess: () => {
      showSuccessToast("friendRequestAccepted", tSuccess);
      refetch();
    },
    onError: () => {
      showErrorToast("failAccept", tError);
    },
  });

  const rejectFriendRequestMutation = useRejectFriendRequestMutation({
    onSuccess: () => {
      showSuccessToast("friendRequestRejected", tSuccess);
      refetch();
    },
    onError: () => {
      showErrorToast("failReject", tError);
    },
  });

  const handleReportUser = () => {
    setReportDialogOpen(true);
  };

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

  const transformedGifts = (user.gifts || []).map((gift) => ({
    id: gift.id,
    name: gift.name,
    quantity: gift.quantity,
    iconUrl: gift.iconUrl,
  }));

  // Handle share profile
  const handleShare = () => {
    const url = `${window.location.origin}/${locale}/matching/${userId}`;
    navigator.clipboard.writeText(url);
    showSuccessToast("profileLinkCopied", tSuccess);
  };

  const handleAddFriend = () => {
    if (!user) return;

    if (user.friendStatus === FriendStatus.None) {
      sendFriendRequestMutation.mutate({ receiverId: userId });
    } else if (user.friendStatus === FriendStatus.Received) {
      acceptFriendRequestMutation.mutate({ senderId: userId });
    }
  };

  const handleRejectFriend = () => {
    if (!user || user.friendStatus !== FriendStatus.Received) return;
    rejectFriendRequestMutation.mutate({ senderId: userId });
  };

  const handleChat = () => {
    if (!conversationData) {
      showErrorToast("conversationNotFound", tError);
      return;
    }

    const conversationId = conversationData.payload.data.id;
    // Navigate to chat with conversationId as query param
    router.push(`/${locale}/chat?conversationId=${conversationId}`);
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
          merit={user.merit}
          gender={user.gender}
          introduction={user.introduction}
          isOnline={isUserOnline(userId)}
          variant="other"
          friendStatus={user.friendStatus}
          onSendGift={handleSendGift}
          onShare={handleShare}
          onAddFriend={handleAddFriend}
          onRejectFriend={handleRejectFriend}
          onChat={handleChat}
          onReport={handleReportUser}
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
                {/* XP & Level */}
                <ProfileInfoSection
                  experiencePoints={user.experiencePoints ?? 0}
                  merit={user.merit}
                  streakDays={user.streakDays ?? 0}
                  longestStreakDays={user.longestStreakDays ?? 0}
                  nextUnbannedAt={user.nextUnbannedAt ?? null}
                  level={user.level}
                  xpInCurrentLevel={user.xpInCurrentLevel}
                  xpToNextLevel={user.xpToNextLevel}
                />
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
              </div>
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Posts */}
              <div className="lg:col-span-2">
                <UserPostsList
                  userId={userId}
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
                  streakDays={user.streakDays ?? 0}
                  eventsHosted={MOCK_STATS.eventsHosted}
                  planType={user.planType}
                />
                <ProfileInfoSection
                  experiencePoints={user.experiencePoints ?? 0}
                  merit={user.merit ?? 0}
                  streakDays={user.streakDays ?? 0}
                  longestStreakDays={user.longestStreakDays ?? 0}
                  nextUnbannedAt={user.nextUnbannedAt ?? null}
                  level={user.level}
                  xpInCurrentLevel={user.xpInCurrentLevel}
                  xpToNextLevel={user.xpToNextLevel}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Gift Dialog */}
      <SendGiftDialog
        open={sendGiftDialogOpen}
        onOpenChange={setSendGiftDialogOpen}
        receiverId={userId}
        receiverName={user.name}
        locale={locale}
      />

      {/* Report Dialog */}
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        reportType="User"
        targetId={userId}
      />
    </>
  );
}
