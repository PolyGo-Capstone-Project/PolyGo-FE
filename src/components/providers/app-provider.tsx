"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useRef } from "react";

import { useAuthStore } from "@/hooks";
import {
  decodeToken,
  getSessionTokenFromLocalStorage,
  removeTokensFromLocalStorage,
} from "@/lib/utils";

// Default
// staleTime: 0
// gc: 5 phút (5 * 1000* 60)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setRole = useAuthStore((state) => state.setRole);
  const setSocket = useAuthStore((state) => state.setSocket);
  const reset = useAuthStore((state) => state.reset);
  const count = useRef(0);

  useEffect(() => {
    if (count.current === 0) {
      const sessionToken = getSessionTokenFromLocalStorage();
      if (sessionToken) {
        const decode = decodeToken(sessionToken);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decode && decode.exp > currentTime) {
          setRole(decodeToken(sessionToken).Role);
          // setSocket(generateSocketInstance(accessToken));
        } else {
          console.warn("Token expired, clearing auth state");
          removeTokensFromLocalStorage();
          reset();
        }
      }
      count.current++;
    }
  }, [reset, setRole, setSocket]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <RefreshToken /> */}
      {/* <ListenLogoutSocket /> */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
