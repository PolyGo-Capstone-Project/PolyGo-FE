// Chat Types
export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "voice" | "emoji";
  voiceUrl?: string;
  voiceDuration?: number;
  createdAt: Date;
  isRead: boolean;
  isDelivered: boolean;
}

export interface ChatConversation {
  id: string;
  user: ChatUser;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isTyping: boolean;
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
