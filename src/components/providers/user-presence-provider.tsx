"use client";

import { useUserPresence } from "@/hooks";
import { UserStatusChangedType } from "@/models/presence.model";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface UserPresenceContextValue {
  isConnected: boolean;
  error: string | null;
  onlineUsers: Set<string>;
  updateOnlineStatus: (userId: string) => Promise<void>;
  getOnlineStatus: (userIds: string[]) => Promise<Record<string, boolean>>;
  isUserOnline: (userId: string) => boolean;
  onUserStatusChanged?: (data: UserStatusChangedType) => void;
  setOnUserStatusChangedCallback: (
    callback: (data: UserStatusChangedType) => void
  ) => void;
}

const UserPresenceContext = createContext<UserPresenceContextValue | null>(
  null
);

export const useUserPresenceContext = () => {
  const context = useContext(UserPresenceContext);
  if (!context) {
    throw new Error(
      "useUserPresenceContext must be used within UserPresenceProvider"
    );
  }
  return context;
};

interface UserPresenceProviderProps {
  children: ReactNode;
}

/**
 * Global provider for user presence management
 *
 * Usage:
 * 1. Wrap your app with <UserPresenceProvider>
 * 2. Use useUserPresenceContext() to access online users
 *
 * Benefits:
 * - Single WebSocket connection for entire app
 * - Centralized online status management
 * - Automatic updates across all components
 */
export function UserPresenceProvider({ children }: UserPresenceProviderProps) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const externalCallbackRef = useRef<
    ((data: UserStatusChangedType) => void) | null
  >(null);

  const handleUserStatusChanged = useCallback((data: UserStatusChangedType) => {
    setOnlineUsers((prev) => {
      const newSet = new Set(prev);
      if (data.isOnline) {
        newSet.add(data.userId);
      } else {
        newSet.delete(data.userId);
      }
      return newSet;
    });

    // Call external callback if set
    externalCallbackRef.current?.(data);
  }, []);

  const { isConnected, error, updateOnlineStatus, getOnlineStatus } =
    useUserPresence({
      onUserStatusChanged: handleUserStatusChanged,
    });

  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  const setOnUserStatusChangedCallback = useCallback(
    (callback: (data: UserStatusChangedType) => void) => {
      externalCallbackRef.current = callback;
    },
    []
  );

  const value: UserPresenceContextValue = {
    isConnected,
    error,
    onlineUsers,
    updateOnlineStatus,
    getOnlineStatus,
    isUserOnline,
    setOnUserStatusChangedCallback,
  };

  return (
    <UserPresenceContext.Provider value={value}>
      {children}
    </UserPresenceContext.Provider>
  );
}
