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
  Star,
  Building2,
  StickyNote,
  Calendar,
  Package,
  ShoppingCart,
  Tag,
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
  category: string;
  rating: number;
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
  category: string;
  rating: number;
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
  category: 'raw-materials',
  rating: 0,
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
    category: 'raw-materials',
    rating: 4,
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
    category: 'raw-materials',
    rating: 5,
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
    category: 'raw-materials',
    rating: 4,
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
    category: 'raw-materials',
    rating: 3,
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
    category: 'packaging',
    rating: 2,
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
    category: 'finished-goods',
    rating: 4,
    createdAt: '2024-04-22T08:30:00.000Z',
  },
];

const PAGE_SIZE = 10;

// ─── Helper: Category info ───

const SUPPLIER_CATEGORIES: Record<string, { label: string; color: string }> = {
  'raw-materials': { label: 'Raw Materials', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  'packaging': { label: 'Packaging', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  'finished-goods': { label: 'Finished Goods', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  'services': { label: 'Services', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
};

// ─── Star Rating Component ───

function StarRating({ rating, onChange, size = 'sm' }: { rating: number; onChange?: (r: number) => void; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'h-3.5 w-3.5', md: 'h-4.5 w-4.5', lg: 'h-5 w-5' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          onClick={() => onChange?.(star)}
          disabled={!onChange}
        >
          <Star
            className={`${sizeClasses[size]} ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Avatar initials helper ───

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.charAt(0).toUpperCase();
}

function getAvatarGradient(name: string) {
  const gradients = [
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-orange-400 to-amber-500',
    'from-sky-400 to-cyan-500',
    'from-rose-400 to-pink-500',
    'from-lime-400 to-green-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

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

  // Detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);

  // Form state
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState<SupplierFormData>(emptySupplierForm);
  const [saving, setSaving] = useState(false);

  // ─── Fetch Data ───

  const fetchSuppliers = useCallback(async () => {
    if (!storeId) {
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
          setSuppliers(MOCK_SUPPLIERS.map(s => ({ ...s, storeId })));
        }
      } else {
        setSuppliers(MOCK_SUPPLIERS.map(s => ({ ...s, storeId })));
      }
    } catch {
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
      category: supplier.category || 'raw-materials',
      rating: supplier.rating || 0,
      notes: supplier.notes || '',
    });
    setSupplierDialogOpen(true);
  }

  function openSupplierDetail(supplier: Supplier) {
    setDetailSupplier(supplier);
    setDetailDialogOpen(true);
  }

  async function saveSupplier() {
    if (!supplierForm.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }

    // GST validation
    if (supplierForm.gstNumber.trim()) {
      const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstPattern.test(supplierForm.gstNumber.trim())) {
        toast.error('Invalid GST number format (e.g., 22AAAAA0000A1Z5)');
        return;
      }
    }

    setSaving(true);
    try {
      if (editingSupplier) {
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
                  category: supplierForm.category,
                  rating: supplierForm.rating,
                  notes: supplierForm.notes.trim(),
                }
              : s
          )
        );
        toast.success('Supplier updated');
        setSupplierDialogOpen(false);
      } else {
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
          category: supplierForm.category,
          rating: supplierForm.rating,
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
      advance: 'Advance Payment',
      net15: 'Net 15',
      net30: 'Net 30',
      net45: 'Net 45',
      net60: 'Net 60',
    };
    return map[terms] || terms;
  }

  function getCategoryBadge(category: string) {
    const cat = SUPPLIER_CATEGORIES[category];
    if (!cat) return null;
    return (
      <Badge className={`${cat.color} border-0 text-[10px] h-5`}>
        <Tag className="h-2.5 w-2.5 mr-0.5" />
        {cat.label}
      </Badge>
    );
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
                    <TableHead className="text-center hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Rating</TableHead>
                    <TableHead className="text-right hidden lg:table-cell">Total Orders</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSuppliers.map((supplier) => (
                    <TableRow
                      key={supplier.id}
                      className="cursor-pointer hover:scale-[1.005] transition-transform duration-150"
                      onClick={() => openSupplierDetail(supplier)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${getAvatarGradient(supplier.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {getInitials(supplier.name)}
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {supplier.contactPerson && (
                            <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 text-[10px] font-bold flex-shrink-0">
                              {getInitials(supplier.contactPerson)}
                            </div>
                          )}
                          <span className="text-muted-foreground">{supplier.contactPerson || '—'}</span>
                        </div>
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
                      <TableCell className="text-center hidden md:table-cell">
                        {getCategoryBadge(supplier.category)}
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        <StarRating rating={supplier.rating} />
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell font-medium">
                        {supplier.totalOrders}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openSupplierDetail(supplier)}
                            title="View Details"
                          >
                            <Building2 className="h-4 w-4" />
                          </Button>
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
            <Card
              key={supplier.id}
              className="p-4 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => openSupplierDetail(supplier)}
            >
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getAvatarGradient(supplier.name)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {getInitials(supplier.name)}
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
                  <div className="flex items-center gap-2 mt-0.5">
                    {supplier.contactPerson && (
                      <span className="text-xs text-muted-foreground">{supplier.contactPerson}</span>
                    )}
                    {getCategoryBadge(supplier.category)}
                  </div>
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
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={supplier.rating} />
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ═══ SUPPLIER DETAIL DIALOG ══════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════ */}

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {detailSupplier && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(detailSupplier.name)} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
                    {getInitials(detailSupplier.name)}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{detailSupplier.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                      {detailSupplier.status === 'active' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0 text-xs">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                      {getCategoryBadge(detailSupplier.category)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Company Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {detailSupplier.contactPerson && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 text-[10px] font-bold flex-shrink-0">
                          {getInitials(detailSupplier.contactPerson)}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Contact Person</p>
                          <p className="font-medium">{detailSupplier.contactPerson}</p>
                        </div>
                      </div>
                    )}
                    {detailSupplier.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium">{detailSupplier.phone}</p>
                        </div>
                      </div>
                    )}
                    {detailSupplier.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">{detailSupplier.email}</p>
                        </div>
                      </div>
                    )}
                    {detailSupplier.gstNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">GST Number</p>
                          <p className="font-medium font-mono text-xs">{detailSupplier.gstNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                {detailSupplier.address && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</h4>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p>{detailSupplier.address}</p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Payment Terms */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Terms</h4>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="font-medium">
                      {getPaymentTermsLabel(detailSupplier.paymentTerms)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Order Stats */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Statistics</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <ShoppingCart className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
                      <p className="text-lg font-bold">{detailSupplier.totalOrders}</p>
                      <p className="text-[10px] text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <Package className="h-4 w-4 mx-auto text-sky-600 mb-1" />
                      <p className="text-lg font-bold">{detailSupplier.productsSupplied}</p>
                      <p className="text-[10px] text-muted-foreground">Products</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <IndianRupee className="h-4 w-4 mx-auto text-red-600 mb-1" />
                      <p className="text-lg font-bold text-red-600">{formatCurrency(detailSupplier.balance)}</p>
                      <p className="text-[10px] text-muted-foreground">Balance Due</p>
                    </div>
                  </div>
                  {detailSupplier.lastOrderDate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Last order: {formatDate(detailSupplier.lastOrderDate)}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Rating */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating</h4>
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={detailSupplier.rating}
                      onChange={(newRating) => {
                        setDetailSupplier({ ...detailSupplier, rating: newRating });
                        setSuppliers(prev =>
                          prev.map(s =>
                            s.id === detailSupplier.id ? { ...s, rating: newRating } : s
                          )
                        );
                        toast.success(`Rating updated to ${newRating} star${newRating > 1 ? 's' : ''}`);
                      }}
                      size="lg"
                    />
                    <span className="text-sm text-muted-foreground">
                      ({detailSupplier.rating}/5)
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Notes */}
                {detailSupplier.notes && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</h4>
                    <div className="flex items-start gap-2 text-sm">
                      <StickyNote className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{detailSupplier.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    setTimeout(() => openEditSupplier(detailSupplier), 200);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Supplier
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    setSupplierToDelete(detailSupplier);
                    setTimeout(() => setDeleteDialogOpen(true), 200);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
                <Label htmlFor="supplier-gst">
                  GST Number
                  {supplierForm.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(supplierForm.gstNumber.trim()) && (
                    <span className="text-amber-600 text-xs ml-1">(Invalid format)</span>
                  )}
                </Label>
                <Input
                  id="supplier-gst"
                  placeholder="22AAAAA0000A1Z5"
                  value={supplierForm.gstNumber}
                  onChange={(e) => setSupplierForm((f) => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
                  className={supplierForm.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(supplierForm.gstNumber.trim()) ? 'border-amber-400 focus-visible:ring-amber-400' : ''}
                />
                <p className="text-[10px] text-muted-foreground">Format: 2 digits + 5 letters + 4 digits + 1 letter + 1 char + Z + 1 char</p>
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
                    <SelectItem value="advance">Advance Payment</SelectItem>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="net15">Net 15</SelectItem>
                    <SelectItem value="net30">Net 30</SelectItem>
                    <SelectItem value="net45">Net 45</SelectItem>
                    <SelectItem value="net60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category + Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier-category">Category / Type</Label>
                <Select
                  value={supplierForm.category}
                  onValueChange={(v) => setSupplierForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger id="supplier-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw-materials">Raw Materials</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="finished-goods">Finished Goods</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-2 pt-1">
                  <StarRating
                    rating={supplierForm.rating}
                    onChange={(r) => setSupplierForm((f) => ({ ...f, rating: r }))}
                    size="lg"
                  />
                  <span className="text-sm text-muted-foreground">
                    {supplierForm.rating > 0 ? `${supplierForm.rating}/5` : 'Not rated'}
                  </span>
                </div>
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
