import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: any, token: string) => void;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_role', user.role);
        }
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      checkAuth: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // If we already have cached user data, don't block the UI —
        // just validate silently in the background.
        const hasCachedUser = !!get().user;
        if (!hasCachedUser) set({ isLoading: true });

        try {
          const res = await api.get('/user');
          set({ user: res.data, token, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          if (error.response?.status === 401) {
            get().logout();
          } else {
            set({ isLoading: false });
          }
        }
      },

      logout: async () => {
        try { await api.post('/logout'); } catch {}
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_role');
        }
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        if (typeof window !== 'undefined') window.location.href = '/auth/login';
      },
    }),
    {
      name: 'mian-auth',
      // Only persist user data — isLoading is always false on hydration
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
