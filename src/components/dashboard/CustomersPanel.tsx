'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  FileText,
  Star,
  CreditCard,
  Package,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Gift,
  MessageSquare,
  StickyNote,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  MinusCircle,
  PlusCircle,
  Wallet,
  Crown,
  Shield,
  Award,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

// ─── Types ───

interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  loyaltyPoints: number;
  creditBalance: number;
  totalSpent: number;
  totalOrders: number;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
}

interface LoyaltyHistoryEntry {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  description: string;
  date: string;
}

const PAGE_SIZE = 10;

// ─── Gradient helper ───

function getAvatarGradient(name: string) {
  const gradients = [
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-orange-400 to-amber-500',
    'from-sky-400 to-cyan-500',
    'from-rose-400 to-pink-500',
    'from-lime-400 to-green-500',
    'from-fuchsia-400 to-purple-600',
    'from-yellow-400 to-orange-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.charAt(0).toUpperCase();
}

// ─── Mock Loyalty History ───

function generateMockLoyaltyHistory(customer: Customer): LoyaltyHistoryEntry[] {
  const entries: LoyaltyHistoryEntry[] = [];
  const now = new Date();
  if (customer.loyaltyPoints > 0) {
    // Add some earned entries
    const earnCount = Math.min(customer.totalOrders || 2, 5);
    for (let i = 0; i < earnCount; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (i * 7 + Math.floor(Math.random() * 5)));
      entries.push({
        id: `lh-earned-${i}`,
        type: 'earned',
        points: Math.floor(Math.random() * 50) + 10,
        description: `Order #${1000 + Math.floor(Math.random() * 100)} points`,
        date: d.toISOString(),
      });
    }
    if (customer.loyaltyPoints < 100) {
      entries.push({
        id: 'lh-redeemed-1',
        type: 'redeemed',
        points: 50,
        description: 'Redeemed on purchase',
        date: new Date(now.getTime() - 14 * 86400000).toISOString(),
      });
    }
  }
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ─── Mock Purchase Timeline Data ───

interface TimelineItem {
  id: string;
  orderNumber: string;
  date: string;
  items: string[];
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
}

function generateMockTimeline(customer: Customer, orders: Order[]): TimelineItem[] {
  if (orders.length > 0) {
    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      date: o.createdAt,
      items: ['Order items'],
      amount: o.totalAmount,
      status: o.status as 'completed' | 'pending' | 'cancelled',
    }));
  }
  // Generate mock timeline entries based on customer data
  const timeline: TimelineItem[] = [];
  const mockItems = [
    ['Butter Chicken', 'Naan', 'Raita'],
    ['Paneer Tikka', 'Dal Makhani', 'Rice'],
    ['Masala Dosa', 'Filter Coffee'],
    ['Biryani', 'Raita', 'Gulab Jamun'],
    ['Chole Bhature', 'Lassi'],
    ['Samosa', 'Chai', 'Pav Bhaji'],
  ];
  const count = Math.max(customer.totalOrders || 3, 1);
  const displayCount = Math.min(count, 6);
  const now = new Date();
  for (let i = 0; i < displayCount; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * Math.floor(Math.random() * 7 + 3));
    const statusRoll = Math.random();
    const status: 'completed' | 'pending' | 'cancelled' =
      statusRoll < 0.7 ? 'completed' : statusRoll < 0.9 ? 'pending' : 'cancelled';
    timeline.push({
      id: `tl-${i}`,
      orderNumber: `#${1000 + Math.floor(Math.random() * 9000)}`,
      date: d.toISOString(),
      items: mockItems[i % mockItems.length],
      amount: Math.floor(Math.random() * 800 + 150),
      status,
    });
  }
  return timeline;
}

// ─── Skeleton Loader ───

function CustomerTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

// ─── Customer Form Data ───

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
}

const emptyCustomerForm: CustomerFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
};

// ─── Main Component ───

