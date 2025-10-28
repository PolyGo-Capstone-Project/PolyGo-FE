"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components";
import {
  useBadgeQuery,
  useBadgesQuery,
  useCreateBadgeMutation,
  useDeleteBadgeMutation,
  useUpdateBadgeMutation,
  useUploadMediaMutation,
} from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  BadgeListItemType,
  CreateBadgeBodyType,
  PaginationLangQueryType,
  UpdateBadgeBodyType,
} from "@/models";
import { useLocale, useTranslations, type TranslationValues } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { AddBadge } from "./add-badge";
import { BadgeDetailDialog } from "./badge-detail-dialog";
import { BadgeTable } from "./badge-table";
import { EditBadge } from "./edit-badge";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

export default function ManageBadges() {
  const locale = useLocale();
  const initialLang = useMemo(
    () => (locale ? locale.split("-")[0] : "en"),
    [locale]
  );

  const rootTranslations = useTranslations();
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");

  const safeTranslate = useCallback<SafeTranslate>(
    (key, fallback, values) => {
      try {
        const namespacedKey = `admin.badges.${key}`;
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
  const [lang, setLang] = useState(initialLang);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BadgeListItemType | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [itemToView, setItemToView] = useState<BadgeListItemType | null>(null);

  const queryParams = useMemo<PaginationLangQueryType>(
    () => ({ pageNumber, pageSize, lang }),
    [pageNumber, pageSize, lang]
  );

  const badgesQuery = useBadgesQuery({ params: queryParams });
  const badgeQuery = useBadgeQuery({
    id: editingId ?? undefined,
    lang,
    enabled: isEditOpen && Boolean(editingId),
  });

  const badgesPayload = badgesQuery.data?.payload;
  const pagination = badgesPayload?.data;
  const rawItems = pagination?.items;
  const items = useMemo<BadgeListItemType[]>(() => rawItems ?? [], [rawItems]);
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

  const editingBadgeFromList = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [items, editingId]
  );

  const createMutation = useCreateBadgeMutation(queryParams, {
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
      setIsAddOpen(false);
    },
  });

  const updateMutation = useUpdateBadgeMutation(queryParams, {
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
      setIsEditOpen(false);
      setEditingId(null);
    },
  });

  const deleteMutation = useDeleteBadgeMutation(queryParams, {
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
    },
  });

  const uploadMediaMutation = useUploadMediaMutation();

  const handleOpenCreate = () => {
    setIsAddOpen(true);
  };

  const handleAddOpenChange = (open: boolean) => {
    setIsAddOpen(open);
  };

  const handleOpenEdit = (id: string) => {
    setEditingId(id);
    setIsEditOpen(true);
  };

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setEditingId(null);
    }
  };

  const handleViewDetails = (badge: BadgeListItemType) => {
    setItemToView(badge);
    setDetailDialogOpen(true);
  };

  const handleDetailDialogChange = (open: boolean) => {
    setDetailDialogOpen(open);
    if (!open) {
      setItemToView(null);
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

  const handleLangChange = (value: string) => {
    setLang(value);
    setPageNumber(1);
  };

  const handleCreateBadge = async (
    values: CreateBadgeBodyType,
    options?: { file?: File | null }
  ) => {
    const trimmedLang = values.lang.trim();
    const trimmedCode = values.code.trim();
    const trimmedName = values.name.trim();
    const trimmedDescription = values.description?.trim() || undefined;
    let iconUrl = values.iconUrl?.trim() || undefined;

    if (options?.file) {
      const uploadResponse = await uploadMediaMutation.mutateAsync({
        file: options.file,
        addUniqueName: true,
      });
      iconUrl = uploadResponse.payload?.data ?? iconUrl;
    }

    const payload: CreateBadgeBodyType = {
      lang: trimmedLang,
      code: trimmedCode,
      name: trimmedName,
      description: trimmedDescription,
      badgeCategory: values.badgeCategory,
      ...(iconUrl ? { iconUrl } : {}),
    };

    await createMutation.mutateAsync(payload);
  };

  const handleUpdateBadge = async (
    id: string,
    values: CreateBadgeBodyType,
    options?: { file?: File | null }
  ) => {
    const trimmedLang = values.lang.trim();
    const trimmedCode = values.code.trim();
    const trimmedName = values.name.trim();
    const trimmedDescription = values.description?.trim() || undefined;
    let iconUrl = values.iconUrl?.trim() || undefined;

    if (options?.file) {
      const uploadResponse = await uploadMediaMutation.mutateAsync({
        file: options.file,
        addUniqueName: true,
      });
      iconUrl = uploadResponse.payload?.data ?? iconUrl;
    }

    const payload: UpdateBadgeBodyType = {
      lang: trimmedLang,
      code: trimmedCode,
      name: trimmedName,
      description: trimmedDescription,
      badgeCategory: values.badgeCategory,
      ...(iconUrl ? { iconUrl } : {}),
    };

    await updateMutation.mutateAsync({ id, body: payload });
  };

  const handleDeleteBadge = async (badge: BadgeListItemType) => {
    setItemToDelete(badge);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeletingId(itemToDelete.id);
      await deleteMutation.mutateAsync(itemToDelete.id);

      if (editingId === itemToDelete.id) {
        setEditingId(null);
        setIsEditOpen(false);
      }

      if (items.length === 1 && hasPreviousPage) {
        setPageNumber((prev) => Math.max(prev - 1, 1));
      }
    } catch (error) {
      handleErrorApi({ error, tError });
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const isListLoading = badgesQuery.isLoading;
  const isListFetching = badgesQuery.isFetching && !badgesQuery.isLoading;

  const refreshList = () => {
    badgesQuery.refetch();
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

  const editBadge = badgeQuery.data?.payload?.data ?? editingBadgeFromList;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {safeTranslate("title", "Badges")}
        </h1>
        <p className="text-muted-foreground">
          {safeTranslate(
            "description",
            "Manage badges available on the PolyGo platform."
          )}
        </p>
      </div>

      <BadgeTable
        safeTranslate={safeTranslate}
        items={items}
        isLoading={isListLoading}
        isFetching={isListFetching}
        isError={badgesQuery.isError}
        error={badgesQuery.error}
        onRefresh={refreshList}
        onOpenCreate={handleOpenCreate}
        onOpenEdit={handleOpenEdit}
        onDelete={handleDeleteBadge}
        onViewDetails={handleViewDetails}
        isDeletePending={deleteMutation.isPending}
        deletingId={deletingId}
        lang={lang}
        onLangChange={handleLangChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={handlePageChange}
        pagination={paginationState}
      />

      <AddBadge
        open={isAddOpen}
        onOpenChange={handleAddOpenChange}
        safeTranslate={safeTranslate}
        onSubmit={handleCreateBadge}
        isSubmitting={createMutation.isPending}
        tError={tError}
        isUploading={uploadMediaMutation.isPending}
      />

      <EditBadge
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
        safeTranslate={safeTranslate}
        onSubmit={handleUpdateBadge}
        badgeId={editingId}
        badge={editBadge}
        isLoading={badgeQuery.isLoading}
        isSubmitting={updateMutation.isPending}
        tError={tError}
        isUploading={uploadMediaMutation.isPending}
      />

      <BadgeDetailDialog
        open={detailDialogOpen}
        onOpenChange={handleDetailDialogChange}
        badge={itemToView}
        safeTranslate={safeTranslate}
        lang={lang}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {safeTranslate("deleteDialog.title", "Delete badge")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {safeTranslate(
                "deleteDialog.description",
                `Are you sure you want to delete ${itemToDelete?.name ?? "this badge"}? This action cannot be undone.`,
                {
                  name: itemToDelete?.name
                    ? `${itemToDelete.name} (${itemToDelete.code})`
                    : safeTranslate("fallbackName", "this badge"),
                }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {safeTranslate("deleteDialog.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending
                ? safeTranslate("deleting", "Deleting...")
                : safeTranslate("deleteDialog.confirm", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
