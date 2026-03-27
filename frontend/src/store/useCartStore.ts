import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CartStore {
  items: CartItem[];
  fetchCart: () => void;
  addToCart: (product: any, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      fetchCart: () => {
        // Cart is persisted in localStorage via zustand persist middleware — no fetch needed
      },

      addToCart: (product, quantity) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(i => i.product_id === product.id);
        
        const priceVal = product.discount_price ? Number(product.discount_price) : Number(product.price);
        
        if (isNaN(priceVal) || priceVal <= 0) {
            console.error("Product has no valid price", product);
            alert("Cannot add product with invalid price.");
            return;
        }

        if (existingItem) {
          set({
            items: currentItems.map(i => 
              i.product_id === product.id 
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          });
        } else {
          set({
            items: [...currentItems, {
              id: Date.now(),
              product_id: product.id,
              name: product.name,
              price: priceVal,
              quantity: quantity,
              image_url: product.image_url || product.images?.[0] || ''
            }]
          });
        }
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map(i => i.product_id === productId ? { ...i, quantity } : i)
        });
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter(i => i.product_id !== productId)
        });
      },
      
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'ecommerce-cart'
    }
  )
);
