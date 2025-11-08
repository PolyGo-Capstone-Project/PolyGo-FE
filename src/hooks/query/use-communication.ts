"use client";

import envConfig from "@/config";
import communicationApiRequest from "@/lib/apis/communication";
import { playNotificationSoundFromFile } from "@/lib/notification-sound";
import { getSessionTokenFromLocalStorage } from "@/lib/utils";
import {
  ConversationReadUpdatedType,
  GetConversationsQueryType,
  GetMessagesQueryType,
  RealtimeMessageType,
} from "@/models";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

type GetMessagesResponse = Awaited<
  ReturnType<typeof communicationApiRequest.getMessages>
>;
type GetConversationsResponse = Awaited<
  ReturnType<typeof communicationApiRequest.getConversations>
>;
type GetConversationByIdResponse = Awaited<
  ReturnType<typeof communicationApiRequest.getConversationById>
>;
type GetConversationsByUserIdResponse = Awaited<
  ReturnType<typeof communicationApiRequest.getConversationsByUserId>
>;

// ============= QUERIES =============
export const useGetMessages = (
  conversationId: string,
  query: GetMessagesQueryType,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetMessagesResponse>({
    queryKey: ["messages", conversationId, query],
    queryFn: () => communicationApiRequest.getMessages(conversationId, query),
    enabled: options?.enabled ?? !!conversationId,
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useGetConversations = (
  query: GetConversationsQueryType,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetConversationsResponse>({
    queryKey: ["conversations", query],
    queryFn: () => communicationApiRequest.getConversations(query),
    enabled: options?.enabled,
    staleTime: 0,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });
};

export const useGetConversationById = (
  conversationId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetConversationByIdResponse>({
    queryKey: ["conversation", conversationId],
    queryFn: () => communicationApiRequest.getConversationById(conversationId),
    enabled: options?.enabled ?? !!conversationId,
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useGetConversationsByUserId = (
  userId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetConversationsByUserIdResponse>({
    queryKey: ["conversations", userId],
    queryFn: () => communicationApiRequest.getConversationsByUserId(userId),
    enabled: options?.enabled ?? !!userId,
    staleTime: 0,
    refetchOnMount: true,
  });
};

// ============= Mutations =============

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      communicationApiRequest.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// ============= SIGNALR HUB CONNECTION =============
export const useChatHub = (conversationId?: string, currentUserId?: string) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);

  // Initialize connection
  useEffect(() => {
    const token = getSessionTokenFromLocalStorage();

    if (!token) {
      setError("No authentication token found");
      return;
    }

    const hubConnection = new HubConnectionBuilder()
      .withUrl(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/chatHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = hubConnection;
    setConnection(hubConnection);

    // Start connection
    hubConnection
      .start()
      .then(() => {
        console.log("✅ Connected to ChatHub");
        setIsConnected(true);
        setError(null);
      })
      .catch((err) => {
        console.error("❌ Error connecting to ChatHub:", err);
        // Only set error for non-negotiation errors to avoid showing toast on initial load
        if (!err.message?.includes("negotiation")) {
          setError(err.message);
        }
      });

    // Handle reconnection
    hubConnection.onreconnecting((error) => {
      console.log("🔄 Reconnecting to ChatHub...", error);
      setIsConnected(false);
    });

    hubConnection.onreconnected((connectionId) => {
      console.log("✅ Reconnected to ChatHub:", connectionId);
      setIsConnected(true);
      setError(null);

      // Rejoin conversation if exists
      if (conversationId && connectionRef.current) {
        connectionRef.current
          .invoke("JoinConversation", conversationId)
          .catch((err) => {
            console.error("❌ Error rejoining conversation:", err);
          });
      }
    });

    hubConnection.onclose((error) => {
      console.log("🔴 Connection closed:", error);
      setIsConnected(false);
      // Only set error for actual errors, not normal disconnections
      if (error && !error.message?.includes("negotiation")) {
        setError(error.message);
      }
    });

    // Cleanup
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch((err) => {
          console.error("Error stopping connection:", err);
        });
      }
    };
  }, []); // Only run once

  // Join conversation when conversationId changes
  useEffect(() => {
    if (connection && isConnected && conversationId) {
      connection
        .invoke("JoinConversation", conversationId)
        .then(() => {
          console.log(`✅ Joined conversation: ${conversationId}`);
        })
        .catch((err) => {
          console.error("❌ Error joining conversation:", err);
          setError(err.message);
        });
    }
  }, [connection, isConnected, conversationId, setError]);

  // Listen for incoming messages
  useEffect(() => {
    if (!connection) return;

    const handleReceiveMessage = (message: RealtimeMessageType) => {
      console.log("📨 Received message:", message);

      // Play notification sound ONLY for incoming messages (not from current user)
      if (currentUserId && message.senderId !== currentUserId) {
        playNotificationSoundFromFile("/sounds/notification.mp3");
      }

      // Invalidate messages to refetch with full sender info from server
      queryClient.invalidateQueries({
        queryKey: ["messages", message.conversationId],
      });

      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const handleConversationReadUpdated = (
      data: ConversationReadUpdatedType
    ) => {
      console.log("👁️ Conversation read updated:", data);

      // Invalidate conversations to update read status
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    connection.on("ReceiveMessage", handleReceiveMessage);
    connection.on("ConversationReadUpdated", handleConversationReadUpdated);

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("ConversationReadUpdated", handleConversationReadUpdated);
    };
  }, [connection, queryClient, currentUserId]);

  // Send text message
  const sendTextMessage = async (
    conversationId: string,
    senderId: string,
    content: string
  ) => {
    if (!connection || !isConnected) {
      throw new Error("Not connected to chat hub");
    }

    if (!content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    try {
      await connection.invoke(
        "SendTextMessage",
        conversationId,
        senderId,
        content
      );
      console.log("✅ Message sent successfully");
    } catch (err: any) {
      console.error("❌ Error sending message:", err);
      throw err;
    }
  };

  const sendImageMessage = async (
    conversationId: string,
    senderId: string,
    imageUrls: string[]
  ) => {
    if (!connection || !isConnected) {
      throw new Error("Not connected to chat hub");
    }

    if (!imageUrls.length) {
      throw new Error("No images provided");
    }

    try {
      await connection.invoke(
        "SendImageMessage",
        conversationId,
        senderId,
        imageUrls
      );
      console.log("✅ Image message sent successfully");
    } catch (err: any) {
      console.error("❌ Error sending image message:", err);
      throw err;
    }
  };

  const markAsRead = async (conversationId: string, userId: string) => {
    if (!connection || !isConnected) {
      throw new Error("Not connected to chat hub");
    }

    try {
      await connection.invoke("MarkAsRead", conversationId, userId);
      console.log("✅ Marked conversation as read");
    } catch (err: any) {
      console.error("❌ Error marking as read:", err);
      throw err;
    }
  };

  return {
    connection,
    isConnected,
    error,
    sendTextMessage,
    sendImageMessage,
    markAsRead,
  };
};

// ============= MUTATION HOOK FOR SENDING MESSAGES =============
export const useSendMessage = (
  conversationId: string,
  currentUserId?: string
) => {
  const { sendTextMessage, isConnected } = useChatHub(
    conversationId,
    currentUserId
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      senderId,
      content,
    }: {
      senderId: string;
      content: string;
    }) => {
      if (!isConnected) {
        throw new Error("Not connected to chat");
      }
      await sendTextMessage(conversationId, senderId, content);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
