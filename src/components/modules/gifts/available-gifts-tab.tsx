"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconGift,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PurchaseGiftDialog } from "@/components/modules/gifts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGiftsQuery } from "@/hooks";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

type AvailableGiftsTabProps = {
  locale: string;
};

export function AvailableGiftsTab({ locale }: AvailableGiftsTabProps) {
  const t = useTranslations("gift.available");
  const tCommon = useTranslations("gift.common");
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Fetch available gifts
  const { data, isLoading } = useGiftsQuery({
    params: { lang: locale, pageNumber: currentPage, pageSize },
  });

  const gifts = data?.payload.data.items || [];
  const pagination = data?.payload.data;

  const handleBuyClick = (giftId: string) => {
    setSelectedGiftId(giftId);
    setPurchaseDialogOpen(true);
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
            <IconGift className="mx-auto h-12 w-12 text-muted-foreground" />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gifts.map((gift) => (
              <Card key={gift.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-3">
                    {/* Gift Icon */}
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                      {gift.iconUrl ? (
                        <Image
                          src={gift.iconUrl}
                          alt={gift.name}
                          fill
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <IconGift className="h-10 w-10 text-primary" />
                      )}
                    </div>

                    {/* Gift Name */}
                    <h3 className="text-center font-semibold">{gift.name}</h3>

                    {/* Gift Description */}
                    {gift.description && (
                      <p className="line-clamp-2 text-center text-xs text-muted-foreground">
                        {gift.description}
                      </p>
                    )}

                    {/* Price */}
                    <Badge variant="secondary" className="text-sm">
                      {formatCurrency(gift.price)}
                    </Badge>

                    {/* Buy Button */}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleBuyClick(gift.id)}
                    >
                      <IconShoppingCart className="mr-2 h-4 w-4" />
                      {t("buyNow")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

      {/* Purchase Dialog */}
      {selectedGiftId && (
        <PurchaseGiftDialog
          open={purchaseDialogOpen}
          onOpenChange={setPurchaseDialogOpen}
          giftId={selectedGiftId}
          locale={locale}
        />
      )}
    </>
  );
}
