"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button, Card, CardContent } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/hooks";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  lang: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  type: "Post" | "Friend" | "Event" | "Gift" | string;
  objectId: string;
  imageUrl?: string | null;
};

const PAGE_SIZE = 10;

export default function NotificationPage() {
  const locale = useLocale();
  const t = useTranslations("userNotification");
  const router = useRouter();

  // invalidate dropdown 5 noti mới nhất
  const dropdownParams = useMemo(
    () => ({
      lang: locale,
      pageNumber: 1,
      pageSize: 5,
    }),
    [locale]
  );

  const markAsReadMutation = useMarkNotificationReadMutation(dropdownParams);

  // pagination kiểu "load more"
  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(
    []
  );
  const [hasMore, setHasMore] = useState(true);
  const [isLoadMorePending, setIsLoadMorePending] = useState(false);

  // cache local noti đã đọc
  const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(
    () => new Set()
  );

  const {
    data: notificationsData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useNotificationsQuery({
    params: { lang: locale, pageNumber: page, pageSize: PAGE_SIZE },
    enabled: true,
  });

  // cập nhật allNotifications khi có data mới
  useEffect(() => {
    const payload = notificationsData?.payload as any;
    const meta = payload?.data;
    if (!meta) return;

    const newItems = (meta.items ?? []) as NotificationItem[];

    if (page === 1) {
      setAllNotifications(newItems);
    } else {
      setAllNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const uniqueNew = newItems.filter((n) => !existingIds.has(n.id));
        return [...prev, ...uniqueNew];
      });
    }

    // dùng hasNextPage từ API nếu có
    if (typeof meta.hasNextPage === "boolean") {
      setHasMore(meta.hasNextPage);
    } else if (
      typeof meta.currentPage === "number" &&
      typeof meta.totalPages === "number"
    ) {
      setHasMore(meta.currentPage < meta.totalPages);
    } else {
      setHasMore(false);
    }

    if (isLoadMorePending) {
      setIsLoadMorePending(false);
    }
  }, [notificationsData, page, isLoadMorePending]);

  const notifications = allNotifications;

  const isNotificationRead = (n: NotificationItem) =>
    n.isRead || locallyReadIds.has(n.id);

  const unreadCount = notifications.filter(
    (n) => !isNotificationRead(n)
  ).length;

  const formatTime = (iso: string) => {
    if (!iso) return "";
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return t("time.justNow");
    if (diffMin < 60) return t("time.minutesAgo", { value: diffMin });
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return t("time.hoursAgo", { value: diffHr });
    const diffDay = Math.floor(diffHr / 24);
    return t("time.daysAgo", { value: diffDay });
  };

  const navigateByNotification = (n: NotificationItem) => {
    const base = `/${locale}`;

    switch (n.type) {
      case "Post": {
        if (n.objectId) {
          router.push(`${base}/social/post/${n.objectId}`);
        }
        break;
      }
      case "Friend": {
        router.push(`${base}/matching`);
        break;
      }
      case "Event": {
        if (n.objectId) {
          router.push(`${base}/event/${n.objectId}`);
        }
        break;
      }
      case "Gift": {
        router.push(`${base}/gifts`);
        break;
      }
      default: {
        // không biết type thì tạm thời không điều hướng
        break;
      }
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    if (!isNotificationRead(n)) {
      setLocallyReadIds((prev) => {
        const next = new Set(prev);
        next.add(n.id);
        return next;
      });
      markAsReadMutation.mutate(n.id);
    }

    navigateByNotification(n);
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoading || isFetching || isLoadMorePending) return;
    setIsLoadMorePending(true);
    setPage((prev) => prev + 1);
  };

  const isEmpty = !isLoading && notifications.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-6 md:py-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("pageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            {t("pageDescription")}
          </p>
          {unreadCount > 0 && (
            <p className="text-xs font-medium text-primary md:text-sm">
              {t("summary", { count: unreadCount })}
            </p>
          )}
        </div>

        {/* Nội dung */}
        <Card className="border-border/70">
          {/* Nếu muốn title trong card thì mở lại 2 dòng dưới */}
          {/* <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold md:text-lg">
              {t("title")}
            </CardTitle>
          </CardHeader>
          <Separator /> */}
          <CardContent className="p-0">
            {/* Loading state ban đầu */}
            {isLoading && page === 1 && (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/3 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {isError && (
              <div className="p-4 text-sm text-destructive">
                {(error as any)?.message || t("error")}
              </div>
            )}

            {/* Empty state */}
            {isEmpty && !isLoading && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="text-lg font-semibold">{t("emptyTitle")}</span>
                <p className="max-w-xs text-sm text-muted-foreground">
                  {t("emptyDescription")}
                </p>
              </div>
            )}

            {/* List noti */}
            {!isLoading && !isEmpty && (
              <div className="divide-y">
                {notifications.map((n) => {
                  const read = isNotificationRead(n);
                  const initials = (n.content || "?").charAt(0).toUpperCase();

                  // Avatar: nếu imageUrl rỗng / null thì dùng logo mặc định
                  const avatarSrc =
                    n.imageUrl && n.imageUrl.trim() !== ""
                      ? n.imageUrl
                      : "/assets/logo/Primary2.png";

                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                        read
                          ? "bg-background hover:bg-muted/50"
                          : "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      {/* Avatar bên trái */}
                      <div className="mt-0.5 flex-shrink-0">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={avatarSrc} alt={n.content} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Nội dung + cột phải */}
                      <div className="flex flex-1 items-start gap-3 ml-3 pt-2">
                        {/* Content bên trái */}
                        <div className="flex-1 flex flex-col gap-1">
                          <p
                            className={cn(
                              "text-sm",
                              read
                                ? "text-foreground"
                                : "font-semibold text-primary"
                            )}
                          >
                            {n.content}
                          </p>
                        </div>

                        {/* Cột phải: thời gian + chấm đọc/chưa đọc */}
                        <div className="flex flex-col items-end gap-1 text-right">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(n.createdAt)}
                          </span>
                          {!read ? (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Circle className="h-3 w-3 fill-primary/60 text-primary" />
                              <span className="hidden sm:inline">
                                {t("unread")}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3" />
                              <span className="hidden sm:inline">
                                {t("read")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Skeleton khi load thêm trang sau */}
                {page > 1 && (isLoading || isLoadMorePending) && (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3"
                      >
                        <div className="h-10 w-10 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 rounded bg-muted" />
                          <div className="h-3 w-1/3 rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nút Load more */}
                {hasMore && (
                  <div className="flex justify-center py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={isLoading || isFetching || isLoadMorePending}
                    >
                      {isLoading || isFetching || isLoadMorePending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("loadingMore")}
                        </>
                      ) : (
                        t("loadMore")
                      )}
                    </Button>
                  </div>
                )}

                {/* Hết dữ liệu */}
                {!hasMore && notifications.length > 0 && (
                  <div className="flex justify-center py-4">
                    <p className="text-muted-foreground text-xs">
                      {t("noMore")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
