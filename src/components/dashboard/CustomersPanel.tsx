'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
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
  ArrowLeft,
  Package,
  ShoppingBag,
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

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

const PAGE_SIZE = 10;

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
  const { store } = useAppStore();
  const storeId = store?.id || '';

  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialogs
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Detail view
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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
        // PATCH - use the API for update
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
        fetchCustomers();
      } else {
        toast.error('Failed to delete customer');
      }
    } catch {
      toast.error('Network error');
    }
  }

  // ─── Customer Detail ───

  async function openCustomerDetail(customer: Customer) {
    setSelectedCustomer(customer);
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

  // ─── Customer Detail View ───

  if (selectedCustomer) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedCustomer(null)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Customers
        </Button>

        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold flex-shrink-0">
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">{selectedCustomer.name}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
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
                  {selectedCustomer.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedCustomer.address}
                    </span>
                  )}
                  {selectedCustomer.gstNumber && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      GST: {selectedCustomer.gstNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Customer since {formatDate(selectedCustomer.createdAt)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  openEditCustomer(selectedCustomer);
                  setSelectedCustomer(null);
                }}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
              <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
              <p className="text-2xl font-bold">{formatCurrency(selectedCustomer.totalSpent)}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 mx-auto text-amber-500 mb-1" />
              <p className="text-2xl font-bold">{selectedCustomer.loyaltyPoints}</p>
              <p className="text-xs text-muted-foreground">Loyalty Points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CreditCard className="h-5 w-5 mx-auto text-red-500 mb-1" />
              <p className="text-2xl font-bold">{formatCurrency(selectedCustomer.creditBalance)}</p>
              <p className="text-xs text-muted-foreground">Credit Balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Loyalty & Credit Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4 text-amber-500" />
                Loyalty Points Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Points</span>
                  <span className="font-semibold">{selectedCustomer.loyaltyPoints} pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Value</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(selectedCustomer.loyaltyPoints * 0.5)}
                  </span>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  1 point = ₹0.50. Redeem points on next purchase.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-red-500" />
                Credit Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Outstanding Credit</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(selectedCustomer.creditBalance)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Credit Limit</span>
                  <span className="font-semibold">{formatCurrency(10000)}</span>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  {selectedCustomer.creditBalance > 0
                    ? 'Customer has outstanding credit balance.'
                    : 'No outstanding credit.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="h-4 w-4" />
              Purchase History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <CustomerTableSkeleton />
            ) : customerOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No purchase history yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              order.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : order.status === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground capitalize">
                          {order.paymentMethod}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Main Customer List View ───

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold">Customers</h2>
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
                      className="cursor-pointer"
                      onClick={() => openCustomerDetail(customer)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
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
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold flex-shrink-0">
                  {customer.name.charAt(0).toUpperCase()}
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
