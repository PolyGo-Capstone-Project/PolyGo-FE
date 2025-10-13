"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconEye,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import type { TranslationValues } from "next-intl";
import Image from "next/image";

import { LoadingOverlay } from "@/components";
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
import { GiftListItemType } from "@/models";

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

type GiftTableProps = {
  safeTranslate: SafeTranslate;
  items: GiftListItemType[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onOpenEdit: (id: string) => void;
  onDelete: (gift: GiftListItemType) => void | Promise<void>;
  onViewDetails: (gift: GiftListItemType) => void;
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

export function GiftTable({
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
  onViewDetails,
  isDeletePending,
  deletingId,
  lang,
  onLangChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  onPageChange,
  pagination,
}: GiftTableProps) {
  const isSupportedLocale = (value: string): value is Locale =>
    locales.includes(value as Locale);

  const getLocaleFlag = (value: string) =>
    isSupportedLocale(value) ? localeFlags[value] : FALLBACK_FLAG;

  const getLocaleName = (value: string) =>
    isSupportedLocale(value) ? localeNames[value] : value.toUpperCase();

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
        dateStyle: "medium",
        timeStyle: "short",
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

  const truncateText = (text: string | null | undefined, maxLength = 50) => {
    if (!text) return EMPTY_ICON;
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  const renderTableBody = () => {
    if (isLoading) {
      return <LoadingOverlay />;
    }

    if (isError) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : safeTranslate("error", "Unable to load gifts.");

      return (
        <tr>
          <td colSpan={8} className="p-6">
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
          <td colSpan={8} className="p-6">
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>
                  {safeTranslate("emptyTitle", "No gifts yet")}
                </EmptyTitle>
                <EmptyDescription>
                  {safeTranslate(
                    "emptyDescription",
                    "Add a new gift to get started."
                  )}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={onOpenCreate}>
                  <IconPlus className="size-4" />
                  {safeTranslate("createButton", "Create gift")}
                </Button>
              </EmptyContent>
            </Empty>
          </td>
        </tr>
      );
    }

    return items.map((gift, index) => {
      const rowNumber = (pagination.currentPage - 1) * pageSize + index + 1;
      return (
        <tr
          key={gift.id}
          className="border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onViewDetails(gift)}
        >
          <td className="px-4 py-3 text-center font-medium">{rowNumber}</td>
          <td className="px-4 py-3">
            <div className="flex flex-col">
              <span className="font-medium">{gift.name}</span>
              <span className="text-muted-foreground text-xs">
                {safeTranslate("giftIdLabel", "Internal ID")}: {gift.id}
              </span>
            </div>
          </td>
          <td className="px-4 py-3">
            <Badge variant="secondary">{formatPrice(gift.price)} VND</Badge>
          </td>
          <td className="px-4 py-3">
            <div className="max-w-xs">{truncateText(gift.description, 40)}</div>
          </td>
          <td className="px-4 py-3">
            {gift.iconUrl ? (
              <div className="flex items-center gap-3">
                <span className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                  <Image
                    src={gift.iconUrl}
                    alt={safeTranslate("columns.iconAlt", "Gift icon image")}
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized
                  />
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">{EMPTY_ICON}</span>
            )}
          </td>
          <td className="px-4 py-3 text-nowrap">
            {formatDateTime(gift.createdAt)}
          </td>
          <td className="px-4 py-3 text-nowrap">
            {formatDateTime(gift.lastUpdatedAt)}
          </td>
          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(gift)}
              >
                <IconEye className="size-4" />
                <span className="sr-only">
                  {safeTranslate("viewDetails", "View details")}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenEdit(gift.id)}
              >
                <IconPencil className="size-4" />
                <span className="sr-only">{safeTranslate("edit", "Edit")}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(gift)}
                disabled={isDeletePending}
              >
                {isDeletePending && deletingId === gift.id ? (
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
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{safeTranslate("tableTitle", "Gift catalogue")}</CardTitle>
          <CardDescription>
            {safeTranslate(
              "tableDescription",
              "Review, add or update available gifts."
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
              {safeTranslate("createButton", "Create gift")}
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-center font-medium">
                  {safeTranslate("columns.no", "No.")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.name", "Gift name")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.price", "Price")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.description", "Description")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.icon", "Icon")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.createdAt", "Created at")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.lastUpdatedAt", "Last updated at")}
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
              `Showing ${pagination.startItem}-${pagination.endItem} of ${pagination.totalItems} gifts`,
              {
                start: pagination.startItem,
                end: pagination.endItem,
                total: pagination.totalItems,
              }
            )
          ) : (
            <span>
              {safeTranslate("pagination.empty", "No gifts to display")}
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
