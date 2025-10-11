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
  useCreateLanguageMutation,
  useDeleteLanguageMutation,
  useLanguageQuery,
  useLanguagesQuery,
  useUpdateLanguageMutation,
  useUploadMediaMutation,
} from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  CreateLanguageBodyType,
  LanguageListItemType,
  PaginationLangQueryType,
  UpdateLanguageBodyType,
} from "@/models";

import { AddLanguage } from "./add-language";
import { EditLanguage } from "./edit-language";
import { LanguageTable } from "./language-table";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

export default function ManageLanguagesPage() {
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
        const namespacedKey = `admin.languages.${key}`;
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
  const [itemToDelete, setItemToDelete] = useState<LanguageListItemType | null>(
    null
  );

  const queryParams = useMemo<PaginationLangQueryType>(
    () => ({ pageNumber, pageSize, lang }),
    [pageNumber, pageSize, lang]
  );

  const languagesQuery = useLanguagesQuery({ params: queryParams });
  const languageQuery = useLanguageQuery({
    id: editingId ?? undefined,
    lang,
    enabled: isEditOpen && Boolean(editingId),
  });

  const languagesPayload = languagesQuery.data?.payload;
  const pagination = languagesPayload?.data;
  const rawItems = pagination?.items;
  const items = useMemo<LanguageListItemType[]>(
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

  const editingLanguageFromList = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [items, editingId]
  );

  const createMutation = useCreateLanguageMutation(queryParams, {
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
      setIsAddOpen(false);
    },
  });

  const updateMutation = useUpdateLanguageMutation(queryParams, {
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
      setIsEditOpen(false);
      setEditingId(null);
    },
  });

  const deleteMutation = useDeleteLanguageMutation(queryParams, {
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

  const handleCreateLanguage = async (
    values: CreateLanguageBodyType,
    options?: { file?: File | null }
  ) => {
    const trimmedCode = values.code.trim();
    const trimmedName = values.name.trim();
    let iconUrl = values.iconUrl?.trim() || undefined;

    if (options?.file) {
      const uploadResponse = await uploadMediaMutation.mutateAsync({
        file: options.file,
        addUniqueName: true,
      });
      iconUrl = uploadResponse.payload?.data ?? iconUrl;
    }

    const payload: CreateLanguageBodyType = {
      code: trimmedCode,
      name: trimmedName,
      ...(iconUrl ? { iconUrl } : {}),
    };

    await createMutation.mutateAsync(payload);
  };

  const handleUpdateLanguage = async (
    id: string,
    values: CreateLanguageBodyType,
    options?: { file?: File | null }
  ) => {
    const trimmedCode = values.code.trim();
    const trimmedName = values.name.trim();
    let iconUrl = values.iconUrl?.trim() || undefined;

    if (options?.file) {
      const uploadResponse = await uploadMediaMutation.mutateAsync({
        file: options.file,
        addUniqueName: true,
      });
      iconUrl = uploadResponse.payload?.data ?? iconUrl;
    }

    const payload: UpdateLanguageBodyType = {
      code: trimmedCode,
      name: trimmedName,
      ...(iconUrl ? { iconUrl } : {}),
    };

    await updateMutation.mutateAsync({ id, body: payload });
  };

  const handleDeleteLanguage = async (language: LanguageListItemType) => {
    setItemToDelete(language);
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

  const isListLoading = languagesQuery.isLoading;
  const isListFetching = languagesQuery.isFetching && !languagesQuery.isLoading;

  const refreshList = () => {
    languagesQuery.refetch();
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

  const editLanguage =
    languageQuery.data?.payload?.data ?? editingLanguageFromList;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {safeTranslate("title", "Languages")}
        </h1>
        <p className="text-muted-foreground">
          {safeTranslate(
            "description",
            "Manage the languages available across the PolyGo platform."
          )}
        </p>
      </div>

      <LanguageTable
        safeTranslate={safeTranslate}
        items={items}
        isLoading={isListLoading}
        isFetching={isListFetching}
        isError={languagesQuery.isError}
        error={languagesQuery.error}
        onRefresh={refreshList}
        onOpenCreate={handleOpenCreate}
        onOpenEdit={handleOpenEdit}
        onDelete={handleDeleteLanguage}
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

      <AddLanguage
        open={isAddOpen}
        onOpenChange={handleAddOpenChange}
        safeTranslate={safeTranslate}
        onSubmit={handleCreateLanguage}
        isSubmitting={createMutation.isPending}
        tError={tError}
        isUploading={uploadMediaMutation.isPending}
      />

      <EditLanguage
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
        safeTranslate={safeTranslate}
        onSubmit={handleUpdateLanguage}
        languageId={editingId}
        language={editLanguage}
        isLoading={languageQuery.isLoading}
        isSubmitting={updateMutation.isPending}
        tError={tError}
        isUploading={uploadMediaMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {safeTranslate("deleteDialog.title", "Delete language")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {safeTranslate(
                "deleteDialog.description",
                `Are you sure you want to delete ${itemToDelete?.name ?? "this language"}? This action cannot be undone.`,
                {
                  name: itemToDelete?.name
                    ? `${itemToDelete.name} (${itemToDelete.code?.toUpperCase()})`
                    : safeTranslate("fallbackName", "this language"),
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
