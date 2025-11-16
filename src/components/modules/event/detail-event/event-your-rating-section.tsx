"use client";

import { IconEdit, IconLoader2, IconStar } from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

interface EventYourRatingSectionProps {
  isLoadingMyRating: boolean;
  myRating?: {
    hasRating: boolean;
    id?: string | null;
    rating?: number | null;
    comment?: string | null;
    createdAt?: string | null;
  };
  currentUser?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  onOpenRatingDialog: () => void;
  renderStars: (value?: number | null) => React.ReactNode;
  isValidAvatarUrl: (url: string | null | undefined) => boolean;
}

export function EventYourRatingSection({
  isLoadingMyRating,
  myRating,
  currentUser,
  onOpenRatingDialog,
  renderStars,
  isValidAvatarUrl,
}: EventYourRatingSectionProps) {
  const t = useTranslations("event.detail");

  return (
    <Card className="shadow-lg mt-8 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <IconStar className="h-6 w-6 text-yellow-500" />
            {myRating?.hasRating
              ? t("ratings.yourRatingTitle")
              : t("ratings.rateThisEvent")}
          </CardTitle>
          {myRating?.hasRating && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenRatingDialog}
              className="gap-2"
            >
              <IconEdit className="h-4 w-4" />
              {t("ratings.editRatingButton")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingMyRating ? (
          <div className="flex items-center justify-center gap-2 py-8">
            <IconLoader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              {t("ratings.loadingYourRating")}
            </span>
          </div>
        ) : myRating?.hasRating ? (
          <div className="space-y-4">
            {/* User's own rating card */}
            <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-background rounded-lg p-5 space-y-4 border border-primary/10">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                    <AvatarImage
                      src={
                        currentUser?.avatarUrl &&
                        isValidAvatarUrl(currentUser.avatarUrl)
                          ? currentUser.avatarUrl
                          : undefined
                      }
                      alt={currentUser?.name || "You"}
                    />
                    <AvatarFallback className="text-base font-semibold bg-primary/10">
                      {currentUser?.name
                        ? currentUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "ME"}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold text-base">
                      {currentUser?.name || "You"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(myRating.rating)}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-muted-foreground">
                  {myRating.createdAt
                    ? format(new Date(myRating.createdAt), "PPP")
                    : ""}
                </span>
              </div>

              {/* Comment section */}
              {myRating.comment ? (
                <div className="pl-[60px]">
                  <p className="text-sm text-foreground leading-relaxed">
                    {myRating.comment}
                  </p>
                </div>
              ) : (
                <div className="pl-[60px]">
                  <p className="text-sm text-muted-foreground italic">
                    {t("ratings.noComment")}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <IconStar className="h-16 w-16 text-muted-foreground/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <IconStar className="h-8 w-8 text-yellow-500/40 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {t("ratings.noRatingYet")}
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {t("ratings.shareYourThoughts")}
              </p>
            </div>
            <Button size="lg" onClick={onOpenRatingDialog} className="gap-2">
              <IconStar className="h-4 w-4" />
              {t("ratings.rateButton")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
