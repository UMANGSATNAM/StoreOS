'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  ShoppingCart,
  Package,
  Receipt,
  Users,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Wallet,
  Percent,
  Warehouse,
  Gem,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ─── Types ───

interface ReportsData {
  todaySales: number;
  weekSales: number;
  monthSales: number;
  ordersCount: number;
  averageOrderValue: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
}

type Period = 'today' | 'week' | 'month' | 'custom';

const CHART_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

// ─── Mock Data Generators ───

function generateRevenueData(period: Period) {
  switch (period) {
    case 'today':
      return Array.from({ length: 24 }, (_, i) => ({
        name: `${i.toString().padStart(2, '0')}:00`,
        revenue: Math.floor(Math.random() * 5000) + (i >= 10 && i <= 21 ? 3000 : 500),
        orders: Math.floor(Math.random() * 15) + (i >= 10 && i <= 21 ? 8 : 1),
      }));
    case 'week':
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        name: day,
        revenue: Math.floor(Math.random() * 30000) + 10000,
        orders: Math.floor(Math.random() * 50) + 20,
      }));
    case 'month':
      return Array.from({ length: 30 }, (_, i) => ({
        name: `${i + 1}`,
        revenue: Math.floor(Math.random() * 25000) + 8000,
        orders: Math.floor(Math.random() * 40) + 15,
      }));
    default:
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        name: day,
        revenue: Math.floor(Math.random() * 30000) + 10000,
        orders: Math.floor(Math.random() * 50) + 20,
      }));
  }
}

function generatePaymentMethodData() {
  return [
    { name: 'Cash', value: 45, color: '#10b981' },
    { name: 'UPI', value: 35, color: '#3b82f6' },
    { name: 'Card', value: 15, color: '#f59e0b' },
    { name: 'Split', value: 5, color: '#8b5cf6' },
  ];
}

function generateCategoryData() {
  return [
    { name: 'Food & Beverages', value: 40, color: '#10b981' },
    { name: 'Grocery', value: 25, color: '#f59e0b' },
    { name: 'Snacks', value: 20, color: '#ef4444' },
    { name: 'Others', value: 15, color: '#8b5cf6' },
  ];
}

function generateDayOfWeekData() {
  return [
    { name: 'Mon', revenue: 22000 },
    { name: 'Tue', revenue: 18000 },
    { name: 'Wed', revenue: 25000 },
    { name: 'Thu', revenue: 20000 },
    { name: 'Fri', revenue: 32000 },
    { name: 'Sat', revenue: 38000 },
    { name: 'Sun', revenue: 28000 },
  ];
}

function generateStaffPerformance() {
  return [
    { name: 'Rahul Kumar', ordersHandled: 87, revenueGenerated: 145000 },
    { name: 'Priya Singh', ordersHandled: 65, revenueGenerated: 112000 },
    { name: 'Amit Patel', ordersHandled: 52, revenueGenerated: 89000 },
    { name: 'Sneha Verma', ordersHandled: 41, revenueGenerated: 67000 },
  ];
}

// ─── Custom Tooltip for Charts ───

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.name === 'revenue' ? `₹${entry.value.toLocaleString('en-IN')}` : entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── Stat Card ───

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  change,
  changeLabel,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  change?: number;
  changeLabel?: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={`text-xs font-medium ${
                    change >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {change >= 0 ? '+' : ''}
                  {change}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CSV Export Helper ───

function exportCSV(
  period: Period,
  revenueChartData: { name: string; revenue: number; orders: number }[],
  topProducts: { name: string; quantity: number; revenue: number }[],
  totalRevenue: number,
  totalGST: number,
  cgst: number,
  sgst: number,
  totalOrders: number,
  avgOrderValue: number,
  storeName: string,
) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month';

  const rows: string[] = [];

  // Header
  rows.push(`StoreOS Report - ${storeName}`);
  rows.push(`Period,${periodLabel}`);
  rows.push(`Generated,${now.toLocaleString('en-IN')}`);
  rows.push('');

  // Summary
  rows.push('--- Summary ---');
  rows.push(`Total Revenue,${totalRevenue}`);
  rows.push(`Total Orders,${totalOrders}`);
  rows.push(`Average Order Value,${avgOrderValue}`);
  rows.push('');

  // Sales Data
  rows.push('--- Sales Data ---');
  rows.push('Date/Time,Sales Amount,Order Count');
  revenueChartData.forEach((row) => {
    rows.push(`${row.name},${row.revenue},${row.orders}`);
  });
  rows.push('');

  // Top Products
  rows.push('--- Top Products ---');
  rows.push('Product Name,Quantity,Revenue');
  topProducts.forEach((p) => {
    rows.push(`"${p.name}",${p.quantity},${p.revenue}`);
  });
  rows.push('');

  // Tax Summary
  rows.push('--- Tax Summary ---');
  rows.push(`Total GST,${totalGST}`);
  rows.push(`CGST (9%),${cgst}`);
  rows.push(`SGST (9%),${sgst}`);

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `storeos-report-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success('CSV report downloaded');
}

