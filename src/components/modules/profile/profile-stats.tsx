"use client";

import {
  IconCalendarEvent,
  IconChartBar,
  IconClock,
  IconCrown,
  IconFlame,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanTypeEnum } from "@/constants";

type StatItem = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
};

type ProfileStatsProps = {
  totalSessions: number;
  averageRating: number;
  responseRate: number;
  totalHours: number;
  streakDays: number;
  eventsHosted: number;
  planType?: string;
};

export function ProfileStats({
  totalSessions,
  averageRating,
  responseRate,
  totalHours,
  streakDays,
  eventsHosted,
  planType,
}: ProfileStatsProps) {
  const t = useTranslations("profile");
  const tStats = useTranslations("profile");

  const isPlusUser =
    planType === PlanTypeEnum.PLUS || planType === PlanTypeEnum.PREMIUM;

  const stats: StatItem[] = [
    {
      label: t("stats.totalSessions"),
      value: totalSessions,
      icon: <IconChartBar className="h-4 w-4" />,
    },
    {
      label: t("stats.averageRating"),
      value: averageRating.toFixed(1),
      icon: <IconStar className="h-4 w-4" />,
    },
    {
      label: t("stats.responseRate"),
      value: `${responseRate}%`,
      icon: <IconTrendingUp className="h-4 w-4" />,
    },
    {
      label: t("stats.totalHours"),
      value: `${totalHours}h`,
      icon: <IconClock className="h-4 w-4" />,
    },
    {
      label: t("stats.streakDays"),
      value: streakDays,
      icon: <IconFlame className="h-4 w-4" />,
    },
    {
      label: t("stats.eventsHosted"),
      value: eventsHosted,
      icon: <IconCalendarEvent className="h-4 w-4" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tStats("stats.title")}</CardTitle>
          {isPlusUser && (
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-2">
                  <IconCrown className="h-5 w-5 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Plus User</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {stat.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
