"use client";

import envConfig from "@/config";
import communicationApiRequest from "@/lib/apis/communication";
import { playNotificationSoundFromFile } from "@/lib/notification-sound";
import { getSessionTokenFromLocalStorage } from "@/lib/utils";
import {
  ConversationReadUpdatedType,
  GetConversationsQueryType,
  GetMessageSearchQueryType,
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
type SearchMessagesResponse = Awaited<
  ReturnType<typeof communicationApiRequest.searchMessages>
>;
type GetConversationMediaResponse = Awaited<
  ReturnType<typeof communicationApiRequest.getMedia>
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

// ============= Additional Queries =============

export const useSearchMessages = (
  conversationId: string,
  query: GetMessageSearchQueryType,
  options?: { enabled?: boolean }
) => {
  const hasSearchContent = Boolean(query.content?.trim());

  return useQuery<SearchMessagesResponse>({
    queryKey: ["messages", "search", conversationId, query],
    queryFn: () =>
      communicationApiRequest.searchMessages(conversationId, query),
    enabled:
      (options?.enabled ?? true) && Boolean(conversationId) && hasSearchContent,
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useGetConversationMedia = (
  conversationId: string,
  query: GetMessagesQueryType,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetConversationMediaResponse>({
    queryKey: ["messages", "media", conversationId, query],
    queryFn: () => communicationApiRequest.getMedia(conversationId, query),
    enabled: (options?.enabled ?? true) && Boolean(conversationId),
    staleTime: 0,
    refetchOnMount: true,
  });
};

// ============= SIGNALR HUB CONNECTION =============
export const useChatHub = (
  conversationId?: string,
  currentUserId?: string,
  onNewMessage?: (message: RealtimeMessageType) => void
) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);
  const onNewMessageRef = useRef(onNewMessage);

  // Update callback ref when it changes
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

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
        // Add timeout configurations to prevent disconnections
        timeout: 100000, // 100 seconds
        withCredentials: false,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 30s
          if (retryContext.previousRetryCount === 0) {
            return 0;
          }
          if (retryContext.previousRetryCount === 1) {
            return 2000;
          }
          if (retryContext.previousRetryCount === 2) {
            return 10000;
          }
          return 30000;
        },
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Set server timeout (keep-alive)
    hubConnection.serverTimeoutInMilliseconds = 60000; // 60 seconds
    hubConnection.keepAliveIntervalInMilliseconds = 15000; // 15 seconds

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

      // Invalidate queries to refetch latest data after reconnection
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["messages", conversationId],
        });
      }

      // Rejoin conversation if exists
      if (conversationId && connectionRef.current) {
        connectionRef.current
          .invoke("JoinConversation", conversationId)
          .then(() => {
            console.log(
              `✅ Rejoined conversation after reconnect: ${conversationId}`
            );
          })
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

      // Call the callback if provided (for updating local state immediately)
      if (onNewMessageRef.current) {
        onNewMessageRef.current(message);
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

  const deleteMessage = async (messageId: string) => {
    if (!connection || !isConnected) {
      throw new Error("Not connected to chat hub");
    }

    try {
      await connection.invoke("DeleteMessage", messageId);
      console.log("✅ Deleted message successfully");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (err: any) {
      console.error("❌ Error deleting message:", err);
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
    deleteMessage,
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
