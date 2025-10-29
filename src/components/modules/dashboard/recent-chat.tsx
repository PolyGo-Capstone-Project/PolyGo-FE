"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export interface RecentChatItemType {
  id: string | number;
  name: string;
  avatarUrl?: string | null;
  last: string;
  ago: string;
}

interface RecentChatsProps {
  chats: RecentChatItemType[];
  isValidAvatarUrl: (url?: string | null) => boolean;
  getInitials: (name: string) => string;
}

export function RecentChats({
  chats,
  isValidAvatarUrl,
  getInitials,
}: RecentChatsProps) {
  const t = useTranslations("dashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t("recentChats.title", { defaultValue: "Cuộc trò chuyện gần đây" })}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1">
        {chats.map((c) => {
          const hasAvatar = isValidAvatarUrl(c.avatarUrl);
          const initials = getInitials(c.name);

          return (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                  hasAvatar
                    ? ""
                    : "bg-primary/10 text-primary font-semibold text-sm"
                }`}
                style={
                  hasAvatar
                    ? {
                        backgroundImage: `url(${c.avatarUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}
                }
              >
                {hasAvatar ? null : initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {c.last}
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex-shrink-0">
                {c.ago}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
