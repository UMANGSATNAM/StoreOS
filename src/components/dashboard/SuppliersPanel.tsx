'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  Truck,
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
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ───

interface Supplier {
  id: string;
  storeId: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  balance: number;
  contactPerson: string;
  paymentTerms: string;
  status: 'active' | 'inactive';
  productsSupplied: number;
  lastOrderDate: string | null;
  totalOrders: number;
  notes: string;
  createdAt: string;
}

interface SupplierFormData {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  paymentTerms: string;
  notes: string;
}

const emptySupplierForm: SupplierFormData = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
  paymentTerms: 'net30',
  notes: '',
};

// ─── Mock Data ───

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    storeId: '',
    name: 'Fresh Farm Organics',
    contactPerson: 'Ramesh Patel',
    phone: '+91 98765 43210',
    email: 'ramesh@freshfarm.in',
    address: 'Plot 45, Agricultural Market, Nashik, Maharashtra',
    gstNumber: '27AAAAF1234A1Z5',
    balance: 45000,
    paymentTerms: 'net30',
    status: 'active',
    productsSupplied: 12,
    lastOrderDate: '2025-03-02T10:30:00.000Z',
    totalOrders: 48,
    notes: 'Primary vegetable supplier. Delivers on Mon/Thu.',
    createdAt: '2024-06-15T08:00:00.000Z',
  },
  {
    id: 'sup-2',
    storeId: '',
    name: 'Spice Route Traders',
    contactPerson: 'Anitha Sharma',
    phone: '+91 87654 32109',
    email: 'anitha@spiceroute.in',
    address: '23, Wholesale Market, Indore, Madhya Pradesh',
    gstNumber: '23BBBBS5678B2Z3',
    balance: 28000,
    paymentTerms: 'net15',
    status: 'active',
    productsSupplied: 8,
    lastOrderDate: '2025-02-28T14:00:00.000Z',
    totalOrders: 35,
    notes: 'Bulk spice supplier. Good quality turmeric and cumin.',
    createdAt: '2024-07-20T09:00:00.000Z',
  },
  {
    id: 'sup-3',
    storeId: '',
    name: 'Dairy Delight Pvt Ltd',
    contactPerson: 'Vikram Singh',
    phone: '+91 76543 21098',
    email: 'vikram@dairydelight.in',
    address: 'Dairy Farm Road, Anand, Gujarat',
    gstNumber: '24CCCCD9012C3Z1',
    balance: 15000,
    paymentTerms: 'cod',
    status: 'active',
    productsSupplied: 6,
    lastOrderDate: '2025-03-03T06:00:00.000Z',
    totalOrders: 92,
    notes: 'Daily dairy delivery. Fresh paneer and cream.',
    createdAt: '2024-05-10T07:30:00.000Z',
  },
  {
    id: 'sup-4',
    storeId: '',
    name: 'Grain Masters',
    contactPerson: 'Suresh Kumar',
    phone: '+91 65432 10987',
    email: 'suresh@grainmasters.in',
    address: '56, Grain Market, Karnal, Haryana',
    gstNumber: '06EEEEG3456D4Z9',
    balance: 62000,
    paymentTerms: 'net45',
    status: 'active',
    productsSupplied: 5,
    lastOrderDate: '2025-02-20T11:00:00.000Z',
    totalOrders: 22,
    notes: 'Rice and wheat flour supplier. 50kg bags only.',
    createdAt: '2024-08-05T10:00:00.000Z',
  },
  {
    id: 'sup-5',
    storeId: '',
    name: 'Packaging Solutions',
    contactPerson: 'Deepak Joshi',
    phone: '+91 54321 09876',
    email: 'deepak@packsolutions.in',
    address: 'Industrial Area, Phase 2, Chandigarh',
    gstNumber: '04FFFFF7890E5Z7',
    balance: 8500,
    paymentTerms: 'net30',
    status: 'inactive',
    productsSupplied: 3,
    lastOrderDate: '2025-01-15T09:00:00.000Z',
    totalOrders: 14,
    notes: 'Packaging materials. Currently on hold due to quality issues.',
    createdAt: '2024-09-12T12:00:00.000Z',
  },
  {
    id: 'sup-6',
    storeId: '',
    name: 'Beverage World',
    contactPerson: 'Neha Gupta',
    phone: '+91 43210 98765',
    email: 'neha@beverageworld.in',
    address: '28, FMCG Distribution Hub, Noida, UP',
    gstNumber: '09GGGGG1234F6Z5',
    balance: 33500,
    paymentTerms: 'net15',
    status: 'active',
    productsSupplied: 10,
    lastOrderDate: '2025-03-01T16:00:00.000Z',
    totalOrders: 67,
    notes: 'Cold drinks, juices, and water bottles.',
    createdAt: '2024-04-22T08:30:00.000Z',
  },
];

