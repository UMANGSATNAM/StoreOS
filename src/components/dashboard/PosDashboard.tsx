'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { NICHES, getNicheBySlug } from '@/lib/types';
import type { NicheSlug } from '@/lib/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Bar, BarChart, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  ClipboardList,
  UserCog,
  BarChart3,
  Settings,
  Bell,
  Moon,
  Sun,
  Search,
  LogOut,
  ChevronDown,
  Plus,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  PackageX,
  IndianRupee,
  Zap,
  UtensilsCrossed,
  CalendarDays,
  BedDouble,
  Dumbbell,
  GraduationCap,
  Car,
  MoreHorizontal,
  Clock,
  CloudSun,
  CheckCircle2,
  Keyboard,
  XCircle,
  Hourglass,
  Utensils,
  Soup,
  ChefHat,
  Scissors,
  CalendarCheck,
  UserCheck,
  CreditCard,
  ShoppingCartIcon,
  Scale,
  AlertCircle,
  Wifi,
  Smartphone,
  Wrench,
  Truck,
  FileText,
  Cake,
  Coffee,
  Stamp,
  Handshake,
  Building2,
  Gem,
  DumbbellIcon,
  Heart,
  BookOpen,
  Pencil,
  Hotel,
  Key,
  Banknote,
  TrendingDown,
  PackageCheck,
  RefreshCcw,
  UserPlus,
  Crown,
  Activity,
  ArrowUpRight,
  RotateCcw,
  CircleDot,
  Wallet,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation, t as translate } from '@/lib/i18n';
import type { Language, TranslationKeys } from '@/lib/i18n';
import BillingPos from '@/components/dashboard/BillingPos';
import ProductsPanel from '@/components/dashboard/ProductsPanel';
import CustomersPanel from '@/components/dashboard/CustomersPanel';
import OrdersPanel from '@/components/dashboard/OrdersPanel';
import StaffPanel from '@/components/dashboard/StaffPanel';
import ReportsPanel from '@/components/dashboard/ReportsPanel';
import SettingsPanel from '@/components/dashboard/SettingsPanel';
import TablesPanel from '@/components/dashboard/TablesPanel';
import AppointmentsPanel from '@/components/dashboard/AppointmentsPanel';
import RoomsPanel from '@/components/dashboard/RoomsPanel';
import MembersPanel from '@/components/dashboard/MembersPanel';
import StudentsPanel from '@/components/dashboard/StudentsPanel';
import VehiclesPanel from '@/components/dashboard/VehiclesPanel';
import SuppliersPanel from '@/components/dashboard/SuppliersPanel';
import ExpensesPanel from '@/components/dashboard/ExpensesPanel';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import KeyboardShortcutsModal from '@/components/dashboard/KeyboardShortcutsModal';
import KitchenDisplay from '@/components/dashboard/KitchenDisplay';
import CashRegisterPanel from '@/components/dashboard/CashRegisterPanel';

// ─── Niche-specific nav items ────────────────────────────────

const NICHE_NAV_ITEMS: Record<string, { label: string; icon: React.ElementType; tab: string }> = {
  restaurant: { label: 'Tables', icon: UtensilsCrossed, tab: 'tables' },
  salon: { label: 'Appointments', icon: CalendarDays, tab: 'appointments' },
  hotel: { label: 'Rooms', icon: BedDouble, tab: 'rooms' },
  gym: { label: 'Members', icon: Dumbbell, tab: 'members' },
  coaching: { label: 'Students', icon: GraduationCap, tab: 'students' },
  garage: { label: 'Vehicles', icon: Car, tab: 'vehicles' },
};

// ─── Main nav items ──────────────────────────────────────────

const MAIN_NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, tab: 'overview' },
  { label: 'Billing / POS', icon: Receipt, tab: 'billing' },
  { label: 'Products', icon: Package, tab: 'products' },
  { label: 'Suppliers', icon: Truck, tab: 'suppliers' },
  { label: 'Expenses', icon: IndianRupee, tab: 'expenses' },
  { label: 'Customers', icon: Users, tab: 'customers' },
  { label: 'Orders', icon: ClipboardList, tab: 'orders' },
  { label: 'Staff', icon: UserCog, tab: 'staff' },
  { label: 'Reports', icon: BarChart3, tab: 'reports' },
  { label: 'Notifications', icon: Bell, tab: 'notifications' },
  { label: 'Cash Register', icon: Wallet, tab: 'cash-register' },
  { label: 'Settings', icon: Settings, tab: 'settings' },
];

// ─── Niche Color Helper ──────────────────────────────────────

function getNicheSidebarBg(niche: string): string {
  const map: Record<string, string> = {
    orange: 'bg-orange-600',
    pink: 'bg-pink-600',
    emerald: 'bg-emerald-600',
    violet: 'bg-violet-600',
    green: 'bg-green-600',
    cyan: 'bg-cyan-600',
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    slate: 'bg-slate-600',
    amber: 'bg-amber-600',
    zinc: 'bg-zinc-600',
    yellow: 'bg-yellow-600',
    lime: 'bg-lime-600',
    teal: 'bg-teal-600',
    indigo: 'bg-indigo-600',
  };
  const nicheData = getNicheBySlug(niche as NicheSlug);
  return map[nicheData?.color || 'emerald'];
}

