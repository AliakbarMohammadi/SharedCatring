/**
 * Auth Store - Zustand
 * استور احراز هویت
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  avatar?: string;
}

export type UserRole = 
  | 'super_admin' 
  | 'catering_admin' 
  | 'kitchen_staff' 
  | 'company_admin' 
  | 'employee' 
  | 'personal_user'
  | 'corporate_user'
  | 'admin';

/**
 * Role-based redirect paths
 * مسیرهای ریدایرکت بر اساس نقش
 */
export const roleRedirectPaths: Record<UserRole, string> = {
  super_admin: '/admin',
  catering_admin: '/admin',
  admin: '/admin',
  kitchen_staff: '/admin', // TODO: Create /kitchen/queue page
  company_admin: '/company',
  employee: '/menu',
  corporate_user: '/menu',
  personal_user: '/menu',
};

/**
 * Get redirect path based on user role
 * دریافت مسیر ریدایرکت بر اساس نقش کاربر
 */
export function getRedirectPath(role: UserRole): string {
  return roleRedirectPaths[role] || '/menu';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      login: (user, accessToken, refreshToken) => {
        // Set cookie for middleware (server-side route protection)
        if (typeof document !== 'undefined') {
          const authData = JSON.stringify({
            state: {
              isAuthenticated: true,
              user: { role: user.role },
            },
          });
          document.cookie = `catering-auth=${encodeURIComponent(authData)}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        }
        
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Clear cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'catering-auth=; path=/; max-age=0';
        }
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),
      
      setHasHydrated: (state) => set({ _hasHydrated: state, isLoading: false }),
    }),
    {
      name: 'catering-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsAdmin = (state: AuthState) => 
  state.user?.role === 'admin' || state.user?.role === 'super_admin' || state.user?.role === 'catering_admin';
export const selectIsCompanyAdmin = (state: AuthState) => 
  state.user?.role === 'company_admin' || selectIsAdmin(state);
export const selectIsCorporateUser = (state: AuthState) => 
  state.user?.role === 'corporate_user' || state.user?.role === 'employee' || state.user?.role === 'company_admin';
export const selectIsEmployee = (state: AuthState) =>
  state.user?.role === 'employee' || state.user?.role === 'corporate_user';
export const selectIsKitchenStaff = (state: AuthState) =>
  state.user?.role === 'kitchen_staff';

/**
 * Check if user has access to a specific route
 * بررسی دسترسی کاربر به یک مسیر خاص
 */
export function hasRouteAccess(role: UserRole | undefined, pathname: string): boolean {
  if (!role) return false;
  
  const adminRoles: UserRole[] = ['super_admin', 'catering_admin', 'admin'];
  const companyRoles: UserRole[] = ['company_admin'];
  const kitchenRoles: UserRole[] = ['kitchen_staff'];
  const userRoles: UserRole[] = ['employee', 'personal_user', 'corporate_user'];
  
  if (pathname.startsWith('/admin')) {
    return adminRoles.includes(role);
  }
  if (pathname.startsWith('/company')) {
    return companyRoles.includes(role) || adminRoles.includes(role);
  }
  if (pathname.startsWith('/kitchen')) {
    return kitchenRoles.includes(role) || adminRoles.includes(role);
  }
  // User routes accessible by all authenticated users
  return true;
}
