import api from '@/lib/axios';

// Lightweight in-memory cache for the first page (used by Navbar suggestions on focus)
let firstPageCache: any[] | null = null;

export function primeProductsCache(products: any[]) {
  if (firstPageCache === null) firstPageCache = products;
}

// Search via API — returns up to 6 matching products
export async function searchProducts(query: string): Promise<any[]> {
  if (!query.trim()) return [];
  try {
    const res = await api.get('/products', { params: { search: query.trim(), per_page: 6 } });
    return res.data.data || [];
  } catch {
    return [];
  }
}

// For instant suggestions on focus (before user types): use first-page cache or fetch it
export async function getProductsFirstPage(): Promise<any[]> {
  if (firstPageCache !== null) return firstPageCache;
  try {
    const res = await api.get('/products', { params: { per_page: 20 } });
    firstPageCache = res.data.data || [];
    return firstPageCache;
  } catch {
    return [];
  }
}
