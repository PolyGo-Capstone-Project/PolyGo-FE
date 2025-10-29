"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

// Định nghĩa kiểu dữ liệu cho một Chat Item
export interface RecentChatItemType {
  id: string | number;
  name: string; // Thay đổi từ 'avatar' (string) sang 'avatarUrl' (string | null | undefined)
  avatarUrl?: string | null;
  last: string;
  ago: string;
}

// Định nghĩa Props cho component RecentChats
interface RecentChatsProps {
  chats: RecentChatItemType[]; // Thêm các hàm tiện ích vào Props
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
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg font-bold text-slate-900">
          {t("recentChats.title", { defaultValue: "Cuộc trò chuyện gần đây" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {chats.map((c) => {
          // Logic kiểm tra và hiển thị Avatar/Initials
          const hasAvatar = isValidAvatarUrl(c.avatarUrl);
          const initials = getInitials(c.name);

          return (
            <div
              key={c.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {/* Khối Avatar/Initials đã được cập nhật */}
              <div
                className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center 
                ${hasAvatar ? "" : "bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-medium text-sm"}`}
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
                {hasAvatar
                  ? // Nếu có avatar, sử dụng một div rỗng hoặc thẻ img (tùy thuộc vào styling)
                    // Trong trường hợp này, style background-image được sử dụng trên div cha
                    null
                  : initials // Hiển thị chữ viết tắt
                }
              </div>

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
          );
        })}
      </CardContent>
    </Card>
  );
}
