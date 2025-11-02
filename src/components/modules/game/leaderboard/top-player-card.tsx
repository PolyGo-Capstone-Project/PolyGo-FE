"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Medal } from "lucide-react";
import { useTranslations } from "next-intl";

type LeaderRow = {
  id: string;
  name: string;
  avatar?: string;
  timeSec: number;
  isYou?: boolean;
  score: number;
  mistakes: number;
  hints: number;
  lastPlayedAgo: string;
};

const DEFAULT_LEADERS: LeaderRow[] = [
  {
    id: "1",
    name: "NguyenMinh",
    avatar: "https://i.pravatar.cc/150?img=5",
    timeSec: 145,
    isYou: true,
    score: 98,
    mistakes: 0,
    hints: 0,
    lastPlayedAgo: "2d ago",
  },
  {
    id: "2",
    name: "JohnEN",
    avatar: "https://i.pravatar.cc/150?img=53",
    timeSec: 190,
    score: 85,
    mistakes: 2,
    hints: 1,
    lastPlayedAgo: "4d ago",
  },
];

const mmss = (s: number) => {
  const m = Math.floor(s / 60).toString();
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
};

export default function TopPlayersCard({
  className,
  leaders,
}: {
  className?: string;
  leaders?: LeaderRow[];
}) {
  const t = useTranslations();
  const rows = leaders ?? DEFAULT_LEADERS;

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base md:text-lg">
          {t("lb.topPlayers", { default: "Top Players" })}
        </CardTitle>
        <Select defaultValue="all">
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("lb.range", { default: "All Time" })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("lb.rangeAll", { default: "All Time" })}
            </SelectItem>
            <SelectItem value="week">
              {t("lb.rangeWeek", { default: "This Week" })}
            </SelectItem>
            <SelectItem value="month">
              {t("lb.rangeMonth", { default: "This Month" })}
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={`rounded-lg border p-4 flex items-center justify-between gap-3 ${
              row.isYou ? "bg-amber-50 dark:bg-amber-950/30" : "bg-card"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                {i === 0 ? (
                  <Medal className="h-4 w-4 text-amber-500" />
                ) : (
                  <Medal className="h-4 w-4 text-slate-400" />
                )}
              </div>

              <Avatar className="h-8 w-8">
                {row.avatar ? (
                  <AvatarImage src={row.avatar} alt={row.name} />
                ) : (
                  <AvatarFallback>{row.name.slice(0, 2)}</AvatarFallback>
                )}
              </Avatar>

              <div className="min-w-0">
                <div className="font-medium truncate">
                  {row.name}{" "}
                  {row.isYou && (
                    <Badge className="ml-1" variant="secondary">
                      {t("lb.you", { default: "You" })}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {row.lastPlayedAgo}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm hidden sm:flex gap-3 text-muted-foreground">
                <span>☆ {row.score}</span>
                <span>Ⓧ {row.mistakes}</span>
                <span>💡 {row.hints}</span>
              </div>
              <div className="text-lg font-semibold">{mmss(row.timeSec)}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
