import { clsx, type ClassValue } from "clsx";
import { jwtDecode } from "jwt-decode";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

import { EntityError } from "@/lib/http";
import { TokenPayload } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.message.forEach((item) => {
      setError(item.path, {
        type: "server",
        message: item.message,
      });
    });
  } else {
    const errorMessage = Array.isArray(error?.payload?.message)
      ? error.payload.message.map((err: any) => err.message).join(", ")
      : (error?.payload?.message ??
        error?.payload?.error ??
        "Lỗi không xác định");

    toast.error("Lỗi", {
      description: errorMessage,
      duration: duration ?? 5000,
    });
  }
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

export const setSessionTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("sessionToken", value);

export const removeTokensFromLocalStorage = () => {
  isBrowser && localStorage.removeItem("sessionToken");
};

export const clearLocalStorage = () => {
  isBrowser && localStorage.clear();
};
