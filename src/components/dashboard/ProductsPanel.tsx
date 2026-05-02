'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Search,
  Upload,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Settings,
  X,
  Image as ImageIcon,
  Tag,
  MoreHorizontal,
  LayoutGrid,
  List,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

// ─── Types ───

interface Product {
  id: string;
  storeId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  price: number;
  costPrice: number;
  unit: string;
  stock: number;
  lowStockAlert: number;
  image: string | null;
  variants: string | null;
  isActive: boolean;
  category: { id: string; name: string; icon: string | null } | null;
  createdAt: string;
}

interface Category {
  id: string;
  storeId: string;
  name: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  _count: { products: number };
}

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
type SortField = 'name' | 'sku' | 'price' | 'stock' | 'createdAt';
type SortDir = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const UNITS = ['piece', 'kg', 'g', 'liter', 'ml', 'meter', 'box', 'pack'] as const;
const PAGE_SIZE = 10;

// ─── Skeleton Loader ───

function ProductTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ───

function StockBadge({ stock, lowStockAlert }: { stock: number; lowStockAlert: number }) {
  if (stock === 0) {
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Out of Stock</Badge>;
  }
  if (stock <= lowStockAlert) {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Low Stock</Badge>;
  }
  return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">In Stock</Badge>;
}

// ─── Product Form Data ───

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  sku: string;
  barcode: string;
  price: string;
  costPrice: string;
  unit: string;
  stock: string;
  lowStockAlert: string;
  image: string;
  variants: string;
}

const emptyProductForm: ProductFormData = {
  name: '',
  description: '',
  categoryId: '',
  sku: '',
  barcode: '',
  price: '',
  costPrice: '',
  unit: 'piece',
  stock: '',
  lowStockAlert: '5',
  image: '',
  variants: '',
};

// ─── Main Component ───

