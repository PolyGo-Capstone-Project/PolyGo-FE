"use client";

import { IconLoader2, IconStar } from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

interface RatingItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface EventAllRatingsSectionProps {
  isLoadingEventRatings: boolean;
  allRatingItems: RatingItem[];
  renderStars: (value?: number | null) => React.ReactNode;
  isValidAvatarUrl: (url: string | null | undefined) => boolean;
}

export function EventAllRatingsSection({
  isLoadingEventRatings,
  allRatingItems,
  renderStars,
  isValidAvatarUrl,
}: EventAllRatingsSectionProps) {
  const t = useTranslations("event.detail");
  const [starFilter, setStarFilter] = useState<number | null>(null);

  // Filter ratings based on star selection
  const ratingItems = starFilter
    ? allRatingItems.filter((r) => r.rating === starFilter)
    : allRatingItems;

  // Calculate star distribution
  const starDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allRatingItems.filter((r) => r.rating === star).length,
  }));

  const getReviewCountText = (count: number, stars?: number) => {
    if (stars !== undefined) {
      return t("ratings.filter.reviewsWith", { count, stars });
    }
    return t("ratings.filter.reviewsTotal", { count });
  };

  return (
    <Card className="shadow-lg mt-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {t("ratings.allRatingsTitle")}
        </CardTitle>
        {allRatingItems.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {starFilter
                ? getReviewCountText(ratingItems.length, starFilter)
                : getReviewCountText(allRatingItems.length)}
            </p>

            {/* Star filter buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={starFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setStarFilter(null)}
                className="gap-1.5"
              >
                {t("ratings.filter.all")}
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {allRatingItems.length}
                </Badge>
              </Button>
              {starDistribution.map(({ star, count }) => (
                <Button
                  key={star}
                  variant={starFilter === star ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStarFilter(star)}
                  className="gap-1.5"
                  disabled={count === 0}
                >
                  <span className="flex items-center gap-1">
                    {star}
                    <span className="text-yellow-500">★</span>
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-1 px-1.5 py-0 text-xs"
                  >
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoadingEventRatings ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <IconLoader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{t("ratings.loadingReviews")}</span>
          </div>
        ) : ratingItems.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="flex justify-center">
              <IconStar className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <p className="text-base font-medium text-muted-foreground">
              {starFilter
                ? t("ratings.filter.noStarReviews", { stars: starFilter })
                : t("ratings.noRatingsFound")}
            </p>
            <p className="text-sm text-muted-foreground">
              {starFilter
                ? t("ratings.filter.tryDifferentFilter")
                : t("ratings.filter.beFirstToShare")}
            </p>
            {starFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStarFilter(null)}
                className="mt-2"
              >
                {t("ratings.filter.clearFilter")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {ratingItems.map((r) => {
              const userInitials = r.user?.name
                ? r.user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "??";

              return (
                <div
                  key={r.id}
                  className="bg-muted/30 rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  {/* User info and rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* User Avatar */}
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage
                          src={
                            isValidAvatarUrl(r.user?.avatarUrl)
                              ? r.user.avatarUrl!
                              : undefined
                          }
                          alt={r.user?.name || "User"}
                        />
                        <AvatarFallback className="text-sm font-semibold bg-primary/10">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>

                      {/* User name and date */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate">
                          {r.user?.name || "Anonymous User"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {renderStars(r.rating)}
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {r.createdAt
                              ? format(new Date(r.createdAt), "PPP")
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  {r.comment ? (
                    <p className="text-sm text-foreground leading-relaxed pl-[52px]">
                      {r.comment}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic pl-[52px]">
                      {t("ratings.noCommentAll")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
