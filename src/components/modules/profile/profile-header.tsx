"use client";

import {
  IconCheck,
  IconEdit,
  IconFlag,
  IconGift,
  IconMessageCircle,
  IconShare,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";

import { MeritBadge } from "@/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FriendStatus } from "@/constants";
import { Gift } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileHeaderProps = {
  name: string;
  email: string;
  avatarUrl: string | null;
  merit: number;
  gender: string | null;
  introduction: string | null;
  isOnline?: boolean;
  variant?: "own" | "other";
  friendStatus?: string;
  onEdit?: () => void;
  onSendGift?: () => void;
  onShare?: () => void;
  onAddFriend?: () => void;
  onRejectFriend?: () => void;
  onChat?: () => void;
  onReport?: () => void;
};

export function ProfileHeader({
  name,
  email,
  avatarUrl,
  merit,
  gender,
  introduction,
  isOnline = true,
  variant = "own",
  friendStatus,
  onEdit,
  onSendGift,
  onShare,
  onAddFriend,
  onRejectFriend,
  onChat,
  onReport,
}: ProfileHeaderProps) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const router = useRouter();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Validate avatar URL
  const isValidAvatarUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };
  const handleBuyGift = () => {
    router.push(`/${locale}/gifts`);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg md:h-32 md:w-32">
                <AvatarImage
                  src={isValidAvatarUrl(avatarUrl) ? avatarUrl! : undefined}
                  alt={name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <AvatarFallback className="text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
              )}
            </div>

            <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {name}
                </h1>
                <p className="text-muted-foreground">{email}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <MeritBadge merit={merit} />
                {gender && (
                  <Badge variant="outline">{t(`gender.${gender}`)}</Badge>
                )}
              </div>

              {introduction && (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {introduction}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {variant === "own" && onEdit && (
            <div className="flex w-full flex-col gap-4 md:w-auto">
              <Button onClick={onEdit} size="sm" className="w-full md:w-auto">
                <IconEdit className="mr-2 h-4 w-4" />
                {t("edit")}
              </Button>
              <Button
                onClick={handleBuyGift}
                size="sm"
                className="w-full md:w-auto"
                variant="secondary"
              >
                <Gift className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {t("manageGift")}
              </Button>
            </div>
          )}

          {variant === "other" && (
            <div className="flex w-full flex-col gap-2 md:w-auto">
              {/* Friend Status Actions */}
              {friendStatus === FriendStatus.None && onAddFriend && (
                <Button
                  onClick={onAddFriend}
                  size="sm"
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  <IconUserPlus className="mr-2 h-4 w-4" />
                  {t("addFriend")}
                </Button>
              )}

              {friendStatus === FriendStatus.Sent && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="w-full md:w-auto"
                >
                  <IconUserPlus className="mr-2 h-4 w-4" />
                  {t("pending")}
                </Button>
              )}

              {friendStatus === FriendStatus.Received && (
                <div className="flex gap-2">
                  <Button
                    onClick={onAddFriend}
                    size="sm"
                    className="flex-1"
                    variant="outline"
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    {t("acceptFriend")}
                  </Button>
                  <Button
                    onClick={onRejectFriend}
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                  >
                    <IconX className="mr-2 h-4 w-4" />
                    {t("rejectFriend")}
                  </Button>
                </div>
              )}

              {friendStatus === FriendStatus.Friends && onChat && (
                <Button
                  onClick={onChat}
                  size="sm"
                  className="w-full md:w-auto"
                  variant="outline"
                >
                  <IconMessageCircle className="mr-2 h-4 w-4" />
                  {t("chat")}
                </Button>
              )}

              {/* Other Actions */}
              <div className="flex w-full flex-col gap-2 md:flex-row">
                {onSendGift && (
                  <Button
                    onClick={onSendGift}
                    size="sm"
                    className="flex-1 md:flex-none"
                  >
                    <IconGift className="h-4 w-4" />
                  </Button>
                )}
                {onShare && (
                  <Button
                    onClick={onShare}
                    size="sm"
                    variant="secondary"
                    className="flex-1 md:flex-none"
                  >
                    <IconShare className="h-4 w-4" />
                  </Button>
                )}
                {onReport && (
                  <Button
                    onClick={onReport}
                    size="sm"
                    variant="destructive"
                    className="flex-1 md:flex-none"
                  >
                    <IconFlag className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
