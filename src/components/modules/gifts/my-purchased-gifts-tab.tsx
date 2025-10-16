"use client";

import { IconGift, IconPackage } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components";
import { useMyPurchasedGiftsQuery } from "@/hooks";
import Image from "next/image";

type MyPurchasedGiftsTabProps = {
  locale: string;
};

export function MyPurchasedGiftsTab({ locale }: MyPurchasedGiftsTabProps) {
  const t = useTranslations("gift.purchased");
  const tCommon = useTranslations("gift.common");

  // Fetch purchased gifts
  const { data, isLoading } = useMyPurchasedGiftsQuery({
    params: { lang: locale, pageSize: 1, pageNumber: 20 },
  });

  const gifts = data?.payload.data.items || [];

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
            <IconPackage className="mx-auto h-12 w-12 text-muted-foreground" />
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
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gifts.map((gift) => (
            <Card key={gift.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-3">
                  {/* Gift Icon */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    {gift.iconUrl ? (
                      <Image
                        src={gift.iconUrl}
                        alt={gift.name}
                        className="h-12 w-12 object-contain"
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

                  {/* Quantity & Price */}
                  <div className="flex w-full items-center justify-between">
                    <Badge variant="outline">
                      {t("quantity")}: {gift.quantity}
                    </Badge>
                    <Badge variant="secondary">{gift.price} PC</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
