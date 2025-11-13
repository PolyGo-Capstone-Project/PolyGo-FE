import { createGetAll, createGetOne } from "@/lib/apis/factory";
import {
  ConversationListResType,
  GetConversationByIdResType,
  GetConversationsByUserIdResType,
  GetConversationsQueryType,
  GetMessageSearchQueryType,
  GetMessagesQueryType,
  MediaListResType,
  MessageListResType,
} from "@/models";

const prefix = "/conversations";

const communicationApiRequest = {
  // Get messages in a conversation
  getMessages: createGetOne<MessageListResType, GetMessagesQueryType>(
    `${prefix}/messages`
  ),
  // Search messages in a conversation
  searchMessages: createGetOne<MessageListResType, GetMessageSearchQueryType>(
    `${prefix}/text-messages`
  ),
  // Get media and files in a conversation
  getMedia: createGetOne<MediaListResType, GetMessagesQueryType>(
    `${prefix}/images`
  ),

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
