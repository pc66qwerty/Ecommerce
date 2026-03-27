"use client";

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });

      if (res.data.access_token) {
        setAuth(res.data.user, res.data.access_token);

        if (res.data.user.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.login_title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-medium">
            {t('auth.login_subtitle')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="sr-only">{t('auth.email')}</label>
              <input name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] focus:z-10 sm:text-sm font-bold bg-gray-50 transition-colors" placeholder={t('auth.email')} />
            </div>
            <div>
              <label className="sr-only">{t('auth.password')}</label>
              <input name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] focus:z-10 sm:text-sm font-bold bg-gray-50 transition-colors" placeholder={t('auth.password')} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-[#ff5000] focus:ring-[#ff5000] border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-bold">
                {t('auth.keep_signed')}
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-bold text-[#ff5000] hover:text-[#e64800]">
                {t('auth.forgot_password')}
              </a>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-full text-white bg-[#111] hover:bg-[#ff5000] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5000] shadow-md hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5 transform">
              {loading ? t('auth.signing_in') : t('auth.sign_in_btn')}
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 font-medium">
            {t('auth.no_account')}{' '}
            <Link href="/auth/register" className="font-extrabold text-[#ff5000] hover:text-[#e64800]">
              {t('auth.register_now')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
