"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const statusES: Record<string, string> = {
  'Pending confirmation':   'Pendiente de confirmación',
  'Order accepted':         'Pedido aceptado',
  'Awaiting payment proof': 'Esperando comprobante',
  'Payment confirmed':      'Pago confirmado',
  'Preparing product':      'Preparando producto',
  'Packaged':               'Empaquetado',
  'Shipped':                'Enviado',
  'Out for delivery':       'En reparto',
  'Delivered':              'Entregado',
  'Payment denied':         'Pago denegado',
};

const statusColor = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s.includes('entregado') || s === 'delivered') return 'bg-green-50 text-green-700 border-green-200';
  if (s.includes('enviado') || s === 'shipped') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s.includes('denegado') || s === 'denied') return 'bg-red-50 text-red-600 border-red-200';
  return 'bg-orange-50 text-[#ff5000] border-orange-100';
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) { router.push('/auth/login'); return; }
    if (!isLoading && isAuthenticated) {
      api.get('/my-orders')
        .then(res => setOrders(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isLoading, isAuthenticated, router]);

  if (loading || isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#ff5000] border-t-transparent animate-spin rounded-full" />
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center p-4 max-w-3xl mx-auto">
          <Link href="/profile" className="text-gray-500 hover:text-gray-800 mr-4 font-bold text-xl">&larr;</Link>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Mis Pedidos</h1>
          <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-black px-2 py-0.5 rounded-full">{orders.length}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-3">
        {orders.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center text-gray-400">
            <Package size={48} className="mb-4 opacity-30" />
            <p className="font-bold text-gray-500 text-lg">No tienes pedidos aún</p>
            <p className="text-sm mt-1">Cuando realices un pedido, aparecerá aquí.</p>
            <Link href="/" className="mt-6 bg-[#ff5000] text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-orange-600 transition-colors">
              Ir a Comprar
            </Link>
          </div>
        ) : orders.map((o: any) => {
          const isExpanded = expandedId === o.id;
          return (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-[#ff5000]/30 transition-colors">
              {/* Header row */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-gray-900 text-sm">{o.reference_number}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {new Date(o.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${statusColor(o.status)}`}>
                    {statusES[o.status] ?? o.status}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-black text-[#ff5000]">Q{Number(o.total_amount).toFixed(2)}</span>
                    {o.payment_proof_status && o.payment_proof_status !== 'pending' && (
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        o.payment_proof_status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        o.payment_proof_status === 'denied' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        Pago: {o.payment_proof_status === 'approved' ? 'Aprobado' : o.payment_proof_status === 'denied' ? 'Denegado' : 'Recibido'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {o.items?.length > 0 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : o.id)}
                        className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#ff5000] transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {o.items.length} {o.items.length === 1 ? 'producto' : 'productos'}
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/orders/tracking?ref=${o.reference_number}`)}
                      className="flex items-center text-xs font-bold text-gray-400 hover:text-[#ff5000] transition-colors"
                    >
                      Rastrear <ChevronRight size={14} className="ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Items expandibles */}
              {isExpanded && o.items?.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3 space-y-2">
                  {o.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700 truncate flex-1 mr-4">{item.product_name}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-gray-400 text-xs font-medium">{item.quantity}×</span>
                        <span className="font-bold text-gray-800">Q{Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
