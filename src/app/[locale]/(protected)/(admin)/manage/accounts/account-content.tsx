"use client";

import { useLocale, useTranslations, type TranslationValues } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { useGetUser, useGetUsers, useSetRestrictionsMutation } from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  GetUsersQueryType,
  SetRestrictionsBodyType,
  UserListItemType,
} from "@/models";

import { EditAccounts } from "./edit-accounts";
import { TableAccounts } from "./table-accounts";
import { UserDetailDialog } from "./user-detail-dialog";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

export default function ManageAccounts() {
  const locale = useLocale();

  const rootTranslations = useTranslations();
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");

  const safeTranslate = useCallback<SafeTranslate>(
    (key, fallback, values) => {
      try {
        const namespacedKey = `admin.accounts.${key}`;
        const result = rootTranslations(namespacedKey, values);
        return result === namespacedKey ? fallback : result;
      } catch {
        return fallback;
      }
    },
    [rootTranslations]
  );

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const queryParams = useMemo<GetUsersQueryType>(
    () => ({ pageNumber, pageSize }),
    [pageNumber, pageSize]
  );

  const usersQuery = useGetUsers(queryParams);
  const userQuery = useGetUser(editingId ?? "", {
    enabled: isEditOpen && Boolean(editingId),
  });

  const detailUserQuery = useGetUser(selectedUserId ?? "", {
    enabled: detailOpen && Boolean(selectedUserId),
  });

  const usersPayload = usersQuery.data?.payload;
  const pagination = usersPayload?.data;
  const rawItems = pagination?.items;
  const items = useMemo<UserListItemType[]>(() => rawItems ?? [], [rawItems]);
  const totalItems = pagination?.totalItems ?? 0;
  const currentPage = pagination?.currentPage ?? pageNumber;
  const totalPages = pagination?.totalPages ?? 0;
  const hasPreviousPage = pagination?.hasPreviousPage ?? currentPage > 1;
  const hasNextPage = pagination?.hasNextPage ?? false;
  const effectivePageSize = pagination?.pageSize ?? pageSize;

  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min(startItem + items.length - 1, totalItems);

  const editingUserFromList = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [items, editingId]
  );

  const setRestrictionsMutation = useSetRestrictionsMutation({
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
      setIsEditOpen(false);
      setEditingId(null);
      usersQuery.refetch();
    },
  });

  const handleOpenEdit = (id: string) => {
    setEditingId(id);
    setIsEditOpen(true);
  };

  const handleOpenDetail = (id: string) => {
    setSelectedUserId(id);
    setDetailOpen(true);
  };

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setEditingId(null);
    }
  };

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && (hasPreviousPage || currentPage > 1)) {
      setPageNumber((prev) => Math.max(prev - 1, 1));
    }
    if (direction === "next" && (hasNextPage || currentPage < totalPages)) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const nextSize = Number(value);
    setPageSize(nextSize);
    setPageNumber(1);
  };

  const handleUpdateRestrictions = async (
    id: string,
    values: SetRestrictionsBodyType
  ) => {
    try {
      await setRestrictionsMutation.mutateAsync({
        body: values,
        id,
      });
    } catch (error) {
      console.error("API Error:", error);
      handleErrorApi({ error, tError });
    }
  };

  const isListLoading = usersQuery.isLoading;
  const isListFetching = usersQuery.isFetching && !usersQuery.isLoading;

  const refreshList = () => {
    usersQuery.refetch();
  };

  const paginationState = {
    totalItems,
    startItem,
    endItem,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };

  const editUser = userQuery.data?.payload?.data ?? editingUserFromList;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {safeTranslate("title", "User accounts")}
        </h1>
        <p className="text-muted-foreground">
          {safeTranslate(
            "description",
            "Manage user accounts and their access restrictions."
          )}
        </p>
      </div>

      <TableAccounts
        safeTranslate={safeTranslate}
        items={items}
        isLoading={isListLoading}
        isFetching={isListFetching}
        isError={usersQuery.isError}
        error={usersQuery.error}
        onRefresh={refreshList}
        onOpenEdit={handleOpenEdit}
        onOpenDetail={handleOpenDetail}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={handlePageChange}
        pagination={paginationState}
      />

      <EditAccounts
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
        safeTranslate={safeTranslate}
        onSubmit={handleUpdateRestrictions}
        userId={editingId}
        user={editUser}
        isLoading={userQuery.isLoading}
        isSubmitting={setRestrictionsMutation.isPending}
        tError={tError}
      />

      <UserDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        user={detailUserQuery.data?.payload?.data ?? null}
        safeTranslate={safeTranslate}
        lang={locale}
      />
    </div>
  );
}
