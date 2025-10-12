"use client";

import {
  IconCalendarEvent,
  IconChartBar,
  IconClock,
  IconFlame,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
};

export function ProfileStats({
  totalSessions,
  averageRating,
  responseRate,
  totalHours,
  streakDays,
  eventsHosted,
}: ProfileStatsProps) {
  const t = useTranslations("profile.stats");

  const stats: StatItem[] = [
    {
      label: t("totalSessions"),
      value: totalSessions,
      icon: <IconChartBar className="h-4 w-4" />,
    },
    {
      label: t("averageRating"),
      value: averageRating.toFixed(1),
      icon: <IconStar className="h-4 w-4" />,
    },
    {
      label: t("responseRate"),
      value: `${responseRate}%`,
      icon: <IconTrendingUp className="h-4 w-4" />,
    },
    {
      label: t("totalHours"),
      value: `${totalHours}h`,
      icon: <IconClock className="h-4 w-4" />,
    },
    {
      label: t("streakDays"),
      value: streakDays,
      icon: <IconFlame className="h-4 w-4" />,
    },
    {
      label: t("eventsHosted"),
      value: eventsHosted,
      icon: <IconCalendarEvent className="h-4 w-4" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Statistics</CardTitle>
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