export default function CustomersPanel() {
  const { store, globalSearch, setGlobalSearch } = useAppStore();
  const storeId = store?.id || '';

  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState(globalSearch || '');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialogs
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Detail drawer
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Loyalty modal
  const [loyaltyModalOpen, setLoyaltyModalOpen] = useState(false);
  const [loyaltyModalType, setLoyaltyModalType] = useState<'add' | 'redeem'>('add');
  const [loyaltyAmount, setLoyaltyAmount] = useState('');

  // Form state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<CustomerFormData>(emptyCustomerForm);
  const [saving, setSaving] = useState(false);

  // ─── Fetch Data ───

  const fetchCustomers = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ storeId });
      if (search) params.set('search', search);
      const res = await fetch(`/api/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [storeId, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Consume global search from Zustand and clear it
  useEffect(() => {
    if (globalSearch) {
      setSearch(globalSearch);
      setGlobalSearch('');
    }
  }, [globalSearch, setGlobalSearch]);

  // ─── Filtered Customers ───

  const filteredCustomers = useMemo(() => {
    return [...customers];
  }, [customers]);

  // ─── Pagination ───

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ─── Customer CRUD ───

  function openAddCustomer() {
    setEditingCustomer(null);
    setCustomerForm(emptyCustomerForm);
    setCustomerDialogOpen(true);
  }

  function openEditCustomer(customer: Customer) {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      gstNumber: customer.gstNumber || '',
    });
    setCustomerDialogOpen(true);
  }

  async function saveCustomer() {
    if (!customerForm.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingCustomer) {
        const res = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: customerForm.name.trim(),
            phone: customerForm.phone.trim() || null,
            email: customerForm.email.trim() || null,
            address: customerForm.address.trim() || null,
            gstNumber: customerForm.gstNumber.trim() || null,
          }),
        });
        if (res.ok) {
          toast.success('Customer updated');
          setCustomerDialogOpen(false);
          // Also update selected customer if it's the one being edited
          if (selectedCustomer?.id === editingCustomer.id) {
            setSelectedCustomer({
              ...selectedCustomer,
              name: customerForm.name.trim(),
              phone: customerForm.phone.trim() || null,
              email: customerForm.email.trim() || null,
              address: customerForm.address.trim() || null,
              gstNumber: customerForm.gstNumber.trim() || null,
            });
          }
          fetchCustomers();
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to update customer');
        }
      } else {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId,
            name: customerForm.name.trim(),
            phone: customerForm.phone.trim() || null,
            email: customerForm.email.trim() || null,
            address: customerForm.address.trim() || null,
            gstNumber: customerForm.gstNumber.trim() || null,
          }),
        });
        if (res.ok) {
          toast.success('Customer created');
          setCustomerDialogOpen(false);
          fetchCustomers();
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to create customer');
        }
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCustomer() {
    if (!customerToDelete) return;
    try {
      const res = await fetch(`/api/customers/${customerToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Customer deleted');
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
        if (selectedCustomer?.id === customerToDelete.id) {
          setDetailOpen(false);
          setSelectedCustomer(null);
        }
        fetchCustomers();
      } else {
        toast.error('Failed to delete customer');
      }
    } catch {
      toast.error('Network error');
    }
  }

  // ─── Customer Detail Drawer ───

  async function openCustomerDetail(customer: Customer) {
    setSelectedCustomer(customer);
    setDetailOpen(true);
    setLoadingOrders(true);
    try {
      const params = new URLSearchParams({ storeId, customerId: customer.id });
      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerOrders(data.orders || []);
      } else {
        setCustomerOrders([]);
      }
    } catch {
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
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

  function formatDateShort(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // ─── Loyalty helpers ───

  const LOYALTY_POINTS_VALUE = 0.5; // 1 point = ₹0.50
  const NEXT_REWARD_THRESHOLD = 500; // Points needed for next reward
  const loyaltyHistory = selectedCustomer ? generateMockLoyaltyHistory(selectedCustomer) : [];
  const loyaltyProgress = selectedCustomer
    ? Math.min((selectedCustomer.loyaltyPoints / NEXT_REWARD_THRESHOLD) * 100, 100)
    : 0;

  function handleLoyaltyAction() {
    const points = parseInt(loyaltyAmount);
    if (!points || points <= 0) {
      toast.error('Enter a valid number of points');
      return;
    }
    if (loyaltyModalType === 'redeem' && selectedCustomer && points > selectedCustomer.loyaltyPoints) {
      toast.error('Cannot redeem more points than available');
      return;
    }
    if (loyaltyModalType === 'add') {
      setSelectedCustomer({
        ...selectedCustomer!,
        loyaltyPoints: selectedCustomer!.loyaltyPoints + points,
      });
      toast.success(`Added ${points} loyalty points`);
    } else {
      setSelectedCustomer({
        ...selectedCustomer!,
        loyaltyPoints: selectedCustomer!.loyaltyPoints - points,
      });
      toast.success(`Redeemed ${points} loyalty points`);
    }
    setLoyaltyModalOpen(false);
    setLoyaltyAmount('');
  }

  // ─── Timeline helpers ───

  const timelineData = useMemo(() => {
    if (!selectedCustomer) return [];
    return generateMockTimeline(selectedCustomer, customerOrders);
  }, [selectedCustomer, customerOrders]);

  function getTimelineDotColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'pending':
        return 'bg-amber-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  }

  function getTimelineBorderColor(status: string) {
    switch (status) {
      case 'completed':
        return 'border-emerald-200 dark:border-emerald-800';
      case 'pending':
        return 'border-amber-200 dark:border-amber-800';
      case 'cancelled':
        return 'border-red-200 dark:border-red-800';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
      case 'pending':
        return <Clock className="h-3.5 w-3.5 text-amber-600" />;
      case 'cancelled':
        return <XCircle className="h-3.5 w-3.5 text-red-600" />;
      default:
        return null;
    }
  }

  // ─── Render ───

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold text-emerald-600">{customers.filter(c => c.totalOrders > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">New This Month</p>
                <p className="text-xl font-bold text-sky-600">{customers.filter(c => {
                  const d = new Date(c.createdAt);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Loyalty Points</p>
                <p className="text-xl font-bold">{customers.reduce((s, c) => s + c.loyaltyPoints, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-bold">Customers</h2>
            <p className="text-sm text-muted-foreground">Manage your customer base</p>
          </div>
          <Badge variant="secondary" className="ml-1">
            {filteredCustomers.length}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-56"
            />
          </div>
          <Button onClick={openAddCustomer} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <CustomerTableSkeleton />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm">Add your first customer to get started</p>
              <Button
                onClick={openAddCustomer}
                size="sm"
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Customer
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-center">Loyalty Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer hover:scale-[1.005] transition-transform duration-150"
                      onClick={() => openCustomerDetail(customer)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarGradient(customer.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {getInitials(customer.name)}
                          </div>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.phone || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.email || '—'}
                      </TableCell>
                      <TableCell className="text-center">{customer.totalOrders}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-center">
                        {customer.loyaltyPoints > 0 ? (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            {customer.loyaltyPoints} pts
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openCustomerDetail(customer)}
                            title="View"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setCustomerToDelete(customer);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                  {Math.min(currentPage * PAGE_SIZE, filteredCustomers.length)} of{' '}
                  {filteredCustomers.length}
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
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
          <CustomerTableSkeleton />
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No customers found</p>
            <Button
              onClick={openAddCustomer}
              size="sm"
              className="mt-4 bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Customer
            </Button>
          </div>
        ) : (
          paginatedCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="p-4 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => openCustomerDetail(customer)}
            >
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarGradient(customer.name)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {getInitials(customer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{customer.name}</p>
                    {customer.loyaltyPoints > 0 && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs ml-2">
                        {customer.loyaltyPoints} pts
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                    {customer.phone && (
                      <span className="flex items-center gap-0.5">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </span>
                    )}
                    {customer.email && (
                      <span className="flex items-center gap-0.5">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span>
                      <strong>{customer.totalOrders}</strong> orders
                    </span>
                    <span>•</span>
                    <span className="font-medium text-emerald-700">
                      {formatCurrency(customer.totalSpent)}
                    </span>
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditCustomer(customer);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomerToDelete(customer);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}

        {/* Mobile Pagination */}
        {!loading && filteredCustomers.length > 0 && (
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ═══ CUSTOMER DETAIL DRAWER (Sheet from right) ════════════ */}
      {/* ═══════════════════════════════════════════════════════════ */}

      <Sheet open={detailOpen} onOpenChange={(open) => {
        setDetailOpen(open);
        if (!open) {
          // Don't clear selectedCustomer immediately to allow animation
          setTimeout(() => setSelectedCustomer(null), 300);
        }
      }}>
        <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto p-0">
          {selectedCustomer && (
            <div className="flex flex-col h-full">
              {/* ─── Customer Header ─── */}
              <div className="relative p-6 pb-4">
                {/* Gradient background banner */}
                <div className={`absolute inset-0 h-32 bg-gradient-to-br ${getAvatarGradient(selectedCustomer.name)} opacity-10`} />
                <div className="relative flex flex-col items-center text-center pt-2">
                  {/* Avatar with initials */}
                  <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${getAvatarGradient(selectedCustomer.name)} flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white dark:ring-gray-900`}>
                    {getInitials(selectedCustomer.name)}
                  </div>
                  <h2 className="text-xl font-bold mt-3">{selectedCustomer.name}</h2>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-sm text-muted-foreground">
                    {selectedCustomer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {selectedCustomer.phone}
                      </span>
                    )}
                    {selectedCustomer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {selectedCustomer.email}
                      </span>
                    )}
                  </div>
                  {selectedCustomer.address && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedCustomer.address}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Customer since {formatDate(selectedCustomer.createdAt)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setDetailOpen(false);
                      setTimeout(() => {
                        openEditCustomer(selectedCustomer);
                      }, 300);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit Customer
                  </Button>
                </div>
              </div>

              <Separator />

              {/* ─── Quick Stats Row (4 mini cards) ─── */}
              <div className="grid grid-cols-2 gap-3 p-4">
                <Card className="shadow-sm">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-tight">{formatCurrency(selectedCustomer.totalSpent)}</p>
                      <p className="text-[11px] text-muted-foreground">Total Spent</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-tight">{selectedCustomer.totalOrders}</p>
                      <p className="text-[11px] text-muted-foreground">Orders</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-tight">{selectedCustomer.loyaltyPoints}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Loyalty Pts <span className="text-emerald-600">({formatCurrency(selectedCustomer.loyaltyPoints * LOYALTY_POINTS_VALUE)} value)</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                      <Receipt className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-tight">
                        {selectedCustomer.totalOrders > 0
                          ? formatCurrency(selectedCustomer.totalSpent / selectedCustomer.totalOrders)
                          : formatCurrency(0)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Avg. Order</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* ─── Spending Chart ─── */}
              <div className="p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Spending Trend
                </h3>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={(() => {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                        const baseSpend = selectedCustomer.totalSpent > 0 ? selectedCustomer.totalSpent / 6 : 500;
                        return months.map((m, i) => ({
                          month: m,
                          amount: Math.round(baseSpend * (0.6 + ((i * 37 + 13) % 100) / 100 * 0.8)),
                        }));
                      })()}
                      margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value: number) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#spendGradient)"
                        dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <Separator />

              {/* ─── Loyalty Tier Summary ─── */}
              <div className="p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Loyalty Tier
                </h3>
                {(() => {
                  const totalSpent = selectedCustomer.totalSpent;
                  let tier: string;
                  let tierColor: string;
                  let tierBg: string;
                  let tierIcon: React.ElementType;
                  let nextTier: string;
                  let nextTierThreshold: number;

                  if (totalSpent >= 25000) {
                    tier = 'Gold';
                    tierColor = 'text-amber-600 dark:text-amber-400';
                    tierBg = 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40';
                    tierIcon = Crown;
                    nextTier = 'Platinum';
                    nextTierThreshold = 50000;
                  } else if (totalSpent >= 10000) {
                    tier = 'Silver';
                    tierColor = 'text-gray-600 dark:text-gray-300';
                    tierBg = 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
                    tierIcon = Shield;
                    nextTier = 'Gold';
                    nextTierThreshold = 25000;
                  } else {
                    tier = 'Bronze';
                    tierColor = 'text-orange-600 dark:text-orange-400';
                    tierBg = 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/40';
                    tierIcon = Award;
                    nextTier = 'Silver';
                    nextTierThreshold = 10000;
                  }

                  const TierIcon = tierIcon;
                  const progressToNext = Math.min((totalSpent / nextTierThreshold) * 100, 100);
                  const amountToNext = Math.max(nextTierThreshold - totalSpent, 0);

                  return (
                    <Card className={`shadow-sm border ${tierBg}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tierBg}`}>
                              <TierIcon className={`w-5 h-5 ${tierColor}`} />
                            </div>
                            <div>
                              <p className={`text-lg font-bold ${tierColor}`}>{tier}</p>
                              <p className="text-[10px] text-muted-foreground">Current Tier</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{selectedCustomer.loyaltyPoints}</p>
                            <p className="text-[10px] text-muted-foreground">Points Balance</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-muted-foreground">Progress to {nextTier}</span>
                            <span className="text-[10px] font-semibold">{Math.round(progressToNext)}%</span>
                          </div>
                          <Progress value={progressToNext} className="h-2" />
                          {amountToNext > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Spend {formatCurrency(amountToNext)} more to reach {nextTier}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>

              <Separator />

              {/* ─── Purchase Timeline ─── */}
              <div className="p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <ShoppingBag className="h-4 w-4" />
                  Purchase Timeline
                </h3>
                {loadingOrders ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-16 flex-1 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : timelineData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No purchase history yet</p>
                  </div>
                ) : (
                  <div className="relative max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {timelineData.map((item, index) => (
                      <div key={item.id} className="flex gap-3 pb-4 last:pb-0">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={`h-3 w-3 rounded-full ${getTimelineDotColor(item.status)} ring-2 ring-white dark:ring-gray-900 z-10 mt-1`} />
                          {index < timelineData.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
                          )}
                        </div>
                        {/* Timeline content */}
                        <div className={`flex-1 rounded-lg border ${getTimelineBorderColor(item.status)} p-3 -mt-0.5`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{item.orderNumber}</span>
                              {getStatusIcon(item.status)}
                            </div>
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span>{formatDateShort(item.date)}</span>
                            <span>•</span>
                            <span>{formatTime(item.date)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.items.map((itemName, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] h-5">
                                {itemName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* ─── Loyalty Points Section ─── */}
              <div className="p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Gift className="h-4 w-4 text-amber-500" />
                  Loyalty Points
                </h3>
                <Card className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    {/* Current points + progress */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{selectedCustomer.loyaltyPoints} <span className="text-sm font-normal text-muted-foreground">pts</span></p>
                        <p className="text-xs text-muted-foreground">
                          Value: {formatCurrency(selectedCustomer.loyaltyPoints * LOYALTY_POINTS_VALUE)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Next reward at</p>
                        <p className="text-sm font-semibold">{NEXT_REWARD_THRESHOLD} pts</p>
                      </div>
                    </div>
                    <div>
                      <Progress value={loyaltyProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {NEXT_REWARD_THRESHOLD - selectedCustomer.loyaltyPoints > 0
                          ? `${NEXT_REWARD_THRESHOLD - selectedCustomer.loyaltyPoints} points to next reward`
                          : 'Reward unlocked! 🎉'}
                      </p>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/20"
                        onClick={() => {
                          setLoyaltyModalType('add');
                          setLoyaltyAmount('');
                          setLoyaltyModalOpen(true);
                        }}
                      >
                        <PlusCircle className="h-3.5 w-3.5 mr-1" />
                        Add Points
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-900/20"
                        onClick={() => {
                          setLoyaltyModalType('redeem');
                          setLoyaltyAmount('');
                          setLoyaltyModalOpen(true);
                        }}
                        disabled={selectedCustomer.loyaltyPoints <= 0}
                      >
                        <MinusCircle className="h-3.5 w-3.5 mr-1" />
                        Redeem Points
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Points History */}
                {loyaltyHistory.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto custom-scrollbar">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recent Activity</p>
                    {loyaltyHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div className="flex items-center gap-2">
                          {entry.type === 'earned' ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-red-500 rotate-90" />
                          )}
                          <div>
                            <p className="text-xs font-medium">{entry.description}</p>
                            <p className="text-[10px] text-muted-foreground">{formatDateShort(entry.date)}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold ${entry.type === 'earned' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {entry.type === 'earned' ? '+' : '-'}{entry.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* ─── Quick Actions at Bottom ─── */}
              <div className="p-4 mt-auto">
                <h3 className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs h-9"
                    onClick={() => {
                      if (selectedCustomer.phone) {
                        const phone = selectedCustomer.phone.replace(/\D/g, '');
                        window.open(`https://wa.me/${phone}`, '_blank');
                      } else {
                        toast.error('No phone number available for WhatsApp');
                      }
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-green-600" />
                    Send WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs h-9"
                    onClick={() => {
                      toast.success(`Credit added for ${selectedCustomer.name}`);
                    }}
                  >
                    <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                    Add Credit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs h-9"
                    onClick={() => {
                      setDetailOpen(false);
                      setTimeout(() => {
                        const { setDashboardTab } = useAppStore.getState();
                        setDashboardTab('orders');
                      }, 300);
                      toast.info('Viewing orders for ' + selectedCustomer.name);
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-sky-600" />
                    View Orders
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 text-xs h-9"
                    onClick={() => {
                      setDetailOpen(false);
                      toast.success('New bill started for ' + selectedCustomer.name);
                    }}
                  >
                    <Receipt className="h-3.5 w-3.5 text-violet-600" />
                    New Bill
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Loyalty Add/Redeem Modal ─── */}
      <Dialog open={loyaltyModalOpen} onOpenChange={setLoyaltyModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {loyaltyModalType === 'add' ? 'Add Loyalty Points' : 'Redeem Loyalty Points'}
            </DialogTitle>
            <DialogDescription>
              {loyaltyModalType === 'add'
                ? `Add points to ${selectedCustomer?.name}'s loyalty balance`
                : `Redeem points from ${selectedCustomer?.name}'s loyalty balance (Available: ${selectedCustomer?.loyaltyPoints} pts)`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="loyalty-amount">Points</Label>
              <Input
                id="loyalty-amount"
                type="number"
                placeholder="Enter points"
                value={loyaltyAmount}
                onChange={(e) => setLoyaltyAmount(e.target.value)}
                min={1}
                max={loyaltyModalType === 'redeem' ? selectedCustomer?.loyaltyPoints : undefined}
              />
              {loyaltyAmount && (
                <p className="text-xs text-muted-foreground">
                  Value: {formatCurrency(parseInt(loyaltyAmount) * LOYALTY_POINTS_VALUE)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((v) => (
                <Button
                  key={v}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoyaltyAmount(String(v))}
                >
                  +{v}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoyaltyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLoyaltyAction}
              className={loyaltyModalType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}
            >
              {loyaltyModalType === 'add' ? 'Add Points' : 'Redeem Points'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add/Edit Customer Dialog ─── */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? 'Update customer information' : 'Fill in customer details'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="customer-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customer-name"
                placeholder="Customer name"
                value={customerForm.name}
                onChange={(e) => setCustomerForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer-phone">Phone</Label>
                <Input
                  id="customer-phone"
                  placeholder="Phone number"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  placeholder="Email address"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="customer-address">Address</Label>
              <Textarea
                id="customer-address"
                placeholder="Customer address"
                value={customerForm.address}
                onChange={(e) => setCustomerForm((f) => ({ ...f, address: e.target.value }))}
                rows={2}
              />
            </div>

            {/* GST Number */}
            <div className="grid gap-2">
              <Label htmlFor="customer-gst">GST Number</Label>
              <Input
                id="customer-gst"
                placeholder="22AAAAA0000A1Z5"
                value={customerForm.gstNumber}
                onChange={(e) => setCustomerForm((f) => ({ ...f, gstNumber: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveCustomer}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? 'Saving...' : editingCustomer ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Customer Confirmation ─── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{customerToDelete?.name}&quot;? This action cannot
              be undone and will remove all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCustomer}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
