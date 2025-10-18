"use client";

import type { TranslationValues } from "next-intl";
import Image from "next/image";

import {
  Badge,
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
    if (!value) return EMPTY_ICON;

    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return EMPTY_ICON;

      const timeZone =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : undefined;

      return new Intl.DateTimeFormat(lang, {
        dateStyle: "long",
        timeStyle: "medium",
        timeZone,
      }).format(date);
    } catch {
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
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {safeTranslate("detailDialog.title", "Gift details")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {gift.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Gift Icon Preview */}
          {gift.iconUrl && (
            <div className="flex justify-center p-6 border rounded-lg bg-muted/30">
              <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-background shadow-sm">
                <Image
                  src={gift.iconUrl}
                  alt={gift.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.price", "Price")}
              </span>
              <span className="text-2xl font-bold">
                {formatPrice(gift.price)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  VND
                </span>
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.locale", "Locale")}
              </span>
              <Badge variant="secondary" className="w-fit text-base py-1">
                {gift.lang?.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {gift.description && (
            <div className="flex flex-col gap-2 p-4 border rounded-lg">
              <span className="text-sm font-semibold">
                {safeTranslate("detailDialog.description", "Description")}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {gift.description}
              </p>
            </div>
          )}

          {!gift.description && (
            <div className="flex items-center justify-center p-6 border border-dashed rounded-lg">
              <span className="text-sm text-muted-foreground">
                {safeTranslate(
                  "detailDialog.noDescription",
                  "No description available"
                )}
              </span>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 border rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.createdAt", "Created at")}
              </span>
              <span className="text-sm font-mono">
                {formatDateTime(gift.createdAt)}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.lastUpdatedAt", "Last updated at")}
              </span>
              <span className="text-sm font-mono">
                {formatDateTime(gift.lastUpdatedAt)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {safeTranslate("detailDialog.close", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
