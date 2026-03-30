"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { useGoogleLogin } from '@react-oauth/google';

function RegisterForm() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();

  const redirectTo = searchParams.get('redirect') || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      try { await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' }); } catch(err) {}

      const payload = { ...formData, phone: formData.phone ? `+502${formData.phone}` : undefined };
      const res = await api.post('/auth/register', payload);

      if (res.data.access_token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        setAuth(res.data.user, res.data.access_token);
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.register_failed'));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        const res = await api.post('/auth/google', { access_token: tokenResponse.access_token });
        setAuth(res.data.user, res.data.access_token);
        router.push(redirectTo);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al continuar con Google.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('Error al continuar con Google.'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.register_title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-medium">
            {t('auth.register_subtitle')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="sr-only">{t('auth.full_name')}</label>
              <input name="name" type="text" required value={formData.name} onChange={handleInputChange} className="appearance-none relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] focus:z-10 sm:text-sm font-bold bg-gray-50 transition-colors" placeholder={t('auth.full_name')} />
            </div>
            <div>
              <label className="sr-only">{t('auth.email')}</label>
              <input name="email" type="email" required value={formData.email} onChange={handleInputChange} className="appearance-none relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] focus:z-10 sm:text-sm font-bold bg-gray-50 transition-colors" placeholder={t('auth.email')} />
            </div>
            <div>
              <label className="sr-only">{t('auth.password')}</label>
              <input name="password" type="password" required minLength={8} value={formData.password} onChange={handleInputChange} className="appearance-none relative block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] focus:z-10 sm:text-sm font-bold bg-gray-50 transition-colors" placeholder={t('auth.password_hint')} />
            </div>
            <div>
              <label className="sr-only">Teléfono</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-500 text-sm font-bold">🇬🇹 +502</span>
                <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} maxLength={8} pattern="[2-7][0-9]{7}" className="appearance-none block w-full px-4 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] sm:text-sm font-bold bg-gray-50 transition-colors" placeholder="Número de teléfono (opcional)" />
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-full text-white bg-[#111] hover:bg-[#ff5000] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5000] shadow-md hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5 transform">
              {loading ? t('auth.creating') : t('auth.register_btn')}
            </button>
          </div>
        </form>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-400 font-medium">o</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-200 rounded-full text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          {googleLoading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 font-medium">
            {t('auth.have_account')}{' '}
            <Link href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="font-extrabold text-[#ff5000] hover:text-[#e64800]">
              {t('auth.sign_in_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
