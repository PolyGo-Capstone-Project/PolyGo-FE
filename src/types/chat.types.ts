import { TypeOfMessageEnumType } from "@/constants";

// Chat Types

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  isOnline?: boolean;
  lastSeen?: Date | null;
  lastActiveAt?: Date | null;
}

export interface ChatLastMessage {
  type: TypeOfMessageEnumType;
  content: string;
  sentAt: Date;
  isSentByYou: boolean;
  imageUrls?: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: TypeOfMessageEnumType;
  createdAt: Date;
  imageUrls?: string[];
  isRead?: boolean;
  isDelivered?: boolean;
  isTranslated?: boolean;
  translatedContent?: string | null;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
}

export interface ChatConversation {
  id: string;
  user: ChatUser;
  lastMessage: ChatLastMessage | null;
  hasSeen: boolean; // Changed from unreadCount to match backend
  isTyping?: boolean;
  updatedAt: Date;
}

export interface TypingUser {
  userId: string;
  conversationId: string;
  timestamp: Date;
}

export type CallType = "voice" | "video";
export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended";

export interface CallState {
  conversationId: string | null;
  type: CallType;
  status: CallStatus;
  isMuted: boolean;
  isVideoOff: boolean;
  startTime?: Date;
  duration?: number;
}
