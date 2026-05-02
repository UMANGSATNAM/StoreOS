'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  ShoppingCart,
  AlertTriangle,
  IndianRupee,
  UserPlus,
  RefreshCcw,
  PackageCheck,
  Star,
  Clock,
  Wifi,
  BarChart3,
  Tag,
  CalendarDays,
  Scissors,
  CheckCircle2,
  Mail,
  Eye,
  X,
  ChevronDown,
  BellOff,
  Package,
  CreditCard,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────

type NotificationCategory = 'order' | 'alert' | 'system' | 'payment';

interface Notification {
  id: string;
  type: NotificationCategory;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  actionLabel: string;
  actionTab?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'order',
    icon: ShoppingCart,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'New Order Received',
    description: '₹1,250 from Priya Sharma — Dine-in, Table T2',
    time: '5 min ago',
    unread: true,
    actionLabel: 'View Order',
    actionTab: 'orders',
  },
  {
    id: 'n2',
    type: 'alert',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    title: 'Low Stock Alert',
    description: 'Butter Chicken — only 2 units left',
    time: '12 min ago',
    unread: true,
    actionLabel: 'Check Stock',
    actionTab: 'products',
  },
  {
    id: 'n3',
    type: 'payment',
    icon: IndianRupee,
    iconColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-50 dark:bg-sky-900/20',
    title: 'Payment Received via UPI',
    description: '₹3,500 credited to your account',
    time: '25 min ago',
    unread: true,
    actionLabel: 'View Details',
    actionTab: 'orders',
  },
  {
    id: 'n4',
    type: 'system',
    icon: UserPlus,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
    title: 'New Customer Signup',
    description: 'Amit Patel joined your store',
    time: '40 min ago',
    unread: true,
    actionLabel: 'View Profile',
    actionTab: 'customers',
  },
  {
    id: 'n5',
    type: 'system',
    icon: CreditCard,
    iconColor: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-50 dark:bg-violet-900/20',
    title: 'Subscription Renewal Reminder',
    description: 'Your Pro plan renews in 3 days — ₹999/month',
    time: '1 hour ago',
    unread: true,
    actionLabel: 'Manage Plan',
    actionTab: 'settings',
  },
  {
    id: 'n6',
    type: 'order',
    icon: BarChart3,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'Daily Sales Summary',
    description: "Today's sales: ₹12,450 across 18 orders",
    time: '2 hours ago',
    unread: false,
    actionLabel: 'View Report',
    actionTab: 'reports',
  },
  {
    id: 'n7',
    type: 'payment',
    icon: RefreshCcw,
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    title: 'Refund Processed',
    description: 'Order #ORD-004 — ₹450 refunded via UPI',
    time: '2 hours ago',
    unread: false,
    actionLabel: 'View Order',
    actionTab: 'orders',
  },
  {
    id: 'n8',
    type: 'alert',
    icon: PackageCheck,
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
    title: 'Stock Restocked',
    description: 'Paneer Tikka — 50 units added to inventory',
    time: '3 hours ago',
    unread: false,
    actionLabel: 'View Stock',
    actionTab: 'products',
  },
  {
    id: 'n9',
    type: 'order',
    icon: Star,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    iconBg: 'bg-yellow-50 dark:bg-yellow-900/20',
    title: 'New Review — 5 Stars',
    description: 'Rajesh Kumar left a 5-star review',
    time: '4 hours ago',
    unread: false,
    actionLabel: 'View Review',
    actionTab: 'customers',
  },
  {
    id: 'n10',
    type: 'system',
    icon: Clock,
    iconColor: 'text-teal-600 dark:text-teal-400',
    iconBg: 'bg-teal-50 dark:bg-teal-900/20',
    title: 'Shift Started',
    description: 'Priya Singh (Cashier) started her shift',
    time: '5 hours ago',
    unread: false,
    actionLabel: 'View Staff',
    actionTab: 'staff',
  },
  {
    id: 'n11',
    type: 'order',
    icon: Wifi,
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    title: 'Zomato Order Received',
    description: 'Order #ZM-456 — ₹820, Delivery',
    time: '6 hours ago',
    unread: false,
    actionLabel: 'View Order',
    actionTab: 'orders',
  },
  {
    id: 'n12',
    type: 'system',
    icon: Mail,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
    title: 'Weekly Report Ready',
    description: 'Your weekly business report is ready to view',
    time: 'Yesterday',
    unread: false,
    actionLabel: 'View Report',
    actionTab: 'reports',
  },
  {
    id: 'n13',
    type: 'order',
    icon: Tag,
    iconColor: 'text-pink-600 dark:text-pink-400',
    iconBg: 'bg-pink-50 dark:bg-pink-900/20',
    title: 'Bulk Discount Applied',
    description: 'Order #ORD-007 — 15% discount applied on ₹4,200',
    time: 'Yesterday',
    unread: false,
    actionLabel: 'View Order',
    actionTab: 'orders',
  },
  {
    id: 'n14',
    type: 'order',
    icon: CalendarDays,
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
    title: 'Table T3 Reserved',
    description: 'Reserved for 7:30 PM — Party of 4',
    time: 'Yesterday',
    unread: false,
    actionLabel: 'View Tables',
    actionTab: 'tables',
  },
  {
    id: 'n15',
    type: 'system',
    icon: Scissors,
    iconColor: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-50 dark:bg-violet-900/20',
    title: 'Appointment Confirmed',
    description: 'Haircut — Rahul Verma at 3:00 PM',
    time: '2 days ago',
    unread: false,
    actionLabel: 'View Schedule',
    actionTab: 'appointments',
  },
];

