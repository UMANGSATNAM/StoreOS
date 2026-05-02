'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Store,
  User,
  MapPin,
  FileText,
  Camera,
  Phone,
  Upload,
  Rocket,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getNicheBySlug, getTemplateById, type NicheSlug } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const STEPS = ['Choose Business Type', 'Select Template', 'Setup Store'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

interface FormData {
  storeName: string;
  ownerName: string;
  city: string;
  state: string;
  gstNumber: string;
  phone: string;
  logo: File | null;
}

export default function StoreSetup() {
  const {
    onboardingNiche,
    onboardingTemplate,
    user,
    setCurrentView,
    setStore,
  } = useAppStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    storeName: '',
    ownerName: user?.name || '',
    city: '',
    state: '',
    gstNumber: '',
    phone: '',
    logo: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const nicheData = getNicheBySlug((onboardingNiche || 'restaurant') as NicheSlug);
  const templateData = onboardingTemplate ? getTemplateById(onboardingTemplate) : null;

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData((prev) => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.storeName.trim()) newErrors.storeName = 'Store name is required';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    if (formData.gstNumber && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstNumber.trim())) {
      newErrors.gstNumber = 'Enter a valid GST number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        userId: user?.id || 'demo-user',
        name: formData.storeName,
        ownerName: formData.ownerName,
        niche: onboardingNiche || 'restaurant',
        template: onboardingTemplate || 'default',
        city: formData.city,
        state: formData.state,
        gstNumber: formData.gstNumber || undefined,
        phone: formData.phone || undefined,
      };

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create store');
      }

      const { store: createdStore } = await res.json();

      setStore({
        id: createdStore.id,
        name: createdStore.name,
        niche: createdStore.niche,
        template: createdStore.template || onboardingTemplate || 'default',
        onboardingComplete: createdStore.onboardingComplete,
        taxRate: createdStore.taxRate,
        ownerName: createdStore.ownerName,
        city: createdStore.city,
        state: createdStore.state,
        phone: createdStore.phone,
        address: createdStore.address,
        gstNumber: createdStore.gstNumber,
      });

      toast.success('Welcome to StoreOS! Your POS is ready.', {
        description: `${formData.storeName} has been set up successfully.`,
      });

      setCurrentView({ page: 'dashboard' });
    } catch (error) {
      toast.error('Something went wrong', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentView({ page: 'onboarding-template' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Progress Section */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-700">Step 3 of 3</span>
            <span className="text-sm text-muted-foreground">Setup Store</span>
          </div>
          <Progress value={100} className="h-2 bg-emerald-100" />
          <div className="flex items-center justify-between mt-3">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < 2
                      ? 'bg-emerald-200 text-emerald-700'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {i < 2 ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span
                  className={`text-xs hidden sm:inline ${
                    i === 2
                      ? 'text-emerald-700 font-semibold'
                      : 'text-emerald-600'
                  }`}
                >
                  {step}
                </span>
                {i < 2 && (
                  <div className="hidden sm:block w-8 lg:w-16 h-px bg-gray-200 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{nicheData?.icon}</span>
            <Badge variant="secondary" className="text-xs">{nicheData?.name}</Badge>
            {templateData && (
              <Badge variant="outline" className="text-xs">{templateData.name}</Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Set up your store
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Almost there! Just a few details to personalize your POS.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-lg"
        >
          <Card className="p-6 border-2 border-gray-200">
            <div className="space-y-5">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="storeName" className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600" />
                  Store Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="storeName"
                  placeholder="e.g. Sharma's Kitchen"
                  value={formData.storeName}
                  onChange={(e) => updateField('storeName', e.target.value)}
                  className={errors.storeName ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {errors.storeName && (
                  <p className="text-xs text-red-500">{errors.storeName}</p>
                )}
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Owner Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ownerName"
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.ownerName}
                  onChange={(e) => updateField('ownerName', e.target.value)}
                  className={errors.ownerName ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {errors.ownerName && (
                  <p className="text-xs text-red-500">{errors.ownerName}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className={errors.city ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {errors.city && (
                  <p className="text-xs text-red-500">{errors.city}</p>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  State <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateField('state', value)}
                >
                  <SelectTrigger
                    id="state"
                    className={errors.state ? 'border-red-400' : ''}
                  >
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-xs text-red-500">{errors.state}</p>
                )}
              </div>

              {/* GST Number */}
              <div className="space-y-2">
                <Label htmlFor="gstNumber" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  GST Number
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Optional</Badge>
                </Label>
                <Input
                  id="gstNumber"
                  placeholder="e.g. 27AABCU9603R1ZM"
                  value={formData.gstNumber}
                  onChange={(e) => updateField('gstNumber', e.target.value)}
                  className={errors.gstNumber ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {errors.gstNumber && (
                  <p className="text-xs text-red-500">{errors.gstNumber}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={errors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Store Logo */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Store Logo
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Optional</Badge>
                </Label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                >
                  {logoPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={logoPreview}
                        alt="Store logo preview"
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <p className="text-xs text-gray-500">Click or drag to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Drag & drop your logo here
                      </p>
                      <p className="text-xs text-gray-400">or click to browse</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-bold gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up your store...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Launch My POS 🚀
                </>
              )}
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-t">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <p className="text-xs text-gray-400">
            Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
