import { createGetAll, createGetOne } from "@/lib/apis/factory";
import {
  ConversationListResType,
  GetConversationsQueryType,
  GetMessagesQueryType,
  MessageListResType,
} from "@/models";

const prefix = "/conversations";

const communicationApiRequest = {
  // Get messages in a conversation
  getMessages: createGetOne<MessageListResType, GetMessagesQueryType>(
    `${prefix}/messages`
  ),
  // Get conversations
  getConversations: createGetAll<
    ConversationListResType,
    GetConversationsQueryType
  >(`${prefix}`),
};

export default communicationApiRequest;
