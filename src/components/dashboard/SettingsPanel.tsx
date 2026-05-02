'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Store,
  Receipt,
  CreditCard,
  Palette,
  Crown,
  MessageSquare,
  Database,
  Save,
  Download,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  FileText,
  Camera,
  Zap,
  RefreshCw,
  Shield,
  Globe,
  Clock,
  Type,
  Code,
  Archive,
  CalendarDays,
  User,
  Users,
  X,
  Sparkles,
  Banknote,
  Smartphone,
  SplitSquareHorizontal,
  Hash,
  DollarSign,
  Percent,
  Eye,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  HardDrive,
  Send,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

// ─── Language Tab Component ──────────────────────────────────
function LanguageTab() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-600" />
          {t('language')}
        </CardTitle>
        <CardDescription>{t('languageDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => { setLanguage('en'); toast.success('Language changed to English'); }}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              language === 'en'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🇬🇧</span>
              <div>
                <p className="font-bold text-lg">English</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Default language</p>
              </div>
              {language === 'en' && <Check className="w-5 h-5 text-emerald-600 ml-auto" />}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dashboard, Products, Orders, Reports</p>
          </button>

          <button
            onClick={() => { setLanguage('hi'); toast.success('भाषा हिंदी में बदली गई'); }}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              language === 'hi'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🇮🇳</span>
              <div>
                <p className="font-bold text-lg">हिंदी</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hindi</p>
              </div>
              {language === 'hi' && <Check className="w-5 h-5 text-emerald-600 ml-auto" />}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">डैशबोर्ड, उत्पाद, ऑर्डर, रिपोर्ट</p>
          </button>
        </div>

        <Separator />

        <div>
          <p className="font-medium mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            {t('languagePreview')}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <p className="text-xs font-medium text-gray-400 mb-2">🇬🇧 English</p>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-gray-500">Sidebar:</span> <span className="font-medium">Dashboard, Products, Orders</span></p>
                <p><span className="text-gray-500">Greeting:</span> <span className="font-medium">Good Morning</span></p>
                <p><span className="text-gray-500">Billing:</span> <span className="font-medium">Cash, UPI, Card, Total</span></p>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <p className="text-xs font-medium text-gray-400 mb-2">🇮🇳 हिंदी</p>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-gray-500">Sidebar:</span> <span className="font-medium">डैशबोर्ड, उत्पाद, ऑर्डर</span></p>
                <p><span className="text-gray-500">Greeting:</span> <span className="font-medium">सुप्रभात</span></p>
                <p><span className="text-gray-500">Billing:</span> <span className="font-medium">नकद, UPI, कार्ड, कुल</span></p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-medium text-emerald-700 dark:text-emerald-400">
              {language === 'hi' ? 'हिंदी चयनित' : 'English selected'}
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">
              {language === 'hi'
                ? 'डैशबोर्ड की भाषा हिंदी में बदल गई है।'
                : 'Dashboard language is set to English.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Settings Panel ──────────────────────────────────────
export default function SettingsPanel() {
  const { store, user, setStore, subscription } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<Record<string, string | number | boolean> | null>(null);

  // Store profile
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [logo, setLogo] = useState('');

  // Tax
  const [taxRate, setTaxRate] = useState(18);
  const [gstin, setGstin] = useState('');
  const [gstEnabled, setGstEnabled] = useState(true);
  const [cgstRate, setCgstRate] = useState(9);
  const [sgstRate, setSgstRate] = useState(9);
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [hsnCode, setHsnCode] = useState('');
  const [cessRate, setCessRate] = useState(0);

  // Receipt
  const [receiptHeader, setReceiptHeader] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [showLogoOnReceipt, setShowLogoOnReceipt] = useState(true);
  const [showGstinOnReceipt, setShowGstinOnReceipt] = useState(true);
  const [showCustomerPhone, setShowCustomerPhone] = useState(false);
  const [printerSize, setPrinterSize] = useState('80mm');
  const [autoPrintOnPayment, setAutoPrintOnPayment] = useState(false);

  // Payment methods
  const [cashEnabled, setCashEnabled] = useState(true);
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [splitEnabled, setSplitEnabled] = useState(true);
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [razorpayKey, setRazorpayKey] = useState('');
  const [defaultPayment, setDefaultPayment] = useState('cash');

  // Branding
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [accentColor, setAccentColor] = useState('#059669');
  const [sidebarStyle, setSidebarStyle] = useState<'standard' | 'compact'>('standard');

  // Branding - font & CSS
  const [selectedFont, setSelectedFont] = useState<'classic' | 'modern' | 'minimal'>('modern');
  const [customCSS, setCustomCSS] = useState('');

  // WhatsApp
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappAutoSend, setWhatsappAutoSend] = useState(false);
  const [whatsappOrderTemplate, setWhatsappOrderTemplate] = useState('Hi {customer}, your order #{orderId} has been confirmed! Total: ₹{total}. Thank you!');
  const [whatsappDeliveryTemplate, setWhatsappDeliveryTemplate] = useState('Hi {customer}, your order #{orderId} is out for delivery! Expected delivery: {time}.');

  // Subscription
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Operating hours
  const [operatingHours, setOperatingHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    Monday: { open: '09:00', close: '21:00', closed: false },
    Tuesday: { open: '09:00', close: '21:00', closed: false },
    Wednesday: { open: '09:00', close: '21:00', closed: false },
    Thursday: { open: '09:00', close: '21:00', closed: false },
    Friday: { open: '09:00', close: '21:00', closed: false },
    Saturday: { open: '09:00', close: '22:00', closed: false },
    Sunday: { open: '10:00', close: '20:00', closed: false },
  });

  // Backup & Data
  const [lastBackupDate, setLastBackupDate] = useState<string>('');
  const [backingUp, setBackingUp] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Load store data
  useEffect(() => {
    if (store) {
      setStoreName(store.name || '');
      setOwnerName(store.ownerName || '');
      setGstNumber(store.gstNumber || '');
      setGstin(store.gstNumber || '');
    }
  }, [store]);

  // Track unsaved changes
  useEffect(() => {
    if (!initialSnapshot) return;
    const current = {
      storeName, ownerName, address, city, state, gstNumber, storePhone, storeEmail, logo,
      taxRate, gstEnabled, cgstRate, sgstRate, taxInclusive, hsnCode, cessRate,
      receiptHeader, receiptFooter, showLogoOnReceipt, showGstinOnReceipt, showCustomerPhone,
      printerSize, autoPrintOnPayment, cashEnabled, upiEnabled, cardEnabled, splitEnabled, upiId,
      bankName, bankAccount, bankIfsc, razorpayKey, defaultPayment,
      primaryColor, accentColor, sidebarStyle, selectedFont,
      whatsappNumber, whatsappAutoSend,
    };
    const changed = Object.keys(current).some(key => {
      const cv = current[key as keyof typeof current];
      const iv = initialSnapshot[key];
      return cv !== iv;
    });
    setHasUnsavedChanges(changed);
  }, [storeName, ownerName, address, city, state, gstNumber, storePhone, storeEmail, logo,
    taxRate, gstEnabled, cgstRate, sgstRate, taxInclusive, hsnCode, cessRate,
    receiptHeader, receiptFooter, showLogoOnReceipt, showGstinOnReceipt, showCustomerPhone,
    printerSize, autoPrintOnPayment, cashEnabled, upiEnabled, cardEnabled, splitEnabled, upiId,
    bankName, bankAccount, bankIfsc, razorpayKey, defaultPayment,
    primaryColor, accentColor, sidebarStyle, selectedFont,
    whatsappNumber, whatsappAutoSend, initialSnapshot]);

  // Fetch full store details
  const fetchStoreDetails = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/store?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        const s = data.store;
        setStoreName(s.name || '');
        setOwnerName(s.ownerName || '');
        setAddress(s.address || '');
        setCity(s.city || '');
        setState(s.state || '');
        setGstNumber(s.gstNumber || '');
        setStorePhone(s.phone || '');
        setStoreEmail(s.email || '');
        setLogo(s.logo || '');
        setTaxRate(s.taxRate || 18);
        setReceiptHeader(s.receiptHeader || '');
        setReceiptFooter(s.receiptFooter || '');
        setGstin(s.gstNumber || '');
        setCgstRate(Math.floor((s.taxRate || 18) / 2));
        setSgstRate(Math.ceil((s.taxRate || 18) / 2));
        setInitialSnapshot({
          storeName: s.name || '', ownerName: s.ownerName || '', address: s.address || '',
          city: s.city || '', state: s.state || '', gstNumber: s.gstNumber || '',
          storePhone: s.phone || '', storeEmail: s.email || '', logo: s.logo || '',
          taxRate: s.taxRate || 18, gstEnabled: true, cgstRate: Math.floor((s.taxRate || 18) / 2),
          sgstRate: Math.ceil((s.taxRate || 18) / 2), taxInclusive: false, hsnCode: '', cessRate: 0,
          receiptHeader: s.receiptHeader || '', receiptFooter: s.receiptFooter || '',
          showLogoOnReceipt: true, showGstinOnReceipt: true, showCustomerPhone: false,
          printerSize: '80mm', autoPrintOnPayment: false,
          cashEnabled: true, upiEnabled: true, cardEnabled: true, splitEnabled: true, upiId: '',
          bankName: '', bankAccount: '', bankIfsc: '', razorpayKey: '', defaultPayment: 'cash',
          primaryColor: '#10b981', accentColor: '#059669', sidebarStyle: 'standard', selectedFont: 'modern',
          whatsappNumber: '', whatsappAutoSend: false,
        });
        setHasUnsavedChanges(false);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchStoreDetails(); }, [fetchStoreDetails]);

  const handleSave = async () => {
    if (!store?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/store/${store.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeName, ownerName, address, city, state, gstNumber,
          phone: storePhone, email: storeEmail, logo, taxRate,
          receiptHeader, receiptFooter,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStore({
          id: data.store.id,
          name: data.store.name,
          niche: data.store.niche,
          template: data.store.template,
          onboardingComplete: data.store.onboardingComplete,
          taxRate: data.store.taxRate,
          ownerName: data.store.ownerName,
          city: data.store.city,
          state: data.store.state,
          phone: data.store.phone,
          address: data.store.address,
          gstNumber: data.store.gstNumber,
        });
        setInitialSnapshot({
          storeName, ownerName, address, city, state, gstNumber, storePhone, storeEmail, logo,
          taxRate, gstEnabled, cgstRate, sgstRate, taxInclusive, hsnCode, cessRate,
          receiptHeader, receiptFooter, showLogoOnReceipt, showGstinOnReceipt, showCustomerPhone,
          printerSize, autoPrintOnPayment, cashEnabled, upiEnabled, cardEnabled, splitEnabled, upiId,
          bankName, bankAccount, bankIfsc, razorpayKey, defaultPayment,
          primaryColor, accentColor, sidebarStyle, selectedFont,
          whatsappNumber, whatsappAutoSend,
        });
        setHasUnsavedChanges(false);
        toast.success('Settings saved successfully', {
          description: 'All changes have been applied to your store.',
          duration: 3000,
        });
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const [productsRes, customersRes, ordersRes, tablesRes] = await Promise.all([
        fetch(`/api/products?storeId=${store?.id}`),
        fetch(`/api/customers?storeId=${store?.id}`),
        fetch(`/api/orders?storeId=${store?.id}`),
        fetch(`/api/tables?storeId=${store?.id}`),
      ]);
      const exportData: Record<string, unknown> = { exportDate: new Date().toISOString(), storeName };
      if (productsRes.ok) { const d = await productsRes.json(); exportData.products = Array.isArray(d) ? d : d.products || []; }
      if (customersRes.ok) { const d = await customersRes.json(); exportData.customers = Array.isArray(d) ? d : d.customers || []; }
      if (ordersRes.ok) { const d = await ordersRes.json(); exportData.orders = Array.isArray(d) ? d : d.orders || []; }
      if (tablesRes.ok) { const d = await tablesRes.json(); exportData.tables = d.tables || []; }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `storeos-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch {
      toast.error('Failed to export data');
    }
  };

  const handleResetData = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    toast.success('Store data has been reset (demo mode)');
    setResetDialogOpen(false);
    setDeleteConfirmText('');
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
  ];

  const gstPresets = [0, 5, 12, 18, 28];

  const brandingPresets = [
    { name: 'Emerald', primary: '#10b981', accent: '#059669', bg: 'bg-emerald-500' },
    { name: 'Sky', primary: '#0ea5e9', accent: '#0284c7', bg: 'bg-sky-500' },
    { name: 'Amber', primary: '#f59e0b', accent: '#d97706', bg: 'bg-amber-500' },
    { name: 'Rose', primary: '#f43f5e', accent: '#e11d48', bg: 'bg-rose-500' },
    { name: 'Violet', primary: '#8b5cf6', accent: '#7c3aed', bg: 'bg-violet-500' },
    { name: 'Orange', primary: '#f97316', accent: '#ea580c', bg: 'bg-orange-500' },
  ];

  const tabAnim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: 'easeOut' as const } };

  return (
    <div className="space-y-6">
      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
        >
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-sm text-amber-700 dark:text-amber-400">You have unsaved changes</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your store configuration and preferences</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={() => { fetchStoreDetails(); toast.info('Changes discarded'); }} className="text-gray-600 dark:text-gray-400">
            <X className="w-4 h-4 mr-2" />Discard
          </Button>
          <Button onClick={handleSave} disabled={saving} className={`bg-emerald-600 hover:bg-emerald-700 text-white ${hasUnsavedChanges ? 'ring-2 ring-amber-400/50 ring-offset-2' : ''}`}>
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full flex h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 relative flex-nowrap">
            {[
              { value: 'profile', Icon: Store, label: 'Store Profile' },
              { value: 'tax', Icon: Percent, label: 'Tax' },
              { value: 'receipt', Icon: FileText, label: 'Receipt' },
              { value: 'payment', Icon: CreditCard, label: 'Payment' },
              { value: 'branding', Icon: Palette, label: 'Branding' },
              { value: 'subscription', Icon: Crown, label: 'Plan' },
              { value: 'whatsapp', Icon: MessageSquare, label: 'WhatsApp' },
              { value: 'data', Icon: Database, label: 'Data' },
              { value: 'language', Icon: Globe, label: 'Language' },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 min-w-fit text-xs sm:text-sm data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 transition-colors">
                <tab.Icon className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ═══════════ STORE PROFILE TAB ═══════════ */}
        <TabsContent value="profile">
          <motion.div key="profile-content" {...tabAnim}>
            <div className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Store className="w-5 h-5 text-emerald-600" />Store Profile</CardTitle>
                  <CardDescription>Basic information about your store</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Logo Upload - Circular Avatar */}
                  <div className="space-y-2">
                    <Label>Store Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden shrink-0">
                          {logo ? (
                            <img src={logo} alt="Store logo" className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <button
                          onClick={() => { const url = prompt('Enter logo URL:'); if (url) setLogo(url); }}
                          className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Camera className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Button variant="outline" size="sm" onClick={() => { const url = prompt('Enter logo URL:'); if (url) setLogo(url); }}>
                          <Upload className="w-4 h-4 mr-2" />Upload Logo
                        </Button>
                        {logo && (
                          <Button variant="ghost" size="sm" onClick={() => setLogo('')} className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-3 h-3 mr-1" />Remove
                          </Button>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">Recommended: 200×200px, PNG or JPG</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Store Name</Label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="pl-9 dark:bg-gray-900 dark:border-gray-600" placeholder="My Store" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="pl-9 dark:bg-gray-900 dark:border-gray-600" placeholder="Owner Name" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="pl-9 min-h-[80px] dark:bg-gray-900 dark:border-gray-600" placeholder="Store address" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="dark:bg-gray-900 dark:border-gray-600" placeholder="City" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select value={state} onValueChange={setState}>
                        <SelectTrigger id="state" className="dark:bg-gray-900 dark:border-gray-600"><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent>{indianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gst">GST Number</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="gst" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="pl-9 dark:bg-gray-900 dark:border-gray-600" placeholder="22AAAAA0000A1Z5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="phone" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} className="pl-9 dark:bg-gray-900 dark:border-gray-600" placeholder="9876543210" />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="email" type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} className="pl-9 dark:bg-gray-900 dark:border-gray-600" placeholder="store@example.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <div className="relative">
                        <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="logoUrl" value={logo} onChange={(e) => setLogo(e.target.value)} className="pl-9 dark:bg-gray-900 dark:border-gray-600" placeholder="https://..." />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Operating Hours */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-600" />Operating Hours</CardTitle>
                  <CardDescription>Set your store opening and closing times</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center gap-3 sm:w-36 shrink-0">
                        <Switch checked={!hours.closed} onCheckedChange={(checked) => setOperatingHours((prev) => ({ ...prev, [day]: { ...prev[day], closed: !checked } }))} className="data-[state=checked]:bg-emerald-600" />
                        <span className={`text-sm font-medium ${hours.closed ? 'text-gray-400 line-through' : 'dark:text-gray-200'}`}>{day}</span>
                      </div>
                      {!hours.closed ? (
                        <div className="flex items-center gap-2">
                          <Input type="time" value={hours.open} onChange={(e) => setOperatingHours((prev) => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))} className="w-32 text-sm dark:bg-gray-800 dark:border-gray-600" />
                          <span className="text-gray-400 text-sm">to</span>
                          <Input type="time" value={hours.close} onChange={(e) => setOperatingHours((prev) => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))} className="w-32 text-sm dark:bg-gray-800 dark:border-gray-600" />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Closed</span>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* ═══════════ TAX TAB ═══════════ */}
        <TabsContent value="tax">
          <motion.div key="tax-content" {...tabAnim}>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-600" />Tax Configuration</CardTitle>
                <CardDescription>Configure GST and tax rates for your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* GST Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium dark:text-gray-100">Enable GST</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Apply GST to all invoices</p>
                    </div>
                  </div>
                  <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
                </div>

                {gstEnabled && (
                  <>
                    {/* GST Rate with Presets */}
                    <div className="space-y-3">
                      <Label>GST Rate</Label>
                      <div className="flex flex-wrap gap-2">
                        {gstPresets.map((rate) => (
                          <button key={rate} onClick={() => { setTaxRate(rate); setCgstRate(Math.floor(rate / 2)); setSgstRate(Math.ceil(rate / 2)); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              taxRate === rate
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >{rate}%</button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="shrink-0 text-sm">Custom Rate:</Label>
                        <Input type="number" value={taxRate || ''} onChange={(e) => { const val = parseFloat(e.target.value) || 0; setTaxRate(val); setCgstRate(Math.floor(val / 2)); setSgstRate(Math.ceil(val / 2)); }} min={0} max={100} className="w-24 dark:bg-gray-900 dark:border-gray-600" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Tax Inclusive/Exclusive */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <p className="font-medium dark:text-gray-100">Tax Inclusive Pricing</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Prices include GST (vs. adding tax on top)</p>
                      </div>
                      <Switch checked={taxInclusive} onCheckedChange={setTaxInclusive} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>GSTIN</Label>
                        <Input value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="22AAAAA0000A1Z5" className="dark:bg-gray-900 dark:border-gray-600" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1"><Hash className="w-3 h-3" />HSN Code</Label>
                        <Input value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} placeholder="e.g. 9963" className="dark:bg-gray-900 dark:border-gray-600" />
                      </div>
                    </div>

                    <Separator />

                    {/* CGST/SGST Split */}
                    <div>
                      <p className="font-medium mb-3 dark:text-gray-100">CGST / SGST Split</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>CGST Rate (%)</Label>
                          <Input type="number" value={cgstRate} onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)} min={0} className="dark:bg-gray-900 dark:border-gray-600" />
                        </div>
                        <div className="space-y-2">
                          <Label>SGST Rate (%)</Label>
                          <Input type="number" value={sgstRate} onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)} min={0} className="dark:bg-gray-900 dark:border-gray-600" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total: {cgstRate + sgstRate}% (CGST {cgstRate}% + SGST {sgstRate}%)</p>
                    </div>

                    {/* CESS */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1"><DollarSign className="w-3 h-3" />CESS Percentage (%)</Label>
                      <Input type="number" value={cessRate} onChange={(e) => setCessRate(parseFloat(e.target.value) || 0)} min={0} max={100} className="max-w-xs dark:bg-gray-900 dark:border-gray-600" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Additional cess on specific goods (e.g., 5% on luxury items)</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════ RECEIPT TAB ═══════════ */}
        <TabsContent value="receipt">
          <motion.div key="receipt-content" {...tabAnim}>
            <div className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5 text-emerald-600" />Receipt Setup</CardTitle>
                  <CardDescription>Customize your printed and digital receipts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Receipt Header Text</Label>
                    <Textarea value={receiptHeader} onChange={(e) => setReceiptHeader(e.target.value)} placeholder="Welcome to our store!" className="min-h-[80px] dark:bg-gray-900 dark:border-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <Label>Receipt Footer Text</Label>
                    <Textarea value={receiptFooter} onChange={(e) => setReceiptFooter(e.target.value)} placeholder="Thank you! Visit again!" className="min-h-[80px] dark:bg-gray-900 dark:border-gray-600" />
                  </div>

                  {/* Toggle switches */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div><p className="font-medium dark:text-gray-100">Show Logo on Receipt</p><p className="text-sm text-gray-500 dark:text-gray-400">Display store logo at top</p></div>
                      <Switch checked={showLogoOnReceipt} onCheckedChange={setShowLogoOnReceipt} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div><p className="font-medium dark:text-gray-100">Show GSTIN</p><p className="text-sm text-gray-500 dark:text-gray-400">Display GSTIN on receipts</p></div>
                      <Switch checked={showGstinOnReceipt} onCheckedChange={setShowGstinOnReceipt} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div><p className="font-medium dark:text-gray-100">Show Customer Phone</p><p className="text-sm text-gray-500 dark:text-gray-400">Display customer phone number</p></div>
                      <Switch checked={showCustomerPhone} onCheckedChange={setShowCustomerPhone} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div><p className="font-medium dark:text-gray-100">Auto-Print on Payment</p><p className="text-sm text-gray-500 dark:text-gray-400">Print receipt automatically after payment</p></div>
                      <Switch checked={autoPrintOnPayment} onCheckedChange={setAutoPrintOnPayment} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Receipt Paper Size</Label>
                    <Select value={printerSize} onValueChange={setPrinterSize}>
                      <SelectTrigger className="dark:bg-gray-900 dark:border-gray-600"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="58mm">58mm (Small)</SelectItem>
                        <SelectItem value="80mm">80mm (Standard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Print Preview */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-emerald-600" />Receipt Preview</CardTitle>
                  <CardDescription>See how your receipt will look</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-900 max-w-xs mx-auto font-mono text-xs">
                    <div className="text-center space-y-1">
                      {showLogoOnReceipt && (
                        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-1">
                          <Store className="w-5 h-5 text-emerald-600" />
                        </div>
                      )}
                      {receiptHeader && <p className="font-medium">{receiptHeader}</p>}
                      <p className="font-bold text-base">{storeName || 'Store Name'}</p>
                      {address && <p className="text-gray-500 dark:text-gray-400">{address}</p>}
                      {storePhone && <p className="text-gray-500 dark:text-gray-400">Ph: {storePhone}</p>}
                      {showGstinOnReceipt && gstNumber && <p className="text-gray-400 dark:text-gray-500">GSTIN: {gstNumber}</p>}
                      <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />
                      <div className="text-left space-y-0.5">
                        <p>Receipt #001</p>
                        <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
                        {showCustomerPhone && <p>Customer: +91 9876543210</p>}
                      </div>
                      <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />
                      <div className="text-left space-y-0.5">
                        <p className="flex justify-between"><span>Butter Chicken × 2</span><span>₹640</span></p>
                        <p className="flex justify-between"><span>Naan × 4</span><span>₹200</span></p>
                        <p className="flex justify-between"><span>Dal Makhani × 1</span><span>₹220</span></p>
                      </div>
                      <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />
                      <div className="text-left space-y-0.5">
                        <p className="flex justify-between"><span>Subtotal</span><span>₹1,060</span></p>
                        <p className="flex justify-between"><span>CGST {cgstRate}%</span><span>₹{Math.round(1060 * cgstRate / 100)}</span></p>
                        <p className="flex justify-between"><span>SGST {sgstRate}%</span><span>₹{Math.round(1060 * sgstRate / 100)}</span></p>
                        {cessRate > 0 && <p className="flex justify-between"><span>CESS {cessRate}%</span><span>₹{Math.round(1060 * cessRate / 100)}</span></p>}
                      </div>
                      <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />
                      <p className="flex justify-between font-bold text-sm"><span>TOTAL</span><span className="text-emerald-600">₹{1060 + Math.round(1060 * cgstRate / 100) + Math.round(1060 * sgstRate / 100) + Math.round(1060 * cessRate / 100)}</span></p>
                      <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-2" />
                      {receiptFooter && <p className="text-gray-500 dark:text-gray-400">{receiptFooter}</p>}
                      <p className="text-[10px] text-gray-400">Powered by StoreOS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* ═══════════ PAYMENT TAB ═══════════ */}
        <TabsContent value="payment">
          <motion.div key="payment-content" {...tabAnim}>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-600" />Payment Methods</CardTitle>
                <CardDescription>Enable or disable payment options at checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cash */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center"><Banknote className="w-5 h-5 text-emerald-600" /></div>
                    <div><p className="font-medium dark:text-gray-100">Cash</p><p className="text-sm text-gray-500 dark:text-gray-400">Accept cash payments</p></div>
                  </div>
                  <Switch checked={cashEnabled} onCheckedChange={setCashEnabled} />
                </div>

                {/* UPI */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center"><Smartphone className="w-5 h-5 text-violet-600" /></div>
                    <div><p className="font-medium dark:text-gray-100">UPI</p><p className="text-sm text-gray-500 dark:text-gray-400">Accept UPI payments</p></div>
                  </div>
                  <Switch checked={upiEnabled} onCheckedChange={setUpiEnabled} />
                </div>
                {upiEnabled && (
                  <div className="ml-14 space-y-2 pl-2">
                    <Label>UPI ID</Label>
                    <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="max-w-xs dark:bg-gray-900 dark:border-gray-600" />
                  </div>
                )}

                {/* Card */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center"><CreditCard className="w-5 h-5 text-sky-600" /></div>
                    <div><p className="font-medium dark:text-gray-100">Card</p><p className="text-sm text-gray-500 dark:text-gray-400">Accept card payments</p></div>
                  </div>
                  <Switch checked={cardEnabled} onCheckedChange={setCardEnabled} />
                </div>
                {cardEnabled && (
                  <div className="ml-14 space-y-3 pl-2">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="HDFC Bank" className="max-w-xs dark:bg-gray-900 dark:border-gray-600" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 max-w-lg">
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="XXXX XXXX XXXX" className="dark:bg-gray-900 dark:border-gray-600" />
                      </div>
                      <div className="space-y-2">
                        <Label>IFSC Code</Label>
                        <Input value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} placeholder="HDFC0001234" className="dark:bg-gray-900 dark:border-gray-600" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Split */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center"><SplitSquareHorizontal className="w-5 h-5 text-amber-600" /></div>
                    <div><p className="font-medium dark:text-gray-100">Split Payment</p><p className="text-sm text-gray-500 dark:text-gray-400">Allow splitting across methods</p></div>
                  </div>
                  <Switch checked={splitEnabled} onCheckedChange={setSplitEnabled} />
                </div>

                <Separator />

                {/* Razorpay Key */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" />Razorpay Key (Mock)</Label>
                  <Input value={razorpayKey} onChange={(e) => setRazorpayKey(e.target.value)} placeholder="rzp_test_xxxxxxxxxxxx" className="max-w-md dark:bg-gray-900 dark:border-gray-600" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enter your Razorpay API key for online payments</p>
                </div>

                <Separator />

                {/* Default Payment Method */}
                <div className="space-y-2">
                  <Label>Default Payment Method</Label>
                  <Select value={defaultPayment} onValueChange={setDefaultPayment}>
                    <SelectTrigger className="max-w-xs dark:bg-gray-900 dark:border-gray-600"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {cashEnabled && <SelectItem value="cash">Cash</SelectItem>}
                      {upiEnabled && <SelectItem value="upi">UPI</SelectItem>}
                      {cardEnabled && <SelectItem value="card">Card</SelectItem>}
                      {splitEnabled && <SelectItem value="split">Split</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════ BRANDING TAB ═══════════ */}
        <TabsContent value="branding">
          <motion.div key="branding-content" {...tabAnim}>
            <div className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-emerald-600" />Branding & Theme</CardTitle>
                  <CardDescription>Customize your store appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Preset Accent Colors */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Store Accent Color</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {brandingPresets.map((preset) => (
                        <button key={preset.name} onClick={() => { setPrimaryColor(preset.primary); setAccentColor(preset.accent); toast.success(`${preset.name} theme applied`); }}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            primaryColor === preset.primary ? 'border-gray-900 dark:border-white shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <div className="flex gap-1 justify-center mb-2">
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.accent }} />
                          </div>
                          <span className="text-xs font-medium dark:text-gray-300">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Custom Color Picker */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Primary Color</Label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer" />
                        <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="max-w-[140px] dark:bg-gray-900 dark:border-gray-600" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Accent Color</Label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer" />
                        <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="max-w-[140px] dark:bg-gray-900 dark:border-gray-600" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Sidebar Style */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Sidebar Style</Label>
                    <div className="grid grid-cols-2 gap-3 max-w-md">
                      <button onClick={() => setSidebarStyle('standard')}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          sidebarStyle === 'standard' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <LayoutList className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm font-medium dark:text-gray-200">Standard</span>
                      </button>
                      <button onClick={() => setSidebarStyle('compact')}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          sidebarStyle === 'compact' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <LayoutGrid className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm font-medium dark:text-gray-200">Compact</span>
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {/* Font Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block flex items-center gap-2"><Type className="w-4 h-4" />Receipt Font Style</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'classic' as const, name: 'Classic', fontClass: 'font-serif' },
                        { id: 'modern' as const, name: 'Modern', fontClass: 'font-sans' },
                        { id: 'minimal' as const, name: 'Minimal', fontClass: 'font-mono' },
                      ].map((font) => (
                        <button key={font.id} onClick={() => { setSelectedFont(font.id); toast.success(`${font.name} font selected`); }}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedFont === font.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <p className={`text-lg font-medium ${font.fontClass} dark:text-gray-200`}>{font.name}</p>
                          {selectedFont === font.id && <Check className="w-4 h-4 text-emerald-600 mt-1" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Custom CSS */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                      <Code className="w-4 h-4" />Custom CSS <Badge variant="secondary" className="text-[10px]">Advanced</Badge>
                    </Label>
                    <Textarea value={customCSS} onChange={(e) => setCustomCSS(e.target.value)} placeholder={`/* Custom styles */\n.receipt-header {\n  font-size: 18px;\n}`} className="min-h-[120px] font-mono text-sm dark:bg-gray-900 dark:border-gray-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Live Preview */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-emerald-600" />Brand Preview</CardTitle>
                  <CardDescription>See how your brand colors look</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-xs mx-auto rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="p-3 text-center text-white" style={{ backgroundColor: primaryColor }}>
                      <p className={`text-sm font-bold ${selectedFont === 'classic' ? 'font-serif' : selectedFont === 'minimal' ? 'font-mono' : 'font-sans'}`}>
                        {storeName || 'Store Name'}
                      </p>
                      <p className="text-[10px] opacity-80">Tax Invoice</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-900 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Invoice #INV-001</span><span>{new Date().toLocaleDateString('en-IN')}</span>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <div className="flex justify-between dark:text-gray-300"><span>Butter Chicken × 2</span><span>₹640</span></div>
                        <div className="flex justify-between dark:text-gray-300"><span>Naan × 4</span><span>₹200</span></div>
                        <div className="flex justify-between dark:text-gray-300"><span>Dal Makhani × 1</span><span>₹220</span></div>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-sm dark:text-gray-100">
                        <span>Total</span><span style={{ color: primaryColor }}>₹1,113</span>
                      </div>
                      <div className="h-1 rounded-full mt-2" style={{ backgroundColor: accentColor }} />
                      <p className="text-center text-[10px] text-gray-400 mt-1">Thank you! Visit again! 🙏</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* ═══════════ SUBSCRIPTION TAB ═══════════ */}
        <TabsContent value="subscription">
          <motion.div key="subscription-content" {...tabAnim}>
            <div className="space-y-6">
              <Card className="relative overflow-hidden border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10 dark:bg-gray-800">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 pointer-events-none" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-emerald-600" />Current Plan</CardTitle>
                  <CardDescription>Your active subscription details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg dark:text-gray-100">{subscription?.plan === 'pro' ? 'Pro Plan' : 'Starter Plan'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {subscription?.status === 'trial' ? `Trial expires ${subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString('en-IN') : 'soon'}` : subscription?.status === 'active' ? 'Your subscription is active' : 'Subscription inactive'}
                      </p>
                    </div>
                    <Badge className={
                      subscription?.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
                        : subscription?.status === 'trial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0'
                    }>{subscription?.status || 'trial'}</Badge>
                  </div>

                  {/* Usage Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center bg-white dark:bg-gray-900">
                      <TrendingUp className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Orders This Month</p>
                      <p className="text-xl font-bold dark:text-gray-100">47</p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center bg-white dark:bg-gray-900">
                      <Package className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Products</p>
                      <p className="text-xl font-bold dark:text-gray-100">25</p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center bg-white dark:bg-gray-900">
                      <HardDrive className="w-4 h-4 text-violet-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Storage</p>
                      <p className="text-xl font-bold dark:text-gray-100">2.4 MB</p>
                    </div>
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center bg-white dark:bg-gray-900">
                      <Users className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Staff</p>
                      <p className="text-xl font-bold dark:text-gray-100">3</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                      <p className="text-2xl font-bold mt-1 dark:text-gray-100">{subscription?.plan === 'pro' ? '₹499/mo' : '₹99/mo'}</p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                      <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-gray-500" /><p className="text-sm text-gray-500 dark:text-gray-400">Next Billing</p></div>
                      <p className="text-2xl font-bold mt-1 dark:text-gray-100">{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="font-medium text-sm mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600" />Your Plan Includes</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {(subscription?.plan === 'pro' ? ['Unlimited products', 'Full POS billing system', 'Unlimited staff accounts', 'Customer CRM & loyalty', 'GST-ready invoices & reports', 'WhatsApp bill sharing'] : ['Up to 50 products', 'Basic POS billing', '5 staff accounts', 'Dashboard analytics']).map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span className="text-gray-700 dark:text-gray-300">{f}</span></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5 text-emerald-600" />Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                          <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Invoice</th>
                          <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Plan</th>
                          <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                          <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                          <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: 'INV-003', plan: 'Starter', date: 'Mar 1, 2025', amount: '₹99', status: 'Paid' },
                          { id: 'INV-002', plan: 'Starter', date: 'Feb 1, 2025', amount: '₹99', status: 'Paid' },
                          { id: 'INV-001', plan: 'Starter', date: 'Jan 1, 2025', amount: '₹99', status: 'Paid' },
                        ].map((inv, i) => (
                          <tr key={inv.id} className={`border-b border-gray-100 dark:border-gray-700 ${i % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}>
                            <td className="p-3 font-medium dark:text-gray-200">{inv.id}</td>
                            <td className="p-3 dark:text-gray-300">{inv.plan}</td>
                            <td className="p-3 text-gray-500 dark:text-gray-400">{inv.date}</td>
                            <td className="p-3 font-medium dark:text-gray-200">{inv.amount}</td>
                            <td className="p-3"><Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">{inv.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => setUpgradeDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1">
                  <Crown className="w-4 h-4 mr-2" />Upgrade Plan
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-gray-700">Cancel Subscription</Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* ═══════════ WHATSAPP TAB ═══════════ */}
        <TabsContent value="whatsapp">
          <motion.div key="whatsapp-content" {...tabAnim}>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-600" />WhatsApp Integration</CardTitle>
                <CardDescription>Send bills and updates via WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">WhatsApp Business API</p>
                      <p className="text-sm text-green-600 dark:text-green-500 mt-1">Connect your WhatsApp Business account to send automated bills, reminders, and updates.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>WhatsApp Business Number</Label>
                  <div className="relative max-w-md">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+91 9876543210" className="pl-9 dark:bg-gray-900 dark:border-gray-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div><p className="font-medium dark:text-gray-100">Auto-Send Receipt</p><p className="text-sm text-gray-500 dark:text-gray-400">Automatically send receipt after payment</p></div>
                  <Switch checked={whatsappAutoSend} onCheckedChange={setWhatsappAutoSend} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="font-medium">Order Confirmation Template</Label>
                  <Textarea value={whatsappOrderTemplate} onChange={(e) => setWhatsappOrderTemplate(e.target.value)} className="min-h-[80px] dark:bg-gray-900 dark:border-gray-600" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Available variables: {'{customer}'}, {'{orderId}'}, {'{total}'}</p>
                </div>

                <div className="space-y-3">
                  <Label className="font-medium">Delivery Update Template</Label>
                  <Textarea value={whatsappDeliveryTemplate} onChange={(e) => setWhatsappDeliveryTemplate(e.target.value)} className="min-h-[80px] dark:bg-gray-900 dark:border-gray-600" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Available variables: {'{customer}'}, {'{orderId}'}, {'{time}'}</p>
                </div>

                <Button onClick={() => toast.success('Test message sent! 📱', { description: `Message sent to ${whatsappNumber || '+91 XXXXXXXXXX'}` })} variant="outline" className="w-full sm:w-auto">
                  <Send className="w-4 h-4 mr-2" />Send Test Message
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════ LANGUAGE TAB ═══════════ */}
        <TabsContent value="language">
          <motion.div key="language-content" {...tabAnim}>
            <LanguageTab />
          </motion.div>
        </TabsContent>

        {/* ═══════════ DATA TAB ═══════════ */}
        <TabsContent value="data">
          <motion.div key="data-content" {...tabAnim}>
            <div className="space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-emerald-600" />Data Management</CardTitle>
                  <CardDescription>Export, import, and manage your store data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-emerald-600" />
                      <div><p className="font-medium dark:text-gray-100">Export All Data</p><p className="text-sm text-gray-500 dark:text-gray-400">Download all store data as JSON</p></div>
                    </div>
                    <Button onClick={handleExportData} variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-sky-600" />
                      <div><p className="font-medium dark:text-gray-100">Import Data</p><p className="text-sm text-gray-500 dark:text-gray-400">Import data from JSON file</p></div>
                    </div>
                    <Button onClick={() => setImportDialogOpen(true)} variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" />Import</Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-red-600" />
                      <div><p className="font-medium text-red-700 dark:text-red-400">Clear All Data</p><p className="text-sm text-red-600 dark:text-red-500">Delete all products, orders, and customers</p></div>
                    </div>
                    <Button onClick={() => setResetDialogOpen(true)} variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Clear Data</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Database Info */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><HardDrive className="w-5 h-5 text-emerald-600" />Database Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"><HardDrive className="w-4 h-4" />Database Size</p>
                      <p className="text-2xl font-bold mt-1 dark:text-gray-100">4.2 MB</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"><Clock className="w-4 h-4" />Last Backup</p>
                      <p className="text-2xl font-bold mt-1 dark:text-gray-100">
                        {lastBackupDate ? new Date(lastBackupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never'}
                      </p>
                    </div>
                  </div>

                  <Button onClick={async () => { setBackingUp(true); await new Promise((r) => setTimeout(r, 1500)); setLastBackupDate(new Date().toISOString()); setBackingUp(false); toast.success('Backup completed successfully'); }} disabled={backingUp} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                    {backingUp ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Archive className="w-4 h-4 mr-2" />}
                    {backingUp ? 'Backing up...' : 'Backup Now'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ═══════════ DIALOGS ═══════════ */}

      {/* Reset Confirmation Dialog with DELETE typing */}
      <Dialog open={resetDialogOpen} onOpenChange={(open) => { setResetDialogOpen(open); if (!open) setDeleteConfirmText(''); }}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" />Clear All Data</DialogTitle>
            <DialogDescription className="dark:text-gray-400">This will delete all your data. Type <strong>DELETE</strong> to confirm.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder='Type "DELETE" to confirm' className="dark:bg-gray-900 dark:border-gray-600" />
            {deleteConfirmText && deleteConfirmText !== 'DELETE' && (
              <p className="text-sm text-red-500">Please type DELETE exactly to confirm</p>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setResetDialogOpen(false); setDeleteConfirmText(''); }} className="dark:border-gray-600">Cancel</Button>
            <Button variant="destructive" onClick={handleResetData} disabled={deleteConfirmText !== 'DELETE'}>
              <Trash2 className="w-4 h-4 mr-2" />Clear All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Import Data</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Upload a JSON file exported from StoreOS to restore your data.</DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop a JSON file here, or click to browse</p>
            <Button variant="outline" size="sm" className="mt-4 dark:border-gray-600">Choose File</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)} className="dark:border-gray-600">Cancel</Button>
            <Button onClick={() => { toast.info('Import feature coming soon'); setImportDialogOpen(false); }}><Upload className="w-4 h-4 mr-2" />Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-gray-100"><Crown className="w-5 h-5 text-emerald-600" />Upgrade Plan</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Choose the plan that fits your business</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {/* Starter */}
            <div className={`p-4 rounded-lg border-2 transition-all ${subscription?.plan !== 'pro' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex justify-between items-center">
                <div><p className="font-bold dark:text-gray-100">Starter</p><p className="text-sm text-gray-500 dark:text-gray-400">Up to 50 products, basic POS</p></div>
                <p className="text-xl font-bold dark:text-gray-100">₹99<span className="text-sm font-normal text-gray-500">/mo</span></p>
              </div>
              {subscription?.plan !== 'pro' && <Badge className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Current</Badge>}
            </div>
            {/* Pro */}
            <div className={`p-4 rounded-lg border-2 transition-all ${subscription?.plan === 'pro' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex justify-between items-center">
                <div><p className="font-bold dark:text-gray-100">Pro</p><p className="text-sm text-gray-500 dark:text-gray-400">Unlimited products, full POS, WhatsApp</p></div>
                <p className="text-xl font-bold dark:text-gray-100">₹499<span className="text-sm font-normal text-gray-500">/mo</span></p>
              </div>
              {subscription?.plan === 'pro' ? (
                <Badge className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Current</Badge>
              ) : (
                <Button size="sm" className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { toast.success('Upgrade request submitted! 🚀'); setUpgradeDialogOpen(false); }}>Upgrade to Pro</Button>
              )}
            </div>
            {/* Enterprise */}
            <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div><p className="font-bold dark:text-gray-100">Enterprise</p><p className="text-sm text-gray-500 dark:text-gray-400">Multi-store, API access, priority support</p></div>
                <p className="text-xl font-bold dark:text-gray-100">₹1,999<span className="text-sm font-normal text-gray-500">/mo</span></p>
              </div>
              <Button size="sm" variant="outline" className="mt-2 dark:border-gray-600" onClick={() => { toast.info('Contact sales for Enterprise plan'); setUpgradeDialogOpen(false); }}>Contact Sales</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)} className="dark:border-gray-600">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
