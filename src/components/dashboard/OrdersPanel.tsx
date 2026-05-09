'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Search,
  Eye,
  RotateCcw,
  Play,
  Printer,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  IndianRupee,
  X,
  User,
  CreditCard,
  Clock,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Pause,
  Banknote,
  Smartphone,
  SplitSquareHorizontal,
  UtensilsCrossed,
  Package as PackageIcon,
  Truck,
  Store,
  LayoutGrid,
  List,
  ArrowRight,
  Download,
  FileSpreadsheet,
  MessageSquare,
  Phone,
  Award,
  CheckCircle2,
  Circle,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

// ─── Types ───

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  notes: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email?: string | null;
    loyaltyPoints?: number;
  } | null;
  items: OrderItem[];
}

type ViewMode = 'table' | 'timeline';
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'held' | 'cancelled' | 'refunded';
type DateRangeFilter = 'today' | 'week' | 'month' | 'custom';

const PAGE_SIZE = 10;

// ─── Order Status Flow Stages ───

const ORDER_FLOW_STAGES = [
  { key: 'pending', label: 'Pending', color: 'amber' },
  { key: 'confirmed', label: 'Confirmed', color: 'blue' },
  { key: 'preparing', label: 'Preparing', color: 'orange' },
  { key: 'ready', label: 'Ready', color: 'teal' },
  { key: 'completed', label: 'Completed', color: 'emerald' },
] as const;

// ─── Skeleton Loader ───

function OrdersTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6 pl-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge with Icons ───

function OrderStatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'paid':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 border flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completed
        </Badge>
      );
    case 'held':
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 border flex items-center gap-1">
          <Pause className="w-3 h-3" />
          Held
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 border flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>
      );
    case 'confirmed':
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 border flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Confirmed
        </Badge>
      );
    case 'preparing':
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 border flex items-center gap-1">
          <ShoppingBag className="w-3 h-3" />
          Preparing
        </Badge>
      );
    case 'ready':
      return (
        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-teal-200 border flex items-center gap-1">
          <PackageIcon className="w-3 h-3" />
          Ready
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 border flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Cancelled
        </Badge>
      );
    case 'refunded':
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 border flex items-center gap-1">
          <RotateCcw className="w-3 h-3" />
          Refunded
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize">
          {status}
        </Badge>
      );
  }
}

// ─── Payment Method Badge ───

function PaymentMethodBadge({ method }: { method: string }) {
  switch (method) {
    case 'cash':
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200 border flex items-center gap-1 text-xs">
          <Banknote className="w-3 h-3" />
          Cash
        </Badge>
      );
    case 'upi':
      return (
        <Badge className="bg-purple-100 text-purple-700 border-purple-200 border flex items-center gap-1 text-xs">
          <Smartphone className="w-3 h-3" />
          UPI
        </Badge>
      );
    case 'card':
      return (
        <Badge className="bg-sky-100 text-sky-700 border-sky-200 border flex items-center gap-1 text-xs">
          <CreditCard className="w-3 h-3" />
          Card
        </Badge>
      );
    case 'split':
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200 border flex items-center gap-1 text-xs">
          <SplitSquareHorizontal className="w-3 h-3" />
          Split
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize text-xs">
          {method}
        </Badge>
      );
  }
}

// ─── Order Type Badge ───

function OrderTypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'dine_in':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border flex items-center gap-1 text-xs">
          <UtensilsCrossed className="w-3 h-3" />
          Dine-in
        </Badge>
      );
    case 'takeaway':
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200 border flex items-center gap-1 text-xs">
          <PackageIcon className="w-3 h-3" />
          Takeaway
        </Badge>
      );
    case 'delivery':
      return (
        <Badge className="bg-sky-100 text-sky-700 border-sky-200 border flex items-center gap-1 text-xs">
          <Truck className="w-3 h-3" />
          Delivery
        </Badge>
      );
    case 'in_store':
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200 border flex items-center gap-1 text-xs">
          <Store className="w-3 h-3" />
          In-Store
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize text-xs">
          {type.replace('_', ' ')}
        </Badge>
      );
  }
}

// ─── Status dot color for timeline ───

function getStatusDotColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'paid':
      return 'bg-emerald-500';
    case 'pending':
      return 'bg-amber-500';
    case 'confirmed':
      return 'bg-blue-500';
    case 'preparing':
      return 'bg-orange-500';
    case 'ready':
      return 'bg-teal-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'refunded':
      return 'bg-purple-500';
    case 'held':
      return 'bg-blue-500';
    default:
      return 'bg-gray-400';
  }
}

function getStatusDotRing(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'paid':
      return 'ring-emerald-200';
    case 'pending':
      return 'ring-amber-200';
    case 'confirmed':
      return 'ring-blue-200';
    case 'preparing':
      return 'ring-orange-200';
    case 'ready':
      return 'ring-teal-200';
    case 'cancelled':
      return 'ring-red-200';
    case 'refunded':
      return 'ring-purple-200';
    case 'held':
      return 'ring-blue-200';
    default:
      return 'ring-gray-200';
  }
}

// ─── Order Lifecycle Timeline ───

function OrderLifecycleTimeline({ order }: { order: Order }) {
  const createdAt = new Date(order.createdAt);
  const confirmedAt = new Date(createdAt.getTime() + 2 * 60000); // +2 min
  const preparingAt = new Date(createdAt.getTime() + 5 * 60000); // +5 min
  const readyAt = new Date(createdAt.getTime() + 15 * 60000); // +15 min
  const completedAt = order.status === 'completed' ? new Date(order.updatedAt) : null;

  const stages = [
    { label: 'Created', time: createdAt, done: true, icon: Clock },
    { label: 'Confirmed', time: confirmedAt, done: ['confirmed', 'preparing', 'ready', 'completed'].includes(order.status), icon: CheckCircle2 },
    { label: 'Preparing', time: preparingAt, done: ['preparing', 'ready', 'completed'].includes(order.status), icon: ShoppingBag },
    { label: 'Ready', time: readyAt, done: ['ready', 'completed'].includes(order.status), icon: PackageIcon },
    { label: order.status === 'cancelled' ? 'Cancelled' : 'Completed', time: completedAt, done: order.status === 'completed' || order.status === 'cancelled', icon: order.status === 'cancelled' ? XCircle : CheckCircle },
  ];

  return (
    <div className="relative">
      {stages.map((stage, i) => {
        const Icon = stage.icon;
        return (
          <div key={i} className="flex items-start gap-3 pb-4 last:pb-0">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  stage.done
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              {i < stages.length - 1 && (
                <div
                  className={`w-0.5 h-6 ${
                    stage.done && stages[i + 1]?.done
                      ? 'bg-emerald-300 dark:bg-emerald-700'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
            {/* Content */}
            <div className="pt-0.5">
              <p className={`text-sm font-medium ${stage.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                {stage.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {stage.done && stage.time
                  ? stage.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) +
                    ' · ' +
                    stage.time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                  : 'Pending'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───

export default function OrdersPanel() {
  const { store } = useAppStore();
  const storeId = store?.id || '';

  // Data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('today');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Detail dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ─── Fetch Data ───

  const fetchOrders = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ storeId });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);
      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [storeId, statusFilter, dateFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [search, statusFilter, dateFilter, paymentFilter, orderTypeFilter, minAmount, maxAmount]);

  // ─── Date range helper ───

  const getDateRangeCondition = useCallback((orderDate: Date): boolean => {
    const now = new Date();
    switch (dateRangeFilter) {
      case 'today':
        return orderDate.toDateString() === now.toDateString();
      case 'week': {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        return orderDate >= monthAgo;
      }
      case 'custom':
        return true; // Use dateFilter for custom
      default:
        return true;
    }
  }, [dateRangeFilter]);

  // ─── Filtered Orders ───

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.customer?.name || '').toLowerCase().includes(q) ||
          o.paymentMethod.toLowerCase().includes(q)
      );
    }

    // Date range filter
    if (dateRangeFilter !== 'custom' || dateFilter) {
      result = result.filter((o) => getDateRangeCondition(new Date(o.createdAt)));
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      result = result.filter((o) => o.paymentMethod === paymentFilter);
    }

    // Order type filter
    if (orderTypeFilter !== 'all') {
      result = result.filter((o) => o.type === orderTypeFilter);
    }

    // Amount range filter
    if (minAmount) {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) result = result.filter((o) => o.totalAmount >= min);
    }
    if (maxAmount) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) result = result.filter((o) => o.totalAmount <= max);
    }

    return result;
  }, [orders, search, dateRangeFilter, dateFilter, paymentFilter, orderTypeFilter, minAmount, maxAmount, getDateRangeCondition]);

  // ─── Pagination ───

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ─── Stats ───

  const orderStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekAgo);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'held');
    const avgValue = orders.length > 0
      ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length
      : 0;
    return {
      today: todayOrders.length,
      thisWeek: weekOrders.length,
      pending: pendingOrders.length,
      avgValue: Math.round(avgValue),
    };
  }, [orders]);

  // ─── Status flow counts ───

  const statusFlowCounts = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
    };
    orders.forEach((o) => {
      const s = o.status.toLowerCase();
      if (s in counts) counts[s]++;
      if (s === 'paid') counts.completed++;
      if (s === 'held') counts.pending++;
    });
    return counts;
  }, [orders]);

  // ─── Bulk actions ───

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedOrders.map((o) => o.id)));
    }
  };

  const handleBulkComplete = () => {
    setOrders((prev) =>
      prev.map((o) => (selectedIds.has(o.id) ? { ...o, status: 'completed' } : o))
    );
    toast.success(`${selectedIds.size} orders marked as completed`);
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
    const csvRows = [
      ['Order #', 'Customer', 'Status', 'Total', 'Payment', 'Date'].join(','),
      ...selectedOrders.map((o) =>
        [
          o.orderNumber,
          o.customer?.name || 'Walk-in',
          o.status,
          o.totalAmount,
          o.paymentMethod,
          new Date(o.createdAt).toLocaleDateString('en-IN'),
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedOrders.length} orders`);
    setSelectedIds(new Set());
  };

  const handleBulkPrint = () => {
    toast.success(`Printing ${selectedIds.size} receipts...`);
    setTimeout(() => window.print(), 300);
    setSelectedIds(new Set());
  };

  // ─── Actions ───

  function viewOrderDetail(order: Order) {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  }

  async function refundOrder(order: Order) {
    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'refunded' } : o))
      );
      toast.success(`Order #${order.orderNumber} has been refunded`);
      setDetailDialogOpen(false);
    } catch {
      toast.error('Failed to refund order');
    }
  }

  async function markAsCompleted(order: Order) {
    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'completed' } : o))
      );
      toast.success(`Order #${order.orderNumber} marked as completed`);
      setDetailDialogOpen(false);
    } catch {
      toast.error('Failed to update order');
    }
  }

  function handlePrintReceipt() {
    toast.success('Printing receipt...');
    setTimeout(() => window.print(), 300);
  }

  function handleWhatsAppReceipt(order: Order) {
    const lines = [
      `🧾 *Receipt - ${store?.name || 'StoreOS'}*`,
      `Order: #${order.orderNumber.slice(-8)}`,
      `Date: ${formatDate(order.createdAt)}`,
      `---------------------------`,
      ...order.items.map(
        (item) => `${item.name} x${item.quantity} = ₹${item.total.toLocaleString('en-IN')}`
      ),
      `---------------------------`,
      `Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}`,
      `Tax: ₹${order.taxAmount.toLocaleString('en-IN')}`,
      order.discountAmount > 0 ? `Discount: -₹${order.discountAmount.toLocaleString('en-IN')}` : '',
      `*Total: ₹${order.totalAmount.toLocaleString('en-IN')}*`,
      `Payment: ${order.paymentMethod.toUpperCase()}`,
      `🙏 Thank you! Visit again!`,
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join('\n'));
    const phone = order.customer?.phone ? `91${order.customer.phone.replace(/\D/g, '')}` : '';
    const url = phone
      ? `https://wa.me/${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
    toast.success('WhatsApp receipt opened');
  }

  // ─── Format helpers ───

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatRelativeTime(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  }

  // ─── Render ───

  return (
    <div className="space-y-4 p-3 md:p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Orders</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage and track all orders</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-56 min-h-[44px]"
            />
          </div>
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none h-8 px-3 min-w-[44px] ${viewMode === 'table' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <LayoutGrid className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Table</span>
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-none h-8 px-3 min-w-[44px] ${viewMode === 'timeline' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <List className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Timeline</span>
            </Button>
          </div>
          {/* Filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filters
            {(paymentFilter !== 'all' || orderTypeFilter !== 'all' || minAmount || maxAmount) && (
              <span className="ml-1 w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </Button>
        </div>
      </div>

      {/* ─── Status Flow Visualization ─── */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-muted-foreground">Order Pipeline</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setStatusFilter('all')}
              disabled={statusFilter === 'all'}
            >
              View All
            </Button>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {ORDER_FLOW_STAGES.map((stage, i) => {
              const count = statusFlowCounts[stage.key] || 0;
              const isActive = statusFilter === stage.key;
              const colorMap: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
                amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', ring: 'ring-amber-300', dot: 'bg-amber-500' },
                blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', ring: 'ring-blue-300', dot: 'bg-blue-500' },
                orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', ring: 'ring-orange-300', dot: 'bg-orange-500' },
                teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-400', ring: 'ring-teal-300', dot: 'bg-teal-500' },
                emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', ring: 'ring-emerald-300', dot: 'bg-emerald-500' },
              };
              const c = colorMap[stage.color];
              return (
                <React.Fragment key={stage.key}>
                  <button
                    onClick={() => setStatusFilter(isActive ? 'all' : (stage.key as StatusFilter))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? `${c.bg} ring-2 ${c.ring} shadow-sm`
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${c.dot} ${count > 0 ? 'animate-pulse' : ''}`} />
                    <span className={`text-xs font-medium ${isActive ? c.text : 'text-muted-foreground'}`}>
                      {stage.label}
                    </span>
                    <span className={`text-xs font-bold ${isActive ? c.text : 'text-foreground'}`}>
                      {count}
                    </span>
                  </button>
                  {i < ORDER_FLOW_STAGES.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                <p className="text-xl font-bold">{orderStats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
                <p className="text-xl font-bold text-sky-600">{orderStats.thisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-xl font-bold text-amber-600">{orderStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Value</p>
                <p className="text-xl font-bold">₹{orderStats.avgValue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Bulk Actions Toolbar ─── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
          >
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {selectedIds.size} selected
            </span>
            <Separator orientation="vertical" className="h-5" />
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleBulkComplete}>
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark Complete
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleBulkExport}>
              <FileSpreadsheet className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleBulkPrint}>
              <Printer className="h-3 w-3 mr-1" />
              Print
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs ml-auto"
              onClick={() => setSelectedIds(new Set())}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Filters Row ─── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-40 min-h-[44px]">
              <Filter className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="held">Held</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          {/* Date Range Quick Select */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            {(['today', 'week', 'month', 'custom'] as DateRangeFilter[]).map((range) => (
              <Button
                key={range}
                variant={dateRangeFilter === range ? 'default' : 'ghost'}
                size="sm"
                className={`rounded-none h-8 px-3 text-xs ${dateRangeFilter === range ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                onClick={() => setDateRangeFilter(range)}
              >
                {range === 'today' ? 'Today' : range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'Custom'}
              </Button>
            ))}
          </div>
          {dateRangeFilter === 'custom' && (
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9 w-44"
              />
            </div>
          )}
          {dateFilter && dateRangeFilter === 'custom' && (
            <Button variant="ghost" size="sm" onClick={() => setDateFilter('')} className="h-8">
              <X className="h-3 w-3 mr-1" />
              Clear Date
            </Button>
          )}
        </div>

        {/* Extended Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Payment Method */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                      <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="All Payments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payments</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="split">Split</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Order Type */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Order Type</Label>
                      <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="dine_in">Dine-in</SelectItem>
                          <SelectItem value="takeaway">Takeaway</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                          <SelectItem value="in_store">In-Store</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Min Amount */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Min Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    {/* Max Amount */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Max Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="No limit"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                  {(paymentFilter !== 'all' || orderTypeFilter !== 'all' || minAmount || maxAmount) && (
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Showing {filteredOrders.length} of {orders.length} orders
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setPaymentFilter('all');
                          setOrderTypeFilter('all');
                          setMinAmount('');
                          setMaxAmount('');
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Table View ─── */}
      {viewMode === 'table' && (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6">
                  <OrdersTableSkeleton />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <ClipboardList className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">No orders found</p>
                  <p className="text-sm">
                    {statusFilter !== 'all' || dateFilter || paymentFilter !== 'all' || orderTypeFilter !== 'all'
                      ? 'Try changing your filters'
                      : 'Start billing to see orders here'}
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={selectedIds.size === paginatedOrders.length && paginatedOrders.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-center">Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map((order) => (
                        <TableRow key={order.id} className={selectedIds.has(order.id) ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(order.id)}
                              onCheckedChange={() => toggleSelect(order.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-xs">
                            #{order.orderNumber.slice(-8)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex-shrink-0">
                                {(order.customer?.name || 'W').charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[120px]">
                                {order.customer?.name || 'Walk-in'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{order.items?.length || 0}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <PaymentMethodBadge method={order.paymentMethod} />
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => viewOrderDetail(order)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {order.status === 'completed' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-purple-600 hover:text-purple-700"
                                  onClick={() => refundOrder(order)}
                                  title="Refund"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              {(order.status === 'pending' || order.status === 'held') && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                                  onClick={() => markAsCompleted(order)}
                                  title="Mark as Completed"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                      {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of{' '}
                      {filteredOrders.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      {totalPages > 5 && <span className="text-sm text-muted-foreground px-1">...</span>}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <OrdersTableSkeleton />
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ClipboardList className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">No orders found</p>
              </div>
            ) : (
              paginatedOrders.map((order) => (
                <Card key={order.id} className={`p-4 ${selectedIds.has(order.id) ? 'ring-2 ring-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 min-w-0">
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                        className="mt-1"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">#{order.orderNumber.slice(-8)}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.customer?.name || 'Walk-in Customer'}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(order.createdAt)}
                          </span>
                          <PaymentMethodBadge method={order.paymentMethod} />
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.items?.length || 0} items</p>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => viewOrderDetail(order)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    {order.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-purple-600 hover:text-purple-700"
                        onClick={() => refundOrder(order)}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Refund
                      </Button>
                    )}
                    {(order.status === 'pending' || order.status === 'held') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-emerald-600 hover:text-emerald-700"
                        onClick={() => markAsCompleted(order)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}

            {/* Mobile Pagination */}
            {!loading && filteredOrders.length > 0 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Timeline View ─── */}
      {viewMode === 'timeline' && (
        <>
          {loading ? (
            <TimelineSkeleton />
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ClipboardList className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Try changing your filters</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[39px] md:left-[59px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {paginatedOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="relative flex gap-4 md:gap-6"
                    >
                      {/* Left: Timestamp */}
                      <div className="w-20 md:w-24 shrink-0 pt-1 text-right hidden sm:block">
                        <p className="text-sm font-semibold text-foreground">
                          {formatTime(order.createdAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {formatRelativeTime(order.createdAt)}
                        </p>
                      </div>

                      {/* Timeline dot */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-5 h-5 rounded-full ${getStatusDotColor(order.status)} ring-4 ${getStatusDotRing(order.status)} ring-opacity-30 shrink-0 mt-1.5`}
                        />
                      </div>

                      {/* Right: Order Card */}
                      <Card
                        className={`flex-1 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                          selectedIds.has(order.id)
                            ? 'ring-2 ring-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10'
                            : ''
                        }`}
                        onClick={() => viewOrderDetail(order)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex items-start gap-2">
                              <Checkbox
                                checked={selectedIds.has(order.id)}
                                onCheckedChange={() => toggleSelect(order.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-0.5"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">
                                    #{order.orderNumber.slice(-8)}
                                  </span>
                                  <OrderStatusBadge status={order.status} />
                                  <OrderTypeBadge type={order.type} />
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {order.customer?.name || 'Walk-in Customer'}
                                  {order.customer?.phone && (
                                    <span className="ml-2 text-xs">({order.customer.phone})</span>
                                  )}
                                </p>
                                {/* Mobile timestamp */}
                                <p className="text-xs text-muted-foreground mt-1 sm:hidden">
                                  {formatDate(order.createdAt)} at {formatTime(order.createdAt)} · {formatRelativeTime(order.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">
                                {formatCurrency(order.totalAmount)}
                              </p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <PaymentMethodBadge method={order.paymentMethod} />
                              </div>
                            </div>
                          </div>

                          {/* Items preview */}
                          {order.items && order.items.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-dashed">
                              <div className="flex flex-wrap gap-1.5">
                                {order.items.slice(0, 4).map((item) => (
                                  <span
                                    key={item.id}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs"
                                  >
                                    <span className="truncate max-w-[80px]">{item.name}</span>
                                    <span className="text-muted-foreground">×{item.quantity}</span>
                                  </span>
                                ))}
                                {order.items.length > 4 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-muted-foreground">
                                    +{order.items.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Timeline pagination */}
              {filteredOrders.length > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─── Enhanced Order Detail Dialog ─── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
          <>
          <DialogHeader className="pb-0">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              Order #{selectedOrder.orderNumber.slice(-8)}
            </DialogTitle>
            <DialogDescription>
              {formatDate(selectedOrder.createdAt)} at {formatTime(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Order Summary Card */}
              <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/20 dark:to-gray-900">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        #{selectedOrder.orderNumber.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <OrderStatusBadge status={selectedOrder.status} />
                      <div className="flex items-center gap-1.5 justify-end">
                        <PaymentMethodBadge method={selectedOrder.paymentMethod} />
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <OrderTypeBadge type={selectedOrder.type} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(selectedOrder.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShoppingBag className="h-3 w-3" />
                      {selectedOrder.items?.length || 0} items
                    </p>
                    {selectedOrder.customer && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {selectedOrder.customer.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status + Payment + Type (mobile summary) */}
              <div className="flex items-center gap-2 flex-wrap sm:hidden">
                <OrderStatusBadge status={selectedOrder.status} />
                <PaymentMethodBadge method={selectedOrder.paymentMethod} />
                <OrderTypeBadge type={selectedOrder.type} />
              </div>

              {/* Order Lifecycle Timeline */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <OrderLifecycleTimeline order={selectedOrder} />
                </CardContent>
              </Card>

              {/* Customer Info */}
              {selectedOrder.customer && (
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Customer Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm shrink-0">
                        {selectedOrder.customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <p className="text-sm font-medium">{selectedOrder.customer.name}</p>
                        {selectedOrder.customer.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {selectedOrder.customer.phone}
                          </p>
                        )}
                        {selectedOrder.customer.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {selectedOrder.customer.email}
                          </p>
                        )}
                        {selectedOrder.customer.loyaltyPoints !== undefined && selectedOrder.customer.loyaltyPoints > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {selectedOrder.customer.loyaltyPoints} loyalty points
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items Table */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    Items ({selectedOrder.items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Item</TableHead>
                          <TableHead className="text-xs text-center">Qty</TableHead>
                          <TableHead className="text-xs text-right">Unit Price</TableHead>
                          <TableHead className="text-xs text-right">Discount</TableHead>
                          <TableHead className="text-xs text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                  <PackageIcon className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  {item.notes && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      {item.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-center">{item.quantity}</TableCell>
                            <TableCell className="text-xs text-right">
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {item.discount > 0 ? (
                                <span className="text-red-600">-{formatCurrency(item.discount)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-right font-medium">
                              {formatCurrency(item.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Breakdown */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    Payment Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-red-600">
                          -{formatCurrency(selectedOrder.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        CGST ({((selectedOrder.taxAmount / 2 / Math.max(selectedOrder.subtotal, 1)) * 100).toFixed(1)}%)
                      </span>
                      <span>{formatCurrency(selectedOrder.taxAmount / 2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        SGST ({((selectedOrder.taxAmount / 2 / Math.max(selectedOrder.subtotal, 1)) * 100).toFixed(1)}%)
                      </span>
                      <span>{formatCurrency(selectedOrder.taxAmount / 2)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className="text-muted-foreground">Paid via</span>
                      <PaymentMethodBadge method={selectedOrder.paymentMethod} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      Notes
                    </h4>
                    <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                      {selectedOrder.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
          )}

          {/* Action Buttons */}
          <DialogFooter className="flex-row gap-2 sm:justify-between flex-wrap">
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
            <div className="flex flex-wrap gap-2">
              {selectedOrder && (selectedOrder.status === 'pending' || selectedOrder.status === 'held') && (
                <Button
                  onClick={() => markAsCompleted(selectedOrder)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Completed
                </Button>
              )}
              {selectedOrder?.status === 'completed' && (
                <Button
                  variant="outline"
                  onClick={() => selectedOrder && refundOrder(selectedOrder)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Refund
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => selectedOrder && handleWhatsAppReceipt(selectedOrder)}
                className="text-green-600 hover:text-green-700"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
              <Button
                onClick={handlePrintReceipt}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print Receipt
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
