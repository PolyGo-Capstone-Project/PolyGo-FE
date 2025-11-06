"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { format } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { ArrowDown, Search, X } from "lucide-react";

interface MessageSearchProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentUserId: string;
  onSelectMessage: (messageId: string) => void;
  locale: string;
}

export function MessageSearch({
  isOpen,
  onClose,
  messages,
  currentUserId,
  onSelectMessage,
  locale,
}: MessageSearchProps) {
  const t = useTranslations("chat");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return messages.filter((msg) => {
      if (msg.type === "Text") {
        return msg.content.toLowerCase().includes(query);
      }
      return false;
    });
  }, [messages, searchQuery]);

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("searchMessages")}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
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

          {/* Results Count */}
          {searchQuery && (
            <p className="text-muted-foreground text-sm">
              {filteredMessages.length > 0
                ? t("searchResultsCount", { count: filteredMessages.length })
                : t("noSearchResults")}
            </p>
          )}

          {/* Results List */}
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {filteredMessages.length > 0 ? (
              <div className="space-y-2">
                {filteredMessages.map((message) => {
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
              searchQuery && (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    {t("noSearchResults")}
                  </p>
                </div>
              )
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
