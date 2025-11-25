"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ChatHeader,
  ConversationList,
  MessageInput,
  MessageList,
  MessageSearch,
} from "@/components/modules/chat";
import { useUserCommunicationHubContext } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { MESSAGE_IMAGE_SEPARATOR, MessageEnum } from "@/constants";
import { useChatNotification } from "@/contexts/chat-notification-context";
import {
  useAuthMe,
  useChatHub,
  useGetConversations,
  useGetMessages,
} from "@/hooks";
import communicationApiRequest from "@/lib/apis/communication";
import mediaApiRequest from "@/lib/apis/media";
import { HttpError } from "@/lib/http";
import {
  ConversationType,
  GetConversationsQueryType,
  GetMessagesQueryType,
  MessageType,
  RealtimeMessageType,
} from "@/models";
import { CallState, ChatConversation, ChatMessage } from "@/types";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_MESSAGES_QUERY: GetMessagesQueryType = {
  pageNumber: 1,
  pageSize: -1,
};

const extractImageUrlsFromContent = (
  type: ChatMessage["type"],
  content: string
) => {
  if (type === "Image") {
    return content ? [content] : [];
  }

  if (type === "Images") {
    return content
      .split(MESSAGE_IMAGE_SEPARATOR)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const mapConversationToChat = (
  conversation: ConversationType
): ChatConversation => {
  const lastMessage = conversation.lastMessage
    ? {
        type: conversation.lastMessage.type,
        content: conversation.lastMessage.content,
        sentAt: new Date(conversation.lastMessage.sentAt),
        isSentByYou: conversation.lastMessage.isSentByYou,
        imageUrls: extractImageUrlsFromContent(
          conversation.lastMessage.type,
          conversation.lastMessage.content
        ),
      }
    : null;

  const updatedAt = lastMessage?.sentAt ?? new Date(0);

  return {
    id: conversation.id,
    user: {
      id: conversation.user.id,
      name: conversation.user.name,
      avatar: conversation.user.avatarUrl,
      avatarUrl: conversation.user.avatarUrl,
      isOnline: false,
      lastSeen: null,
      lastActiveAt: conversation.user.lastActiveAt
        ? new Date(conversation.user.lastActiveAt)
        : null,
    },
    lastMessage,
    hasSeen: conversation.hasSeen,
    isTyping: false,
    updatedAt,
  };
};

const mapMessageToChat = (message: MessageType): ChatMessage => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.sender.id,
  content: message.content,
  type: message.type,
  createdAt: new Date(message.sentAt),
  imageUrls: extractImageUrlsFromContent(message.type, message.content),
});

interface ChatPageContentProps {
  locale: string;
}

