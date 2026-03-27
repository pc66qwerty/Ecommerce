"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Grid, Tag } from 'lucide-react';
import api from '@/lib/axios';

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface Props {
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategorySlider({ selected, onSelect }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const all = { id: null, name: 'Todo', image: null };
  const items = [all, ...categories];

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 hide-scrollbar">
      <div className="flex space-x-3 min-w-max">
        {items.map((cat, index) => {
          const isActive = cat.id === selected;
          return (
            <motion.button
              key={cat.id ?? 'all'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(cat.id)}
              className="flex flex-col items-center justify-center space-y-2 cursor-pointer group w-18 outline-none"
            >
              <div
                className={`w-15 h-15 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-300 overflow-hidden
                  ${isActive
                    ? 'bg-[#ff5000] border-[#ff5000] scale-110 shadow-md shadow-[#ff5000]/30'
                    : 'bg-gray-50 border-gray-200 group-hover:scale-105 group-hover:shadow-md group-hover:border-[#ff5000]/40'
                  }`}
              >
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : cat.id === null ? (
                  <Grid size={24} strokeWidth={1.5} className={isActive ? 'text-white' : 'text-[#ff5000]'} />
                ) : (
                  <Tag size={24} strokeWidth={1.5} className={isActive ? 'text-white' : 'text-gray-500'} />
                )}
              </div>
              <span className={`text-[11px] font-bold tracking-tight transition-colors ${isActive ? 'text-[#ff5000]' : 'text-gray-700'}`}>
                {cat.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
