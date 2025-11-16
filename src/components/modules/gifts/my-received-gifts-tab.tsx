"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconDotsVertical,
  IconEye,
  IconEyeOff,
  IconGift,
  IconInbox,
  IconPinFilled,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GiftVisibilityEnum } from "@/constants";
import {
  useMyReceivedGiftsQuery,
  useUpdateGiftVisibilityMutation,
} from "@/hooks";
import Image from "next/image";

type MyReceivedGiftsTabProps = {
  locale: string;
};

export function MyReceivedGiftsTab({ locale }: MyReceivedGiftsTabProps) {
  const t = useTranslations("gift.received");
  const tCommon = useTranslations("gift.common");
  const tVisibility = useTranslations("gift.visibility");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch received gifts
  const { data, isLoading } = useMyReceivedGiftsQuery({
    params: { lang: locale, pageNumber: currentPage, pageSize },
  });

  const gifts = data?.payload.data.items || [];
  const pagination = data?.payload.data;

  // Update visibility mutation
  const updateVisibilityMutation = useUpdateGiftVisibilityMutation({
    lang: locale,
    pageNumber: currentPage,
    pageSize,
  });

  const handleVisibilityChange = (
    presentationId: string,
    status: keyof typeof GiftVisibilityEnum
  ) => {
    updateVisibilityMutation.mutate({
      id: presentationId,
      body: { status: GiftVisibilityEnum[status] },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case GiftVisibilityEnum.Pinned:
        return (
          <Badge variant="default" className="gap-1">
            <IconPinFilled className="h-3 w-3" />
            {tVisibility("pinned")}
          </Badge>
        );
      case GiftVisibilityEnum.Hidden:
        return (
          <Badge variant="secondary" className="gap-1">
            <IconEyeOff className="h-3 w-3" />
            {tVisibility("hidden")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <IconEye className="h-3 w-3" />
            {tVisibility("visible")}
          </Badge>
        );
    }
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

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    {getStatusBadge(gift.status)}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updateVisibilityMutation.isPending}
                          className="h-7 w-7 p-0"
                        >
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() =>
                            handleVisibilityChange(
                              gift.presentationId,
                              "Visible"
                            )
                          }
                          className="gap-2"
                        >
                          <IconEye className="h-4 w-4" />
                          {tVisibility("visible")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleVisibilityChange(
                              gift.presentationId,
                              "Hidden"
                            )
                          }
                          className="gap-2"
                        >
                          <IconEyeOff className="h-4 w-4" />
                          {tVisibility("hidden")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleVisibilityChange(
                              gift.presentationId,
                              "Pinned"
                            )
                          }
                          className="gap-2"
                        >
                          <IconPinFilled className="h-4 w-4" />
                          {tVisibility("pinned")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
    </>
  );
}
