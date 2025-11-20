"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

type Creator = {
  id?: string;
  name: string;
  avatar?: string;
  createdAt?: string; // lấy từ wordset.createdAt
  rating?: number; // dùng wordset.averageRating
};

const DEFAULT_CREATOR: Creator = {
  id: undefined,
  name: "—",
  avatar: undefined,
  createdAt: undefined,
  rating: undefined,
};

export default function CreatorCard({
  creator,
  loading,
}: {
  creator?: Creator;
  loading?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const c = creator ?? DEFAULT_CREATOR;

  const createdDate = c.createdAt
    ? new Date(c.createdAt).toLocaleDateString()
    : t("lb.na", { default: "N/A" });
  const ratingText =
    typeof c.rating === "number"
      ? c.rating.toFixed(1)
      : t("lb.na", { default: "N/A" });

  const goToProfile = () => {
    if (c.id) {
      router.push(`/${locale}/matching/${c.id}`);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          {t("lb.creator", { default: "Created By" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">
            {t("common.loading", { default: "Loading..." })}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {c.avatar ? (
                  <AvatarImage src={c.avatar} alt={c.name} />
                ) : (
                  <AvatarFallback>
                    {c.name?.slice(0, 2)?.toUpperCase() || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="font-medium">
                  {c.name || t("lb.unknown", { default: "Unknown" })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("lb.createdOn", { default: "Created on" })} {createdDate} •{" "}
                  <Star className="inline h-3 w-3 -mt-0.5" /> {ratingText}{" "}
                  {t("lb.rating", { default: "rating" })}
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={goToProfile} disabled={!c.id}>
              {t("lb.messageCreator", { default: "Message Creator" })}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
