"use client";

import type { TranslationValues } from "next-intl";
import Image from "next/image";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { GiftListItemType } from "@/models";

const EMPTY_ICON = "—";

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type GiftDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gift: GiftListItemType | null;
  safeTranslate: SafeTranslate;
  lang: string;
};

export function GiftDetailDialog({
  open,
  onOpenChange,
  gift,
  safeTranslate,
  lang,
}: GiftDetailDialogProps) {
  if (!gift) return null;

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return EMPTY_ICON;
    }

    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return EMPTY_ICON;
      }

      const timeZone =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : undefined;

      return new Intl.DateTimeFormat(lang, {
        dateStyle: "long",
        timeStyle: "medium",
        timeZone,
      }).format(date);
    } catch (error) {
      return new Date(value).toLocaleString(lang);
    }
  };

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat(lang, {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return price.toLocaleString();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {safeTranslate("detailDialog.title", "Gift details")}
          </DialogTitle>
          <DialogDescription>
            {gift.name} - {formatPrice(gift.price)} VND
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {gift.iconUrl && (
            <div className="flex justify-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={gift.iconUrl}
                  alt={gift.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          <div className="grid gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {safeTranslate("detailDialog.name", "Name")}
              </span>
              <span className="text-base">{gift.name}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {safeTranslate("detailDialog.price", "Price")}
              </span>
              <span className="text-base font-semibold">
                {formatPrice(gift.price)} VND
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {safeTranslate("detailDialog.locale", "Locale")}
              </span>
              <span className="text-base">{gift.lang?.toUpperCase()}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {safeTranslate("detailDialog.description", "Description")}
              </span>
              <span className="text-base whitespace-pre-wrap">
                {gift.description ||
                  safeTranslate(
                    "detailDialog.noDescription",
                    "No description available"
                  )}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {safeTranslate("detailDialog.createdAt", "Created at")}
              </span>
              <span className="text-sm">{formatDateTime(gift.createdAt)}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {safeTranslate("detailDialog.lastUpdatedAt", "Last updated at")}
              </span>
              <span className="text-sm">
                {formatDateTime(gift.lastUpdatedAt)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {safeTranslate("detailDialog.close", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
