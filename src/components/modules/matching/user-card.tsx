"use client";

import { IconSearch, IconSparkles, IconUserPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlanTypeEnum } from "@/constants";
import { UserMatchingItemType } from "@/models";
import Image from "next/image";

type UserCardProps = {
  user: UserMatchingItemType;
  onViewProfile: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
};

export function UserCard({ user, onViewProfile, onAddFriend }: UserCardProps) {
  const speakingLanguages = user.speakingLanguages || [];
  const learningLanguages = user.learningLanguages || [];
  const interests = user.interests || [];
  const t = useTranslations("matching.card");
  const tGender = useTranslations("common.gender");
  const [isOnline] = useState(Math.random() > 0.5); // Mock online status

  const initials = useMemo(() => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user.name]);

  // Check if user has Plus plan
  const isPlusUser =
    user.planType === PlanTypeEnum.PLUS ||
    user.planType === PlanTypeEnum.PREMIUM;

  // Validate avatar URL
  const isValidAvatarUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  return (
    <Card className="group flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-background shadow-md transition-transform group-hover:scale-105">
              <AvatarImage
                src={
                  isValidAvatarUrl(user.avatarUrl) ? user.avatarUrl! : undefined
                }
                alt={user.name}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <AvatarFallback className="text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{user.name}</CardTitle>
              {isPlusUser && (
                <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-0.5">
                  <IconSparkles className="h-3 w-3 text-white" />
                  <span className="text-xs font-bold text-white">PLUS</span>
                </div>
              )}
            </div>
            <CardDescription className="flex flex-wrap items-center gap-2">
              {user.gender && (
                <Badge variant="outline" className="text-xs">
                  {tGender(user.gender as any)}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {user.meritLevel}
              </Badge>
              <Badge
                variant={isOnline ? "default" : "outline"}
                className="text-xs"
              >
                {isOnline ? t("online") : t("offline")}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-4">
        {/* Introduction - Fixed height */}
        <div className="min-h-[2.5rem]">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {user.introduction || t("noIntroduction")}
          </p>
        </div>

        <Separator />

        {/* Languages - Fixed min height */}
        <div className="min-h-[4rem] space-y-2">
          {speakingLanguages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {t("speaks")}:
              </span>
              {speakingLanguages.slice(0, 3).map((lang) => (
                <Badge key={lang.id} variant="outline" className="text-xs">
                  {lang.name}
                </Badge>
              ))}
              {speakingLanguages.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{speakingLanguages.length - 3}
                </Badge>
              )}
            </div>
          )}

          {learningLanguages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {t("learning")}:
              </span>
              {learningLanguages.slice(0, 3).map((lang) => (
                <Badge key={lang.id} variant="secondary" className="text-xs">
                  {lang.name}
                </Badge>
              ))}
              {learningLanguages.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{learningLanguages.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Show placeholder if no languages */}
          {speakingLanguages.length === 0 && learningLanguages.length === 0 && (
            <p className="text-xs italic text-muted-foreground">
              {t("noLanguages")}
            </p>
          )}
        </div>

        <Separator />

        {/* Interests - Fixed min height */}
        <div className="min-h-[2rem]">
          {interests.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {t("interests")}:
              </span>
              {interests.slice(0, 3).map((interest) => (
                <Badge
                  key={interest.id}
                  variant="outline"
                  className="gap-1 text-xs"
                >
                  {interest.iconUrl && (
                    <div className="relative h-3 w-3 shrink-0 overflow-hidden rounded-sm">
                      <Image
                        src={interest.iconUrl}
                        alt={interest.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {interest.name}
                </Badge>
              ))}
              {interests.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{interests.length - 3}
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">
              {t("noInterests")}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onAddFriend?.(user.id)}
        >
          <IconUserPlus className="mr-2 h-4 w-4" />
          {t("addFriend")}
        </Button>
        <Button className="flex-1" onClick={() => onViewProfile(user.id)}>
          <IconSearch className="mr-2 h-4 w-4" />
          {t("viewProfile")}
        </Button>
      </CardFooter>
    </Card>
  );
}
