"use client";

import { Pagination } from "@/components/shared";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@/components/ui";
import {
  IconEye,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { useAdminDeletePost, useAdminPosts } from "@/hooks/query/use-post";

/* ======================= helpers ======================= */
const statusBadge = (isDeleted: boolean) =>
  isDeleted ? "destructive" : "default";

/* ======================= Page ======================= */
export default function ManagePosts() {
  const t = useTranslations("admin.posts");
  const locale = useLocale();

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // debounce
  useEffect(() => {
    const h = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(h);
  }, [searchTerm]);

  // query
  const query = useMemo(
    () => ({
      pageNumber: page,
      pageSize,
      ...(debouncedSearch ? { keyword: debouncedSearch } : {}),
    }),
    [page, pageSize, debouncedSearch]
  );

  const listQuery = useAdminPosts({ params: query });
  const items = listQuery.data?.payload?.data?.items ?? [];
  const totalPages = listQuery.data?.payload?.data?.totalPages ?? 1;
  const totalItems = listQuery.data?.payload?.data?.totalItems ?? 0;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // detail sheet
  const [detailPost, setDetailPost] = useState<any | null>(null);

  // delete dialog
  const [deletePost, setDeletePost] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("tableTitle")}</CardTitle>
              <CardDescription>{t("tableDescription")}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => listQuery.refetch()}
              disabled={listQuery.isLoading}
            >
              <IconRefresh
                className={`mr-2 size-4 ${
                  listQuery.isLoading ? "animate-spin" : ""
                }`}
              />
              {t("refresh")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          {listQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="min-w-[260px]">
                        {t("columns.content")}
                      </TableHead>
                      <TableHead className="min-w-[160px]">
                        {t("columns.creator")}
                      </TableHead>
                      <TableHead className="min-w-[120px]">
                        {t("columns.createdAt")}
                      </TableHead>
                      <TableHead className="min-w-[100px]">
                        {t("columns.status")}
                      </TableHead>
                      <TableHead className="min-w-[120px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((p: any, idx: number) => (
                      <TableRow key={p.id}>
                        <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="max-w-[320px] sm:max-w-[420px] lg:max-w-[720px]">
                          <div className="line-clamp-2 break-words text-ellipsis">
                            {p.content}
                          </div>
                        </TableCell>
                        <TableCell>{p.creator?.name ?? "-"}</TableCell>
                        <TableCell>
                          {new Date(p.createdAt).toLocaleDateString(locale)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge(p.isDeleted)}>
                            {p.isDeleted
                              ? t("status.deleted")
                              : t("status.active")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailPost(p)}
                            >
                              <IconEye className="size-4" />
                            </Button>
                            {!p.isDeleted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletePost(p)}
                              >
                                <IconTrash className="size-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  hasNextPage={page < totalPages}
                  hasPreviousPage={page > 1}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      {detailPost && (
        <PostDetailSheet
          post={detailPost}
          open={!!detailPost}
          onOpenChange={() => setDetailPost(null)}
        />
      )}

      {/* Delete Dialog */}
      {deletePost && (
        <DeletePostDialog
          post={deletePost}
          open={!!deletePost}
          onClose={() => setDeletePost(null)}
        />
      )}
    </div>
  );
}

/* ======================= Detail Sheet ======================= */
function PostDetailSheet({
  post,
  open,
  onOpenChange,
}: {
  post: any;
  open: boolean;
  onOpenChange: () => void;
}) {
  const t = useTranslations("admin.posts.detail");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <div className="font-semibold">{t("content")}</div>
            <p className="mt-1 whitespace-pre-wrap">{post.content}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">{t("creator")}</div>
              <div>{post.creator?.name}</div>
            </div>
            <div>
              <div className="font-medium">{t("createdAt")}</div>
              <div>{new Date(post.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium">{t("comments")}</div>
              <div>{post.commentsCount}</div>
            </div>
            <div>
              <div className="font-medium">{t("reactions")}</div>
              <div>{post.reactionsCount}</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ======================= Delete Dialog ======================= */
function DeletePostDialog({
  post,
  open,
  onClose,
}: {
  post: any;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin.posts.delete");
  const [reason, setReason] = useState("");
  const deleteMutation = useAdminDeletePost();

  const submit = () => {
    if (!reason.trim()) return;
    deleteMutation.mutate(
      { postId: post.id, body: { reason } },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>{t("reason")}</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("reasonPlaceholder")}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || deleteMutation.isPending}
            onClick={submit}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