// ─── Category badge color mapping ───────────────────────────────

const CATEGORY_BADGE_STYLES: Record<NotificationCategory, string> = {
  order: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  alert: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  system: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  payment: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  order: 'Order',
  alert: 'Alert',
  system: 'System',
  payment: 'Payment',
};

// ─── Component ──────────────────────────────────────────────────

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState(8);

  // Computed values
  const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications]);

  const todayCount = useMemo(() => {
    const todayKeywords = ['min ago', 'hour ago', 'hours ago'];
    return notifications.filter(n => todayKeywords.some(k => n.time.includes(k))).length;
  }, [notifications]);

  const thisWeekCount = useMemo(() => {
    const weekKeywords = ['min ago', 'hour ago', 'hours ago', 'Yesterday', 'day ago', 'days ago'];
    return notifications.filter(n => weekKeywords.some(k => n.time.includes(k))).length;
  }, [notifications]);

  const totalCount = notifications.length;

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  // Paginated notifications
  const displayedNotifications = useMemo(() => {
    return filteredNotifications.slice(0, displayCount);
  }, [filteredNotifications, displayCount]);

  const hasMore = displayCount < filteredNotifications.length;

  // Handlers
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification dismissed');
  };

  const handleAction = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    toast.info(`Navigating to ${notification.actionLabel}...`);
  };

  // Stat cards data
  const statCards = [
    {
      title: 'Unread',
      value: unreadCount,
      icon: Bell,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-900/20',
      leftBorder: 'border-l-sky-500',
    },
    {
      title: 'Today',
      value: todayCount,
      icon: Clock,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      leftBorder: 'border-l-emerald-500',
    },
    {
      title: 'This Week',
      value: thisWeekCount,
      icon: CalendarDays,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      leftBorder: 'border-l-amber-500',
    },
    {
      title: 'Total',
      value: totalCount,
      icon: Mail,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      leftBorder: 'border-l-purple-500',
    },
  ];

  return (
    <div className="space-y-6 p-1">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Notifications Center
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Stay updated with your store activity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs gap-1.5 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`border border-gray-200 dark:border-gray-700 border-l-4 ${stat.leftBorder} shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ─── Filter Tabs ─── */}
      <Tabs value={activeFilter} onValueChange={(val) => { setActiveFilter(val); setDisplayCount(8); }}>
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="order" className="text-xs sm:text-sm">
            <ShoppingCart className="w-3.5 h-3.5" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="alert" className="text-xs sm:text-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="system" className="text-xs sm:text-sm">
            <Settings className="w-3.5 h-3.5" />
            System
          </TabsTrigger>
        </TabsList>

        {/* We use TabsContent just for structural compatibility but render our own list */}
        <TabsContent value={activeFilter} className="mt-4">
          {filteredNotifications.length === 0 ? (
            /* ─── Empty State ─── */
            <Card className="border border-dashed border-gray-300 dark:border-gray-600">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <BellOff className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  No notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  {activeFilter === 'all'
                    ? "You're all caught up! No notifications at the moment."
                    : `No ${CATEGORY_LABELS[activeFilter as NotificationCategory] || activeFilter} notifications found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            /* ─── Notification List ─── */
            <div className="space-y-3">
              {displayedNotifications.map((notification) => {
                const NIcon = notification.icon;
                return (
                  <Card
                    key={notification.id}
                    className={`border transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${
                      notification.unread
                        ? 'border-sky-200 dark:border-sky-800/50 bg-sky-50/30 dark:bg-sky-900/10'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.iconBg}`}>
                          <NIcon className={`w-5 h-5 ${notification.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {notification.title}
                            </h4>
                            {notification.unread && (
                              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" title="Unread" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {notification.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {notification.time}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 border-0 ${CATEGORY_BADGE_STYLES[notification.type]}`}
                            >
                              {CATEGORY_LABELS[notification.type]}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 h-7"
                            onClick={() => handleAction(notification)}
                          >
                            {notification.actionLabel}
                          </Button>
                          {notification.unread && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDismiss(notification.id)}
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* ─── Load More ─── */}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDisplayCount(prev => prev + 8)}
                    className="text-xs gap-1.5"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    Load More ({filteredNotifications.length - displayCount} remaining)
                  </Button>
                </div>
              )}

              {/* ─── Showing count ─── */}
              {!hasMore && filteredNotifications.length > 0 && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2">
                  Showing all {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
