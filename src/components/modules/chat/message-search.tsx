"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MESSAGE_IMAGE_SEPARATOR } from "@/constants";
import { useGetConversationMedia, useSearchMessages } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  GetMessageSearchQueryType,
  GetMessagesQueryType,
  MessageType,
} from "@/models";
import { ChatMessage } from "@/types";
import { format } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import {
  ArrowDown,
  Image as ImageIcon,
  Loader2,
  Search,
  X,
} from "lucide-react";

import { ImagePreviewModal } from "./image-preview-modal";

type TabKey = "messages" | "media";

const DEFAULT_MEDIA_QUERY: GetMessagesQueryType = {
  pageNumber: 1,
  pageSize: -1,
};

const DEFAULT_SEARCH_PAGINATION = {
  pageNumber: 1,
  pageSize: 50,
} as const;

const extractImageUrlsFromContent = (
  type: ChatMessage["type"],
  content: string
) => {
  if (type === "Image") {
    return content ? [content] : [];
  }

  if (type === "Images") {
    return content
      .split(MESSAGE_IMAGE_SEPARATOR)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const mapMessageToChat = (message: MessageType): ChatMessage => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.sender.id,
  content: message.content,
  type: message.type,
  createdAt: new Date(message.sentAt),
  imageUrls: extractImageUrlsFromContent(message.type, message.content),
});

interface MessageSearchProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string | null;
  currentUserId: string;
  onSelectMessage: (messageId: string) => void;
  locale: string;
}

export function MessageSearch({
  isOpen,
  onClose,
  conversationId,
  currentUserId,
  onSelectMessage,
  locale,
}: MessageSearchProps) {
  const t = useTranslations("chat");
  const [activeTab, setActiveTab] = useState<TabKey>("messages");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setActiveTab("messages");
      setIsPreviewOpen(false);
      setPreviewIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSearchQuery("");
    setActiveTab("messages");
    setIsPreviewOpen(false);
    setPreviewIndex(0);
  }, [conversationId]);

  const normalizedSearchQuery = useMemo<GetMessageSearchQueryType>(() => {
    const trimmed = searchQuery.trim();
    return {
      ...DEFAULT_SEARCH_PAGINATION,
      content: trimmed.length ? trimmed : undefined,
    };
  }, [searchQuery]);

  const hasSearchInput = Boolean(normalizedSearchQuery.content);

  const { data: searchResponse, isFetching: isSearching } = useSearchMessages(
    conversationId ?? "",
    normalizedSearchQuery,
    {
      enabled:
        isOpen &&
        Boolean(conversationId) &&
        Boolean(normalizedSearchQuery.content),
    }
  );

  const { data: mediaResponse, isFetching: isLoadingMedia } =
    useGetConversationMedia(conversationId ?? "", DEFAULT_MEDIA_QUERY, {
      enabled: isOpen && Boolean(conversationId),
    });

  const searchResults = useMemo<ChatMessage[]>(() => {
    if (!searchResponse?.payload?.data?.items) {
      return [];
    }

    return searchResponse.payload.data.items.map(mapMessageToChat);
  }, [searchResponse]);

  const mediaItems = useMemo<string[]>(() => {
    return mediaResponse?.payload?.data?.items ?? [];
  }, [mediaResponse]);

  useEffect(() => {
    if (previewIndex >= mediaItems.length) {
      setPreviewIndex(0);
    }
  }, [mediaItems.length, previewIndex]);

  const handleSelectMessage = (messageId: string) => {
    onSelectMessage(messageId);
    onClose();
  };

  const formatMessageTime = (date: Date) => {
    return format(date, "PPp", { locale: locale === "vi" ? vi : enUS });
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) => (
      <span
        key={index}
        className={cn(
          part.toLowerCase() === query.toLowerCase() &&
            "bg-yellow-200 dark:bg-yellow-800 font-semibold"
        )}
      >
        {part}
      </span>
    ));
  };

  const handleOpenPreview = (index: number) => {
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("searchMessages")}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-4">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabKey)}
            className="flex flex-col gap-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="messages">{t("messagesTab")}</TabsTrigger>
              <TabsTrigger value="media" disabled={!conversationId}>
                {t("mediaTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="space-y-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                  disabled={!conversationId}
                />
                {searchQuery && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>

              {!conversationId ? (
                <p className="text-muted-foreground text-sm">
                  {t("selectConversation")}
                </p>
              ) : !hasSearchInput ? (
                <p className="text-muted-foreground text-sm">
                  {t("searchPlaceholder")}
                </p>
              ) : isSearching ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm">
                    {searchResults.length > 0
                      ? t("searchResultsCount", {
                          count: searchResults.length,
                        })
                      : t("noSearchResults")}
                  </p>
                  <ScrollArea className="h-[calc(100vh-14rem)]">
                    {searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults.map((message) => {
                          const isOwn = message.senderId === currentUserId;
                          return (
                            <button
                              key={message.id}
                              onClick={() => handleSelectMessage(message.id)}
                              className="hover:bg-accent flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-medium">
                                  {isOwn ? t("you") : t("them")}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm">
                                {highlightText(message.content, searchQuery)}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-primary">
                                <ArrowDown className="size-3" />
                                {t("jumpToMessage")}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center">
                        <p className="text-muted-foreground text-sm">
                          {t("noSearchResults")}
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </>
              )}
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              {!conversationId ? (
                <p className="text-muted-foreground text-sm">
                  {t("selectConversation")}
                </p>
              ) : (
                <>
                  <ScrollArea className="h-[calc(100vh-14rem)]">
                    {isLoadingMedia ? (
                      <div className="flex h-32 items-center justify-center">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : mediaItems.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {mediaItems.map((url, index) => (
                          <button
                            key={`${url}-${index}`}
                            type="button"
                            onClick={() => handleOpenPreview(index)}
                            className="group relative overflow-hidden rounded-lg"
                          >
                            <div className="relative aspect-square w-full">
                              <Image
                                src={url}
                                alt={`Conversation media ${index + 1}`}
                                fill
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                unoptimized
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
                        <ImageIcon className="size-6 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">
                          {t("noMedia")}
                        </p>
                      </div>
                    )}
                  </ScrollArea>

                  {mediaItems.length > 0 && (
                    <ImagePreviewModal
                      isOpen={isPreviewOpen}
                      onClose={() => setIsPreviewOpen(false)}
                      images={mediaItems}
                      initialIndex={previewIndex}
                    />
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
