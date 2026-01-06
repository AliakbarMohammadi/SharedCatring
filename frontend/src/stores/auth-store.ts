import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, AuthTokens } from "@/types";
import apiClient from "@/lib/api-client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await apiClient.post("/auth/login", { email, password });
        const { user, tokens } = response.data.data;

        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);

        set({ user, isAuthenticated: true, isLoading: false });
      },

      register: async (data: RegisterData) => {
        const response = await apiClient.post("/auth/register", data);
        const { user, tokens } = response.data.data;

        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);

        set({ user, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        try {
          await apiClient.post("/auth/logout");
        } catch (error) {
          // Ignore logout errors
        } finally {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user, isLoading: false });
      },

      checkAuth: async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        try {
          const response = await apiClient.post("/auth/verify-token", { token });
          if (response.data.data?.user) {
            set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
