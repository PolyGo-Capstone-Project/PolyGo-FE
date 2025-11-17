"use client";

import envConfig from "@/config";
import { getSessionTokenFromLocalStorage } from "@/lib/utils";
import { UserStatusChangedType } from "@/models";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";

// ==================== TYPES ====================
export interface IncomingCallData {
  callerId: string;
  isVideoCall: boolean;
  callerName?: string;
  callerAvatar?: string;
}

export interface CallAcceptedData {
  userId: string;
}

export interface CallDeclinedData {
  userId: string;
}

export interface CallFailedData {
  reason: string;
}

export interface MediaStateUpdate {
  userId: string;
  micOn: boolean;
  camOn: boolean;
}

interface useUserCommunicationHubOptions {
  onUserStatusChanged?: (data: UserStatusChangedType) => void;
  // Call events
  onIncomingCall?: (data: IncomingCallData) => void;
  onCallAccepted?: (data: CallAcceptedData) => void;
  onCallDeclined?: (data: CallDeclinedData) => void;
  onCallFailed?: (data: CallFailedData) => void;
  onCallEnded?: () => void;
  onMediaStateUpdate?: (data: MediaStateUpdate) => void;
  // WebRTC signaling events
  onReceiveOffer?: (sdp: string) => void;
  onReceiveAnswer?: (sdp: string) => void;
  onReceiveIceCandidate?: (candidate: string) => void;
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
export const useUserCommunicationHub = (
  options?: useUserCommunicationHubOptions
) => {
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

        // Stop immediately - server will handle disconnect via OnDisconnectedAsync
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

  // ==================== CALL EVENT LISTENERS ====================
  useEffect(() => {
    if (!connection) return;

    // Incoming call
    const handleIncomingCall = (
      callerId: string,
      isVideoCall: boolean,
      callerName?: string,
      callerAvatar?: string
    ) => {
      console.log(
        `📞 [Call] Incoming ${isVideoCall ? "video" : "voice"} call from:`,
        callerId,
        "Name:",
        callerName
      );
      options?.onIncomingCall?.({
        callerId,
        isVideoCall,
        callerName,
        callerAvatar,
      });
    };

    // Call accepted
    const handleCallAccepted = (userId: string) => {
      console.log("✅ [Call] Call accepted by:", userId);
      options?.onCallAccepted?.({ userId });
    };

    // Call declined
    const handleCallDeclined = (userId: string) => {
      console.log("❌ [Call] Call declined by:", userId);
      options?.onCallDeclined?.({ userId });
    };

    // Call failed
    const handleCallFailed = (reason: string) => {
      console.log("⚠️ [Call] Call failed:", reason);
      options?.onCallFailed?.({ reason });
    };

    // Call ended
    const handleCallEnded = () => {
      console.log("📴 [Call] Call ended");
      options?.onCallEnded?.();
    };

    // Media state update
    const handleUpdateMediaState = (
      userId: string,
      micOn: boolean,
      camOn: boolean
    ) => {
      console.log(
        `🎤📹 [Call] Media state update from ${userId}: mic=${micOn}, cam=${camOn}`
      );
      options?.onMediaStateUpdate?.({ userId, micOn, camOn });
    };

    // Register all call event listeners
    connection.on("IncomingCall", handleIncomingCall);
    connection.on("CallAccepted", handleCallAccepted);
    connection.on("CallDeclined", handleCallDeclined);
    connection.on("CallFailed", handleCallFailed);
    connection.on("CallEnded", handleCallEnded);
    connection.on("UpdateMediaState", handleUpdateMediaState);

    return () => {
      connection.off("IncomingCall", handleIncomingCall);
      connection.off("CallAccepted", handleCallAccepted);
      connection.off("CallDeclined", handleCallDeclined);
      connection.off("CallFailed", handleCallFailed);
      connection.off("CallEnded", handleCallEnded);
      connection.off("UpdateMediaState", handleUpdateMediaState);
    };
  }, [connection, options]);

  // ==================== WEBRTC SIGNALING LISTENERS ====================
  useEffect(() => {
    if (!connection) return;

    const handleReceiveOffer = (sdp: string) => {
      console.log("📨 [WebRTC] Received offer");
      options?.onReceiveOffer?.(sdp);
    };

    const handleReceiveAnswer = (sdp: string) => {
      console.log("📨 [WebRTC] Received answer");
      options?.onReceiveAnswer?.(sdp);
    };

    const handleReceiveIceCandidate = (candidate: string) => {
      console.log("📨 [WebRTC] Received ICE candidate");
      options?.onReceiveIceCandidate?.(candidate);
    };

    connection.on("ReceiveOffer", handleReceiveOffer);
    connection.on("ReceiveAnswer", handleReceiveAnswer);
    connection.on("ReceiveIceCandidate", handleReceiveIceCandidate);

    return () => {
      connection.off("ReceiveOffer", handleReceiveOffer);
      connection.off("ReceiveAnswer", handleReceiveAnswer);
      connection.off("ReceiveIceCandidate", handleReceiveIceCandidate);
    };
  }, [connection, options]);

  // Update user online status
  const updateOnlineStatus = async (userId: string) => {
    if (!connection || connection.state !== "Connected") {
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
    if (!connection || connection.state !== "Connected") {
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

  // ==================== CALL METHODS ====================

  /**
   * Start a voice/video call with another user
   * @param receiverId - ID of the user to call
   * @param isVideoCall - true for video call, false for voice call
   */
  const startCall = async (receiverId: string, isVideoCall: boolean) => {
    console.log(
      `[StartCall] Debug - connection:`,
      !!connection,
      `state:`,
      connection?.state
    );

    if (!connection || connection.state !== "Connected") {
      throw new Error("Not connected to CommunicationHub");
    }

    if (!currentUserIdRef.current) {
      throw new Error("Current user ID not found");
    }

    try {
      // Backend gets callerId from JWT token, only send receiverId and isVideoCall
      await connection.invoke("StartCall", receiverId, isVideoCall);
      console.log(
        `✅ [Call] Started ${isVideoCall ? "video" : "voice"} call to:`,
        receiverId
      );
    } catch (err: any) {
      console.error("❌ [Call] Error starting call:", err);
      throw err;
    }
  };

  /**
   * Respond to an incoming call
   * @param callerId - ID of the caller
   * @param accepted - true to accept, false to decline
   */
  const respondCall = async (callerId: string, accepted: boolean) => {
    if (!connection || connection.state !== "Connected") {
      throw new Error("Not connected to CommunicationHub");
    }

    if (!currentUserIdRef.current) {
      throw new Error("Current user ID not found");
    }

    try {
      // Backend gets receiverId from JWT token, only send callerId and accepted
      await connection.invoke("RespondCall", callerId, accepted);
      console.log(
        `✅ [Call] ${accepted ? "Accepted" : "Declined"} call from:`,
        callerId
      );
    } catch (err: any) {
      console.error("❌ [Call] Error responding to call:", err);
      throw err;
    }
  };

  /**
   * Toggle microphone and/or camera during a call
   * @param micOn - Microphone state
   * @param camOn - Camera state
   */
  const toggleMedia = async (micOn: boolean, camOn: boolean) => {
    if (!connection || connection.state !== "Connected") {
      throw new Error("Not connected to CommunicationHub");
    }

    if (!currentUserIdRef.current) {
      throw new Error("Current user ID not found");
    }

    try {
      // Backend gets userId from JWT token, only send micOn and camOn
      await connection.invoke("ToggleMedia", micOn, camOn);
      console.log(`✅ [Call] Toggled media: mic=${micOn}, cam=${camOn}`);
    } catch (err: any) {
      console.error("❌ [Call] Error toggling media:", err);
      throw err;
    }
  };

  /**
   * End the current call
   */
  const endCall = async () => {
    if (!connection || connection.state !== "Connected") {
      throw new Error("Not connected to CommunicationHub");
    }

    try {
      await connection.invoke("EndCall");
      console.log("✅ [Call] Ended call");
    } catch (err: any) {
      console.error("❌ [Call] Error ending call:", err);
      throw err;
    }
  };

  // ==================== WEBRTC SIGNALING METHODS ====================

  /**
   * Send WebRTC offer to peer
   * @param receiverId - ID of the peer
   * @param sdp - Session Description Protocol string
   */
  const sendOffer = async (receiverId: string, sdp: string) => {
    if (!connection || connection.state !== "Connected") {
      throw new Error("Not connected to CommunicationHub");
    }

    try {
      await connection.invoke("SendOffer", receiverId, sdp);
      console.log("✅ [WebRTC] Sent offer to:", receiverId);
    } catch (err: any) {
      console.error("❌ [WebRTC] Error sending offer:", err);
      throw err;
    }
  };

  /**
   * Send WebRTC answer to peer
   * @param receiverId - ID of the peer
   * @param sdp - Session Description Protocol string
   */
  const sendAnswer = async (receiverId: string, sdp: string) => {
    if (!connection || connection.state !== "Connected") {
      throw new Error("Not connected to CommunicationHub");
    }

    try {
      await connection.invoke("SendAnswer", receiverId, sdp);
      console.log("✅ [WebRTC] Sent answer to:", receiverId);
    } catch (err: any) {
      console.error("❌ [WebRTC] Error sending answer:", err);
      throw err;
    }
  };

  /**
   * Send ICE candidate to peer
   * @param receiverId - ID of the peer
   * @param candidate - ICE candidate JSON string
   */
  const sendIceCandidate = async (receiverId: string, candidate: string) => {
    if (!connection || connection.state !== "Connected") {
      throw new Error("Not connected to CommunicationHub");
    }

    try {
      await connection.invoke("SendIceCandidate", receiverId, candidate);
      console.log("✅ [WebRTC] Sent ICE candidate to:", receiverId);
    } catch (err: any) {
      console.error("❌ [WebRTC] Error sending ICE candidate:", err);
      throw err;
    }
  };

  // Debug: Log connection state before returning
  console.log(
    "[useCommunicationHub] Returning - connection:",
    !!connection,
    "state:",
    connection?.state
  );

  return {
    // Connection state
    connection,
    isConnected,
    error,
    currentUserId: currentUserIdRef.current,

    // Online presence methods
    updateOnlineStatus,
    getOnlineStatus,

    // Call methods
    startCall,
    respondCall,
    toggleMedia,
    endCall,

    // WebRTC signaling methods
    sendOffer,
    sendAnswer,
    sendIceCandidate,
  };
};
