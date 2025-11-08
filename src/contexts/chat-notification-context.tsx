"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface ChatNotificationContextValue {
  unreadChatCount: number;
  setUnreadChatCount: (count: number | ((prev: number) => number)) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

const ChatNotificationContext = createContext<
  ChatNotificationContextValue | undefined
>(undefined);

export function ChatNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const incrementUnreadCount = useCallback(() => {
    setUnreadChatCount((prev) => prev + 1);
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadChatCount((prev) => Math.max(0, prev - 1));
  }, []);

  const resetUnreadCount = useCallback(() => {
    setUnreadChatCount(0);
  }, []);

  const value = useMemo(
    () => ({
      unreadChatCount,
      setUnreadChatCount,
      incrementUnreadCount,
      decrementUnreadCount,
      resetUnreadCount,
    }),
    [
      unreadChatCount,
      setUnreadChatCount,
      incrementUnreadCount,
      decrementUnreadCount,
      resetUnreadCount,
    ]
  );

  return (
    <ChatNotificationContext.Provider value={value}>
      {children}
    </ChatNotificationContext.Provider>
  );
}

export function useChatNotification() {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    throw new Error(
      "useChatNotification must be used within ChatNotificationProvider"
    );
  }
  return context;
}
