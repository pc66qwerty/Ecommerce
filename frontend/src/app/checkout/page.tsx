"use client";

import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import api from '@/lib/axios';
import {
  ShieldCheck,
  Lock,
  Tag,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const STEPS = ['Carrito', 'Envío', 'Confirmar'] as const;
type Step = 0 | 1 | 2;

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { items, clearCart, updateQuantity, removeItem } = useCartStore();

  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', city: '' });
  const [formErrors, setFormErrors] = useState<Partial<typeof formData>>({});

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [orderRef, setOrderRef] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  const cartCount = items.reduce((acc, item) => acc + Number(item.quantity), 0);
  const cartTotal = items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
  const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const finalTotal = Math.max(0, cartTotal - discount);

  if (items.length === 0 && step === 0 && !orderRef) {
    return (
      <div className="p-10 text-center font-bold text-gray-500">
        {t('checkout.cart_empty')}
      </div>
    );
  }

  // ---------- coupon helpers ----------

  const handleApplyCoupon = async (): Promise<any> => {
    if (!couponCode.trim()) return null;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate', { code: couponCode.trim(), total: cartTotal });
      setAppliedCoupon(res.data);
      return res.data;
    } catch (err: any) {
      setCouponError(err.response?.data?.message || t('checkout.coupon_error'));
      setAppliedCoupon(null);
      return null;
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // ---------- step navigation ----------

  const validateForm = (): boolean => {
    const errors: Partial<typeof formData> = {};
    if (!formData.name.trim()) errors.name = 'Requerido';
    if (!formData.phone.trim()) errors.phone = 'Requerido';
    if (!formData.address.trim()) errors.address = 'Requerido';
    if (!formData.city.trim()) errors.city = 'Requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validateForm()) return;
    setStep((prev) => (prev + 1) as Step);
  };

  const goBack = () => setStep((prev) => (prev - 1) as Step);

  // ---------- submit ----------

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let activeCoupon = appliedCoupon;
      if (!activeCoupon && couponCode.trim()) {
        activeCoupon = await handleApplyCoupon();
        if (!activeCoupon) {
          setLoading(false);
          return;
        }
      }

      const activeDiscount = activeCoupon ? activeCoupon.discount_amount : 0;
      const activeFinalTotal = Math.max(0, cartTotal - activeDiscount);

      const payload: any = {
        products: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        total: activeFinalTotal,
        address: `${formData.address}, ${formData.city} (Nombre: ${formData.name}, Tel: ${formData.phone})`,
      };
      if (activeCoupon?.code) payload.coupon_code = activeCoupon.code;

      const res = await api.post('/orders', payload);
      const referenceNumber: string = res.data.reference_number || '';

      // Save reference so tracking page and profile can show it
      if (referenceNumber && typeof window !== 'undefined') {
        localStorage.setItem('last_order_reference', referenceNumber);
      }

      let whatsappNumber = '50254922665';
      try { const waRes = await api.get('/settings/whatsapp'); whatsappNumber = waRes.data.whatsapp_number || whatsappNumber; } catch (_) {}
      const productList = items
        .map((i) => `- ${i.quantity}x ${i.name} (Q${Number(i.price).toFixed(2)})`)
        .join('\n');
      const discountLine = activeCoupon
        ? `\nCupón: ${activeCoupon.code} (-Q${activeDiscount.toFixed(2)})`
        : '';
      const rawMessage =
        `Hola, quiero realizar un pedido:\n\nNombre: ${formData.name}\nTeléfono: ${formData.phone}\nRef: ${referenceNumber}\n\nProductos:\n${productList}${discountLine}\n\nTotal: Q${activeFinalTotal.toFixed(2)}\n\nDirección: ${formData.address}, ${formData.city}\n\nPor favor confirmar disponibilidad.`;

      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(rawMessage)}`;
      clearCart();
      setOrderRef(referenceNumber);
      setWhatsappUrl(url);
    } catch (err) {
      alert(t('checkout.order_error'));
      setLoading(false);
    }
  };

  // ---------- render ----------

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
      <div className="max-w-2xl mx-auto px-4 pt-6 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Lock className="text-green-600 shrink-0" size={22} />
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            {t('checkout.secure')}
          </h1>
        </div>

        {/* Progress bar */}
        {!orderRef && <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* connecting line */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-[#ff5000] z-0 transition-all duration-300"
              style={{ width: step === 0 ? '0%' : step === 1 ? '50%' : '100%' }}
            />

            {STEPS.map((label, idx) => {
              const done = idx < step;
              const active = idx === step;
              return (
                <div key={label} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-200
                      ${done ? 'bg-[#ff5000] text-white' : active ? 'bg-[#ff5000] text-white ring-4 ring-[#ff5000]/20' : 'bg-white border-2 border-gray-300 text-gray-400'}`}
                  >
                    {done ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-bold whitespace-nowrap transition-colors duration-200
                      ${active ? 'text-[#ff5000]' : done ? 'text-gray-700' : 'text-gray-400'}`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>}

        {/* ── SUCCESS SCREEN ── */}
        {orderRef ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-8 text-center space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-600" />
              </div>
              <h2 className="text-xl font-black text-gray-900">¡Pedido registrado!</h2>
              <p className="text-sm text-gray-500 font-medium">Tu pedido fue creado exitosamente. Guarda tu número de referencia para rastrearlo.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl px-6 py-4 border border-gray-200">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Número de referencia</p>
              <p className="text-2xl font-black text-[#ff5000] tracking-wider">{orderRef}</p>
            </div>

            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black py-4 rounded-xl transition-colors shadow-lg"
              >
                <MessageCircle size={20} />
                Enviar pedido por WhatsApp
              </a>
              <Link
                href={`/orders/tracking?ref=${orderRef}`}
                className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 hover:border-[#ff5000] text-gray-700 hover:text-[#ff5000] font-black py-4 rounded-xl transition-colors"
              >
                <Package size={18} />
                Rastrear mi pedido
              </Link>
            </div>
          </div>
        ) : null}

        {/* Step panels */}
        {!orderRef && <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* ── STEP 0: Carrito ── */}
          {step === 0 && (
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-black text-gray-900">Tu carrito</h2>

              {items.length === 0 ? (
                <p className="text-gray-500 font-medium py-6 text-center">
                  {t('checkout.cart_empty')}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <li key={item.product_id} className="py-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-[#ff5000] font-black text-sm mt-0.5">
                          Q{Number(item.price).toFixed(2)}
                        </p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-1 py-1">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(item.product_id, item.quantity - 1)
                              : removeItem(item.product_id)
                          }
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#ff5000] transition-colors"
                          aria-label="Disminuir"
                        >
                          {item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                        </button>
                        <span className="w-6 text-center text-sm font-black text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#ff5000] transition-colors"
                          aria-label="Aumentar"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Line total */}
                      <p className="text-sm font-black text-gray-800 w-16 text-right shrink-0">
                        Q{(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Subtotal */}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600">
                  Subtotal ({cartCount} {t('checkout.items')})
                </span>
                <span className="text-xl font-black text-[#ff5000]">Q{cartTotal.toFixed(2)}</span>
              </div>

              {/* Next */}
              <button
                onClick={goNext}
                disabled={items.length === 0}
                className="w-full mt-2 bg-[#ff5000] hover:bg-[#e04800] text-white font-black py-4 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── STEP 1: Envío ── */}
          {step === 1 && (
            <div className="p-6 space-y-5">
              <h2 className="text-lg font-black text-gray-900">{t('checkout.shipping_info')}</h2>

              {/* Form fields */}
              <div className="space-y-4">
                {(
                  [
                    { key: 'name', label: t('checkout.full_name'), type: 'text' },
                    { key: 'phone', label: t('checkout.phone'), type: 'tel' },
                    { key: 'address', label: t('checkout.address'), type: 'text' },
                    { key: 'city', label: t('checkout.city'), type: 'text' },
                  ] as { key: keyof typeof formData; label: string; type: string }[]
                ).map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
                    <input
                      type={type}
                      value={formData[key]}
                      onChange={(e) => {
                        setFormData({ ...formData, [key]: e.target.value });
                        setFormErrors({ ...formErrors, [key]: '' });
                      }}
                      className={`w-full bg-gray-50 border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#ff5000] focus:border-[#ff5000] outline-none transition-colors
                        ${formErrors[key] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {formErrors[key] && (
                      <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                        <X size={11} /> {formErrors[key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Coupon section */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={16} className="text-[#ff5000]" />
                  <span className="text-sm font-bold text-gray-900">{t('checkout.have_coupon')}</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                      <div>
                        <p className="font-black text-green-700 text-sm tracking-wider">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          {appliedCoupon.description ||
                            (appliedCoupon.discount_type === 'percentage'
                              ? `${appliedCoupon.discount_value}% de descuento`
                              : `Q${appliedCoupon.discount_value} de descuento`)}
                          {' '}· Ahorra Q{discount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())
                        }
                        placeholder={t('checkout.coupon_placeholder')}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#ff5000] outline-none uppercase tracking-wider transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-5 py-3 text-sm font-black text-white bg-[#111] rounded-xl hover:bg-[#ff5000] transition-colors disabled:opacity-40 shrink-0"
                      >
                        {couponLoading ? '...' : t('checkout.apply')}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                        <X size={12} /> {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 px-5 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-black hover:border-gray-400 transition-colors"
                >
                  <ChevronLeft size={18} /> Volver
                </button>
                <button
                  onClick={goNext}
                  className="flex-1 bg-[#ff5000] hover:bg-[#e04800] text-white font-black py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Revisar pedido <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Confirmar ── */}
          {step === 2 && (
            <div className="p-6 space-y-5">
              <h2 className="text-lg font-black text-gray-900">Resumen del pedido</h2>

              {/* Shipping summary */}
              <div className="bg-gray-50 rounded-2xl px-4 py-3 text-sm space-y-0.5">
                <p className="font-black text-gray-800">{formData.name}</p>
                <p className="text-gray-600 font-medium">{formData.phone}</p>
                <p className="text-gray-600 font-medium">
                  {formData.address}, {formData.city}
                </p>
              </div>

              {/* Items */}
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.product_id} className="py-3 flex justify-between items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        {item.quantity} × Q{Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-black text-gray-800 shrink-0">
                      Q{(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>Subtotal ({cartCount} {t('checkout.items')})</span>
                  <span>Q{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>{t('checkout.shipping')}</span>
                  <span className="text-green-600 font-bold">{t('checkout.free_shipping')}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-sm font-bold text-green-600 bg-green-50 rounded-xl px-3 py-2">
                    <span>{t('checkout.discount')} · {appliedCoupon.code}</span>
                    <span>-Q{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    {appliedCoupon && (
                      <p className="text-xs text-gray-400 line-through font-medium">
                        Q{cartTotal.toFixed(2)}
                      </p>
                    )}
                    <span className="text-2xl font-black text-[#ff5000]">
                      Q{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation + Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={goBack}
                  disabled={loading}
                  className="flex items-center gap-1 px-5 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-black hover:border-gray-400 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft size={18} /> Volver
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-[#111] hover:bg-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/20 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <>
                      <MessageCircle size={18} />
                      Confirmar y enviar por WhatsApp
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-gray-400 font-medium text-center leading-relaxed">
                {t('checkout.whatsapp_disclaimer')}
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <ShieldCheck size={15} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t('checkout.secure_label')}
                </span>
              </div>
            </div>
          )}
        </div>}
      </div>
    </div>
  );
}
