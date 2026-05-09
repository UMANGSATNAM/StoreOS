'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Clock,
  Bell,
  BellOff,
  RefreshCw,
  UtensilsCrossed,
  Package,
  Truck,
  Store,
  AlertTriangle,
  CheckCircle2,
  Play,
  CircleCheck,
  Utensils,
  MessageSquare,
  Users,
  Timer,
  Inbox,
  CookingPot,
  CircleDot,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

interface KDSOrder {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  notes: string | null;
  nicheData: string | null;
  staffId: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
  } | null;
  items: OrderItem[];
}

type KDSColumn = 'new' | 'in_progress' | 'ready' | 'completed';
type OrderTypeFilter = 'all' | 'dine_in' | 'takeaway' | 'delivery';

// ─── Column Config ───

const COLUMN_CONFIG: Record<KDSColumn, {
  title: string;
  icon: React.ElementType;
  statuses: string[];
  accentBorder: string;
  headerBg: string;
  emptyIcon: React.ElementType;
  emptyText: string;
}> = {
  new: {
    title: 'New Orders',
    icon: Inbox,
    statuses: ['pending'],
    accentBorder: 'border-l-amber-500',
    headerBg: 'bg-amber-50 dark:bg-amber-900/20',
    emptyIcon: Inbox,
    emptyText: 'No new orders',
  },
  in_progress: {
    title: 'In Progress',
    icon: CookingPot,
    statuses: ['processing', 'preparing'],
    accentBorder: 'border-l-orange-500',
    headerBg: 'bg-orange-50 dark:bg-orange-900/20',
    emptyIcon: CookingPot,
    emptyText: 'Nothing being prepared',
  },
  ready: {
    title: 'Ready',
    icon: CircleDot,
    statuses: ['ready'],
    accentBorder: 'border-l-emerald-500',
    headerBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    emptyIcon: CircleDot,
    emptyText: 'No orders ready',
  },
  completed: {
    title: 'Completed',
    icon: Archive,
    statuses: ['completed'],
    accentBorder: 'border-l-gray-400',
    headerBg: 'bg-gray-50 dark:bg-gray-800/50',
    emptyIcon: Archive,
    emptyText: 'No completed orders',
  },
};

// ─── Helpers ───

function getTimeSincePlaced(dateStr: string): { text: string; minutes: number } {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return { text: 'Just now', minutes: 0 };
  if (minutes < 60) return { text: `${minutes}m ago`, minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { text: `${hours}h ${minutes % 60}m`, minutes };
  return { text: `${Math.floor(hours / 24)}d ago`, minutes };
}

function getUrgencyColor(minutes: number): string {
  if (minutes < 5) return 'border-l-emerald-500';
  if (minutes < 15) return 'border-l-amber-500';
  return 'border-l-red-500';
}

function getUrgencyBadge(minutes: number): { bg: string; text: string } {
  if (minutes < 5) return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' };
  if (minutes < 15) return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' };
  return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' };
}

function getOrderTypeBadge(type: string) {
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
          <Package className="w-3 h-3" />
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
        <Badge variant="outline" className="text-xs capitalize">
          {type.replace('_', ' ')}
        </Badge>
      );
  }
}

function getTableFromNicheData(nicheData: string | null): string | null {
  if (!nicheData) return null;
  try {
    const parsed = JSON.parse(nicheData);
    return parsed?.tableNumber || parsed?.table || null;
  } catch {
    return null;
  }
}

function getStaffFromNicheData(nicheData: string | null): string | null {
  if (!nicheData) return null;
  try {
    const parsed = JSON.parse(nicheData);
    return parsed?.staffName || parsed?.waiterName || null;
  } catch {
    return null;
  }
}

// ─── Cooking Timer ───

