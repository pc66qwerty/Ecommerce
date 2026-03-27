"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User, Package } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { label: t('nav.home'), href: '/', icon: Home },
    { label: t('nav.categories'), href: '/#categories', icon: Search },
    { label: t('nav.tracking'), href: '/orders/tracking', icon: Package },
    { label: t('nav.cart'), href: '/cart', icon: ShoppingCart, badge: cartCount },
    { label: t('nav.you'), href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 py-2 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link key={item.label} href={item.href} className={`flex flex-col items-center justify-center w-full relative transition-all duration-300 ${isActive ? 'text-[#ff5000] scale-110' : 'text-gray-500 hover:text-gray-900'}`}>
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
