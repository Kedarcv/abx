import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cart store — persists to localStorage so the cart survives reloads.
 * Items are keyed by product slug + variantId (single variant for now).
 */
export const useCart = create(
  persist(
    (set, get) => ({
      items: [], // [{ productId, variantId, slug, name, priceCents, image, quantity }]
      isOpen: false,

      open:  () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle:() => set({ isOpen: !get().isOpen }),

      addItem: (item, qty = 1) => set(state => {
        const idx = state.items.findIndex(i =>
          i.productId === item.productId && i.variantId === item.variantId);
        if (idx >= 0) {
          const next = [...state.items];
          next[idx] = { ...next[idx], quantity: Math.min(99, next[idx].quantity + qty) };
          return { items: next, isOpen: true };
        }
        return { items: [...state.items, { ...item, quantity: qty }], isOpen: true };
      }),

      setQuantity: (productId, variantId, qty) => set(state => ({
        items: state.items
          .map(i => (i.productId === productId && i.variantId === variantId)
            ? { ...i, quantity: Math.max(0, Math.min(99, qty)) } : i)
          .filter(i => i.quantity > 0),
      })),

      remove: (productId, variantId) => set(state => ({
        items: state.items.filter(i => !(i.productId === productId && i.variantId === variantId)),
      })),

      clear: () => set({ items: [] }),

      // selectors
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotalCents: () => get().items.reduce((s, i) => s + i.priceCents * i.quantity, 0),
    }),
    {
      name: 'abx-cart-v1',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
