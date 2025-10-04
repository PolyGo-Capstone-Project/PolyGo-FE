import type { Socket } from "socket.io-client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { removeTokensFromLocalStorage } from "@/lib/utils";
import { RoleType } from "@/types";

interface AuthState {
  isAuth: boolean;
  role: RoleType | undefined;
  setRole: (role?: RoleType | undefined) => void;
  socket: Socket | undefined;
  setSocket: (socket?: Socket | undefined) => void;
  disconnectSocket: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuth: false,
      role: undefined,
      setRole: (role) => {
        set({ role, isAuth: Boolean(role) });
        if (!role) {
          removeTokensFromLocalStorage();
        }
      },
      socket: undefined,
      setSocket: (socket) => set({ socket }),
      disconnectSocket: () =>
        set((state) => {
          state.socket?.disconnect();
          return { socket: undefined };
        }),
      reset: () => set({ isAuth: false, role: undefined, socket: undefined }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuth: state.isAuth,
        role: state.role,
      }),
    }
  )
);
