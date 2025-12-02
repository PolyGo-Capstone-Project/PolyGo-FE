"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageEnum,
  MessageTypeNumber,
} from "@/constants/communication.constant";
import { cn } from "@/lib/utils";
import { ChatConversation } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import {
  MoreVertical,
  Pin,
  PinOff,
  Search,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onPinConversation: (conversationId: string) => void;
  onUnpinConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onMuteConversation: (conversationId: string) => void;
  onUnmuteConversation: (conversationId: string) => void;
  pinnedConversationIds: Set<string>;
  mutedConversationIds: Set<string>;
  locale: string;
  totalUnreadCount?: number; // ✅ Add total unread count prop
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onPinConversation,
  onUnpinConversation,
  onDeleteConversation,
  onMuteConversation,
  onUnmuteConversation,
  pinnedConversationIds,
  mutedConversationIds,
  locale,
  totalUnreadCount = 0, // ✅ Get total unread count
}: ConversationListProps) {
  const t = useTranslations("chat");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    return conversations.filter((conv) =>
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Sort: pinned first, then by updatedAt
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      const aIsPinned = pinnedConversationIds.has(a.id);
      const bIsPinned = pinnedConversationIds.has(b.id);

      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;

      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }, [filteredConversations, pinnedConversationIds]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return t("yesterday");
    } else {
      return formatDistanceToNow(date, {
        addSuffix: false,
        locale: locale === "vi" ? vi : enUS,
      });
    }
  };

  const renderLastMessage = (conv: ChatConversation) => {
    if (conv.isTyping) {
      return (
        <span className="text-primary text-xs italic md:text-sm">
          {t("typing")}
        </span>
      );
    }

    if (!conv.lastMessage) return null;

    const { type, content, imageUrls } = conv.lastMessage;

    // Convert to number for comparison to handle both string and number from API
    const numericType =
      typeof type === "number" ? type : parseInt(String(type), 10);

    if (type === MessageEnum.Image || numericType === MessageTypeNumber.Image) {
      return (
        <span className="text-muted-foreground text-xs md:text-sm">
          🖼 {t("imageMessage")}
        </span>
      );
    }

    if (
      type === MessageEnum.Images ||
      numericType === MessageTypeNumber.Images
    ) {
      const total = imageUrls?.length ?? 1;
      return (
        <span className="text-muted-foreground text-xs md:text-sm">
          🖼 {t("imageMessage")}
        </span>
      );
    }

    if (type === MessageEnum.Audio || numericType === MessageTypeNumber.Audio) {
      return (
        <span className="text-muted-foreground text-xs md:text-sm">
          🎵 {t("audioMessage")}
        </span>
      );
    }

    const maxLength = 50;
    const displayContent =
      content && content.length > maxLength
        ? `${content.substring(0, maxLength)}...`
        : content;

    return (
      <span className="text-muted-foreground line-clamp-1 break-all text-xs md:text-sm">
        {displayContent}
      </span>
    );
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-r">
      {/* Header */}
      <div className="shrink-0 border-b p-3 md:p-4">
        <div className="mb-3 flex items-center justify-between md:mb-4">
          <h2 className="text-lg font-semibold md:text-xl">{t("title")}</h2>
          {totalUnreadCount > 0 && (
            <Badge
              variant="default"
              className="rounded-full px-2 py-0.5 text-xs font-semibold"
            >
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </Badge>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="min-h-0 flex-1">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center md:p-8">
            <p className="text-muted-foreground text-xs md:text-sm">
              {searchQuery
                ? "Không tìm thấy cuộc trò chuyện"
                : t("noConversations")}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 p-1 md:space-y-1 md:p-2">
            {sortedConversations.map((conv) => {
              const isPinned = pinnedConversationIds.has(conv.id);
              const isMuted = mutedConversationIds.has(conv.id);

              return (
                <div
                  key={conv.id}
                  className={cn(
                    "group relative flex items-start gap-2 rounded-lg p-2 transition-colors md:gap-3 md:p-3",
                    selectedConversationId === conv.id && "bg-accent"
                  )}
                >
                  {/* Main conversation button */}
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className="flex flex-1 items-start gap-2 text-left hover:opacity-80 md:gap-3"
                  >
                    {/* Avatar with online status */}
                    <div className="relative shrink-0">
                      <Avatar className="size-10 md:size-12">
                        <AvatarImage
                          src={
                            conv.user.avatar ?? conv.user.avatarUrl ?? undefined
                          }
                          alt={conv.user.name}
                        />
                        <AvatarFallback>
                          {getInitials(conv.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.user.isOnline && (
                        <div className="absolute bottom-0 right-0 size-2.5 md:size-3 rounded-full border-2 border-background bg-green-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-start justify-between gap-2 md:mb-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          {isPinned && (
                            <Pin className="text-muted-foreground size-3 shrink-0 md:size-3.5" />
                          )}
                          {isMuted && (
                            <VolumeX className="text-muted-foreground size-3 shrink-0 md:size-3.5" />
                          )}
                          <h3 className="truncate text-sm font-semibold md:text-base">
                            {conv.user.name}
                          </h3>
                        </div>
                        <span className="text-muted-foreground shrink-0 text-[10px] md:text-xs">
                          {formatTime(conv.updatedAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {renderLastMessage(conv)}
                        </div>
                        {!conv.hasSeen && !isMuted && (
                          <div className="size-2 shrink-0 rounded-full bg-primary md:size-2.5" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 md:size-8"
                      >
                        <MoreVertical className="size-3.5 md:size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {isPinned ? (
                        <DropdownMenuItem
                          onClick={() => onUnpinConversation(conv.id)}
                        >
                          <PinOff className="mr-2 size-4" />
                          {t("unpinConversation")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onPinConversation(conv.id)}
                        >
                          <Pin className="mr-2 size-4" />
                          {t("pinConversation")}
                        </DropdownMenuItem>
                      )}

                      {isMuted ? (
                        <DropdownMenuItem
                          onClick={() => onUnmuteConversation(conv.id)}
                        >
                          <Volume2 className="mr-2 size-4" />
                          {t("unmuteConversation")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onMuteConversation(conv.id)}
                        >
                          <VolumeX className="mr-2 size-4" />
                          {t("muteConversation")}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => onDeleteConversation(conv.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        {t("deleteConversation")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
