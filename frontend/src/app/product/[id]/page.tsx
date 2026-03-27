"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useCartStore } from '@/store/useCartStore';
import { useToastStore } from '@/store/useToastStore';
import { ShoppingCart, Star, Shield, Truck, RotateCcw, AlertTriangle, PlayCircle, Share2, Link, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductCard from '@/components/ProductCard';
import { saveRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { getProductsCache } from '@/lib/productsCache';

function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube: watch?v=, youtu.be/, shorts/, embed/
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const { show: showToast } = useToastStore();
  const { t } = useTranslation();

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await api.get(`/products/${id}`);
        const p = response.data;
        setProduct(p);
        document.title = `${p.name} — MIAN`;
        saveRecentlyViewed(p);
        // Load related products from cache (no extra network request)
        if (p.category_id) {
          getProductsCache().then(all => {
            setRelated(all.filter((x: any) => x.category_id === p.category_id && x.id !== p.id).slice(0, 5));
          });
        }
      } catch (err) {
        // product not found
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    return () => { document.title = 'MIAN — Iluminando tu Camino'; };
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    setAdding(true);
    addToCart(product, 1);
    showToast(`${product.name} agregado al carrito`);
    setTimeout(() => setAdding(false), 500);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localStorage.getItem('auth_token')) {
        alert(t('product.login_to_review'));
        return;
    }
    setReviewSubmitting(true);
    try {
        await api.post(`/products/${id}/reviews`, { rating, comment: reviewText });
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setReviewText('');
    } catch (e) {
        alert(t('product.review_failed'));
    } finally {
        setReviewSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-[#ff5000] border-t-transparent animate-spin rounded-full"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold bg-gray-50 text-xl">{t('product.not_found')} 😔</div>;

  const price = parseFloat(product.price);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-10 pt-4 md:pt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Product Frame */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
           <div className="md:w-1/2 p-6 bg-gray-50/50 flex flex-col items-center justify-center relative gap-4">
               {product.is_featured && <span className="absolute top-6 left-6 bg-yellow-100 text-yellow-700 font-black px-3 py-1 text-xs uppercase tracking-wide rounded-full border border-yellow-200 shadow-sm z-10 hidden md:block">{t('product.featured')}</span>}

               {/* Main display: video or image */}
               {showVideo && product.video_url && toEmbedUrl(product.video_url) ? (
                 <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                   <iframe
                     src={toEmbedUrl(product.video_url)!}
                     title={`Video de ${product.name}`}
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                     className="absolute inset-0 w-full h-full rounded-2xl border border-gray-100"
                   />
                 </div>
               ) : (
                 <ZoomImage
                   src={(product.images && product.images[selectedImage]) || product.image_url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=600'}
                   alt={product.name}
                 />
               )}

               {/* Thumbnails: images + video button */}
               {(product.images?.length > 1 || product.video_url) && (
                 <div className="flex gap-2 flex-wrap justify-center">
                   {product.images?.map((img: string, i: number) => (
                     <button
                       key={i}
                       onClick={() => { setSelectedImage(i); setShowVideo(false); }}
                       className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition-all ${!showVideo && selectedImage === i ? 'border-[#ff5000] shadow-md' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                     >
                       <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                     </button>
                   ))}
                   {product.video_url && toEmbedUrl(product.video_url) && (
                     <button
                       onClick={() => setShowVideo(true)}
                       className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${showVideo ? 'border-[#ff5000] bg-orange-50 shadow-md' : 'border-gray-200 bg-gray-100 opacity-60 hover:opacity-100'}`}
                       title="Ver video"
                     >
                       <PlayCircle size={24} className={showVideo ? 'text-[#ff5000]' : 'text-gray-400'} />
                     </button>
                   )}
                 </div>
               )}
           </div>

           <div className="md:w-1/2 p-6 md:p-10 flex flex-col">
              {product.stock > 0 && product.stock <= 5 && (
                  <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg font-bold text-xs flex items-center mb-4 w-max border border-red-100">
                     <AlertTriangle size={14} className="mr-1.5" /> {t('product.almost_gone', { stock: product.stock })}
                  </div>
              )}

              <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight mb-2">
                {product.name}
              </h1>

              {/* Ratings Overview */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex text-[#ff5000]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(product.average_rating || 5) ? 'currentColor' : 'none'} color={i < Math.round(product.average_rating || 5) ? 'currentColor' : '#ff5000'} />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-700">{product.average_rating ? Number(product.average_rating).toFixed(1) : '5.0'}</span>
                <span className="text-sm font-medium text-gray-400 underline decoration-dashed cursor-pointer">({product.reviews_count || 128} {t('product.reviews')})</span>
              </div>

              {/* Pricing */}
              <div className="mb-8 border-b border-gray-100 pb-8 relative">
                 {discountPrice ? (
                    <div className="flex items-end">
                       <span className="text-4xl font-black text-[#ff5000]">Q{discountPrice.toFixed(2)}</span>
                       <span className="text-lg font-bold text-gray-400 line-through ml-3 mb-1">Q{price.toFixed(2)}</span>
                       <span className="ml-3 mb-1.5 bg-red-100 text-red-600 font-bold text-xs uppercase px-2 py-0.5 rounded-sm">{t('product.save')} Q{(price - discountPrice).toFixed(2)}</span>
                    </div>
                 ) : (
                    <span className="text-4xl font-black text-[#ff5000]">Q{price.toFixed(2)}</span>
                 )}
                 <p className="text-gray-500 font-medium text-sm mt-3 leading-relaxed w-5/6">
                     {product.description || t('product.default_desc')}
                 </p>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-10 text-sm font-semibold text-gray-700">
                  <div className="flex items-center"><Shield size={18} className="text-green-500 mr-3" /> {t('product.warranty')}</div>
                  <div className="flex items-center"><Truck size={18} className="text-[#ff5000] mr-3" /> {t('product.express')}</div>
                  <div className="flex items-center"><RotateCcw size={18} className="text-blue-500 mr-3" /> {t('product.returns')}</div>
              </div>

              <div className="mt-auto hidden md:block space-y-3">
                  <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center space-x-2 ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#111] hover:bg-[#ff5000] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0'}`}
                  >
                  {adding ? <div className="w-6 h-6 border-2 border-[#ff5000] border-t-transparent animate-spin rounded-full"></div> : (
                     <>
                        <ShoppingCart size={22} />
                        <span>{isOutOfStock ? t('product.out_of_stock') : t('product.add_to_cart')}</span>
                     </>
                  )}
                  </button>
                  <ShareBar product={product} copied={copied} setCopied={setCopied} />
              </div>
           </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-[#ff5000] pl-3 mb-8 tracking-tight">{t('product.customer_reviews')}</h2>

            <form onSubmit={handleSubmitReview} className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
               <h3 className="font-bold text-gray-800 mb-4">{t('product.leave_review')}</h3>
               <div className="flex space-x-2 mb-4 text-gray-300">
                   {[1,2,3,4,5].map(v => (
                       <Star key={v} size={24} fill={rating >= v ? '#ff5000' : 'none'} color={rating >= v ? '#ff5000' : 'currentColor'} className="cursor-pointer transition-colors" onClick={() => setRating(v)} />
                   ))}
               </div>
               <textarea required value={reviewText} onChange={e=>setReviewText(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#ff5000] outline-none mb-3" placeholder={t('product.review_placeholder')} rows={3}></textarea>
               <button disabled={reviewSubmitting} type="submit" className="bg-[#111] hover:bg-[#ff5000] text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 shadow-sm">{t('product.publish')}</button>
            </form>

            <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? product.reviews.map((r: any) => (
                    <div key={r.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                         <div className="flex items-center space-x-3 mb-2">
                             <div className="w-8 h-8 rounded-full bg-orange-100 text-[#ff5000] flex flex-col items-center justify-center font-black text-xs uppercase shadow-inner">{r.user?.name?.substring(0,2) || 'GU'}</div>
                             <div>
                                 <p className="text-xs font-black text-gray-900">{r.user?.name || 'Customer'}</p>
                                 <p className="text-[10px] font-medium text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                             </div>
                         </div>
                         <div className="flex text-[#ff5000] mb-2">
                             {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < r.rating ? 'currentColor' : 'none'} color={i < r.rating ? 'currentColor' : '#ff5000'} />)}
                         </div>
                         <p className="text-sm font-medium text-gray-700 leading-relaxed">{r.comment}</p>
                    </div>
                )) : <div className="text-sm font-bold text-gray-400 text-center py-6">{t('product.no_reviews')}</div>}
            </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-black text-gray-900 border-l-4 border-[#ff5000] pl-3 mb-6 tracking-tight">También te puede gustar</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Mobile Add To Cart */}
      <div className="md:hidden fixed bottom-15 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-40 -translate-y-px">
        <div className="px-3 pt-2"><ShareBar product={product} copied={copied} setCopied={setCopied} /></div>
        <div className="p-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          className={`w-full py-3.5 rounded-xl font-black text-base shadow-lg flex justify-center items-center space-x-2 transition-all ${isOutOfStock ? 'bg-gray-200 text-gray-400' : 'bg-[#111] hover:bg-[#ff5000] text-white active:scale-95'}`}
        >
          {adding ? <div className="w-5 h-5 border-2 border-[#ff5000] border-t-transparent animate-spin rounded-full"></div> : (
              <>
                 <ShoppingCart size={20} />
                 <span>{isOutOfStock ? t('product.out_of_stock') : t('product.add_to_cart')}</span>
              </>
          )}
        </button>
        </div>
      </div>
    </div>
  );
}

function ShareBar({ product, copied, setCopied }: { product: any; copied: boolean; setCopied: (v: boolean) => void }) {
  const getUrl = () => typeof window !== 'undefined' ? window.location.href : '';
  const text = `¡Mira este producto: ${product.name}!`;

  const share = (network: string) => {
    const url = encodeURIComponent(getUrl());
    const msg = encodeURIComponent(text);
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${msg}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter:  `https://twitter.com/intent/tweet?text=${msg}&url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${msg}`,
    };
    window.open(links[network], '_blank', 'noopener');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getUrl()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-gray-400 flex items-center gap-1 shrink-0"><Share2 size={13} /> Compartir:</span>
      {/* WhatsApp */}
      <button onClick={() => share('whatsapp')} title="WhatsApp" className="w-8 h-8 rounded-full flex items-center justify-center bg-[#25D366] hover:opacity-90 transition-opacity shadow-sm">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.532 5.855L.054 23.454a.5.5 0 0 0 .492.546h.056l5.74-1.503A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.36-.214-3.733.979.995-3.638-.234-.374A9.9 9.9 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1S21.9 6.534 21.9 12 17.466 21.9 12 21.9z"/></svg>
      </button>
      {/* Facebook */}
      <button onClick={() => share('facebook')} title="Facebook" className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1877F2] hover:opacity-90 transition-opacity shadow-sm">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
      </button>
      {/* Twitter/X */}
      <button onClick={() => share('twitter')} title="X (Twitter)" className="w-8 h-8 rounded-full flex items-center justify-center bg-black hover:opacity-80 transition-opacity shadow-sm">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </button>
      {/* Telegram */}
      <button onClick={() => share('telegram')} title="Telegram" className="w-8 h-8 rounded-full flex items-center justify-center bg-[#229ED9] hover:opacity-90 transition-opacity shadow-sm">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
      </button>
      {/* Copiar enlace */}
      <button onClick={copyLink} title="Copiar enlace" className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${copied ? 'bg-green-500' : 'bg-gray-200 hover:bg-gray-300'}`}>
        {copied ? <Check size={14} className="text-white" /> : <Link size={14} className="text-gray-600" />}
      </button>
    </div>
  );
}

function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMouseMove}
      className="w-full max-w-md overflow-hidden cursor-crosshair rounded-xl"
      style={{ aspectRatio: '1 / 1' }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-100"
        style={{
          transformOrigin: `${pos.x}% ${pos.y}%`,
          transform: zoom ? 'scale(2.2)' : 'scale(1)',
        }}
        loading="eager"
        draggable={false}
      />
    </div>
  );
}
