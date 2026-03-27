"use client";

import { useEffect, useState } from 'react';
import { User, Package, Heart, Tag, Settings, HeadphonesIcon, LogOut, ChevronRight, MapPin, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
        setLoadingData(true);
        api.get('/my-orders')
           .then(res => setOrders(res.data))
           .catch(err => console.error(err))
           .finally(() => setLoadingData(false));
    }
  }, [isLoading, isAuthenticated]);

  const handleLogout = () => {
    logout();
  };

  if (isLoading || loadingData) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#ff5000] border-t-transparent animate-spin rounded-full"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header Profile Info */}
      <div className="bg-gradient-to-r from-[#ff5000] to-[#ff8c00] pt-8 pb-16 px-6 text-white rounded-b-[40px] shadow-md relative">
        <div className="max-w-3xl mx-auto flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#ff5000] overflow-hidden border-2 border-white shadow-inner">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{user ? user.name : t('profile.guest')}</h1>
             <p className="text-sm opacity-90 font-medium">{t('profile.enthusiast')}</p>
          </div>
          <div className="ml-auto">
            {!user ? (
                <Link href="/auth/login" className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-full text-xs font-bold backdrop-blur-sm transition-colors shadow-sm uppercase tracking-wider">
                {t('profile.sign_in')}
                </Link>
            ) : (
                 <span className="bg-black/20 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-white/20 shadow-sm">{user.role}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm p-4 flex justify-around text-center border border-gray-100">
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-gray-900">12</span>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mt-1">{t('profile.coupons')}</span>
          </div>
          <div className="w-px bg-gray-100"></div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-gray-900">5</span>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mt-1">{t('profile.following')}</span>
          </div>
          <div className="w-px bg-gray-100"></div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-gray-900">{orders.length}</span>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mt-1">{t('profile.orders')}</span>
          </div>
        </div>
      </div>

      {user && orders.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 mt-8">
             <div className="flex justify-between items-baseline mb-3">
                 <h3 className="font-extrabold text-gray-900 text-sm tracking-wide uppercase">{t('profile.recent_orders')}</h3>
                 <Link href="/profile/orders" className="text-[10px] font-bold text-[#ff5000] hover:underline">{t('profile.view_all')}</Link>
             </div>
             <div className="space-y-3">
                 {orders.slice(0, 3).map(o => (
                     <div key={o.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group cursor-pointer hover:border-[#ff5000] transition-colors" onClick={() => router.push('/profile/orders')}>
                         <div>
                            <p className="text-xs font-black text-gray-900">{o.reference_number}</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1">{new Date(o.created_at).toLocaleDateString()} • Q{o.total_amount}</p>
                         </div>
                         <div className="text-right">
                             <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md mb-1 inline-block shadow-sm border ${o.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-[#ff5000] border-orange-100'}`}>
                                 {o.status}
                             </span>
                             <div className="text-[10px] font-bold text-gray-400 group-hover:text-[#ff5000] transition-colors flex items-center justify-end">{t('profile.track')} <ChevronRight size={10} className="ml-0.5" /></div>
                         </div>
                     </div>
                 ))}
             </div>
          </div>
      )}

      {/* Menu List */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-4">
        {user?.role === 'admin' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#ff5000]/30">
            <MenuLink href="/admin" icon={LayoutDashboard} label="Panel Administrativo" subtitle="Gestiona productos, pedidos y usuarios" iconColor="text-[#ff5000]" />
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <MenuLink href="/profile/orders" icon={Package} label={t('profile.my_orders')} subtitle={t('profile.my_orders_sub')} iconColor="text-blue-500" />
          <MenuLink href="/orders/tracking" icon={MapPin} label="Rastrear Pedido" subtitle="Consulta el estado de tu envío" iconColor="text-[#ff5000]" />
          <MenuLink href="/profile/wishlist" icon={Heart} label={t('profile.wishlist')} subtitle={t('profile.wishlist_sub')} iconColor="text-red-500" />
          <MenuLink href="/profile/coupons" icon={Tag} label={t('profile.my_coupons')} subtitle={t('profile.my_coupons_sub')} iconColor="text-orange-500" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <MenuLink href="/profile/settings" icon={Settings} label={t('profile.settings')} subtitle={t('profile.settings_sub')} iconColor="text-gray-600" />
          <MenuLink href="/profile/support" icon={HeadphonesIcon} label={t('profile.support')} subtitle={t('profile.support_sub')} iconColor="text-green-500" />
        </div>

        {user && (
            <button onClick={handleLogout} className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-center text-red-500 font-bold hover:bg-red-50 transition-colors">
            <LogOut size={18} className="mr-2" /> {t('profile.sign_out')}
            </button>
        )}
      </div>
    </div>
  );
}

function MenuLink({ href, icon: Icon, label, subtitle, iconColor }: { href: string, icon: any, label: string, subtitle?: string, iconColor?: string }) {
  return (
    <Link href={href} className="flex items-center p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors group last:border-b-0">
      <div className={`mr-4 ${iconColor || 'text-gray-600'} bg-gray-50 p-2 rounded-full group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-800">{label}</h3>
        {subtitle && <p className="text-[11px] text-gray-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
      <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
    </Link>
  );
}
