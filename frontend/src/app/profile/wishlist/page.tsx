"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useTranslation } from 'react-i18next';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const { t } = useTranslation();
  const [added, setAdded] = useState<number | null>(null);

  const handleAddToCart = (item: any) => {
    addToCart(item, 1);
    setAdded(item.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center space-x-3 sticky top-16 z-30 shadow-sm">
        <Link href="/profile" className="text-gray-500 hover:text-[#ff5000] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-black text-gray-900 tracking-tight">{t('profile.wishlist')}</h1>
        <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">{items.length}</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center text-center py-24">
            <Heart size={56} className="text-gray-200 mb-4" />
            <p className="font-bold text-gray-500 text-lg">{t('wishlist.empty_title')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('wishlist.empty_sub')}</p>
            <Link href="/" className="mt-6 bg-[#ff5000] text-white font-bold px-8 py-3 rounded-full text-sm hover:bg-orange-600 transition-colors shadow-md">
              {t('wishlist.explore')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const price = parseFloat(item.price || '0');
              const discountPrice = item.discount_price ? parseFloat(item.discount_price) : null;
              const displayPrice = discountPrice ?? price;

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                  <Link href={`/product/${item.id}`} className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 relative border border-gray-100">
                    <Image
                      src={item.image_url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=200'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.id}`}>
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 hover:text-[#ff5000] transition-colors">{item.name}</h3>
                    </Link>
                    {item.category?.name && <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.category.name}</p>}
                    <p className="text-[#ff5000] font-black text-base mt-1">Q{displayPrice.toFixed(2)}</p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full transition-all shadow-sm ${added === item.id ? 'bg-green-500 text-white' : 'bg-[#111] hover:bg-[#ff5000] text-white'}`}
                      aria-label={t('product.add_to_cart')}
                    >
                      <ShoppingCart size={15} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                      aria-label="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
