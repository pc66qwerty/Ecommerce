"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag, Sparkles, Copy, CheckCheck, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  expires_at: string | null;
  user_id: number | null;
}

export default function CouponsPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [publicCoupons, setPublicCoupons] = useState<Coupon[]>([]);
  const [myCoupons, setMyCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [tab, setTab] = useState<'mine' | 'public'>('mine');

  useEffect(() => {
    const requests: Promise<any>[] = [api.get('/coupons/public')];
    if (!isLoading && isAuthenticated) {
      requests.push(api.get('/my-coupons'));
    }
    Promise.allSettled(requests).then(results => {
      if (results[0].status === 'fulfilled') setPublicCoupons(results[0].value.data);
      if (results[1] && results[1].status === 'fulfilled') setMyCoupons(results[1].value.data);
      setLoading(false);
    });
  }, [isLoading, isAuthenticated]);

  const handleCopy = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopiedId(coupon.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') return `${coupon.discount_value}% off`;
    return `Q${coupon.discount_value} off`;
  };

  const formatExpiry = (expires_at: string | null) => {
    if (!expires_at) return null;
    return new Date(expires_at).toLocaleDateString('es-GT');
  };

  const activeCoupons = tab === 'mine' ? myCoupons : publicCoupons;

  const CouponCard = ({ coupon }: { coupon: Coupon }) => (
    <div className="bg-white rounded-2xl border border-dashed border-[#ff5000]/40 shadow-sm overflow-hidden">
      <div className="flex">
        <div className="w-2 bg-linear-to-b from-[#ff5000] to-[#ff8c00] shrink-0" />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => handleCopy(coupon)}
                className="flex items-center gap-2 group mb-2"
                title="Click to copy"
              >
                <span className="text-2xl font-black text-gray-900 tracking-widest font-mono">
                  {coupon.code}
                </span>
                {copiedId === coupon.id ? (
                  <CheckCheck size={18} className="text-green-500 shrink-0" />
                ) : (
                  <Copy size={16} className="text-gray-400 group-hover:text-[#ff5000] transition-colors shrink-0" />
                )}
              </button>
              {copiedId === coupon.id && (
                <p className="text-xs text-green-600 font-bold -mt-1 mb-1">¡Copiado!</p>
              )}
              {coupon.description && (
                <p className="text-sm text-gray-600 font-medium">{coupon.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#ff5000] text-xs font-black uppercase tracking-wider">
                  {formatDiscount(coupon)}
                </span>
                {coupon.min_purchase > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-500 text-xs font-bold">
                    Min. Q{coupon.min_purchase}
                  </span>
                )}
                {coupon.expires_at && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold">
                    Vence {formatExpiry(coupon.expires_at)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleCopy(coupon)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                copiedId === coupon.id ? 'bg-green-500 text-white' : 'bg-[#ff5000] text-white hover:bg-orange-600'
              }`}
            >
              {copiedId === coupon.id ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center space-x-3 sticky top-16 z-30 shadow-sm">
        <Link href="/profile" className="text-gray-500 hover:text-[#ff5000] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-black text-gray-900 tracking-tight">{t('profile.my_coupons')}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Promo Banner */}
        <div className="bg-linear-to-r from-[#ff5000] to-[#ff8c00] rounded-2xl p-5 mb-6 text-white shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} />
            <span className="font-black text-sm uppercase tracking-wider">{t('coupons.promo_title')}</span>
          </div>
          <p className="text-sm font-medium opacity-90">{t('coupons.promo_sub')}</p>
        </div>

        {/* Tabs */}
        {isAuthenticated && (
          <div className="flex bg-white rounded-2xl border border-gray-100 p-1 mb-6 shadow-sm">
            <button
              onClick={() => setTab('mine')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'mine' ? 'bg-[#ff5000] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Gift size={15} /> Mis Cupones {myCoupons.length > 0 && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === 'mine' ? 'bg-white/30' : 'bg-orange-100 text-[#ff5000]'}`}>{myCoupons.length}</span>}
            </button>
            <button
              onClick={() => setTab('public')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'public' ? 'bg-[#ff5000] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Tag size={15} /> Promociones {publicCoupons.length > 0 && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === 'public' ? 'bg-white/30' : 'bg-orange-100 text-[#ff5000]'}`}>{publicCoupons.length}</span>}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#ff5000] border-t-transparent animate-spin rounded-full"></div>
          </div>
        ) : activeCoupons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <Tag size={28} className="text-[#ff5000]" />
            </div>
            <p className="font-bold text-gray-800 text-base">
              {tab === 'mine' ? 'No tienes cupones personales' : t('coupons.empty_title')}
            </p>
            <p className="text-sm text-gray-400 font-medium mt-1 max-w-xs">
              {tab === 'mine' ? 'Crea una cuenta nueva para recibir un cupón de bienvenida.' : t('coupons.empty_sub')}
            </p>
            <Link href="/" className="mt-6 bg-[#ff5000] text-white font-bold px-8 py-3 rounded-full text-sm hover:bg-orange-600 transition-colors shadow-md">
              {t('coupons.shop_now')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeCoupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} />)}
          </div>
        )}
      </div>
    </div>
  );
}
