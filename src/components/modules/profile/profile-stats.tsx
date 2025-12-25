"use client";

import {
  IconCalendarEvent,
  IconCrown,
  IconFileText,
  IconFlame,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanTypeEnum } from "@/constants";

type StatItem = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  description?: string;
};

type ProfileStatsProps = {
  merit: number;
  streakDays: number;
  friendsCount: number;
  postsCount: number;
  createdEventsCount: number;
  joinedEventsCount: number;
  planType?: string;
};

export function ProfileStats({
  merit,
  streakDays,
  friendsCount,
  postsCount,
  createdEventsCount,
  joinedEventsCount,
  planType,
}: ProfileStatsProps) {
  const t = useTranslations("profile");
  const tStats = useTranslations("profile");

  const isPlusUser =
    planType === PlanTypeEnum.PLUS || planType === PlanTypeEnum.PREMIUM;

  const stats: StatItem[] = [
    {
      label: t("stats.merit"),
      value: merit,
      icon: <IconTrophy className="h-4 w-4" />,
      iconBg: "from-amber-500 to-yellow-600",
    },
    {
      label: t("stats.streakDays"),
      value: streakDays,
      icon: <IconFlame className="h-4 w-4" />,
      iconBg: "from-orange-500 to-red-600",
    },
    {
      label: t("stats.friendsCount"),
      value: friendsCount,
      icon: <IconUsers className="h-4 w-4" />,
      iconBg: "from-blue-500 to-cyan-600",
    },
    {
      label: t("stats.postsCount"),
      value: postsCount,
      icon: <IconFileText className="h-4 w-4" />,
      iconBg: "from-purple-500 to-pink-600",
    },
    {
      label: t("stats.createdEventsCount"),
      value: createdEventsCount,
      icon: <IconCalendarEvent className="h-4 w-4" />,
      iconBg: "from-green-500 to-emerald-600",
    },
    {
      label: t("stats.joinedEventsCount"),
      value: joinedEventsCount,
      icon: <IconCalendarEvent className="h-4 w-4" />,
      iconBg: "from-indigo-500 to-purple-600",
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
              <div className="relative">
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${stat.iconBg} opacity-50 blur-md animate-pulse`}
                />
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${stat.iconBg} shadow-lg`}
                >
                  <div className="text-white">{stat.icon}</div>
                </div>
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
