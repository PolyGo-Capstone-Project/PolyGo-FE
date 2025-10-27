"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function UpcomingEventsList({
  events,
  t,
  locale,
}: {
  events: Array<{
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    isPlus: boolean;
  }>;
  t: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const router = useRouter();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900">
            {t("upcomingEvents.title", { defaultValue: "Sự kiện sắp tới" })}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-semibold"
            onClick={() => router.push(`/${locale}/event`)}
          >
            {t("upcomingEvents.viewDashboard", { defaultValue: "View All" })} →
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-3">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex gap-4 p-4 rounded-lg border border-slate-200 hover:border-purple-200 hover:bg-purple-50/30 transition-all"
          >
            <div className="text-3xl flex-shrink-0">📅</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-semibold text-sm text-slate-900 truncate">
                  {ev.title}
                </div>
                {ev.isPlus ? (
                  <Badge className="bg-indigo-600 text-white text-[10px] rounded-full flex-shrink-0">
                    Plus
                  </Badge>
                ) : null}
              </div>
              <div className="text-xs text-slate-600 mb-2 line-clamp-1">
                {ev.description}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                <span>📅 {ev.date}</span>
                <span>🕒 {ev.time}</span>
              </div>
              <Button
                size="sm"
                className="text-xs bg-indigo-600 hover:bg-indigo-700"
              >
                {t("upcomingEvents.join", { defaultValue: "Tham gia" })}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
