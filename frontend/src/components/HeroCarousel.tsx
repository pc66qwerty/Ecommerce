"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/axios';

interface Slide {
  image: string;
  badge: string;
  title: string;
  subtitle: string;
}

const defaultSlides: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1621252178351-5121b6d9da25?auto=format&fit=crop&q=80&w=1200',
    badge: '🔥 Oferta Relámpago',
    title: "Ilumina tu\nCamino",
    subtitle: 'LEDs de alta potencia 6000K para cualquier vehículo. Instalación en minutos.',
  },
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200',
    badge: '⚡ Nuevo Ingreso',
    title: "Accesorios\nPremium",
    subtitle: 'La mejor selección de accesorios para el interior y exterior de tu auto.',
  },
  {
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200',
    badge: '🚚 Envío Gratis',
    title: "Precios\nInmejorables",
    subtitle: 'Calidad garantizada con envío express en 2-3 días a todo el país.',
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    api.get('/settings/carousel')
      .then(res => { if (Array.isArray(res.data) && res.data.length > 0) setSlides(res.data); })
      .catch(() => {});
  }, []);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full h-72 md:h-105 overflow-hidden rounded-b-[40px] md:rounded-b-[60px] shadow-md">
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="relative min-w-full h-full shrink-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-center"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#111]/90 via-[#111]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
              <div className="max-w-xl">
                <span className="inline-block bg-[#ff5000] text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 mb-3 rounded-full shadow-sm">
                  {slide.badge}
                </span>
                <h1 className="text-3xl md:text-6xl font-black text-white leading-tight tracking-tighter drop-shadow-lg whitespace-pre-line">
                  {slide.title}
                </h1>
                <p className="text-gray-200 text-sm md:text-base font-medium drop-shadow-md max-w-md mt-2 leading-relaxed">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 transition-all backdrop-blur-sm"
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 transition-all backdrop-blur-sm"
        aria-label="Siguiente"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'bg-[#ff5000] w-6 h-2' : 'bg-white/50 w-2 h-2'}`}
            aria-label={`Ir a la diapositiva ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
