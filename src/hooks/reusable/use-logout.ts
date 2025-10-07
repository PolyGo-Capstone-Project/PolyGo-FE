// src/hooks/reusable/use-logout.ts
"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthStore } from "@/hooks";
import {
  removeTokensFromLocalStorage,
  showErrorToast,
  showSuccessToast,
} from "@/lib/utils";

/**
 * Custom hook for logout functionality
 * - Calls /api/auth/logout to remove cookie from server-side
 * - Removes tokens from localStorage
 * - Resets auth store
 * - Shows success/error toast
 * - Redirects to login page
 */
export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const reset = useAuthStore((state) => state.reset);
  const disconnectSocket = useAuthStore((state) => state.disconnectSocket);

  const logout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // 1. Disconnect socket if connected
      disconnectSocket();

      // 2. Call Next.js API route to remove cookie from server-side
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // 3. Remove tokens from localStorage
      removeTokensFromLocalStorage();

      // 4. Reset auth store
      reset();

      // 5. Show success toast
      showSuccessToast("Logout", tSuccess);

      // 6. Redirect to login page
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error("Logout error:", error);

      // Show error toast
      showErrorToast("ServerError", tError);

      // Even if API fails, still cleanup local state
      removeTokensFromLocalStorage();
      reset();
      router.push(`/${locale}/login`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
};
