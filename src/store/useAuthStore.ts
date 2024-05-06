import { create } from "zustand";

export type AuthStatus = "authenticated" | "unauthenticated";

type AuthState = {
  triggeredAuthError: boolean;
  setTriggeredAuthError: (value: boolean) => void;
  authStatus: AuthStatus | null;
  setAuthStatus: (status: AuthStatus) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  triggeredAuthError: false,
  setTriggeredAuthError: (value: boolean) =>
    set((state) => ({
      ...state,
      triggeredAuthError: value,
    })),
  authStatus: null, // InitializeAuthStatus에서 초기화됨
  setAuthStatus: (status: AuthStatus) =>
    set((state) => ({
      ...state,
      authStatus: status,
    })),
}));
