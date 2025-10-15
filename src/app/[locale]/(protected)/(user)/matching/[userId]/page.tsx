"use client";

import {
  IconArrowLeft,
  IconCalendar,
  IconCoin,
  IconFlame,
  IconShare,
  IconSparkles,
  IconTrophy,
  IconUserPlus,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from "@/components";
import { useGetUserProfile } from "@/hooks";
import { handleErrorApi } from "@/lib/utils";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("matching.profile");
  const tGender = useTranslations("common.gender");
  const tError = useTranslations("Error");

  const userId = params.userId as string;

  // Fetch user profile
  const {
    data: userData,
    isLoading,
    error: userError,
  } = useGetUserProfile(userId, { enabled: !!userId });

  const user = userData?.payload.data;

  // Extract languages and interests from user data (now properly typed)
  const speakingLanguages = user?.speakingLanguages || [];
  const learningLanguages = user?.learningLanguages || [];
  const interests = user?.interests || [];

  // Handle share profile
  const handleShare = () => {
    const url = `${window.location.origin}/${locale}/matching/${userId}`;
    navigator.clipboard.writeText(url);
    toast.success(t("linkCopied"));
  };

  // Handle add friend
  const handleAddFriend = () => {
    // TODO: Implement add friend functionality
    console.log("Add friend:", userId);
  };

  // Handle back
  const handleBack = () => {
    router.push(`/${locale}/matching`);
  };

  // Handle error
  if (userError) {
    handleErrorApi({ error: userError, tError });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 py-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">{tError("GetOne")}</p>
            <Button onClick={handleBack} className="mt-4">
              {t("back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Validate avatar URL - must be a valid URL starting with http/https
  const isValidAvatarUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <IconArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <IconShare className="mr-2 h-4 w-4" />
          {t("share")}
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage
                  src={
                    isValidAvatarUrl(user.avatarUrl)
                      ? user.avatarUrl!
                      : undefined
                  }
                  alt={user.name}
                  onError={(e) => {
                    // Hide broken image on error
                    e.currentTarget.style.display = "none";
                  }}
                />
                <AvatarFallback className="text-3xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {user.name}
                  </h1>
                  <p className="text-muted-foreground">{user.mail}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{user.meritLevel}</Badge>
                  {user.gender && (
                    <Badge variant="outline">
                      {tGender(user.gender as any)}
                    </Badge>
                  )}
                  {user.isNew && (
                    <Badge variant="default" className="gap-1">
                      <IconSparkles className="h-3 w-3" />
                      New Member
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleAddFriend}
              size="lg"
              className="w-full md:w-auto"
            >
              <IconUserPlus className="mr-2 h-5 w-5" />
              {t("addFriend")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("experiencePoints")}
            </CardTitle>
            <IconTrophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.experiencePoints ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("streakDays")}
            </CardTitle>
            <IconFlame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.streakDays ?? 0} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("balance")}
            </CardTitle>
            <IconCoin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.balance ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("memberSince")}
            </CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.createdAt
                ? (() => {
                    try {
                      return format(new Date(user.createdAt), "MMM yyyy");
                    } catch {
                      return "N/A";
                    }
                  })()
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("basicInfo")}</CardTitle>
            <CardDescription>{t("introduction")}</CardDescription>
          </CardHeader>
          <CardContent>
            {user.introduction ? (
              <p className="text-sm leading-relaxed">{user.introduction}</p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                {t("noIntroduction")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle>{t("languages")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Speaking Languages */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("speakingLanguages")}</h4>
              {speakingLanguages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {speakingLanguages.map((lang) => (
                    <Badge key={lang.id} variant="secondary">
                      {lang.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("noLanguages")}
                </p>
              )}
            </div>

            <Separator />

            {/* Learning Languages */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("learningLanguages")}</h4>
              {learningLanguages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {learningLanguages.map((lang) => (
                    <Badge key={lang.id} variant="outline">
                      {lang.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("noLanguages")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("interests")}</CardTitle>
          </CardHeader>
          <CardContent>
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest.id} variant="outline" className="gap-1">
                    <IconSparkles className="h-3 w-3" />
                    {interest.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("noInterests")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
