import api from '@/lib/axios';

let cache: any[] | null = null;
let pending: Promise<any[]> | null = null;

export async function getProductsCache(): Promise<any[]> {
  if (cache !== null) return cache;
  if (pending) return pending;
  pending = api.get('/products')
    .then(res => {
      cache = res.data.data || res.data;
      return cache!;
    })
    .catch(() => {
      pending = null;
      return [];
    });
  return pending;
}

export function primeProductsCache(products: any[]) {
  if (cache === null) cache = products;
}
