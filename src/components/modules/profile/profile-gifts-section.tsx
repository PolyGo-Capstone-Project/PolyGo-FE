"use client";

import { IconGift } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

type Gift = {
  id: string;
  name: string;
  value?: number;
  from: {
    name: string;
    avatarUrl: string | null;
  };
  message?: string;
  receivedAt: string;
  iconUrl?: string;
};

type ProfileGiftsSectionProps = {
  gifts: Gift[];
};

export function ProfileGiftsSection({ gifts }: ProfileGiftsSectionProps) {
  const t = useTranslations("profile");
  const tEmpty = useTranslations("profile");
  const tTime = useTranslations("profile");
  const tGifts = useTranslations("profile");

  // Calculate time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return tTime("timeAgo.today");
    if (diffInDays === 1) return tTime("timeAgo.yesterday");
    if (diffInDays < 7) return `${diffInDays}${tTime("timeAgo.daysAgo")}`;
    if (diffInDays < 30)
      return `${Math.floor(diffInDays / 7)}${tTime("timeAgo.weeksAgo")}`;
    return `${Math.floor(diffInDays / 30)}${tTime("timeAgo.monthsAgo")}`;
  };

  if (gifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconGift className="h-5 w-5" />
            {t("sections.gifts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {tEmpty("empty.noGifts")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconGift className="h-5 w-5" />
          {t("sections.gifts")} ({gifts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {gifts.map((gift) => (
            <div
              key={gift.id}
              className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              {/* Gift Icon/Image */}
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                {gift.iconUrl ? (
                  <Image
                    src={gift.iconUrl}
                    alt={gift.name}
                    fill
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <span className="text-2xl">{gift.name}</span>
                )}
              </div>

              {/* Gift Details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{gift.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={gift.from.avatarUrl || undefined} />
                        <AvatarFallback className="text-[8px]">
                          {gift.from.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {tGifts("gifts.from")} {gift.from.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {gift.value !== undefined && gift.value > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {gift.value} PC
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(gift.receivedAt)}
                    </span>
                  </div>
                </div>

                {/* Gift Message */}
                {gift.message && (
                  <p className="text-xs text-muted-foreground italic">
                    &quot;{gift.message}&quot;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
