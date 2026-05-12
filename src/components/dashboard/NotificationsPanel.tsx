'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  ShoppingCart,
  IndianRupee,
  RefreshCcw,
  PackageCheck,
  Clock,
  Package,
  Settings,
  Users,
  Trash2,
  CheckCircle2,
  Mail,
  CalendarDays,
  BellOff,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────

type NotificationCategory = 'order' | 'inventory' | 'payment' | 'customer' | 'system';

interface DbNotification {
  id: string;
  storeId: string | null;
  userId: string | null;
  title: string;
  message: string;
  type: string; // info, warning, success, error, order
  read: boolean;
  createdAt: string;
  isDynamic?: boolean;
}

interface DisplayNotification {
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
  timestamp: Date;
}

// ─── Category badge color mapping ───────────────────────────────

const CATEGORY_BADGE_STYLES: Record<NotificationCategory, string> = {
  order: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  inventory: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  payment: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  customer: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  system: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  order: 'Orders',
  inventory: 'Inventory',
  payment: 'Payments',
  customer: 'Customers',
  system: 'System',
};

const CATEGORY_ICONS: Record<NotificationCategory, React.ElementType> = {
  order: ShoppingCart,
  inventory: Package,
  payment: IndianRupee,
  customer: Users,
  system: Settings,
};

// ─── Map DB notification type to display category ─────────────────

function mapDbToCategory(notif: DbNotification): NotificationCategory {
  if (notif.type === 'order') return 'order';
  if (notif.type === 'warning') return 'inventory';
  if (notif.type === 'success') return 'payment';
  if (notif.type === 'error') return 'system';
  if (notif.type === 'info' && notif.title.toLowerCase().includes('customer')) return 'customer';
  return 'system';
}

// ─── Map category to icon/color info ────────────────────────────

