import { useEffect, useState } from 'react';

const KEY = 'mian_recently_viewed';
const MAX = 8;

export interface RecentProduct {
  id: number;
  name: string;
  image_url?: string;
  price: string;
  discount_price?: string;
}

export function saveRecentlyViewed(product: any) {
  if (typeof window === 'undefined') return;
  const existing: RecentProduct[] = JSON.parse(localStorage.getItem(KEY) || '[]');
  const filtered = existing.filter(p => p.id !== product.id);
  const updated = [
    { id: product.id, name: product.name, image_url: product.image_url, price: product.price, discount_price: product.discount_price },
    ...filtered,
  ].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>([]);
  useEffect(() => {
    try {
      const stored: RecentProduct[] = JSON.parse(localStorage.getItem(KEY) || '[]');
      setItems(stored);
    } catch {
      setItems([]);
    }
  }, []);
  return items;
}