function CookingTimer({ startDate }: { startDate: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startDate).getTime();
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <span className="font-mono text-xs tabular-nums">
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

// ─── Order Card ───

function OrderCard({
  order,
  column,
  onStatusChange,
}: {
  order: KDSOrder;
  column: KDSColumn;
  onStatusChange: (orderId: string, newStatus: string) => void;
}) {
  const timeInfo = getTimeSincePlaced(order.createdAt);
  const urgencyBorder = getUrgencyColor(timeInfo.minutes);
  const urgencyBadge = getUrgencyBadge(timeInfo.minutes);
  const tableNumber = getTableFromNicheData(order.nicheData);
  const staffName = getStaffFromNicheData(order.nicheData);
  const isNewAndOld = column === 'new' && timeInfo.minutes >= 10;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card
        className={`border-l-4 ${urgencyBorder} hover:shadow-lg transition-shadow hover:scale-[1.01] cursor-default ${
          isNewAndOld ? 'animate-pulse' : ''
        }`}
      >
        <CardContent className="p-3 space-y-2">
          {/* Header: Order # + Time */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  #{order.orderNumber.slice(-6)}
                </span>
                <Badge className={`${urgencyBadge.bg} ${urgencyBadge.text} border-0 text-[10px] px-1.5 py-0`}>
                  {timeInfo.text}
                </Badge>
              </div>
            </div>
            {column !== 'completed' && column !== 'new' && (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Timer className="w-3 h-3" />
                <CookingTimer startDate={order.createdAt} />
              </div>
            )}
          </div>

          {/* Type + Table badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {getOrderTypeBadge(order.type)}
            {tableNumber && (
              <Badge className="bg-violet-100 text-violet-700 border-violet-200 border flex items-center gap-1 text-xs">
                <Utensils className="w-3 h-3" />
                Table {tableNumber}
              </Badge>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-1.5">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 min-w-[20px] text-right">
                  {item.quantity}x
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.name}
                  </p>
                  {item.notes && (
                    <div className="flex items-start gap-1 mt-0.5">
                      <MessageSquare className="w-2.5 h-2.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 italic leading-tight">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order notes */}
          {order.notes && (
            <div className="flex items-start gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-md">
              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                {order.notes}
              </p>
            </div>
          )}

          {/* Staff */}
          {staffName && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <Users className="w-2.5 h-2.5" />
              <span>By {staffName}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-1.5 pt-1">
            {column === 'new' && (
              <Button
                size="sm"
                className="flex-1 h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => onStatusChange(order.id, 'preparing')}
              >
                <Play className="w-3 h-3 mr-1" />
                Start Preparing
              </Button>
            )}
            {column === 'in_progress' && (
              <Button
                size="sm"
                className="flex-1 h-7 text-xs bg-emerald-600 min-h-[44px] hover:bg-emerald-700 text-white"
                onClick={() => onStatusChange(order.id, 'ready')}
              >
                <CircleCheck className="w-3 h-3 mr-1" />
                Mark Ready
              </Button>
            )}
            {column === 'ready' && (
              <Button
                size="sm"
                className="flex-1 h-7 text-xs bg-gray-700 hover:bg-gray-800 text-white"
                onClick={() => onStatusChange(order.id, 'completed')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Mark Served
              </Button>
            )}
            {column === 'completed' && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 w-full justify-center py-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Served</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Empty State ───

function EmptyColumn({ column }: { column: KDSColumn }) {
  const config = COLUMN_CONFIG[column];
  const Icon = config.emptyIcon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
        <Icon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {config.emptyText}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {column === 'new'
          ? 'New orders will appear here'
          : column === 'in_progress'
            ? 'Start preparing an order'
            : column === 'ready'
              ? 'Orders ready for serving'
              : 'Completed orders show here'}
      </p>
    </div>
  );
}

// ─── Main Component ───

export default function KitchenDisplay() {
  const store = useAppStore((s) => s.store);
  const storeId = store?.id || '';

  // Data
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Features
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderTypeFilter>('all');

  // Track previous order count for sound notification
  const prevOrderCountRef = useRef(0);

  // ─── Fetch Orders ───

  const fetchOrders = useCallback(async () => {
    if (!storeId) return;
    try {
      // Fetch orders with all KDS-relevant statuses
      const statuses = ['pending', 'processing', 'preparing', 'ready', 'completed'];
      const results = await Promise.all(
        statuses.map((status) =>
          fetch(`/api/orders?storeId=${storeId}&status=${status}`)
            .then((res) => (res.ok ? res.json() : { orders: [] }))
            .catch(() => ({ orders: [] }))
        )
      );

      const allOrders: KDSOrder[] = [];
      results.forEach((result) => {
        if (result.orders && Array.isArray(result.orders)) {
          allOrders.push(...result.orders);
        }
      });

      // Check for new orders (sound notification)
      const newOrderCount = allOrders.filter(
        (o) => o.status === 'pending'
      ).length;
      if (
        soundEnabled &&
        prevOrderCountRef.current > 0 &&
        newOrderCount > prevOrderCountRef.current
      ) {
        playNotificationSound();
      }
      prevOrderCountRef.current = newOrderCount;

      // Deduplicate by id
      const seen = new Set<string>();
      const unique = allOrders.filter((o) => {
        if (seen.has(o.id)) return false;
        seen.add(o.id);
        return true;
      });

      setOrders(unique);
      setLastRefresh(new Date());
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [storeId, soundEnabled]);

  // ─── Sound ───

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      // Create a simple beep using Web Audio API
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gain.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.15);
      // Second beep
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1100;
        osc2.type = 'sine';
        gain2.gain.value = 0.3;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.2);
      }, 200);
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  // ─── Status Change ───

  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: string) => {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );

      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          throw new Error('Failed to update');
        }

        const statusLabels: Record<string, string> = {
          preparing: 'In Progress',
          processing: 'In Progress',
          ready: 'Ready',
          completed: 'Completed',
        };
        toast.success(`Order moved to ${statusLabels[newStatus] || newStatus}`);
      } catch {
        // Revert on error
        toast.error('Failed to update order status');
        fetchOrders();
      }
    },
    [fetchOrders]
  );

  // ─── Auto Refresh ───

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ─── Categorize Orders ───

  const categorizedOrders = useMemo(() => {
    const filtered = orderTypeFilter === 'all'
      ? orders
      : orders.filter((o) => o.type === orderTypeFilter);

    const result: Record<KDSColumn, KDSOrder[]> = {
      new: [],
      in_progress: [],
      ready: [],
      completed: [],
    };

    filtered.forEach((order) => {
      const status = order.status.toLowerCase();
      if (status === 'pending') {
        result.new.push(order);
      } else if (status === 'processing' || status === 'preparing') {
        result.in_progress.push(order);
      } else if (status === 'ready') {
        result.ready.push(order);
      } else if (status === 'completed') {
        result.completed.push(order);
      }
    });

    // Sort: newest first for active columns, oldest first for completed
    const sortByNewest = (a: KDSOrder, b: KDSOrder) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    const sortByOldest = (a: KDSOrder, b: KDSOrder) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

    result.new.sort(sortByNewest);
    result.in_progress.sort(sortByOldest);
    result.ready.sort(sortByOldest);
    result.completed.sort(sortByNewest);

    // Keep only last 10 completed
    result.completed = result.completed.slice(0, 10);

    return result;
  }, [orders, orderTypeFilter]);

  // ─── Summary Stats ───

  const summary = useMemo(() => {
    const activeOrders = orders.filter(
      (o) => !['completed', 'cancelled', 'refunded'].includes(o.status.toLowerCase())
    );
    const activeCount = activeOrders.length;

    // Average wait time for active orders
    const now = Date.now();
    const totalWaitMinutes = activeOrders.reduce((sum, o) => {
      return sum + (now - new Date(o.createdAt).getTime()) / 60000;
    }, 0);
    const avgWait = activeCount > 0 ? Math.round(totalWaitMinutes / activeCount) : 0;

    // Overdue count (active > 15 min)
    const overdueCount = activeOrders.filter(
      (o) => (now - new Date(o.createdAt).getTime()) / 60000 > 15
    ).length;

    return { activeCount, avgWait, overdueCount };
  }, [orders]);

  // ─── Render ───

  return (
    <div className="h-full flex flex-col -m-4 md:-m-6">
      {/* ─── Header Bar ─── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Kitchen Display
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Real-time order management
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Order Type Filter */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              {([
                { key: 'all', label: 'All', icon: null },
                { key: 'dine_in', label: 'Dine-in', icon: UtensilsCrossed },
                { key: 'takeaway', label: 'Takeaway', icon: Package },
                { key: 'delivery', label: 'Delivery', icon: Truck },
              ] as const).map((filter) => {
                const Icon = filter.icon;
                return (
                  <Button
                    key={filter.key}
                    variant={orderTypeFilter === filter.key ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-none h-7 px-2 text-xs gap-1 ${
                      orderTypeFilter === filter.key
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : ''
                    }`}
                    onClick={() => setOrderTypeFilter(filter.key)}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    {filter.label}
                  </Button>
                );
              })}
            </div>

            {/* Sound Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) {
                  toast.success('Sound notifications enabled');
                }
              }}
            >
              {soundEnabled ? (
                <Bell className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <BellOff className="w-3.5 h-3.5 text-gray-400" />
              )}
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </Button>

            {/* Manual Refresh */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={fetchOrders}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* ─── Summary Stats Bar ─── */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Active: <span className="text-gray-900 dark:text-gray-100 font-bold">{summary.activeCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-sky-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Avg Wait: <span className="text-gray-900 dark:text-gray-100 font-bold">{summary.avgWait}m</span>
            </span>
          </div>
          {summary.overdueCount > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                Overdue: <span className="font-bold">{summary.overdueCount}</span>
              </span>
            </div>
          )}
          <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
            Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ─── Kanban Board ─── */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-full">
          {(Object.keys(COLUMN_CONFIG) as KDSColumn[]).map((column) => {
            const config = COLUMN_CONFIG[column];
            const ColumnIcon = config.icon;
            const columnOrders = categorizedOrders[column];

            return (
              <div
                key={column}
                className={`flex flex-col border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${config.headerBg}`}
              >
                {/* Column Header */}
                <div className={`px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 ${config.accentBorder} border-l-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ColumnIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {config.title}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs h-5 min-w-[20px] flex items-center justify-center"
                    >
                      {columnOrders.length}
                    </Badge>
                  </div>
                </div>

                {/* Column Content */}
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-2">
                    {loading ? (
                      // Loading skeletons
                      Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-40 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
                        />
                      ))
                    ) : columnOrders.length === 0 ? (
                      <EmptyColumn column={column} />
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {columnOrders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            column={column}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