function getCategoryStyle(category: NotificationCategory): {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
} {
  switch (category) {
    case 'order':
      return { icon: ShoppingCart, iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    case 'inventory':
      return { icon: Package, iconColor: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-900/20' };
    case 'payment':
      return { icon: IndianRupee, iconColor: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-50 dark:bg-green-900/20' };
    case 'customer':
      return { icon: Users, iconColor: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-50 dark:bg-violet-900/20' };
    case 'system':
    default:
      return { icon: Settings, iconColor: 'text-gray-600 dark:text-gray-400', iconBg: 'bg-gray-50 dark:bg-gray-900/20' };
  }
}

// ─── Map category to action tab and label ───────────────────────

function getCategoryAction(category: NotificationCategory): { label: string; tab: string } {
  switch (category) {
    case 'order':
      return { label: 'View Order', tab: 'orders' };
    case 'inventory':
      return { label: 'Check Stock', tab: 'products' };
    case 'payment':
      return { label: 'View Details', tab: 'orders' };
    case 'customer':
      return { label: 'View Profile', tab: 'customers' };
    case 'system':
    default:
      return { label: 'View', tab: 'settings' };
  }
}

// ─── Relative time formatter ────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Timestamp Grouping ──────────────────────────────────────────

type TimeGroup = 'Today' | 'Yesterday' | 'Earlier this week' | 'Older';

function getTimeGroup(date: Date): TimeGroup {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() >= today.getTime()) return 'Today';
  if (d.getTime() >= yesterday.getTime()) return 'Yesterday';
  if (d.getTime() >= weekAgo.getTime()) return 'Earlier this week';
  return 'Older';
}

const GROUP_ORDER: TimeGroup[] = ['Today', 'Yesterday', 'Earlier this week', 'Older'];

// ─── Animation variants ─────────────────────────────────────────

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

// ─── Component ──────────────────────────────────────────────────

interface NotificationsPanelProps {
  storeId: string;
}

export default function NotificationsPanel({ storeId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState(20);

  // ─── Fetch notifications from API ───────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await fetch(`/api/notifications?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        const dbNotifs: DbNotification[] = data.notifications || [];

        const mapped: DisplayNotification[] = dbNotifs.map((n) => {
          const category = mapDbToCategory(n);
          const style = getCategoryStyle(category);
          const action = getCategoryAction(category);
          const timestamp = new Date(n.createdAt);

          return {
            id: n.id,
            type: category,
            icon: style.icon,
            iconColor: style.iconColor,
            iconBg: style.iconBg,
            title: n.title,
            description: n.message,
            time: formatRelativeTime(timestamp),
            unread: !n.read,
            actionLabel: action.label,
            actionTab: action.tab,
            timestamp,
          };
        });

        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Initial fetch + auto-refresh every 30 seconds
  useEffect(() => {
    setLoading(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Computed values
  const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications]);

  const todayCount = useMemo(() => {
    return notifications.filter(n => getTimeGroup(n.timestamp) === 'Today').length;
  }, [notifications]);

  const thisWeekCount = useMemo(() => {
    return notifications.filter(n => {
      const group = getTimeGroup(n.timestamp);
      return group === 'Today' || group === 'Yesterday' || group === 'Earlier this week';
    }).length;
  }, [notifications]);

  const totalCount = notifications.length;

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === activeFilter);
    }
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notifications, activeFilter]);

  // Paginated notifications
  const displayedNotifications = useMemo(() => {
    return filteredNotifications.slice(0, displayCount);
  }, [filteredNotifications, displayCount]);

  const hasMore = displayCount < filteredNotifications.length;

  // Group notifications by time
  const groupedNotifications = useMemo(() => {
    const groups: Record<TimeGroup, DisplayNotification[]> = {
      'Today': [],
      'Yesterday': [],
      'Earlier this week': [],
      'Older': [],
    };
    displayedNotifications.forEach(n => {
      const group = getTimeGroup(n.timestamp);
      groups[group].push(n);
    });
    return groups;
  }, [displayedNotifications]);

  // ─── Handlers ──────────────────────────────────────────────

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true, storeId }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        toast.success('All notifications marked as read');
      } else {
        toast.error('Failed to mark all as read');
      }
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleToggleRead = async (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;

    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, unread: !n.unread } : n))
    );

    // Only call API for stored (non-dynamic) notifications
    if (!id.startsWith('dynamic-')) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      } catch {
        // Revert on failure
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, unread: !n.unread } : n))
        );
      }
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch(`/api/notifications?storeId=${storeId}&clearAll=true`, {
        method: 'DELETE',
      });
      if (res.ok) {
        // Remove all stored notifications, keep only dynamic ones
        setNotifications(prev => prev.filter(n => n.id.startsWith('dynamic-')));
        toast.success('All stored notifications cleared');
      } else {
        toast.error('Failed to clear notifications');
      }
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const handleDismiss = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));

    // Only call API for stored (non-dynamic) notifications
    if (!id.startsWith('dynamic-')) {
      try {
        const res = await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
        if (!res.ok) {
          // Revert on failure by re-fetching
          fetchNotifications();
          toast.error('Failed to dismiss notification');
        } else {
          toast.success('Notification dismissed');
        }
      } catch {
        fetchNotifications();
        toast.error('Failed to dismiss notification');
      }
    } else {
      toast.success('Notification dismissed');
    }
  };

  const handleAction = (notification: DisplayNotification) => {
    if (notification.unread) {
      handleToggleRead(notification.id);
    }
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

  // Filter tabs with counts
  const filterTabs = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'order', label: 'Orders', icon: ShoppingCart },
    { value: 'inventory', label: 'Inventory', icon: Package },
    { value: 'payment', label: 'Payments', icon: IndianRupee },
    { value: 'customer', label: 'Customers', icon: Users },
    { value: 'system', label: 'System', icon: Settings },
  ];

  // ─── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Notifications Center
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading notifications...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

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
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            className="text-xs gap-1.5 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Refresh
          </Button>
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
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs gap-1.5 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
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
      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((tab) => {
          const TabIcon = tab.icon;
          const count = tab.value === 'all'
            ? notifications.length
            : notifications.filter(n => n.type === tab.value).length;
          const isActive = activeFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => { setActiveFilter(tab.value); setDisplayCount(20); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
              {count > 0 && (
                <span className={`ml-0.5 px-1.5 py-0 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-emerald-200 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Notification List ─── */}
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
        <div className="space-y-6">
          {GROUP_ORDER.map((group) => {
            const groupNotifications = groupedNotifications[group];
            if (groupNotifications.length === 0) return null;

            return (
              <div key={group}>
                {/* Group Header */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {group}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                    {groupNotifications.length} notification{groupNotifications.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Notification Cards with Animation */}
                <AnimatePresence mode="popLayout">
                  <div className="space-y-2">
                    {groupNotifications.map((notification, idx) => {
                      const NIcon = notification.icon;
                      const TypeIcon = CATEGORY_ICONS[notification.type];
                      return (
                        <motion.div
                          key={notification.id}
                          custom={idx}
                          variants={listItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                        >
                          <Card
                            className={`border transition-all duration-200 hover:shadow-md hover:scale-[1.005] ${
                              notification.unread
                                ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/20 dark:bg-emerald-900/5'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {/* Type-specific Icon */}
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
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Unread" />
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
                                      <TypeIcon className="w-2.5 h-2.5 mr-0.5" />
                                      {CATEGORY_LABELS[notification.type]}
                                    </Badge>
                                    {notification.id.startsWith('dynamic-') && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] px-1.5 py-0 border-0 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                                      >
                                        Live
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 h-7"
                                    onClick={() => handleAction(notification)}
                                  >
                                    {notification.actionLabel}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                    onClick={() => handleToggleRead(notification.id)}
                                    title={notification.unread ? 'Mark as read' : 'Mark as unread'}
                                  >
                                    {notification.unread ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  </Button>
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
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              </div>
            );
          })}

          {/* ─── Load More ─── */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisplayCount(prev => prev + 10)}
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
    </div>
  );
}
