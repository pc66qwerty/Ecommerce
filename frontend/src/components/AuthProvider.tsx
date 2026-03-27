"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import api from '@/lib/axios';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { isAuthenticated, isLoading } = useAuthStore();
  const { show: showToast } = useToastStore();
  const notified = useRef(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !notified.current) {
      notified.current = true;
      api.get('/my-coupons').then(res => {
        const count = res.data?.length ?? 0;
        if (count > 0) {
          showToast(`🎟️ Tienes ${count} cupón${count > 1 ? 'es' : ''} disponible${count > 1 ? 's' : ''}`, 'info');
        }
      }).catch(() => {});
    }
    if (!isAuthenticated) {
      notified.current = false;
    }
  }, [isLoading, isAuthenticated, showToast]);

  return <>{children}</>;
}
