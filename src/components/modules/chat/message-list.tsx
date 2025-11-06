"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  isLoadingMore?: boolean;
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
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  locale,
  otherUserName,
  otherUserAvatar,
}: MessageListProps) {
  const t = useTranslations("chat");
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const previousMessagesLengthRef = useRef<number>(0);
  const isLoadingMoreRef = useRef(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const userScrolledRef = useRef(false);

  // Auto-scroll logic when messages change
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollHeight, clientHeight } = viewport;
    const messagesAdded = messages.length - previousMessagesLengthRef.current;

    // If loading more (prepending old messages)
    if (isLoadingMoreRef.current && previousScrollHeightRef.current) {
      const heightDiff = scrollHeight - previousScrollHeightRef.current;
      if (heightDiff > 0) {
        viewport.scrollTop = heightDiff;
      }
      isLoadingMoreRef.current = false;
    }
    // If new messages arrived (not from load more)
    else if (messagesAdded > 0 && !isLoadingMoreRef.current) {
      // Auto-scroll if user is near bottom OR if it's the initial load
      if (shouldAutoScroll || previousMessagesLengthRef.current === 0) {
        // Force scroll to bottom immediately
        viewport.scrollTop = viewport.scrollHeight;

        // Also use requestAnimationFrame for smoother scroll after render
        requestAnimationFrame(() => {
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
          }
        });
      }
    }

    previousScrollHeightRef.current = scrollHeight;
    previousMessagesLengthRef.current = messages.length;
  }, [messages, shouldAutoScroll]);

  // Update isLoadingMore ref
  useEffect(() => {
    if (!isLoadingMore) {
      isLoadingMoreRef.current = false;
    }
  }, [isLoadingMore]);

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // User is near bottom (within 100px)
    const isNearBottom = distanceFromBottom < 100;
    setShouldAutoScroll(isNearBottom);

    // Mark that user has manually scrolled
    if (!isNearBottom && !userScrolledRef.current) {
      userScrolledRef.current = true;
    } else if (isNearBottom && userScrolledRef.current) {
      userScrolledRef.current = false;
    }

    // Load more when scrolled to top
    if (
      scrollTop <= 50 &&
      hasMore &&
      onLoadMore &&
      !isLoadingMore &&
      !isLoading
    ) {
      isLoadingMoreRef.current = true;
      previousScrollHeightRef.current = scrollHeight;
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
              className="relative block h-32 w-full overflow-hidden rounded-xl md:h-40"
            >
              <Image
                src={url}
                alt="Chat attachment"
                fill
                className="rounded-xl object-cover"
                unoptimized
              />
            </a>
          ))}
        </div>
      );
    }

    return <p className="break-words text-xs md:text-sm">{message.content}</p>;
  };

  // Scroll to bottom on initial mount or when first messages load
  useEffect(() => {
    const viewport = viewportRef.current;
    if (
      viewport &&
      messages.length > 0 &&
      previousMessagesLengthRef.current === 0
    ) {
      // Immediate scroll
      viewport.scrollTop = viewport.scrollHeight;

      // Also schedule after render completes
      requestAnimationFrame(() => {
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      });

      // And a backup with setTimeout
      setTimeout(() => {
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 100);
    }
  }, [messages.length]); // When messages first load

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
    <div
      ref={viewportRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto"
    >
      <div className="space-y-3 px-3 py-3 md:space-y-4 md:px-4 md:py-4">
        {isLoadingMore && hasMore && (
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
    </div>
  );
}
