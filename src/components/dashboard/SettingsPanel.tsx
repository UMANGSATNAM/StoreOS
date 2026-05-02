'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

interface StoreSettings {
  id: string;
  name: string;
  ownerName: string;
  address?: string;
  city?: string;
  state?: string;
  gstNumber?: string;
  phone?: string;
  email?: string;
  logo?: string;
  taxRate: number;
  currency: string;
  receiptHeader?: string;
  receiptFooter?: string;
  niche: string;
}

export default function SettingsPanel() {
  const { store, user, setStore, subscription } = useAppStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Receipt
  const [receiptHeader, setReceiptHeader] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [showLogoOnReceipt, setShowLogoOnReceipt] = useState(true);
  const [printerSize, setPrinterSize] = useState('80mm');

  // Payment methods
  const [cashEnabled, setCashEnabled] = useState(true);
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [upiId, setUpiId] = useState('');

  // Branding
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [accentColor, setAccentColor] = useState('#059669');

  // Data management
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Load store data
  useEffect(() => {
    if (store) {
      setStoreName(store.name || '');
      setOwnerName(store.ownerName || '');
      setGstNumber(store.gstNumber || '');
      setGstin(store.gstNumber || '');
    }
  }, [store]);

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
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStoreDetails();
  }, [fetchStoreDetails]);

  const handleSave = async () => {
    if (!store?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/store/${store.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeName,
          ownerName,
          address,
          city,
          state,
          gstNumber,
          phone: storePhone,
          email: storeEmail,
          logo,
          taxRate,
          receiptHeader,
          receiptFooter,
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
        });
        toast.success('Settings saved successfully');
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

      const exportData: Record<string, unknown> = { exportDate: new Date().toISOString() };

      if (productsRes.ok) {
        const data = await productsRes.json();
        exportData.products = Array.isArray(data) ? data : data.products || [];
      }
      if (customersRes.ok) {
        const data = await customersRes.json();
        exportData.customers = Array.isArray(data) ? data : data.customers || [];
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        exportData.orders = Array.isArray(data) ? data : data.orders || [];
      }
      if (tablesRes.ok) {
        const data = await tablesRes.json();
        exportData.tables = data.tables || [];
      }

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
    toast.success('Store data has been reset (demo mode)');
    setResetDialogOpen(false);
  };

  const handleTestWhatsApp = () => {
    toast.success('Test message sent! (placeholder)');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your store configuration and preferences
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="w-full flex h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
            <TabsTrigger value="profile" className="flex-1 min-w-fit text-xs sm:text-sm">
              <Store className="w-3.5 h-3.5 mr-1.5" />
              Store Profile
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex-1 min-w-fit text-xs sm:text-sm">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Tax
            </TabsTrigger>
            <TabsTrigger value="receipt" className="flex-1 min-w-fit text-xs sm:text-sm">
              <Receipt className="w-3.5 h-3.5 mr-1.5" />
              Receipt
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex-1 min-w-fit text-xs sm:text-sm">
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex-1 min-w-fit text-xs sm:text-sm">
              <Palette className="w-3.5 h-3.5 mr-1.5" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex-1 min-w-fit text-xs sm:text-sm">
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              Plan
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex-1 min-w-fit text-xs sm:text-sm">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="data" className="flex-1 min-w-fit text-xs sm:text-sm">
              <Database className="w-3.5 h-3.5 mr-1.5" />
              Data
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Store Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Store Profile</CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="pl-9" placeholder="My Store" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="pl-9" placeholder="Owner Name" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="pl-9 min-h-[80px]" placeholder="Store address" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="gst" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="pl-9" placeholder="22AAAAA0000A1Z5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="logo" value={logo} onChange={(e) => setLogo(e.target.value)} className="pl-9" placeholder="https://..." />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="phone" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} className="pl-9" placeholder="9876543210" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="email" type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} className="pl-9" placeholder="store@example.com" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Configuration */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>Configure GST and tax rates for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">Enable GST</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Apply GST to all invoices</p>
                  </div>
                </div>
                <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} />
              </div>

              {gstEnabled && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={taxRate}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setTaxRate(val);
                          setCgstRate(Math.floor(val / 2));
                          setSgstRate(Math.ceil(val / 2));
                        }}
                        min={0}
                        max={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GSTIN</Label>
                      <Input
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-3">CGST / SGST Split</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>CGST Rate (%)</Label>
                        <Input
                          type="number"
                          value={cgstRate}
                          onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)}
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SGST Rate (%)</Label>
                        <Input
                          type="number"
                          value={sgstRate}
                          onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)}
                          min={0}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Total: {cgstRate + sgstRate}% (CGST {cgstRate}% + SGST {sgstRate}%)
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Setup */}
        <TabsContent value="receipt">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Setup</CardTitle>
              <CardDescription>Customize your printed and digital receipts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Receipt Header Text</Label>
                <Textarea
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  placeholder="Welcome to our store!"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Receipt Footer Text</Label>
                <Textarea
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  placeholder="Thank you! Visit again!"
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Show Logo on Receipt</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Display store logo at top of receipt</p>
                </div>
                <Switch checked={showLogoOnReceipt} onCheckedChange={setShowLogoOnReceipt} />
              </div>

              <div className="space-y-2">
                <Label>Thermal Printer Size</Label>
                <Select value={printerSize} onValueChange={setPrinterSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58mm">58mm (Small)</SelectItem>
                    <SelectItem value="80mm">80mm (Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Receipt Preview */}
              <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-900 max-w-xs mx-auto">
                <div className="text-center space-y-2">
                  {showLogoOnReceipt && logo && (
                    <div className="w-12 h-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
                  )}
                  {receiptHeader && (
                    <p className="text-sm font-medium">{receiptHeader}</p>
                  )}
                  <p className="font-bold text-lg">{storeName || 'Store Name'}</p>
                  {address && <p className="text-xs text-gray-500">{address}</p>}
                  {storePhone && <p className="text-xs text-gray-500">Ph: {storePhone}</p>}
                  <Separator />
                  <div className="text-xs text-left space-y-1">
                    <p>Item 1 × 2 &nbsp;&nbsp;&nbsp; ₹200</p>
                    <p>Item 2 × 1 &nbsp;&nbsp;&nbsp; ₹150</p>
                  </div>
                  <Separator />
                  <p className="text-sm font-bold">Total: ₹350</p>
                  <Separator />
                  {receiptFooter && (
                    <p className="text-xs text-gray-500">{receiptFooter}</p>
                  )}
                  <p className="text-[10px] text-gray-400">Powered by StoreOS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Enable or disable payment options at checkout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💵</span>
                  </div>
                  <div>
                    <p className="font-medium">Cash</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Accept cash payments</p>
                  </div>
                </div>
                <Switch checked={cashEnabled} onCheckedChange={setCashEnabled} />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📱</span>
                  </div>
                  <div>
                    <p className="font-medium">UPI</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Accept UPI payments</p>
                  </div>
                </div>
                <Switch checked={upiEnabled} onCheckedChange={setUpiEnabled} />
              </div>

              {upiEnabled && (
                <div className="ml-13 space-y-2 pl-14">
                  <Label>UPI ID</Label>
                  <Input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💳</span>
                  </div>
                  <div>
                    <p className="font-medium">Card</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Accept card payments</p>
                  </div>
                </div>
                <Switch checked={cardEnabled} onCheckedChange={setCardEnabled} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Theme</CardTitle>
              <CardDescription>Customize your store appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                      placeholder="#10b981"
                    />
                  </div>
                  <div className="w-full h-16 rounded-lg" style={{ backgroundColor: primaryColor }} />
                </div>

                <div className="space-y-3">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
                    />
                  </div>
                  <div className="w-full h-16 rounded-lg" style={{ backgroundColor: accentColor }} />
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-3">Quick Themes</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'Emerald', primary: '#10b981', accent: '#059669' },
                    { name: 'Orange', primary: '#f97316', accent: '#ea580c' },
                    { name: 'Violet', primary: '#8b5cf6', accent: '#7c3aed' },
                    { name: 'Sky', primary: '#0ea5e9', accent: '#0284c7' },
                    { name: 'Rose', primary: '#f43f5e', accent: '#e11d48' },
                    { name: 'Amber', primary: '#f59e0b', accent: '#d97706' },
                    { name: 'Slate', primary: '#64748b', accent: '#475569' },
                    { name: 'Lime', primary: '#84cc16', accent: '#65a30d' },
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => {
                        setPrimaryColor(theme.primary);
                        setAccentColor(theme.accent);
                        toast.success(`${theme.name} theme applied`);
                      }}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-center"
                    >
                      <div className="flex gap-1 justify-center mb-2">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primary }} />
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.accent }} />
                      </div>
                      <span className="text-xs font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>Manage your plan and billing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg">{subscription?.plan === 'pro' ? 'Pro Plan' : 'Starter Plan'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subscription?.status === 'trial'
                      ? `Trial expires ${subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString('en-IN') : 'soon'}`
                      : subscription?.status === 'active'
                        ? 'Your subscription is active'
                        : 'Subscription inactive'}
                  </p>
                </div>
                <Badge className={
                  subscription?.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0'
                    : subscription?.status === 'trial'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0'
                }>
                  {subscription?.status || 'trial'}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                  <p className="text-2xl font-bold mt-1">{subscription?.plan === 'pro' ? '₹499/mo' : '₹99/mo'}</p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Billing Cycle</p>
                  <p className="text-2xl font-bold mt-1">Monthly</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Billing History</p>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="text-sm font-medium">Starter Plan</p>
                      <p className="text-xs text-gray-500">Mar 1, 2025</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Paid</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium">Starter Plan</p>
                      <p className="text-xs text-gray-500">Feb 1, 2025</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">Paid</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Integration */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Integration</CardTitle>
              <CardDescription>Send bills and updates via WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">WhatsApp Business API</p>
                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                      Connect your WhatsApp Business account to send automated bills, reminders, and updates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter your WhatsApp API key"
                  className="max-w-md"
                />
                <p className="text-xs text-gray-500">Get your API key from WhatsApp Business Manager</p>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-3">Template Messages</p>
                <div className="space-y-3">
                  {[
                    { name: 'Bill Receipt', desc: 'Sent after successful payment' },
                    { name: 'Payment Reminder', desc: 'Sent for pending payments' },
                    { name: 'Order Update', desc: 'Sent when order status changes' },
                  ].map((template) => (
                    <div key={template.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{template.desc}</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleTestWhatsApp} variant="outline" className="w-full sm:w-auto">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Test Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export, import, and manage your store data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">Export All Data</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Download all store data as JSON</p>
                  </div>
                </div>
                <Button onClick={handleExportData} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-sky-600" />
                  <div>
                    <p className="font-medium">Import Data</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Import data from JSON file</p>
                  </div>
                </div>
                <Button onClick={() => setImportDialogOpen(true)} variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">Reset Store Data</p>
                    <p className="text-sm text-red-600 dark:text-red-500">Delete all products, orders, and customers</p>
                  </div>
                </div>
                <Button onClick={() => setResetDialogOpen(true)} variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Reset Store Data
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All products, orders, customers, and related data will be permanently deleted. Your store settings will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetData}>
              <Trash2 className="w-4 h-4 mr-2" />
              Reset All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Upload a JSON file exported from StoreOS to restore your data.
            </DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop a JSON file here, or click to browse
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              Choose File
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.info('Import feature coming soon'); setImportDialogOpen(false); }}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
