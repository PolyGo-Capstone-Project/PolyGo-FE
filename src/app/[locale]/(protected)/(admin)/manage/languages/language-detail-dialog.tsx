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
import { LanguageListItemType } from "@/models";

const EMPTY_ICON = "—";

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type LanguageDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: LanguageListItemType | null;
  safeTranslate: SafeTranslate;
  lang: string;
};

export function LanguageDetailDialog({
  open,
  onOpenChange,
  language,
  safeTranslate,
  lang,
}: LanguageDetailDialogProps) {
  if (!language) return null;

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
            {safeTranslate("detailDialog.title", "Language details")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {language.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Language Icon/Flag Preview */}
          {language.iconUrl && (
            <div className="flex justify-center p-6 border rounded-lg bg-muted/30">
              <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-background shadow-sm">
                <Image
                  src={language.iconUrl}
                  alt={language.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.name", "Language Name")}
              </span>
              <span className="text-lg font-semibold">{language.name}</span>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.code", "Language Code")}
              </span>
              <Badge
                variant="outline"
                className="w-fit text-base py-1 font-mono"
              >
                {language.code?.toUpperCase()}
              </Badge>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.locale", "Display Locale")}
              </span>
              <Badge variant="secondary" className="w-fit text-base py-1">
                {language.lang?.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Information Note */}
          <div className="flex flex-col gap-2 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {safeTranslate(
                    "detailDialog.aboutLanguage",
                    "About this language"
                  )}
                </span>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  {safeTranslate(
                    "detailDialog.languageInfo",
                    "This language can be selected by users for learning or as their speaking language."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 border rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.createdAt", "Created at")}
              </span>
              <span className="text-sm font-mono">
                {formatDateTime(language.createdAt)}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4 border rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {safeTranslate("detailDialog.lastUpdatedAt", "Last updated at")}
              </span>
              <span className="text-sm font-mono">
                {formatDateTime(language.lastUpdatedAt)}
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
