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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {safeTranslate("detailDialog.title", "Badge details")}
          </DialogTitle>
          <DialogDescription>
            {safeTranslate("detailDialog.locale", "Locale")}: {badge.lang}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {badge.iconUrl && (
            <div className="flex justify-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={badge.iconUrl}
                  alt={badge.name}
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
              <span className="text-base">{badge.name}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {safeTranslate("detailDialog.code", "Code")}
              </span>
              <code className="text-base font-mono px-2 py-1 bg-muted rounded w-fit">
                {badge.code}
              </code>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {safeTranslate("detailDialog.category", "Category")}
              </span>
              <Badge variant="secondary" className="w-fit">
                {badge.badgeCategory}
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {safeTranslate("detailDialog.description", "Description")}
              </span>
              <span className="text-base">
                {badge.description ||
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
              <span className="text-base">
                {formatDateTime(badge.createdAt)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {safeTranslate("detailDialog.lastUpdatedAt", "Last updated at")}
              </span>
              <span className="text-base">
                {formatDateTime(badge.lastUpdatedAt)}
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
