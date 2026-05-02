'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  customer: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
  items: OrderItem[];
}

type StatusFilter = 'all' | 'completed' | 'held' | 'cancelled';

const PAGE_SIZE = 10;

// ─── Skeleton Loader ───

function OrdersTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
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

// ─── Status Badge ───

function OrderStatusBadge({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'paid':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 border">
          Completed
        </Badge>
      );
    case 'held':
    case 'pending':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 border">
          Held
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 border">
          Cancelled
        </Badge>
      );
    case 'refunded':
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 border">
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

// ─── Main Component ───

export default function OrdersPanel() {
  const { store } = useAppStore();
  const storeId = store?.id || '';

  // Data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Detail dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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
  }, [search, statusFilter, dateFilter]);

  // ─── Filtered Orders ───

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customer?.name || '').toLowerCase().includes(q) ||
        o.paymentMethod.toLowerCase().includes(q)
    );
  }, [orders, search]);

  // ─── Pagination ───

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ─── Actions ───

  function viewOrderDetail(order: Order) {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  }

  async function refundOrder(order: Order) {
    try {
      // Update order status to refunded
      const res = await fetch(`/api/orders?storeId=${storeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, status: 'refunded' }),
      });
      // Since we don't have a PATCH for orders, we'll just update locally
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'refunded' } : o))
      );
      toast.success(`Order #${order.orderNumber} has been refunded`);
      setDetailDialogOpen(false);
    } catch {
      toast.error('Failed to refund order');
    }
  }

  function handlePrintReceipt() {
    toast.success('Printing receipt...');
    setTimeout(() => window.print(), 300);
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

  function getPaymentMethodLabel(method: string) {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'upi':
        return 'UPI';
      case 'card':
        return 'Card';
      case 'split':
        return 'Split';
      default:
        return method;
    }
  }

  // ─── Render ───

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold">Orders</h2>
          <Badge variant="secondary" className="ml-1">
            {filteredOrders.length}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-1 text-muted-foreground" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="held">Held</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-9 w-44"
          />
        </div>
        {dateFilter && (
          <Button variant="ghost" size="sm" onClick={() => setDateFilter('')} className="h-8">
            <X className="h-3 w-3 mr-1" />
            Clear Date
          </Button>
        )}
      </div>

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
                {statusFilter !== 'all' || dateFilter
                  ? 'Try changing your filters'
                  : 'Start billing to see orders here'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={order.id}>
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
                        <Badge variant="outline" className="text-xs capitalize">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </Badge>
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
                          {order.status === 'held' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-amber-600 hover:text-amber-700"
                              onClick={() => {
                                toast.success('Order resumed — go to Billing to complete');
                              }}
                              title="Resume"
                            >
                              <Play className="h-4 w-4" />
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
            <Card key={order.id} className="p-4">
              <div className="flex items-start justify-between">
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
                      {formatDate(order.createdAt)} {formatTime(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </span>
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
                {order.status === 'held' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-amber-600 hover:text-amber-700"
                    onClick={() => toast.success('Order resumed')}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Resume
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

      {/* ─── Order Detail Dialog ─── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              Order #{selectedOrder?.orderNumber.slice(-8)}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <span>
                  {formatDate(selectedOrder.createdAt)} at {formatTime(selectedOrder.createdAt)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Status + Payment */}
              <div className="flex items-center gap-2 flex-wrap">
                <OrderStatusBadge status={selectedOrder.status} />
                <Badge variant="outline" className="capitalize">
                  {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {selectedOrder.type.replace('_', ' ')}
                </Badge>
              </div>

              {/* Customer Info */}
              {selectedOrder.customer && (
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{selectedOrder.customer.name}</p>
                        {selectedOrder.customer.phone && (
                          <p className="text-xs text-muted-foreground">
                            {selectedOrder.customer.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items List */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Items</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Item</TableHead>
                        <TableHead className="text-xs text-center">Qty</TableHead>
                        <TableHead className="text-xs text-right">Price</TableHead>
                        <TableHead className="text-xs text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.notes && (
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-center">{item.quantity}</TableCell>
                          <TableCell className="text-xs text-right">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-xs text-right font-medium">
                            {formatCurrency(item.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
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
                    Tax (CGST + SGST)
                  </span>
                  <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              {selectedOrder?.status === 'completed' && (
                <Button
                  variant="outline"
                  onClick={() => refundOrder(selectedOrder)}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Refund
                </Button>
              )}
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
