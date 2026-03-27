"use client";

import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const displayItems = items;

  const subtotal = displayItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-extrabold mb-6 text-gray-900">{t('cart.title')} ({displayItems.length})</h1>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
          {displayItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4 font-medium">{t('cart.empty')}</p>
              <Link href="/" className="bg-[#ff5000] text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all inline-block">
                {t('cart.start_shopping')}
              </Link>
            </div>
          ) : (
            <div className="divide-y border-t border-b sm:border-none">
              {displayItems.map((item: any) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0 border border-gray-100">
                      <img src={item.image_url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-[2] min-w-0">
                      <h3 className="font-semibold text-sm md:text-base text-gray-900 line-clamp-2 leading-snug">{item.name}</h3>
                      <p className="text-[#ff5000] font-extrabold mt-2 text-lg">Q{item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full mt-2 sm:mt-0">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                        className="w-10 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 font-bold transition-colors"
                      >-</button>
                      <span className="w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-10 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 font-bold transition-colors"
                      >+</button>
                    </div>
                    <button onClick={() => removeItem(item.product_id)} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {displayItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md ml-auto">
            <h2 className="font-bold text-lg border-b pb-4 mb-4">{t('cart.order_summary')}</h2>
            <div className="flex justify-between mb-3 text-sm font-medium text-gray-600">
              <span>{t('cart.items_total')}</span>
              <span>Q{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-sm font-medium text-gray-600">
              <span>{t('cart.shipping')}</span>
              <span className="text-green-600 font-bold">{t('cart.free')}</span>
            </div>
            <div className="flex justify-between mb-8 font-black text-2xl pt-4 border-t border-dashed border-gray-300">
              <span>{t('cart.total')}</span>
              <span className="text-[#ff5000]">Q{subtotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="block text-center w-full bg-[#ff5000] text-white font-extrabold py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform uppercase tracking-wider text-sm">
              {t('cart.checkout_btn')} (Q{subtotal.toFixed(2)})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
