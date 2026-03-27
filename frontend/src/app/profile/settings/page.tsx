"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Lock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { user, setAuth, token } = useAuthStore();
  const { t } = useTranslation();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess(false);
    try {
      const res = await api.put('/user/profile', profileForm);
      setAuth(res.data, token!);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || t('settings.save_error'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess(false);
    try {
      await api.put('/user/profile', passwordForm);
      setPasswordForm({ current_password: '', password: '' });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || t('settings.save_error'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center space-x-3 sticky top-16 z-30 shadow-sm">
        <Link href="/profile" className="text-gray-500 hover:text-[#ff5000] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-black text-gray-900 tracking-tight">{t('profile.settings')}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-[#ff5000]" />
            <h2 className="font-bold text-gray-900">{t('settings.personal_info')}</h2>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            {profileError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{profileError}</div>}
            {profileSuccess && (
              <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 flex items-center gap-2">
                <CheckCircle size={16} /> {t('settings.saved')}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.full_name')}</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] outline-none transition-colors text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-[#111] hover:bg-[#ff5000] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {profileLoading ? t('settings.saving') : t('settings.save_profile')}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={18} className="text-[#ff5000]" />
            <h2 className="font-bold text-gray-900">{t('settings.change_password')}</h2>
          </div>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {passwordError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{passwordError}</div>}
            {passwordSuccess && (
              <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 flex items-center gap-2">
                <CheckCircle size={16} /> {t('settings.password_changed')}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t('settings.current_password')}</label>
              <input
                type="password"
                required
                value={passwordForm.current_password}
                onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t('settings.new_password')}</label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordForm.password}
                onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] outline-none transition-colors text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-[#111] hover:bg-[#ff5000] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {passwordLoading ? t('settings.saving') : t('settings.save_password')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
