"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageEnum,
  MessageTypeNumber,
} from "@/constants/communication.constant";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export interface RecentChatItemType {
  id: string | number;
  name: string;
  avatarUrl?: string | null;
  last: string;
  ago: string;
  messageType?: string | number;
  imageUrls?: string[];
  isTyping?: boolean;
}

interface RecentChatsProps {
  chats: RecentChatItemType[];
  isValidAvatarUrl: (url?: string | null) => boolean;
  getInitials: (name: string) => string;
  locale: string;
}

export function RecentChats({
  chats,
  isValidAvatarUrl,
  getInitials,
  locale,
}: RecentChatsProps) {
  const t = useTranslations("dashboard");
  const tChat = useTranslations("chat");
  const router = useRouter();

  const handleChatClick = (conversationId: string | number) => {
    router.push(`/${locale}/chat?conversationId=${conversationId}`);
  };

  const renderLastMessage = (chat: RecentChatItemType) => {
    if (chat.isTyping) {
      return (
        <span className="text-primary text-xs italic">{tChat("typing")}</span>
      );
    }

    if (!chat.messageType) {
      return (
        <span className="text-muted-foreground truncate text-xs">
          {chat.last}
        </span>
      );
    }

    const type = chat.messageType;
    const content = chat.last;

    // Convert to number for comparison to handle both string and number from API
    const numericType =
      typeof type === "number" ? type : parseInt(String(type), 10);

    if (type === MessageEnum.Image || numericType === MessageTypeNumber.Image) {
      return (
        <span className="text-muted-foreground text-xs">
          🖼 {tChat("imageMessage")}
        </span>
      );
    }

    if (
      type === MessageEnum.Images ||
      numericType === MessageTypeNumber.Images
    ) {
      return (
        <span className="text-muted-foreground text-xs">
          🖼 {tChat("imageMessage")}
        </span>
      );
    }

    if (type === MessageEnum.Audio || numericType === MessageTypeNumber.Audio) {
      return (
        <span className="text-muted-foreground text-xs">
          🎵 {tChat("audioMessage")}
        </span>
      );
    }

    if (
      type === MessageEnum.VoiceCall ||
      numericType === MessageTypeNumber.VoiceCall
    ) {
      return (
        <span className="text-muted-foreground text-xs">
          📞 {tChat("voiceCall")}
        </span>
      );
    }

    if (
      type === MessageEnum.VideoCall ||
      numericType === MessageTypeNumber.VideoCall
    ) {
      return (
        <span className="text-muted-foreground text-xs">
          📹 {tChat("videoCall")}
        </span>
      );
    }

    const maxLength = 50;
    const displayContent =
      content && content.length > maxLength
        ? `${content.substring(0, maxLength)}...`
        : content;

    return (
      <span className="text-muted-foreground truncate text-xs">
        {displayContent}
      </span>
    );
  };

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
              onClick={() => handleChatClick(c.id)}
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
                  {renderLastMessage(c)}
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
