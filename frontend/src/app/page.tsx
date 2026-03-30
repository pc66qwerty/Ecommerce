"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [discountsMeta, setDiscountsMeta] = useState<{ count: number; nearest_expiry: string | null } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { query } = useSearchStore();
  const [sortBy, setSortBy] = useState('newest');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();
  const recentlyViewed = useRecentlyViewed();
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [trustBar, setTrustBar] = useState(['Envío Gratis', '90 días de retorno', 'Igualamos Precios']);

  // Track latest fetch to discard stale responses
  const fetchIdRef = useRef(0);

  useEffect(() => {
    api.get('/settings/trust-bar').then(res => { if (Array.isArray(res.data)) setTrustBar(res.data); }).catch(() => {});
  }, []);

  const buildParams = useCallback((page: number) => {
    const params: Record<string, any> = { page, per_page: 20, sort: sortBy };
    if (selectedCategory) params.category_id = selectedCategory;
    if (query.trim()) params.search = query.trim();
    if (priceMin) params.min_price = priceMin;
    if (priceMax) params.max_price = priceMax;
    if (inStockOnly) params.in_stock = 1;
    if (discountedOnly) params.discounted = 1;
    return params;
  }, [selectedCategory, query, sortBy, priceMin, priceMax, inStockOnly, discountedOnly]);

  // Fetch page 1 whenever filters change
  useEffect(() => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    setProducts([]);
    setCurrentPage(1);

    api.get('/products', { params: buildParams(1) })
      .then(res => {
        if (fetchIdRef.current !== id) return; // stale
        const { data, last_page, total, discounts_meta } = res.data;
        setProducts(data);
        setHasMore(1 < last_page);
        setTotalCount(total);
        setDiscountsMeta(discounts_meta);
        primeProductsCache(data);
      })
      .catch(() => {})
      .finally(() => { if (fetchIdRef.current === id) setLoading(false); });
  }, [buildParams]);

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    api.get('/products', { params: buildParams(nextPage) })
      .then(res => {
        const { data, last_page } = res.data;
        setProducts(prev => [...prev, ...data]);
        setCurrentPage(nextPage);
        setHasMore(nextPage < last_page);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const isFiltering = selectedCategory !== null || query.trim() !== '' || discountedOnly;
  const hasActiveFilters = sortBy !== 'newest' || priceMin !== '' || priceMax !== '' || inStockOnly;
  const clearFilters = () => { setSortBy('newest'); setPriceMin(''); setPriceMax(''); setInStockOnly(false); };

  const discountedCount = discountsMeta?.count ?? 0;
  const nearestExpiry = discountsMeta?.nearest_expiry ?? null;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">

      <HeroCarousel />

      {/* Trust bar */}
      <div className="bg-white border-b border-gray-100 py-3 mb-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-[10px] md:text-sm font-bold text-gray-600">
          <div className="flex items-center space-x-1.5"><Truck size={16} className="text-[#ff5000]" /><span>{trustBar[0]}</span></div>
          <div className="flex items-center space-x-1.5"><ShieldCheck size={16} className="text-[#ff5000]" /><span>{trustBar[1]}</span></div>
          <div className="flex items-center space-x-1.5"><Tag size={16} className="text-[#ff5000]" /><span>{trustBar[2]}</span></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Categories */}
        <div id="categories">
          <CategorySlider selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Flash sale countdown */}
        <div className="mt-6">
          <FlashSaleCountdown discountedCount={discountedCount} nearestExpiry={nearestExpiry} onShowDiscounted={() => { setDiscountedOnly(true); document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' }); }} onExpire={() => setDiscountedOnly(false)} />
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
        <div id="productos" className="mb-6 flex justify-between items-end">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            {isFiltering ? (
              <>
                {query.trim() ? `${t('home.results_for')} "${query}"` : t('home.selected_category')}
                {!loading && (
                  <span className="bg-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {totalCount} {t('home.products_count')}
                  </span>
                )}
              </>
            ) : (
              <>
                {t('home.trending')}
                <span className="bg-[#ff5000] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">{t('home.hot')}</span>
              </>
            )}
          </h2>
          {isFiltering && (
            <button onClick={() => { setSelectedCategory(null); useSearchStore.getState().setQuery(''); setDiscountedOnly(false); }} className="text-xs font-bold text-[#ff5000] hover:underline">
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
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-white border border-gray-200 hover:border-[#ff5000] text-gray-700 hover:text-[#ff5000] font-bold px-8 py-3 rounded-full text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  {loadingMore ? 'Cargando...' : `Cargar más (${totalCount - products.length} restantes)`}
                </button>
              </div>
            )}
            {!hasMore && !isFiltering && (
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
