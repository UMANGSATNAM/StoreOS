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

  // ─── Render ───

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold">Reports & Analytics</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Excel export initiated (mock)')}
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('PDF export initiated (mock)')}
          >
            <FileText className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Revenue Section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Revenue
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
            <div className="h-64 sm:h-80">
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
            <div className="h-48 sm:h-56">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Orders by Payment Method */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Orders by Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top 5 Selling Products */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Top 5 Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
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

          {/* Revenue by Category */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
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
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {categoryData.map((entry, index) => (
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
        </div>
      </div>

      {/* Tax Section */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Tax
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <Receipt className="h-6 w-6 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{formatCurrency(totalGST)}</p>
              <p className="text-sm text-muted-foreground">Total GST Collected</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="h-6 w-6 mx-auto rounded-full bg-sky-100 flex items-center justify-center mb-2">
                <span className="text-[10px] font-bold text-sky-700">C</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(cgst)}</p>
              <p className="text-sm text-muted-foreground">CGST (9%)</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="h-6 w-6 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <span className="text-[10px] font-bold text-amber-700">S</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(sgst)}</p>
              <p className="text-sm text-muted-foreground">SGST (9%)</p>
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
