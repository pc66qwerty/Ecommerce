"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Clock, Mail, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';

export default function SupportPage() {
  const { t } = useTranslation();
  const [whatsappNumber, setWhatsappNumber] = useState('50254922665');

  useEffect(() => {
    api.get('/settings/whatsapp').then(res => {
      if (res.data.whatsapp_number) setWhatsappNumber(res.data.whatsapp_number);
    }).catch(() => {});
  }, []);

  const faqs = [
    { q: t('support.faq1_q'), a: t('support.faq1_a') },
    { q: t('support.faq2_q'), a: t('support.faq2_a') },
    { q: t('support.faq3_q'), a: t('support.faq3_a') },
    { q: t('support.faq4_q'), a: t('support.faq4_a') },
  ];

  const openWhatsApp = () => {
    const msg = encodeURIComponent(t('support.whatsapp_greeting'));
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center space-x-3 sticky top-16 z-30 shadow-sm">
        <Link href="/profile" className="text-gray-500 hover:text-[#ff5000] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-black text-gray-900 tracking-tight">{t('profile.support')}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Contact options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={openWhatsApp}
            className="bg-[#25D366] hover:bg-[#1ebc57] text-white rounded-2xl p-5 flex items-center gap-4 shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageCircle size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-base">{t('support.whatsapp_title')}</p>
              <p className="text-sm opacity-90 font-medium">{t('support.whatsapp_sub')}</p>
            </div>
          </button>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock size={22} className="text-[#ff5000]" />
            </div>
            <div>
              <p className="font-black text-sm text-gray-900">{t('support.hours_title')}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{t('support.hours_value')}</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-black text-gray-900 text-sm uppercase tracking-wider">{t('support.faq_title')}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                  <span className="font-bold text-sm text-gray-800">{faq.q}</span>
                  <ChevronRight size={16} className="text-gray-400 group-open:rotate-90 transition-transform shrink-0 ml-3" />
                </summary>
                <p className="px-5 pb-5 text-sm text-gray-500 font-medium leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
