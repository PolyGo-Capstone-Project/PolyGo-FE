import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  ConversationListResType,
  GetConversationByIdResType,
  GetConversationsByUserIdResType,
  GetConversationsQueryType,
  GetMessagesQueryType,
  MessageListResType,
  MessageResType,
} from "@/models";

const prefix = "/conversations";

const communicationApiRequest = {
  // Get messages in a conversation
  getMessages: createGetOne<MessageListResType, GetMessagesQueryType>(
    `${prefix}/messages`
  ),
  // Delete message by ID
  deleteMessage: (id: string) => http.delete<MessageResType>(`/messages/${id}`),
  //CONVERSATIONS============================
  // Get conversations
  getConversations: createGetAll<
    ConversationListResType,
    GetConversationsQueryType
  >(`${prefix}`),
  // Get conversation by ID
  getConversationById: createGetOne<GetConversationByIdResType>(`${prefix}`),
  // Get conversations by user ID
  getConversationsByUserId: createGetOne<GetConversationsByUserIdResType>(
    `${prefix}/user`
  ),
};

export default communicationApiRequest;
