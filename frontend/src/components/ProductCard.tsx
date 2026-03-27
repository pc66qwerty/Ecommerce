"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useToastStore } from '@/store/useToastStore';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const { show: showToast } = useToastStore();
  const { t } = useTranslation();

  const price = parseFloat(product.price || '0');
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const displayPrice = discountPrice ?? price;
  const originalPrice = discountPrice ? price : price * 1.6;
  const discountPercent = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
  const inWishlist = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100 relative"
    >
      <Link href={`/product/${product.id}`} className="relative h-48 sm:h-56 w-full block overflow-hidden bg-gray-50">
        <Image
          src={product.image_url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=400'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        {/* Discount Badge */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-black px-2 py-1 rounded-full shadow-md z-10 tracking-wider">
          -{discountPercent}%
        </div>
        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:scale-110 active:scale-90"
          aria-label="Toggle wishlist"
        >
          <Heart size={14} fill={inWishlist ? '#ff5000' : 'none'} color={inWishlist ? '#ff5000' : '#999'} strokeWidth={2} />
        </button>
        {/* Scarcity Badge */}
        {product.stock < 15 && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1.5 rounded-lg text-center flex items-center justify-center space-x-1">
            <span className="animate-pulse">🔥</span>
            <span>{t('product.almost_gone', { stock: product.stock })}</span>
          </div>
        )}
        {/* Hover info overlay */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
          {product.description && (
            <p className="text-white text-[11px] font-medium line-clamp-3 leading-relaxed">{product.description}</p>
          )}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
            <span className="text-[10px] text-gray-300 font-bold">Stock: {product.stock} uds.</span>
            {product.category?.name && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">{product.category.name}</span>}
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-grow relative">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1.5 group-hover:text-[#ff5000] transition-colors leading-snug">{product.name}</h3>
        </Link>

        {/* Ratings */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex text-[#ff5000]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="currentColor" />
            ))}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">(4.8) • 2k+ sold</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 line-through font-medium leading-none mb-1">Q{originalPrice.toFixed(2)}</span>
            <div className="flex items-center">
              <span className="text-sm font-bold text-[#ff5000] mr-0.5">Q</span>
              <span className="text-xl font-black text-[#ff5000] leading-none">{displayPrice.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product, 1); showToast(`${product.name} agregado al carrito`); }}
            className="w-9 h-9 flex items-center justify-center bg-[#111] hover:bg-[#ff5000] text-white rounded-full transition-colors active:scale-90 shadow-md transform group-hover:rotate-12 duration-300"
            aria-label={t('product.add_to_cart')}
          >
            <ShoppingCart size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
