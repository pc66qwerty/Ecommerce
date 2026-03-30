"use client";

import Link from 'next/link';
import { ShoppingCart, Search, User, Globe, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useSearchStore } from '@/store/useSearchStore';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { searchProducts, getProductsFirstPage } from '@/lib/productsCache';

interface Product { id: number; name: string; image_url?: string; price: string; discount_price?: string; }

function SearchBox({ placeholder }: { placeholder: string }) {
  const { setQuery } = useSearchStore();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    getProductsFirstPage(); // warm the cache, no-op if already loaded
    if (inputValue.trim()) setShowDropdown(true);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputValue.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await searchProducts(inputValue);
      setSuggestions(results);
      setShowDropdown(true);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputValue]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const commit = useCallback(() => {
    setQuery(inputValue.trim());
    setShowDropdown(false);
  }, [inputValue, setQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') { setInputValue(''); setQuery(''); setShowDropdown(false); }
  };

  const clear = () => { setInputValue(''); setQuery(''); setSuggestions([]); };

  const displayPrice = (p: Product) => p.discount_price ? parseFloat(p.discount_price) : parseFloat(p.price);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-[#ff5000] transition-shadow text-sm font-medium"
          placeholder={placeholder}
        />
        {inputValue && (
          <button onClick={clear} className="absolute right-9 top-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        )}
        <button onClick={commit} className="absolute right-3 top-2 text-gray-400 hover:text-[#ff5000] transition-colors">
          <Search size={20} />
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {suggestions.map(p => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              onClick={() => { setShowDropdown(false); setInputValue(''); }}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                <p className="text-xs font-black text-[#ff5000]">Q{displayPrice(p).toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const { setQuery } = useSearchStore();
  const [mounted, setMounted] = useState(false);
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();

  useEffect(() => { setMounted(true); }, []);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center" onClick={() => setQuery('')}>
            <div className="flex flex-col leading-none">
              <span className="text-3xl font-extrabold text-[#ff5000] tracking-tighter">MIAN</span>
              <span className="text-[9px] font-bold text-[#111] tracking-widest uppercase">Iluminando tu Camino</span>
            </div>
          </Link>

          {/* Search — desktop */}
          <div className="flex-1 max-w-2xl px-8 hidden md:block">
            <SearchBox placeholder={t('nav.search')} />
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-6">
            <button onClick={toggleLanguage} className="text-gray-700 hover:text-[#ff5000] transition-colors flex items-center flex-col outline-none">
              <Globe size={20} className="mb-1" />
              <span className="text-[10px] font-black tracking-wider uppercase">{i18n.language === 'en' ? 'EN' : 'ES'}</span>
            </button>

            {mounted && user ? (
              <div className="hidden md:flex items-center space-x-6">
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-gray-700 hover:text-[#ff5000] transition-colors flex items-center flex-col">
                    <div className="bg-red-50 text-red-600 rounded-full p-1 border border-red-100 shadow-sm"><User size={16} /></div>
                    <span className="text-[10px] font-black uppercase mt-1 tracking-wider text-red-600">Admin</span>
                  </Link>
                )}
                <Link href="/profile" className="text-gray-700 hover:text-[#ff5000] transition-colors flex items-center flex-col">
                  <User size={24} />
                  <span className="text-xs font-bold mt-1 max-w-20 truncate">{user.name.split(' ')[0]}</span>
                </Link>
              </div>
            ) : (
              <Link href="/auth/login" className="text-gray-700 hover:text-[#ff5000] transition-colors hidden md:flex items-center flex-col">
                <User size={24} />
                <span className="text-xs font-medium mt-1">{t('nav.login')}</span>
              </Link>
            )}

            <Link href="/cart" className="text-gray-700 hover:text-[#ff5000] transition-colors relative flex items-center flex-col">
              <ShoppingCart size={24} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#ff5000] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
              <span className="text-xs font-medium mt-1">{t('nav.cart')}</span>
            </Link>
          </div>
        </div>

        {/* Search — mobile */}
        <div className="md:hidden pb-3">
          <SearchBox placeholder={t('nav.search')} />
        </div>
      </div>
    </nav>
  );
}
