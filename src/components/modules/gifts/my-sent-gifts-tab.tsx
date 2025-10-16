"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconGift,
  IconSend,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMySentGiftsQuery } from "@/hooks";
import Image from "next/image";

type MySentGiftsTabProps = {
  locale: string;
};

export function MySentGiftsTab({ locale }: MySentGiftsTabProps) {
  const t = useTranslations("gift.sent");
  const tCommon = useTranslations("gift.common");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch sent gifts
  const { data, isLoading } = useMySentGiftsQuery({
    params: { lang: locale, pageNumber: currentPage, pageSize },
  });

  const gifts = data?.payload.data.items || [];
  const pagination = data?.payload.data;

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
            <IconSend className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
                  <div>
                    <h4 className="font-semibold">{gift.giftName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("to")}: {gift.receiverName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline">x{gift.quantity}</Badge>
                    {gift.isAnonymous && (
                      <Badge variant="secondary" className="text-xs">
                        {t("anonymous")}
                      </Badge>
                    )}
                  </div>
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
  );
}
