'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import type { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  SplitSquareHorizontal,
  Printer,
  MessageCircle,
  Pause,
  X,
  ChevronDown,
  ChevronUp,
  StickyNote,
  User,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Package,
  IndianRupee,
  Download,
  Copy,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  _count?: { products: number };
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  unit: string;
  stock: number;
  lowStockAlert: number;
  image: string | null;
  categoryId: string | null;
  category: { id: string; name: string } | null;
}

interface HeldBill {
  id: string;
  items: CartItem[];
  customerName: string;
  orderType: string;
  createdAt: Date;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

// ─── Component ────────────────────────────────────────────────────

export default function BillingPos() {
  const { store, cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart, cartTotal } = useAppStore();

  const storeId = store?.id || '';

  // ─── Local State ───────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [orderType, setOrderType] = useState<string>('dine_in');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [splitAmount1, setSplitAmount1] = useState<string>('');
  const [splitMethod1, setSplitMethod1] = useState<string>('cash');
  const [splitMethod2, setSplitMethod2] = useState<string>('upi');

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const [customerName, setCustomerName] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [showHeldBills, setShowHeldBills] = useState(false);

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    orderNumber: string;
    date: string;
    items: CartItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: string;
    customerName: string;
  } | null>(null);

  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [itemDiscounts, setItemDiscounts] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // ─── Computed Values ────────────────────────────────────────────
  const subtotal = cartTotal();
  const storeTaxRate = store?.taxRate ?? 18;
  const taxAmount = Math.round(subtotal * (storeTaxRate / 100) * 100) / 100;
  const totalDiscount = couponDiscount;
  const totalAmount = Math.round((subtotal + taxAmount - totalDiscount) * 100) / 100;
  const changeAmount = paymentMethod === 'cash' && cashReceived
    ? Math.max(0, Math.round((parseFloat(cashReceived) - totalAmount) * 100) / 100)
    : 0;

