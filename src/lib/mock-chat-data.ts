import { ChatConversation, ChatMessage, ChatUser } from "@/types";

// Mock current user
export const CURRENT_USER_ID = "user-1";

// Mock users
export const mockUsers: ChatUser[] = [
  {
    id: "user-2",
    name: "Nguyễn Văn A",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    isOnline: true,
  },
  {
    id: "user-3",
    name: "Trần Thị B",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: "user-4",
    name: "Lê Văn C",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4",
    isOnline: true,
  },
  {
    id: "user-5",
    name: "Phạm Thị D",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user5",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "user-6",
    name: "Hoàng Văn E",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user6",
    isOnline: true,
  },
];

// Mock messages
export const mockMessages: Record<string, ChatMessage[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "user-2",
      content: "Xin chào! Bạn khỏe không?",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      isRead: true,
      isDelivered: true,
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      senderId: CURRENT_USER_ID,
      content: "Chào bạn! Mình khỏe, còn bạn?",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 50),
      isRead: true,
      isDelivered: true,
    },
    {
      id: "msg-3",
      conversationId: "conv-1",
      senderId: "user-2",
      content: "Mình cũng ổn. Cuối tuần này có rảnh không?",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 40),
      isRead: true,
      isDelivered: true,
    },
    {
      id: "msg-4",
      conversationId: "conv-1",
      senderId: CURRENT_USER_ID,
      content: "Có đấy, bạn có kế hoạch gì không?",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true,
      isDelivered: true,
    },
    {
      id: "msg-5",
      conversationId: "conv-1",
      senderId: "user-2",
      content: "😊",
      type: "emoji",
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      isRead: true,
      isDelivered: true,
    },
    {
      id: "msg-6",
      conversationId: "conv-1",
      senderId: "user-2",
      content: "Voice message",
      type: "voice",
      voiceUrl: "#",
      voiceDuration: 15,
      createdAt: new Date(Date.now() - 1000 * 60 * 2),
      isRead: false,
      isDelivered: true,
    },
  ],
  "conv-2": [
    {
      id: "msg-7",
      conversationId: "conv-2",
      senderId: "user-3",
      content: "Hôm nay làm việc thế nào rồi?",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
      isRead: true,
      isDelivered: true,
    },
    {
      id: "msg-8",
      conversationId: "conv-2",
      senderId: CURRENT_USER_ID,
      content: "Khá bận nhưng vẫn ổn!",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 100),
      isRead: true,
      isDelivered: true,
    },
  ],
  "conv-3": [
    {
      id: "msg-9",
      conversationId: "conv-3",
      senderId: CURRENT_USER_ID,
      content: "Cuối tuần đi chơi nhé!",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 200),
      isRead: true,
      isDelivered: true,
    },
  ],
  "conv-4": [
    {
      id: "msg-10",
      conversationId: "conv-4",
      senderId: "user-5",
      content: "Cảm ơn bạn nhiều nha!",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 300),
      isRead: true,
      isDelivered: true,
    },
  ],
  "conv-5": [
    {
      id: "msg-11",
      conversationId: "conv-5",
      senderId: "user-6",
      content: "Mai gặp lại!",
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 400),
      isRead: true,
      isDelivered: true,
    },
  ],
};

// Mock conversations
export const mockConversations: ChatConversation[] = [
  {
    id: "conv-1",
    user: mockUsers[0],
    lastMessage: mockMessages["conv-1"][mockMessages["conv-1"].length - 1],
    unreadCount: 2,
    isTyping: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: "conv-2",
    user: mockUsers[1],
    lastMessage: mockMessages["conv-2"][mockMessages["conv-2"].length - 1],
    unreadCount: 0,
    isTyping: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 100),
  },
  {
    id: "conv-3",
    user: mockUsers[2],
    lastMessage: mockMessages["conv-3"][mockMessages["conv-3"].length - 1],
    unreadCount: 0,
    isTyping: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 200),
  },
  {
    id: "conv-4",
    user: mockUsers[3],
    lastMessage: mockMessages["conv-4"][mockMessages["conv-4"].length - 1],
    unreadCount: 0,
    isTyping: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 300),
  },
  {
    id: "conv-5",
    user: mockUsers[4],
    lastMessage: mockMessages["conv-5"][mockMessages["conv-5"].length - 1],
    unreadCount: 0,
    isTyping: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 400),
  },
];

// Helper to get messages for a conversation
export const getMessagesForConversation = (
  conversationId: string
): ChatMessage[] => {
  return mockMessages[conversationId] || [];
};

// Helper to simulate loading more messages
export const loadMoreMessages = (
  conversationId: string,
  currentCount: number
): ChatMessage[] => {
  // Simulate loading older messages
  const newMessages: ChatMessage[] = [];
  for (let i = 0; i < 10; i++) {
    newMessages.push({
      id: `msg-old-${conversationId}-${currentCount + i}`,
      conversationId,
      senderId: Math.random() > 0.5 ? CURRENT_USER_ID : "user-2",
      content: `Tin nhắn cũ số ${currentCount + i + 1}`,
      type: "text",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * (currentCount + i + 2)),
      isRead: true,
      isDelivered: true,
    });
  }
  return newMessages;
};
