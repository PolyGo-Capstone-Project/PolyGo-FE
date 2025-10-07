"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useRef } from "react";

import { useAuthStore } from "@/hooks";
import { decodeToken, getSessionTokenFromLocalStorage } from "@/lib/utils";

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
  const count = useRef(0);

  useEffect(() => {
    if (count.current === 0) {
      const sessionToken = getSessionTokenFromLocalStorage();
      if (sessionToken) {
        setRole(decodeToken(sessionToken).Role);
        // setSocket(generateSocketInstance(accessToken));
      }
      count.current++;
    }
  }, [setRole, setSocket]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <RefreshToken /> */}
      {/* <ListenLogoutSocket /> */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
