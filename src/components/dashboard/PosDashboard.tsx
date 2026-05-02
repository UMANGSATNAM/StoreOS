'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { NICHES, getNicheBySlug } from '@/lib/types';
import type { NicheSlug } from '@/lib/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';
import { toast } from 'sonner';
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
  { label: 'Customers', icon: Users, tab: 'customers' },
  { label: 'Orders', icon: ClipboardList, tab: 'orders' },
  { label: 'Staff', icon: UserCog, tab: 'staff' },
  { label: 'Reports', icon: BarChart3, tab: 'reports' },
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
    { label: 'Kitchen Display', icon: ChefHat, tab: 'orders', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
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

  // Current date/time for welcome section
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const accent = getNicheAccent(niche);
  const accentBg = getNicheAccentBg(niche);

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
          // If API returns daily data, use it. Otherwise generate from summary.
          if (data.dailyData && Array.isArray(data.dailyData)) {
            setChartData(data.dailyData);
          } else {
            // Generate chart data from available reports
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
      // Vary sales with some randomness
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
          setLowStockProducts(lowStock.slice(0, 5));
        }

        if (customersRes.ok) {
          const data = await customersRes.json();
          setCustomerCount(Array.isArray(data) ? data.length : data.customers?.length || 0);
        }
      } catch {
        // Silently handle - will show placeholder data
      } finally {
        setLoading(false);
      }
    }

    if (storeId) fetchData();
  }, [storeId]);

  const store = useAppStore((s) => s.store);
  const subscription = useAppStore((s) => s.subscription);
  const setDashboardTab = useAppStore((s) => s.setDashboardTab);

  const statCards = [
    {
      title: "Today's Sales",
      value: reports ? `₹${reports.todaySales.toLocaleString('en-IN')}` : '₹0',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      title: 'Orders Today',
      value: reports?.ordersCount?.toString() || '0',
      icon: ShoppingCart,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-900/20',
      border: 'border-sky-200 dark:border-sky-800',
    },
    {
      title: 'Products',
      value: productCount.toString(),
      icon: Package,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
    },
    {
      title: 'Customers',
      value: customerCount.toString(),
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
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

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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
    // Trial
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

  return (
    <div className="space-y-6">
      {/* ─── Enhanced Welcome Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
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
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`${stat.border} shadow-sm`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </p>
                    {loading ? (
                      <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                    ) : (
                      <p className="text-xl sm:text-2xl font-bold mt-1">{stat.value}</p>
                    )}
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sales Chart + Order Status Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Overview Card */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
                <CardDescription>Revenue trend for the selected period</CardDescription>
              </div>
              {/* Period Toggle */}
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
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={false}
                      interval={salesPeriod === '7' ? 0 : salesPeriod === '30' ? 4 : 14}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value: number) => `₹${(value / 1000).toFixed(0)}k`}
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
                        name === 'sales' ? `₹${value.toLocaleString('en-IN')}` : value,
                        name === 'sales' ? 'Sales' : 'Orders',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#salesGradient)"
                      dot={salesPeriod === '7' ? { r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' } : false}
                      activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Chart Summary */}
            <div className="mt-4 pt-3 border-t dark:border-gray-700 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
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
            </div>
          </CardContent>
        </Card>

        {/* Order Status Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Order Status</CardTitle>
            <CardDescription>Today&apos;s order breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Items */}
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
              </div>

              {/* Horizontal Bar Chart */}
              <div className="mt-4">
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {completedPct > 0 && (
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: `${completedPct}%` }}
                    />
                  )}
                  {pendingPct > 0 && (
                    <div
                      className="bg-amber-400 transition-all duration-500"
                      style={{ width: `${pendingPct}%` }}
                    />
                  )}
                  {cancelledPct > 0 && (
                    <div
                      className="bg-red-400 transition-all duration-500"
                      style={{ width: `${cancelledPct}%` }}
                    />
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

              {/* Quick Links */}
              <div className="pt-3 border-t dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDashboardTab('orders')}
                  className={`w-full justify-between ${accent}`}
                >
                  View All Orders
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Recent Orders + Niche Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 shadow-sm">
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
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{order.customerName || 'Walk-in Customer'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 border-0 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Niche Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getNicheBySlug(niche as NicheSlug)?.icon}</span>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </div>
            <CardDescription>{getNicheBySlug(niche as NicheSlug)?.name} shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {nicheQuickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => setDashboardTab(action.tab)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.bg} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Low Stock Alerts */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-lg font-semibold">Low Stock Alerts</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDashboardTab('products')}
              className={accent}
            >
              Manage
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <PackageX className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">All products are well stocked!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Below threshold
                    </p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                    {product.stock} left
                  </Badge>
                </div>
              ))}
            </div>
          )}
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
  const { user, store, subscription, logout, dashboardTab, setDashboardTab, globalSearch, setGlobalSearch } =
    useAppStore();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState(globalSearch || '');
  const [notifications, setNotifications] = useState(3);

  const niche = store?.niche || 'restaurant';
  const nicheData = getNicheBySlug(niche as NicheSlug);
  const nicheAccent = getNicheAccent(niche);
  const nicheAccentBg = getNicheAccentBg(niche);
  const nicheRing = getNicheRing(niche);

  // Get niche-specific nav
  const nicheNavItem = NICHE_NAV_ITEMS[niche];

  // Build full nav items including niche-specific
  const navItems = [...MAIN_NAV_ITEMS];
  if (nicheNavItem) {
    // Insert niche nav after "Orders"
    const ordersIdx = navItems.findIndex((n) => n.tab === 'orders');
    navItems.splice(ordersIdx + 1, 0, nicheNavItem);
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

    const tabLabel = navItems.find((n) => n.tab === dashboardTab)?.label || dashboardTab;
    return <PlaceholderTab tab={dashboardTab} label={tabLabel} />;
  };

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
            <div className={`w-9 h-9 rounded-lg ${getNicheSidebarBg(niche)} flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20`}>
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
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = dashboardTab === item.tab;
                  return (
                    <SidebarMenuItem key={item.tab}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setDashboardTab(item.tab)}
                        tooltip={item.label}
                        className={`transition-all duration-200 ${
                          isActive
                            ? `${nicheAccent} font-semibold ${nicheAccentBg} scale-[1.02]`
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:scale-[1.02] hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span                      >
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
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/60 dark:bg-gray-800/40 group-data-[collapsible=icon]:hidden">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Plan</span>
            {getSubBadge()}
          </div>

          <SidebarSeparator />

          {/* User Info */}
          <div className="flex items-center gap-2 px-1">
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
              placeholder="Search products, customers, orders... (Enter to search)"
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
                  New Bill
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDashboardTab('products')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDashboardTab('customers')}>
                  <Users className="w-4 h-4 mr-2" />
                  Add Customer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDashboardTab('reports')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Reports
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              onClick={() => setNotifications(0)}
            >
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

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
                  New Bill
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDashboardTab('products')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
          {renderTabContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
