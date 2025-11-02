"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  BookOpen,
  Clock,
  LineChart,
  Pencil,
  Star,
  Swords,
  Target,
  Trash2,
  Trophy,
  Users2,
} from "lucide-react";

/* ==================== Types & Mock API (chỉ dùng trong CreatedTab) ==================== */
type Difficulty = "easy" | "medium" | "hard";

type BaseSet = {
  id: string;
  title: string;
  description: string;
  language: string; // vi/en/fr...
  languageLabel: string;
  category: string; // food, business...
  level: Difficulty;
  wordCount: number;
  estTimeMin: number;
  plays: number;
};

type CreatedSet = BaseSet & {
  status: "approved" | "pending";
};

async function fetchCreatedSets(): Promise<{
  summary: {
    total: number;
    approved: number;
    plays: number;
    avgRating: number;
  };
  items: CreatedSet[];
}> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    summary: { total: 2, approved: 1, plays: 223, avgRating: 0.0 },
    items: [
      {
        id: "vn-food",
        title: "Vietnamese Food Vocabulary",
        description:
          "Learn essential Vietnamese food terms and cooking vocabulary",
        language: "vi",
        languageLabel: "Vietnamese",
        category: "food",
        level: "easy",
        wordCount: 6,
        estTimeMin: 8,
        plays: 156,
        status: "approved",
      },
      {
        id: "jp-tech",
        title: "Japanese Technology Terms",
        description: "Modern technology vocabulary in Japanese",
        language: "jp",
        languageLabel: "Japanese",
        category: "technology",
        level: "hard",
        wordCount: 3,
        estTimeMin: 18,
        plays: 67,
        status: "pending",
      },
    ],
  };
}

const LEVEL_BADGE_STYLE: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

/* ==================== UI ==================== */
export default function CreatedTab() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const [loading, setLoading] = useState(true);
  const [data, setData] =
    useState<Awaited<ReturnType<typeof fetchCreatedSets>>>();

  useEffect(() => {
    fetchCreatedSets().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const createdCount = data?.items.length ?? 0;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title={t("mysets.totalSets", { default: "Total Sets" })}
          value={data?.summary.total ?? 0}
          Icon={Target}
          color="text-blue-600"
        />
        <StatCard
          title={t("mysets.approved", { default: "Approved" })}
          value={data?.summary.approved ?? 0}
          Icon={Trophy}
          color="text-emerald-600"
        />
        <StatCard
          title={t("mysets.totalPlays", { default: "Total Plays" })}
          value={data?.summary.plays ?? 0}
          Icon={Users2}
          color="text-purple-600"
        />
        <StatCard
          title={t("mysets.avgRating", { default: "Avg Rating" })}
          value={(data?.summary.avgRating ?? 0).toFixed(1)}
          Icon={Star}
          color="text-yellow-600"
        />
      </div>

      {/* List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">
            {t("mysets.section.mySets", { default: "My Puzzle Sets" })}
          </CardTitle>
          <Badge variant="secondary">{createdCount} sets</Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <ListSkeleton />
          ) : data?.items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t("mysets.noCreatedSets", {
                default: "You haven't created any puzzle sets yet.",
              })}
            </div>
          ) : (
            data?.items.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border p-4 md:p-5 bg-card hover:bg-accent/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{s.title}</div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {s.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {s.wordCount} {t("meta.words", { default: "words" })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />~{s.estTimeMin}min
                      </div>
                      <div className="flex items-center gap-1">
                        <Swords className="h-4 w-4" />
                        {s.plays} {t("meta.plays", { default: "plays" })}
                      </div>
                      <StatusBadge status={s.status} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="gap-1">
                        {s.languageLabel}
                      </Badge>
                      <Badge variant="outline">{s.category}</Badge>
                      <Badge
                        className={LEVEL_BADGE_STYLE[s.level]}
                        variant="secondary"
                      >
                        {s.level}
                      </Badge>
                    </div>
                  </div>

                  {/* actions */}
                  <div className="flex flex-wrap items-center gap-2 md:pt-1 md:flex-col md:items-end">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="gap-2 h-9 px-3"
                        onClick={() =>
                          router.push(`/${locale}/game/${s.id}/stats`)
                        }
                      >
                        <LineChart className="h-4 w-4" />
                        {t("actions.stats", { default: "Stats" })}
                      </Button>
                      <Button
                        variant="ghost"
                        className="gap-2 h-9 px-3"
                        onClick={() =>
                          router.push(`/${locale}/game/${s.id}/leaderboard`)
                        }
                      >
                        <Trophy className="h-4 w-4" />
                        {t("actions.leaderboard", { default: "Leaderboard" })}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/${locale}/game/${s.id}/edit`)
                        }
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}

/* ==================== Small components (cục bộ) ==================== */
function StatCard({
  title,
  value,
  Icon,
  color,
}: {
  title: string;
  value: string | number;
  Icon: any;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4 flex items-center justify-between">
        <div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {title}
          </div>
          <div className="text-lg sm:text-xl font-semibold mt-1">{value}</div>
        </div>
        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color ?? ""}`} />
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: "approved" | "pending" }) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        Approved
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
      Pending Review
    </Badge>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
