"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconGift,
  IconInbox,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AcceptGiftDialog, RejectGiftDialog } from "@/components/modules/gifts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyReceivedGiftsQuery } from "@/hooks";
import Image from "next/image";

type MyReceivedGiftsTabProps = {
  locale: string;
};

export function MyReceivedGiftsTab({ locale }: MyReceivedGiftsTabProps) {
  const t = useTranslations("gift.received");
  const tCommon = useTranslations("gift.common");
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch received gifts
  const { data, isLoading } = useMyReceivedGiftsQuery({
    params: { lang: locale, pageNumber: currentPage, pageSize },
  });

  const gifts = data?.payload.data.items || [];
  const pagination = data?.payload.data;

  const handleAcceptClick = (gift: any) => {
    setSelectedGift(gift);
    setAcceptDialogOpen(true);
  };

  const handleRejectClick = (gift: any) => {
    setSelectedGift(gift);
    setRejectDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (gifts.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-[40vh] items-center justify-center">
          <div className="text-center">
            <IconInbox className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {gifts.map((gift) => (
              <div
                key={gift.presentationId}
                className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                {/* Gift Icon */}
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                  {gift.giftIconUrl ? (
                    <Image
                      src={gift.giftIconUrl}
                      alt={gift.giftName}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <IconGift className="h-6 w-6 text-primary" />
                  )}
                </div>

                {/* Gift Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{gift.giftName}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {!gift.isAnonymous && (
                          <>
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={gift.senderAvatarUrl || ""} />
                              <AvatarFallback className="text-xs">
                                {gift.senderName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {t("from")}: {gift.senderName}
                            </span>
                          </>
                        )}
                        {gift.isAnonymous && (
                          <Badge variant="secondary" className="text-xs">
                            {t("from")}: {t("anonymous")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">x{gift.quantity}</Badge>
                  </div>

                  {/* Message */}
                  {gift.message && (
                    <p className="text-sm italic text-muted-foreground">
                      &quot;{gift.message}&quot;
                    </p>
                  )}

                  {/* Date */}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(gift.createdAt), "PPp")}
                  </p>

                  {/* Actions */}
                  {!gift.isRead && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptClick(gift)}>
                        {t("accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectClick(gift)}
                      >
                        {t("reject")}
                      </Button>
                    </div>
                  )}
                  {gift.isRead && (
                    <Badge variant="secondary">{t("accepted")}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages} (
                {pagination.totalItems} items)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!pagination.hasPreviousPage}
                >
                  <IconChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1)
                    )
                  }
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
