"use client";

import envConfig from "@/config";
import { getSessionTokenFromLocalStorage } from "@/lib/utils";
import { UserStatusChangedType } from "@/models/presence.model";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";

interface UseUserPresenceOptions {
  onUserStatusChanged?: (data: UserStatusChangedType) => void;
}

/**
 * Hook to manage user presence via SignalR UserPresenceHub
 *
 * Features:
 * - Auto connect/disconnect based on authentication
 * - Notify server when user is online
 * - Listen for friends' online/offline status changes
 * - Get batch online status for multiple users
 *
 * @param options - Configuration options
 * @returns Connection state and utility methods
 */
export const useUserPresence = (options?: UseUserPresenceOptions) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // Initialize connection
  useEffect(() => {
    console.log("🚀 [UserPresenceHub] Initializing connection...");
    const token = getSessionTokenFromLocalStorage();

    if (!token) {
      console.error("❌ [UserPresenceHub] No authentication token found");
      setError("No authentication token found");
      return;
    }

    // Extract userId from token (you might need to adjust based on your token structure)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserIdRef.current =
        payload.userId || payload.sub || payload.Id || null;
      console.log("🔑 [UserPresenceHub] Token payload:", payload);
      console.log(
        "👤 [UserPresenceHub] Current user ID:",
        currentUserIdRef.current
      );
    } catch (err) {
      console.error("❌ [UserPresenceHub] Failed to parse token:", err);
    }

    const hubConnection = new HubConnectionBuilder()
      .withUrl(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/userPresenceHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    console.log(
      "🔗 [UserPresenceHub] Hub URL:",
      `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/userPresenceHub`
    );

    connectionRef.current = hubConnection;
    setConnection(hubConnection);

    // Start connection
    hubConnection
      .start()
      .then(() => {
        console.log("✅ [UserPresenceHub] Connected successfully");
        setIsConnected(true);
        setError(null);

        // Update online status after connection
        if (currentUserIdRef.current) {
          console.log(
            "📡 [UserPresenceHub] Updating online status for:",
            currentUserIdRef.current
          );
          hubConnection
            .invoke("UpdateUserOnlineStatus", currentUserIdRef.current)
            .then(() => {
              console.log(
                "✅ [UserPresenceHub] Online status updated successfully"
              );
            })
            .catch((err) => {
              console.error(
                "❌ [UserPresenceHub] Error updating online status:",
                err
              );
            });
        } else {
          console.warn(
            "⚠️ [UserPresenceHub] No current user ID found, skipping status update"
          );
        }
      })
      .catch((err) => {
        console.error("❌ [UserPresenceHub] Error connecting:", err);
        if (!err.message?.includes("negotiation")) {
          setError(err.message);
        }
      });

    // Handle reconnection
    hubConnection.onreconnecting((error) => {
      console.log("🔄 Reconnecting to UserPresenceHub...", error);
      setIsConnected(false);
    });

    hubConnection.onreconnected((connectionId) => {
      console.log("✅ Reconnected to UserPresenceHub:", connectionId);
      setIsConnected(true);
      setError(null);

      // Update online status after reconnection
      if (currentUserIdRef.current) {
        hubConnection
          .invoke("UpdateUserOnlineStatus", currentUserIdRef.current)
          .catch((err) => {
            console.error("❌ Error updating online status:", err);
          });
      }
    });

    hubConnection.onclose((error) => {
      console.log("🔴 UserPresenceHub connection closed:", error);
      setIsConnected(false);
      if (error && !error.message?.includes("negotiation")) {
        setError(error.message);
      }
    });

    // Cleanup
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch((err) => {
          console.error("Error stopping UserPresenceHub connection:", err);
        });
      }
    };
  }, []);

  // Listen for user status changes
  useEffect(() => {
    if (!connection) return;

    const handleUserStatusChanged = (data: UserStatusChangedType) => {
      console.log("👤 User status changed:", data);
      options?.onUserStatusChanged?.(data);
    };

    connection.on("UserStatusChanged", handleUserStatusChanged);

    return () => {
      connection.off("UserStatusChanged", handleUserStatusChanged);
    };
  }, [connection, options]);

  // Update user online status
  const updateOnlineStatus = async (userId: string) => {
    if (!connection || !isConnected) {
      throw new Error("Not connected to UserPresenceHub");
    }

    try {
      await connection.invoke("UpdateUserOnlineStatus", userId);
      console.log("✅ Online status updated for user:", userId);
    } catch (err: any) {
      console.error("❌ Error updating online status:", err);
      throw err;
    }
  };

  // Get online status for multiple users
  const getOnlineStatus = async (
    userIds: string[]
  ): Promise<Record<string, boolean>> => {
    if (!connection || !isConnected) {
      throw new Error("Not connected to UserPresenceHub");
    }

    try {
      const result = await connection.invoke<Record<string, boolean>>(
        "GetOnlineStatus",
        userIds
      );
      console.log("✅ Retrieved online status:", result);
      return result;
    } catch (err: any) {
      console.error("❌ Error getting online status:", err);
      throw err;
    }
  };

  return {
    connection,
    isConnected,
    error,
    updateOnlineStatus,
    getOnlineStatus,
    currentUserId: currentUserIdRef.current,
  };
};
