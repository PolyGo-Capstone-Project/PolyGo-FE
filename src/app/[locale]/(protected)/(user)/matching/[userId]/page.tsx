"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  LoadingSpinner,
  ProfileBadgesSection,
  ProfileGiftsSection,
  ProfileHeader,
  ProfileInfoSection,
  ProfileInterestsSection,
  ProfileLanguagesSection,
  ProfileStats,
  SendGiftDialog,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  UserNotFound,
} from "@/components";
import { useUserCommunicationHubContext } from "@/components/providers";
import { FriendStatus } from "@/constants";
import {
  useAcceptFriendRequestMutation,
  useGetConversationsByUserId,
  useGetUserProfile,
  useRejectFriendRequestMutation,
  useSendFriendRequestMutation,
} from "@/hooks";
import { showErrorToast, showSuccessToast } from "@/lib";
import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// Mock data for features not yet implemented
const MOCK_STATS = {
  totalSessions: 45,
  averageRating: 4.8,
  responseRate: 95,
  totalHours: 150,
  eventsHosted: 2,
};

// Mock posts data
const MOCK_POSTS = [
  {
    id: "1",
    content:
      "Just finished an amazing language exchange session! 🎉 Learning Japanese has been such a rewarding journey. Anyone else learning Japanese?",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likes: 15,
    comments: 3,
  },
  {
    id: "2",
    content:
      "Looking for practice partners for Spanish conversation. Intermediate level, interested in discussing culture and daily life topics.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    likes: 8,
    comments: 5,
  },
  {
    id: "3",
    content:
      "Pro tip: Watching movies with subtitles in your target language is a game changer! 🎬",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    likes: 23,
    comments: 7,
  },
];

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
      name: gift.isAnonymous ? "Anonymous" : gift.senderName,
      avatarUrl: gift.isAnonymous ? null : gift.senderAvatarUrl,
    },
    message: gift.message,
    createdAt: gift.createdAt,
    iconUrl: gift.iconUrl,
    status: gift.status,
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
              <div className="space-y-6 lg:col-span-2">
                {MOCK_POSTS.length > 0 ? (
                  MOCK_POSTS.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatarUrl ?? undefined} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{user.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {user.merit}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(post.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{post.content}</p>
                      </CardContent>
                      <Separator />
                      <CardFooter className="pt-4">
                        <div className="flex w-full items-center gap-4">
                          <Button variant="ghost" size="sm">
                            <IconHeart className="mr-2 h-4 w-4" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <IconMessageCircle className="mr-2 h-4 w-4" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <IconShare className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex h-64 items-center justify-center">
                      <p className="text-muted-foreground">
                        {t("social.noPosts")}
                      </p>
                    </CardContent>
                  </Card>
                )}
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
    </>
  );
}
