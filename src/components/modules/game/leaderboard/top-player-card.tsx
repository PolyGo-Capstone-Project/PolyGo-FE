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
import { useMemo, useState } from "react";

// hooks gọi API
import { useWordsetLeaderboardQuery } from "@/hooks";

const mmss = (s: number) => {
  const m = Math.floor(s / 60).toString();
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
};

const timeAgo = (iso: string) => {
  try {
    const d = new Date(iso).getTime();
    const diff = Date.now() - d;
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
};

export default function TopPlayersCard({
  className,
  wordsetId,
  lang = "vi",
}: {
  className?: string;
  wordsetId?: string;
  lang?: string;
}) {
  const t = useTranslations();

  // (tuỳ tương lai) filter theo "all/week/month" – hiện backend chưa có param, nên chỉ UI
  const [range, setRange] = useState<"all" | "week" | "month">("all");

  const { data, isLoading } = useWordsetLeaderboardQuery(
    wordsetId,
    { lang, pageNumber: 1, pageSize: 10 },
    { enabled: Boolean(wordsetId) }
  );

  const rows = useMemo(() => {
    const src = data?.data?.items ?? [];
    return src.map((it) => ({
      id: `${it.player.id}-${it.rank}-${it.completedAt}`,
      name: it.player.name,
      avatar: it.player.avatarUrl || "",
      timeSec: it.completionTimeInSecs,
      isYou: it.isMe,
      score: it.score,
      mistakes: it.mistakes,
      hints: it.hintsUsed,
      lastPlayedAgo: timeAgo(it.completedAt),
    }));
  }, [data?.data?.items]);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base md:text-lg">
          {t("lb.topPlayers", { default: "Top Players" })}
        </CardTitle>
        <Select value={range} onValueChange={(v) => setRange(v as any)}>
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
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            {t("common.loading", { default: "Loading..." })}
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <div className="text-sm text-muted-foreground">
            {t("lb.noPlayers", { default: "No players yet." })}
          </div>
        )}

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
                  <AvatarFallback>
                    {row.name?.slice(0, 2)?.toUpperCase()}
                  </AvatarFallback>
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
