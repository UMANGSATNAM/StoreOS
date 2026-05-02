import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppView, AppUser, AppStore, AppSubscription, CartItem } from '@/lib/types';

// ============================================================
// StoreOS - Zustand Global Store
// ============================================================

interface AppState {
  // --- Navigation ---
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // --- Auth ---
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  logout: () => void;

  // --- Store (Business) ---
  store: AppStore | null;
  setStore: (store: AppStore | null) => void;

  // --- Subscription ---
  subscription: AppSubscription | null;
  setSubscription: (sub: AppSubscription | null) => void;

  // --- Onboarding ---
  onboardingNiche: string | null;
  setOnboardingNiche: (niche: string) => void;
  onboardingTemplate: string | null;
  setOnboardingTemplate: (template: string) => void;

  // --- Cart ---
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;

  // --- Theme ---
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // --- Dashboard Tab ---
  dashboardTab: string;
  setDashboardTab: (tab: string) => void;

  // --- Sidebar ---
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- Navigation ---
      currentView: { page: 'landing' },
      setCurrentView: (view) => set({ currentView: view }),

      // --- Auth ---
      user: null,
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          user: null,
          store: null,
          subscription: null,
          cart: [],
          currentView: { page: 'landing' },
        }),

      // --- Store (Business) ---
      store: null,
      setStore: (store) => set({ store }),

      // --- Subscription ---
      subscription: null,
      setSubscription: (subscription) => set({ subscription }),

      // --- Onboarding ---
      onboardingNiche: null,
      setOnboardingNiche: (niche) => set({ onboardingNiche: niche }),
      onboardingTemplate: null,
      setOnboardingTemplate: (template) => set({ onboardingTemplate: template }),

      // --- Cart ---
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find(
            (c) => c.productId === item.productId
          );

          if (existing) {
            // Update quantity and recalculate total for existing item
            const newQuantity = existing.quantity + item.quantity;
            const newTotal =
              newQuantity * existing.price * (1 - existing.discount / 100);

            return {
              cart: state.cart.map((c) =>
                c.productId === item.productId
                  ? { ...c, quantity: newQuantity, total: Math.round(newTotal * 100) / 100 }
                  : c
              ),
            };
          }

          // Add new item
          return { cart: [...state.cart, item] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((c) => c.productId !== productId),
        })),

      updateCartItemQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              cart: state.cart.filter((c) => c.productId !== productId),
            };
          }

          return {
            cart: state.cart.map((c) => {
              if (c.productId !== productId) return c;
              const newTotal = quantity * c.price * (1 - c.discount / 100);
              return {
                ...c,
                quantity,
                total: Math.round(newTotal * 100) / 100,
              };
            }),
          };
        }),

      clearCart: () => set({ cart: [] }),

      cartTotal: () => {
        const { cart } = get();
        return Math.round(cart.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
      },

      // --- Theme ---
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      // --- Dashboard Tab ---
      dashboardTab: 'overview',
      setDashboardTab: (tab) => set({ dashboardTab: tab }),

      // --- Sidebar ---
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'storeos-storage',
      // Only persist these fields to localStorage
      partialize: (state) => ({
        user: state.user,
        store: state.store,
        subscription: state.subscription,
        theme: state.theme,
        currentView: state.currentView,
        dashboardTab: state.dashboardTab,
      }),
    }
  )
);
