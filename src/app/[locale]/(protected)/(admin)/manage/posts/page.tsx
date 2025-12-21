"use client";

import { Pagination } from "@/components/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from "@/components/ui";
import { IconRefresh, IconSearch } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { DeletePostDialog } from "@/components/modules/admin/posts/delete-post-dialog";
import { PostDetailSheet } from "@/components/modules/admin/posts/post-detail-sheet";
import { PostsTable } from "@/components/modules/admin/posts/posts-table";
import { useAdminPosts } from "@/hooks/query/use-post";

export default function ManagePosts() {
  const t = useTranslations("admin.posts");
  const locale = useLocale();

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const h = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(h);
  }, [searchTerm]);

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

  const [detailPost, setDetailPost] = useState<any | null>(null);
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

          {listQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <PostsTable
              items={items}
              page={page}
              pageSize={pageSize}
              locale={locale}
              onViewDetail={setDetailPost}
              onDelete={setDeletePost}
              emptyText={t("empty")}
            />
          )}

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
        </CardContent>
      </Card>

      {detailPost && (
        <PostDetailSheet
          post={detailPost}
          open={!!detailPost}
          onOpenChange={() => setDetailPost(null)}
        />
      )}

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
