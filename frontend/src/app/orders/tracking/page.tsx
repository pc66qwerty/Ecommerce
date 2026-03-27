"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';

const STATUS_STAGES = [
  { key: 'placed', icon: Clock },
  { key: 'processing', icon: Package },
  { key: 'shipped', icon: Truck },
  { key: 'out_for_delivery', icon: MapPin },
  { key: 'delivered', icon: CheckCircle },
];

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#ff5000] border-t-transparent animate-spin rounded-full" /></div>}>
      <OrderTracking />
    </Suspense>
  );
}

const statusES: Record<string, string> = {
  'Pending confirmation':   'Pendiente de confirmación',
  'Order accepted':         'Pedido aceptado',
  'Awaiting payment proof': 'Esperando comprobante de pago',
  'Payment confirmed':      'Pago confirmado',
  'Preparing product':      'Preparando producto',
  'Packaged':               'Empaquetado',
  'Shipped':                'Enviado',
  'Out for delivery':       'En reparto',
  'Delivered':              'Entregado',
  'Payment denied':         'Pago denegado',
};
const toES = (s: string) => statusES[s] ?? s;

const statusBadgeColor = (status: string) => {
  switch (status) {
    case 'Pending confirmation':    return 'bg-orange-50 text-orange-600 border-orange-200';
    case 'Order accepted':          return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Awaiting payment proof':  return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Payment confirmed':       return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'Preparing product':       return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Packaged':                return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Shipped':                 return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Out for delivery':        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'Delivered':               return 'bg-green-50 text-green-700 border-green-200';
    default:                        return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

function OrderTracking() {
  const searchParams = useSearchParams();
  const [reference, setReference] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  // Auto-load from ?ref= param or localStorage on mount
  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    const refFromStorage = typeof window !== 'undefined' ? localStorage.getItem('last_order_reference') : null;
    const autoRef = refFromUrl || refFromStorage || '';
    if (autoRef) {
      setReference(autoRef);
      setLoading(true);
      setError('');
      api.get(`/orders/track/${autoRef}`)
        .then(res => setOrder(res.data))
        .catch(() => setError('Pedido no encontrado. Verifica tu número de seguimiento.'))
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/track/${reference}`);
      setOrder(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pedido no encontrado. Verifica tu número de seguimiento.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getActiveStageIndex = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'out for delivery' || s === 'en reparto') return 3;
    if (s === 'shipped' || s === 'enviado') return 2;
    if (s === 'preparing product' || s === 'packaged' || s === 'procesando') return 1;
    return 0; // pending confirmation, order accepted, etc.
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center p-4 max-w-3xl mx-auto">
          <Link href="/profile" className="text-gray-500 hover:text-gray-800 mr-4 font-bold text-xl">
            &larr;
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">{t('tracking.title')}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-8 shadow-sm">
          <input 
            type="text" 
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t('tracking.placeholder')} 
            className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 pl-12 focus:outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000] text-sm font-bold transition-colors"
          />
          <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          <button 
            type="submit" 
            disabled={loading}
            className="absolute right-2 top-2 bg-[#111] hover:bg-[#ff5000] text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center"
          >
            {loading ? <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin"></div> : t('tracking.track_btn')}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-sm text-center mb-6 shadow-sm">
            {error}
          </div>
        )}

        {/* Tracking Results */}
        {order && (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            
            {/* Header */}
            <div className="bg-gray-50 p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">{t('tracking.order_num')}</p>
                <p className="font-black text-xl text-gray-900">{order.reference_number}</p>
                <p className="text-xs text-gray-400 mt-1">{t('tracking.placed_on')} {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-left sm:text-right border-t sm:border-t-0 border-gray-200 pt-3 sm:pt-0">
                <span className={`inline-block font-black px-4 py-1.5 rounded-full text-sm uppercase tracking-wide border ${statusBadgeColor(order.status)}`}>
                  {toES(order.status)}
                </span>
                
                {(order.tracking_number || order.shipping_company) && (
                  <div className="mt-2 text-xs font-bold text-gray-600">
                    <p>{order.shipping_company} • {order.tracking_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Amazon-style Horizontal Progress Bar */}
            <div className="p-8 border-b border-gray-100 overflow-x-auto hide-scrollbar">
              <div className="min-w-[450px] relative mt-2 mb-8 mx-auto px-4">
                {/* Background Line */}
                <div className="absolute top-5 left-10 right-10 h-1 bg-gray-200 rounded-full"></div>
                
                {/* Active Line */}
                {(() => {
                  const activeIndex = getActiveStageIndex(order.status);
                  const progressPercentage = (activeIndex / (STATUS_STAGES.length - 1)) * 100;
                  return (
                    <div 
                      className="absolute top-5 left-10 h-1 bg-[#ff5000] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `calc(${progressPercentage}% - 3rem)` }}
                    ></div>
                  );
                })()}

                {/* Nodes */}
                <div className="relative flex justify-between">
                  {STATUS_STAGES.map((stage, index) => {
                    const activeIndex = getActiveStageIndex(order.status);
                    const isCompleted = index < activeIndex;
                    const isCurrent = index === activeIndex;
                    const Icon = stage.icon;
                    
                    return (
                      <div key={stage.key} className="flex flex-col items-center relative w-20">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all duration-500 z-10 
                          ${isCompleted ? 'bg-[#ff5000] text-white shadow-md' : 
                            isCurrent ? 'bg-orange-100 ring-2 ring-[#ff5000] text-[#ff5000]' : 
                            'bg-white border-2 border-gray-200 text-gray-300'}`}>
                          <Icon size={isCurrent || isCompleted ? 18 : 16} strokeWidth={isCurrent || isCompleted ? 2.5 : 2} />
                        </div>
                        <span className={`text-[9px] font-black uppercase text-center mt-3 tracking-wide leading-tight 
                          ${isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {t(`tracking.stages.${stage.key}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Timeline List */}
            <div className="p-6 sm:px-10 bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900 mb-6 text-sm uppercase tracking-wider">{t('tracking.history')}</h3>
              <div className="relative border-l-2 border-orange-200 ml-4 space-y-8">
                
                {order.statuses && order.statuses.length > 0 ? (
                  // Sort statuses newest first
                  [...order.statuses].reverse().map((statusItem: any, index: number) => {
                    const isLatest = index === 0;
                    return (
                      <div key={statusItem.id} className="relative pl-8">
                        {isLatest ? (
                          <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-white border-4 border-[#ff5000] shadow-[0_0_0_4px_rgba(255,80,0,0.1)]"></div>
                        ) : (
                          <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-orange-200 border-2 border-white"></div>
                        )}
                        <h4 className={`text-sm ${isLatest ? 'font-black' : 'font-bold text-gray-500'}`}>
                          {isLatest ? (
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs border ${statusBadgeColor(statusItem.status)}`}>{toES(statusItem.status)}</span>
                          ) : toES(statusItem.status)}
                        </h4>
                        <span className="text-xs text-gray-400 mt-1 block font-medium">
                          {new Date(statusItem.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">Aún no hay historial de rastreo registrado.</div>
                )}
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
