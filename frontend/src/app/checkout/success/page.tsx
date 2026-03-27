"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'UNKNOWN';
  const [whatsappNumber, setWhatsappNumber] = useState('50254922665');

  useEffect(() => {
    api.get('/settings/whatsapp').then(res => {
      if (res.data.whatsapp_number) setWhatsappNumber(res.data.whatsapp_number);
    }).catch(() => {});
  }, []);

  const handlePaymentProof = () => {
    const message = `Hola, adjunto el comprobante de pago para el pedido #${orderId}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#ff5000]"></div>

        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">¡Pedido Recibido!</h1>
        <p className="text-gray-500 font-medium mb-8">
          Tu pedido <span className="font-bold text-gray-900">#{orderId}</span> está pendiente de confirmación.
        </p>

        <div className="bg-orange-50 rounded-xl p-5 mb-8 border border-orange-100 text-left">
          <h3 className="font-bold text-[#ff5000] mb-2 flex items-center">
            <span className="mr-2">💳</span> Siguiente paso: Comprobante de pago
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-5">
            Para agilizar tu envío, envíanos el comprobante de pago o captura de transferencia por WhatsApp.
          </p>
          <button
            onClick={handlePaymentProof}
            className="w-full bg-[#111] hover:bg-[#ff5000] text-white font-extrabold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Enviar Comprobante</span>
          </button>
        </div>

        <Link href="/" className="text-sm font-bold text-gray-500 hover:text-[#ff5000] transition-colors inline-block w-full">
          &larr; Volver a la tienda
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
