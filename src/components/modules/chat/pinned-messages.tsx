"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MESSAGE_IMAGE_SEPARATOR, MessageEnum } from "@/constants";
import { ChatMessage } from "@/types";
import { format } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { ArrowDown, Pin, X } from "lucide-react";

const getImageUrls = (message: ChatMessage) => {
  if (message.imageUrls?.length) {
    return message.imageUrls;
  }

  if (message.type === MessageEnum.Image && message.content) {
    return [message.content];
  }

  if (message.type === MessageEnum.Images) {
    return message.content
      .split(MESSAGE_IMAGE_SEPARATOR)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [] as string[];
};

interface PinnedMessagesProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedMessages: ChatMessage[];
  currentUserId: string;
  onSelectMessage: (messageId: string) => void;
  onUnpinMessage: (messageId: string) => void;
  locale: string;
}

export function PinnedMessages({
  isOpen,
  onClose,
  pinnedMessages,
  currentUserId,
  onSelectMessage,
  onUnpinMessage,
  locale,
}: PinnedMessagesProps) {
  const t = useTranslations("chat");

  const handleSelectMessage = (messageId: string) => {
    onSelectMessage(messageId);
    onClose();
  };

  const formatMessageTime = (date: Date) => {
    return format(date, "PPp", { locale: locale === "vi" ? vi : enUS });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Pin className="size-5" />
            {t("pinnedMessages")}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          {pinnedMessages.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-4 text-sm">
                {t("pinnedMessagesCount", { count: pinnedMessages.length })}
              </p>

              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="space-y-3">
                  {pinnedMessages.map((message) => {
                    const isOwn = message.senderId === currentUserId;
                    const imageUrls = getImageUrls(message);
                    return (
                      <div
                        key={message.id}
                        className="hover:bg-accent group relative rounded-lg border p-3 transition-colors"
                      >
                        {/* Unpin Button */}
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => onUnpinMessage(message.id)}
                          className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                          title={t("unpinMessage")}
                        >
                          <X className="size-3.5" />
                        </Button>

                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2 pr-8">
                            <span className="text-xs font-medium">
                              {isOwn ? t("you") : t("them")}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {formatMessageTime(message.createdAt)}
                            </span>
                          </div>

                          {message.type === MessageEnum.Text ? (
                            <p className="text-sm">{message.content}</p>
                          ) : imageUrls.length ? (
                            <div className="space-y-2">
                              <p className="text-muted-foreground text-xs font-medium">
                                {message.type === MessageEnum.Image
                                  ? t("imageMessage")
                                  : t("imagesMessage", {
                                      count: imageUrls.length,
                                    })}
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                {imageUrls.slice(0, 3).map((url, index) => (
                                  <div
                                    key={`${message.id}-${index}`}
                                    className="bg-muted relative aspect-square overflow-hidden rounded-md border"
                                  >
                                    <Image
                                      src={url}
                                      alt={t("imageMessage")}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                ))}
                                {imageUrls.length > 3 && (
                                  <div className="bg-muted text-muted-foreground flex items-center justify-center rounded-md text-xs font-medium">
                                    +{imageUrls.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              {message.content}
                            </p>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectMessage(message.id)}
                            className="text-primary -ml-2 w-fit gap-1 text-xs"
                          >
                            <ArrowDown className="size-3" />
                            {t("jumpToMessage")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
              <Pin className="text-muted-foreground size-8" />
              <p className="text-muted-foreground text-sm">
                {t("noPinnedMessages")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("noPinnedMessagesDescription")}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