export function ChatPageContent({ locale }: ChatPageContentProps) {
  const t = useTranslations("chat");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("chat.error");
  const { data: authData } = useAuthMe();
  const currentUserId = authData?.payload.data.id ?? null;
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [nextPageToLoad, setNextPageToLoad] = useState<number | null>(2);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [lastLoadedPage, setLastLoadedPage] = useState(1);
  const [isMobileView, setIsMobileView] = useState(false);

  const [pinnedConversationIds, setPinnedConversationIds] = useState<
    Set<string>
  >(new Set());
  const [mutedConversationIds, setMutedConversationIds] = useState<Set<string>>(
    new Set()
  );

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrollToMessageId, setScrollToMessageId] = useState<
    string | undefined
  >(undefined);

  const [callState, setCallState] = useState<CallState>({
    conversationId: null,
    type: "voice",
    status: "idle",
    isMuted: false,
    isVideoOff: false,
  });

  const [messagesQuery, setMessagesQuery] = useState<GetMessagesQueryType>(
    () => ({ ...DEFAULT_MESSAGES_QUERY })
  );
  const [conversationQuery] = useState<GetConversationsQueryType>({
    pageNumber: 1,
    pageSize: 50,
  });

  const {
    data: conversationsResponse,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useGetConversations(conversationQuery, { enabled: true });

  const {
    data: messagesResponse,
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
    error: messagesError,
  } = useGetMessages(selectedConversationId ?? "", messagesQuery, {
    enabled: Boolean(selectedConversationId),
  });

  // Handle new messages from SignalR
  const handleNewMessage = useCallback(
    (message: RealtimeMessageType) => {
      // If message is from another conversation (not currently selected), mark it as unread
      if (
        message.conversationId !== selectedConversationId &&
        message.senderId !== currentUserId
      ) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === message.conversationId
              ? { ...conv, hasSeen: false, updatedAt: new Date() }
              : conv
          )
        );
      }
    },
    [selectedConversationId, currentUserId]
  );

  const {
    isConnected,
    sendTextMessage,
    sendImageMessage,
    sendAudioMessage,
    markAsRead,
    deleteMessage,
    error: hubError,
  } = useChatHub(
    selectedConversationId ?? undefined,
    currentUserId ?? undefined,
    handleNewMessage
  );

  // User presence management from context
  const {
    isUserOnline,
    getOnlineStatus,
    setOnUserStatusChangedCallback,
    isConnected: isPresenceConnected,
  } = useUserCommunicationHubContext();

  // Chat notification management
  const { setUnreadChatCount } = useChatNotification();

  // Calculate total unread count (conversations where hasSeen is false)
  const totalUnreadCount = useMemo(() => {
    return conversations.filter((conv) => !conv.hasSeen).length;
  }, [conversations]);

  // Sync unread count with notification context
  useEffect(() => {
    setUnreadChatCount(totalUnreadCount);
  }, [totalUnreadCount, setUnreadChatCount]);

  // Listen for realtime user status changes
  useEffect(() => {
    const handleStatusChange = (data: {
      userId: string;
      isOnline: boolean;
      lastActiveAt: string;
    }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user.id === data.userId
            ? {
                ...conv,
                user: {
                  ...conv.user,
                  isOnline: data.isOnline,
                  lastActiveAt: new Date(data.lastActiveAt),
                  lastSeen: data.isOnline ? null : new Date(data.lastActiveAt),
                },
              }
            : conv
        )
      );
    };

    setOnUserStatusChangedCallback(handleStatusChange);
  }, [setOnUserStatusChangedCallback]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-select conversation from URL params
  useEffect(() => {
    const conversationIdFromUrl = searchParams.get("conversationId");
    if (conversationIdFromUrl && conversations.length > 0) {
      const conversationExists = conversations.some(
        (conv) => conv.id === conversationIdFromUrl
      );
      if (
        conversationExists &&
        selectedConversationId !== conversationIdFromUrl
      ) {
        setSelectedConversationId(conversationIdFromUrl);
        setMessages([]);
        setHasMoreMessages(false);
        setNextPageToLoad(2);
        setIsLoadingMoreMessages(false);
        setLastLoadedPage(1);
        setMessagesQuery({ ...DEFAULT_MESSAGES_QUERY });

        // Mark conversation as seen when user opens it
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationIdFromUrl
              ? { ...conv, hasSeen: true }
              : conv
          )
        );

        // Mark conversation as read on backend
        if (currentUserId) {
          markAsRead?.(conversationIdFromUrl, currentUserId).catch((err) => {
            console.error("Failed to mark conversation as read:", err);
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, conversations.length]);

  useEffect(() => {
    if (!conversationsResponse) return;

    const items = conversationsResponse.payload.data.items ?? [];

    setConversations((prev) => {
      const prevMap = new Map(prev.map((conv) => [conv.id, conv]));
      const mapped = items.map((item) => {
        const previous = prevMap.get(item.id);
        const current = mapConversationToChat(item);

        // Priority for hasSeen:
        // 1. If it's the currently selected conversation, keep it as seen (true)
        // 2. If server says hasSeen is false (new message), use server value
        // 3. Otherwise, keep previous value
        let hasSeen = current.hasSeen;
        if (item.id === selectedConversationId) {
          hasSeen = true; // Always mark selected conversation as seen
        } else if (!current.hasSeen) {
          hasSeen = false; // Server says there's unread message
        } else if (previous) {
          hasSeen = previous.hasSeen; // Keep previous state
        }

        return {
          ...current,
          hasSeen,
          updatedAt: previous?.updatedAt ?? current.updatedAt,
        };
      });
      return mapped;
    });

    // Fetch online status for all users in conversations
    // Only fetch when connection is ready!
    const userIds = items.map((item) => item.user.id);
    if (userIds.length > 0 && isPresenceConnected) {
      getOnlineStatus(userIds)
        .then((statusMap) => {
          setConversations((prev) =>
            prev.map((conv) => ({
              ...conv,
              user: {
                ...conv.user,
                isOnline: statusMap[conv.user.id] ?? false,
              },
            }))
          );
        })
        .catch((err) => {
          console.error("Failed to fetch online status:", err);
        });
    }
  }, [
    conversationsResponse,
    getOnlineStatus,
    selectedConversationId,
    isPresenceConnected,
  ]);

  useEffect(() => {
    if (conversationsError) {
      toast.error(tError("loadConversations"));
    }
  }, [conversationsError, tError]);

  useEffect(() => {
    if (messagesError) {
      if (messagesError instanceof HttpError && messagesError.status === 404) {
        setMessages([]);
        setHasMoreMessages(false);
        return;
      }

      toast.error(tError("loadMessages"));
    }
  }, [messagesError, tError]);

  useEffect(() => {
    if (!messagesResponse || !selectedConversationId) return;

    const payload = messagesResponse.payload.data;
    const currentPage =
      payload.currentPage ?? DEFAULT_MESSAGES_QUERY.pageNumber ?? 1;

    const mappedMessages = payload.items
      .map(mapMessageToChat)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort descending (newest first from API)

    setMessages((prev) => {
      // For page 1, replace all messages. For page > 1, prepend older messages
      const merged =
        currentPage === 1 ? mappedMessages : [...mappedMessages, ...prev];

      const unique = new Map<string, ChatMessage>();

      merged.forEach((message) => {
        unique.set(message.id, message);
      });

      // Sort ascending for display (oldest to newest)
      return Array.from(unique.values()).sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
    });

    const highestLoadedPage = Math.max(lastLoadedPage, currentPage);
    if (highestLoadedPage !== lastLoadedPage) {
      setLastLoadedPage(highestLoadedPage);
    }

    const totalPages = payload.totalPages ?? highestLoadedPage;
    const moreAvailable = highestLoadedPage < totalPages;

    setHasMoreMessages(moreAvailable);
    setNextPageToLoad(moreAvailable ? highestLoadedPage + 1 : null);
  }, [messagesResponse, selectedConversationId, currentUserId, lastLoadedPage]);

  useEffect(() => {
    if (hubError) {
      toast.error(hubError);
    }
  }, [hubError]);

  const selectedConversation = useMemo(
    () => conversations.find((conv) => conv.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const handleSelectConversation = (conversationId: string) => {
    if (conversationId === selectedConversationId) {
      return;
    }

    setSelectedConversationId(conversationId);
    setMessages([]);
    setHasMoreMessages(false);
    setNextPageToLoad(2);
    setIsLoadingMoreMessages(false);
    setLastLoadedPage(1);
    setMessagesQuery({ ...DEFAULT_MESSAGES_QUERY });

    // Mark conversation as seen when user opens it
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, hasSeen: true } : conv
      )
    );

    // Mark conversation as read on backend
    if (currentUserId) {
      markAsRead?.(conversationId, currentUserId).catch((err) => {
        console.error("Failed to mark conversation as read:", err);
      });
    }
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setMessages([]);
    setHasMoreMessages(false);
    setNextPageToLoad(2);
    setLastLoadedPage(1);
    setIsLoadingMoreMessages(false);
    setMessagesQuery({ ...DEFAULT_MESSAGES_QUERY });
  };

  const createOptimisticMessage = useCallback(
    ({
      content,
      type,
      imageUrls,
    }: {
      content: string;
      type: ChatMessage["type"];
      imageUrls?: string[];
    }) => {
      if (!selectedConversationId || !currentUserId) return null;

      const optimisticMessage: ChatMessage = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? `optimistic-${crypto.randomUUID()}`
            : `optimistic-${Date.now()}`,
        conversationId: selectedConversationId,
        senderId: currentUserId,
        content,
        type,
        createdAt: new Date(),
        imageUrls,
      };

      setMessages((prev) =>
        [...prev, optimisticMessage].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        )
      );

      return optimisticMessage.id;
    },
    [selectedConversationId, currentUserId]
  );

  const removeOptimisticMessage = useCallback((messageId: string | null) => {
    if (!messageId) return;

    setMessages((prev) => prev.filter((message) => message.id !== messageId));
  }, []);

  const handleSendTextMessage = async (content: string) => {
    if (!selectedConversationId || !currentUserId) {
      throw new Error("Missing conversation or user");
    }

    const optimisticId = createOptimisticMessage({
      content,
      type: MessageEnum.Text,
    });

    try {
      await sendTextMessage(selectedConversationId, currentUserId, content);
    } catch (error) {
      removeOptimisticMessage(optimisticId);
      throw error;
    }
  };

  const handleSendImageMessage = async (files: File[]) => {
    if (!selectedConversationId || !currentUserId) {
      throw new Error("Missing conversation or user");
    }

    const uploads = await Promise.all(
      files.map((file) => mediaApiRequest.uploadImage({ file }))
    );

    const imageUrls = uploads
      .map((response) => response.payload.data)
      .filter((url): url is string => Boolean(url));

    if (!imageUrls.length) {
      throw new Error("No images uploaded");
    }

    const optimisticId = createOptimisticMessage({
      content: imageUrls.join(MESSAGE_IMAGE_SEPARATOR),
      type: imageUrls.length > 1 ? MessageEnum.Images : MessageEnum.Image,
      imageUrls,
    });

    try {
      await sendImageMessage(selectedConversationId, currentUserId, imageUrls);
    } catch (error) {
      removeOptimisticMessage(optimisticId);
      throw error;
    }
  };

  const handleSendAudioMessage = async (file: File) => {
    if (!selectedConversationId || !currentUserId) {
      throw new Error("Missing conversation or user");
    }

    const upload = await mediaApiRequest.uploadFile({ file });
    const audioUrl = upload.payload.data;

    if (!audioUrl) {
      throw new Error("No audio uploaded");
    }

    const optimisticId = createOptimisticMessage({
      content: audioUrl,
      type: MessageEnum.Audio,
    });

    try {
      await sendAudioMessage(selectedConversationId, currentUserId, audioUrl);
    } catch (error) {
      removeOptimisticMessage(optimisticId);
      throw error;
    }
  };

  const handleLoadMoreMessages = async () => {
    if (
      !selectedConversationId ||
      !hasMoreMessages ||
      isLoadingMoreMessages ||
      isFetchingMessages ||
      !nextPageToLoad
    ) {
      return;
    }

    try {
      setIsLoadingMoreMessages(true);

      const response = await communicationApiRequest.getMessages(
        selectedConversationId,
        {
          pageNumber: nextPageToLoad,
          pageSize: DEFAULT_MESSAGES_QUERY.pageSize,
        }
      );

      const payload = response.payload.data;
      const loadedPage = payload.currentPage ?? nextPageToLoad;
      const updatedLastLoadedPage = Math.max(lastLoadedPage, loadedPage);
      const totalPages = payload.totalPages ?? updatedLastLoadedPage;
      const moreAvailable = updatedLastLoadedPage < totalPages;

      // Sort descending first (newest first from API response)
      const mapped = payload.items
        .map(mapMessageToChat)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setMessages((prev) => {
        // Prepend older messages
        const merged = [...mapped, ...prev];
        const unique = new Map<string, ChatMessage>();

        merged.forEach((message) => {
          unique.set(message.id, message);
        });

        // Sort ascending for display (oldest to newest)
        return Array.from(unique.values()).sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
      });

      setLastLoadedPage(updatedLastLoadedPage);
      setHasMoreMessages(moreAvailable);
      setNextPageToLoad(moreAvailable ? updatedLastLoadedPage + 1 : null);
    } catch (error) {
      toast.error(tError("loadMessages"));
    } finally {
      setIsLoadingMoreMessages(false);
    }
  };

  const handleToggleMute = () => {
    setCallState((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  const handleSearchMessages = () => {
    setIsSearchOpen(true);
  };

  const handlePinConversation = (conversationId: string) => {
    setPinnedConversationIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(conversationId);
      return newSet;
    });
    toast.success(t("pinConversation"));
  };

  const handleUnpinConversation = (conversationId: string) => {
    setPinnedConversationIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(conversationId);
      return newSet;
    });
    toast.success(t("unpinConversation"));
  };

  const handleMuteConversation = (conversationId: string) => {
    setMutedConversationIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(conversationId);
      return newSet;
    });
    toast.success(t("muteConversation"));
  };

  const handleUnmuteConversation = (conversationId: string) => {
    setMutedConversationIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(conversationId);
      return newSet;
    });
    toast.success(t("unmuteConversation"));
  };

  const handleDeleteConversation = (conversationId?: string) => {
    const idToDelete = conversationId || selectedConversationId;
    if (!idToDelete) return;

    setConversations((prev) => prev.filter((conv) => conv.id !== idToDelete));

    if (selectedConversationId === idToDelete) {
      setSelectedConversationId(null);
      setMessages([]);
      setHasMoreMessages(false);
      setNextPageToLoad(2);
      setLastLoadedPage(1);
      setIsLoadingMoreMessages(false);
      setMessagesQuery({ ...DEFAULT_MESSAGES_QUERY });
    }

    toast.success(tSuccess("Delete"));
  };

  const handleSelectMessage = (messageId: string) => {
    setScrollToMessageId(messageId);
    // Reset after a short delay to allow re-scrolling to the same message
    setTimeout(() => setScrollToMessageId(undefined), 100);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      // Remove the message from local state immediately for better UX
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      toast.success(tSuccess("Delete"));
    } catch (error) {
      toast.error(tError("deleteMessage"));
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(tSuccess("Copy"));
    } catch (error) {
      toast.error(tError("copyMessage"));
    }
  };

  useEffect(() => {
    if (!selectedConversationId) return;

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== selectedConversationId) return conv;

        if (!messages.length) {
          return {
            ...conv,
            hasSeen: true,
          };
        }

        const latest = messages[messages.length - 1];

        return {
          ...conv,
          hasSeen: true,
          updatedAt: latest.createdAt,
          lastMessage: {
            type: latest.type,
            content: latest.content,
            sentAt: latest.createdAt,
            isSentByYou: latest.senderId === currentUserId,
            imageUrls: latest.imageUrls,
          },
        };
      })
    );
  }, [messages, selectedConversationId, currentUserId]);

  const isMessagesLoadingState =
    (isLoadingMessages || isFetchingMessages) && messages.length === 0;

  if (isMobileView) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
        {!selectedConversation ? (
          <div className="w-full">
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              onPinConversation={handlePinConversation}
              onUnpinConversation={handleUnpinConversation}
              onDeleteConversation={handleDeleteConversation}
              onMuteConversation={handleMuteConversation}
              onUnmuteConversation={handleUnmuteConversation}
              pinnedConversationIds={pinnedConversationIds}
              mutedConversationIds={mutedConversationIds}
              locale={locale}
            />
          </div>
        ) : (
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center gap-2 border-b p-3">
              <Button size="icon" variant="ghost" onClick={handleBackToList}>
                <ArrowLeft className="size-5" />
              </Button>
              <div className="flex-1">
                <ChatHeader
                  user={selectedConversation.user}
                  isTyping={Boolean(selectedConversation.isTyping)}
                  onSearchMessages={handleSearchMessages}
                  onDeleteConversation={() => handleDeleteConversation()}
                  locale={locale}
                />
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <MessageList
                key={selectedConversationId ?? "conversation"}
                messages={messages}
                currentUserId={currentUserId ?? ""}
                isLoading={isMessagesLoadingState || isLoadingMoreMessages}
                isLoadingMore={isLoadingMoreMessages}
                hasMore={hasMoreMessages}
                onLoadMore={handleLoadMoreMessages}
                locale={locale}
                otherUserName={selectedConversation.user.name}
                otherUserAvatar={
                  selectedConversation.user.avatar ??
                  selectedConversation.user.avatarUrl ??
                  undefined
                }
                onDeleteMessage={handleDeleteMessage}
                onCopyMessage={handleCopyMessage}
              />
            </div>
            <MessageInput
              onSendText={handleSendTextMessage}
              onSendImages={handleSendImageMessage}
              onSendAudio={handleSendAudioMessage}
              disabled={
                !selectedConversationId || !currentUserId || !isConnected
              }
            />
          </div>
        )}

        {selectedConversation && (
          <>
            <MessageSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              conversationId={selectedConversationId}
              currentUserId={currentUserId ?? ""}
              onSelectMessage={handleSelectMessage}
              locale={locale}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden">
      <div className="w-80 h-full shrink-0">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onPinConversation={handlePinConversation}
          onUnpinConversation={handleUnpinConversation}
          onDeleteConversation={handleDeleteConversation}
          onMuteConversation={handleMuteConversation}
          onUnmuteConversation={handleUnmuteConversation}
          pinnedConversationIds={pinnedConversationIds}
          mutedConversationIds={mutedConversationIds}
          locale={locale}
          totalUnreadCount={totalUnreadCount}
        />
      </div>

      <div className="flex flex-1 flex-col h-full">
        {selectedConversation ? (
          <>
            <ChatHeader
              user={selectedConversation.user}
              isTyping={Boolean(selectedConversation.isTyping)}
              onSearchMessages={handleSearchMessages}
              onDeleteConversation={() => handleDeleteConversation()}
              locale={locale}
            />

            <div className="flex-1 overflow-hidden">
              <MessageList
                key={selectedConversationId ?? "conversation"}
                messages={messages}
                currentUserId={currentUserId ?? ""}
                isLoading={isMessagesLoadingState || isLoadingMoreMessages}
                isLoadingMore={isLoadingMoreMessages}
                hasMore={hasMoreMessages}
                onLoadMore={handleLoadMoreMessages}
                locale={locale}
                otherUserName={selectedConversation.user.name}
                otherUserAvatar={
                  selectedConversation.user.avatar ??
                  selectedConversation.user.avatarUrl ??
                  undefined
                }
                onDeleteMessage={handleDeleteMessage}
                onCopyMessage={handleCopyMessage}
                scrollToMessageId={scrollToMessageId}
              />
            </div>

            <MessageInput
              onSendText={handleSendTextMessage}
              onSendImages={handleSendImageMessage}
              onSendAudio={handleSendAudioMessage}
              disabled={
                !selectedConversationId || !currentUserId || !isConnected
              }
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="bg-muted mb-4 rounded-full p-6">
              <MessageCircle className="text-muted-foreground size-12" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              {t("selectConversation")}
            </h3>
            <p className="text-muted-foreground max-w-sm">
              {t("selectConversationDescription")}
            </p>
          </div>
        )}
      </div>

      {selectedConversation && (
        <>
          <MessageSearch
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            conversationId={selectedConversationId}
            currentUserId={currentUserId ?? ""}
            onSelectMessage={handleSelectMessage}
            locale={locale}
          />
        </>
      )}
    </div>
  );
}
