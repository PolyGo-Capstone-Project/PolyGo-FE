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
 * Hook to manage user presence via SignalR CommunicationHub
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
    console.log("🚀 [CommunicationHub] Initializing connection...");
    const token = getSessionTokenFromLocalStorage();

    if (!token) {
      console.error("❌ [CommunicationHub] No authentication token found");
      setError("No authentication token found");
      return;
    }

    // Extract userId from token (you might need to adjust based on your token structure)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserIdRef.current =
        payload.userId || payload.sub || payload.Id || null;
      console.log("🔑 [CommunicationHub] Token payload:", payload);
      console.log(
        "👤 [CommunicationHub] Current user ID:",
        currentUserIdRef.current
      );
    } catch (err) {
      console.error("❌ [CommunicationHub] Failed to parse token:", err);
    }

    const hubConnection = new HubConnectionBuilder()
      .withUrl(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/communicationHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    console.log(
      "🔗 [CommunicationHub] Hub URL:",
      `${envConfig.NEXT_PUBLIC_API_ENDPOINT}/communicationHub`
    );

    connectionRef.current = hubConnection;
    setConnection(hubConnection);

    // Start connection
    hubConnection
      .start()
      .then(() => {
        console.log("✅ [CommunicationHub] Connected successfully");
        setIsConnected(true);
        setError(null);

        // Update online status after connection
        if (currentUserIdRef.current) {
          console.log(
            "📡 [CommunicationHub] Updating online status for:",
            currentUserIdRef.current
          );
          hubConnection
            .invoke("UpdateUserOnlineStatus", currentUserIdRef.current)
            .then(() => {
              console.log(
                "✅ [CommunicationHub] Online status updated successfully"
              );
            })
            .catch((err) => {
              console.error(
                "❌ [CommunicationHub] Error updating online status:",
                err
              );
            });
        } else {
          console.warn(
            "⚠️ [CommunicationHub] No current user ID found, skipping status update"
          );
        }
      })
      .catch((err) => {
        console.error("❌ [CommunicationHub] Error connecting:", err);
        if (!err.message?.includes("negotiation")) {
          setError(err.message);
        }
      });

    // Handle reconnection
    hubConnection.onreconnecting((error) => {
      console.log("🔄 Reconnecting to CommunicationHub...", error);
      setIsConnected(false);
    });

    hubConnection.onreconnected((connectionId) => {
      console.log("✅ Reconnected to CommunicationHub:", connectionId);
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
      console.log("🔴 CommunicationHub connection closed:", error);
      setIsConnected(false);
      if (error && !error.message?.includes("negotiation")) {
        setError(error.message);
      }
    });

    // Handle beforeunload - graceful disconnect when user closes tab/browser
    const handleBeforeUnload = () => {
      console.log(
        "🚪 [CommunicationHub] Browser/tab closing, disconnecting..."
      );
      if (connectionRef.current) {
        // Use synchronous stop for beforeunload
        try {
          connectionRef.current.stop();
          console.log(
            "✅ [CommunicationHub] Connection stopped on beforeunload"
          );
        } catch (err) {
          console.error(
            "❌ [CommunicationHub] Error stopping on beforeunload:",
            err
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      console.log("🔌 [CommunicationHub] Cleaning up connection...");

      // Remove beforeunload listener
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Stop connection gracefully
      if (connectionRef.current) {
        const currentState = connectionRef.current.state;
        console.log(
          "📊 [CommunicationHub] Current connection state:",
          currentState
        );

        connectionRef.current
          .stop()
          .then(() => {
            console.log(
              "✅ [CommunicationHub] Connection stopped successfully"
            );
          })
          .catch((err) => {
            console.error(
              "❌ [CommunicationHub] Error stopping connection:",
              err
            );
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
      throw new Error("Not connected to CommunicationHub");
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
      throw new Error("Not connected to CommunicationHub");
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
