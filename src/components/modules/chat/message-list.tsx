"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MESSAGE_IMAGE_SEPARATOR } from "@/constants";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { format, isToday, isYesterday } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { Copy, MoreVertical, Trash2 } from "lucide-react";
import { AudioPlayer } from "./audio-player";
import { ImagePreviewModal } from "./image-preview-modal";

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
  onDeleteMessage?: (messageId: string) => void;
  onCopyMessage?: (content: string) => void;
  scrollToMessageId?: string;
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
  onDeleteMessage,
  onCopyMessage,
  scrollToMessageId,
}: MessageListProps) {
  const t = useTranslations("chat");
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const previousMessagesLengthRef = useRef<number>(0);
  const isLoadingMoreRef = useRef(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const userScrolledRef = useRef(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  const handleImageClick = (urls: string[], clickedIndex: number) => {
    setPreviewImages(urls);
    setPreviewIndex(clickedIndex);
    setIsPreviewOpen(true);
  };

  const renderMessageContent = (message: ChatMessage, isOwn: boolean) => {
    if (message.type === "Image" || message.type === "Images") {
      const urls = extractImageUrls(message);

      if (!urls.length) {
        return (
          <p className="break-all whitespace-pre-wrap text-xs md:text-sm">
            {message.content}
          </p>
        );
      }

      const gridCols =
        urls.length === 1
          ? "grid-cols-1"
          : urls.length === 2
            ? "grid-cols-2"
            : urls.length === 3
              ? "grid-cols-3"
              : "grid-cols-2";

      return (
        <div className={cn("mt-1 grid gap-2", gridCols)}>
          {urls.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => handleImageClick(urls, index)}
              className="group relative block overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="relative aspect-square w-full min-w-[200px]">
                <Image
                  src={url}
                  alt={`Chat attachment ${index + 1}`}
                  fill
                  className="rounded-lg object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
              </div>
            </button>
          ))}
        </div>
      );
    }

    if (message.type === "Audio") {
      return <AudioPlayer src={message.content} isOwn={isOwn} />;
    }

    return (
      <p className="break-all whitespace-pre-wrap text-xs md:text-sm">
        {message.content}
      </p>
    );
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

  // Scroll to specific message when scrollToMessageId changes
  useEffect(() => {
    if (scrollToMessageId && messageRefs.current.has(scrollToMessageId)) {
      const messageElement = messageRefs.current.get(scrollToMessageId);
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Highlight the message temporarily
        messageElement.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => {
          messageElement.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2"
          );
        }, 2000);
      }
    }
  }, [scrollToMessageId]);

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
              const isImageMessage =
                message.type === "Image" || message.type === "Images";
              const isAudioMessage = message.type === "Audio";

              return (
                <div
                  key={message.id}
                  ref={(el) => {
                    if (el) {
                      messageRefs.current.set(message.id, el);
                    } else {
                      messageRefs.current.delete(message.id);
                    }
                  }}
                  className={cn(
                    "group flex items-end gap-1.5 md:gap-2 transition-all rounded-lg",
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

                  {/* Message actions - left side for own messages */}
                  {isOwn && (onDeleteMessage || onCopyMessage) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 self-center opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {onCopyMessage && !isAudioMessage && (
                          <DropdownMenuItem
                            onClick={() => onCopyMessage(message.content)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            {t("copyMessage")}
                          </DropdownMenuItem>
                        )}
                        {onDeleteMessage && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDeleteMessage(message.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("deleteMessage")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl overflow-hidden md:max-w-[70%]",
                      isImageMessage
                        ? "p-0"
                        : isAudioMessage
                          ? "p-2 md:p-2.5"
                          : "px-3 py-1.5 md:px-4 md:py-2",
                      !isImageMessage &&
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

                  {/* Message actions - right side for other user's messages */}
                  {!isOwn && onCopyMessage && !isAudioMessage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 self-center opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onCopyMessage(message.content)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {t("copyMessage")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        images={previewImages}
        initialIndex={previewIndex}
      />
    </div>
  );
}
