import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppView, AppUser, AppStore, AppSubscription, CartItem } from '@/lib/types';
import type { Language } from '@/lib/i18n';

// ============================================================
// StoreOS - Zustand Global Store
// ============================================================

// --- Cash Register Types ---

export interface CashRegisterTransaction {
  id: string;
  type: 'sale' | 'cash_in' | 'cash_out' | 'tip' | 'refund';
  amount: number;
  description: string;
  timestamp: string;
  runningBalance: number;
}

export interface CashRegister {
  isOpen: boolean;
  openedAt: string | null;
  openingBalance: number;
  currentBalance: number;
  totalCashIn: number;
  totalCashOut: number;
  totalSales: number;
  totalOrders: number;
  transactions: CashRegisterTransaction[];
  notes: string;
}

export interface CashRegisterDaySummary {
  date: string;
  openingBalance: number;
  closingBalance: number;
  totalSales: number;
  totalCashIn: number;
  totalCashOut: number;
  totalOrders: number;
  expectedBalance: number;
  actualBalance: number;
  difference: number;
  notes: string;
  closedAt: string;
}

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

  // --- Global Search ---
  globalSearch: string;
  setGlobalSearch: (query: string) => void;

  // --- Sidebar ---
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // --- Language ---
  language: Language;
  setLanguage: (lang: Language) => void;

  // --- Cash Register ---
  cashRegister: CashRegister | null;
  cashRegisterHistory: CashRegisterDaySummary[];
  openCashRegister: (openingBalance: number, notes?: string) => void;
  closeCashRegister: (actualBalance: number, notes?: string) => void;
  updateCashRegister: (updates: Partial<CashRegister>) => void;
  addCashRegisterTransaction: (transaction: Omit<CashRegisterTransaction, 'id' | 'timestamp' | 'runningBalance'>) => void;
  recordCashSale: (amount: number, orderId?: string) => void;
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

      // --- Global Search ---
      globalSearch: '',
      setGlobalSearch: (query) => set({ globalSearch: query }),

      // --- Sidebar ---
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // --- Language ---
      language: 'en' as Language,
      setLanguage: (lang) => set({ language: lang }),

      // --- Cash Register ---
      cashRegister: null,
      cashRegisterHistory: [],

      openCashRegister: (openingBalance, notes = '') =>
        set({
          cashRegister: {
            isOpen: true,
            openedAt: new Date().toISOString(),
            openingBalance,
            currentBalance: openingBalance,
            totalCashIn: 0,
            totalCashOut: 0,
            totalSales: 0,
            totalOrders: 0,
            transactions: [],
            notes,
          },
        }),

      closeCashRegister: (actualBalance, notes = '') => {
        const reg = get().cashRegister;
        if (!reg) return;
        const expectedBalance = reg.openingBalance + reg.totalCashIn - reg.totalCashOut;
        const difference = actualBalance - expectedBalance;
        const summary: CashRegisterDaySummary = {
          date: reg.openedAt || new Date().toISOString(),
          openingBalance: reg.openingBalance,
          closingBalance: actualBalance,
          totalSales: reg.totalSales,
          totalCashIn: reg.totalCashIn,
          totalCashOut: reg.totalCashOut,
          totalOrders: reg.totalOrders,
          expectedBalance,
          actualBalance,
          difference,
          notes,
          closedAt: new Date().toISOString(),
        };
        set((state) => ({
          cashRegister: null,
          cashRegisterHistory: [...state.cashRegisterHistory, summary],
        }));
      },

      updateCashRegister: (updates) =>
        set((state) => ({
          cashRegister: state.cashRegister
            ? { ...state.cashRegister, ...updates }
            : null,
        })),

      addCashRegisterTransaction: (transaction) =>
        set((state) => {
          const reg = state.cashRegister;
          if (!reg) return {};
          const amount = transaction.type === 'cash_out' || transaction.type === 'refund'
            ? -Math.abs(transaction.amount)
            : Math.abs(transaction.amount);
          const newBalance = Math.round((reg.currentBalance + amount) * 100) / 100;
          const newTx: CashRegisterTransaction = {
            ...transaction,
            id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: new Date().toISOString(),
            runningBalance: newBalance,
          };
          const totalCashInDelta = transaction.type === 'cash_in' || transaction.type === 'tip'
            ? Math.abs(transaction.amount) : 0;
          const totalCashOutDelta = transaction.type === 'cash_out' || transaction.type === 'refund'
            ? Math.abs(transaction.amount) : 0;
          const totalSalesDelta = transaction.type === 'sale'
            ? Math.abs(transaction.amount) : 0;
          return {
            cashRegister: {
              ...reg,
              currentBalance: newBalance,
              totalCashIn: Math.round((reg.totalCashIn + totalCashInDelta) * 100) / 100,
              totalCashOut: Math.round((reg.totalCashOut + totalCashOutDelta) * 100) / 100,
              totalSales: Math.round((reg.totalSales + totalSalesDelta) * 100) / 100,
              transactions: [...reg.transactions, newTx],
            },
          };
        }),

      recordCashSale: (amount, orderId) => {
        const { addCashRegisterTransaction } = get();
        addCashRegisterTransaction({
          type: 'sale',
          amount,
          description: orderId ? `Cash sale — Order #${orderId}` : 'Cash sale',
        });
        set((state) => {
          const reg = state.cashRegister;
          if (!reg) return {};
          return {
            cashRegister: {
              ...reg,
              totalOrders: reg.totalOrders + 1,
            },
          };
        });
      },
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
        language: state.language,
        cashRegister: state.cashRegister,
        cashRegisterHistory: state.cashRegisterHistory,
      }),
    }
  )
);
