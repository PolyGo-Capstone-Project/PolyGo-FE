"use client";

import { IconTrophy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BadgeItem = {
  id: string;
  name: string;
  iconUrl: string | null;
  lang?: string;
};

type ProfileBadgesSectionProps = {
  badges: BadgeItem[];
};

export function ProfileBadgesSection({ badges }: ProfileBadgesSectionProps) {
  const t = useTranslations("profile");

  if (badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconTrophy className="h-5 w-5" />
            {t("sections.badges")}
            <Badge variant="secondary" className="ml-auto">
              0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <IconTrophy className="mb-2 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("badges.noBadges")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconTrophy className="h-5 w-5" />
          {t("sections.badges")}
          <Badge variant="secondary" className="ml-auto">
            {badges.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {badges.map((badge) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border bg-card p-4 transition-all hover:bg-muted/50">
                    {badge.iconUrl ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-full">
                        <Image
                          src={badge.iconUrl}
                          alt={badge.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <IconTrophy className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <p className="line-clamp-2 text-center text-xs font-medium">
                      {badge.name}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs space-y-1">
                    <p className="font-semibold">{badge.name}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
