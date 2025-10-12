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
