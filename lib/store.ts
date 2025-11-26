// store/workshopStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkshopCartItem {
  workshopId: string;
  title: string;
  price: number;
  discount: number;
  quantity: number;
  maxSeats: number;
}

interface WorkshopStore {
  cart: Record<string, WorkshopCartItem>;
  addToCart: (item: Omit<WorkshopCartItem, 'quantity'>) => void;
  removeFromCart: (workshopId: string) => void;
  updateQuantity: (workshopId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalSeats: () => number;
}

export const useWorkshopStore = create<WorkshopStore>()(
  persist(
    (set, get) => ({
      cart: {},

      addToCart: (item) => {
        set((state) => ({
          cart: {
            ...state.cart,
            [item.workshopId]: {
              ...item,
              quantity: 1,
            },
          },
        }));
      },

      removeFromCart: (workshopId) => {
        set((state) => {
          const newCart = { ...state.cart };
          delete newCart[workshopId];
          return { cart: newCart };
        });
      },

      updateQuantity: (workshopId, quantity) => {
        set((state) => {
          const item = state.cart[workshopId];
          if (!item) return state;

          // Ensure quantity is within valid range
          const validQuantity = Math.max(1, Math.min(quantity, item.maxSeats));

          return {
            cart: {
              ...state.cart,
              [workshopId]: {
                ...item,
                quantity: validQuantity,
              },
            },
          };
        });
      },

      clearCart: () => set({ cart: {} }),

      getTotalPrice: () => {
        const state = get();
        return Object.values(state.cart).reduce((total, item) => {
          const finalPrice = item.price - (item.price * item.discount) / 100;
          return total + finalPrice * item.quantity;
        }, 0);
      },

      getTotalSeats: () => {
        const state = get();
        return Object.values(state.cart).reduce(
          (total, item) => total + item.quantity,
          0
        );
      },
    }),
    {
      name: 'workshop-cart-storage',
    }
  )
);