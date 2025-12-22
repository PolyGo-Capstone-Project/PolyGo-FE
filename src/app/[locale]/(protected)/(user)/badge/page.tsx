"use client";

import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { LoadingSpinner } from "@/components";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import { useUserBadgesAllQuery } from "@/hooks"; // ✅ hook mới
import { PaginationLangQueryType } from "@/models";

const buildParams = (lang: string): PaginationLangQueryType => ({
  lang,
  pageNumber: -1,
  pageSize: -1,
});

type BadgeState = "locked" | "unlocked";

export default function BadgesPage() {
  const t = useTranslations("userBadge");
  const router = useRouter();
  const locale = useLocale();
  const lang = useMemo(() => (locale ? locale.split("-")[0] : "en"), [locale]);

  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  const { data, isLoading } = useUserBadgesAllQuery({
    params: buildParams(lang),
  });

  const items =
    data?.payload?.data?.items
      ?.slice()
      // sort để badge đã mở khóa lên trước (không phụ thuộc badgeCategory/has)
      ?.sort((a, b) => {
        const aUnlocked = Boolean(a?.has ?? a?.isClaimed);
        const bUnlocked = Boolean(b?.has ?? b?.isClaimed);
        return Number(bUnlocked) - Number(aUnlocked);
      }) ?? [];

  const filtered = showOnlyUnlocked
    ? items.filter((x) => Boolean(x?.has ?? x?.isClaimed))
    : items;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-8xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {t("title", { default: "Badges" })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle", {
              default:
                "Explore all badges available in PolyGo — unlock them by leveling up, joining events, and contributing to the community.",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showOnlyUnlocked ? "default" : "outline"}
            size="sm"
            className="rounded-full px-4"
            onClick={() => setShowOnlyUnlocked((v) => !v)}
          >
            {showOnlyUnlocked
              ? t("filters.showAll", { default: "Show all" })
              : t("filters.unlockedOnly", { default: "Unlocked only" })}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4"
            onClick={() => router.push(`/${locale || "en"}/profile`)}
          >
            {t("backToProfile", { default: "Back to profile" })}
          </Button>
        </div>
      </div>

      {/* Summary card */}
      <Card className="border-primary/10 bg-primary/5">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("summary.title", { default: "Your Badge Collection" })}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {t("summary.desc", {
                default:
                  "Badges are proof of progress — each one celebrates a milestone in your journey.",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold md:text-sm">
            <span className="text-muted-foreground">
              {t("summary.unlocked", { default: "Unlocked" })}:
            </span>
            <span className="text-primary">
              {items.filter((x) => Boolean(x?.has ?? x?.isClaimed)).length}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{items.length}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Grid badges */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl border bg-muted/20 p-10">
          <p className="text-sm text-muted-foreground">
            {t("empty", { default: "No badges found." })}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((badge) => {
            // ✅ “bỏ qua has” trong UI, nhưng fallback để không sai hiện tại
            const unlocked = Boolean(badge?.has ?? badge?.isClaimed);
            const state: BadgeState = unlocked ? "unlocked" : "locked";

            const cardBase =
              "relative overflow-hidden rounded-2xl border p-5 transition-shadow";
            const cardState =
              state === "locked"
                ? "bg-muted/25 opacity-75"
                : "border-primary/60 bg-primary/10 shadow-lg shadow-primary/20";

            const pillClass =
              state === "locked"
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground";

            return (
              <div key={badge.id} className={`${cardBase} ${cardState}`}>
                {/* lock overlay */}
                {state === "locked" && (
                  <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>{t("status.locked", { default: "Locked" })}</span>
                  </div>
                )}

                {/* unlocked pill */}
                {state === "unlocked" && (
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-100">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t("status.unlocked", { default: "Unlocked" })}</span>
                  </div>
                )}

                {/* icon */}
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background/60 ring-1 ring-border">
                    {badge.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={badge.iconUrl}
                        alt={badge.name}
                        className={`h-10 w-10 object-contain ${
                          state === "locked" ? "grayscale" : ""
                        }`}
                      />
                    ) : (
                      <Sparkles className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0 h-40 flex-1 space-y-2">
                    {/* code/tag */}
                    <div
                      className={`inline-flex max-w-full items-center rounded-full px-3 py-1 text-[11px] font-semibold md:text-xs ${pillClass}`}
                      title={badge.badgeCategory}
                    >
                      <span className="truncate">
                        {t(`badgeCategory.${badge.badgeCategory}`)}
                      </span>
                    </div>

                    {/* name */}
                    <h3 className="line-clamp-1 text-base font-semibold md:text-lg">
                      {badge.name}
                    </h3>

                    {/* description (điều kiện) */}
                    <p className="line-clamp-4 text-sm text-muted-foreground md:text-[15px]">
                      {badge.description ||
                        t("noDescription", {
                          default:
                            "Complete milestones in the app to unlock this badge.",
                        })}
                    </p>
                  </div>
                </div>

                {/* bottom hint */}
                <div className="mt-4 border-t pt-3">
                  {state === "locked" ? (
                    <p className="text-[11px] text-muted-foreground md:text-xs">
                      {t("hint.locked", {
                        default:
                          "Keep going — participate more and you’ll unlock this badge soon.",
                      })}
                    </p>
                  ) : (
                    <p className="text-[11px] text-primary md:text-xs">
                      {t("hint.unlocked", {
                        default:
                          "Nice! This badge is already in your collection.",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
