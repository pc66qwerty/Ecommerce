"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'UNKNOWN';
  
  const handlePaymentProof = () => {
    const message = `I am sending the payment proof for order #${orderId}`;
    const whatsappNumber = "1234567890";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#ff5000]"></div>
        
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Received!</h1>
        <p className="text-gray-500 font-medium mb-8">
          Your order <span className="font-bold text-gray-900">#{orderId}</span> is pending confirmation. You should have already submitted your order details via WhatsApp.
        </p>
        
        <div className="bg-orange-50 rounded-xl p-5 mb-8 border border-orange-100 text-left">
          <h3 className="font-bold text-[#ff5000] mb-2 flex items-center">
            <span className="mr-2">💳</span> Next Step: Payment Proof
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-5">
            To expedite your shipment, please send us the payment receipt or transfer screenshot. You can attach the image directly in WhatsApp.
          </p>
          <button 
            onClick={handlePaymentProof}
            className="w-full bg-[#111] hover:bg-[#ff5000] text-white font-extrabold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Send Payment Proof</span>
            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" clipRule="evenodd"></path></svg>
          </button>
        </div>

        <Link href="/" className="text-sm font-bold text-gray-500 hover:text-[#ff5000] transition-colors inline-block w-full">
          &larr; Return to Store
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
