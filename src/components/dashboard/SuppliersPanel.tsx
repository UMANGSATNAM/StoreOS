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
  ClipboardList,
  Eye,
  Send,
  ArrowRight,
  Minus,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

type POStatus = 'Draft' | 'Sent' | 'Received' | 'Cancelled';

interface POItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: POItem[];
  notes: string;
  status: POStatus;
  date: string;
  createdAt: string;
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

// ─── Mock Suppliers ───

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1', storeId: '', name: 'Fresh Farm Organics', contactPerson: 'Ramesh Patel',
    phone: '+91 98765 43210', email: 'ramesh@freshfarm.in',
    address: 'Plot 45, Agricultural Market, Nashik, Maharashtra', gstNumber: '27AAAAF1234A1Z5',
    balance: 45000, paymentTerms: 'net30', status: 'active', productsSupplied: 12,
    lastOrderDate: '2025-03-02T10:30:00.000Z', totalOrders: 48,
    notes: 'Primary vegetable supplier. Delivers on Mon/Thu.', category: 'raw-materials', rating: 4,
    createdAt: '2024-06-15T08:00:00.000Z',
  },
  {
    id: 'sup-2', storeId: '', name: 'Spice Route Traders', contactPerson: 'Anitha Sharma',
    phone: '+91 87654 32109', email: 'anitha@spiceroute.in',
    address: '23, Wholesale Market, Indore, Madhya Pradesh', gstNumber: '23BBBBS5678B2Z3',
    balance: 28000, paymentTerms: 'net15', status: 'active', productsSupplied: 8,
    lastOrderDate: '2025-02-28T14:00:00.000Z', totalOrders: 35,
    notes: 'Bulk spice supplier. Good quality turmeric and cumin.', category: 'raw-materials', rating: 5,
    createdAt: '2024-07-20T09:00:00.000Z',
  },
  {
    id: 'sup-3', storeId: '', name: 'Dairy Delight Pvt Ltd', contactPerson: 'Vikram Singh',
    phone: '+91 76543 21098', email: 'vikram@dairydelight.in',
    address: 'Dairy Farm Road, Anand, Gujarat', gstNumber: '24CCCCD9012C3Z1',
    balance: 15000, paymentTerms: 'cod', status: 'active', productsSupplied: 6,
    lastOrderDate: '2025-03-03T06:00:00.000Z', totalOrders: 92,
    notes: 'Daily dairy delivery. Fresh paneer and cream.', category: 'raw-materials', rating: 4,
    createdAt: '2024-05-10T07:30:00.000Z',
  },
  {
    id: 'sup-4', storeId: '', name: 'Grain Masters', contactPerson: 'Suresh Kumar',
    phone: '+91 65432 10987', email: 'suresh@grainmasters.in',
    address: '56, Grain Market, Karnal, Haryana', gstNumber: '06EEEEG3456D4Z9',
    balance: 62000, paymentTerms: 'net45', status: 'active', productsSupplied: 5,
    lastOrderDate: '2025-02-20T11:00:00.000Z', totalOrders: 22,
    notes: 'Rice and wheat flour supplier. 50kg bags only.', category: 'raw-materials', rating: 3,
    createdAt: '2024-08-05T10:00:00.000Z',
  },
  {
    id: 'sup-5', storeId: '', name: 'Packaging Solutions', contactPerson: 'Deepak Joshi',
    phone: '+91 54321 09876', email: 'deepak@packsolutions.in',
    address: 'Industrial Area, Phase 2, Chandigarh', gstNumber: '04FFFFF7890E5Z7',
    balance: 8500, paymentTerms: 'net30', status: 'inactive', productsSupplied: 3,
    lastOrderDate: '2025-01-15T09:00:00.000Z', totalOrders: 14,
    notes: 'Packaging materials. Currently on hold due to quality issues.', category: 'packaging', rating: 2,
    createdAt: '2024-09-12T12:00:00.000Z',
  },
  {
    id: 'sup-6', storeId: '', name: 'Beverage World', contactPerson: 'Neha Gupta',
    phone: '+91 43210 98765', email: 'neha@beverageworld.in',
    address: '28, FMCG Distribution Hub, Noida, UP', gstNumber: '09GGGGG1234F6Z5',
    balance: 33500, paymentTerms: 'net15', status: 'active', productsSupplied: 10,
    lastOrderDate: '2025-03-01T16:00:00.000Z', totalOrders: 67,
    notes: 'Cold drinks, juices, and water bottles.', category: 'finished-goods', rating: 4,
    createdAt: '2024-04-22T08:30:00.000Z',
  },
];

