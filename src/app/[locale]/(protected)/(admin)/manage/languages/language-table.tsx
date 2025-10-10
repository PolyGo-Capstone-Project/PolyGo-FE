"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import type { TranslationValues } from "next-intl";
import Image from "next/image";

import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/components/ui";
import { localeFlags, localeNames, locales, type Locale } from "@/i18n/config";
import { LanguageListItemType } from "@/models";

const EMPTY_ICON = "—";
const FALLBACK_FLAG = "🏳️";

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type PaginationState = {
  totalItems: number;
  startItem: number;
  endItem: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type LanguageTableProps = {
  safeTranslate: SafeTranslate;
  items: LanguageListItemType[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (id: string) => void;
  onDelete: (language: LanguageListItemType) => void | Promise<void>;
  isDeletePending: boolean;
  deletingId: string | null;
  lang: string;
  onLangChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: string) => void;
  pageSizeOptions: number[];
  onPageChange: (direction: "prev" | "next") => void;
  pagination: PaginationState;
};

export function LanguageTable({
  safeTranslate,
  items,
  isLoading,
  isFetching,
  isError,
  error,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  isDeletePending,
  deletingId,
  lang,
  onLangChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  onPageChange,
  pagination,
}: LanguageTableProps) {
  const isSupportedLocale = (value: string): value is Locale =>
    locales.includes(value as Locale);

  const getLocaleFlag = (value: string) =>
    isSupportedLocale(value) ? localeFlags[value] : FALLBACK_FLAG;

  const getLocaleName = (value: string) =>
    isSupportedLocale(value) ? localeNames[value] : value.toUpperCase();

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={5} className="py-10 text-center">
            <Spinner className="size-6" />
          </td>
        </tr>
      );
    }

    if (isError) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : safeTranslate("error", "Unable to load languages.");

      return (
        <tr>
          <td colSpan={5} className="p-6">
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>
                  {safeTranslate("errorTitle", "Something went wrong")}
                </EmptyTitle>
                <EmptyDescription>{errorMessage}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={onRefresh} variant="outline">
                  <IconRefresh className="size-4" />
                  {safeTranslate("retry", "Try again")}
                </Button>
              </EmptyContent>
            </Empty>
          </td>
        </tr>
      );
    }

    if (!items.length) {
      return (
        <tr>
          <td colSpan={5} className="p-6">
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>
                  {safeTranslate("emptyTitle", "No languages yet")}
                </EmptyTitle>
                <EmptyDescription>
                  {safeTranslate(
                    "emptyDescription",
                    "Add a new language to get started."
                  )}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={onOpenCreate}>
                  <IconPlus className="size-4" />
                  {safeTranslate("createButton", "Create language")}
                </Button>
              </EmptyContent>
            </Empty>
          </td>
        </tr>
      );
    }

    return items.map((language) => (
      <tr key={language.id} className="border-b last:border-b-0">
        <td className="px-4 py-3 font-medium uppercase">{language.id}</td>
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="font-medium">{language.name}</span>
            <span className="text-muted-foreground text-xs">
              {safeTranslate("languageIdLabel", "Internal ID")}: {language.id}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant="secondary">{language.code?.toUpperCase()}</Badge>
        </td>
        <td className="px-4 py-3">
          {language.flagIconUrl ? (
            <div className="flex items-center gap-3">
              <span className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                <Image
                  src={language.flagIconUrl}
                  alt={safeTranslate("columns.flagAlt", "Language flag image")}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                />
              </span>
              <span className="max-w-[220px] truncate text-muted-foreground text-xs">
                {language.flagIconUrl}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{EMPTY_ICON}</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenEdit(language.id)}
            >
              <IconPencil className="size-4" />
              <span className="sr-only">{safeTranslate("edit", "Edit")}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(language)}
              disabled={isDeletePending}
            >
              {isDeletePending && deletingId === language.id ? (
                <Spinner className="size-4" />
              ) : (
                <IconTrash className="size-4 text-destructive" />
              )}
              <span className="sr-only">
                {safeTranslate("delete", "Delete")}
              </span>
            </Button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>
            {safeTranslate("tableTitle", "Language catalogue")}
          </CardTitle>
          <CardDescription>
            {safeTranslate(
              "tableDescription",
              "Review, add or update available languages."
            )}
          </CardDescription>
        </div>

        <CardAction>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={lang} onValueChange={onLangChange}>
              <SelectTrigger className="min-w-[140px]">
                <SelectValue
                  placeholder={safeTranslate("languageFilter", "Locale")}
                />
              </SelectTrigger>
              <SelectContent>
                {locales.map((value) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <span>{getLocaleFlag(value)}</span>
                      <span>{getLocaleName(value)}</span>
                    </span>
                  </SelectItem>
                ))}
                {!isSupportedLocale(lang) && (
                  <SelectItem value={lang}>
                    <span className="flex items-center gap-2">
                      <span>{getLocaleFlag(lang)}</span>
                      <span>{getLocaleName(lang)}</span>
                    </span>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select value={String(pageSize)} onValueChange={onPageSizeChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue
                  placeholder={safeTranslate("pageSize", "Page size")}
                />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isFetching}
            >
              {isFetching ? (
                <Spinner className="size-4" />
              ) : (
                <IconRefresh className="size-4" />
              )}
              {safeTranslate("refresh", "Refresh")}
            </Button>

            <Button onClick={onOpenCreate}>
              <IconPlus className="size-4" />
              {safeTranslate("createButton", "Create language")}
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.id", "ID")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.name", "Display name")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.code", "Code")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.flag", "Flag icon")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
          </table>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-muted-foreground text-sm">
          {pagination.totalItems > 0 ? (
            safeTranslate(
              "pagination.summary",
              `Showing ${pagination.startItem}-${pagination.endItem} of ${pagination.totalItems} languages`,
              {
                start: pagination.startItem,
                end: pagination.endItem,
                total: pagination.totalItems,
              }
            )
          ) : (
            <span>
              {safeTranslate("pagination.empty", "No languages to display")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange("prev")}
            disabled={
              pagination.currentPage <= 1 ||
              (!pagination.hasPreviousPage && pagination.currentPage <= 1)
            }
          >
            <IconArrowLeft className="size-4" />
            {safeTranslate("pagination.previous", "Previous")}
          </Button>
          <span className="text-sm font-medium">
            {safeTranslate(
              "pagination.page",
              `Page ${pagination.currentPage} of ${Math.max(
                pagination.totalPages,
                pagination.currentPage
              )}`,
              {
                page: pagination.currentPage,
                total: Math.max(pagination.totalPages, pagination.currentPage),
              }
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange("next")}
            disabled={
              !pagination.hasNextPage &&
              pagination.currentPage >= pagination.totalPages
            }
          >
            {safeTranslate("pagination.next", "Next")}
            <IconArrowRight className="size-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
