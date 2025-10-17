"use client";

import { useLocale, useTranslations, type TranslationValues } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import {
  useCreateInterestMutation,
  useDeleteInterestMutation,
  useInterestQuery,
  useInterestsQuery,
  useUpdateInterestMutation,
  useUploadMediaMutation,
} from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  CreateInterestBodyType,
  InterestListItemType,
  PaginationLangQueryType,
  UpdateInterestBodyType,
} from "@/models";

import { AddInterest } from "./add-interest";
import { EditInterest } from "./edit-interest";
import { InterestDetailDialog } from "./interest-detail-dialog";
import { InterestTable } from "./interest-table";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

export default function ManageInterestsPage() {
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
        const namespacedKey = `admin.interests.${key}`;
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
  const [itemToDelete, setItemToDelete] = useState<InterestListItemType | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInterest, setSelectedInterest] =
    useState<InterestListItemType | null>(null);

  const queryParams = useMemo<PaginationLangQueryType>(
    () => ({ pageNumber, pageSize, lang }),
    [pageNumber, pageSize, lang]
  );

  const interestsQuery = useInterestsQuery({ params: queryParams });
  const interestQuery = useInterestQuery({
    id: editingId ?? undefined,
    lang,
    enabled: isEditOpen && Boolean(editingId),
  });

  const interestsPayload = interestsQuery.data?.payload;
  const pagination = interestsPayload?.data;
  const rawItems = pagination?.items;
  const items = useMemo<InterestListItemType[]>(
    () => rawItems ?? [],
    [rawItems]
  );
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

  const editingInterestFromList = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [items, editingId]
  );

  const createMutation = useCreateInterestMutation(queryParams, {
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
      setIsAddOpen(false);
    },
  });

  const updateMutation = useUpdateInterestMutation(queryParams, {
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
      setIsEditOpen(false);
      setEditingId(null);
    },
  });

  const deleteMutation = useDeleteInterestMutation(queryParams, {
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

  const handleOpenDetail = (interest: InterestListItemType) => {
    setSelectedInterest(interest);
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

  const handleLangChange = (value: string) => {
    setLang(value);
    setPageNumber(1);
  };

  const handleCreateInterest = async (
    values: CreateInterestBodyType,
    options?: { file?: File | null }
  ) => {
    const trimmedLang = values.lang.trim();
    const trimmedName = values.name.trim();
    const trimmedDescription = values.description.trim();
    let iconUrl = values.iconUrl?.trim() || undefined;

    if (options?.file) {
      const uploadResponse = await uploadMediaMutation.mutateAsync({
        file: options.file,
        addUniqueName: true,
      });
      iconUrl = uploadResponse.payload?.data ?? iconUrl;
    }

    const payload: CreateInterestBodyType = {
      lang: trimmedLang,
      name: trimmedName,
      description: trimmedDescription,
      ...(iconUrl ? { iconUrl } : {}),
    };

    await createMutation.mutateAsync(payload);
  };

  const handleUpdateInterest = async (
    id: string,
    values: CreateInterestBodyType,
    options?: { file?: File | null }
  ) => {
    const trimmedLang = values.lang.trim();
    const trimmedName = values.name.trim();
    const trimmedDescription = values.description.trim();
    let iconUrl = values.iconUrl?.trim() || undefined;

    if (options?.file) {
      const uploadResponse = await uploadMediaMutation.mutateAsync({
        file: options.file,
        addUniqueName: true,
      });
      iconUrl = uploadResponse.payload?.data ?? iconUrl;
    }

    const payload: UpdateInterestBodyType = {
      lang: trimmedLang,
      name: trimmedName,
      description: trimmedDescription,
      ...(iconUrl ? { iconUrl } : {}),
    };

    await updateMutation.mutateAsync({ id, body: payload });
  };

  const handleDeleteInterest = async (interest: InterestListItemType) => {
    setItemToDelete(interest);
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

  const isListLoading = interestsQuery.isLoading;
  const isListFetching = interestsQuery.isFetching && !interestsQuery.isLoading;

  const refreshList = () => {
    interestsQuery.refetch();
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

  const editInterest =
    interestQuery.data?.payload?.data ?? editingInterestFromList;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {safeTranslate("title", "Interests")}
        </h1>
        <p className="text-muted-foreground">
          {safeTranslate(
            "description",
            "Manage the catalogue of interests available across PolyGo."
          )}
        </p>
      </div>

      <InterestTable
        safeTranslate={safeTranslate}
        items={items}
        isLoading={isListLoading}
        isFetching={isListFetching}
        isError={interestsQuery.isError}
        error={interestsQuery.error}
        onRefresh={refreshList}
        onOpenCreate={handleOpenCreate}
        onOpenEdit={handleOpenEdit}
        onOpenDetail={handleOpenDetail}
        onDelete={handleDeleteInterest}
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

      <AddInterest
        open={isAddOpen}
        onOpenChange={handleAddOpenChange}
        safeTranslate={safeTranslate}
        onSubmit={handleCreateInterest}
        isSubmitting={createMutation.isPending}
        tError={tError}
        isUploading={uploadMediaMutation.isPending}
      />

      <EditInterest
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
        safeTranslate={safeTranslate}
        onSubmit={handleUpdateInterest}
        interestId={editingId}
        interest={editInterest}
        isLoading={interestQuery.isLoading}
        isSubmitting={updateMutation.isPending}
        tError={tError}
        isUploading={uploadMediaMutation.isPending}
      />

      <InterestDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        interest={selectedInterest}
        safeTranslate={safeTranslate}
        lang={lang}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {safeTranslate("deleteDialog.title", "Delete interest")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {safeTranslate(
                "deleteDialog.description",
                `Are you sure you want to delete ${itemToDelete?.name ?? "this interest"}? This action cannot be undone.`,
                {
                  name:
                    itemToDelete?.name ??
                    safeTranslate("fallbackName", "this interest"),
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