// ─── Mock Purchase Orders ───

const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1', poNumber: 'PO-001', supplierId: 'sup-1', supplierName: 'Fresh Farm Organics',
    items: [
      { id: 'item-1', productName: 'Fresh Vegetables (Mixed)', quantity: 50, unitPrice: 40 },
      { id: 'item-2', productName: 'Onions (25kg bag)', quantity: 4, unitPrice: 800 },
      { id: 'item-3', productName: 'Tomatoes (10kg)', quantity: 5, unitPrice: 350 },
    ],
    notes: 'Weekly vegetable order. Deliver before 8 AM.',
    status: 'Received', date: '2025-03-03', createdAt: '2025-03-02T14:00:00.000Z',
  },
  {
    id: 'po-2', poNumber: 'PO-002', supplierId: 'sup-2', supplierName: 'Spice Route Traders',
    items: [
      { id: 'item-4', productName: 'Turmeric Powder (1kg)', quantity: 10, unitPrice: 280 },
      { id: 'item-5', productName: 'Cumin Seeds (1kg)', quantity: 5, unitPrice: 420 },
      { id: 'item-6', productName: 'Red Chilli Powder (1kg)', quantity: 8, unitPrice: 350 },
    ],
    notes: 'Bulk spice order for month end.',
    status: 'Sent', date: '2025-03-04', createdAt: '2025-03-03T10:30:00.000Z',
  },
  {
    id: 'po-3', poNumber: 'PO-003', supplierId: 'sup-3', supplierName: 'Dairy Delight Pvt Ltd',
    items: [
      { id: 'item-7', productName: 'Fresh Paneer (1kg)', quantity: 15, unitPrice: 320 },
      { id: 'item-8', productName: 'Cream (500ml)', quantity: 10, unitPrice: 85 },
    ],
    notes: 'Daily dairy requirement for weekend rush.',
    status: 'Draft', date: '2025-03-05', createdAt: '2025-03-04T16:00:00.000Z',
  },
  {
    id: 'po-4', poNumber: 'PO-004', supplierId: 'sup-4', supplierName: 'Grain Masters',
    items: [
      { id: 'item-9', productName: 'Basmati Rice (25kg)', quantity: 6, unitPrice: 1800 },
      { id: 'item-10', productName: 'Wheat Flour (50kg)', quantity: 3, unitPrice: 2200 },
    ],
    notes: 'Monthly grain restock.',
    status: 'Sent', date: '2025-03-02', createdAt: '2025-03-01T09:00:00.000Z',
  },
  {
    id: 'po-5', poNumber: 'PO-005', supplierId: 'sup-6', supplierName: 'Beverage World',
    items: [
      { id: 'item-11', productName: 'Coca Cola (Case of 24)', quantity: 10, unitPrice: 480 },
      { id: 'item-12', productName: 'Mineral Water (Case of 12)', quantity: 20, unitPrice: 180 },
      { id: 'item-13', productName: 'Mango Juice (1L)', quantity: 15, unitPrice: 95 },
    ],
    notes: 'Beverage stock for summer season.',
    status: 'Received', date: '2025-02-28', createdAt: '2025-02-27T11:00:00.000Z',
  },
  {
    id: 'po-6', poNumber: 'PO-006', supplierId: 'sup-5', supplierName: 'Packaging Solutions',
    items: [
      { id: 'item-14', productName: 'Takeaway Containers (500pc)', quantity: 2, unitPrice: 1200 },
      { id: 'item-15', productName: 'Paper Bags (1000pc)', quantity: 1, unitPrice: 800 },
    ],
    notes: 'Cancelled due to quality issues with last batch.',
    status: 'Cancelled', date: '2025-02-25', createdAt: '2025-02-24T08:30:00.000Z',
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

// ─── PO Status config ───

const PO_STATUS_CONFIG: Record<POStatus, { color: string; icon: React.ElementType }> = {
  Draft: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: FileText },
  Sent: { color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Send },
  Received: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  Cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
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

  // Tab state
  const [activeTab, setActiveTab] = useState('suppliers');

  // Data state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Purchase Order state
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [poDialogOpen, setPoDialogOpen] = useState(false);
  const [poDetailOpen, setPoDetailOpen] = useState(false);
  const [detailPO, setDetailPO] = useState<PurchaseOrder | null>(null);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poItems, setPoItems] = useState<POItem[]>([{ id: `item-${Date.now()}`, productName: '', quantity: 1, unitPrice: 0 }]);
  const [poNotes, setPoNotes] = useState('');

  // Search & filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [poStatusFilter, setPoStatusFilter] = useState<string>('all');

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

  // ─── Filtered POs ───
  const filteredPOs = useMemo(() => {
    let result = [...purchaseOrders];
    if (poStatusFilter !== 'all') {
      result = result.filter(po => po.status === poStatusFilter);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [purchaseOrders, poStatusFilter]);

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

  // PO stats
  const totalPOs = purchaseOrders.length;
  const draftPOs = purchaseOrders.filter(po => po.status === 'Draft').length;
  const sentPOs = purchaseOrders.filter(po => po.status === 'Sent').length;
  const receivedPOs = purchaseOrders.filter(po => po.status === 'Received').length;
  const poTotalValue = purchaseOrders.filter(po => po.status !== 'Cancelled').reduce((sum, po) => {
    return sum + po.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  }, 0);

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

  // ─── Purchase Order CRUD ───

  function openCreatePO() {
    setPoSupplierId('');
    setPoItems([{ id: `item-${Date.now()}`, productName: '', quantity: 1, unitPrice: 0 }]);
    setPoNotes('');
    setPoDialogOpen(true);
  }

  function addPOItem() {
    setPoItems(prev => [...prev, { id: `item-${Date.now()}`, productName: '', quantity: 1, unitPrice: 0 }]);
  }

  function removePOItem(itemId: string) {
    if (poItems.length <= 1) return;
    setPoItems(prev => prev.filter(item => item.id !== itemId));
  }

  function updatePOItem(itemId: string, field: keyof POItem, value: string | number) {
    setPoItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  }

  function getPoTotal(): number {
    return poItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }

  function savePO(status: 'Draft' | 'Sent') {
    if (!poSupplierId) {
      toast.error('Please select a supplier');
      return;
    }

    const validItems = poItems.filter(item => item.productName.trim() && item.quantity > 0 && item.unitPrice > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid item');
      return;
    }

    const supplier = suppliers.find(s => s.id === poSupplierId);
    const poNum = `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      supplierId: poSupplierId,
      supplierName: supplier?.name || 'Unknown',
      items: validItems,
      notes: poNotes.trim(),
      status,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    setPoDialogOpen(false);
    toast.success(`Purchase order ${poNum} created as ${status}`);
  }

  function markPOReceived(poId: string) {
    setPurchaseOrders(prev => prev.map(po =>
      po.id === poId ? { ...po, status: 'Received' as POStatus } : po
    ));
    toast.success('Purchase order marked as received');
  }

  function openPODetail(po: PurchaseOrder) {
    setDetailPO(po);
    setPoDetailOpen(true);
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

  function getPOStatusBadge(status: POStatus) {
    const config = PO_STATUS_CONFIG[status];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border-0 text-xs gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
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
                <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Open POs</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{draftPOs + sentPOs}</p>
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
                <p className="text-xs text-gray-500 dark:text-gray-400">PO Value</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(poTotalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList className="grid w-full sm:w-auto grid-cols-2">
            <TabsTrigger value="suppliers" className="gap-2">
              <Truck className="h-4 w-4" />
              Suppliers
              <Badge variant="secondary" className="ml-1 h-5 text-[10px]">{filteredSuppliers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="purchase-orders" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Purchase Orders
              <Badge variant="secondary" className="ml-1 h-5 text-[10px]">{totalPOs}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {activeTab === 'suppliers' ? (
              <>
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-56"
                  />
                </div>
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
                <Button onClick={openAddSupplier} size="sm" className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Supplier
                </Button>
              </>
            ) : (
              <>
                <Select value={poStatusFilter} onValueChange={setPoStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={openCreatePO} size="sm" className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Create PO
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ═══ SUPPLIERS TAB ═══ */}
        <TabsContent value="suppliers" className="space-y-4">
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
                  <Button onClick={openAddSupplier} size="sm" className="mt-4 bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
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
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openSupplierDetail(supplier)} title="View Details">
                                <Building2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditSupplier(supplier)} title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setSupplierToDelete(supplier); setDeleteDialogOpen(true); }} title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredSuppliers.length)} of {filteredSuppliers.length}
                      </p>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                          <ChevronLeft className="h-4 h-4" />
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button key={page} variant={page === currentPage ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setCurrentPage(page)}>
                            {page}
                          </Button>
                        ))}
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
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
                <Button onClick={openAddSupplier} size="sm" className="mt-4 bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-1" />Add Supplier
                </Button>
              </div>
            ) : (
              paginatedSuppliers.map((supplier) => (
                <Card key={supplier.id} className="p-4 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => openSupplierDetail(supplier)}>
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getAvatarGradient(supplier.name)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {getInitials(supplier.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{supplier.name}</p>
                        {supplier.status === 'active' ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs ml-2">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0 text-xs ml-2">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {supplier.contactPerson && <span className="text-xs text-muted-foreground">{supplier.contactPerson}</span>}
                        {getCategoryBadge(supplier.category)}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span>{supplier.productsSupplied} products</span>
                        <span>•</span>
                        <span>{supplier.totalOrders} orders</span>
                        {supplier.balance > 0 && (<><span>•</span><span className="font-medium text-red-600 dark:text-red-400">Due: {formatCurrency(supplier.balance)}</span></>)}
                      </div>
                      <div className="flex items-center gap-2 mt-1"><StarRating rating={supplier.rating} /></div>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" className="h-8" onClick={() => openEditSupplier(supplier)}><Edit className="h-3 w-3 mr-1" />Edit</Button>
                    <Button variant="outline" size="sm" className="h-8 text-destructive hover:text-destructive" onClick={() => { setSupplierToDelete(supplier); setDeleteDialogOpen(true); }}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ═══ PURCHASE ORDERS TAB ═══ */}
        <TabsContent value="purchase-orders" className="space-y-4">
          {/* PO Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <FileText className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Draft</p>
                <p className="font-bold text-sm">{draftPOs}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20">
              <Send className="w-4 h-4 text-sky-500" />
              <div>
                <p className="text-xs text-sky-600 dark:text-sky-400">Sent</p>
                <p className="font-bold text-sm">{sentPOs}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Received</p>
                <p className="font-bold text-sm">{receivedPOs}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
              <IndianRupee className="w-4 h-4 text-rose-500" />
              <div>
                <p className="text-xs text-rose-600 dark:text-rose-400">Total Value</p>
                <p className="font-bold text-sm">{formatCurrency(poTotalValue)}</p>
              </div>
            </div>
          </div>

          {/* Desktop PO Table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              {filteredPOs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <ClipboardList className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">No purchase orders found</p>
                  <p className="text-sm">Create your first purchase order</p>
                  <Button onClick={openCreatePO} size="sm" className="mt-4 bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-1" />Create PO
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-center">Items</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPOs.map((po) => {
                      const total = po.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
                      return (
                        <TableRow key={po.id} className="cursor-pointer hover:scale-[1.005] transition-transform duration-150" onClick={() => openPODetail(po)}>
                          <TableCell className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">{po.poNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${getAvatarGradient(po.supplierName)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                {getInitials(po.supplierName)}
                              </div>
                              <span className="font-medium">{po.supplierName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">{po.items.length} items</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(total)}</TableCell>
                          <TableCell className="text-center">{getPOStatusBadge(po.status)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(po.date)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPODetail(po)} title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {po.status === 'Sent' && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700" onClick={() => markPOReceived(po.id)} title="Mark Received">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Mobile PO Cards */}
          <div className="md:hidden space-y-3">
            {filteredPOs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ClipboardList className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">No purchase orders found</p>
                <Button onClick={openCreatePO} size="sm" className="mt-4 bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-1" />Create PO
                </Button>
              </div>
            ) : (
              filteredPOs.map((po) => {
                const total = po.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
                return (
                  <Card key={po.id} className="p-4 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => openPODetail(po)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{po.poNumber}</span>
                      {getPOStatusBadge(po.status)}
                    </div>
                    <p className="font-medium text-sm">{po.supplierName}</p>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-muted-foreground">{po.items.length} items · {formatDate(po.date)}</span>
                      <span className="font-semibold">{formatCurrency(total)}</span>
                    </div>
                    {po.status === 'Sent' && (
                      <Button variant="outline" size="sm" className="mt-2 w-full h-8 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700" onClick={(e) => { e.stopPropagation(); markPOReceived(po.id); }}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />Mark Received
                      </Button>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══ SUPPLIER DETAIL DIALOG ═══ */}

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
                          <CheckCircle2 className="w-3 h-3 mr-1" />Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0 text-xs">
                          <XCircle className="w-3 h-3 mr-1" />Inactive
                        </Badge>
                      )}
                      {getCategoryBadge(detailSupplier.category)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{detailSupplier.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{detailSupplier.email || '—'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{detailSupplier.address || '—'}</span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Balance Due</p>
                    <p className={`font-bold ${detailSupplier.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatCurrency(detailSupplier.balance)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Payment Terms</p>
                    <p className="font-semibold text-sm">{getPaymentTermsLabel(detailSupplier.paymentTerms)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Products Supplied</p>
                    <p className="font-bold">{detailSupplier.productsSupplied}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                    <p className="font-bold">{detailSupplier.totalOrders}</p>
                  </div>
                </div>

                {detailSupplier.gstNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">GSTIN:</span>
                    <span className="font-mono">{detailSupplier.gstNumber}</span>
                  </div>
                )}

                {detailSupplier.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <StarRating rating={detailSupplier.rating} size="md" />
                  </div>
                )}

                {detailSupplier.notes && (
                  <div className="flex items-start gap-2 text-sm">
                    <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{detailSupplier.notes}</span>
                  </div>
                )}

                {detailSupplier.lastOrderDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Last order: {formatDate(detailSupplier.lastOrderDate)}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => openEditSupplier(detailSupplier)}>
                  <Edit className="h-4 w-4 mr-1" />Edit
                </Button>
                <Button className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700 text-white" onClick={() => setDetailDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ SUPPLIER ADD/EDIT DIALOG ═══ */}

      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
            <DialogDescription>
              {editingSupplier ? 'Update supplier information' : 'Add a new supplier to your network'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier Name *</Label>
                <Input
                  placeholder="e.g. Fresh Farm Organics"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  placeholder="e.g. Ramesh Patel"
                  value={supplierForm.contactPerson}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  placeholder="supplier@example.com"
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="Full address"
                value={supplierForm.address}
                onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input
                  placeholder="22AAAAA0000A1Z5"
                  value={supplierForm.gstNumber}
                  onChange={(e) => setSupplierForm({ ...supplierForm, gstNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Select value={supplierForm.paymentTerms} onValueChange={(v) => setSupplierForm({ ...supplierForm, paymentTerms: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="advance">Advance Payment</SelectItem>
                    <SelectItem value="net15">Net 15</SelectItem>
                    <SelectItem value="net30">Net 30</SelectItem>
                    <SelectItem value="net45">Net 45</SelectItem>
                    <SelectItem value="net60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={supplierForm.category} onValueChange={(v) => setSupplierForm({ ...supplierForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw-materials">Raw Materials</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="finished-goods">Finished Goods</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="pt-2">
                  <StarRating rating={supplierForm.rating} onChange={(r) => setSupplierForm({ ...supplierForm, rating: r })} size="md" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes about this supplier..."
                value={supplierForm.notes}
                onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierDialogOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700 text-white" onClick={saveSupplier} disabled={saving}>
              {saving ? 'Saving...' : editingSupplier ? 'Update' : 'Add'} Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE SUPPLIER DIALOG ═══ */}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {supplierToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={deleteSupplier}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ CREATE PO DIALOG ═══ */}

      <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              Create Purchase Order
            </DialogTitle>
            <DialogDescription>Create a new purchase order for your suppliers</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={poSupplierId} onValueChange={setPoSupplierId}>
                <SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.status === 'active').map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <span>{s.name}</span>
                        <span className="text-xs text-muted-foreground">({s.contactPerson})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button variant="outline" size="sm" onClick={addPOItem} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {poItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5">{idx + 1}.</span>
                    <Input
                      placeholder="Product name"
                      value={item.productName}
                      onChange={(e) => updatePOItem(item.id, 'productName', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity || ''}
                      onChange={(e) => updatePOItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Unit ₹"
                      value={item.unitPrice || ''}
                      onChange={(e) => updatePOItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removePOItem(item.id)}
                      disabled={poItems.length <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium text-sm">Total</span>
                <span className="font-bold text-lg">{formatCurrency(getPoTotal())}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add notes for this PO..."
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPoDialogOpen(false)}>Cancel</Button>
            <Button variant="outline" onClick={() => savePO('Draft')} className="gap-1">
              <FileText className="h-4 w-4" />Save as Draft
            </Button>
            <Button className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700 text-white gap-1" onClick={() => savePO('Sent')}>
              <Send className="h-4 w-4" />Mark as Sent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ PO DETAIL DIALOG ═══ */}

      <Dialog open={poDetailOpen} onOpenChange={setPoDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {detailPO && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="font-mono text-emerald-700 dark:text-emerald-400">{detailPO.poNumber}</DialogTitle>
                    <DialogDescription>Purchase Order Details</DialogDescription>
                  </div>
                  {getPOStatusBadge(detailPO.status)}
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Supplier</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`h-6 w-6 rounded bg-gradient-to-br ${getAvatarGradient(detailPO.supplierName)} flex items-center justify-center text-white text-[9px] font-bold`}>
                        {getInitials(detailPO.supplierName)}
                      </div>
                      <p className="font-medium text-sm">{detailPO.supplierName}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium text-sm">{formatDate(detailPO.date)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm mb-2">Items</h4>
                  <div className="space-y-2">
                    {detailPO.items.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">{idx + 1}.</span>
                          <span>{item.productName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                          <span className="font-medium w-24 text-right">{formatCurrency(item.quantity * item.unitPrice)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(detailPO.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}
                    </span>
                  </div>
                </div>

                {detailPO.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Notes</h4>
                      <p className="text-sm text-muted-foreground">{detailPO.notes}</p>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="gap-2">
                {detailPO.status === 'Sent' && (
                  <Button className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700 text-white gap-1" onClick={() => { markPOReceived(detailPO.id); setPoDetailOpen(false); }}>
                    <CheckCircle2 className="h-4 w-4" />Mark Received
                  </Button>
                )}
                <Button variant="outline" onClick={() => setPoDetailOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
