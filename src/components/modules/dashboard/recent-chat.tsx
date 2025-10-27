"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function RecentChats({
  chats,
}: {
  chats: Array<{
    id: string | number;
    name: string;
    last: string;
    ago: string;
  }>;
}) {
  const t = useTranslations("dashboard");
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg font-bold text-slate-900">
          {t("recentChats.title", { defaultValue: "Cuộc trò chuyện" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {chats.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {c.name}
              </div>
              <div className="text-xs text-slate-500 truncate">{c.last}</div>
            </div>
            <div className="text-[11px] text-slate-400 flex-shrink-0">
              {c.ago}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
