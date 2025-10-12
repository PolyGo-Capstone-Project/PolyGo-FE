"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ProfileInfoSectionProps = {
  experiencePoints: number;
  streakDays: number;
};

export function ProfileInfoSection({
  experiencePoints,
  streakDays,
}: ProfileInfoSectionProps) {
  const t = useTranslations("profile");
  const tXp = useTranslations("profile");
  const tStreak = useTranslations("profile");

  // Simple XP calculation (you can adjust this formula later)
  const currentLevel = Math.floor(experiencePoints / 500) + 1;
  const xpForCurrentLevel = (currentLevel - 1) * 500;
  const xpForNextLevel = currentLevel * 500;
  const xpProgress = experiencePoints - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = (xpProgress / xpNeeded) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t("sections.experiencePoints")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-lg px-4 py-1">
              {t("sections.level")} {currentLevel}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {xpProgress} / {xpNeeded} {tXp("xp.toNextLevel")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{experiencePoints}</p>
            <p className="text-xs text-muted-foreground">{tXp("xp.label")}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {xpNeeded - xpProgress} {tXp("xp.untilLevel")} {currentLevel + 1}
          </p>
        </div>

        {/* Streak Days */}
        {streakDays > 0 && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-orange-500/10 p-3 text-orange-600 dark:text-orange-400">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-medium">
                {streakDays}{" "}
                {streakDays > 1
                  ? tStreak("streak.days")
                  : tStreak("streak.day")}{" "}
                {tStreak("streak.label")}
              </p>
              <p className="text-xs text-muted-foreground">
                {tStreak("streak.keepItUp")}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
