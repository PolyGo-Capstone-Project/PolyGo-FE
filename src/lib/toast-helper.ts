// src/lib/toast-helper.ts
import { toast } from "sonner";

import { getTranslatedMessage } from "./message-handler";

type Translator = (key: string, values?: Record<string, any>) => string;

/**
 * Show success toast với translated message
 *
 * @param message - Server message hoặc i18n key
 * @param t - useTranslations("Success")
 * @param defaultKey - Default fallback key (default: "default")
 *
 * @example
 * const tSuccess = useTranslations("Success");
 * showSuccessToast(result.message, tSuccess);
 */
export const showSuccessToast = (
  message: string | undefined,
  t: Translator,
  defaultKey: string = "default"
) => {
  const translatedMessage = getTranslatedMessage(message, t, defaultKey);
  toast.success(translatedMessage);
};

/**
 * Show error toast với translated message
 *
 * @param message - Server message hoặc i18n key
 * @param t - useTranslations("Error")
 * @param defaultKey - Default fallback key (default: "default")
 *
 * @example
 * const tError = useTranslations("Error");
 * showErrorToast(error.message, tError);
 */
export const showErrorToast = (
  message: string | undefined,
  t: Translator,
  defaultKey: string = "default"
) => {
  const translatedMessage = getTranslatedMessage(message, t, defaultKey);
  toast.error(translatedMessage);
};

/**
 * Show info toast với translated message
 */
export const showInfoToast = (
  message: string | undefined,
  t: Translator,
  defaultKey: string = "default"
) => {
  const translatedMessage = getTranslatedMessage(message, t, defaultKey);
  toast.info(translatedMessage);
};

/**
 * Show warning toast với translated message
 */
export const showWarningToast = (
  message: string | undefined,
  t: Translator,
  defaultKey: string = "default"
) => {
  const translatedMessage = getTranslatedMessage(message, t, defaultKey);
  toast.warning(translatedMessage);
};

/**
 * Show loading toast với translated message
 * Returns toast ID để có thể dismiss sau
 */
export const showLoadingToast = (
  message: string | undefined,
  t: Translator,
  defaultKey: string = "default"
) => {
  const translatedMessage = getTranslatedMessage(message, t, defaultKey);
  return toast.loading(translatedMessage);
};

/**
 * Promise-based toast
 * Automatically handles loading, success, and error states
 *
 * @example
 * const tSuccess = useTranslations("Success");
 * const tError = useTranslations("Error");
 *
 * await showPromiseToast(
 *   apiCall(),
 *   {
 *     loading: t("loading"),
 *     success: (data) => getTranslatedMessage(data.message, tSuccess),
 *     error: (err) => getTranslatedMessage(err.message, tError),
 *   }
 * );
 */
export const showPromiseToast = <T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: (data: T) => string;
    error: (error: any) => string;
  }
) => {
  return toast.promise(promise, options);
};
