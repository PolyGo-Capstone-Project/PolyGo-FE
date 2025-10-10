import { clsx, type ClassValue } from "clsx";
import { jwtDecode } from "jwt-decode";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

import { EntityError } from "@/lib/http";
import { TokenPayload } from "@/types";

import { getTranslatedMessage } from "./message-handler";

export type QueryParamPrimitive = string | number | boolean | null | undefined;
export type QueryParamValue = QueryParamPrimitive | QueryParamPrimitive[];

export type QueryParams = Record<string, QueryParamValue>;

export const buildQueryString = (params?: QueryParams) => {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null) return;
        searchParams.append(key, String(item));
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Handle API errors với đa ngôn ngữ support
 *
 * @param error - Error object từ API
 * @param setError - React Hook Form setError function (optional)
 * @param duration - Toast duration in ms (optional)
 * @param tError - Translator function từ useTranslations("Error") (optional)
 *
 * @example
 * const tError = useTranslations("Error");
 * try {
 *   await apiCall();
 * } catch (error) {
 *   handleErrorApi({ error, setError: form.setError, tError });
 * }
 */
export const handleErrorApi = ({
  error,
  setError,
  duration,
  tError,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
  tError?: (key: string, values?: Record<string, any>) => string;
}) => {
  // Handle form validation errors (422)
  // Backend format: { error: [{path: string, message: string, ...}], message: string }
  if (error instanceof EntityError && setError) {
    const validationErrors = error.payload?.error || error.payload?.message;

    if (Array.isArray(validationErrors)) {
      validationErrors.forEach((item: any) => {
        setError(item.path, {
          type: "server",
          message: item.message,
        });
      });
      return;
    }
  }

  // Extract error message
  let errorMessage: string;

  // Check for array of errors first (new backend format)
  if (Array.isArray(error?.payload?.error)) {
    errorMessage = error.payload.error
      .map((err: any) => err.message)
      .join(", ");
  } else if (Array.isArray(error?.payload?.message)) {
    errorMessage = error.payload.message
      .map((err: any) => err.message)
      .join(", ");
  } else if (error?.payload?.message) {
    errorMessage = error.payload.message;
  } else if (error?.payload?.error) {
    errorMessage = error.payload.error;
  } else {
    errorMessage = "default";
  }

  // Translate error message if translator provided
  const translatedMessage = tError
    ? getTranslatedMessage(errorMessage, tError)
    : errorMessage;

  // Default title
  const title = tError ? tError("default") : "Lỗi";

  toast.error(title, {
    description: translatedMessage,
    duration: duration ?? 5000,
  });
};

export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};

export const decodeToken = (token: string) => {
  return jwtDecode(token) as TokenPayload;
};

const isBrowser = typeof window !== "undefined";

export const getSessionTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("sessionToken") : null;

export const setSessionTokenToLocalStorage = (value: string) => {
  if (!isBrowser) return;
  localStorage.setItem("sessionToken", value);
};

export const removeTokensFromLocalStorage = () => {
  if (!isBrowser) return;
  localStorage.removeItem("sessionToken");
};

export const clearLocalStorage = () => {
  if (!isBrowser) return;
  localStorage.clear();
};

export {
  createMessageHandler,
  getAuthMessage,
  getCrudMessage,
  getMappedMessage,
  getTranslatedMessage,
} from "./message-handler";

// Export toast helpers
export {
  showErrorToast,
  showInfoToast,
  showLoadingToast,
  showPromiseToast,
  showSuccessToast,
  showWarningToast,
} from "./toast-helper";
