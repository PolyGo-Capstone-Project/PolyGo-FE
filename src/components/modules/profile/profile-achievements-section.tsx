"use client";

import { IconTrophy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
};

type ProfileAchievementsSectionProps = {
  achievements: Achievement[];
};

export function ProfileAchievementsSection({
  achievements,
}: ProfileAchievementsSectionProps) {
  const t = useTranslations("profile");
  const tAchievements = useTranslations("profile");

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconTrophy className="h-5 w-5" />
          {t("sections.achievements")}
          <Badge variant="secondary" className="ml-auto">
            {unlockedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {achievements.map((achievement) => (
            <TooltipProvider key={achievement.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                      achievement.isUnlocked
                        ? "bg-card hover:bg-muted/50 cursor-pointer"
                        : "bg-muted/50 opacity-50 grayscale"
                    }`}
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                    <p className="text-center text-xs font-medium line-clamp-2">
                      {achievement.name}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs space-y-1">
                    <p className="font-semibold">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <p className="text-xs text-muted-foreground">
                        {tAchievements("achievements.unlocked")}:{" "}
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
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
