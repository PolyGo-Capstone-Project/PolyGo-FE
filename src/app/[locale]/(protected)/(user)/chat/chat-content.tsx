"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  CallModal,
  ChatHeader,
  ConversationList,
  MessageInput,
  MessageList,
  MessageSearch,
} from "@/components/modules/chat";
import { Button } from "@/components/ui/button";
import {
  CURRENT_USER_ID,
  getMessagesForConversation,
  loadMoreMessages,
  mockConversations,
} from "@/lib/mock-chat-data";
import { CallState, CallType, ChatConversation, ChatMessage } from "@/types";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ChatPageContentProps {
  locale: string;
}

export function ChatPageContent({ locale }: ChatPageContentProps) {
  const t = useTranslations("chat");
  const tSuccess = useTranslations("Success");

  const [conversations, setConversations] =
    useState<ChatConversation[]>(mockConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      setIsLoadingMessages(true);

      setTimeout(() => {
        const loadedMessages = getMessagesForConversation(
          selectedConversationId
        );
        setMessages(loadedMessages);
        setIsLoadingMessages(false);
        setHasMoreMessages(true);

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }, 500);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      const interval = setInterval(() => {
        if (Math.random() > 0.8) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === selectedConversationId
                ? { ...conv, isTyping: !conv.isTyping }
                : conv
            )
          );
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedConversationId]);

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  const handleSendMessage = (
    content: string,
    type: "text" | "voice" | "emoji"
  ) => {
    if (!selectedConversationId) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: CURRENT_USER_ID,
      content,
      type,
      voiceUrl: type === "voice" ? content : undefined,
      voiceDuration: type === "voice" ? 10 : undefined,
      createdAt: new Date(),
      isRead: false,
      isDelivered: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversationId
          ? {
              ...conv,
              lastMessage: newMessage,
              updatedAt: new Date(),
            }
          : conv
      )
    );

    setTimeout(() => {
      const replyMessage: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        conversationId: selectedConversationId,
        senderId: selectedConversation?.user.id || "user-2",
        content: "Cảm ơn bạn đã nhắn tin! 😊",
        type: "text",
        createdAt: new Date(),
        isRead: false,
        isDelivered: true,
      };

      setMessages((prev) => [...prev, replyMessage]);

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                lastMessage: replyMessage,
                updatedAt: new Date(),
                unreadCount: conv.unreadCount + 1,
                isTyping: false,
              }
            : conv
        )
      );
    }, 2000);
  };

  const handleLoadMoreMessages = () => {
    if (!selectedConversationId || isLoadingMessages) return;

    setIsLoadingMessages(true);

    setTimeout(() => {
      const moreMessages = loadMoreMessages(
        selectedConversationId,
        messages.length
      );
      setMessages((prev) => [...moreMessages, ...prev]);
      setIsLoadingMessages(false);

      if (messages.length > 30) {
        setHasMoreMessages(false);
      }
    }, 1000);
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
    }

    toast.success(tSuccess("Delete"));
  };

  const handleSelectMessage = (messageId: string) => {
    console.log("Scroll to message:", messageId);
  };

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
                  isTyping={selectedConversation.isTyping}
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
              currentUserId={CURRENT_USER_ID}
              isLoading={isLoadingMessages}
              hasMore={hasMoreMessages}
              onLoadMore={handleLoadMoreMessages}
              locale={locale}
              otherUserName={selectedConversation.user.name}
              otherUserAvatar={selectedConversation.user.avatar}
            />

            <MessageInput onSendMessage={handleSendMessage} disabled={false} />
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
              currentUserId={CURRENT_USER_ID}
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
              isTyping={selectedConversation.isTyping}
              onVoiceCall={() => handleStartCall("voice")}
              onVideoCall={() => handleStartCall("video")}
              onSearchMessages={handleSearchMessages}
              onDeleteConversation={() => handleDeleteConversation()}
              locale={locale}
            />

            <MessageList
              messages={messages}
              currentUserId={CURRENT_USER_ID}
              isLoading={isLoadingMessages}
              hasMore={hasMoreMessages}
              onLoadMore={handleLoadMoreMessages}
              locale={locale}
              otherUserName={selectedConversation.user.name}
              otherUserAvatar={selectedConversation.user.avatar}
            />

            <MessageInput onSendMessage={handleSendMessage} disabled={false} />
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
            currentUserId={CURRENT_USER_ID}
            onSelectMessage={handleSelectMessage}
            locale={locale}
          />
        </>
      )}
    </div>
  );
}
