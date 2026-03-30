"use client";

import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

const CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: 'Auto & Moto',
    emojis: ['🚗','🚙','🏎️','🚕','🛻','🏍️','🛞','⛽','🔦','💡','🔋','🧲','🔌','📡'],
  },
  {
    label: 'Herramientas',
    emojis: ['🔧','🔩','⚙️','🪛','🪚','🔨','🛠️','📐','📏','🔬'],
  },
  {
    label: 'Calidad',
    emojis: ['✅','⭐','🌟','💯','🏆','🎯','🥇','💎','👍','🔝','🆕','🔥','⚡','💪','🎖️'],
  },
  {
    label: 'Envío & Info',
    emojis: ['📦','🚚','🎁','📋','📌','📍','ℹ️','💬','📞','📲','🗓️','⏰','🕐'],
  },
  {
    label: 'Seguridad',
    emojis: ['🛡️','🔐','🔒','⚠️','🚨','🆘','✔️','❌','🔴','🟢','🟡'],
  },
  {
    label: 'Listas',
    emojis: ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','➡️','▶️','🔸','🔹','▪️','•','–'],
  },
];

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
}

export default function EmojiPicker({ onPick }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title="Insertar emoji"
        className={`p-1.5 rounded-lg transition-colors ${open ? 'bg-[#ff5000] text-white' : 'text-gray-400 hover:text-[#ff5000] hover:bg-orange-50'}`}
      >
        <Smile size={16} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl w-72">
          {/* Category tabs */}
          <div className="flex overflow-x-auto gap-1 p-2 border-b border-gray-100 scrollbar-hide">
            {CATEGORIES.map((cat, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTab(i)}
                className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors whitespace-nowrap ${tab === i ? 'bg-[#ff5000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="grid grid-cols-7 gap-0.5 p-3">
            {CATEGORIES[tab].emojis.map((emoji, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { onPick(emoji); }}
                className="text-xl hover:bg-orange-50 rounded-lg p-1.5 transition-colors leading-none"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