export default function ProductsPanel() {
  const { store, globalSearch, setGlobalSearch } = useAppStore();
  const storeId = store?.id || '';

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState(globalSearch || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  // Sort
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialogs
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>(emptyProductForm);
  const [saving, setSaving] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Category form
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryColor, setCategoryColor] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // ─── Fetch Data ───

  const fetchProducts = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ storeId });
      if (search) params.set('search', search);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      const res = await fetch(`/api/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [storeId, search, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await fetch(`/api/categories?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      toast.error('Failed to fetch categories');
    }
  }, [storeId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, stockFilter]);

  // Consume global search from Zustand and clear it
  useEffect(() => {
    if (globalSearch) {
      setSearch(globalSearch);
      setGlobalSearch('');
    }
  }, [globalSearch, setGlobalSearch]);

  // ─── Filtered & Sorted Products ───

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Stock filter
    if (stockFilter === 'in_stock') {
      result = result.filter((p) => p.stock > p.lowStockAlert);
    } else if (stockFilter === 'low_stock') {
      result = result.filter((p) => p.stock > 0 && p.stock <= p.lowStockAlert);
    } else if (stockFilter === 'out_of_stock') {
      result = result.filter((p) => p.stock === 0);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'sku':
          aVal = a.sku || '';
          bVal = b.sku || '';
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'stock':
          aVal = a.stock;
          bVal = b.stock;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, stockFilter, sortField, sortDir]);

  // ─── Pagination ───

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ─── Low Stock Products ───

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= p.lowStockAlert),
    [products]
  );
  const outOfStockProducts = useMemo(
    () => products.filter((p) => p.stock === 0),
    [products]
  );

  // ─── Sort Handler ───

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return (
      <ArrowUpDown
        className={`ml-1 h-3 w-3 ${sortDir === 'asc' ? 'rotate-0' : 'rotate-180'} transition-transform`}
      />
    );
  }

  // ─── Product CRUD ───

  function openAddProduct() {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setProductDialogOpen(true);
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      price: String(product.price),
      costPrice: String(product.costPrice),
      unit: product.unit,
      stock: String(product.stock),
      lowStockAlert: String(product.lowStockAlert),
      image: product.image || '',
      variants: product.variants || '',
    });
    setProductDialogOpen(true);
  }

  async function saveProduct() {
    if (!productForm.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!productForm.price || isNaN(Number(productForm.price)) || Number(productForm.price) < 0) {
      toast.error('Valid price is required');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        storeId,
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        categoryId: productForm.categoryId || null,
        sku: productForm.sku.trim() || null,
        barcode: productForm.barcode.trim() || null,
        price: parseFloat(productForm.price),
        costPrice: productForm.costPrice ? parseFloat(productForm.costPrice) : 0,
        unit: productForm.unit,
        stock: productForm.stock ? parseFloat(productForm.stock) : 0,
        lowStockAlert: productForm.lowStockAlert ? parseFloat(productForm.lowStockAlert) : 5,
        image: productForm.image.trim() || null,
        variants: productForm.variants.trim() || null,
      };

      let res: Response;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(editingProduct ? 'Product updated' : 'Product created');
        setProductDialogOpen(false);
        fetchProducts();
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save product');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct() {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        fetchProducts();
        fetchCategories();
      } else {
        toast.error('Failed to delete product');
      }
    } catch {
      toast.error('Network error');
    }
  }

  // ─── Category CRUD ───

  async function saveCategory() {
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSavingCategory(true);
    try {
      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: categoryName.trim(),
            icon: categoryIcon.trim() || null,
            color: categoryColor.trim() || null,
          }),
        });
        if (res.ok) {
          toast.success('Category updated');
          setCategoryName('');
          setCategoryIcon('');
          setCategoryColor('');
          setEditingCategory(null);
          fetchCategories();
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to update category');
        }
      } else {
        const payload: Record<string, unknown> = {
          storeId,
          name: categoryName.trim(),
          icon: categoryIcon.trim() || null,
          color: categoryColor.trim() || null,
        };

        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success('Category created');
          setCategoryName('');
          setCategoryIcon('');
          setCategoryColor('');
          fetchCategories();
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to create category');
        }
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSavingCategory(false);
    }
  }

  function openEditCategory(cat: Category) {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryIcon(cat.icon || '');
    setCategoryColor(cat.color || '');
  }

  async function deleteCategoryFn() {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(`/api/categories/${categoryToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Category deleted');
        setDeleteCategoryDialogOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
        fetchProducts();
      } else {
        toast.error('Failed to delete category');
      }
    } catch {
      toast.error('Network error');
    }
  }

  // ─── CSV Import (Mock) ───

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success(`Imported "${file.name}" — 0 products created (mock)`);
    setCsvDialogOpen(false);
  }

  // ─── Format helpers ───

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
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
                <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Products</p>
                <p className="text-xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">In Stock</p>
                <p className="text-xl font-bold text-emerald-600">{products.filter(p => p.stock > p.lowStockAlert).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock</p>
                <p className="text-xl font-bold text-amber-600">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Out of Stock</p>
                <p className="text-xl font-bold text-red-600">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800 text-base">
              <AlertTriangle className="h-5 w-5" />
              Stock Alerts
              <Badge variant="secondary" className="ml-1">
                {lowStockProducts.length + outOfStockProducts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-40">
              <div className="space-y-2">
                {outOfStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-red-700">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Out of Stock</Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Reorder
                      </Button>
                    </div>
                  </div>
                ))}
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-amber-700">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                        {p.stock} left
                      </Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Reorder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-bold">Products & Inventory</h2>
            <p className="text-sm text-muted-foreground">Manage your product catalog</p>
          </div>
          <Badge variant="secondary" className="ml-1">
            {filteredProducts.length} items
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-56"
            />
          </div>
          <Button onClick={openAddProduct} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCsvDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCategoryDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-1" />
            Categories
          </Button>
        </div>
      </div>

      {/* Filter Row + View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44">
              <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-none h-8 px-3 ${viewMode === 'grid' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className={`rounded-none h-8 px-3 ${viewMode === 'list' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
        </div>
      </div>

      {/* ─── Grid View ─── */}
      {viewMode === 'grid' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Add your first product to get started</p>
              <Button
                onClick={openAddProduct}
                size="sm"
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {paginatedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="group relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openEditProduct(product)}
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-muted flex items-center justify-center relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      )}
                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 pointer-events-none">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditProduct(product);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 pointer-events-auto text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToDelete(product);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {/* Status badge */}
                      <div className="absolute top-2 right-2">
                        <StockBadge stock={product.stock} lowStockAlert={product.lowStockAlert} />
                      </div>
                    </div>
                    {/* Product Info */}
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {product.stock} {product.unit}
                        </span>
                      </div>
                      {product.category && (
                        <Badge variant="outline" className="mt-1.5 text-[10px] h-5">
                          {product.category.icon && <span className="mr-0.5">{product.category.icon}</span>}
                          {product.category.name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination for Grid View */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of{' '}
                  {filteredProducts.length}
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
        </div>
      )}

      {/* ─── List View (Desktop Table) ─── */}
      {viewMode === 'list' && (
      <Card className="hidden md:block">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <ProductTableSkeleton />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Add your first product to get started</p>
              <Button
                onClick={openAddProduct}
                size="sm"
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Image</TableHead>
                    <TableHead>
                      <button
                        className="flex items-center hover:text-foreground transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        Name <SortIcon field="name" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center hover:text-foreground transition-colors"
                        onClick={() => handleSort('sku')}
                      >
                        SKU <SortIcon field="sku" />
                      </button>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>
                      <button
                        className="flex items-center hover:text-foreground transition-colors"
                        onClick={() => handleSort('price')}
                      >
                        Price <SortIcon field="price" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        className="flex items-center hover:text-foreground transition-colors"
                        onClick={() => handleSort('stock')}
                      >
                        Stock <SortIcon field="stock" />
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.sku || '—'}
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline" className="text-xs">
                            {product.category.icon && (
                              <span className="mr-1">{product.category.icon}</span>
                            )}
                            {product.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        {product.stock} {product.unit}
                      </TableCell>
                      <TableCell>
                        <StockBadge stock={product.stock} lowStockAlert={product.lowStockAlert} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setProductToDelete(product);
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
                  {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of{' '}
                  {filteredProducts.length}
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
      )}

      {/* Mobile Card View (List mode only) */}
      {viewMode === 'list' && (
      <div className="md:hidden space-y-3">
        {loading ? (
          <ProductTableSkeleton />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No products found</p>
            <Button
              onClick={openAddProduct}
              size="sm"
              className="mt-4 bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          </div>
        ) : (
          paginatedProducts.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex items-start gap-3">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{product.name}</p>
                    <StockBadge stock={product.stock} lowStockAlert={product.lowStockAlert} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{formatCurrency(product.price)}</span>
                    <span>•</span>
                    <span>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                  {product.category && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {product.category.icon && <span className="mr-1">{product.category.icon}</span>}
                      {product.category.name}
                    </Badge>
                  )}
                  {product.sku && (
                    <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
                  )}
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => openEditProduct(product)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    setProductToDelete(product);
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
        {!loading && filteredProducts.length > 0 && (
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
      )}

      {/* ─── Add/Edit Product Dialog ─── */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details' : 'Fill in product information'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="product-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-name"
                placeholder="Product name"
                value={productForm.name}
                onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="product-desc">Description</Label>
              <Textarea
                id="product-desc"
                placeholder="Product description"
                value={productForm.description}
                onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Category + SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={productForm.categoryId}
                  onValueChange={(v) => setProductForm((f) => ({ ...f, categoryId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon && <span className="mr-1">{cat.icon}</span>}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  placeholder="SKU-001"
                  value={productForm.sku}
                  onChange={(e) => setProductForm((f) => ({ ...f, sku: e.target.value }))}
                />
              </div>
            </div>

            {/* Barcode */}
            <div className="grid gap-2">
              <Label htmlFor="product-barcode">Barcode</Label>
              <Input
                id="product-barcode"
                placeholder="Barcode number"
                value={productForm.barcode}
                onChange={(e) => setProductForm((f) => ({ ...f, barcode: e.target.value }))}
              />
            </div>

            {/* Price + Cost Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product-price">
                  Price <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-cost">Cost Price</Label>
                <Input
                  id="product-cost"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={productForm.costPrice}
                  onChange={(e) => setProductForm((f) => ({ ...f, costPrice: e.target.value }))}
                />
              </div>
            </div>

            {/* Unit + Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select
                  value={productForm.unit}
                  onValueChange={(v) => setProductForm((f) => ({ ...f, unit: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-stock">Stock Quantity</Label>
                <Input
                  id="product-stock"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={productForm.stock}
                  onChange={(e) => setProductForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-alert">Low Stock Alert</Label>
                <Input
                  id="product-alert"
                  type="number"
                  placeholder="5"
                  min="0"
                  value={productForm.lowStockAlert}
                  onChange={(e) => setProductForm((f) => ({ ...f, lowStockAlert: e.target.value }))}
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="grid gap-2">
              <Label htmlFor="product-image">Image URL</Label>
              <Input
                id="product-image"
                placeholder="https://example.com/image.jpg"
                value={productForm.image}
                onChange={(e) => setProductForm((f) => ({ ...f, image: e.target.value }))}
              />
            </div>

            {/* Variants placeholder */}
            <div className="grid gap-2">
              <Label htmlFor="product-variants">Variants</Label>
              <Textarea
                id="product-variants"
                placeholder='e.g. Size: S, M, L, XL | Color: Red, Blue, Green'
                value={productForm.variants}
                onChange={(e) => setProductForm((f) => ({ ...f, variants: e.target.value }))}
                rows={2}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter variants like Size, Color, etc. Separate options with commas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveProduct}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Product Confirmation ─── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteProduct}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Category Management Dialog ─── */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>Add, edit, or delete product categories</DialogDescription>
          </DialogHeader>

          {/* Add Category Form */}
          <div className="space-y-3 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="cat-name" className="text-xs">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cat-name"
                  placeholder="Category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="cat-icon" className="text-xs">
                  Icon (emoji)
                </Label>
                <Input
                  id="cat-icon"
                  placeholder="📦"
                  value={categoryIcon}
                  onChange={(e) => setCategoryIcon(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="cat-color" className="text-xs">
                  Color
                </Label>
                <Input
                  id="cat-color"
                  placeholder="emerald"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={saveCategory}
                disabled={savingCategory}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {savingCategory ? 'Saving...' : editingCategory ? 'Update' : 'Add Category'}
              </Button>
              {editingCategory && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryName('');
                    setCategoryIcon('');
                    setCategoryColor('');
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Category List */}
          <div className="space-y-2 pt-2">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No categories yet. Add your first category above.
              </p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon || '📁'}</span>
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat._count?.products || 0} products
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEditCategory(cat)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => {
                        setCategoryToDelete(cat);
                        setDeleteCategoryDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Category Confirmation ─── */}
      <AlertDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;? Products in this
              category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCategoryFn}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── CSV Import Dialog ─── */}
      <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Products from CSV</DialogTitle>
            <DialogDescription>Upload a CSV file to bulk import products</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Upload area */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload CSV file</p>
              <p className="text-xs text-muted-foreground mt-1">.csv files only</p>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSVUpload}
              />
            </label>

            {/* Expected format */}
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-xs font-medium mb-2">Expected CSV format:</p>
              <code className="text-xs block whitespace-pre-wrap text-muted-foreground">
                {`name,sku,category,price,costPrice,unit,stock,lowStockAlert,barcode
Tomato,TOM-001,Vegetables,40,25,kg,100,10,8901234567890
Rice,RIC-001,Grains,60,45,kg,200,20,8901234567891`}
              </code>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCsvDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
