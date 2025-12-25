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
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { FriendStatus } from "@/constants";
import {
  useAcceptFriendRequestMutation,
  useAuthMe,
  useGetConversationsByUserId,
  useGetEventHostById,
  useGetUserProfile,
  useGetUserStatById,
  useRejectFriendRequestMutation,
  useSendFriendRequestMutation,
} from "@/hooks";
import { showErrorToast, showSuccessToast } from "@/lib";
import { IconCalendar, IconUsers } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

  // Fetch current user (logged in user)
  const { data: currentUserData } = useAuthMe();

  // Fetch user profile
  const {
    data: userData,
    isLoading,
    error: userError,
    refetch,
  } = useGetUserProfile(userId, lang, { enabled: !!userId });

  // Fetch user stats
  const { data: userStatsData } = useGetUserStatById(userId, {
    enabled: !!userId,
  });

  // Fetch conversation with this user (only enabled when they are friends)
  const { data: conversationData } = useGetConversationsByUserId(userId, {
    enabled:
      !!userId && userData?.payload.data.friendStatus === FriendStatus.Friends,
  });

  // Fetch events hosted by this user
  const { data: hostedEventsData, isLoading: isLoadingHostedEvents } =
    useGetEventHostById(
      userId,
      { hostId: userId, lang },
      { enabled: !!userId }
    );

  // Filter out cancelled and rejected events
  const filteredHostedEvents = useMemo(() => {
    if (!hostedEventsData?.payload.data.items) return [];
    return hostedEventsData.payload.data.items.filter(
      (event) => event.status !== "Cancelled" && event.status !== "Rejected"
    );
  }, [hostedEventsData]);

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
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
            <TabsTrigger value="organized">{t("tabs.organized")}</TabsTrigger>
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
                  merit={userStatsData?.payload?.data?.merit ?? 0}
                  streakDays={userStatsData?.payload?.data?.streakDays ?? 0}
                  friendsCount={userStatsData?.payload?.data?.friendsCount ?? 0}
                  postsCount={userStatsData?.payload?.data?.postsCount ?? 0}
                  createdEventsCount={
                    userStatsData?.payload?.data?.createdEventsCount ?? 0
                  }
                  joinedEventsCount={
                    userStatsData?.payload?.data?.joinedEventsCount ?? 0
                  }
                  planType={user.planType}
                />
              </div>
            </div>
          </TabsContent>

          {/* Organized Events Tab */}
          <TabsContent value="organized" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Event Organized */}
              <div className="space-y-6 lg:col-span-2">
                {isLoadingHostedEvents ? (
                  <div className="flex h-48 items-center justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                ) : filteredHostedEvents.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {filteredHostedEvents.map((event) => (
                        <div
                          key={event.id}
                          className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() =>
                            router.push(`/${locale}/event/${event.id}`)
                          }
                        >
                          <div className="flex gap-4">
                            {event.bannerUrl && (
                              <div className="relative h-24 w-24 flex-shrink-0">
                                <Image
                                  src={event.bannerUrl}
                                  alt={event.title}
                                  fill
                                  unoptimized
                                  className="rounded-md object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-base line-clamp-1 flex-1">
                                  {event.title}
                                </h4>
                                {event.status && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                      event.status === "Live"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : event.status === "Pending"
                                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                          : event.status === "Approved"
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            : event.status === "Completed"
                                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                    }`}
                                  >
                                    {event.status}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                <MarkdownRenderer
                                  content={event.description}
                                  className="prose-sm max-w-none [&_.mdxeditor]:border-0 [&_.mdxeditor]:p-0 [&_.mdxeditor]:min-h-0"
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-auto">
                                <span className="flex items-center gap-1.5">
                                  <IconCalendar className="h-3.5 w-3.5" />
                                  <span>
                                    {new Date(event.startAt).toLocaleDateString(
                                      locale,
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )}
                                  </span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <IconUsers className="h-3.5 w-3.5" />
                                  <span>
                                    {event.numberOfParticipants}/
                                    {event.capacity}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center text-muted-foreground">
                    {t("noEventsHosted")}
                  </div>
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
                  merit={userStatsData?.payload?.data?.merit ?? 0}
                  streakDays={userStatsData?.payload?.data?.streakDays ?? 0}
                  friendsCount={userStatsData?.payload?.data?.friendsCount ?? 0}
                  postsCount={userStatsData?.payload?.data?.postsCount ?? 0}
                  createdEventsCount={
                    userStatsData?.payload?.data?.createdEventsCount ?? 0
                  }
                  joinedEventsCount={
                    userStatsData?.payload?.data?.joinedEventsCount ?? 0
                  }
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
                    id: currentUserData?.payload.data.id || "",
                    name: currentUserData?.payload.data.name || "",
                    avatar: currentUserData?.payload.data.avatarUrl || "",
                    initials: (currentUserData?.payload.data.name || "")
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
                <ProfileStats
                  merit={userStatsData?.payload?.data?.merit ?? 0}
                  streakDays={userStatsData?.payload?.data?.streakDays ?? 0}
                  friendsCount={userStatsData?.payload?.data?.friendsCount ?? 0}
                  postsCount={userStatsData?.payload?.data?.postsCount ?? 0}
                  createdEventsCount={
                    userStatsData?.payload?.data?.createdEventsCount ?? 0
                  }
                  joinedEventsCount={
                    userStatsData?.payload?.data?.joinedEventsCount ?? 0
                  }
                  planType={user.planType}
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
