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
import { InterestListItemType } from "@/models";

const EMPTY_ICON = "—";

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type InterestDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interest: InterestListItemType | null;
  safeTranslate: SafeTranslate;
  lang: string;
};

export function InterestDetailDialog({
  open,
  onOpenChange,
  interest,
  safeTranslate,
  lang,
}: InterestDetailDialogProps) {
  if (!interest) return null;

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
            {safeTranslate("detailDialog.title", "Interest details")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {interest.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Interest Icon Preview */}
          {interest.iconUrl && (
            <div className="flex justify-center p-6 border rounded-lg bg-muted/30">
              <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-background shadow-sm">
                <Image
                  src={interest.iconUrl}
                  alt={interest.name}
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
                {safeTranslate("detailDialog.name", "Interest Name")}
              </span>
              <span className="text-lg font-semibold">{interest.name}</span>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.locale", "Locale")}
              </span>
              <Badge variant="secondary" className="w-fit text-base py-1">
                {interest.lang?.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {interest.description && (
            <div className="flex flex-col gap-2 p-4 border rounded-lg">
              <span className="text-sm font-semibold">
                {safeTranslate("detailDialog.description", "Description")}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {interest.description}
              </p>
            </div>
          )}

          {!interest.description && (
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
                {formatDateTime(interest.createdAt)}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.lastUpdatedAt", "Last updated at")}
              </span>
              <span className="text-sm font-mono">
                {formatDateTime(interest.lastUpdatedAt)}
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