// ─── PDF Export Helper ───

function exportPDF() {
  window.print();
  toast.success('Print dialog opened for PDF export');
}

// ─── Main Component ───

export default function ReportsPanel() {
  const { store } = useAppStore();
  const storeId = store?.id || '';

  // Period
  const [period, setPeriod] = useState<Period>('week');

  // Data
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Chart data
  const [revenueChartData, setRevenueChartData] = useState(generateRevenueData('week'));
  const [paymentMethodData] = useState(generatePaymentMethodData);
  const [categoryData] = useState(generateCategoryData);
  const [dayOfWeekData] = useState(generateDayOfWeekData);
  const [staffPerformance] = useState(generateStaffPerformance);

  // ─── Fetch Data ───

  const fetchReports = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?storeId=${storeId}&period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setReportsData(data);
      }
    } catch {
      // Will use mock data
    } finally {
      setLoading(false);
    }
  }, [storeId, period]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    setRevenueChartData(generateRevenueData(period));
  }, [period]);

  // ─── Computed values ───

  const totalRevenue =
    period === 'today'
      ? reportsData?.todaySales || 0
      : period === 'week'
        ? reportsData?.weekSales || 0
        : reportsData?.monthSales || 0;

  const totalOrders = reportsData?.ordersCount || 0;
  const avgOrderValue = reportsData?.averageOrderValue || 0;
  const topProducts = reportsData?.topProducts?.length
    ? reportsData.topProducts
    : [
        { name: 'Butter Chicken', quantity: 45, revenue: 15750 },
        { name: 'Paneer Tikka', quantity: 38, revenue: 9500 },
        { name: 'Dal Makhani', quantity: 32, revenue: 6400 },
        { name: 'Naan', quantity: 60, revenue: 3000 },
        { name: 'Biryani', quantity: 25, revenue: 8750 },
      ];

  const totalGST = totalRevenue * 0.18;
  const cgst = totalGST / 2;
  const sgst = totalGST / 2;

  // ─── Format helpers ───

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatCompactCurrency(amount: number) {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  }

  // ─── Period label ───

  function getPeriodLabel() {
    switch (period) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'custom':
        return 'Custom';
    }
  }

  // Category data with interactive legend
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // ─── Heatmap data ───

  const heatmapData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const periods = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const data: { day: string; period: string; amount: number }[] = [];
    days.forEach((day) => {
      periods.forEach((period) => {
        let base = Math.floor(Math.random() * 8000) + 2000;
        // Lunch/dinner rush
        if (period === 'Afternoon' || period === 'Evening') base += 5000;
        // Weekend boost
        if (day === 'Sat' || day === 'Sun') base += 3000;
        // Night is lower
        if (period === 'Night') base = Math.floor(base * 0.3);
        data.push({ day, period, amount: base });
      });
    });
    return data;
  }, []);

  // ─── Inventory mock data ───

  const inventoryData = React.useMemo(() => ({
    totalValue: 245000,
    productCount: 25,
    avgValue: 9800,
    topItems: [
      { name: 'Prawn Masala', value: 48000, stock: 2, costPrice: 24000 },
      { name: 'Butter Chicken', value: 38400, stock: 48, costPrice: 800 },
      { name: 'Biryani Rice', value: 28500, stock: 30, costPrice: 950 },
    ],
  }), []);

  // ─── Render ───

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold">Reports & Analytics</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 no-print">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  exportCSV(
                    period,
                    revenueChartData,
                    topProducts,
                    totalRevenue,
                    totalGST,
                    cgst,
                    sgst,
                    totalOrders,
                    avgOrderValue,
                    store?.name || 'My Store',
                  )
                }
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPDF}>
                <Printer className="h-4 w-4 mr-2 text-purple-600" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profit & Loss Summary Card */}
      <Card className="shadow-sm border-l-4 border-l-emerald-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-600" />
            Profit & Loss Summary
          </CardTitle>
          <CardDescription>{getPeriodLabel()}'s financial overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Total Cost</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(Math.round(totalRevenue * 0.55))}</p>
            </div>
            <div className="p-4 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800">
              <p className="text-xs font-medium text-sky-600 dark:text-sky-400">Gross Profit</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{formatCurrency(Math.round(totalRevenue * 0.45))}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500">Profit Margin</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl sm:text-2xl font-bold">45%</p>
                <Badge className={
                  45 > 20
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
                    : 45 > 10
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0'
                }>
                  {45 > 20 ? 'Healthy' : 45 > 10 ? 'Moderate' : 'Low'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      45 > 20 ? 'bg-emerald-500' : 45 > 10 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(45, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Revenue
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <StatCard
            title={`${getPeriodLabel()}'s Revenue`}
            value={loading ? '...' : formatCurrency(totalRevenue)}
            icon={IndianRupee}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-900/20"
            change={12.5}
            changeLabel="vs last period"
          />
          <StatCard
            title="Total Orders"
            value={loading ? '...' : totalOrders.toString()}
            icon={ShoppingCart}
            iconColor="text-sky-600 dark:text-sky-400"
            iconBg="bg-sky-50 dark:bg-sky-900/20"
            change={8.2}
            changeLabel="vs last period"
          />
          <StatCard
            title="Avg. Order Value"
            value={loading ? '...' : formatCurrency(avgOrderValue)}
            icon={Receipt}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-900/20"
            change={3.1}
            changeLabel="vs last period"
          />
          <StatCard
            title="Total GST Collected"
            value={loading ? '...' : formatCurrency(totalGST)}
            icon={TrendingUp}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBg="bg-purple-50 dark:bg-purple-900/20"
          />
        </div>

        {/* Revenue Chart */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
            <CardDescription>
              {period === 'today' ? 'Hourly revenue today' : period === 'week' ? 'Daily revenue this week' : 'Daily revenue this month'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => formatCompactCurrency(v)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    name="revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Day of Week */}
        <Card className="shadow-sm mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 sm:h-48 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => formatCompactCurrency(v)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Orders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Orders by Payment Method */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Orders by Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Share']}
                      contentStyle={{
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Stats Summary */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {paymentMethodData.map((method) => (
                  <div key={method.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: method.color }}
                      />
                      <span className="text-sm">{method.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{method.value}%</span>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${method.value}%`, backgroundColor: method.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
                  <p className="text-xs text-muted-foreground">Avg. Order Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products Section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Products
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top 5 Selling Products */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Top 5 Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts.map((p) => ({ name: p.name.slice(0, 15), revenue: p.revenue }))}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      stroke="#9ca3af"
                      tickFormatter={(v) => formatCompactCurrency(v)}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="#9ca3af"
                      width={90}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="revenue" radius={[0, 4, 4, 0]}>
                      {topProducts.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category-wise Sales Breakdown with Interactive Legend */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Percent className="h-4 w-4 text-emerald-600" />
                Category-wise Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={activeCategory === null || activeCategory === entry.name ? 1 : 0.3}
                          style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                      contentStyle={{
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Interactive Legend */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {categoryData.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      activeCategory === cat.name
                        ? 'shadow-md scale-105'
                        : activeCategory === null
                          ? 'border-gray-200 dark:border-gray-700 hover:shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 opacity-50'
                    }`}
                    style={{
                      backgroundColor: activeCategory === cat.name ? cat.color + '20' : 'transparent',
                      borderColor: activeCategory === cat.name ? cat.color : undefined,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                    <span className="font-bold">{cat.value}%</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tax Section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Tax
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <Receipt className="h-6 w-6 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(totalGST)}</p>
              <p className="text-sm text-muted-foreground">Total GST Collected</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="h-6 w-6 mx-auto rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-2">
                <span className="text-[10px] font-bold text-sky-700">C</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(cgst)}</p>
              <p className="text-sm text-muted-foreground">CGST (9%)</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="h-6 w-6 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                <span className="text-[10px] font-bold text-amber-700">S</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(sgst)}</p>
              <p className="text-sm text-muted-foreground">SGST (9%)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hourly Sales Heatmap */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Hourly Sales Heatmap
        </h3>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              Sales by Day & Time Period
            </CardTitle>
            <CardDescription>Color intensity shows sales volume across time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-left w-24"></th>
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map((period) => (
                      <th key={period} className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                        {period}
                        <br />
                        <span className="text-[10px] text-gray-400">
                          {period === 'Morning' ? '6-12' : period === 'Afternoon' ? '12-17' : period === 'Evening' ? '17-22' : '22-6'}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <tr key={day}>
                      <td className="p-2 text-xs font-medium text-gray-600 dark:text-gray-300">{day}</td>
                      {['Morning', 'Afternoon', 'Evening', 'Night'].map((period) => {
                        const cell = heatmapData.find((d) => d.day === day && d.period === period);
                        const amount = cell?.amount || 0;
                        const maxAmount = 20000;
                        const intensity = Math.min(amount / maxAmount, 1);
                        return (
                          <td key={`${day}-${period}`} className="p-1">
                            <div
                              className="relative group rounded-lg p-2 text-center cursor-default transition-all hover:scale-105"
                              style={{
                                backgroundColor: `rgba(16, 185, 129, ${0.1 + intensity * 0.7})`,
                                minHeight: '40px',
                              }}
                            >
                              <span className={`text-xs font-bold ${intensity > 0.5 ? 'text-white' : 'text-emerald-800 dark:text-emerald-200'}`}>
                                {formatCompactCurrency(amount)}
                              </span>
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                {day} {period}: {formatCurrency(amount)}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Heatmap Legend */}
            <div className="flex items-center gap-3 mt-4 justify-center">
              <span className="text-xs text-gray-500">Low</span>
              <div className="flex gap-0.5">
                {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((intensity) => (
                  <div
                    key={intensity}
                    className="w-8 h-4 rounded-sm"
                    style={{ backgroundColor: `rgba(16, 185, 129, ${0.1 + intensity * 0.7})` }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">High</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Value Card */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Inventory Value
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-sm border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-amber-600" />
                Inventory Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Total Value</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(inventoryData.totalValue)}</p>
                </div>
                <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800 text-center">
                  <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">Products</p>
                  <p className="text-lg font-bold mt-1">{inventoryData.productCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-center">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Avg. Value</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(inventoryData.avgValue)}</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Inventory Health</span>
                  <span className="font-medium text-emerald-600">Good</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '72%' }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">72% of products in stock</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Gem className="h-4 w-4 text-amber-600" />
                Top 3 Most Valuable Items
              </CardTitle>
              <CardDescription>Products with highest inventory value (cost × stock)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {inventoryData.topItems.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    i === 0
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : i === 1
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Stock: {item.stock} × {formatCurrency(item.costPrice)} each
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{formatCurrency(item.value)}</p>
                    <p className="text-[10px] text-gray-400">inventory value</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total top 3 value</span>
                  <span className="font-bold">
                    {formatCurrency(inventoryData.topItems.reduce((sum, item) => sum + item.value, 0))}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {Math.round((inventoryData.topItems.reduce((sum, item) => sum + item.value, 0) / inventoryData.totalValue) * 100)}% of total inventory
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Staff Section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Staff Performance
        </h3>
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead className="text-center">Orders Handled</TableHead>
                  <TableHead className="text-right">Revenue Generated</TableHead>
                  <TableHead className="text-right">Avg. per Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffPerformance.map((member, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold flex-shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{member.ordersHandled}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(member.revenueGenerated)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(
                        member.ordersHandled > 0
                          ? Math.round(member.revenueGenerated / member.ordersHandled)
                          : 0
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
