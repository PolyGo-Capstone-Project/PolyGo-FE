"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CallModal,
  ChatHeader,
  ConversationList,
  MessageInput,
  MessageList,
  MessageSearch,
} from "@/components/modules/chat";
import { Button } from "@/components/ui/button";
import { MESSAGE_IMAGE_SEPARATOR, MessageEnum } from "@/constants";
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
} from "@/models";
import { CallState, CallType, ChatConversation, ChatMessage } from "@/types";
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
    },
    lastMessage,
    unreadCount: 0,
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

  const [callState, setCallState] = useState<CallState>({
    conversationId: null,
    type: "voice",
    status: "idle",
    isMuted: false,
    isVideoOff: false,
  });
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

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

  const {
    isConnected,
    sendTextMessage,
    sendImageMessage,
    markAsRead,
    error: hubError,
  } = useChatHub(selectedConversationId ?? undefined);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!conversationsResponse) return;

    const items = conversationsResponse.payload.data.items ?? [];

    setConversations((prev) => {
      const prevMap = new Map(prev.map((conv) => [conv.id, conv]));
      const mapped = items.map((item) => {
        const previous = prevMap.get(item.id);
        const current = mapConversationToChat(item);
        return {
          ...current,
          unreadCount: previous?.unreadCount ?? current.unreadCount,
          updatedAt: previous?.updatedAt ?? current.updatedAt,
        };
      });
      return mapped;
    });
  }, [conversationsResponse]);

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
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );

    // Mark conversation as read when user opens it
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
      console.error("Failed to load more messages", error);
      toast.error(tError("loadMessages"));
    } finally {
      setIsLoadingMoreMessages(false);
    }
  };

  const handleStartCall = (type: CallType) => {
    if (!selectedConversationId) return;

    setCallState({
      conversationId: selectedConversationId,
      type,
      status: "calling",
      isMuted: false,
      isVideoOff: false,
    });
    setIsCallModalOpen(true);

    setTimeout(() => {
      setCallState((prev) => ({
        ...prev,
        status: "connected",
        startTime: new Date(),
      }));
    }, 3000);
  };

  const handleEndCall = () => {
    setCallState({
      conversationId: null,
      type: "voice",
      status: "idle",
      isMuted: false,
      isVideoOff: false,
    });
    setIsCallModalOpen(false);
  };

  const handleAcceptCall = () => {
    setCallState((prev) => ({
      ...prev,
      status: "connected",
      startTime: new Date(),
    }));
  };

  const handleDeclineCall = () => {
    handleEndCall();
  };

  const handleToggleMute = () => {
    setCallState((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  const handleToggleVideo = () => {
    setCallState((prev) => ({
      ...prev,
      isVideoOff: !prev.isVideoOff,
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
    console.log("Scroll to message:", messageId);
  };

  useEffect(() => {
    if (!selectedConversationId) return;

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== selectedConversationId) return conv;

        if (!messages.length) {
          return {
            ...conv,
            unreadCount: 0,
          };
        }

        const latest = messages[messages.length - 1];

        return {
          ...conv,
          unreadCount: 0,
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
                  onVoiceCall={() => handleStartCall("voice")}
                  onVideoCall={() => handleStartCall("video")}
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
              />
            </div>
            <MessageInput
              onSendText={handleSendTextMessage}
              onSendImages={handleSendImageMessage}
              disabled={
                !selectedConversationId || !currentUserId || !isConnected
              }
            />
          </div>
        )}

        {selectedConversation && (
          <>
            <CallModal
              isOpen={isCallModalOpen}
              onClose={handleEndCall}
              user={selectedConversation.user}
              callState={callState}
              onEndCall={handleEndCall}
              onAcceptCall={handleAcceptCall}
              onDeclineCall={handleDeclineCall}
              onToggleMute={handleToggleMute}
              onToggleVideo={handleToggleVideo}
            />

            <MessageSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              messages={messages}
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
        />
      </div>

      <div className="flex flex-1 flex-col h-full">
        {selectedConversation ? (
          <>
            <ChatHeader
              user={selectedConversation.user}
              isTyping={Boolean(selectedConversation.isTyping)}
              onVoiceCall={() => handleStartCall("voice")}
              onVideoCall={() => handleStartCall("video")}
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
              />
            </div>

            <MessageInput
              onSendText={handleSendTextMessage}
              onSendImages={handleSendImageMessage}
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
          <CallModal
            isOpen={isCallModalOpen}
            onClose={handleEndCall}
            user={selectedConversation.user}
            callState={callState}
            onEndCall={handleEndCall}
            onAcceptCall={handleAcceptCall}
            onDeclineCall={handleDeclineCall}
            onToggleMute={handleToggleMute}
            onToggleVideo={handleToggleVideo}
          />

          <MessageSearch
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            messages={messages}
            currentUserId={currentUserId ?? ""}
            onSelectMessage={handleSelectMessage}
            locale={locale}
          />
        </>
      )}
    </div>
  );
}
