import http from "@/lib/http";
import { buildQueryString } from "@/lib/utils";
import {
  ConversationListResType,
  GetConversationsQueryType,
  GetMessagesQueryType,
  MessageListResType,
} from "@/models";

const communicationApiRequest = {
  // Get messages in a conversation
  getMessages: (conversationId: string, params?: GetMessagesQueryType) => {
    const query = buildQueryString(params);
    return http.get<MessageListResType>(
      `/conversations/messages/${conversationId}${query}`
    );
  },

  // Get all conversations
  getConversations: (params?: GetConversationsQueryType) => {
    const query = buildQueryString(params);
    return http.get<ConversationListResType>(`/conversations${query}`);
  },
};

export default communicationApiRequest;
