'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  GitCompare,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { NICHES, type NicheSlug } from '@/lib/types';
import { useAppStore } from '@/lib/store';

const STEPS = ['Choose Business Type', 'Select Template', 'Setup Store'];

// Sample products per niche for preview
const NICHE_SAMPLE_PRODUCTS: Record<string, Array<{ name: string; price: number }>> = {
  restaurant: [
    { name: 'Butter Chicken', price: 320 },
    { name: 'Paneer Tikka', price: 250 },
    { name: 'Dal Makhani', price: 220 },
    { name: 'Naan Basket', price: 80 },
  ],
  clothing: [
    { name: 'Silk Kurta', price: 1499 },
    { name: 'Denim Jeans', price: 999 },
    { name: 'Cotton Saree', price: 2500 },
    { name: 'Linen Shirt', price: 799 },
  ],
  pharmacy: [
    { name: 'Paracetamol 500mg', price: 35 },
    { name: 'Cough Syrup', price: 120 },
    { name: 'Vitamin C Tabs', price: 180 },
    { name: 'Antacid Gel', price: 85 },
  ],
  salon: [
    { name: 'Haircut & Style', price: 300 },
    { name: 'Facial Classic', price: 800 },
    { name: 'Hair Color', price: 1500 },
    { name: 'Manicure', price: 400 },
  ],
  grocery: [
    { name: 'Basmati Rice 5kg', price: 450 },
    { name: 'Toor Dal 1kg', price: 120 },
    { name: 'Mustard Oil 1L', price: 180 },
    { name: 'Atta 10kg', price: 380 },
  ],
  electronics: [
    { name: 'Phone Case', price: 299 },
    { name: 'USB-C Cable', price: 199 },
    { name: 'Screen Guard', price: 149 },
    { name: 'Earbuds', price: 1299 },
  ],
  coaching: [
    { name: 'Math Tuition', price: 2000 },
    { name: 'Science Lab', price: 1500 },
    { name: 'English Course', price: 1800 },
    { name: 'Test Series', price: 500 },
  ],
  clinic: [
    { name: 'Consultation', price: 500 },
    { name: 'Blood Test', price: 350 },
    { name: 'X-Ray', price: 800 },
    { name: 'ECG', price: 400 },
  ],
  garage: [
    { name: 'Oil Change', price: 1200 },
    { name: 'Tyre Rotation', price: 400 },
    { name: 'Brake Service', price: 2500 },
    { name: 'Car Wash', price: 300 },
  ],
  bakery: [
    { name: 'Chocolate Cake', price: 550 },
    { name: 'Croissant', price: 80 },
    { name: 'Bread Loaf', price: 45 },
    { name: 'Pastry Box', price: 320 },
  ],
  wholesale: [
    { name: 'Rice 50kg', price: 3200 },
    { name: 'Oil 15L', price: 2700 },
    { name: 'Soap Box (100)', price: 1800 },
    { name: 'Dal 25kg', price: 2800 },
  ],
  jewellery: [
    { name: 'Gold Ring 2g', price: 12000 },
    { name: 'Silver Chain', price: 3500 },
    { name: 'Diamond Nose Pin', price: 8500 },
    { name: 'Bangle Set', price: 22000 },
  ],
  gym: [
    { name: 'Monthly Plan', price: 1500 },
    { name: 'Personal Training', price: 3000 },
    { name: 'Diet Consult', price: 1000 },
    { name: 'Zumba Class', price: 800 },
  ],
  stationery: [
    { name: 'Notebook Set', price: 180 },
    { name: 'Pen Pack (10)', price: 120 },
    { name: 'Drawing Kit', price: 350 },
    { name: 'Exam Bundle', price: 450 },
  ],
  hotel: [
    { name: 'Standard Room', price: 1500 },
    { name: 'Deluxe Suite', price: 3500 },
    { name: 'Room Service', price: 500 },
    { name: 'Laundry', price: 300 },
  ],
};

// ─── Preview Panel Component ────────────────────────────────

