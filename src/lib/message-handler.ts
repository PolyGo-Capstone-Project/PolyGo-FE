// src/lib/message-handler.ts

type Translator = (key: string, values?: Record<string, any>) => string;

/**
 * Generic message handler cho Success/Error messages
 * Tự động map server messages sang i18n keys
 *
 * @example
 * // In component:
 * const tSuccess = useTranslations("Success");
 * const tError = useTranslations("Error");
 *
 * // Handle success
 * const successMsg = getTranslatedMessage(result.message, tSuccess);
 *
 * // Handle error
 * const errorMsg = getTranslatedMessage(error.message, tError);
 */
export const getTranslatedMessage = (
  serverMessage: string | undefined,
  t: Translator,
  defaultKey: string = "default"
): string => {
  if (!serverMessage) {
    return t(defaultKey);
  }

  // Case 1: Server trả về full key như "auth.Success.Login"
  // Extract phần sau cùng: "Login"
  const parts = serverMessage.split(".");
  const lastPart = parts[parts.length - 1];

  // Try với key đầy đủ trước (nếu namespace đã đúng)
  // Nếu không tìm thấy, fallback về lastPart
  // Nếu vẫn không có, dùng default
  try {
    return t(lastPart);
  } catch {
    return t(defaultKey);
  }
};

/**
 * Variant khác: cho phép custom mapping
 * Useful khi server message format khác với i18n structure
 *
 * @example
 * const messageMap = {
 *   "USER_CREATED": "Create",
 *   "USER_UPDATED": "Update",
 *   "USER_DELETED": "Delete"
 * };
 *
 * const msg = getMappedMessage(serverMsg, messageMap, t);
 */
export const getMappedMessage = (
  serverMessage: string | undefined,
  messageMap: Record<string, string>,
  t: Translator,
  defaultKey: string = "default"
): string => {
  if (!serverMessage) {
    return t(defaultKey);
  }

  const mappedKey = messageMap[serverMessage];
  if (mappedKey) {
    try {
      return t(mappedKey);
    } catch {
      return t(defaultKey);
    }
  }

  // Fallback: try direct translation
  return getTranslatedMessage(serverMessage, t, defaultKey);
};

/**
 * Higher-order function to create message handler với custom logic
 *
 * @example
 * // Create custom handler
 * const handleAuthMessage = createMessageHandler((msg) => {
 *   if (msg?.startsWith("auth.")) {
 *     return msg.replace("auth.", "");
 *   }
 *   return msg;
 * });
 *
 * // Use it
 * const message = handleAuthMessage("auth.Success.Login", t);
 */
export const createMessageHandler = (
  transformer?: (message: string) => string | undefined
) => {
  return (
    serverMessage: string | undefined,
    t: Translator,
    defaultKey: string = "default"
  ): string => {
    if (!serverMessage) {
      return t(defaultKey);
    }

    const transformedMessage = transformer
      ? transformer(serverMessage)
      : serverMessage;

    return getTranslatedMessage(transformedMessage, t, defaultKey);
  };
};

/**
 * Auth-specific message handler
 * Strips "auth." prefix and handles common auth messages
 */
export const getAuthMessage = createMessageHandler((msg) => {
  // Remove "auth." prefix if exists
  if (msg.startsWith("auth.Success.")) {
    return msg.replace("auth.Success.", "");
  }
  if (msg.startsWith("auth.Error.")) {
    return msg.replace("auth.Error.", "");
  }
  if (msg.startsWith("auth.")) {
    return msg.replace("auth.", "");
  }
  return msg;
});

/**
 * CRUD operations message handler
 * Maps common CRUD operations
 */
export const getCrudMessage = createMessageHandler((msg) => {
  const crudMap: Record<string, string> = {
    created: "Create",
    updated: "Update",
    deleted: "Delete",
    retrieved: "GetOne",
    listed: "GetAll",
  };

  const lowerMsg = msg.toLowerCase();
  for (const [key, value] of Object.entries(crudMap)) {
    if (lowerMsg.includes(key)) {
      return value;
    }
  }

  return msg;
});
