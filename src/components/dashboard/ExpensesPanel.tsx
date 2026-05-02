'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  IndianRupee, Plus, Search, Filter, Trash2, Edit3, CalendarDays,
  TrendingDown, TrendingUp, Wallet, CreditCard, Banknote, Smartphone,
  ChevronLeft, ChevronRight, Clock, CircleDot, CheckCircle2, XCircle,
  AlertTriangle, ArrowRight, FileText, Eye, Home, Package, DollarSign,
  Wrench, Megaphone, Truck, UtensilsCrossed, Phone, Sparkles, ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

// ─── Types ────────────────────────────────────────────────────

interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  paymentMethod: PaymentMethod;
  date: string;
  receiptNumber: string;
  receiptNote: string;
  createdAt: string;
}

interface DayRecord {
  id: string;
  date: string;
  status: 'opened' | 'closed' | 'not_opened';
  openingBalance: number;
  openedBy: string;
  openedAt: string;
  closedAt?: string;
  totalSales: number;
  totalExpenses: number;
  totalCashReceived: number;
  totalUPIReceived: number;
  expectedCashBalance: number;
  actualCashCount: number;
  difference: number;
  closingNotes: string;
}

type ExpenseCategory =
  | 'Rent & Utilities'
  | 'Inventory Purchase'
  | 'Salaries & Wages'
  | 'Maintenance & Repair'
  | 'Marketing & Ads'
  | 'Transport & Delivery'
  | 'Food & Refreshments'
  | 'Phone & Internet'
  | 'Cleaning & Housekeeping'
  | 'Miscellaneous';

type PaymentMethod = 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque';

type DateFilter = 'today' | 'week' | 'month' | 'custom';

// ─── Constants ────────────────────────────────────────────────

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent & Utilities',
  'Inventory Purchase',
  'Salaries & Wages',
  'Maintenance & Repair',
  'Marketing & Ads',
  'Transport & Delivery',
  'Food & Refreshments',
  'Phone & Internet',
  'Cleaning & Housekeeping',
  'Miscellaneous',
];

