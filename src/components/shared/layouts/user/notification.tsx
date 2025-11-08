"use client";

import { Bell } from "lucide-react";
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
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { unreadChatCount } = useChatNotification();

  const [notifications, setNotifications] = React.useState([
    {
      id: 1,
      title: "New message from Alex",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Your event starts in 1 hour",
      time: "1h ago",
      unread: false,
    },
    {
      id: 3,
      title: "New partner matched 🎉",
      time: "3h ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Total unread = chat messages + other notifications
  const totalUnread = unreadChatCount + unreadCount;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent/60"
        >
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-500 text-white"
              variant="default"
            >
              {totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto mt-2"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {totalUnread > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalUnread} new
              {unreadChatCount > 0 && ` (${unreadChatCount} chat)`}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 && unreadChatCount === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No new notifications 🎉
          </div>
        ) : (
          <>
            {unreadChatCount > 0 && (
              <DropdownMenuItem
                className="flex flex-col items-start px-4 py-2 gap-1 cursor-pointer bg-accent/30 hover:bg-accent/50"
                onClick={() => {
                  // Navigate to chat page
                  window.location.href = "/chat";
                }}
              >
                <span className="text-sm font-medium">
                  {unreadChatCount} unread message
                  {unreadChatCount > 1 ? "s" : ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  Click to view
                </span>
              </DropdownMenuItem>
            )}
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  "flex flex-col items-start px-4 py-2 gap-1 cursor-pointer",
                  n.unread && "bg-accent/30 hover:bg-accent/50"
                )}
              >
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
