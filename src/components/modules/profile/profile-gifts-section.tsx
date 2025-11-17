"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconGift, IconPackage } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type Gift = {
  id: string;
  name: string;
  quantity: number;
  iconUrl?: string;
};

type ProfileGiftsSectionProps = {
  gifts: Gift[];
};

export function ProfileGiftsSection({ gifts }: ProfileGiftsSectionProps) {
  const t = useTranslations("profile");

  // Calculate total number of gifts
  const totalGifts = gifts.reduce((sum, gift) => sum + gift.quantity, 0);

  // Validate if URL is valid
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (gifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconGift className="h-5 w-5" />
            {t("sections.gifts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <IconGift className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("empty.noGifts")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconGift className="h-5 w-5" />
          {t("sections.gifts")}
          <Badge variant="secondary" className="ml-auto">
            {totalGifts}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {gifts.map((gift) => (
            <div
              key={gift.id}
              className="group relative flex flex-col items-center gap-3 rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-md"
            >
              {/* Quantity Badge */}
              {gift.quantity > 1 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 h-6 min-w-6 rounded-full px-2 shadow-sm"
                >
                  ×{gift.quantity}
                </Badge>
              )}

              {/* Gift Icon/Image */}
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden transition-transform group-hover:scale-110">
                {isValidUrl(gift.iconUrl) ? (
                  <Image
                    src={gift.iconUrl!}
                    alt={gift.name}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                ) : (
                  <IconPackage className="h-8 w-8 text-primary/70" />
                )}
              </div>

              {/* Gift Name */}
              <div className="w-full text-center">
                <p className="font-medium text-sm line-clamp-2 leading-tight">
                  {gift.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