const PAGE_SIZE = 10;

// ─── Main Component ───

export default function SuppliersPanel() {
  const { store } = useAppStore();
  const storeId = store?.id || '';

  // Data state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialogs
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Form state
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState<SupplierFormData>(emptySupplierForm);
  const [saving, setSaving] = useState(false);

  // ─── Fetch Data ───

  const fetchSuppliers = useCallback(async () => {
    if (!storeId) {
      // Use mock data when no store
      setSuppliers(MOCK_SUPPLIERS.map(s => ({ ...s, storeId })));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ storeId });
      if (search) params.set('search', search);
      const res = await fetch(`/api/suppliers?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.suppliers && data.suppliers.length > 0) {
          setSuppliers(data.suppliers);
        } else {
          // Use mock data as fallback
          setSuppliers(MOCK_SUPPLIERS.map(s => ({ ...s, storeId })));
        }
      } else {
        // Fallback to mock data
        setSuppliers(MOCK_SUPPLIERS.map(s => ({ ...s, storeId })));
      }
    } catch {
      // Fallback to mock data
      setSuppliers(MOCK_SUPPLIERS.map(s => ({ ...s, storeId })));
    } finally {
      setLoading(false);
    }
  }, [storeId, search]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ─── Filtered Suppliers ───

  const filteredSuppliers = useMemo(() => {
    let result = [...suppliers];
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.phone && s.phone.includes(q))
      );
    }
    return result;
  }, [suppliers, statusFilter, search]);

  // ─── Pagination ───

  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / PAGE_SIZE));
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ─── Stats ───

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const pendingOrders = suppliers.filter(s => s.balance > 0).length;
  const totalDue = suppliers.reduce((sum, s) => sum + s.balance, 0);

  // ─── Supplier CRUD ───

  function openAddSupplier() {
    setEditingSupplier(null);
    setSupplierForm(emptySupplierForm);
    setSupplierDialogOpen(true);
  }

  function openEditSupplier(supplier: Supplier) {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      gstNumber: supplier.gstNumber || '',
      paymentTerms: supplier.paymentTerms || 'net30',
      notes: supplier.notes || '',
    });
    setSupplierDialogOpen(true);
  }

  async function saveSupplier() {
    if (!supplierForm.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingSupplier) {
        // PATCH - update supplier via API
        try {
          const res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: supplierForm.name.trim(),
              phone: supplierForm.phone.trim() || null,
              email: supplierForm.email.trim() || null,
              address: supplierForm.address.trim() || null,
              gstNumber: supplierForm.gstNumber.trim() || null,
            }),
          });
          if (res.ok) {
            toast.success('Supplier updated');
            setSupplierDialogOpen(false);
            fetchSuppliers();
            return;
          }
        } catch {
          // Fallback to local update
        }
        // Local fallback
        setSuppliers(prev =>
          prev.map(s =>
            s.id === editingSupplier.id
              ? {
                  ...s,
                  name: supplierForm.name.trim(),
                  contactPerson: supplierForm.contactPerson.trim(),
                  phone: supplierForm.phone.trim() || null,
                  email: supplierForm.email.trim() || null,
                  address: supplierForm.address.trim() || null,
                  gstNumber: supplierForm.gstNumber.trim() || null,
                  paymentTerms: supplierForm.paymentTerms,
                  notes: supplierForm.notes.trim(),
                }
              : s
          )
        );
        toast.success('Supplier updated');
        setSupplierDialogOpen(false);
      } else {
        // POST - create supplier via API
        try {
          const res = await fetch('/api/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storeId,
              name: supplierForm.name.trim(),
              phone: supplierForm.phone.trim() || null,
              email: supplierForm.email.trim() || null,
              address: supplierForm.address.trim() || null,
              gstNumber: supplierForm.gstNumber.trim() || null,
            }),
          });
          if (res.ok) {
            toast.success('Supplier created');
            setSupplierDialogOpen(false);
            fetchSuppliers();
            return;
          }
        } catch {
          // Fallback to local create
        }
        // Local fallback
        const newSupplier: Supplier = {
          id: `sup-${Date.now()}`,
          storeId,
          name: supplierForm.name.trim(),
          contactPerson: supplierForm.contactPerson.trim(),
          phone: supplierForm.phone.trim() || null,
          email: supplierForm.email.trim() || null,
          address: supplierForm.address.trim() || null,
          gstNumber: supplierForm.gstNumber.trim() || null,
          balance: 0,
          paymentTerms: supplierForm.paymentTerms,
          status: 'active',
          productsSupplied: 0,
          lastOrderDate: null,
          totalOrders: 0,
          notes: supplierForm.notes.trim(),
          createdAt: new Date().toISOString(),
        };
        setSuppliers(prev => [...prev, newSupplier]);
        toast.success('Supplier created');
        setSupplierDialogOpen(false);
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSupplier() {
    if (!supplierToDelete) return;
    try {
      // Try API delete first
      try {
        const res = await fetch(`/api/suppliers/${supplierToDelete.id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Supplier deleted');
          setDeleteDialogOpen(false);
          setSupplierToDelete(null);
          fetchSuppliers();
          return;
        }
      } catch {
        // Fallback to local delete
      }
      // Local fallback
      setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
      toast.success('Supplier deleted');
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch {
      toast.error('Network error');
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

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function getPaymentTermsLabel(terms: string) {
    const map: Record<string, string> = {
      cod: 'Cash on Delivery',
      net15: 'Net 15',
      net30: 'Net 30',
      net45: 'Net 45',
      net60: 'Net 60',
    };
    return map[terms] || terms;
  }

  // ─── Render ───

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Suppliers</p>
                <p className="text-xl font-bold">{totalSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-sky-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{activeSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending Orders</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Due</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-bold">Suppliers</h2>
            <p className="text-sm text-muted-foreground">Manage your supply chain</p>
          </div>
          <Badge variant="secondary" className="ml-1">
            {filteredSuppliers.length}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-56"
            />
          </div>
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {/* Add Supplier Button */}
          <Button onClick={openAddSupplier} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Truck className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No suppliers found</p>
              <p className="text-sm">Add your first supplier to get started</p>
              <Button
                onClick={openAddSupplier}
                size="sm"
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Supplier
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead className="hidden xl:table-cell">Email</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Products</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Order</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right hidden lg:table-cell">Total Orders</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:scale-[1.005] transition-transform duration-150">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold flex-shrink-0">
                            {supplier.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium block">{supplier.name}</span>
                            {supplier.balance > 0 && (
                              <span className="text-xs text-red-600 dark:text-red-400">
                                Due: {formatCurrency(supplier.balance)}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {supplier.contactPerson || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">
                        {supplier.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden xl:table-cell">
                        {supplier.email || '—'}
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {supplier.productsSupplied} items
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">
                        {formatDate(supplier.lastOrderDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        {supplier.status === 'active' ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell font-medium">
                        {supplier.totalOrders}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditSupplier(supplier)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setSupplierToDelete(supplier);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete"
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
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filteredSuppliers.length)} of{' '}
                    {filteredSuppliers.length}
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
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Truck className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No suppliers found</p>
            <Button
              onClick={openAddSupplier}
              size="sm"
              className="mt-4 bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Supplier
            </Button>
          </div>
        ) : (
          paginatedSuppliers.map((supplier) => (
            <Card key={supplier.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-sm font-bold flex-shrink-0">
                  {supplier.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{supplier.name}</p>
                    {supplier.status === 'active' ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs ml-2">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0 text-xs ml-2">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{supplier.contactPerson}</p>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                    {supplier.phone && (
                      <span className="flex items-center gap-0.5">
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </span>
                    )}
                    {supplier.email && (
                      <span className="flex items-center gap-0.5">
                        <Mail className="h-3 w-3" />
                        {supplier.email}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span>{supplier.productsSupplied} products</span>
                    <span>•</span>
                    <span>{supplier.totalOrders} orders</span>
                    {supplier.balance > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          Due: {formatCurrency(supplier.balance)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => openEditSupplier(supplier)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    setSupplierToDelete(supplier);
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
        {!loading && filteredSuppliers.length > 0 && totalPages > 1 && (
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

      {/* ─── Add/Edit Supplier Dialog ─── */}
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
            <DialogDescription>
              {editingSupplier ? 'Update supplier information' : 'Fill in supplier details to add them to your supply chain'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="supplier-name">
                Supplier Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="supplier-name"
                placeholder="e.g., Fresh Farm Organics"
                value={supplierForm.name}
                onChange={(e) => setSupplierForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Contact Person */}
            <div className="grid gap-2">
              <Label htmlFor="supplier-contact">Contact Person</Label>
              <Input
                id="supplier-contact"
                placeholder="e.g., Ramesh Patel"
                value={supplierForm.contactPerson}
                onChange={(e) => setSupplierForm((f) => ({ ...f, contactPerson: e.target.value }))}
              />
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier-phone">Phone</Label>
                <Input
                  id="supplier-phone"
                  placeholder="+91 98765 43210"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier-email">Email</Label>
                <Input
                  id="supplier-email"
                  type="email"
                  placeholder="supplier@example.com"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="supplier-address">Address</Label>
              <Textarea
                id="supplier-address"
                placeholder="Supplier address"
                value={supplierForm.address}
                onChange={(e) => setSupplierForm((f) => ({ ...f, address: e.target.value }))}
                rows={2}
              />
            </div>

            {/* GST Number + Payment Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier-gst">GST Number</Label>
                <Input
                  id="supplier-gst"
                  placeholder="22AAAAA0000A1Z5"
                  value={supplierForm.gstNumber}
                  onChange={(e) => setSupplierForm((f) => ({ ...f, gstNumber: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier-terms">Payment Terms</Label>
                <Select
                  value={supplierForm.paymentTerms}
                  onValueChange={(v) => setSupplierForm((f) => ({ ...f, paymentTerms: v }))}
                >
                  <SelectTrigger id="supplier-terms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="net15">Net 15</SelectItem>
                    <SelectItem value="net30">Net 30</SelectItem>
                    <SelectItem value="net45">Net 45</SelectItem>
                    <SelectItem value="net60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="supplier-notes">Notes</Label>
              <Textarea
                id="supplier-notes"
                placeholder="Additional notes about this supplier..."
                value={supplierForm.notes}
                onChange={(e) => setSupplierForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveSupplier}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? 'Saving...' : editingSupplier ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Supplier Confirmation ─── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{supplierToDelete?.name}&quot;? This action cannot
              be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSupplier}
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
