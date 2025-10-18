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
import { BadgeListItemType } from "@/models";

const EMPTY_ICON = "—";

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type BadgeDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: BadgeListItemType | null;
  safeTranslate: SafeTranslate;
  lang: string;
};

export function BadgeDetailDialog({
  open,
  onOpenChange,
  badge,
  safeTranslate,
  lang,
}: BadgeDetailDialogProps) {
  if (!badge) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {safeTranslate("detailDialog.title", "Badge details")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {badge.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Badge Icon Preview */}
          {badge.iconUrl && (
            <div className="flex justify-center p-6 border rounded-lg bg-muted/30">
              <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-background shadow-sm">
                <Image
                  src={badge.iconUrl}
                  alt={badge.name}
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
                {safeTranslate("detailDialog.category", "Category")}
              </span>
              <Badge variant="outline" className="w-fit text-base py-1">
                {badge.badgeCategory}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.locale", "Locale")}
              </span>
              <Badge variant="secondary" className="w-fit text-base py-1">
                {badge.lang?.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Code Section */}
          <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {safeTranslate("detailDialog.code", "Badge Code")}
            </span>
            <code className="text-lg font-mono px-3 py-2 bg-background rounded-md border w-fit font-semibold">
              {badge.code}
            </code>
          </div>

          {/* Description */}
          {badge.description && (
            <div className="flex flex-col gap-2 p-4 border rounded-lg">
              <span className="text-sm font-semibold">
                {safeTranslate("detailDialog.description", "Description")}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {badge.description}
              </p>
            </div>
          )}

          {!badge.description && (
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
                {formatDateTime(badge.createdAt)}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.lastUpdatedAt", "Last updated at")}
              </span>
              <span className="text-sm font-mono">
                {formatDateTime(badge.lastUpdatedAt)}
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
