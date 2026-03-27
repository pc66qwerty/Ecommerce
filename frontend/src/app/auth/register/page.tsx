"use client";

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();

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

      const res = await api.post('/auth/register', formData);

      if (res.data.access_token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        setAuth(res.data.user, res.data.access_token);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.register_failed'));
    } finally {
      setLoading(false);
    }
  };

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
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-full text-white bg-[#111] hover:bg-[#ff5000] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff5000] shadow-md hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5 transform">
              {loading ? t('auth.creating') : t('auth.register_btn')}
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 font-medium">
            {t('auth.have_account')}{' '}
            <Link href="/auth/login" className="font-extrabold text-[#ff5000] hover:text-[#e64800]">
              {t('auth.sign_in_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
