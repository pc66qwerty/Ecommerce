"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function FlashSaleCountdown({ discountedCount, onShowDiscounted, onExpire }: { discountedCount: number; onShowDiscounted?: () => void; onExpire?: () => void }) {
  const [seconds, setSeconds] = useState(getSecondsUntilMidnight());

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => {
      if (s <= 1) { onExpire?.(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [onExpire]);

  if (discountedCount === 0 || seconds === 0) return null;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <div onClick={onShowDiscounted} className={`bg-[#111] text-white py-3 px-4 mb-6 rounded-2xl mx-4 md:mx-0 shadow-lg ${onShowDiscounted ? 'cursor-pointer hover:bg-[#1a1a1a] transition-colors' : ''}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-[#ff5000] p-1.5 rounded-lg">
            <Zap size={16} className="text-white" fill="white" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#ff5000]">🔥 ¡Solo por Hoy!</p>
            <p className="text-[11px] text-gray-300 font-medium">{discountedCount} productos con descuento — toca para ver</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { label: 'HRS', value: pad(h) },
            { label: 'MIN', value: pad(m) },
            { label: 'SEG', value: pad(s) },
          ].map((unit, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-[#ff5000] font-black text-lg">:</span>}
              <div className="bg-white/10 rounded-lg px-2.5 py-1.5 text-center min-w-[44px]">
                <p className="text-xl font-black tabular-nums">{unit.value}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{unit.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
