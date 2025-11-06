"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import {
  CallModal,
  ChatHeader,
  ConversationList,
  MessageInput,
  MessageList,
  MessageSearch,
} from "@/components/modules/chat";
import { Button } from "@/components/ui/button";
import { MESSAGE_IMAGE_SEPARATOR } from "@/constants";
import {
  useAuthMe,
  useChatHub,
  useGetConversations,
  useGetMessages,
} from "@/hooks";
import mediaApiRequest from "@/lib/apis/media";
import { HttpError } from "@/lib/http";
import {
  ConversationType,
  GetConversationsQueryType,
  GetMessagesQueryType,
  MessageType,
} from "@/models";
import {
  CallState,
  CallType,
  ChatConversation,
  ChatLastMessage,
  ChatMessage,
} from "@/types";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_MESSAGES_QUERY: GetMessagesQueryType = {
  pageNumber: -1,
  pageSize: -1,
};

const extractImageUrlsFromContent = (
  type: ChatLastMessage["type"],
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
    const mappedMessages = payload.items.map(mapMessageToChat);
    const messageCount = payload.items.length;

    setMessages(mappedMessages);
    setHasMoreMessages(payload.hasPreviousPage);

    if (!mappedMessages.length) return;

    const latest = mappedMessages[mappedMessages.length - 1];

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversationId
          ? {
              ...conv,
              unreadCount: messageCount,
              updatedAt: latest.createdAt,
              lastMessage: {
                type: latest.type,
                content: latest.content,
                sentAt: latest.createdAt,
                isSentByYou: latest.senderId === currentUserId,
                imageUrls: latest.imageUrls,
              },
            }
          : conv
      )
    );
  }, [messagesResponse, selectedConversationId, currentUserId]);

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
    setSelectedConversationId(conversationId);
    setMessages([]);
    setHasMoreMessages(false);
    setMessagesQuery({ ...DEFAULT_MESSAGES_QUERY });
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  const handleSendTextMessage = async (content: string) => {
    if (!selectedConversationId || !currentUserId) {
      throw new Error("Missing conversation or user");
    }

    await sendTextMessage(selectedConversationId, currentUserId, content);
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

    await sendImageMessage(selectedConversationId, currentUserId, imageUrls);
  };

  const handleLoadMoreMessages = () => {
    if (!selectedConversationId || hasMoreMessages === false) return;
    if (!messagesQuery.pageNumber || messagesQuery.pageNumber < 1) return;

    setMessagesQuery((prev) => ({
      ...prev,
      pageNumber: (prev.pageNumber ?? 1) + 1,
    }));
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
    }

    toast.success(tSuccess("Delete"));
  };

  const handleSelectMessage = (messageId: string) => {
    console.log("Scroll to message:", messageId);
  };

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
          <div className="flex w-full flex-col">
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

            <MessageList
              messages={messages}
              currentUserId={currentUserId ?? ""}
              isLoading={isMessagesLoadingState}
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
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      <div className="w-80 shrink-0">
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

      <div className="flex flex-1 flex-col">
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

            <MessageList
              messages={messages}
              currentUserId={currentUserId ?? ""}
              isLoading={isMessagesLoadingState}
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
