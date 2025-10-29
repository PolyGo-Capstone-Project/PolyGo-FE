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
  useCreateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useSubscriptionQuery,
  useSubscriptionsQuery,
  useUpdateSubscriptionMutation,
} from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  CreateSubscriptionBodyType,
  PaginationLangQueryType,
  SubscriptionListItemType,
  UpdateSubscriptionBodyType,
} from "@/models";

import { AddSubscription } from "./add-subscription";
import { EditSubscription } from "./edit-subscription";
import { SubscriptionDetailDialog } from "./subscription-detail-dialog";
import { SubscriptionTable } from "./subscription-table";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

export default function ManageSubscriptions() {
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
        const namespacedKey = `admin.subscriptions.${key}`;
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
  const [itemToDelete, setItemToDelete] =
    useState<SubscriptionListItemType | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [itemToView, setItemToView] = useState<SubscriptionListItemType | null>(
    null
  );

  const queryParams = useMemo<PaginationLangQueryType>(
    () => ({ pageNumber, pageSize, lang }),
    [pageNumber, pageSize, lang]
  );

  const subscriptionsQuery = useSubscriptionsQuery({ params: queryParams });
  const subscriptionQuery = useSubscriptionQuery({
    id: editingId ?? undefined,
    lang,
    enabled: isEditOpen && Boolean(editingId),
  });

  const subscriptionsPayload = subscriptionsQuery.data?.payload;
  const pagination = subscriptionsPayload?.data;
  const rawItems = pagination?.items;
  const items = useMemo<SubscriptionListItemType[]>(
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

  const editingSubscriptionFromList = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [items, editingId]
  );

  const createMutation = useCreateSubscriptionMutation(queryParams, {
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
      setIsAddOpen(false);
    },
  });

  const updateMutation = useUpdateSubscriptionMutation(queryParams, {
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
      setIsEditOpen(false);
      setEditingId(null);
    },
  });

  const deleteMutation = useDeleteSubscriptionMutation(queryParams, {
    onSuccess: (response) => {
      showSuccessToast(response.payload?.message, tSuccess);
    },
  });

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

  const handleViewDetails = (subscription: SubscriptionListItemType) => {
    setItemToView(subscription);
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

  const handleCreateSubscription = async (
    values: CreateSubscriptionBodyType
  ) => {
    const payload: CreateSubscriptionBodyType = {
      planType: values.planType,
      price: values.price,
      durationInDays: values.durationInDays,
      isActive: values.isActive,
      translations: values.translations.map((t) => ({
        lang: t.lang.trim(),
        name: t.name.trim(),
        description: t.description?.trim(),
      })),
      features: values.features.map((f) => ({
        featureType: f.featureType,
        limitValue: f.limitValue,
        limitType: f.limitType,
        isEnable: f.isEnable,
      })),
    };

    await createMutation.mutateAsync(payload);
  };

  const handleUpdateSubscription = async (
    id: string,
    values: UpdateSubscriptionBodyType
  ) => {
    const payload: UpdateSubscriptionBodyType = {
      planType: values.planType,
      price: values.price,
      durationInDays: values.durationInDays,
      isActive: values.isActive,
      translations: values.translations.map((t) => ({
        lang: t.lang.trim(),
        name: t.name.trim(),
        description: t.description?.trim(),
      })),
      features: values.features.map((f) => ({
        featureType: f.featureType,
        limitValue: f.limitValue,
        limitType: f.limitType,
        isEnable: f.isEnable,
      })),
    };

    await updateMutation.mutateAsync({ id, body: payload });
  };

  const handleDeleteSubscription = async (
    subscription: SubscriptionListItemType
  ) => {
    setItemToDelete(subscription);
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

  const isListLoading = subscriptionsQuery.isLoading;
  const isListFetching =
    subscriptionsQuery.isFetching && !subscriptionsQuery.isLoading;

  const refreshList = () => {
    subscriptionsQuery.refetch();
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

  const editSubscription =
    subscriptionQuery.data?.payload?.data ?? editingSubscriptionFromList;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {safeTranslate("title", "Subscriptions")}
        </h1>
        <p className="text-muted-foreground">
          {safeTranslate(
            "description",
            "Manage subscription plans available on the PolyGo platform."
          )}
        </p>
      </div>

      <SubscriptionTable
        safeTranslate={safeTranslate}
        items={items}
        isLoading={isListLoading}
        isFetching={isListFetching}
        isError={subscriptionsQuery.isError}
        error={subscriptionsQuery.error}
        onRefresh={refreshList}
        onOpenCreate={handleOpenCreate}
        onOpenEdit={handleOpenEdit}
        onDelete={handleDeleteSubscription}
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

      <AddSubscription
        open={isAddOpen}
        onOpenChange={handleAddOpenChange}
        safeTranslate={safeTranslate}
        onSubmit={handleCreateSubscription}
        isSubmitting={createMutation.isPending}
        tError={tError}
      />

      <EditSubscription
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
        safeTranslate={safeTranslate}
        onSubmit={handleUpdateSubscription}
        subscriptionId={editingId}
        subscription={editSubscription}
        isLoading={subscriptionQuery.isLoading}
        isSubmitting={updateMutation.isPending}
        tError={tError}
      />

      <SubscriptionDetailDialog
        open={detailDialogOpen}
        onOpenChange={handleDetailDialogChange}
        subscription={itemToView}
        safeTranslate={safeTranslate}
        lang={lang}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {safeTranslate("deleteDialog.title", "Delete subscription")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {safeTranslate(
                "deleteDialog.description",
                `Are you sure you want to delete ${itemToDelete?.name ?? "this subscription"}? This action cannot be undone.`,
                {
                  name: itemToDelete?.name
                    ? `${itemToDelete.name} (${itemToDelete.planType})`
                    : safeTranslate("fallbackName", "this subscription"),
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
