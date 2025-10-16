"use client";

import { IconBell, IconGift } from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { AcceptGiftDialog, RejectGiftDialog } from "@/components/modules/gifts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMyReceivedGiftsQuery } from "@/hooks";
import Image from "next/image";

export function GiftNotifications() {
  const t = useTranslations("gift.received");
  const locale = useLocale();
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Fetch received gifts
  const { data } = useMyReceivedGiftsQuery({
    params: { lang: locale, pageNumber: 1, pageSize: 10 },
  });

  const gifts = data?.payload.data.items || [];
  const unreadGifts = gifts.filter((gift) => !gift.isRead);

  const handleAcceptClick = (gift: any) => {
    setSelectedGift(gift);
    setAcceptDialogOpen(true);
  };

  const handleRejectClick = (gift: any) => {
    setSelectedGift(gift);
    setRejectDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <IconGift className="h-5 w-5" />
            {unreadGifts.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {unreadGifts.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[400px]">
            {unreadGifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <IconBell className="h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("empty")}
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {unreadGifts.map((gift) => (
                  <div
                    key={gift.presentationId}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        {gift.giftIconUrl ? (
                          <Image
                            src={gift.giftIconUrl}
                            alt={gift.giftName}
                            className="h-6 w-6 object-contain"
                          />
                        ) : (
                          <IconGift className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold">
                          {gift.giftName} x{gift.quantity}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {!gift.isAnonymous && (
                            <>
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={gift.senderAvatarUrl || ""} />
                                <AvatarFallback className="text-[8px]">
                                  {gift.senderName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {t("from")}: {gift.senderName}
                              </span>
                            </>
                          )}
                          {gift.isAnonymous && (
                            <span>{t("from")}: Anonymous</span>
                          )}
                        </div>
                        {gift.message && (
                          <p className="text-xs italic text-muted-foreground">
                            &quot;{gift.message}&quot;
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(gift.createdAt), "PPp")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAcceptClick(gift)}
                      >
                        {t("accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleRejectClick(gift)}
                      >
                        {t("reject")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Accept Dialog */}
      {selectedGift && (
        <AcceptGiftDialog
          open={acceptDialogOpen}
          onOpenChange={setAcceptDialogOpen}
          gift={selectedGift}
          locale={locale}
        />
      )}

      {/* Reject Dialog */}
      {selectedGift && (
        <RejectGiftDialog
          open={rejectDialogOpen}
          onOpenChange={setRejectDialogOpen}
          gift={selectedGift}
          locale={locale}
        />
      )}
    </>
  );
}