const CATEGORY_CONFIG: Record<ExpenseCategory, { icon: React.ElementType; emoji: string; color: string; bgClass: string; hexColor: string }> = {
  'Rent & Utilities': { icon: Home, emoji: '🏠', color: 'text-amber-700 dark:text-amber-400', bgClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', hexColor: '#f59e0b' },
  'Inventory Purchase': { icon: Package, emoji: '📦', color: 'text-emerald-700 dark:text-emerald-400', bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', hexColor: '#10b981' },
  'Salaries & Wages': { icon: DollarSign, emoji: '💰', color: 'text-blue-700 dark:text-blue-400', bgClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', hexColor: '#3b82f6' },
  'Maintenance & Repair': { icon: Wrench, emoji: '🔧', color: 'text-orange-700 dark:text-orange-400', bgClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', hexColor: '#f97316' },
  'Marketing & Ads': { icon: Megaphone, emoji: '📢', color: 'text-purple-700 dark:text-purple-400', bgClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', hexColor: '#8b5cf6' },
  'Transport & Delivery': { icon: Truck, emoji: '🚚', color: 'text-cyan-700 dark:text-cyan-400', bgClass: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', hexColor: '#06b6d4' },
  'Food & Refreshments': { icon: UtensilsCrossed, emoji: '🍽️', color: 'text-rose-700 dark:text-rose-400', bgClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', hexColor: '#e11d48' },
  'Phone & Internet': { icon: Phone, emoji: '📱', color: 'text-teal-700 dark:text-teal-400', bgClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', hexColor: '#14b8a6' },
  'Cleaning & Housekeeping': { icon: Sparkles, emoji: '🧹', color: 'text-lime-700 dark:text-lime-400', bgClass: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400', hexColor: '#84cc16' },
  'Miscellaneous': { icon: ClipboardList, emoji: '📋', color: 'text-gray-700 dark:text-gray-400', bgClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', hexColor: '#6b7280' },
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = Object.fromEntries(
  Object.entries(CATEGORY_CONFIG).map(([k, v]) => [k, v.hexColor])
) as Record<ExpenseCategory, string>;

const CATEGORY_BG: Record<ExpenseCategory, string> = Object.fromEntries(
  Object.entries(CATEGORY_CONFIG).map(([k, v]) => [k, v.bgClass])
) as Record<ExpenseCategory, string>;

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Bank Transfer', 'UPI', 'Cheque'];

const ITEMS_PER_PAGE = 8;

// ─── Helpers ──────────────────────────────────────────────────

function generateId(): string {
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateDayId(): string {
  return `day_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getMonthStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

function getLastMonthStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().split('T')[0];
}

function getLastMonthEnd(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 0).toISOString().split('T')[0];
}

// ─── Mock Data Generator ──────────────────────────────────────

function generateMockExpenses(): Expense[] {
  const today = new Date();
  const expenses: Expense[] = [];

  const mockEntries: Array<{
    daysAgo: number; category: ExpenseCategory; description: string;
    amount: number; paymentMethod: PaymentMethod; receiptNumber: string; receiptNote: string;
  }> = [
    { daysAgo: 0, category: 'Inventory Purchase', description: 'Vegetable supplies - morning', amount: 3200, paymentMethod: 'Cash', receiptNumber: 'REC-001', receiptNote: 'Fresh veggies from wholesale market' },
    { daysAgo: 0, category: 'Transport & Delivery', description: 'Delivery auto charges', amount: 450, paymentMethod: 'Cash', receiptNumber: '', receiptNote: '' },
    { daysAgo: 0, category: 'Food & Refreshments', description: 'Staff lunch', amount: 500, paymentMethod: 'UPI', receiptNumber: '', receiptNote: 'Lunch for kitchen staff' },
    { daysAgo: 1, category: 'Inventory Purchase', description: 'Grocery & vegetables', amount: 4100, paymentMethod: 'UPI', receiptNumber: 'REC-002', receiptNote: '' },
    { daysAgo: 1, category: 'Maintenance & Repair', description: 'Gas cylinder refill', amount: 1800, paymentMethod: 'Cash', receiptNumber: 'REC-003', receiptNote: '2 cylinders - commercial grade' },
    { daysAgo: 1, category: 'Miscellaneous', description: 'Stationery & printing', amount: 300, paymentMethod: 'UPI', receiptNumber: '', receiptNote: '' },
    { daysAgo: 2, category: 'Rent & Utilities', description: 'Electricity bill - March', amount: 8500, paymentMethod: 'Bank Transfer', receiptNumber: 'ELEC-2024-03', receiptNote: 'Commercial connection - 3 phase' },
    { daysAgo: 2, category: 'Cleaning & Housekeeping', description: 'Cleaning supplies & chemicals', amount: 650, paymentMethod: 'Cash', receiptNumber: '', receiptNote: '' },
    { daysAgo: 3, category: 'Marketing & Ads', description: 'Social media ads - Instagram', amount: 2000, paymentMethod: 'UPI', receiptNumber: '', receiptNote: '7-day campaign for weekend specials' },
    { daysAgo: 3, category: 'Miscellaneous', description: 'Miscellaneous expenses', amount: 500, paymentMethod: 'Cash', receiptNumber: '', receiptNote: '' },
    { daysAgo: 4, category: 'Salaries & Wages', description: 'Staff salary - Ramesh (cook)', amount: 15000, paymentMethod: 'Bank Transfer', receiptNumber: 'SAL-004', receiptNote: 'Monthly salary - March' },
    { daysAgo: 4, category: 'Inventory Purchase', description: 'Meat & poultry', amount: 5600, paymentMethod: 'Cash', receiptNumber: 'REC-005', receiptNote: '' },
    { daysAgo: 5, category: 'Rent & Utilities', description: 'Shop rent - March 2025', amount: 25000, paymentMethod: 'Bank Transfer', receiptNumber: 'RNT-2025-03', receiptNote: 'Monthly shop rent' },
    { daysAgo: 5, category: 'Rent & Utilities', description: 'Water bill', amount: 1200, paymentMethod: 'UPI', receiptNumber: '', receiptNote: '' },
    { daysAgo: 5, category: 'Inventory Purchase', description: 'Spices & condiments', amount: 1800, paymentMethod: 'Cash', receiptNumber: '', receiptNote: 'Bulk purchase - turmeric, cumin, coriander' },
    { daysAgo: 6, category: 'Marketing & Ads', description: 'Pamphlet printing', amount: 1500, paymentMethod: 'Cash', receiptNumber: '', receiptNote: '500 pamphlets for local distribution' },
    { daysAgo: 6, category: 'Maintenance & Repair', description: 'Plumbing repair', amount: 800, paymentMethod: 'Cash', receiptNumber: '', receiptNote: 'Kitchen sink pipe leak fix' },
    { daysAgo: 7, category: 'Salaries & Wages', description: 'Staff salary - Suresh (helper)', amount: 10000, paymentMethod: 'Bank Transfer', receiptNumber: 'SAL-005', receiptNote: 'Monthly salary - March' },
    { daysAgo: 7, category: 'Transport & Delivery', description: 'Monthly vehicle fuel', amount: 2800, paymentMethod: 'UPI', receiptNumber: '', receiptNote: '' },
    { daysAgo: 8, category: 'Food & Refreshments', description: 'Staff meals & tea', amount: 1200, paymentMethod: 'Cash', receiptNumber: '', receiptNote: '' },
    { daysAgo: 9, category: 'Inventory Purchase', description: 'Packaging materials', amount: 2200, paymentMethod: 'UPI', receiptNumber: 'REC-006', receiptNote: '' },
    { daysAgo: 10, category: 'Phone & Internet', description: 'Internet bill', amount: 999, paymentMethod: 'UPI', receiptNumber: '', receiptNote: 'Fibre broadband - monthly' },
    { daysAgo: 11, category: 'Maintenance & Repair', description: 'AC servicing', amount: 3500, paymentMethod: 'Bank Transfer', receiptNumber: 'MNT-007', receiptNote: 'Annual maintenance service' },
    { daysAgo: 12, category: 'Miscellaneous', description: 'Bank charges', amount: 250, paymentMethod: 'Bank Transfer', receiptNumber: '', receiptNote: '' },
    { daysAgo: 14, category: 'Marketing & Ads', description: 'Google ads', amount: 3000, paymentMethod: 'UPI', receiptNumber: '', receiptNote: 'Google Ads - local targeting' },
    { daysAgo: 16, category: 'Rent & Utilities', description: 'Parking area rent', amount: 5000, paymentMethod: 'Cheque', receiptNumber: 'RNT-PARK', receiptNote: '' },
    { daysAgo: 18, category: 'Inventory Purchase', description: 'Dairy products', amount: 3400, paymentMethod: 'Cash', receiptNumber: '', receiptNote: 'Milk, paneer, cream - daily supply' },
    { daysAgo: 20, category: 'Salaries & Wages', description: 'Staff salary - Anita (cashier)', amount: 12000, paymentMethod: 'Bank Transfer', receiptNumber: 'SAL-006', receiptNote: 'Monthly salary - March' },
    { daysAgo: 22, category: 'Phone & Internet', description: 'Mobile recharge - business', amount: 599, paymentMethod: 'UPI', receiptNumber: '', receiptNote: 'Jio business plan' },
    { daysAgo: 25, category: 'Food & Refreshments', description: 'Festival catering advance', amount: 8000, paymentMethod: 'Cheque', receiptNumber: 'FEST-001', receiptNote: 'Holi festival arrangements' },
    { daysAgo: 27, category: 'Cleaning & Housekeeping', description: 'Deep cleaning service', amount: 1500, paymentMethod: 'Cash', receiptNumber: '', receiptNote: 'Monthly deep cleaning' },
    { daysAgo: 30, category: 'Rent & Utilities', description: 'Gas bill', amount: 2100, paymentMethod: 'UPI', receiptNumber: '', receiptNote: '' },
    { daysAgo: 32, category: 'Salaries & Wages', description: 'Staff salary - Priya (waitress)', amount: 9000, paymentMethod: 'Bank Transfer', receiptNumber: 'SAL-007', receiptNote: 'Monthly salary - February' },
    { daysAgo: 35, category: 'Marketing & Ads', description: 'Menu card printing', amount: 2500, paymentMethod: 'Cash', receiptNumber: '', receiptNote: '200 new menu cards' },
    { daysAgo: 40, category: 'Inventory Purchase', description: 'Beverages stock', amount: 4500, paymentMethod: 'UPI', receiptNumber: '', receiptNote: 'Cold drinks and water bottles' },
  ];

  mockEntries.forEach((entry) => {
    const date = new Date(today);
    date.setDate(date.getDate() - entry.daysAgo);
    const createdAt = new Date(date);
    createdAt.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

    expenses.push({
      id: generateId(),
      amount: entry.amount,
      category: entry.category,
      description: entry.description,
      paymentMethod: entry.paymentMethod,
      date: date.toISOString().split('T')[0],
      receiptNumber: entry.receiptNumber,
      receiptNote: entry.receiptNote,
      createdAt: createdAt.toISOString(),
    });
  });

  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generateMockDayHistory(): DayRecord[] {
  const today = new Date();
  const records: DayRecord[] = [];

  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const opening = 10000 + Math.floor(Math.random() * 5000);
    const sales = 8000 + Math.floor(Math.random() * 12000);
    const exp = 2000 + Math.floor(Math.random() * 4000);
    const cashSales = Math.round(sales * 0.4);
    const upiSales = sales - cashSales;
    const cashExp = Math.round(exp * 0.6);
    const expected = opening + cashSales - cashExp;
    const diff = Math.round((Math.random() - 0.5) * 400);
    const actual = expected + diff;

    records.push({
      id: generateDayId(),
      date: dateStr,
      status: 'closed',
      openingBalance: opening,
      openedBy: 'Rajesh Sharma',
      openedAt: new Date(date.setHours(8, 0)).toISOString(),
      closedAt: new Date(date.setHours(22, 30)).toISOString(),
      totalSales: sales,
      totalExpenses: exp,
      totalCashReceived: cashSales,
      totalUPIReceived: upiSales,
      expectedCashBalance: expected,
      actualCashCount: actual,
      difference: diff,
      closingNotes: diff === 0 ? 'All balanced' : `${diff > 0 ? 'Surplus' : 'Shortage'} of ${formatCurrency(Math.abs(diff))}`,
    });
  }

  return records;
}

// ─── LocalStorage helpers ─────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ─── Payment Method Icon ──────────────────────────────────────

function PaymentIcon({ method }: { method: PaymentMethod }) {
  switch (method) {
    case 'Cash':
      return <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'UPI':
      return <Smartphone className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
    case 'Bank Transfer':
      return <CreditCard className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    case 'Cheque':
      return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
  }
}

// ─── Main Component ───────────────────────────────────────────

export default function ExpensesPanel() {
  const store = useAppStore((s) => s.store);
  const storeId = store?.id || 'default';

  // Storage keys
  const expensesKey = `storeos_expenses_${storeId}`;
  const dayHistoryKey = `storeos_day_history_${storeId}`;
  const todayDayKey = `storeos_today_day_${storeId}`;

  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dayHistory, setDayHistory] = useState<DayRecord[]>([]);
  const [todayDay, setTodayDay] = useState<DayRecord | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [openDayDialogOpen, setOpenDayDialogOpen] = useState(false);
  const [closeDayDialogOpen, setCloseDayDialogOpen] = useState(false);
  const [dayDetailOpen, setDayDetailOpen] = useState(false);

  // Form states
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Inventory Purchase');
  const [formDescription, setFormDescription] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('Cash');
  const [formDate, setFormDate] = useState(getTodayStr());
  const [formReceipt, setFormReceipt] = useState('');
  const [formReceiptNote, setFormReceiptNote] = useState('');

  // Day form states
  const [openBalance, setOpenBalance] = useState('');
  const [openNotes, setOpenNotes] = useState('');
  const [closeActualCash, setCloseActualCash] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  // ─── Initialize data ──────────────────────────────────────────
  useEffect(() => {
    const storedExpenses = loadFromStorage<Expense[]>(expensesKey, []);
    const storedDayHistory = loadFromStorage<DayRecord[]>(dayHistoryKey, []);
    const storedTodayDay = loadFromStorage<DayRecord | null>(todayDayKey, null);

    if (storedExpenses.length === 0) {
      const mockExpenses = generateMockExpenses();
      setExpenses(mockExpenses);
      saveToStorage(expensesKey, mockExpenses);
    } else {
      setExpenses(storedExpenses);
    }

    if (storedDayHistory.length === 0) {
      const mockDays = generateMockDayHistory();
      setDayHistory(mockDays);
      saveToStorage(dayHistoryKey, mockDays);
    } else {
      setDayHistory(storedDayHistory);
    }

    // Check if today's day record is still valid (same date)
    if (storedTodayDay) {
      if (storedTodayDay.date === getTodayStr()) {
        setTodayDay(storedTodayDay);
      } else {
        if (storedTodayDay.status === 'opened') {
          storedTodayDay.status = 'closed';
          storedTodayDay.closedAt = new Date().toISOString();
          const updatedHistory = [storedTodayDay, ...storedDayHistory];
          setDayHistory(updatedHistory);
          saveToStorage(dayHistoryKey, updatedHistory);
        }
        setTodayDay(null);
        saveToStorage(todayDayKey, null);
      }
    }

    setInitialized(true);
  }, [expensesKey, dayHistoryKey, todayDayKey]);

  // ─── Computed values ──────────────────────────────────────────
  const todayStr = getTodayStr();
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();
  const lastMonthStart = getLastMonthStart();
  const lastMonthEnd = getLastMonthEnd();

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (dateFilter === 'today') {
      result = result.filter((e) => e.date === todayStr);
    } else if (dateFilter === 'week') {
      result = result.filter((e) => e.date >= weekStart);
    } else if (dateFilter === 'month') {
      result = result.filter((e) => e.date >= monthStart);
    } else if (dateFilter === 'custom' && customDateFrom && customDateTo) {
      result = result.filter((e) => e.date >= customDateFrom && e.date <= customDateTo);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    if (paymentFilter !== 'all') {
      result = result.filter((e) => e.paymentMethod === paymentFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.receiptNumber.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, dateFilter, categoryFilter, paymentFilter, searchQuery, todayStr, weekStart, monthStart, customDateFrom, customDateTo]);

  // Stats
  const todayExpenses = useMemo(
    () => expenses.filter((e) => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0),
    [expenses, todayStr]
  );

  const weekExpenses = useMemo(
    () => expenses.filter((e) => e.date >= weekStart).reduce((sum, e) => sum + e.amount, 0),
    [expenses, weekStart]
  );

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date >= monthStart).reduce((sum, e) => sum + e.amount, 0),
    [expenses, monthStart]
  );

  const lastMonthExpenses = useMemo(
    () => expenses.filter((e) => e.date >= lastMonthStart && e.date <= lastMonthEnd).reduce((sum, e) => sum + e.amount, 0),
    [expenses, lastMonthStart, lastMonthEnd]
  );

  const avgDailyExpense = useMemo(() => {
    const monthExpList = expenses.filter((e) => e.date >= monthStart);
    const uniqueDays = new Set(monthExpList.map((e) => e.date));
    return uniqueDays.size > 0 ? Math.round(monthExpenses / uniqueDays.size) : 0;
  }, [expenses, monthStart, monthExpenses]);

  // Biggest category this month
  const biggestCategory = useMemo(() => {
    const monthExps = expenses.filter((e) => e.date >= monthStart);
    const map: Record<string, number> = {};
    monthExps.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    const sorted = Object.entries(map).sort(([, a], [, b]) => b - a);
    if (sorted.length === 0) return null;
    return { name: sorted[0][0], amount: sorted[0][1] };
  }, [expenses, monthStart]);

  // vs last month percentage change
  const vsLastMonth = useMemo(() => {
    if (lastMonthExpenses === 0) return null;
    const change = ((monthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    return Math.round(change);
  }, [monthExpenses, lastMonthExpenses]);

  // Category breakdown for pie chart
  const categoryBreakdown = useMemo(() => {
    const periodExpenses = dateFilter === 'today'
      ? expenses.filter((e) => e.date === todayStr)
      : dateFilter === 'week'
        ? expenses.filter((e) => e.date >= weekStart)
        : dateFilter === 'month'
          ? expenses.filter((e) => e.date >= monthStart)
          : expenses;

    const map: Record<string, number> = {};
    periodExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name as ExpenseCategory] }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, dateFilter, todayStr, weekStart, monthStart]);

  // Monthly trend data (daily expenses for current month)
  const monthlyTrend = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTotal = expenses
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      if (d <= today.getDate()) {
        data.push({
          date: String(d),
          amount: dayTotal,
        });
      }
    }
    return data;
  }, [expenses]);

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ─── Handlers ─────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setFormAmount('');
    setFormCategory('Inventory Purchase');
    setFormDescription('');
    setFormPaymentMethod('Cash');
    setFormDate(getTodayStr());
    setFormReceipt('');
    setFormReceiptNote('');
    setEditExpenseId(null);
  }, []);

  const handleAddExpense = useCallback(() => {
    const amount = parseFloat(formAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (editExpenseId) {
      setExpenses((prev) => {
        const updated = prev.map((e) =>
          e.id === editExpenseId
            ? {
                ...e,
                amount,
                category: formCategory,
                description: formDescription,
                paymentMethod: formPaymentMethod,
                date: formDate,
                receiptNumber: formReceipt,
                receiptNote: formReceiptNote,
              }
            : e
        );
        saveToStorage(expensesKey, updated);
        return updated;
      });
      toast.success('Expense updated successfully');
    } else {
      const newExpense: Expense = {
        id: generateId(),
        amount,
        category: formCategory,
        description: formDescription,
        paymentMethod: formPaymentMethod,
        date: formDate,
        receiptNumber: formReceipt,
        receiptNote: formReceiptNote,
        createdAt: new Date().toISOString(),
      };

      setExpenses((prev) => {
        const updated = [newExpense, ...prev];
        saveToStorage(expensesKey, updated);
        return updated;
      });
      toast.success('Expense added successfully');
    }

    resetForm();
    setAddExpenseOpen(false);
  }, [formAmount, formCategory, formDescription, formPaymentMethod, formDate, formReceipt, formReceiptNote, editExpenseId, expensesKey, resetForm]);

  const handleEditExpense = useCallback((expense: Expense) => {
    setFormAmount(String(expense.amount));
    setFormCategory(expense.category);
    setFormDescription(expense.description);
    setFormPaymentMethod(expense.paymentMethod);
    setFormDate(expense.date);
    setFormReceipt(expense.receiptNumber);
    setFormReceiptNote(expense.receiptNote || '');
    setEditExpenseId(expense.id);
    setAddExpenseOpen(true);
  }, []);

  const handleDeleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        saveToStorage(expensesKey, updated);
        return updated;
      });
      toast.success('Expense deleted');
    },
    [expensesKey]
  );

  const handleOpenDay = useCallback(() => {
    const balance = parseFloat(openBalance);
    if (!balance || balance < 0) {
      toast.error('Please enter a valid opening balance');
      return;
    }

    const newDay: DayRecord = {
      id: generateDayId(),
      date: getTodayStr(),
      status: 'opened',
      openingBalance: balance,
      openedBy: store?.name || 'Admin',
      openedAt: new Date().toISOString(),
      totalSales: 0,
      totalExpenses: 0,
      totalCashReceived: 0,
      totalUPIReceived: 0,
      expectedCashBalance: balance,
      actualCashCount: 0,
      difference: 0,
      closingNotes: openNotes,
    };

    setTodayDay(newDay);
    saveToStorage(todayDayKey, newDay);
    setOpenDayDialogOpen(false);
    setOpenBalance('');
    setOpenNotes('');
    toast.success('Day opened successfully! Ready for business.');
  }, [openBalance, openNotes, store?.name, todayDayKey]);

  const handleCloseDay = useCallback(() => {
    if (!todayDay) return;

    const actualCash = parseFloat(closeActualCash);
    if (isNaN(actualCash) || actualCash < 0) {
      toast.error('Please enter actual cash count');
      return;
    }

    const todayExpList = expenses.filter((e) => e.date === getTodayStr());
    const totalExp = todayExpList.reduce((sum, e) => sum + e.amount, 0);
    const cashExp = todayExpList.filter((e) => e.paymentMethod === 'Cash').reduce((sum, e) => sum + e.amount, 0);

    const totalSales = 18500 + Math.floor(Math.random() * 5000);
    const cashSales = Math.round(totalSales * 0.45);
    const upiSales = totalSales - cashSales;

    const expected = todayDay.openingBalance + cashSales - cashExp;
    const difference = Math.round(actualCash - expected);

    const closedDay: DayRecord = {
      ...todayDay,
      status: 'closed',
      closedAt: new Date().toISOString(),
      totalSales,
      totalExpenses: totalExp,
      totalCashReceived: cashSales,
      totalUPIReceived: upiSales,
      expectedCashBalance: expected,
      actualCashCount: actualCash,
      difference,
      closingNotes: closeNotes,
    };

    setDayHistory((prev) => {
      const updated = [closedDay, ...prev.slice(0, 6)];
      saveToStorage(dayHistoryKey, updated);
      return updated;
    });

    setTodayDay(null);
    saveToStorage(todayDayKey, null);
    setCloseDayDialogOpen(false);
    setCloseActualCash('');
    setCloseNotes('');

    if (Math.abs(difference) > 100) {
      toast.warning(`Day closed. Difference: ${formatCurrency(Math.abs(difference))} ${difference > 0 ? 'surplus' : 'shortage'}`);
    } else {
      toast.success('Day closed successfully! All balanced.');
    }
  }, [todayDay, closeActualCash, closeNotes, expenses, dayHistoryKey, todayDayKey]);

  // Time since opening
  const timeSinceOpen = useMemo(() => {
    if (!todayDay || todayDay.status !== 'opened') return null;
    const diff = Date.now() - new Date(todayDay.openedAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }, [todayDay]);

  // ─── Custom Tooltip for charts ────────────────────────────────
  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0];
      const total = categoryBreakdown.reduce((s, d) => s + d.value, 0);
      const pct = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-sm" style={{ color: data.payload.color }}>{data.name}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{formatCurrency(data.value)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{pct}% of total</p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">Day {label}</p>
          <p className="font-semibold text-sm text-rose-600 dark:text-rose-400">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // ─── Close day computed values ────────────────────────────────
  const closeDaySummary = useMemo(() => {
    if (!todayDay) return null;

    const todayExpList = expenses.filter((e) => e.date === getTodayStr());
    const totalExp = todayExpList.reduce((sum, e) => sum + e.amount, 0);
    const cashExp = todayExpList.filter((e) => e.paymentMethod === 'Cash').reduce((sum, e) => sum + e.amount, 0);

    const totalSales = 18500 + Math.floor(Math.random() * 5000);
    const cashSales = Math.round(totalSales * 0.45);
    const upiSales = totalSales - cashSales;
    const expected = todayDay.openingBalance + cashSales - cashExp;

    return { totalSales, totalExp, cashSales, upiSales, cashExp, expected };
  }, [todayDay, expenses]);

  if (!initialized) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Expenses</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage your business expenses</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Day Status Button */}
          {(!todayDay || todayDay.status !== 'opened') ? (
            <Dialog open={openDayDialogOpen} onOpenChange={setOpenDayDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Open Day
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Open Day
                  </DialogTitle>
                  <DialogDescription>Enter the opening cash balance to start the business day.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Opening Cash Balance (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 10000"
                      value={openBalance}
                      onChange={(e) => setOpenBalance(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      placeholder="Any notes for the day..."
                      value={openNotes}
                      onChange={(e) => setOpenNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDayDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleOpenDay}>
                    Open Day
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={closeDayDialogOpen} onOpenChange={setCloseDayDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                  <XCircle className="w-4 h-4" />
                  Close Day
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-amber-600" />
                    Close Day — Summary
                  </DialogTitle>
                  <DialogDescription>Review the day&apos;s summary before closing.</DialogDescription>
                </DialogHeader>
                {closeDaySummary && (
                  <div className="space-y-3 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Opening Balance</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(todayDay.openingBalance)}</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-3">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Sales</p>
                        <p className="font-semibold text-emerald-700 dark:text-emerald-300">{formatCurrency(closeDaySummary.totalSales)}</p>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-900/10 rounded-lg p-3">
                        <p className="text-xs text-rose-600 dark:text-rose-400">Total Expenses</p>
                        <p className="font-semibold text-rose-700 dark:text-rose-300">{formatCurrency(closeDaySummary.totalExp)}</p>
                      </div>
                      <div className="bg-sky-50 dark:bg-sky-900/10 rounded-lg p-3">
                        <p className="text-xs text-sky-600 dark:text-sky-400">Cash Received</p>
                        <p className="font-semibold text-sky-700 dark:text-sky-300">{formatCurrency(closeDaySummary.cashSales)}</p>
                      </div>
                      <div className="bg-violet-50 dark:bg-violet-900/10 rounded-lg p-3">
                        <p className="text-xs text-violet-600 dark:text-violet-400">UPI Received</p>
                        <p className="font-semibold text-violet-700 dark:text-violet-300">{formatCurrency(closeDaySummary.upiSales)}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3">
                        <p className="text-xs text-amber-600 dark:text-amber-400">Cash Expenses</p>
                        <p className="font-semibold text-amber-700 dark:text-amber-300">{formatCurrency(closeDaySummary.cashExp)}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expected Cash Balance</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(closeDaySummary.expected)}</p>
                      <p className="text-xs text-gray-400 mt-1">= Opening + Cash Sales - Cash Expenses</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Actual Cash Count (₹) *</Label>
                      <Input
                        type="number"
                        placeholder="Count and enter actual cash"
                        value={closeActualCash}
                        onChange={(e) => setCloseActualCash(e.target.value)}
                      />
                      {closeActualCash && (
                        <p className={`text-sm font-medium ${
                          Math.round(parseFloat(closeActualCash) - closeDaySummary.expected) === 0
                            ? 'text-emerald-600'
                            : Math.abs(parseFloat(closeActualCash) - closeDaySummary.expected) <= 100
                              ? 'text-amber-600'
                              : 'text-red-600'
                        }`}>
                          Difference: {formatCurrency(Math.abs(Math.round(parseFloat(closeActualCash) - closeDaySummary.expected)))}
                          {Math.round(parseFloat(closeActualCash) - closeDaySummary.expected) > 0 ? ' surplus' : Math.round(parseFloat(closeActualCash) - closeDaySummary.expected) < 0 ? ' shortage' : ' — balanced!'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        placeholder="Any closing notes..."
                        value={closeNotes}
                        onChange={(e) => setCloseNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCloseDayDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleCloseDay}>
                    Confirm Close Day
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Add Expense Button */}
          <Dialog open={addExpenseOpen} onOpenChange={(open) => { setAddExpenseOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editExpenseId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                <DialogDescription>Record a new business expense.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={formCategory} onValueChange={(v) => setFormCategory(v as ExpenseCategory)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((c) => {
                          const config = CATEGORY_CONFIG[c];
                          return (
                            <SelectItem key={c} value={c}>
                              <span className="flex items-center gap-2">
                                <span>{config.emoji}</span>
                                <span>{c}</span>
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="What was this expense for?"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={formPaymentMethod} onValueChange={(v) => setFormPaymentMethod(v as PaymentMethod)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Receipt Number (optional)</Label>
                    <Input
                      placeholder="e.g. REC-007"
                      value={formReceipt}
                      onChange={(e) => setFormReceipt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Receipt Note (optional)</Label>
                    <Input
                      placeholder="Add a note..."
                      value={formReceiptNote}
                      onChange={(e) => setFormReceiptNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setAddExpenseOpen(false); resetForm(); }}>Cancel</Button>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleAddExpense}>
                  {editExpenseId ? 'Update' : 'Add'} Expense
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ─── Category Filter Bar ─── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => { setCategoryFilter('all'); setCurrentPage(1); }}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            categoryFilter === 'all'
              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-sm'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {EXPENSE_CATEGORIES.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const isActive = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => { setCategoryFilter(isActive ? 'all' : cat); setCurrentPage(1); }}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                isActive
                  ? `${config.bgClass} shadow-sm ring-1 ring-current`
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{config.emoji}</span>
              <span className="whitespace-nowrap">{cat}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Day Status Widget ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  todayDay?.status === 'opened'
                    ? 'bg-emerald-100 dark:bg-emerald-900/20'
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {todayDay?.status === 'opened' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Today&apos;s Status:
                    </span>
                    {todayDay?.status === 'opened' ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Open
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Not Opened
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {todayDay?.status === 'opened' && (
                      <>
                        <span>Opening: {formatCurrency(todayDay.openingBalance)}</span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeSinceOpen}
                        </span>
                      </>
                    )}
                    {(!todayDay || todayDay.status !== 'opened') && (
                      <span>Open the day to start tracking</span>
                    )}
                  </div>
                </div>
              </div>
              {todayDay?.status === 'opened' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-900/20"
                  onClick={() => setCloseDayDialogOpen(true)}
                >
                  Close Day
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Expense Summary Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border border-gray-200 dark:border-gray-700 border-l-4 border-l-rose-500 shadow-sm bg-gradient-to-br from-rose-50/80 to-white dark:from-rose-900/10 dark:to-gray-900 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">This Month</p>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(monthExpenses)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="border border-gray-200 dark:border-gray-700 border-l-4 border-l-amber-500 shadow-sm bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-900/10 dark:to-gray-900 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Biggest Category</p>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  {biggestCategory ? (
                    <span className="text-sm">{CATEGORY_CONFIG[biggestCategory.name as ExpenseCategory]?.emoji}</span>
                  ) : (
                    <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
              </div>
              <p className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 truncate">
                {biggestCategory ? biggestCategory.name : 'N/A'}
              </p>
              {biggestCategory && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(biggestCategory.amount)}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="border border-gray-200 dark:border-gray-700 border-l-4 border-l-teal-500 shadow-sm bg-gradient-to-br from-teal-50/80 to-white dark:from-teal-900/10 dark:to-gray-900 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Daily Average</p>
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
                {formatCurrency(avgDailyExpense)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="border border-gray-200 dark:border-gray-700 border-l-4 border-l-violet-500 shadow-sm bg-gradient-to-br from-violet-50/80 to-white dark:from-violet-900/10 dark:to-gray-900 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">vs Last Month</p>
                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  {vsLastMonth !== null && vsLastMonth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  )}
                </div>
              </div>
              {vsLastMonth !== null ? (
                <>
                  <p className={`text-xl sm:text-2xl font-bold ${vsLastMonth >= 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {vsLastMonth >= 0 ? '+' : ''}{vsLastMonth}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {vsLastMonth >= 0 ? 'Higher than last month' : 'Lower than last month'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">No data</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Monthly Expense Bar Chart ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Expense Trend</CardTitle>
            <CardDescription>Daily expenses for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    interval={Math.max(0, Math.floor(monthlyTrend.length / 10) - 1)}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="amount" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Category Breakdown</CardTitle>
              <CardDescription>Expense distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string) => (
                          <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  No expense data for this period
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Category List with amounts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Category Details</CardTitle>
              <CardDescription>Breakdown with amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {categoryBreakdown.length > 0 ? categoryBreakdown.map((item) => {
                  const config = CATEGORY_CONFIG[item.name as ExpenseCategory];
                  const total = categoryBreakdown.reduce((s, d) => s + d.value, 0);
                  const pct = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-36 flex-shrink-0">
                        <span className="text-sm">{config?.emoji}</span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-20 text-right">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  );
                }) : (
                  <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                    No data for this period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Filters ─── */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v as DateFilter); setCurrentPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <CalendarDays className="w-4 h-4 mr-1 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[170px]">
                <Filter className="w-4 h-4 mr-1 text-gray-400" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span>{CATEGORY_CONFIG[c].emoji}</span>
                      <span>{c}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Payment Filter */}
            <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <CreditCard className="w-4 h-4 mr-1 text-gray-400" />
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom date range */}
          {dateFilter === 'custom' && (
            <div className="flex gap-3 mt-3">
              <Input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="w-[160px]"
              />
              <span className="self-center text-gray-400">to</span>
              <Input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="w-[160px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Expense Table (Desktop) / Card List (Mobile) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Expense Records</CardTitle>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredExpenses.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No expenses found</p>
                <p className="text-sm">Try adjusting filters or add a new expense</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedExpenses.map((expense) => {
                        const config = CATEGORY_CONFIG[expense.category];
                        return (
                          <TableRow key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <TableCell className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${config?.bgClass || CATEGORY_BG[expense.category]} border-0 text-xs gap-1`}>
                                <span>{config?.emoji}</span>
                                {expense.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-700 dark:text-gray-300 max-w-[200px]">
                              <div className="truncate">{expense.description || '—'}</div>
                              {expense.receiptNote && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{expense.receiptNote}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                              {formatCurrency(expense.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <PaymentIcon method={expense.paymentMethod} />
                                <span className="text-xs text-gray-600 dark:text-gray-400">{expense.paymentMethod}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-sky-600"
                                  onClick={() => handleEditExpense(expense)}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-600"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                  {paginatedExpenses.map((expense) => {
                    const config = CATEGORY_CONFIG[expense.category];
                    return (
                      <div key={expense.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${config?.bgClass || CATEGORY_BG[expense.category]} border-0 text-xs gap-1`}>
                                <span>{config?.emoji}</span>
                                {expense.category}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{expense.description || '—'}</p>
                            {expense.receiptNote && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{expense.receiptNote}</p>
                            )}
                          </div>
                          <p className="font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <PaymentIcon method={expense.paymentMethod} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{expense.paymentMethod}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-sky-600"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-red-600"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? 'default' : 'outline'}
                            size="icon"
                            className={`h-8 w-8 ${pageNum === currentPage ? 'bg-rose-600 hover:bg-rose-700' : ''}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Day History ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-amber-600" />
                  Day History
                </CardTitle>
                <CardDescription>Last 7 days summary</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dayHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No day history</p>
                <p className="text-sm">Start opening and closing days to see history</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Opening</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                        <TableHead className="text-right">Expenses</TableHead>
                        <TableHead className="text-right">Closing</TableHead>
                        <TableHead className="text-right">Difference</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dayHistory.slice(0, 7).map((day) => {
                        const closingBalance = day.actualCashCount || day.expectedCashBalance;
                        const diffColor = day.difference === 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : Math.abs(day.difference) <= 100
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400';

                        return (
                          <TableRow key={day.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <TableCell className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </TableCell>
                            <TableCell className="text-right text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              {formatCurrency(day.openingBalance)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {formatCurrency(day.totalSales)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-rose-600 dark:text-rose-400 whitespace-nowrap">
                              {formatCurrency(day.totalExpenses)}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                              {formatCurrency(closingBalance)}
                            </TableCell>
                            <TableCell className={`text-right text-sm font-semibold ${diffColor} whitespace-nowrap`}>
                              {day.difference === 0 ? (
                                <span className="flex items-center justify-end gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Balanced
                                </span>
                              ) : (
                                <span className="flex items-center justify-end gap-1">
                                  {day.difference > 0 ? (
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <TrendingDown className="w-3.5 h-3.5" />
                                  )}
                                  {formatCurrency(Math.abs(day.difference))}
                                  {day.difference > 0 ? ' surplus' : ' shortage'}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={`border-0 text-xs ${
                                day.difference === 0
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : Math.abs(day.difference) <= 100
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {day.difference === 0 ? 'Balanced' : Math.abs(day.difference) <= 100 ? 'Minor Diff' : 'Mismatch'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card List for Day History */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                  {dayHistory.slice(0, 7).map((day) => {
                    const closingBalance = day.actualCashCount || day.expectedCashBalance;
                    const diffColor = day.difference === 0
                      ? 'text-emerald-600'
                      : Math.abs(day.difference) <= 100
                        ? 'text-amber-600'
                        : 'text-red-600';

                    return (
                      <div key={day.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                          </span>
                          <Badge className={`border-0 text-xs ${
                            day.difference === 0
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : Math.abs(day.difference) <= 100
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {day.difference === 0 ? 'Balanced' : Math.abs(day.difference) <= 100 ? 'Minor' : 'Mismatch'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Opening</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(day.openingBalance)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Closing</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(closingBalance)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Sales</span>
                            <p className="font-medium text-emerald-600">{formatCurrency(day.totalSales)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Expenses</span>
                            <p className="font-medium text-rose-600">{formatCurrency(day.totalExpenses)}</p>
                          </div>
                        </div>
                        {day.difference !== 0 && (
                          <p className={`text-xs mt-2 font-medium ${diffColor}`}>
                            {day.difference > 0 ? 'Surplus' : 'Shortage'}: {formatCurrency(Math.abs(day.difference))}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