  // ─── Fetch Categories ───────────────────────────────────────────
  useEffect(() => {
    if (!storeId) return;
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch(`/api/categories?storeId=${storeId}`);
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch {
        console.error('Failed to fetch categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [storeId]);

  // ─── Fetch Products ─────────────────────────────────────────────
  useEffect(() => {
    if (!storeId) return;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
        const res = await fetch(`/api/products?storeId=${storeId}${categoryParam}`);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch {
        console.error('Failed to fetch products');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [storeId, selectedCategory]);

  // ─── Search Products ────────────────────────────────────────────
  useEffect(() => {
    if (!storeId || !searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?storeId=${storeId}&search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.products) {
          setSearchResults(data.products.slice(0, 8));
          setShowSearchDropdown(data.products.length > 0);
        }
      } catch {
        console.error('Search failed');
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, storeId]);

  // ─── Search Customers ───────────────────────────────────────────
  useEffect(() => {
    if (!storeId || !customerName.trim() || customerName.length < 2) {
      setCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/customers?storeId=${storeId}&search=${encodeURIComponent(customerName)}`);
        const data = await res.json();
        if (data.customers && data.customers.length > 0) {
          setCustomers(data.customers);
          setShowCustomerDropdown(true);
        }
      } catch {
        console.error('Customer search failed');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerName, storeId]);

  // ─── Auto-focus search on mount ────────────────────────────────
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // ─── Click outside to close dropdowns ───────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Keyboard Shortcuts ─────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (e.key === 'F2' || ((e.ctrlKey || e.metaKey) && e.key === 'k') || (e.key === '/' && !isTyping)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'F4' && !isTyping) {
        e.preventDefault();
        handleHoldBill();
      }
      if (e.key === 'F8' && !isTyping) {
        e.preventDefault();
        handleClearCart();
      }
      if (e.key === 'F9' && !isTyping) {
        e.preventDefault();
        setPaymentMethod('cash');
      }
      if (e.key === 'F10' && !isTyping) {
        e.preventDefault();
        setPaymentMethod('upi');
      }
      if (e.key === 'Escape') {
        setShowReceipt(false);
        setShowHeldBills(false);
        setShowSearchDropdown(false);
        setShowCustomerDropdown(false);
        setShowSuccess(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, totalAmount, paymentMethod, customerName]);

  // ─── Handlers ───────────────────────────────────────────────────
  const handleAddToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return;
    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      discount: 0,
      total: product.price,
    };
    addToCart(cartItem);
    toast.success(`${product.name} added to bill`, { duration: 1200 });
  }, [addToCart]);

  const handleAddQuickAmount = (amount: number) => {
    const cartItem: CartItem = {
      productId: `custom-${Date.now()}`,
      name: `Custom Item - ₹${amount}`,
      price: amount,
      quantity: 1,
      unit: 'piece',
      discount: 0,
      total: amount,
    };
    addToCart(cartItem);
    toast.success(`₹${amount} custom item added`, { duration: 1200 });
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    updateCartItemQuantity(productId, newQty);
  };

  const handleUpdateItemDiscount = (productId: string, discountStr: string) => {
    setItemDiscounts(prev => ({ ...prev, [productId]: discountStr }));
    const discountVal = parseFloat(discountStr) || 0;
    const item = cart.find(c => c.productId === productId);
    if (item) {
      const newTotal = item.quantity * item.price * (1 - discountVal / 100);
      // We need to update the discount on the cart item
      // Since the store recalculates total based on discount, update the item
      const updatedItem: CartItem = {
        ...item,
        discount: discountVal,
        total: Math.round(newTotal * 100) / 100,
      };
      // Remove and re-add to recalculate
      removeFromCart(productId);
      // Use a slight delay to ensure state update
      setTimeout(() => {
        addToCart(updatedItem);
      }, 0);
    }
  };

  const handleUpdateItemNotes = (productId: string, notes: string) => {
    setItemNotes(prev => ({ ...prev, [productId]: notes }));
  };

  const toggleNotes = (productId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    // Mock coupon logic — in production, validate against API
    if (couponCode.toUpperCase() === 'SAVE10') {
      setCouponDiscount(Math.round(subtotal * 0.1 * 100) / 100);
      setCouponApplied(true);
      toast.success('Coupon applied! 10% off');
    } else if (couponCode.toUpperCase() === 'FLAT50') {
      setCouponDiscount(50);
      setCouponApplied(true);
      toast.success('Coupon applied! ₹50 off');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setCouponDiscount(0);
  };

  const handleHoldBill = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    const heldBill: HeldBill = {
      id: `held-${Date.now()}`,
      items: [...cart],
      customerName,
      orderType,
      createdAt: new Date(),
    };
    setHeldBills(prev => [...prev, heldBill]);
    clearCart();
    setCustomerName('');
    setSelectedCustomerId('');
    toast.success('Bill held successfully', { description: `${heldBills.length + 1} bill(s) on hold` });
  };

  const handleResumeBill = (bill: HeldBill) => {
    // Clear current cart first
    clearCart();
    // Add held items back
    bill.items.forEach(item => addToCart(item));
    setCustomerName(bill.customerName);
    setOrderType(bill.orderType);
    // Remove from held bills
    setHeldBills(prev => prev.filter(b => b.id !== bill.id));
    setShowHeldBills(false);
    toast.success('Bill resumed');
  };

  const handleDeleteHeldBill = (billId: string) => {
    setHeldBills(prev => prev.filter(b => b.id !== billId));
    toast.success('Held bill discarded');
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    clearCart();
    setCashReceived('');
    setSplitAmount1('');
    setCouponCode('');
    setCouponApplied(false);
    setCouponDiscount(0);
    setItemNotes({});
    setItemDiscounts({});
    setExpandedNotes(new Set());
    setCustomerName('');
    setSelectedCustomerId('');
    toast.success('Cart cleared');
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod === 'cash' && cashReceived && parseFloat(cashReceived) < totalAmount) {
      toast.error('Insufficient cash received');
      return;
    }

    if (paymentMethod === 'split') {
      const amt1 = parseFloat(splitAmount1) || 0;
      const amt2 = totalAmount - amt1;
      if (amt1 <= 0 || amt2 <= 0) {
        toast.error('Please enter valid split amounts');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const orderItems = cart.map(item => ({
        productId: item.productId.startsWith('custom-') ? null : item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount,
        notes: itemNotes[item.productId] || null,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          customerId: selectedCustomerId || null,
          items: orderItems,
          type: orderType,
          paymentMethod,
          notes: '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      const order = data.order;

      // Show receipt
      setReceiptData({
        orderNumber: order.orderNumber,
        date: new Date(order.createdAt).toLocaleString('en-IN'),
        items: [...cart],
        subtotal,
        taxAmount,
        discountAmount: totalDiscount,
        totalAmount,
        paymentMethod,
        customerName: customerName || 'Walk-in',
      });

      setShowReceipt(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Clear cart
      clearCart();
      setCashReceived('');
      setSplitAmount1('');
      setCouponCode('');
      setCouponApplied(false);
      setCouponDiscount(0);
      setItemNotes({});
      setItemDiscounts({});
      setExpandedNotes(new Set());
      setCustomerName('');
      setSelectedCustomerId('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayAndPrint = async () => {
    await handlePayment();
    // After receipt is shown, trigger print
    setTimeout(() => window.print(), 500);
  };

  const handlePayAndWhatsApp = async () => {
    await handlePayment();
    toast.success('Receipt sent via WhatsApp (demo)');
  };

  // ─── Generate Receipt Text ──────────────────────────────────────
  const generateReceiptText = () => {
    if (!receiptData) return '';
    const taxRate = store?.taxRate ?? 18;
    const lines: string[] = [];
    lines.push('═══════════════════════════════════');
    lines.push(`  ${store?.name || 'StoreOS'}`);
    lines.push(`  ${store?.address || '123 Business Street, City'}`);
    if (store?.phone) lines.push(`  Phone: ${store.phone}`);
    if (store?.gstNumber) lines.push(`  GSTIN: ${store.gstNumber}`);
    lines.push('═══════════════════════════════════');
    lines.push('');
    lines.push(`Receipt: #${receiptData.orderNumber}`);
    lines.push(`Date: ${receiptData.date}`);
    lines.push(`Customer: ${receiptData.customerName}`);
    lines.push(`Payment: ${receiptData.paymentMethod.toUpperCase()}`);
    lines.push('───────────────────────────────────');
    lines.push('Item                Qty  Rate  Amt');
    lines.push('───────────────────────────────────');
    receiptData.items.forEach(item => {
      const name = item.name.length > 18 ? item.name.slice(0, 18) : item.name.padEnd(18);
      const qty = String(item.quantity).padStart(3);
      const rate = String(item.price).padStart(5);
      const amt = String(item.total).padStart(6);
      lines.push(`${name}${qty}${rate}${amt}`);
    });
    lines.push('───────────────────────────────────');
    lines.push(`Subtotal:                      ₹${receiptData.subtotal}`);
    if (receiptData.discountAmount > 0) {
      lines.push(`Discount:                     -₹${receiptData.discountAmount}`);
    }
    lines.push(`CGST (${taxRate / 2}%):                     ₹${Math.round(receiptData.taxAmount / 2 * 100) / 100}`);
    lines.push(`SGST (${taxRate / 2}%):                     ₹${Math.round(receiptData.taxAmount / 2 * 100) / 100}`);
    lines.push('═══════════════════════════════════');
    lines.push(`TOTAL:                        ₹${receiptData.totalAmount}`);
    lines.push('═══════════════════════════════════');
    lines.push('');
    lines.push('  Thank you! Visit again! 🙏');
    lines.push('  Powered by StoreOS • storeos.in');
    lines.push('');
    return lines.join('\n');
  };

  const handleCopyReceipt = () => {
    const text = generateReceiptText();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Receipt copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy receipt');
    });
  };

  const handleShareWhatsApp = () => {
    const text = generateReceiptText();
    if (!text) return;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  // ─── Get order type options based on niche ──────────────────────
  const getOrderTypes = () => {
    const niche = store?.niche || '';
    if (['restaurant', 'bakery', 'hotel'].includes(niche)) {
      return [
        { value: 'dine_in', label: 'Dine-in', icon: '🍽️' },
        { value: 'takeaway', label: 'Takeaway', icon: '🥡' },
        { value: 'delivery', label: 'Delivery', icon: '🚚' },
      ];
    }
    return [
      { value: 'in_store', label: 'In-Store', icon: '🏪' },
      { value: 'delivery', label: 'Delivery', icon: '🚚' },
      { value: 'online', label: 'Online', icon: '🌐' },
    ];
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 animate-bounce" />
            <h2 className="text-2xl font-bold text-emerald-700">Payment Successful!</h2>
            <p className="text-gray-500">Order completed successfully</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ═══ LEFT COLUMN — Product Selection ═══ */}
        <div className="w-full lg:w-[60%] flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-20">
            <div className="relative" ref={searchDropdownRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) setShowSearchDropdown(false);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Search products by name, SKU, barcode... (Ctrl+K or /)"
                className="pl-10 pr-20 h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
                Ctrl+K
              </kbd>

              {/* Search Results Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
                  {searchResults.map(product => (
                    <button
                      key={product.id}
                      onClick={() => {
                        handleAddToCart(product);
                        setSearchQuery('');
                        setShowSearchDropdown(false);
                        searchInputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors text-left border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.sku && <span>SKU: {product.sku} · </span>}
                          Stock: {product.stock} {product.unit}
                        </p>
                      </div>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">₹{product.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0'
                    : 'flex-shrink-0'
                }
              >
                All
              </Button>
              {loadingCategories ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse flex-shrink-0" />
                ))
              ) : (
                categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0'
                        : 'flex-shrink-0'
                    }
                  >
                    {cat.icon && <span className="mr-1">{cat.icon}</span>}
                    {cat.name}
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Package className="w-16 h-16 mb-3 opacity-50" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Try a different category or search</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {products.map(product => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= product.lowStockAlert;
                  return (
                    <button
                      key={product.id}
                      onClick={() => { if (!isOutOfStock) handleAddToCart(product); }}
                      disabled={isOutOfStock}
                      className={`relative flex flex-col items-start p-3 rounded-xl border-2 transition-all duration-150 text-left group
                        ${isOutOfStock
                          ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/10 active:scale-[0.97] cursor-pointer'
                        }`}
                    >
                      {/* Stock Badge */}
                      {isOutOfStock && (
                        <Badge variant="secondary" className="absolute top-2 right-2 bg-gray-500 text-white text-[10px] px-1.5 py-0">
                          Out of Stock
                        </Badge>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <Badge variant="secondary" className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-1.5 py-0">
                          Low Stock
                        </Badge>
                      )}
                      {/* Product Icon */}
                      <div className="w-full h-10 flex items-center justify-center mb-2">
                        <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                      </div>
                      {/* Product Name */}
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 w-full">
                        {product.name}
                      </p>
                      {/* Price & Stock */}
                      <div className="flex items-baseline justify-between w-full mt-1.5">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{product.price}</span>
                        <span className="text-[10px] text-gray-400">
                          {product.stock} {product.unit}
                        </span>
                      </div>
                      {/* Hover indicator */}
                      {!isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors pointer-events-none">
                          <Plus className="w-6 h-6 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-xs text-gray-500 mb-2 font-medium">Quick Add Custom Amount</p>
            <div className="flex gap-2">
              {[100, 200, 500, 1000].map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddQuickAmount(amount)}
                  className="flex-1 font-semibold border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500"
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN — Cart & Checkout ═══ */}
        <div className="w-full lg:w-[40%] flex flex-col bg-white dark:bg-gray-950">
          {/* Cart Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">Current Bill</h2>
                {cart.length > 0 && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {cart.length} item{cart.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {heldBills.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHeldBills(true)}
                    className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  >
                    <Pause className="w-3.5 h-3.5 mr-1" />
                    Held ({heldBills.length})
                  </Button>
                )}
              </div>
            </div>

            {/* Order Type Tabs */}
            <Tabs value={orderType} onValueChange={setOrderType}>
              <TabsList className="w-full h-9">
                {getOrderTypes().map(type => (
                  <TabsTrigger key={type.value} value={type.value} className="flex-1 text-xs">
                    <span className="mr-1">{type.icon}</span>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Customer Selection */}
            <div className="mt-2 relative" ref={customerDropdownRef}>
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (!e.target.value) setSelectedCustomerId('');
                }}
                placeholder="Customer name (optional)"
                className="pl-8 h-8 text-sm bg-gray-50 dark:bg-gray-900"
              />
              {showCustomerDropdown && customers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                  {customers.map(cust => (
                    <button
                      key={cust.id}
                      onClick={() => {
                        setCustomerName(cust.name);
                        setSelectedCustomerId(cust.id);
                        setShowCustomerDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-sm border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <span className="font-medium">{cust.name}</span>
                      {cust.phone && <span className="text-gray-400 ml-2">{cust.phone}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                  {/* Illustration-like empty cart design */}
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 opacity-30" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-2 border-white dark:border-gray-900">
                      <Plus className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Your cart is empty</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Tap products to add them here</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-medium">Ready to bill</span>
                  </div>
                </div>
              ) : (
                cart.map(item => (
                  <Card key={item.productId} className="border border-gray-200 dark:border-gray-800 shadow-none">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-tight truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ₹{item.price} × {item.quantity} {item.unit}
                            {item.discount > 0 && <span className="text-red-500 ml-1">(-{item.discount}%)</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {/* Per-item discount */}
                          <Input
                            value={itemDiscounts[item.productId] || ''}
                            onChange={(e) => handleUpdateItemDiscount(item.productId, e.target.value)}
                            placeholder="Disc %"
                            className="h-6 w-16 text-[11px] px-1.5 bg-gray-50 dark:bg-gray-900"
                          />
                          {/* Notes toggle */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleNotes(item.productId)}
                          >
                            {expandedNotes.has(item.productId) ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <StickyNote className="w-3 h-3 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                            ₹{item.total}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Notes Input */}
                      {expandedNotes.has(item.productId) && (
                        <div className="mt-2">
                          <Input
                            value={itemNotes[item.productId] || ''}
                            onChange={(e) => handleUpdateItemNotes(item.productId, e.target.value)}
                            placeholder="Add notes for this item..."
                            className="h-7 text-xs bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Cart Summary & Payment */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            {/* Summary */}
            <div className="p-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {/* Coupon */}
              <div className="flex items-center gap-1.5">
                {couponApplied ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                      {couponCode} applied
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={handleRemoveCoupon}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <span className="text-sm text-red-500 ml-auto">-₹{totalDiscount}</span>
                  </div>
                ) : (
                  <>
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="h-7 text-xs flex-1 bg-white dark:bg-gray-800"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      className="h-7 text-xs"
                    >
                      Apply
                    </Button>
                  </>
                )}
              </div>

              {/* Tax Breakdown */}
              <div className="text-xs text-gray-500 space-y-0.5">
                <div className="flex justify-between">
                  <span>CGST ({storeTaxRate / 2}%)</span>
                  <span>₹{Math.round(taxAmount / 2 * 100) / 100}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST ({storeTaxRate / 2}%)</span>
                  <span>₹{Math.round(taxAmount / 2 * 100) / 100}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Total</span>
                <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="px-3 pb-2">
              <div className="grid grid-cols-4 gap-1.5">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentMethod('cash')}
                  className={paymentMethod === 'cash' ? 'bg-emerald-600 hover:bg-emerald-700 text-white h-9' : 'h-9'}
                >
                  <Banknote className="w-3.5 h-3.5 mr-1" />
                  Cash
                </Button>
                <Button
                  variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentMethod('upi')}
                  className={paymentMethod === 'upi' ? 'bg-emerald-600 hover:bg-emerald-700 text-white h-9' : 'h-9'}
                >
                  <Smartphone className="w-3.5 h-3.5 mr-1" />
                  UPI
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentMethod('card')}
                  className={paymentMethod === 'card' ? 'bg-emerald-600 hover:bg-emerald-700 text-white h-9' : 'h-9'}
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1" />
                  Card
                </Button>
                <Button
                  variant={paymentMethod === 'split' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentMethod('split')}
                  className={paymentMethod === 'split' ? 'bg-emerald-600 hover:bg-emerald-700 text-white h-9' : 'h-9'}
                >
                  <SplitSquareHorizontal className="w-3.5 h-3.5 mr-1" />
                  Split
                </Button>
              </div>

              {/* Cash Payment Details */}
              {paymentMethod === 'cash' && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] text-gray-500 mb-0.5 block">Amount Received</label>
                    <Input
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0"
                      type="number"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] text-gray-500 mb-0.5 block">Change</label>
                    <div className="h-8 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center">
                      <span className="font-semibold text-sm text-emerald-600">
                        ₹{changeAmount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Details */}
              {paymentMethod === 'upi' && (
                <div className="mt-2 flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">UPI Payment</p>
                    <p className="text-xs text-gray-400">Show QR code to customer</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1.5 h-7 text-xs border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      onClick={handlePayment}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Payment Received
                    </Button>
                  </div>
                </div>
              )}

              {/* Split Payment Details */}
              {paymentMethod === 'split' && (
                <div className="mt-2 space-y-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <Select value={splitMethod1} onValueChange={setSplitMethod1}>
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={splitAmount1}
                      onChange={(e) => setSplitAmount1(e.target.value)}
                      placeholder="Amount 1"
                      type="number"
                      className="h-7 text-xs flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={splitMethod2} onValueChange={setSplitMethod2}>
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex-1 h-7 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center text-xs text-gray-500">
                      ₹{splitAmount1 ? Math.round((totalAmount - parseFloat(splitAmount1)) * 100) / 100 : totalAmount}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-3 pt-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handlePayAndPrint}
                  disabled={cart.length === 0 || isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 font-semibold"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  Pay & Print
                </Button>
                <Button
                  onClick={handlePayAndWhatsApp}
                  disabled={cart.length === 0 || isProcessing}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white h-11 font-semibold"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  Pay & WhatsApp
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleHoldBill}
                  disabled={cart.length === 0}
                  className="border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 h-9"
                >
                  <Pause className="w-3.5 h-3.5 mr-1" />
                  Hold Bill
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  disabled={cart.length === 0}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-9"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Receipt Modal ═══ */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md print:max-w-none print:p-0 print:shadow-none print:border-0">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Receipt
            </DialogTitle>
          </DialogHeader>
          {receiptData && (
            <div className="space-y-3 print:space-y-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 print:p-4 print:border-0">
              {/* Store Logo & Header */}
              <div className="text-center border-b-2 border-gray-900 dark:border-gray-100 pb-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2">
                  <Package className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-bold text-xl tracking-tight">{store?.name || 'StoreOS'}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {store?.address || '123 Business Street, City'}
                </p>
                <p className="text-xs text-gray-500">
                  {store?.phone ? `Phone: ${store.phone}` : 'Phone: +91-9876543210'}
                </p>
                {store?.gstNumber && (
                  <p className="text-xs text-gray-500 mt-0.5">GSTIN: {store.gstNumber}</p>
                )}
              </div>

              {/* Receipt Number & Date - Prominent */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Receipt No.</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">#{receiptData.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Date & Time</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{receiptData.date}</p>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Customer: <span className="font-medium text-gray-900 dark:text-gray-100">{receiptData.customerName}</span></span>
                <span>Payment: <span className="font-medium text-gray-900 dark:text-gray-100">{receiptData.paymentMethod.toUpperCase()}</span></span>
              </div>

              <div className="border-t border-dashed border-gray-300 dark:border-gray-600" />

              {/* Items Table */}
              <div>
                <div className="grid grid-cols-12 text-[10px] font-bold text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="col-span-5">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Rate</span>
                  <span className="col-span-3 text-right">Amount</span>
                </div>
                {receiptData.items.map(item => (
                  <div key={item.productId} className="grid grid-cols-12 text-xs py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="col-span-5 truncate font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                    <span className="col-span-2 text-center text-gray-600 dark:text-gray-400">{item.quantity}</span>
                    <span className="col-span-2 text-right text-gray-600 dark:text-gray-400">₹{item.price}</span>
                    <span className="col-span-3 text-right font-semibold text-gray-900 dark:text-gray-100">₹{item.total}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-300 dark:border-gray-600" />

              {/* Totals with Tax Breakdown */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{receiptData.subtotal}</span>
                </div>
                {receiptData.discountAmount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount</span>
                    <span>-₹{receiptData.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>CGST ({(store?.taxRate ?? 18) / 2}%)</span>
                  <span>₹{Math.round(receiptData.taxAmount / 2 * 100) / 100}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>SGST ({(store?.taxRate ?? 18) / 2}%)</span>
                  <span>₹{Math.round(receiptData.taxAmount / 2 * 100) / 100}</span>
                </div>
                <div className="border-t-2 border-gray-900 dark:border-gray-100 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-2xl">
                    <span>TOTAL</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{receiptData.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 dark:border-gray-600" />

              {/* Footer */}
              <div className="text-center space-y-1.5 py-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Thank you! Visit again! 🙏</p>
                <p className="text-[10px] text-gray-400">Powered by StoreOS • storeos.in</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 print:hidden pt-2">
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadPdf}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-transform"
                  >
                    <Printer className="w-4 h-4 mr-1.5" />
                    Print Receipt
                  </Button>
                  <Button
                    onClick={handleShareWhatsApp}
                    variant="outline"
                    className="flex-1 border-green-400 text-green-700 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-950/30 active:scale-95 transition-transform"
                  >
                    <Share2 className="w-4 h-4 mr-1.5" />
                    WhatsApp
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyReceipt}
                    variant="outline"
                    className="flex-1 active:scale-95 transition-transform"
                  >
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copy Receipt
                  </Button>
                  <Button
                    onClick={handleDownloadPdf}
                    variant="outline"
                    className="flex-1 active:scale-95 transition-transform"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download PDF
                  </Button>
                </div>
                <Button variant="ghost" onClick={() => setShowReceipt(false)} className="w-full active:scale-95 transition-transform">
                  <X className="w-4 h-4 mr-1.5" />
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ Held Bills Modal ═══ */}
      <Dialog open={showHeldBills} onOpenChange={setShowHeldBills}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pause className="w-5 h-5 text-amber-500" />
              Held Bills ({heldBills.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-80">
            {heldBills.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No held bills</p>
              </div>
            ) : (
              <div className="space-y-2">
                {heldBills.map(bill => (
                  <Card key={bill.id} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">
                            {bill.customerName || 'Walk-in'} — {bill.items.length} item(s)
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(bill.createdAt).toLocaleTimeString('en-IN')}
                            {' · '}
                            {bill.orderType.replace('_', ' ')}
                          </p>
                        </div>
                        <span className="font-bold text-emerald-600">
                          ₹{bill.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleResumeBill(bill)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                        >
                          Resume
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteHeldBill(bill.id)}
                          className="border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 h-8"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ═══ Keyboard Shortcuts Legend ═══ */}
      <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-[10px] text-gray-400">
        <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px]">F2</kbd> Search</span>
        <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px]">F4</kbd> Hold</span>
        <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px]">F8</kbd> Clear</span>
        <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px]">F9</kbd> Cash</span>
        <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px]">F10</kbd> UPI</span>
        <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px]">Esc</kbd> Close</span>
      </div>
    </div>
  );
}
