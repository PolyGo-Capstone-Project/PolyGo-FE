"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconEye,
  IconPencil,
  IconRefresh,
} from "@tabler/icons-react";
import type { TranslationValues } from "next-intl";

import { LoadingOverlay } from "@/components";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { MeritLevel } from "@/constants";
import { UserListItemType } from "@/models";

const EMPTY_ICON = "—";

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

type TableAccountsProps = {
  safeTranslate: SafeTranslate;
  items: UserListItemType[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  onRefresh: () => void;
  onOpenEdit: (id: string) => void;
  onOpenDetail: (id: string) => void;
  pageSize: number;
  onPageSizeChange: (value: string) => void;
  pageSizeOptions: number[];
  onPageChange: (direction: "prev" | "next") => void;
  pagination: PaginationState;
};

export function TableAccounts({
  safeTranslate,
  items,
  isLoading,
  isFetching,
  isError,
  error,
  onRefresh,
  onOpenEdit,
  onOpenDetail,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  onPageChange,
  pagination,
}: TableAccountsProps) {
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

      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone,
      }).format(date);
    } catch (error) {
      return new Date(value).toLocaleString("en-US");
    }
  };

  const getMeritLevelColor = (
    level: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case MeritLevel.Admin:
        return "default";
      case MeritLevel.Reliable:
        return "secondary";
      case MeritLevel.Monitored:
        return "outline";
      case MeritLevel.Restricted:
        return "destructive";
      case MeritLevel.Banned:
        return "destructive";
      default:
        return "outline";
    }
  };

  const getGenderDisplay = (gender: string | null) => {
    if (!gender) return EMPTY_ICON;
    return gender;
  };

  const renderTableBody = () => {
    if (isLoading) {
      return <LoadingOverlay />;
    }

    if (isError) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : safeTranslate("error", "Unable to load accounts.");

      return (
        <tr>
          <td colSpan={10} className="p-6">
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
          <td colSpan={10} className="p-6">
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyTitle>
                  {safeTranslate("emptyTitle", "No accounts yet")}
                </EmptyTitle>
                <EmptyDescription>
                  {safeTranslate(
                    "emptyDescription",
                    "No user accounts found in the system."
                  )}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </td>
        </tr>
      );
    }

    return items.map((user, index) => {
      const rowNumber = (pagination.currentPage - 1) * pageSize + index + 1;
      return (
        <tr key={user.id} className="border-b last:border-b-0">
          <td className="px-4 py-3 text-center font-medium">{rowNumber}</td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.avatarUrl ?? undefined}
                  alt={user.name}
                />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-muted-foreground text-xs">
                  {user.mail}
                </span>
              </div>
            </div>
          </td>
          <td className="px-4 py-3">
            <Badge variant={getMeritLevelColor(user.meritLevel)}>
              {user.meritLevel}
            </Badge>
          </td>
          <td className="px-4 py-3">
            <Badge variant="outline">{user.role}</Badge>
          </td>
          <td className="px-4 py-3 text-center">
            {getGenderDisplay(user.gender)}
          </td>
          <td className="px-4 py-3 text-center">{user.experiencePoints}</td>
          <td className="px-4 py-3 text-center">{user.streakDays}</td>
          <td className="px-4 py-3 text-center">
            <Badge
              variant={user.autoRenewSubscription ? "secondary" : "outline"}
            >
              {user.autoRenewSubscription ? "Yes" : "No"}
            </Badge>
          </td>
          <td className="px-4 py-3 text-nowrap">
            {formatDateTime(user.lastLoginAt)}
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenDetail(user.id)}
              >
                <IconEye className="size-4" />
                <span className="sr-only">{safeTranslate("view", "View")}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenEdit(user.id)}
              >
                <IconPencil className="size-4" />
                <span className="sr-only">{safeTranslate("edit", "Edit")}</span>
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
          <CardTitle>{safeTranslate("tableTitle", "User accounts")}</CardTitle>
          <CardDescription>
            {safeTranslate(
              "tableDescription",
              "Manage user accounts and their permissions."
            )}
          </CardDescription>
        </div>

        <CardAction>
          <div className="flex flex-wrap items-center gap-2">
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
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-center font-medium">
                  {safeTranslate("columns.no", "No.")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.user", "User")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.meritLevel", "Merit level")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.role", "Role")}
                </th>
                <th className="px-4 py-3 text-center font-medium">
                  {safeTranslate("columns.gender", "Gender")}
                </th>
                <th className="px-4 py-3 text-center font-medium">
                  {safeTranslate("columns.experience", "XP")}
                </th>
                <th className="px-4 py-3 text-center font-medium">
                  {safeTranslate("columns.streak", "Streak")}
                </th>
                <th className="px-4 py-3 text-center font-medium">
                  {safeTranslate("columns.subscription", "Auto-renew")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {safeTranslate("columns.lastLogin", "Last login")}
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
              `Showing ${pagination.startItem}-${pagination.endItem} of ${pagination.totalItems} accounts`,
              {
                start: pagination.startItem,
                end: pagination.endItem,
                total: pagination.totalItems,
              }
            )
          ) : (
            <span>
              {safeTranslate("pagination.empty", "No accounts to display")}
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
