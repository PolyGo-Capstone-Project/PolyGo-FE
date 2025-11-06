"use client";

import envConfig from "@/config";
import communicationApiRequest from "@/lib/apis/communication";
import { getSessionTokenFromLocalStorage } from "@/lib/utils";
import {
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

// ============= SIGNALR HUB CONNECTION =============
export const useChatHub = (conversationId?: string) => {
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
        setError(err.message);
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
      if (error) {
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
  }, [connection, isConnected, conversationId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!connection) return;

    const handleReceiveMessage = (message: RealtimeMessageType) => {
      console.log("📨 Received message:", message);

      // Invalidate messages to refetch with full sender info from server
      queryClient.invalidateQueries({
        queryKey: ["messages", message.conversationId],
      });

      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    connection.on("ReceiveMessage", handleReceiveMessage);

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
    };
  }, [connection, queryClient]);

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

  return {
    connection,
    isConnected,
    error,
    sendTextMessage,
    sendImageMessage,
  };
};

// ============= MUTATION HOOK FOR SENDING MESSAGES =============
export const useSendMessage = (conversationId: string) => {
  const { sendTextMessage, isConnected } = useChatHub(conversationId);
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
