"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { LoadingSpinner } from "@/components/modules/loading";
import {
  ProfileAchievementsSection,
  ProfileGiftsSection,
  ProfileHeader,
  ProfileInfoSection,
  ProfileInterestsSection,
  ProfileLanguagesSection,
  ProfileStats,
} from "@/components/modules/profile";
import { useGetUserProfile } from "@/hooks";
import { handleErrorApi } from "@/lib/utils";

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

export default function UserProfilePage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("profile");
  const tError = useTranslations("Error");

  const userId = params.userId as string;

  // Fetch user profile
  const {
    data: userData,
    isLoading,
    error: userError,
  } = useGetUserProfile(userId, { enabled: !!userId });

  // Handle error
  if (userError) {
    handleErrorApi({ error: userError, tError });
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const user = userData?.payload.data;

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">{tError("GetOne")}</p>
      </div>
    );
  }

  // Extract data
  const speakingLanguages = user.speakingLanguages || [];
  const learningLanguages = user.learningLanguages || [];
  const interests = (user.interests || []).map((interest) => ({
    ...interest,
    description: interest.name, // Use name as description or provide a default
  }));

  // Handle share profile
  const handleShare = () => {
    const url = `${window.location.origin}/${locale}/matching/${userId}`;
    navigator.clipboard.writeText(url);
    toast.success(t("share") + " - " + "Link copied!");
  };

  // Handle send gift
  const handleSendGift = () => {
    // TODO: Implement send gift functionality
    console.log("Send gift to:", userId);
    toast.info("Send gift feature coming soon!");
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <ProfileHeader
        name={user.name}
        email={user.mail}
        avatarUrl={user.avatarUrl}
        meritLevel={user.meritLevel}
        gender={user.gender}
        introduction={user.introduction}
        isOnline={true} // Mock online status
        variant="other"
        onSendGift={handleSendGift}
        onShare={handleShare}
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
            streakDays={user.streakDays ?? 0}
            eventsHosted={MOCK_STATS.eventsHosted}
          />

          {/* XP & Level */}
          <ProfileInfoSection
            experiencePoints={user.experiencePoints ?? 0}
            streakDays={user.streakDays ?? 0}
          />
        </div>
      </div>
    </div>
  );
}
