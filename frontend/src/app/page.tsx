"use client";

import { useEffect, useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import HeroCarousel from '@/components/HeroCarousel';
import CategorySlider from '@/components/CategorySlider';
import api from '@/lib/axios';
import { primeProductsCache } from '@/lib/productsCache';
import { Truck, ShieldCheck, Tag, SearchX, SlidersHorizontal, X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchStore } from '@/store/useSearchStore';
import FlashSaleCountdown from '@/components/FlashSaleCountdown';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { query } = useSearchStore();
  const [sortBy, setSortBy] = useState('newest');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();
  const recentlyViewed = useRecentlyViewed();
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const data = res.data.data || res.data;
        setProducts(data);
        primeProductsCache(data); // share with Navbar search cache
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = products;

    if (selectedCategory !== null) {
      result = result.filter(p => p.category_id === selectedCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
      );
    }

    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    if (priceMin !== '') {
      result = result.filter(p => (p.discount_price || p.price) >= parseFloat(priceMin));
    }

    if (priceMax !== '') {
      result = result.filter(p => (p.discount_price || p.price) <= parseFloat(priceMax));
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return (a.discount_price || a.price) - (b.discount_price || b.price);
        case 'price_desc': return (b.discount_price || b.price) - (a.discount_price || a.price);
        case 'rating': return (b.average_rating || 0) - (a.average_rating || 0);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [products, selectedCategory, query, sortBy, priceMin, priceMax, inStockOnly]);

  useEffect(() => { setVisibleCount(12); }, [selectedCategory, query, sortBy, priceMin, priceMax, inStockOnly]);

  const isFiltering = selectedCategory !== null || query.trim() !== '';
  const hasActiveFilters = sortBy !== 'newest' || priceMin !== '' || priceMax !== '' || inStockOnly;
  const clearFilters = () => { setSortBy('newest'); setPriceMin(''); setPriceMax(''); setInStockOnly(false); };
  const discountedCount = useMemo(() => products.filter(p => p.discount_price && p.discount_price > 0).length, [products]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">

      <HeroCarousel />

      {/* Trust bar */}
      <div className="bg-white border-b border-gray-100 py-3 mb-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-[10px] md:text-sm font-bold text-gray-600">
          <div className="flex items-center space-x-1.5"><Truck size={16} className="text-[#ff5000]" /><span>{t('home.guarantees.shipping')}</span></div>
          <div className="flex items-center space-x-1.5"><ShieldCheck size={16} className="text-[#ff5000]" /><span>{t('home.guarantees.returns')}</span></div>
          <div className="flex items-center space-x-1.5"><Tag size={16} className="text-[#ff5000]" /><span>{t('home.guarantees.price')}</span></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Categories */}
        <div id="categories">
          <CategorySlider selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Flash sale countdown */}
        <div className="mt-6">
          <FlashSaleCountdown discountedCount={discountedCount} />
        </div>

        {/* Filters bar */}
        <div className="mt-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border transition-all ${showFilters || hasActiveFilters ? 'bg-[#ff5000] text-white border-[#ff5000]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#ff5000]'}`}
            >
              <SlidersHorizontal size={15} />
              Filtros
              {hasActiveFilters && <span className="bg-white text-[#ff5000] text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full">!</span>}
            </button>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm font-bold bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#ff5000] text-gray-700 cursor-pointer"
            >
              <option value="newest">Más Nuevo</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="rating">Mejor Valorado</option>
            </select>
          </div>

          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Precio mínimo (Q)</label>
                  <input type="number" min="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[#ff5000]" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Precio máximo (Q)</label>
                  <input type="number" min="0" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="9999" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[#ff5000]" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setInStockOnly(v => !v)}>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${inStockOnly ? 'bg-[#ff5000]' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Solo en stock</span>
                </label>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700">
                    <X size={12} /> Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section header */}
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            {isFiltering ? (
              <>
                {query.trim() ? `${t('home.results_for')} "${query}"` : t('home.selected_category')}
                <span className="bg-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {filtered.length} {t('home.products_count')}
                </span>
              </>
            ) : (
              <>
                {t('home.trending')}
                <span className="bg-[#ff5000] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">{t('home.hot')}</span>
              </>
            )}
          </h2>
          {isFiltering && (
            <button onClick={() => { setSelectedCategory(null); useSearchStore.getState().setQuery(''); }} className="text-xs font-bold text-[#ff5000] hover:underline">
              {t('home.see_all')}
            </button>
          )}
        </div>

        {/* Recently Viewed */}
        {!loading && !isFiltering && recentlyViewed.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-gray-400" />
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider">Vistos recientemente</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentlyViewed.map(p => (
                <Link key={p.id} href={`/product/${p.id}`} className="shrink-0 w-28 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-[#ff5000] transition-colors">
                  <div className="h-20 bg-gray-50 overflow-hidden">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-gray-700 line-clamp-2 leading-tight">{p.name}</p>
                    <p className="text-[11px] font-black text-[#ff5000] mt-1">Q{parseFloat(p.discount_price || p.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {filtered.slice(0, visibleCount).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleCount(v => v + 12)}
                  className="bg-white border border-gray-200 hover:border-[#ff5000] text-gray-700 hover:text-[#ff5000] font-bold px-8 py-3 rounded-full text-sm transition-all shadow-sm"
                >
                  Cargar más ({filtered.length - visibleCount} restantes)
                </button>
              </div>
            )}
            {visibleCount >= filtered.length && !isFiltering && (
              <div className="py-12 text-center text-sm font-bold text-gray-400">
                {t('home.end_catalog')}
              </div>
            )}
          </>
        ) : (
          <div className="py-24 flex flex-col items-center text-center text-gray-400">
            <SearchX size={48} className="mb-4 opacity-30" />
            <p className="font-bold text-gray-500 text-lg">{t('home.no_products_title')}</p>
            <p className="text-sm mt-1">{t('home.no_products_sub')}</p>
            <button
              onClick={() => { setSelectedCategory(null); useSearchStore.getState().setQuery(''); }}
              className="mt-6 bg-[#ff5000] text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-orange-600 transition-colors"
            >
              {t('home.see_all_products')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
