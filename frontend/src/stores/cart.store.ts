/**
 * Cart Store - Zustand
 * استور سبد خرید
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  foodId: string;
  foodName: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  deliveryDate: string | null;
  deliveryTimeSlot: string | null;
  deliveryAddress: string | null;
  notes: string | null;
  promoCode: string | null;
  
  // Computed
  totalItems: number;
  subtotal: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  updateItemNotes: (foodId: string, notes: string) => void;
  setDeliveryInfo: (date: string, timeSlot: string, address: string) => void;
  setNotes: (notes: string) => void;
  setPromoCode: (code: string | null) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryDate: null,
      deliveryTimeSlot: null,
      deliveryAddress: null,
      notes: null,
      promoCode: null,

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
      },

      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.foodId === item.foodId
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += item.quantity || 1;
            return { items: newItems };
          }

          return {
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          };
        }),

      removeItem: (foodId) =>
        set((state) => ({
          items: state.items.filter((item) => item.foodId !== foodId),
        })),

      updateQuantity: (foodId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.foodId !== foodId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.foodId === foodId ? { ...item, quantity } : item
            ),
          };
        }),

      updateItemNotes: (foodId, notes) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.foodId === foodId ? { ...item, notes } : item
          ),
        })),

      setDeliveryInfo: (date, timeSlot, address) =>
        set({
          deliveryDate: date,
          deliveryTimeSlot: timeSlot,
          deliveryAddress: address,
        }),

      setNotes: (notes) => set({ notes }),

      setPromoCode: (promoCode) => set({ promoCode }),

      clearCart: () =>
        set({
          items: [],
          deliveryDate: null,
          deliveryTimeSlot: null,
          deliveryAddress: null,
          notes: null,
          promoCode: null,
        }),
    }),
    {
      name: 'catering-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selectors
export const selectCartItems = (state: CartState) => state.items;
export const selectCartTotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
export const selectCartItemCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = selectCartTotal;
export const selectIsCartEmpty = (state: CartState) => state.items.length === 0;
export const selectDeliveryInfo = (state: CartState) => ({
  date: state.deliveryDate,
  timeSlot: state.deliveryTimeSlot,
  address: state.deliveryAddress,
});

/**
 * Get cart item by food ID
 * دریافت آیتم سبد خرید با شناسه غذا
 */
export const selectCartItemByFoodId = (foodId: string) => (state: CartState) =>
  state.items.find((item) => item.foodId === foodId);

/**
 * Check if food is in cart
 * بررسی وجود غذا در سبد خرید
 */
export const selectIsFoodInCart = (foodId: string) => (state: CartState) =>
  state.items.some((item) => item.foodId === foodId);
