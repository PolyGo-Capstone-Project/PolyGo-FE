"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function UpcomingEventsList({
  events,
  isLoading,
  t,
  locale,
}: {
  events: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    isPaid: boolean;
  }>;
  isLoading?: boolean;
  t: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {t("upcomingEvents.title", { defaultValue: "Sự kiện sắp tới" })}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${locale}/event`)}
          >
            {t("upcomingEvents.viewDashboard", { defaultValue: "Xem tất cả" })}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming events
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="flex gap-4 p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
              onClick={() => router.push(`/${locale}/event/${ev.id}`)}
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="font-semibold text-sm flex-1 line-clamp-1">
                    {ev.title}
                  </h3>
                  {ev.isPaid && (
                    <Badge variant="secondary" className="text-xs">
                      Paid
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {ev.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {ev.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {ev.time}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
