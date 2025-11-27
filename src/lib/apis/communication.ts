import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  ConversationListResType,
  GetConversationByIdResType,
  GetConversationLanguageSetupType,
  GetConversationsByUserIdResType,
  GetConversationsQueryType,
  GetMessageSearchQueryType,
  GetMessagesQueryType,
  MediaListResType,
  MessageListResType,
  MessageResType,
  SetConversationLanguageBodyType,
  TranslateMessageResType,
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
  // Get conversation language setup
  getConversationLanguageSetup: (conversationId: string) =>
    http.get<GetConversationLanguageSetupType>(
      `${prefix}/${conversationId}/translation-language`
    ),
  // Set conversation language
  setConversationLanguage: (
    conversationId: string,
    body: SetConversationLanguageBodyType
  ) =>
    http.put<MessageResType>(
      `${prefix}/${conversationId}/translation-language`,
      body
    ),
  // Translate message
  translateMessage: (messageId: string) =>
    http.post<TranslateMessageResType>(
      `${prefix}/messages/${messageId}/translate`,
      null
    ),
};

export default communicationApiRequest;
