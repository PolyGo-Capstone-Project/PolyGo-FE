"use client";

import { Bell } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useChatNotification } from "@/contexts/chat-notification-context";
import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/hooks";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  type?: "Post" | "Friend" | "Event" | "Gift" | string;
  objectId?: string;
};

export function NotificationBell() {
  const { unreadChatCount } = useChatNotification();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("userNotification");

  // Chỉ lấy 5 noti mới nhất
  const queryParams = React.useMemo(
    () => ({
      lang: locale,
      pageNumber: 1,
      pageSize: 5,
    }),
    [locale]
  );

  const notificationsQuery = useNotificationsQuery({ params: queryParams });
  const markAsReadMutation = useMarkNotificationReadMutation(queryParams);

  // data từ http.get: { status, payload }
  const notificationsPayload = notificationsQuery.data?.payload as any;
  const pagination = notificationsPayload?.data;
  const rawItems = (pagination?.items ?? []) as NotificationItem[];
  const notifications = rawItems.slice(0, 5); // đảm bảo không vượt quá 5

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  // Số hiển thị trên icon chuông = chỉ số notification chưa đọc
  const unreadBellCount = unreadNotificationCount;

  // Total unread dùng cho label mô tả (chat + notifications)
  const totalUnread = unreadNotificationCount + unreadChatCount;

  const formatTime = React.useCallback(
    (iso: string) => {
      if (!iso) return "";
      const date = new Date(iso);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);

      if (diffMin < 1) return t("time.justNow");
      if (diffMin < 60) {
        return t("time.minutesAgo", { value: diffMin });
      }
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) {
        return t("time.hoursAgo", { value: diffHr });
      }
      const diffDay = Math.floor(diffHr / 24);
      return t("time.daysAgo", { value: diffDay });
    },
    [t]
  );

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
    if (!n.isRead) {
      // call API mark as read
      markAsReadMutation.mutate(n.id);
    }

    // Điều hướng giống trang notification
    navigateByNotification(n);
  };

  const isEmpty = notifications.length === 0 && unreadChatCount === 0;

  const renderSummaryLabel = () => {
    if (totalUnread <= 0) return null;

    if (unreadChatCount > 0) {
      return t("summaryWithChat", {
        count: totalUnread,
        chatCount: unreadChatCount,
      });
    }

    return t("summary", { count: totalUnread });
  };

  const chatUnreadLabel =
    unreadChatCount === 1
      ? t("chatUnreadSingle", { count: unreadChatCount })
      : t("chatUnreadMultiple", { count: unreadChatCount });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent/60"
        >
          <Bell className="h-5 w-5" />
          {unreadBellCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground"
              variant="default"
            >
              {unreadBellCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-100 overflow-y-auto mt-2"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>{t("title")}</span>
          {totalUnread > 0 && (
            <span className="text-xs text-muted-foreground">
              {renderSummaryLabel()}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isEmpty ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            {t("noNew")}
          </div>
        ) : (
          <>
            {/* Block noti chat */}
            {unreadChatCount > 0 && (
              <DropdownMenuItem
                className="flex flex-col items-start px-4 py-2 gap-1 cursor-pointer bg-accent/30 hover:bg-accent/50"
                onClick={() => {
                  router.push(`/${locale}/chat`);
                }}
              >
                <span className="text-sm font-medium">{chatUnreadLabel}</span>
                <span className="text-xs text-muted-foreground">
                  {t("clickToView")}
                </span>
              </DropdownMenuItem>
            )}

            {/* Notifications từ API */}
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "flex flex-col items-start px-4 py-2 gap-1 cursor-pointer",
                  !n.isRead && "bg-primary/10 hover:bg-primary/20"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    !n.isRead && "text-primary"
                  )}
                >
                  {n.content}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(n.createdAt)}
                </span>
              </DropdownMenuItem>
            ))}

            {/* Nút xem thêm */}
            {pagination?.totalItems > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex justify-center items-center px-4 py-2 cursor-pointer text-sm text-primary"
                  onClick={() => router.push(`/${locale}/notification`)}
                >
                  {t("viewAll")}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
