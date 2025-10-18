"use client";

import {
  IconGift,
  IconPackage,
  IconSend,
  IconShoppingBag,
  IconSparkles,
  IconTrendingUp,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type GiftQuickStatsProps = {
  locale: string;
  stats?: {
    totalPurchased?: number;
    totalSent?: number;
    totalReceived?: number;
    totalValue?: number;
  };
};

export function GiftQuickStats({ locale, stats }: GiftQuickStatsProps) {
  const t = useTranslations("gift");

  const quickStats = [
    {
      label: "Purchased",
      value: stats?.totalPurchased || 0,
      icon: IconShoppingBag,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-500",
    },
    {
      label: "Sent",
      value: stats?.totalSent || 0,
      icon: IconSend,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-500",
    },
    {
      label: "Received",
      value: stats?.totalReceived || 0,
      icon: IconGift,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      textColor: "text-green-500",
    },
    {
      label: "Inventory",
      value: stats?.totalValue || 0,
      icon: IconPackage,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconSparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Gift Overview</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${locale}/gifts`}>View All</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity group-hover:opacity-5`}
                />

                <CardContent className="relative p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`rounded-lg ${stat.bgColor} p-2.5`}>
                      <Icon className={`h-5 w-5 ${stat.textColor}`} />
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  {stat.value > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
                      <IconTrendingUp className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Action Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="relative overflow-hidden border-2 border-dashed">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5 blur-2xl" />
          <CardContent className="relative flex items-center justify-between p-6">
            <div className="space-y-1">
              <h4 className="font-semibold">Explore Gift Shop</h4>
              <p className="text-sm text-muted-foreground">
                Discover amazing gifts for your friends
              </p>
            </div>
            <Button asChild>
              <Link href={`/${locale}/gifts`} className="gap-2">
                <IconGift className="h-4 w-4" />
                Browse Gifts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
