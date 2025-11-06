"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MESSAGE_IMAGE_SEPARATOR } from "@/constants";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { format, isToday, isYesterday } from "date-fns";
import { enUS, vi } from "date-fns/locale";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  locale: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  locale,
  otherUserName,
  otherUserAvatar,
}: MessageListProps) {
  const t = useTranslations("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    setShouldAutoScroll(scrollHeight - scrollTop - clientHeight < 100);

    if (scrollTop === 0 && hasMore && onLoadMore && !isLoading) {
      onLoadMore();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return t("today");
    } else if (isYesterday(date)) {
      return t("yesterday");
    }
    return format(date, "PPP", { locale: locale === "vi" ? vi : enUS });
  };

  const formatMessageTime = (date: Date) => {
    return format(date, "HH:mm");
  };

  const extractImageUrls = (message: ChatMessage) => {
    if (message.type === "Image") {
      const single = message.imageUrls?.[0] ?? message.content;
      return single ? [single] : [];
    }

    if (message.type === "Images") {
      if (message.imageUrls?.length) {
        return message.imageUrls;
      }

      return message.content
        .split(MESSAGE_IMAGE_SEPARATOR)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const renderMessageContent = (message: ChatMessage, isOwn: boolean) => {
    if (message.type === "Image" || message.type === "Images") {
      const urls = extractImageUrls(message);

      if (!urls.length) {
        return (
          <p className="break-words text-xs md:text-sm">{message.content}</p>
        );
      }

      const gridCols = urls.length > 1 ? "grid-cols-2" : "grid-cols-1";

      return (
        <div className={cn("mt-1 grid gap-2", gridCols)}>
          {urls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl"
            >
              <img
                src={url}
                alt="Chat attachment"
                className="h-32 w-full rounded-xl object-cover md:h-40"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      );
    }

    return <p className="break-words text-xs md:text-sm">{message.content}</p>;
  };

  const groupMessagesByDate = () => {
    const groups: { date: Date; messages: ChatMessage[] }[] = [];
    let currentDate: Date | null = null;
    let currentGroup: ChatMessage[] = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      messageDate.setHours(0, 0, 0, 0);

      if (!currentDate || currentDate.getTime() !== messageDate.getTime()) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate!, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate!, messages: currentGroup });
    }

    return groups;
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center md:p-8">
        <p className="text-muted-foreground mb-2 text-sm md:text-base">
          {t("noMessages")}
        </p>
        <p className="text-muted-foreground text-xs md:text-sm">
          {t("noMessagesDescription")}
        </p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <ScrollArea
      className="flex-1 px-3 md:px-4"
      ref={scrollRef}
      onScroll={handleScroll}
    >
      <div className="space-y-3 py-3 md:space-y-4 md:py-4">
        {isLoading && hasMore && (
          <div className="flex justify-center">
            <Skeleton className="h-6 w-24 md:h-8 md:w-32" />
          </div>
        )}

        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3 md:space-y-4">
            {/* Date Separator */}
            <div className="flex items-center justify-center">
              <div className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] md:px-3 md:py-1 md:text-xs">
                {formatMessageDate(group.date)}
              </div>
            </div>

            {/* Messages */}
            {group.messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              const isMediaMessage =
                message.type === "Image" || message.type === "Images";

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-end gap-1.5 md:gap-2",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Avatar for other user */}
                  {!isOwn && (
                    <Avatar className="size-6 md:size-8">
                      <AvatarImage src={otherUserAvatar} alt={otherUserName} />
                      <AvatarFallback className="text-[10px] md:text-xs">
                        {getInitials(otherUserName)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl md:max-w-[70%]",
                      isMediaMessage ? "p-0" : "px-3 py-1.5 md:px-4 md:py-2",
                      !isMediaMessage &&
                        (isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted")
                    )}
                  >
                    {renderMessageContent(message, isOwn)}

                    <div
                      className={cn(
                        "mt-1 flex items-center justify-end px-3 pb-1 text-[10px] md:mt-1.5 md:px-4 md:pb-1.5 md:text-xs",
                        isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      <span>{formatMessageTime(message.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