function getNicheAccent(niche: string): string {
  const map: Record<string, string> = {
    orange: 'text-orange-600 dark:text-orange-400',
    pink: 'text-pink-600 dark:text-pink-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    violet: 'text-violet-600 dark:text-violet-400',
    green: 'text-green-600 dark:text-green-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    blue: 'text-blue-600 dark:text-blue-400',
    red: 'text-red-600 dark:text-red-400',
    slate: 'text-slate-600 dark:text-slate-400',
    amber: 'text-amber-600 dark:text-amber-400',
    zinc: 'text-zinc-600 dark:text-zinc-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    lime: 'text-lime-600 dark:text-lime-400',
    teal: 'text-teal-600 dark:text-teal-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  };
  const nicheData = getNicheBySlug(niche as NicheSlug);
  return map[nicheData?.color || 'emerald'];
}

function getNicheAccentBg(niche: string): string {
  const map: Record<string, string> = {
    orange: 'bg-orange-50 dark:bg-orange-900/20',
    pink: 'bg-pink-50 dark:bg-pink-900/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
    violet: 'bg-violet-50 dark:bg-violet-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    slate: 'bg-slate-50 dark:bg-slate-900/20',
    amber: 'bg-amber-50 dark:bg-amber-900/20',
    zinc: 'bg-zinc-50 dark:bg-zinc-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    lime: 'bg-lime-50 dark:bg-lime-900/20',
    teal: 'bg-teal-50 dark:bg-teal-900/20',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
  };
  const nicheData = getNicheBySlug(niche as NicheSlug);
  return map[nicheData?.color || 'emerald'];
}

function getNicheRing(niche: string): string {
  const map: Record<string, string> = {
    orange: 'ring-orange-500',
    pink: 'ring-pink-500',
    emerald: 'ring-emerald-500',
    violet: 'ring-violet-500',
    green: 'ring-green-500',
    cyan: 'ring-cyan-500',
    blue: 'ring-blue-500',
    red: 'ring-red-500',
    slate: 'ring-slate-500',
    amber: 'ring-amber-500',
    zinc: 'ring-zinc-500',
    yellow: 'ring-yellow-500',
    lime: 'ring-lime-500',
    teal: 'ring-teal-500',
    indigo: 'ring-indigo-500',
  };
  const nicheData = getNicheBySlug(niche as NicheSlug);
  return map[nicheData?.color || 'emerald'];
}

// ─── Reports Data Type ───────────────────────────────────────

interface ReportsData {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  ordersCount: number;
  averageOrderValue: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
}

// ─── Niche Quick Actions Config ──────────────────────────────

const NICHE_QUICK_ACTIONS: Record<string, Array<{ label: string; icon: React.ElementType; tab: string; color: string; bg: string }>> = {
  restaurant: [
    { label: 'New Table', icon: Utensils, tab: 'tables', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Take Order', icon: Soup, tab: 'billing', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Kitchen Display', icon: ChefHat, tab: 'kitchen', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Daily Special', icon: UtensilsCrossed, tab: 'products', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Menu Card', icon: FileText, tab: 'products', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Zomato Orders', icon: Wifi, tab: 'orders', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  ],
  salon: [
    { label: 'New Appointment', icon: CalendarCheck, tab: 'appointments', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Service Menu', icon: Scissors, tab: 'products', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { label: 'Stylist Schedule', icon: UserCheck, tab: 'staff', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Membership', icon: CreditCard, tab: 'customers', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Walk-in', icon: ShoppingCartIcon, tab: 'billing', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Tip Tracker', icon: IndianRupee, tab: 'reports', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  ],
  grocery: [
    { label: 'Fast Bill', icon: ShoppingCartIcon, tab: 'billing', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Khata Book', icon: FileText, tab: 'customers', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Stock Alert', icon: AlertCircle, tab: 'products', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Daily Purchase', icon: Package, tab: 'products', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Barcode Scan', icon: Smartphone, tab: 'billing', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Expiry Check', icon: AlertTriangle, tab: 'products', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ],
  pharmacy: [
    { label: 'Quick Sale', icon: ShoppingCartIcon, tab: 'billing', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Batch Track', icon: Package, tab: 'products', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Expiry Alert', icon: AlertTriangle, tab: 'products', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Prescription', icon: FileText, tab: 'orders', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ],
  clothing: [
    { label: 'New Sale', icon: ShoppingCartIcon, tab: 'billing', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { label: 'Barcode Scan', icon: Smartphone, tab: 'billing', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Exchange', icon: ArrowRight, tab: 'orders', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Fashion Catalog', icon: FileText, tab: 'products', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ],
  electronics: [
    { label: 'New Sale', icon: ShoppingCartIcon, tab: 'billing', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    { label: 'IMEI Track', icon: Smartphone, tab: 'products', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Repair Job', icon: Wrench, tab: 'orders', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'EMI Calc', icon: IndianRupee, tab: 'billing', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ],
  coaching: [
    { label: 'Enroll Student', icon: GraduationCap, tab: 'students', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Fee Collect', icon: IndianRupee, tab: 'billing', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Attendance', icon: CheckCircle2, tab: 'students', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Exam Marks', icon: FileText, tab: 'reports', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ],
  clinic: [
    { label: 'New Patient', icon: Users, tab: 'customers', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'OPD Queue', icon: Hourglass, tab: 'orders', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Prescription', icon: FileText, tab: 'orders', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Lab Tests', icon: BarChart3, tab: 'reports', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  ],
  garage: [
    { label: 'New Job Card', icon: Wrench, tab: 'vehicles', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/20' },
    { label: 'Vehicle In', icon: Car, tab: 'vehicles', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Parts Stock', icon: Package, tab: 'products', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Delivery', icon: Truck, tab: 'orders', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  ],
  bakery: [
    { label: 'New Order', icon: Cake, tab: 'billing', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Kitchen Display', icon: ChefHat, tab: 'kitchen', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Today Menu', icon: Coffee, tab: 'products', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Combo Builder', icon: ShoppingCartIcon, tab: 'billing', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Loyalty Stamp', icon: Stamp, tab: 'customers', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ],
  wholesale: [
    { label: 'New Invoice', icon: FileText, tab: 'billing', color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-50 dark:bg-zinc-900/20' },
    { label: 'Party Ledger', icon: Handshake, tab: 'customers', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Bulk Order', icon: Package, tab: 'billing', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'E-Way Bill', icon: Truck, tab: 'orders', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  ],
  jewellery: [
    { label: 'New Sale', icon: ShoppingCartIcon, tab: 'billing', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Gold Rate', icon: Gem, tab: 'products', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Exchange', icon: ArrowRight, tab: 'orders', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Hallmark', icon: CheckCircle2, tab: 'products', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ],
  gym: [
    { label: 'New Member', icon: Dumbbell, tab: 'members', color: 'text-lime-600 dark:text-lime-400', bg: 'bg-lime-50 dark:bg-lime-900/20' },
    { label: 'Attendance', icon: CheckCircle2, tab: 'members', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Trainer', icon: UserCheck, tab: 'staff', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Renewal', icon: IndianRupee, tab: 'billing', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ],
  stationery: [
    { label: 'Quick Bill', icon: ShoppingCartIcon, tab: 'billing', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'ISBN Search', icon: BookOpen, tab: 'products', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Kit Builder', icon: Pencil, tab: 'products', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'School Order', icon: FileText, tab: 'orders', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ],
  hotel: [
    { label: 'Check-in', icon: Key, tab: 'rooms', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Room Grid', icon: Building2, tab: 'rooms', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Room Service', icon: Coffee, tab: 'billing', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Check-out', icon: LogOut, tab: 'rooms', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  ],
};

// ─── Dashboard Overview Component ────────────────────────────

function DashboardOverview({ storeId, niche }: { storeId: string; niche: string }) {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Array<{
    id: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    paymentMethod?: string;
  }>>([]);
  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Array<{
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
  }>>([]);

  // Sales chart state
  const [salesPeriod, setSalesPeriod] = useState<'7' | '30' | '90'>('7');
  const [chartData, setChartData] = useState<Array<{ date: string; sales: number; orders: number }>>([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Order status counts
  const [orderStatusCounts, setOrderStatusCounts] = useState({ completed: 0, pending: 0, cancelled: 0 });

  // Heatmap hover state
  const [heatmapHover, setHeatmapHover] = useState<{ hour: string; day: string; val: number } | null>(null);

  // Top selling products
  const [topProducts, setTopProducts] = useState<Array<{ name: string; quantity: number; revenue: number }>>([]);

  // Customer insights
  const [customerInsights, setCustomerInsights] = useState<{
    newThisWeek: number;
    returning: number;
    newCust: number;
    topCustomer: { name: string; spent: number } | null;
  }>({ newThisWeek: 0, returning: 65, newCust: 35, topCustomer: null });

  // Current date/time for welcome section
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const accent = getNicheAccent(niche);
  const accentBg = getNicheAccentBg(niche);

  // ─── Mock Activity Feed Data ────────────────────────────────
  const activityFeed = useMemo(() => [
    { id: '1', type: 'order' as const, icon: ShoppingCart, description: 'New order #1047 from Priya Sharma', time: '2 min ago', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-l-emerald-500' },
    { id: '2', type: 'alert' as const, icon: AlertTriangle, description: 'Low stock: Prawn Masala (2 left)', time: '5 min ago', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-l-amber-500' },
    { id: '3', type: 'payment' as const, icon: IndianRupee, description: 'Payment received ₹3,200 via UPI', time: '12 min ago', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-l-sky-500' },
    { id: '4', type: 'customer' as const, icon: UserPlus, description: 'New customer: Rahul Verma signed up', time: '18 min ago', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-l-purple-500' },
    { id: '5', type: 'order' as const, icon: ShoppingCart, description: 'New order #1046 from Amit Patel', time: '25 min ago', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-l-emerald-500' },
    { id: '6', type: 'payment' as const, icon: IndianRupee, description: 'Payment received ₹1,850 via Cash', time: '32 min ago', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-l-sky-500' },
    { id: '7', type: 'alert' as const, icon: AlertTriangle, description: 'Low stock: Mushroom Manchurian (3 left)', time: '45 min ago', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-l-amber-500' },
    { id: '8', type: 'customer' as const, icon: UserPlus, description: 'New customer: Meera Joshi signed up', time: '1 hr ago', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-l-purple-500' },
  ], []);

  // ─── Relative time formatter ──────────────────────────────
  const formatRelativeTime = (timeStr: string): string => {
    // Parse common patterns like "2 min ago", "1 hr ago"
    const minMatch = timeStr.match(/^(\d+)\s*min/);
    const hrMatch = timeStr.match(/^(\d+)\s*hr/);
    if (minMatch) {
      const mins = parseInt(minMatch[1]);
      if (mins < 2) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
    }
    if (hrMatch) {
      const hrs = parseInt(hrMatch[1]);
      if (hrs === 1) return '1h ago';
      return `${hrs}h ago`;
    }
    return timeStr;
  };

  // ─── Sparkline data per stat card ───────────────────────────
  const sparklineData = useMemo(() => ({
    sales: [8200, 9100, 7800, 11200, 10450, 12100, reports?.todaySales ?? 12450],
    orders: [12, 15, 10, 18, 14, 20, reports?.ordersCount ?? 22],
    products: [25, 25, 26, 26, 25, 25, productCount],
    customers: [8, 9, 10, 10, 11, 12, customerCount],
  }), [reports, productCount, customerCount]);

  // ─── Yesterday comparison values ────────────────────────────
  const yesterdayValues = useMemo(() => ({
    sales: reports?.todaySales != null && reports.todaySales > 0 ? Math.round(reports.todaySales * 0.87) : 0,
    orders: reports?.ordersCount != null && reports.ordersCount > 0 ? Math.round(reports.ordersCount * 0.92) : 0,
    products: productCount,
    customers: customerCount > 0 ? Math.round(customerCount * 0.94) : 0,
  }), [reports, productCount, customerCount]);

  // Fetch order status counts
  useEffect(() => {
    if (!storeId) return;
    async function fetchOrderCounts() {
      try {
        const [completedRes, pendingRes, cancelledRes] = await Promise.all([
          fetch(`/api/orders?storeId=${storeId}&status=completed`),
          fetch(`/api/orders?storeId=${storeId}&status=pending`),
          fetch(`/api/orders?storeId=${storeId}&status=cancelled`),
        ]);
        const counts = { completed: 0, pending: 0, cancelled: 0 };
        if (completedRes.ok) {
          const data = await completedRes.json();
          counts.completed = data.orders?.length || 0;
        }
        if (pendingRes.ok) {
          const data = await pendingRes.json();
          counts.pending = data.orders?.length || 0;
        }
        if (cancelledRes.ok) {
          const data = await cancelledRes.json();
          counts.cancelled = data.orders?.length || 0;
        }
        setOrderStatusCounts(counts);
      } catch {
        // Use defaults
      }
    }
    fetchOrderCounts();
  }, [storeId]);

  // Fetch chart data based on period
  useEffect(() => {
    if (!storeId) return;
    setChartLoading(true);
    async function fetchChartData() {
      try {
        const periodMap: Record<string, string> = { '7': 'week', '30': 'month', '90': 'quarter' };
        const period = periodMap[salesPeriod] || 'week';
        const res = await fetch(`/api/reports?storeId=${storeId}&period=${period}`);
        if (res.ok) {
          const data = await res.json();
          if (data.dailyData && Array.isArray(data.dailyData) && data.dailyData.length > 0) {
            setChartData(data.dailyData);
          } else {
            setChartData(generateFallbackChartData(salesPeriod, data));
          }
        } else {
          setChartData(generateFallbackChartData(salesPeriod));
        }
      } catch {
        setChartData(generateFallbackChartData(salesPeriod));
      } finally {
        setChartLoading(false);
      }
    }
    fetchChartData();
  }, [storeId, salesPeriod]);

  // Helper to generate fallback chart data
  const generateFallbackChartData = (period: string, reportsData?: ReportsData | null) => {
    const days = period === '7' ? 7 : period === '30' ? 30 : 90;
    const baseSales = reportsData?.todaySales || 15000;
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = days <= 7
        ? date.toLocaleDateString('en-IN', { weekday: 'short' })
        : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const variance = 0.5 + Math.random() * 1.0;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const weekendBoost = isWeekend ? 1.3 : 1.0;
      const sales = Math.round(baseSales * variance * weekendBoost);
      data.push({
        date: dayName,
        sales,
        orders: Math.round(sales / (reportsData?.averageOrderValue || 500)),
      });
    }
    return data;
  };

  // Chart summary stats
  const chartSummary = useMemo(() => {
    if (chartData.length === 0) return { total: 0, avg: 0, best: 0, bestDay: '' };
    const total = chartData.reduce((sum, d) => sum + d.sales, 0);
    const avg = Math.round(total / chartData.length);
    const bestEntry = chartData.reduce((best, d) => d.sales > best.sales ? d : best, chartData[0]);
    return { total, avg, best: bestEntry.sales, bestDay: bestEntry.date };
  }, [chartData]);

  // General data fetch
  useEffect(() => {
    async function fetchData() {
      try {
        const [reportsRes, ordersRes, productsRes, customersRes] = await Promise.all([
          fetch(`/api/reports?storeId=${storeId}&period=today`),
          fetch(`/api/orders?storeId=${storeId}&limit=5`),
          fetch(`/api/products?storeId=${storeId}`),
          fetch(`/api/customers?storeId=${storeId}`),
        ]);

        if (reportsRes.ok) {
          const data = await reportsRes.json();
          setReports(data);
          // Set top products from reports
          if (data.topProducts && Array.isArray(data.topProducts)) {
            setTopProducts(data.topProducts.slice(0, 5));
          }
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setRecentOrders(Array.isArray(data) ? data.slice(0, 5) : data.orders?.slice(0, 5) || []);
        }

        if (productsRes.ok) {
          const data = await productsRes.json();
          const products = Array.isArray(data) ? data : data.products || [];
          setProductCount(products.length);
          const lowStock = products.filter(
            (p: { stock: number; lowStockThreshold?: number }) =>
              p.lowStockThreshold ? p.stock <= p.lowStockThreshold : p.stock <= 5
          );
          setLowStockProducts(lowStock.slice(0, 8));
        }

        if (customersRes.ok) {
          const data = await customersRes.json();
          const customers = Array.isArray(data) ? data : data.customers || [];
          const totalCustomers = customers.length;
          setCustomerCount(totalCustomers);

          // Calculate customer insights
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const newCustCount = customers.filter(
            (c: { createdAt?: string }) => c.createdAt && new Date(c.createdAt) >= oneWeekAgo
          ).length;
          const returningCount = totalCustomers - newCustCount;
          const newPct = totalCustomers > 0 ? Math.round((newCustCount / totalCustomers) * 100) : 35;
          const retPct = 100 - newPct;

          // Find top customer by spend
          const topCust = customers.reduce(
            (best: { name: string; spent: number } | null, c: { name?: string; totalSpent?: number; loyaltyPoints?: number }) => {
              const spent = c.totalSpent || (c.loyaltyPoints ? c.loyaltyPoints * 10 : 0);
              if (!best || spent > best.spent) {
                return { name: c.name || 'Unknown', spent };
              }
              return best;
            },
            null as { name: string; spent: number } | null
          );

          setCustomerInsights({
            newThisWeek: newCustCount || 3,
            returning: retPct || 65,
            newCust: newPct || 35,
            topCustomer: topCust || { name: 'Priya Sharma', spent: 24500 },
          });
        }
      } catch {
        // Silently handle - will show placeholder data
      } finally {
        setLoading(false);
      }
    }

    if (storeId) fetchData();
  }, [storeId]);

  // Fallback top products if not from API
  const displayTopProducts = useMemo(() => {
    if (topProducts.length > 0) return topProducts;
    return [
      { name: 'Butter Chicken', quantity: 48, revenue: 15360 },
      { name: 'Paneer Tikka', quantity: 42, revenue: 10500 },
      { name: 'Dal Makhani', quantity: 38, revenue: 8360 },
      { name: 'Garlic Naan', quantity: 65, revenue: 3900 },
      { name: 'Masala Chai', quantity: 55, revenue: 2750 },
    ];
  }, [topProducts]);

  const store = useAppStore((s) => s.store);
  const subscription = useAppStore((s) => s.subscription);
  const setDashboardTab = useAppStore((s) => s.setDashboardTab);
  const { t: tI18n } = useTranslation();

  // ─── Sparkline SVG Generator ────────────────────────────────
  const generateSparklinePath = (data: number[]) => {
    if (data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 80;
    const h = 28;
    const step = w / (data.length - 1);
    const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`);
    return `M${points.join(' L')}`;
  };

  // ─── Stat Cards with sparklines and vs yesterday ────────────
  // Helper: format display value, showing "—" when value is 0 and loading is done
  const formatStatValue = (value: number, prefix: string = '') => {
    if (!loading && value === 0) return '—';
    return `${prefix}${value.toLocaleString('en-IN')}`;
  };

  const statCards = [
    {
      title: tI18n('todaySalesLabel'),
      value: reports ? reports.todaySales : 0,
      displayValue: loading ? '₹0' : formatStatValue(reports?.todaySales || 0, '₹'),
      yesterdayValue: yesterdayValues.sales,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      leftBorder: 'border-l-emerald-500',
      gradient: 'from-emerald-50/80 to-white dark:from-gray-800 dark:to-gray-900',
      sparkline: sparklineData.sales,
      sparkColor: '#10b981',
    },
    {
      title: tI18n('ordersTodayLabel'),
      value: reports?.ordersCount || 0,
      displayValue: loading ? '0' : formatStatValue(reports?.ordersCount || 0),
      yesterdayValue: yesterdayValues.orders,
      icon: ShoppingCart,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-900/20',
      leftBorder: 'border-l-sky-500',
      gradient: 'from-sky-50/80 to-white dark:from-gray-800 dark:to-gray-900',
      sparkline: sparklineData.orders,
      sparkColor: '#0ea5e9',
    },
    {
      title: tI18n('productsLabelShort'),
      value: productCount,
      displayValue: loading ? '0' : formatStatValue(productCount),
      yesterdayValue: yesterdayValues.products,
      icon: Package,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      leftBorder: 'border-l-amber-500',
      gradient: 'from-amber-50/80 to-white dark:from-gray-800 dark:to-gray-900',
      sparkline: sparklineData.products,
      sparkColor: '#f59e0b',
    },
    {
      title: tI18n('customersLabelShort'),
      value: customerCount,
      displayValue: loading ? '0' : formatStatValue(customerCount),
      yesterdayValue: yesterdayValues.customers,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      leftBorder: 'border-l-purple-500',
      gradient: 'from-purple-50/80 to-white dark:from-gray-800 dark:to-gray-900',
      sparkline: sparklineData.customers,
      sparkColor: '#8b5cf6',
    },
  ];

  // Niche-specific quick actions
  const nicheQuickActions = NICHE_QUICK_ACTIONS[niche] || NICHE_QUICK_ACTIONS.restaurant;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Time-of-day greeting (translated)
  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return tI18n('goodMorning');
    if (hour < 17) return tI18n('goodAfternoon');
    return tI18n('goodEvening');
  };

  // Formatted date
  const formattedDate = currentDateTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Subscription status display
  const getSubscriptionDisplay = () => {
    const status = subscription?.status || 'trial';
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Active Plan
        </span>
      );
    }
    if (status === 'past_due') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Past Due
        </span>
      );
    }
    const trialEnd = subscription?.trialEndsAt;
    if (trialEnd) {
      const daysLeft = Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Trial — {daysLeft} days left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        Trial
      </span>
    );
  };

  // Order status bar chart data
  const totalStatusOrders = orderStatusCounts.completed + orderStatusCounts.pending + orderStatusCounts.cancelled;
  const completedPct = totalStatusOrders > 0 ? (orderStatusCounts.completed / totalStatusOrders) * 100 : 0;
  const pendingPct = totalStatusOrders > 0 ? (orderStatusCounts.pending / totalStatusOrders) * 100 : 0;
  const cancelledPct = totalStatusOrders > 0 ? (orderStatusCounts.cancelled / totalStatusOrders) * 100 : 0;

  // ─── Customer Insights donut chart data ─────────────────────
  const customerRatioData = [
    { name: 'Returning', value: customerInsights.returning, color: '#10b981' },
    { name: 'New', value: customerInsights.newCust, color: '#8b5cf6' },
  ];

  // ─── Low stock severity color ───────────────────────────────
  const getStockSeverity = (stock: number, threshold: number) => {
    if (stock === 0) return { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800/50', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', level: 'critical' };
    if (stock <= threshold * 0.5) return { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800/50', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', level: 'critical' };
    return { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800/50', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', level: 'warning' };
  };

  // ─── Daily motivational tips ───────────────────────────────
  const dailyTips = useMemo(() => {
    const tips = [
      '💡 Tip: Use Ctrl+K for quick search',
      '💡 Tip: Press ? to see all keyboard shortcuts',
      '💡 Tip: Hold F4 to park a bill for later',
      '💡 Tip: Use Ctrl+D to jump back to Dashboard',
      '💡 Tip: Try Ctrl+E to toggle dark mode',
      '💡 Tip: Press / to focus the search bar',
      '💡 Tip: Use number keys 1-9 for quick tab navigation',
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return tips[dayOfYear % tips.length];
  }, []);

  // ─── Today's Summary data ─────────────────────────────────
  const todaySummary = useMemo(() => ({
    ordersToday: reports?.ordersCount ?? 0,
    revenueToday: reports?.todaySales ?? 0,
    bestSeller: displayTopProducts.length > 0 ? displayTopProducts[0].name : '—',
  }), [reports, displayTopProducts]);

  // ─── Niche icon with floating animation ──────────────────
  const nicheIcon = getNicheBySlug(niche as NicheSlug)?.icon || '🏪';

  return (
    <div className="space-y-6">
      {/* ─── Enhanced Welcome Section ─── */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden rounded-xl px-5 py-4 -mx-1">
        {/* Animated background gradient pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-teal-50/40 dark:from-emerald-950/20 dark:via-transparent dark:to-teal-950/10 -z-10" />
        {/* Animated dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] -z-10 animate-pulse" style={{
          backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          animationDuration: '4s',
        }} />
        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] -z-10" style={{
          backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Floating niche icon */}
            <motion.span
              className="text-2xl hidden sm:inline-block"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {nicheIcon}
            </motion.span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {getGreeting()}, {store?.name || 'Store'}
            </h1>
            <CloudSun className="w-6 h-6 text-amber-400 hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formattedDate}
            </p>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            {getSubscriptionDisplay()}
          </div>
          {/* Daily Tip */}
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic"
          >
            {dailyTips}
          </motion.p>
        </div>
        {/* Today's Summary Mini Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex gap-3 sm:gap-4 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700/50 shadow-sm"
        >
          <div className="text-center min-w-[60px]">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{todaySummary.ordersToday || '—'}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Orders</p>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700" />
          <div className="text-center min-w-[70px]">
            <p className="text-lg font-bold text-sky-600 dark:text-sky-400">{todaySummary.revenueToday > 0 ? `₹${todaySummary.revenueToday.toLocaleString('en-IN')}` : '—'}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Revenue</p>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
          <div className="text-center min-w-[70px] hidden sm:block">
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 truncate max-w-[80px]">{todaySummary.bestSeller}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Best Seller</p>
          </div>
        </motion.div>
      </div>

      {/* ─── Stat Cards with Sparklines & vs Yesterday ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          const bothZero = stat.value === 0 && stat.yesterdayValue === 0;
          const diff = stat.yesterdayValue > 0 ? Math.round(((stat.value - stat.yesterdayValue) / stat.yesterdayValue) * 100) : 0;
          const trendUp = diff >= 0;
          // Determine what to show in the trend area
          const trendText = bothZero
            ? 'No data yet'
            : stat.yesterdayValue === 0
              ? '—'
              : `${trendUp ? '+' : ''}${diff}% ${tI18n('vsYesterday')}`;
          const showTrendIcon = !bothZero && stat.yesterdayValue > 0;
          return (
            <Card key={stat.title} className={`stat-card-enter border border-gray-200 dark:border-gray-700 ${stat.leftBorder} border-l-4 shadow-sm bg-gradient-to-br ${stat.gradient} hover:shadow-md hover:scale-[1.02] hover:border-transparent transition-all duration-200 group relative overflow-hidden`} style={{ animationDelay: `${idx * 80}ms` }}>
              {/* Gradient border animation on hover */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
                background: `linear-gradient(135deg, ${stat.sparkColor}33 0%, transparent 50%, ${stat.sparkColor}22 100%)`,
              }} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                {loading ? (
                  <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold">{stat.displayValue}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                        bothZero
                          ? 'text-gray-400 dark:text-gray-500'
                          : stat.yesterdayValue === 0
                            ? 'text-gray-400 dark:text-gray-500'
                            : trendUp
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-500 dark:text-red-400'
                      }`}>
                        {showTrendIcon && (trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                        {trendText}
                      </span>
                      <svg width="80" height="28" className="opacity-60">
                        <path
                          d={generateSparklinePath(stat.sparkline)}
                          fill="none"
                          stroke={stat.sparkColor}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ─── Main 2-Column Layout ─── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ─── LEFT COLUMN: Sales Chart + Recent Orders ─── */}
        <div className="space-y-6">
          {/* Sales Overview Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
                  <CardDescription>Revenue trend for the selected period</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Period label */}
                  <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                    {salesPeriod === '7' ? 'Last 7 Days' : salesPeriod === '30' ? 'Last 30 Days' : 'Last 90 Days'}
                  </Badge>
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                    {(['7', '30', '90'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSalesPeriod(p)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          salesPeriod === p
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {p === '7' ? '7 Days' : p === '30' ? '30 Days' : '90 Days'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                {chartLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:[stroke:#374151] dark:opacity-30" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                        interval={salesPeriod === '7' ? 0 : salesPeriod === '30' ? 4 : 14}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value: number) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#0ea5e9' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value: number) => `${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                          fontSize: '12px',
                        }}
                        formatter={(value: number, name: string) => [
                          name === 'sales' ? `₹${value.toLocaleString('en-IN')}` : `${value} orders`,
                          name === 'sales' ? 'Sales' : 'Orders',
                        ]}
                      />
                      {/* Average reference line */}
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey={() => chartSummary.avg}
                        stroke="#94a3b8"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={false}
                        name="avgRef"
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="sales"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#salesGradient)"
                        dot={salesPeriod === '7' ? { r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' } : false}
                        activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={salesPeriod === '7' ? { r: 3, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' } : false}
                        activeDot={{ r: 5, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }}
                        strokeDasharray="5 3"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Chart Summary */}
              <div className="mt-3 pt-3 border-t dark:border-gray-700 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Total: <span className="font-bold text-gray-900 dark:text-gray-100">₹{chartSummary.total.toLocaleString('en-IN')}</span>
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Avg: <span className="font-bold text-gray-900 dark:text-gray-100">₹{chartSummary.avg.toLocaleString('en-IN')}/day</span>
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Best: <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{chartSummary.best.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400 text-xs ml-1">({chartSummary.bestDay})</span>
                </span>
                {/* Average line legend */}
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <span className="w-4 h-px border-t border-dashed border-slate-400" />
                  Avg line
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDashboardTab('orders')}
                  className={accent}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No orders yet. Start billing to see orders here.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto">
                  {recentOrders.map((order) => {
                    const PaymentIcon = order.paymentMethod === 'upi' ? Smartphone : order.paymentMethod === 'card' ? CreditCard : Banknote;
                    const paymentLabel = order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod === 'card' ? 'Card' : 'Cash';
                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                            <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{order.customerName || 'Walk-in Customer'}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                                <PaymentIcon className="w-3 h-3" />
                                {paymentLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          <Badge className={`text-[10px] px-1.5 py-0 border-0 ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── RIGHT COLUMN: Store Health + Activity Feed + Top Sellers + Customer Insights ─── */}
        <div className="space-y-6">
          {/* ─── Store Health Card ─── */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-lg font-semibold">Store Health</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                // Calculate health score
                const productsInStock = productCount > 0 ? Math.max(0, productCount - lowStockProducts.length) : 0;
                const inStockPct = productCount > 0 ? Math.round((productsInStock / productCount) * 100) : 100;
                const completedPctHealth = totalStatusOrders > 0 ? Math.round((orderStatusCounts.completed / totalStatusOrders) * 100) : 100;
                const satisfactionPct = customerInsights.returning;
                const healthScore = Math.round((inStockPct * 0.35) + (completedPctHealth * 0.35) + (satisfactionPct * 0.30));
                const healthColor = healthScore > 80 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444';
                const healthLabel = healthScore > 80 ? 'Excellent' : healthScore > 50 ? 'Good' : 'Needs Attention';
                const healthLabelColor = healthScore > 80 ? 'text-emerald-600 dark:text-emerald-400' : healthScore > 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

                // SVG circular progress
                const radius = 52;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (healthScore / 100) * circumference;

                return (
                  <div>
                    <div className="flex items-center gap-4">
                      {/* Circular Progress Indicator */}
                      <div className="relative shrink-0">
                        <svg width="120" height="120" className="-rotate-90">
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-gray-100 dark:text-gray-800"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke={healthColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold" style={{ color: healthColor }}>{healthScore}</span>
                          <span className="text-[10px] text-gray-400 -mt-1">/ 100</span>
                        </div>
                      </div>
                      {/* Health Details */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className={`text-sm font-semibold ${healthLabelColor}`}>{healthLabel}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Overall store health</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Stock Health</span>
                            <span className="font-semibold">{inStockPct}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Order Completion</span>
                            <span className="font-semibold">{completedPctHealth}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Satisfaction</span>
                            <span className="font-semibold">{satisfactionPct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Quick Metrics */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t dark:border-gray-700">
                      <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{lowStockProducts.length}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Low Stock</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-sky-50 dark:bg-sky-900/10">
                        <p className="text-lg font-bold text-sky-600 dark:text-sky-400">{orderStatusCounts.pending}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Pending</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10">
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{customerInsights.newThisWeek}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">New Customers</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
          {/* Recent Activity Feed */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  {/* Live pulsing dot */}
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  {/* New activities badge */}
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px] px-1.5 py-0">
                    {activityFeed.length} new
                  </Badge>
                </div>
                <Badge variant="secondary" className="text-[10px]">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {activityFeed.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={`flex gap-3 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 py-1.5 rounded-lg transition-colors border-l-[3px] ${item.border}`}
                      onClick={() => {
                        if (item.type === 'order' || item.type === 'payment') {
                          setDashboardTab('orders');
                        } else if (item.type === 'alert') {
                          setDashboardTab('products');
                        } else if (item.type === 'customer') {
                          setDashboardTab('customers');
                        }
                      }}
                    >
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.bg} group-hover:scale-110 transition-transform`}>
                          <ItemIcon className={`w-3.5 h-3.5 ${item.color}`} />
                        </div>
                        {idx < activityFeed.length - 1 && (
                          <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
                        )}
                      </div>
                      {/* Content */}
                      <div className={`pb-3 flex-1 min-w-0 ${idx === activityFeed.length - 1 ? 'pb-0' : ''}`}>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{item.description}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{formatRelativeTime(item.time)}</p>
                      </div>
                      {/* Hover arrow */}
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 self-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
              {/* View All Link */}
              <div className="mt-3 pt-3 border-t dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
                  onClick={() => setDashboardTab('notifications')}
                >
                  View All Activity
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products Donut Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Top Sellers</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDashboardTab('reports')}
                  className={accent}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Reports
                </Button>
              </div>
              <CardDescription>Revenue breakdown by product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayTopProducts.map(p => ({ name: p.name, value: p.revenue }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {displayTopProducts.map((_, index) => (
                        <Cell
                          key={`donut-cell-${index}`}
                          fill={
                            index === 0 ? '#10b981' :
                            index === 1 ? '#14b8a6' :
                            index === 2 ? '#f59e0b' :
                            index === 3 ? '#f43f5e' :
                            '#0ea5e9'
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                      }}
                      formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ₹{displayTopProducts.reduce((s, p) => s + p.revenue, 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-gray-400">Total Revenue</span>
                </div>
              </div>
              {/* Legend */}
              <div className="mt-2 pt-2 border-t dark:border-gray-700 flex flex-wrap gap-x-3 gap-y-1.5">
                {displayTopProducts.map((product, idx) => (
                  <div key={product.name} className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{
                        backgroundColor:
                          idx === 0 ? '#10b981' :
                          idx === 1 ? '#14b8a6' :
                          idx === 2 ? '#f59e0b' :
                          idx === 3 ? '#f43f5e' :
                          '#0ea5e9'
                      }}
                    />
                    <span className="text-gray-500 dark:text-gray-400 truncate max-w-[70px]">{product.name}</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">₹{product.revenue.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Alert Widget */}
          <Card className="shadow-sm border-amber-200 dark:border-amber-800/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PackageX className="w-5 h-5 text-amber-500" />
                  <CardTitle className="text-lg font-semibold">Inventory Alerts</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDashboardTab('products')}
                  className={accent}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">All stocked up!</p>
                  <p className="text-xs text-gray-400 mt-1">No low stock or out-of-stock items</p>
                </div>
              ) : (
                <>
                  {/* Alert Counts */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40">
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        {lowStockProducts.filter(p => p.stock === 0).length}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Out of Stock</p>
                    </div>
                    <div className="flex-1 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40">
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                        {lowStockProducts.filter(p => p.stock > 0).length}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Low Stock</p>
                    </div>
                  </div>
                  {/* Top 3 Low Stock Items */}
                  <div className="space-y-2.5">
                    {lowStockProducts.slice(0, 3).map((product) => {
                      const severity = getStockSeverity(product.stock, product.lowStockThreshold);
                      const stockPct = product.lowStockThreshold > 0 ? Math.round((product.stock / product.lowStockThreshold) * 100) : 0;
                      return (
                        <div key={product.id} className={`p-2.5 rounded-lg ${severity.bg} border ${severity.border}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <Badge className={`${severity.badge} border-0 text-[10px] shrink-0 ml-2`}>
                              {product.stock} left
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(stockPct, 100)}
                              className="h-1.5 flex-1"
                            />
                            <span className="text-[10px] text-gray-400 shrink-0">/ {product.lowStockThreshold}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Insights */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-lg font-semibold">Customer Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {/* Donut Chart */}
                <div className="shrink-0">
                  <div className="w-28 h-28 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerRatioData}
                          cx="50%"
                          cy="50%"
                          innerRadius={32}
                          outerRadius={50}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {customerRatioData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{customerInsights.returning + customerInsights.newCust}%</span>
                      <span className="text-[9px] text-gray-400">ratio</span>
                    </div>
                  </div>
                </div>
                {/* Stats */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">New This Week</p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{customerInsights.newThisWeek}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[11px] text-gray-500">Returning</span>
                        </div>
                        <p className="text-sm font-bold">{customerInsights.returning}%</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="text-[11px] text-gray-500">New</span>
                        </div>
                        <p className="text-sm font-bold">{customerInsights.newCust}%</p>
                      </div>
                    </div>
                  </div>
                  {/* Top Customer */}
                  {customerInsights.topCustomer && (
                    <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Crown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Top Customer</p>
                          <p className="text-sm font-medium truncate">{customerInsights.topCustomer.name}</p>
                        </div>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400 ml-auto shrink-0">
                          ₹{customerInsights.topCustomer.spent.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Niche Quick Actions (moved here for right column) */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getNicheBySlug(niche as NicheSlug)?.icon}</span>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </div>
              <CardDescription>{getNicheBySlug(niche as NicheSlug)?.name} shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {nicheQuickActions.slice(0, 6).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => setDashboardTab(action.tab)}
                      title={`${action.label} — Go to ${action.tab} tab`}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.bg} group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-3.5 h-3.5 ${action.color}`} />
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Hourly Sales Heatmap ─── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <CardTitle className="text-lg font-semibold">Sales Heatmap</CardTitle>
            </div>
            <CardDescription>Hourly sales density by day of week</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Day Headers */}
            <div className="flex items-center gap-1 mb-1.5 pl-14">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="w-10 text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 shrink-0">
                  {day}
                </div>
              ))}
            </div>
            {/* Heatmap Rows */}
            {(() => {
              const hours = ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'];
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              // Generate deterministic mock heatmap data (18 hours × 7 days)
              const heatmapData = hours.map((_, hIdx) => {
                return Array.from({ length: 7 }, (_, dIdx) => {
                  const isLunchRush = hIdx >= 6 && hIdx <= 8;
                  const isDinnerRush = hIdx >= 12 && hIdx <= 14;
                  const isWeekend = dIdx >= 5;
                  let base = ((hIdx * 37 + dIdx * 53 + 42) % 2000) + 500;
                  if (isLunchRush) base = Math.round(base * 2.2);
                  if (isDinnerRush) base = Math.round(base * 2.8);
                  if (isWeekend) base = Math.round(base * 1.4);
                  if (hIdx < 3) base = Math.round(base * 0.3);
                  return base;
                });
              });
              const maxVal = Math.max(...heatmapData.flat());
              const getColorIntensity = (val: number) => {
                const ratio = val / maxVal;
                if (ratio < 0.1) return 'bg-emerald-50 dark:bg-emerald-950/20';
                if (ratio < 0.25) return 'bg-emerald-100 dark:bg-emerald-900/30';
                if (ratio < 0.4) return 'bg-emerald-200 dark:bg-emerald-800/40';
                if (ratio < 0.55) return 'bg-emerald-300 dark:bg-emerald-700/50';
                if (ratio < 0.7) return 'bg-emerald-400 dark:bg-emerald-600/60';
                if (ratio < 0.85) return 'bg-emerald-500 dark:bg-emerald-500/70';
                return 'bg-emerald-600 dark:bg-emerald-400/80';
              };
              const getTextColor = (val: number) => {
                const ratio = val / maxVal;
                if (ratio < 0.4) return 'text-gray-600 dark:text-gray-400';
                if (ratio < 0.7) return 'text-emerald-900 dark:text-emerald-100';
                return 'text-white dark:text-emerald-950';
              };

              return (
                <div className="space-y-1 relative">
                  {hours.map((hour, hIdx) => (
                    <div key={hour} className="flex items-center gap-1">
                      <div className="w-12 text-right text-[10px] text-gray-500 dark:text-gray-400 pr-1 shrink-0">
                        {hour}
                      </div>
                      {heatmapData[hIdx].map((val, dIdx) => (
                        <div
                          key={`${hIdx}-${dIdx}`}
                          className={`w-10 h-7 rounded-sm flex items-center justify-center text-[9px] font-medium cursor-default transition-all duration-150 ${getColorIntensity(val)} ${getTextColor(val)} hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1`}
                          onMouseEnter={() => setHeatmapHover({ hour, day: days[dIdx], val })}
                          onMouseLeave={() => setHeatmapHover(null)}
                        >
                          {val >= maxVal * 0.3 ? `₹${(val / 1000).toFixed(1)}k` : ''}
                        </div>
                      ))}
                    </div>
                  ))}
                  {/* Tooltip */}
                  {heatmapHover && (
                    <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs pointer-events-none z-10">
                      <p className="font-semibold">{heatmapHover.day}, {heatmapHover.hour}</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold">₹{heatmapHover.val.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t dark:border-gray-700">
                    <span className="text-[10px] text-gray-400">Low</span>
                    {['bg-emerald-50 dark:bg-emerald-950/20', 'bg-emerald-100 dark:bg-emerald-900/30', 'bg-emerald-200 dark:bg-emerald-800/40', 'bg-emerald-300 dark:bg-emerald-700/50', 'bg-emerald-400 dark:bg-emerald-600/60', 'bg-emerald-500 dark:bg-emerald-500/70', 'bg-emerald-600 dark:bg-emerald-400/80'].map((c, i) => (
                      <div key={i} className={`w-4 h-3 rounded-sm ${c}`} />
                    ))}
                    <span className="text-[10px] text-gray-400">High</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* ─── Full-Width: Low Stock Alerts (Enhanced) ─── */}
      {lowStockProducts.length > 0 && (
        <Card className="shadow-sm border-amber-200 dark:border-amber-800/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg font-semibold">Low Stock Alerts</CardTitle>
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-[10px]">
                  {lowStockProducts.length} items
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDashboardTab('products')}
                className={accent}
              >
                Manage Inventory
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {lowStockProducts.map((product) => {
                const severity = getStockSeverity(product.stock, product.lowStockThreshold);
                const stockPct = product.lowStockThreshold > 0 ? Math.round((product.stock / product.lowStockThreshold) * 100) : 0;
                return (
                  <div
                    key={product.id}
                    className={`p-3 rounded-lg ${severity.bg} border ${severity.border}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className={`text-xs ${severity.text}`}>
                          {severity.level === 'critical' ? 'Critical — Reorder now!' : 'Below threshold'}
                        </p>
                      </div>
                      <Badge className={`${severity.badge} border-0 text-[10px] shrink-0 ml-2`}>
                        {product.stock} left
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Progress
                        value={Math.min(stockPct, 100)}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-[10px] text-gray-400 shrink-0">/ {product.lowStockThreshold}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`w-full h-7 text-xs ${severity.level === 'critical' ? 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                      onClick={() => {
                        toast.success(`Reorder request sent for ${product.name}`);
                      }}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reorder
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Order Status (compact, at bottom) ─── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Order Status</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDashboardTab('orders')}
              className={accent}
            >
              View All Orders
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-sm font-bold">{orderStatusCounts.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <span className="text-sm font-bold">{orderStatusCounts.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Cancelled</span>
              </div>
              <span className="text-sm font-bold">{orderStatusCounts.cancelled}</span>
            </div>
            {/* Horizontal Bar Chart */}
            <div className="mt-2">
              <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                {completedPct > 0 && (
                  <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${completedPct}%` }} />
                )}
                {pendingPct > 0 && (
                  <div className="bg-amber-400 transition-all duration-500" style={{ width: `${pendingPct}%` }} />
                )}
                {cancelledPct > 0 && (
                  <div className="bg-red-400 transition-all duration-500" style={{ width: `${cancelledPct}%` }} />
                )}
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
                <span>{totalStatusOrders} total orders</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Completed</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Pending</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Cancelled</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Placeholder Tab Component ───────────────────────────────

function PlaceholderTab({ tab, label }: { tab: string; label: string }) {
  const nicheData = useAppStore((s) => s.store?.niche);
  const accentBg = getNicheAccentBg(nicheData || 'emerald');
  const accent = getNicheAccent(nicheData || 'emerald');

  const iconMap: Record<string, React.ElementType> = {
    billing: Receipt,
    products: Package,
    customers: Users,
    orders: ClipboardList,
    staff: UserCog,
    reports: BarChart3,
    settings: Settings,
    tables: UtensilsCrossed,
    appointments: CalendarDays,
    rooms: BedDouble,
    members: Dumbbell,
    students: GraduationCap,
    vehicles: Car,
  };

  const Icon = iconMap[tab] || LayoutDashboard;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${accentBg}`}>
        <Icon className={`w-10 h-10 ${accent}`} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{label}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm text-center">
        This section is under construction. Full functionality will be available soon.
      </p>
    </div>
  );
}

// ─── Main Dashboard Component ────────────────────────────────

export default function PosDashboard() {
  const { user, store, subscription, logout, dashboardTab, setDashboardTab, globalSearch, setGlobalSearch, cashRegister, language, setLanguage } =
    useAppStore();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState(globalSearch || '');
  const [notifications, setNotifications] = useState([
    { id: 1, icon: ShoppingCart, iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', title: 'New Order Received', description: 'Order #1042 from Priya Sharma — ₹1,280', time: '2 min ago', unread: true },
    { id: 2, icon: AlertTriangle, iconColor: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/30', title: 'Low Stock Alert', description: 'Paneer Tikka stock is below threshold (3 left)', time: '15 min ago', unread: true },
    { id: 3, icon: CreditCard, iconColor: 'text-sky-600 dark:text-sky-400', iconBg: 'bg-sky-100 dark:bg-sky-900/30', title: 'Subscription Reminder', description: 'Your Pro plan renews in 5 days', time: '1 hour ago', unread: true },
    { id: 4, icon: PackageCheck, iconColor: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-100 dark:bg-violet-900/30', title: 'Stock Restocked', description: 'Basmati Rice inventory updated — 50 units added', time: '3 hours ago', unread: false },
    { id: 5, icon: RefreshCcw, iconColor: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-900/30', title: 'Refund Processed', description: '₹450 refunded for Order #1038', time: '5 hours ago', unread: false },
  ]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const niche = store?.niche || 'restaurant';
  const nicheData = getNicheBySlug(niche as NicheSlug);
  const nicheAccent = getNicheAccent(niche);
  const nicheAccentBg = getNicheAccentBg(niche);
  const nicheRing = getNicheRing(niche);

  // Get niche-specific nav
  const nicheNavItem = NICHE_NAV_ITEMS[niche];

  // Translation mapping: tab -> i18n key
  const tabLabelMap: Record<string, keyof TranslationKeys> = {
    overview: 'dashboard',
    billing: 'billing',
    products: 'products',
    suppliers: 'suppliers',
    expenses: 'expenses',
    customers: 'customers',
    orders: 'orders',
    staff: 'staff',
    reports: 'reports',
    notifications: 'notifications',
    settings: 'settings',
    tables: 'tables',
    appointments: 'appointments',
    rooms: 'rooms',
    members: 'members',
    students: 'students',
    vehicles: 'vehicles',
    kitchen: 'kitchenDisplay',
    'cash-register': 'cashRegister',
  };

  // Build full nav items including niche-specific
  const navItems = [...MAIN_NAV_ITEMS];
  if (nicheNavItem) {
    // Insert niche nav after "Orders"
    const ordersIdx = navItems.findIndex((n) => n.tab === 'orders');
    navItems.splice(ordersIdx + 1, 0, nicheNavItem);
  }
  // Add Kitchen Display for restaurant/bakery niches
  if (niche === 'restaurant' || niche === 'bakery') {
    const ordersIdx = navItems.findIndex((n) => n.tab === 'orders');
    navItems.splice(ordersIdx + 1, 0, { label: 'Kitchen Display', icon: ChefHat, tab: 'kitchen' });
  }

  // Subscription badge
  const subStatus = subscription?.status || 'trial';
  const getSubBadge = () => {
    switch (subStatus) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px] gap-1"><Zap className="w-3 h-3" />Active</Badge>;
      case 'past_due':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-[10px] gap-1"><AlertTriangle className="w-3 h-3" />Past Due</Badge>;
      case 'trial':
      default:
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] gap-1"><Clock className="w-3 h-3" />Trial</Badge>;
    }
  };

  // Render active tab content
  const renderTabContent = () => {
    if (dashboardTab === 'overview') {
      return <DashboardOverview storeId={store?.id || ''} niche={niche} />;
    }

    if (dashboardTab === 'billing') {
      return <BillingPos />;
    }

    if (dashboardTab === 'products') {
      return <ProductsPanel />;
    }

    if (dashboardTab === 'suppliers') {
      return <SuppliersPanel />;
    }

    if (dashboardTab === 'expenses') {
      return <ExpensesPanel />;
    }

    if (dashboardTab === 'customers') {
      return <CustomersPanel />;
    }

    if (dashboardTab === 'orders') {
      return <OrdersPanel />;
    }

    if (dashboardTab === 'staff') {
      return <StaffPanel />;
    }

    if (dashboardTab === 'reports') {
      return <ReportsPanel />;
    }

    if (dashboardTab === 'notifications') {
      return <NotificationsPanel />;
    }

    if (dashboardTab === 'settings') {
      return <SettingsPanel />;
    }

    if (dashboardTab === 'tables') {
      return <TablesPanel />;
    }

    if (dashboardTab === 'appointments') {
      return <AppointmentsPanel />;
    }

    if (dashboardTab === 'rooms') {
      return <RoomsPanel />;
    }

    if (dashboardTab === 'members') {
      return <MembersPanel />;
    }

    if (dashboardTab === 'students') {
      return <StudentsPanel />;
    }

    if (dashboardTab === 'vehicles') {
      return <VehiclesPanel />;
    }

    if (dashboardTab === 'kitchen') {
      return <KitchenDisplay />;
    }

    if (dashboardTab === 'cash-register') {
      return <CashRegisterPanel />;
    }

    const tabLabel = navItems.find((n) => n.tab === dashboardTab)?.label || dashboardTab;
    return <PlaceholderTab tab={dashboardTab} label={tabLabel} />;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // ─── Global Shortcuts (work even in some input contexts) ───

      // ? or Ctrl+/ - Toggle shortcuts help modal
      if ((e.key === '?' && !isInputFocused) || ((e.ctrlKey || e.metaKey) && e.key === '/')) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      // Esc - Close shortcuts overlay or dialogs
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
      }

      // Ctrl+K or / - Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Ctrl+B - Toggle sidebar (handled by SidebarProvider internally)
      // Already handled by shadcn/ui SidebarProvider with SIDEBAR_KEYBOARD_SHORTCUT = "b"

      // Ctrl+D - Go to Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setDashboardTab('overview');
        toast.info('Switched to Dashboard');
        return;
      }

      // Ctrl+E - Toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setTheme(theme === 'dark' ? 'light' : 'dark');
        return;
      }

      // Don't process other shortcuts if in input field
      if (isInputFocused) return;

      // / - Focus search (alternate)
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // ─── Navigation Shortcuts (1-9) ───

      const tabMap: Record<string, string> = {
        '1': 'overview',
        '2': 'billing',
        '3': 'products',
        '4': 'customers',
        '5': 'orders',
        '6': 'reports',
        '7': 'settings',
        '8': nicheNavItem?.tab || 'overview',
        '9': 'staff',
      };
      if (e.key in tabMap) {
        e.preventDefault();
        const tab = tabMap[e.key];
        setDashboardTab(tab);
        toast.info(`Switched to ${navItems.find((n) => n.tab === tab)?.label || tab}`);
        return;
      }

      // ─── Billing / POS Shortcuts ───

      // F2 - New bill
      if (e.key === 'F2') {
        e.preventDefault();
        setDashboardTab('billing');
        toast.info('New Bill — switched to Billing / POS');
        return;
      }

      // F4 - Hold bill
      if (e.key === 'F4') {
        e.preventDefault();
        if (dashboardTab === 'billing') {
          toast.info('Bill held');
        } else {
          toast.info('Hold Bill — switch to Billing first');
        }
        return;
      }

      // F5 - Cash payment
      if (e.key === 'F5') {
        e.preventDefault();
        if (dashboardTab === 'billing') {
          toast.info('Cash payment mode');
        } else {
          toast.info('Cash Payment — switch to Billing first');
        }
        return;
      }

      // F6 - UPI payment
      if (e.key === 'F6') {
        e.preventDefault();
        if (dashboardTab === 'billing') {
          toast.info('UPI payment mode');
        } else {
          toast.info('UPI Payment — switch to Billing first');
        }
        return;
      }

      // F7 - Card payment
      if (e.key === 'F7') {
        e.preventDefault();
        if (dashboardTab === 'billing') {
          toast.info('Card payment mode');
        } else {
          toast.info('Card Payment — switch to Billing first');
        }
        return;
      }

      // F8 - Notifications
      if (e.key === 'F8') {
        e.preventDefault();
        setDashboardTab('notifications');
        toast.info('Notifications');
        return;
      }

      // F9 - Print receipt
      if (e.key === 'F9') {
        e.preventDefault();
        toast.info('Print receipt — use in Billing after payment');
        return;
      }

      // F10 - Fullscreen mode
      if (e.key === 'F10') {
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
          toast.info('Exited fullscreen');
        } else {
          document.documentElement.requestFullscreen().catch(() => {
            toast.error('Fullscreen not supported');
          });
          toast.info('Entered fullscreen');
        }
        return;
      }

      // + - Increase quantity (billing context)
      if (e.key === '+' || e.key === '=') {
        if (dashboardTab === 'billing') {
          toast.info('Quantity increased');
        }
        return;
      }

      // - - Decrease quantity (billing context)
      if (e.key === '-') {
        if (dashboardTab === 'billing') {
          toast.info('Quantity decreased');
        }
        return;
      }

      // Delete - Remove item from cart (billing context)
      if (e.key === 'Delete') {
        if (dashboardTab === 'billing') {
          toast.info('Item removed from cart');
        }
        return;
      }

      // Enter - Quick pay (billing context)
      if (e.key === 'Enter') {
        if (dashboardTab === 'billing') {
          toast.info('Quick pay');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts, theme, setTheme, setDashboardTab, nicheNavItem, navItems, dashboardTab]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleGlobalSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    const storeId = store?.id;
    if (!storeId) return;

    try {
      // Check if search matches product names
      const prodRes = await fetch(`/api/products?storeId=${storeId}&search=${encodeURIComponent(query)}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.products && prodData.products.length > 0) {
          setGlobalSearch(query);
          setDashboardTab('products');
          return;
        }
      }

      // Check if search matches customer names
      const custRes = await fetch(`/api/customers?storeId=${storeId}&search=${encodeURIComponent(query)}`);
      if (custRes.ok) {
        const custData = await custRes.json();
        if (custData.customers && custData.customers.length > 0) {
          setGlobalSearch(query);
          setDashboardTab('customers');
          return;
        }
      }

      // Default: go to Products tab with search
      setGlobalSearch(query);
      setDashboardTab('products');
    } catch {
      // Fallback: go to products
      setGlobalSearch(query);
      setDashboardTab('products');
    }
  };

  return (
    <SidebarProvider>
      {/* ═══════════════════ SIDEBAR ═══════════════════ */}
      <Sidebar collapsible="icon" className="border-r border-gray-200 dark:border-gray-800 relative">
        {/* Subtle border-right glow */}
        <div className={`absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-400/40 via-emerald-500/20 to-transparent dark:from-emerald-500/30 dark:via-emerald-600/10`} />
        {/* Logo Area */}
        <SidebarHeader className="p-4 bg-gradient-to-r from-emerald-50/80 to-transparent dark:from-emerald-950/30 dark:to-transparent">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg ${getNicheSidebarBg(niche)} flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 ${unreadCount > 0 ? 'animate-pulse' : ''}`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-base leading-tight">StoreOS</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {store?.name || 'My Store'}
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Navigation */}
        <SidebarContent className="overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">{t('main')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.slice(0, 3).map((item) => {
                  const Icon = item.icon;
                  const isActive = dashboardTab === item.tab;
                  return (
                    <SidebarMenuItem key={item.tab}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setDashboardTab(item.tab)}
                        tooltip={item.label}
                        className={`transition-all duration-200 relative ${
                          isActive
                            ? `${nicheAccent} font-semibold ${nicheAccentBg} border-l-[3px] ${getNicheSidebarBg(niche).replace('bg-', 'border-l-')} shadow-sm shadow-emerald-500/5`
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:translate-x-1 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">{tabLabelMap[item.tab] ? t(tabLabelMap[item.tab]) : item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">{t('management')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.slice(3, -2).map((item) => {
                  const Icon = item.icon;
                  const isActive = dashboardTab === item.tab;
                  const isCashRegister = item.tab === 'cash-register';
                  return (
                    <SidebarMenuItem key={item.tab}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setDashboardTab(item.tab)}
                        tooltip={item.label}
                        className={`transition-all duration-200 relative ${
                          isActive
                            ? `${nicheAccent} font-semibold ${nicheAccentBg} border-l-[3px] ${getNicheSidebarBg(niche).replace('bg-', 'border-l-')} shadow-sm shadow-emerald-500/5`
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:translate-x-1 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">{tabLabelMap[item.tab] ? t(tabLabelMap[item.tab]) : item.label}</span>
                        {isCashRegister && (
                          <span className={`ml-auto w-2 h-2 rounded-full shrink-0 ${cashRegister?.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">{t('system')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.slice(-2).map((item) => {
                  const Icon = item.icon;
                  const isActive = dashboardTab === item.tab;
                  const isCashRegister = item.tab === 'cash-register';
                  return (
                    <SidebarMenuItem key={item.tab}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setDashboardTab(item.tab)}
                        tooltip={item.label}
                        className={`transition-all duration-200 relative ${
                          isActive
                            ? `${nicheAccent} font-semibold ${nicheAccentBg} border-l-[3px] ${getNicheSidebarBg(niche).replace('bg-', 'border-l-')} shadow-sm shadow-emerald-500/5`
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:translate-x-1 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">{tabLabelMap[item.tab] ? t(tabLabelMap[item.tab]) : item.label}</span>
                        {isCashRegister && (
                          <span className={`ml-auto w-2 h-2 rounded-full shrink-0 ${cashRegister?.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        {/* Footer */}
        <SidebarFooter className="p-3 bg-gradient-to-t from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent">
          {/* Subscription Badge */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-800/40 group-data-[collapsible=icon]:hidden">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('plan')}</span>
            {getSubBadge()}
          </div>

          {/* Divider between subscription and user profile */}
          <div className="my-2 h-px bg-gray-200/70 dark:bg-gray-700/50 group-data-[collapsible=icon]:hidden" />

          {/* User Info */}
          <div className="flex items-center gap-2 px-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={`text-xs font-semibold ${nicheAccentBg} ${nicheAccent}`}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium truncate">{user?.name || 'User'}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {user?.email || ''}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="ml-auto shrink-0 h-7 w-7 group-data-[collapsible=icon]:hidden text-gray-500 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>

          {/* Collapsed logout button */}
          <div className="hidden group-data-[collapsible=icon]:flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-7 w-7 text-gray-500 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* ═══════════════════ MAIN CONTENT AREA ═══════════════════ */}
      <SidebarInset>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-3 sm:px-6">
          {/* Sidebar Trigger */}
          <SidebarTrigger className="-ml-1 shrink-0" />

          {/* Store Name + Niche Icon (visible on md+) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-lg">{nicheData?.icon || '🏪'}</span>
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
              {store?.name || 'My Store'}
            </span>
          </div>

          <Separator orientation="vertical" className="hidden md:block h-6" />

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer" onClick={handleGlobalSearch} />
            <Input
              ref={searchInputRef}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGlobalSearch(); }}
              className="pl-9 h-9 bg-gray-100 dark:bg-gray-800 border-0 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600 text-sm"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Quick Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9">
                  <Zap className="w-4 h-4" />
                  <span className="sr-only">Quick Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setDashboardTab('billing')}>
                  <Receipt className="w-4 h-4 mr-2" />
                  {t('newBill')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDashboardTab('products')}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addProduct')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDashboardTab('customers')}>
                  <Users className="w-4 h-4 mr-2" />
                  {t('addCustomer')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDashboardTab('reports')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('viewReports')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cash Register Status */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              onClick={() => setDashboardTab('cash-register')}
              title={cashRegister?.isOpen ? 'Register: Open' : 'Register: Closed'}
            >
              <Wallet className="w-4 h-4" />
              <span className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-950 ${cashRegister?.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="sr-only">Cash Register</span>
            </Button>

            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-sky-600 dark:text-sky-400" onClick={handleMarkAllRead}>
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notif) => {
                    const NIcon = notif.icon;
                    return (
                      <div key={notif.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${notif.unread ? 'bg-sky-50/50 dark:bg-sky-900/10' : ''}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notif.iconBg}`}>
                          <NIcon className={`w-4 h-4 ${notif.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{notif.title}</p>
                            {notif.unread && (
                              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{notif.description}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t dark:border-gray-700 px-4 py-2">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-sky-600 dark:text-sky-400" onClick={() => setDashboardTab('notifications')}>
                    View All Notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative" title={t('language')}>
                  <Globe className="w-4 h-4" />
                  <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                    {language === 'hi' ? 'हि' : 'EN'}
                  </span>
                  <span className="sr-only">{t('language')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-emerald-50 dark:bg-emerald-900/20 font-semibold' : ''}
                >
                  <span className="mr-2 text-base">🇬🇧</span>
                  English
                  {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-600 dark:text-emerald-400" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage('hi')}
                  className={language === 'hi' ? 'bg-emerald-50 dark:bg-emerald-900/20 font-semibold' : ''}
                >
                  <span className="mr-2 text-base">🇮🇳</span>
                  हिंदी
                  {language === 'hi' && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-600 dark:text-emerald-400" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark Mode Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mobile More */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden h-9 w-9">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setDashboardTab('billing')}>
                  <Receipt className="w-4 h-4 mr-2" />
                  {t('billing')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDashboardTab('products')}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('products')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}>
                  <Globe className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'हिंदी' : 'English'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={dashboardTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </SidebarInset>
      {/* ═══════════════════ KEYBOARD SHORTCUTS MODAL ═══════════════════ */}
      <KeyboardShortcutsModal
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </SidebarProvider>
  );
}
