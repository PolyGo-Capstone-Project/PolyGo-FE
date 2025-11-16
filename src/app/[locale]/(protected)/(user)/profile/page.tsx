"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

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
  EditProfileDialog,
  LoadingSpinner,
  ProfileBadgesSection,
  ProfileGiftsSection,
  ProfileHeader,
  ProfileInfoSection,
  ProfileInterestsSection,
  ProfileLanguagesSection,
  ProfileStats,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components";
import { useUserCommunicationHubContext } from "@/components/providers";
import {
  useAuthMe,
  useCurrentSubscriptionQuery,
  useMyReceivedGiftsQuery,
  useUserBadgesQuery,
  useUserInterestsQuery,
  useUserLanguagesLearningQuery,
  useUserLanguagesSpeakingQuery,
} from "@/hooks";
import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

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
    createdAt: gift.createdAt,
    iconUrl: gift.giftIconUrl,
    status: gift.status,
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
