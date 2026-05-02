'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

  const salesData = [
    { day: 'Mon', sales: 12400, orders: 18 },
    { day: 'Tue', sales: 18200, orders: 24 },
    { day: 'Wed', sales: 15800, orders: 21 },
    { day: 'Thu', sales: 22100, orders: 32 },
    { day: 'Fri', sales: 19500, orders: 28 },
    { day: 'Sat', sales: 28400, orders: 42 },
    { day: 'Sun', sales: 21300, orders: 31 },
  ];

  const accent = getNicheAccent(niche);
  const accentBg = getNicheAccentBg(niche);

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
          // Find low stock products
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

  const quickActions = [
    { label: 'New Bill', icon: Receipt, tab: 'billing', color: accent, bg: accentBg },
    { label: 'Add Product', icon: Plus, tab: 'products', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Add Customer', icon: Users, tab: 'customers', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'View Reports', icon: BarChart3, tab: 'reports', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  ];

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

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {store?.name || 'Store'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with your store today.
        </p>
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

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders - takes 2 columns */}
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

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => setDashboardTab(action.tab)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bg} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="text-xs font-medium text-center">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
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
              <div className="space-y-2 max-h-64 overflow-y-auto">
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

        {/* Sales Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
            <CardDescription>Revenue trend for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
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
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
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
                        <span>{item.label}</span>
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
