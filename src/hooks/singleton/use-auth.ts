import type { Socket } from "socket.io-client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Role } from "@/constants";
import { removeTokensFromLocalStorage } from "@/lib/utils";
import { RoleType } from "@/types";

interface AuthState {
  isAuth: boolean;
  role: RoleType | undefined;
  setRole: (role?: RoleType | undefined) => void;
  socket: Socket | undefined;
  setSocket: (socket?: Socket | undefined) => void;
  disconnectSocket: () => void;
  isNewUser: boolean;
  setIsNewUser: (isNew: boolean) => void;
  reset: () => void;

  // Computed helpers
  isAdmin: () => boolean;
  isUser: () => boolean;
  canAccessAdminRoutes: () => boolean;
  canAccessUserRoutes: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
      isNewUser: false,
      setIsNewUser: (isNew) => set({ isNewUser: isNew }),

      // Computed helpers
      isAdmin: () => get().role === Role.Admin,
      isUser: () => get().role === Role.User,
      canAccessAdminRoutes: () => get().isAuth && get().role === Role.Admin,
      canAccessUserRoutes: () => get().isAuth && get().role === Role.User,
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