function NichePreviewPanel({
  nicheSlug,
  onSelect,
  onClose,
}: {
  nicheSlug: NicheSlug;
  onSelect: () => void;
  onClose: () => void;
}) {
  const niche = NICHES.find((n) => n.slug === nicheSlug);
  if (!niche) return null;

  const sampleProducts = NICHE_SAMPLE_PRODUCTS[nicheSlug] || NICHE_SAMPLE_PRODUCTS.restaurant;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex items-start gap-4">
          <motion.span
            className="text-5xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {niche.icon}
          </motion.span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {niche.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {niche.description}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0 -mt-1 -mr-2"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        {/* Features List */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
            This niche includes:
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {niche.features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sample Products Preview */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
            Sample Product View
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {sampleProducts.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="w-full h-12 rounded bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 mb-2 flex items-center justify-center">
                  <span className="text-lg">{niche.icon}</span>
                </div>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {product.name}
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{product.price}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-6 pt-4 border-t bg-white dark:bg-gray-950">
        <Button
          onClick={onSelect}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base gap-2"
        >
          <Check className="w-5 h-5" />
          Select This Niche
        </Button>
      </div>
    </div>
  );
}

// ─── Comparison Table Component ─────────────────────────────

function NicheComparisonTable({
  niche1,
  niche2,
}: {
  niche1: NicheSlug;
  niche2: NicheSlug;
}) {
  const n1 = NICHES.find((n) => n.slug === niche1);
  const n2 = NICHES.find((n) => n.slug === niche2);
  if (!n1 || !n2) return null;

  const allFeatures = Array.from(new Set([...n1.features, ...n2.features])).sort();

  return (
    <div className="space-y-4">
      {/* Headers */}
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 text-center">
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <span className="text-2xl">{n1.icon}</span>
          <p className="text-sm font-bold mt-1">{n1.name}</p>
        </div>
        <div className="p-3 flex items-center justify-center">
          <GitCompare className="w-5 h-5 text-gray-400" />
        </div>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <span className="text-2xl">{n2.icon}</span>
          <p className="text-sm font-bold mt-1">{n2.name}</p>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {allFeatures.map((feature) => {
          const has1 = n1.features.includes(feature);
          const has2 = n2.features.includes(feature);
          return (
            <div
              key={feature}
              className="grid grid-cols-[1fr_1fr_1fr] gap-2 items-center text-sm py-2 px-3 rounded-lg even:bg-gray-50 dark:even:bg-gray-800/50"
            >
              <div className="flex items-center justify-center">
                {has1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <span className="text-center font-medium text-gray-700 dark:text-gray-300 truncate">
                {feature}
              </span>
              <div className="flex items-center justify-center">
                {has2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 text-center pt-3 border-t">
        <div>
          <p className="text-2xl font-bold text-emerald-600">{n1.features.length}</p>
          <p className="text-xs text-gray-500">features</p>
        </div>
        <div />
        <div>
          <p className="text-2xl font-bold text-emerald-600">{n2.features.length}</p>
          <p className="text-xs text-gray-500">features</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function NicheSelection() {
  const { onboardingNiche, setOnboardingNiche, setCurrentView } = useAppStore();
  const [selectedNiche, setSelectedNiche] = useState<NicheSlug | null>(
    (onboardingNiche as NicheSlug) || null
  );
  const [previewNiche, setPreviewNiche] = useState<NicheSlug | null>(null);
  const [compareNiches, setCompareNiches] = useState<NicheSlug[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleContinue = () => {
    if (!selectedNiche) return;
    setOnboardingNiche(selectedNiche);
    setCurrentView({ page: 'onboarding-template' });
  };

  const handleSkip = () => {
    setCurrentView({ page: 'dashboard' });
  };

  const handleCardClick = (slug: NicheSlug) => {
    setSelectedNiche(slug);
    setPreviewNiche(slug);
  };

  const handleSelectFromPreview = () => {
    if (previewNiche) {
      setSelectedNiche(previewNiche);
      setPreviewNiche(null);
    }
  };

  const toggleCompare = (slug: NicheSlug) => {
    setCompareNiches((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= 2) {
        return [prev[1], slug];
      }
      return [...prev, slug];
    });
  };

  // Desktop: split layout with preview on right
  const showDesktopPreview = previewNiche && !isMobile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Progress Section */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-700">Step 1 of 3</span>
            <span className="text-sm text-muted-foreground">Choose Business Type</span>
          </div>
          <Progress value={33} className="h-2 bg-emerald-100" />
          <div className="flex items-center justify-between mt-3">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i === 0
                      ? 'bg-emerald-600 text-white'
                      : i < 0
                        ? 'bg-emerald-200 text-emerald-700'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i < 0 ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span
                  className={`text-xs hidden sm:inline ${
                    i === 0 ? 'text-emerald-700 font-semibold' : 'text-gray-400'
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
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            What type of business do you run?
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We&apos;ll customize your POS experience based on your business type
          </p>
        </motion.div>

        {/* Niche Grid + Desktop Preview Split */}
        <div className="w-full max-w-6xl flex gap-6">
          {/* Grid */}
          <div className={`flex-1 transition-all duration-300 ${showDesktopPreview ? '' : 'max-w-5xl mx-auto'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence>
                {NICHES.map((niche, index) => {
                  const isSelected = selectedNiche === niche.slug;
                  const isComparing = compareNiches.includes(niche.slug);
                  return (
                    <motion.div
                      key={niche.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <Card
                        className={`relative cursor-pointer transition-all duration-200 group border-2 overflow-hidden ${
                          isSelected
                            ? 'border-emerald-500 shadow-emerald-100 shadow-lg ring-2 ring-emerald-200 dark:ring-emerald-800'
                            : isComparing
                              ? 'border-sky-400 shadow-sky-100 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => handleCardClick(niche.slug)}
                      >
                        {/* Selected glow animation */}
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 bg-emerald-500/5 pointer-events-none"
                            layoutId="nicheGlow"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center z-10"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}

                        {/* Compare indicator */}
                        {isComparing && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center z-10">
                            <GitCompare className="w-3 h-3 text-white" />
                          </div>
                        )}

                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <motion.span
                              className="text-3xl"
                              whileHover={{ scale: 1.15, rotate: 5 }}
                              transition={{ type: 'spring', stiffness: 400 }}
                            >
                              {niche.icon}
                            </motion.span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                                {niche.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {niche.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {niche.features.slice(0, 3).map((feature) => (
                              <span
                                key={feature}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  isSelected
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                }`}
                              >
                                {feature}
                              </span>
                            ))}
                            {niche.features.length > 3 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                                +{niche.features.length - 3} more
                              </span>
                            )}
                          </div>

                          {/* Compare toggle button */}
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompare(niche.slug);
                              }}
                              className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
                                isComparing
                                  ? 'border-sky-400 bg-sky-50 text-sky-600'
                                  : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
                              }`}
                            >
                              <GitCompare className="w-3 h-3 inline mr-1" />
                              {isComparing ? 'Comparing' : 'Compare'}
                            </button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Preview Panel */}
          <AnimatePresence>
            {showDesktopPreview && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="hidden lg:block w-[380px] shrink-0"
              >
                <Card className="sticky top-32 overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/20 h-[calc(100vh-12rem)]">
                  <NichePreviewPanel
                    nicheSlug={previewNiche}
                    onSelect={handleSelectFromPreview}
                    onClose={() => setPreviewNiche(null)}
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-t">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
          <div className="flex items-center gap-3">
            {/* Compare Button */}
            {compareNiches.length === 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(true)}
                  className="gap-2 border-sky-400 text-sky-600 hover:bg-sky-50"
                >
                  <GitCompare className="w-4 h-4" />
                  Compare ({compareNiches.length})
                </Button>
              </motion.div>
            )}

            {/* Continue Button */}
            <motion.div
              animate={
                selectedNiche
                  ? { scale: [1, 1.03, 1] }
                  : {}
              }
              transition={
                selectedNiche
                  ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                  : {}
              }
            >
              <Button
                onClick={handleContinue}
                disabled={!selectedNiche}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Preview - Bottom Sheet */}
      <Sheet
        open={!!previewNiche && isMobile}
        onOpenChange={(open) => !open && setPreviewNiche(null)}
      >
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
          <SheetTitle className="sr-only">Niche Preview</SheetTitle>
          {previewNiche && (
            <NichePreviewPanel
              nicheSlug={previewNiche}
              onSelect={handleSelectFromPreview}
              onClose={() => setPreviewNiche(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-sky-600" />
            Compare Niches
          </DialogTitle>
          {compareNiches.length === 2 && (
            <NicheComparisonTable niche1={compareNiches[0]} niche2={compareNiches[1]} />
          )}
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowComparison(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
