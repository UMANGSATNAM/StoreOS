'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Check,
  ShoppingCart,
  LayoutGrid,
  List,
  Calendar,
  CreditCard,
  BarChart3,
  Home,
  Package,
  Users,
  Receipt,
  Settings,
  Search,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getTemplatesForNiche, getNicheBySlug, type NicheSlug, type Template } from '@/lib/types';
import { useAppStore } from '@/lib/store';

const STEPS = ['Choose Business Type', 'Select Template', 'Setup Store'];

const layoutIcons: Record<string, React.ReactNode> = {
  grid: <LayoutGrid className="w-3 h-3" />,
  list: <List className="w-3 h-3" />,
  card: <CreditCard className="w-3 h-3" />,
  calendar: <Calendar className="w-3 h-3" />,
  catalog: <ShoppingCart className="w-3 h-3" />,
  table: <List className="w-3 h-3" />,
  queue: <List className="w-3 h-3" />,
};

// Niche-specific product names for mockup
const NICHE_MOCK_PRODUCTS: Record<string, Array<{ name: string; price: string; color: string }>> = {
  restaurant: [
    { name: 'Butter Chicken', price: '₹320', color: '#f97316' },
    { name: 'Paneer Tikka', price: '₹250', color: '#fb923c' },
    { name: 'Dal Makhani', price: '₹220', color: '#fdba74' },
    { name: 'Naan Basket', price: '₹80', color: '#fed7aa' },
    { name: 'Biryani', price: '₹350', color: '#ea580c' },
    { name: 'Raita', price: '₹60', color: '#c2410c' },
  ],
  clothing: [
    { name: 'Silk Kurta', price: '₹1499', color: '#ec4899' },
    { name: 'Denim Jeans', price: '₹999', color: '#f472b6' },
    { name: 'Cotton Saree', price: '₹2500', color: '#f9a8d4' },
    { name: 'Linen Shirt', price: '₹799', color: '#fbcfe8' },
    { name: 'Lehenga', price: '₹3500', color: '#db2777' },
    { name: 'Blazer', price: '₹2200', color: '#be185d' },
  ],
  default: [
    { name: 'Product A', price: '₹299', color: '#10b981' },
    { name: 'Product B', price: '₹499', color: '#34d399' },
    { name: 'Product C', price: '₹149', color: '#6ee7b7' },
    { name: 'Product D', price: '₹799', color: '#a7f3d0' },
    { name: 'Product E', price: '₹349', color: '#059669' },
    { name: 'Product F', price: '₹599', color: '#047857' },
  ],
};

// ─── Mini POS Mockup ────────────────────────────────────────

function MiniPosMockup({ template, nicheSlug }: { template: Template; nicheSlug: string }) {
  const nicheData = getNicheBySlug(nicheSlug as NicheSlug);
  const { primary, secondary, accent } = template.colorScheme;
  const products = NICHE_MOCK_PRODUCTS[nicheSlug] || NICHE_MOCK_PRODUCTS.default;
  const isListLayout = template.layoutStyle === 'list';
  const isGridLayout = template.layoutStyle === 'grid' || template.layoutStyle === 'card';

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden w-full shadow-inner">
      {/* Mini Header */}
      <div className="p-2.5 flex items-center justify-between" style={{ backgroundColor: primary }}>
        <div className="flex items-center gap-1.5">
          <span className="text-white text-sm">{nicheData?.icon}</span>
          <span className="text-white font-bold text-[10px]">{nicheData?.name?.split('/')[0]?.trim() || 'Store'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-white/20 rounded-full" />
          <div className="w-4 h-4 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Mini Search Bar */}
      <div className="px-2 py-1.5 bg-white dark:bg-gray-900 border-b" style={{ borderColor: `${secondary}` }}>
        <div className="h-4 rounded bg-gray-100 dark:bg-gray-700 flex items-center px-1.5">
          <Search className="w-2 h-2 text-gray-400" />
        </div>
      </div>

      {/* Mini Category Tabs */}
      <div className="flex gap-1 px-2 py-1.5 bg-white dark:bg-gray-900 border-b" style={{ borderColor: `${secondary}40` }}>
        {['All', 'Popular', 'New'].map((cat, i) => (
          <span
            key={cat}
            className="text-[7px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium"
            style={{
              backgroundColor: i === 0 ? primary : secondary,
              color: i === 0 ? '#fff' : primary,
            }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Mini Product Grid/List */}
      <div className={`grid ${isListLayout ? 'grid-cols-1' : 'grid-cols-3'} gap-1 p-1.5`}>
        {products.slice(0, isListLayout ? 4 : 6).map((product, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-700 rounded p-1.5 border hover:shadow-sm transition-shadow"
            style={{ borderColor: `${primary}20` }}
          >
            <div
              className="w-full h-6 rounded mb-1"
              style={{ backgroundColor: `${product.color}25` }}
            />
            <p className="text-[7px] font-medium text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
            <p className="text-[7px] font-bold" style={{ color: primary }}>{product.price}</p>
          </div>
        ))}
      </div>

      {/* Mini Cart Bar */}
      <div className="bg-white dark:bg-gray-700 p-1.5 border-t flex items-center justify-between" style={{ borderColor: secondary }}>
        <div>
          <p className="text-[7px] text-gray-500 dark:text-gray-400">Cart · 3 items</p>
          <p className="text-[9px] font-bold" style={{ color: primary }}>₹798</p>
        </div>
        <div
          className="text-[8px] px-3 py-1 rounded text-white font-bold"
          style={{ backgroundColor: primary }}
        >
          Pay
        </div>
      </div>
    </div>
  );
}

// ─── Large Live Preview ─────────────────────────────────────

function LivePreviewPanel({ template, nicheSlug }: { template: Template; nicheSlug: string }) {
  const nicheData = getNicheBySlug(nicheSlug as NicheSlug);
  const { primary, secondary, accent } = template.colorScheme;
  const products = NICHE_MOCK_PRODUCTS[nicheSlug] || NICHE_MOCK_PRODUCTS.default;

  return (
    <div className="space-y-4">
      {/* Full POS Layout Mockup */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
        {/* Animated Sidebar + Main area */}
        <div className="flex h-72">
          {/* Sidebar */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 60, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-white dark:bg-gray-900 border-r flex flex-col"
            style={{ borderColor: `${primary}30` }}
          >
            {/* Logo */}
            <div
              className="w-full h-10 flex items-center justify-center"
              style={{ backgroundColor: primary }}
            >
              <span className="text-white text-sm">{nicheData?.icon}</span>
            </div>

            {/* Nav Items */}
            {[
              { icon: Home, label: 'Home', active: true },
              { icon: Receipt, label: 'POS' },
              { icon: Package, label: 'Products' },
              { icon: Users, label: 'Customers' },
              { icon: BarChart3, label: 'Reports' },
              { icon: Settings, label: 'Settings' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`w-full h-8 flex items-center justify-center ${
                    item.active
                      ? ''
                      : ''
                  }`}
                  style={item.active ? { backgroundColor: `${primary}15`, color: primary } : {}}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: item.active ? primary : '#9ca3af' }} />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Bar */}
            <div className="h-9 bg-white dark:bg-gray-900 border-b flex items-center px-3 justify-between" style={{ borderColor: `${primary}15` }}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">{nicheData?.name?.split('/')[0]?.trim() || 'Store'}</span>
                <Badge className="text-[8px] px-1.5 py-0" style={{ backgroundColor: `${primary}20`, color: primary, borderColor: 'transparent' }}>
                  {template.name}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <Search className="w-3 h-3 text-gray-400" />
                <Bell className="w-3 h-3 text-gray-400" />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-1.5 p-2">
              {[
                { label: 'Today', value: '₹12.4k', color: primary },
                { label: 'Orders', value: '24', color: '#3b82f6' },
                { label: 'Products', value: '156', color: '#f59e0b' },
                { label: 'Customers', value: '89', color: '#8b5cf6' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="bg-white dark:bg-gray-700 rounded-lg p-1.5 border"
                  style={{ borderColor: `${stat.color}20` }}
                >
                  <p className="text-[7px] text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-[10px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Product Grid + Cart Split */}
            <div className="flex-1 flex gap-1.5 px-2 pb-2">
              {/* Products */}
              <div className="flex-1 grid grid-cols-3 gap-1">
                {products.slice(0, 6).map((product, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    className="bg-white dark:bg-gray-700 rounded-lg p-1.5 border cursor-pointer hover:shadow-sm transition-all"
                    style={{ borderColor: `${primary}15` }}
                  >
                    <div
                      className="w-full h-7 rounded mb-1"
                      style={{ backgroundColor: `${product.color}20` }}
                    />
                    <p className="text-[7px] font-medium text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
                    <p className="text-[8px] font-bold" style={{ color: primary }}>{product.price}</p>
                  </motion.div>
                ))}
              </div>

              {/* Cart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="w-20 bg-white dark:bg-gray-700 rounded-lg p-1.5 border"
                style={{ borderColor: `${accent}30` }}
              >
                <p className="text-[8px] font-bold text-gray-800 dark:text-gray-200 mb-1">Cart</p>
                {products.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-center justify-between mb-0.5">
                    <span className="text-[6px] text-gray-600 dark:text-gray-300 truncate">{p.name.slice(0, 8)}</span>
                    <span className="text-[6px] font-medium" style={{ color: primary }}>x1</span>
                  </div>
                ))}
                <div className="mt-1 pt-1 border-t" style={{ borderColor: `${accent}20` }}>
                  <div className="flex justify-between">
                    <span className="text-[7px] text-gray-500">Total</span>
                    <span className="text-[8px] font-bold" style={{ color: accent }}>₹830</span>
                  </div>
                  <div
                    className="mt-1 text-center text-[7px] py-1 rounded font-bold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    Pay Now
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Scheme Details */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-1 shadow-sm"
            style={{ backgroundColor: primary }}
          />
          <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Primary</p>
          <p className="text-[9px] text-gray-400 font-mono">{primary}</p>
        </div>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-1 shadow-sm"
            style={{ backgroundColor: secondary }}
          />
          <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Secondary</p>
          <p className="text-[9px] text-gray-400 font-mono">{secondary}</p>
        </div>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-1 shadow-sm"
            style={{ backgroundColor: accent }}
          />
          <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Accent</p>
          <p className="text-[9px] text-gray-400 font-mono">{accent}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function TemplateSelection() {
  const { onboardingNiche, onboardingTemplate, setOnboardingTemplate, setCurrentView } = useAppStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    onboardingTemplate || null
  );
  const [hoveredTemplate, setHoveredTemplate] = useState<Template | null>(null);
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<Template | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const nicheSlug = (onboardingNiche || 'restaurant') as NicheSlug;
  const nicheData = getNicheBySlug(nicheSlug);
  const templates = getTemplatesForNiche(nicheSlug);

  // The template to show in the live preview panel
  const livePreviewTemplate = activePreviewTemplate || (hoveredTemplate);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleUseTemplate = () => {
    if (!selectedTemplate) return;
    setOnboardingTemplate(selectedTemplate);
    setCurrentView({ page: 'onboarding-setup' });
  };

  const handleBack = () => {
    setCurrentView({ page: 'onboarding-niche' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Progress Section */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-700">Step 2 of 3</span>
            <span className="text-sm text-muted-foreground">Select Template</span>
          </div>
          <Progress value={66} className="h-2 bg-emerald-100" />
          <div className="flex items-center justify-between mt-3">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < 1
                      ? 'bg-emerald-200 text-emerald-700'
                      : i === 1
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i < 1 ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span
                  className={`text-xs hidden sm:inline ${
                    i === 1
                      ? 'text-emerald-700 font-semibold'
                      : i < 1
                        ? 'text-emerald-600'
                        : 'text-gray-400'
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
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{nicheData?.icon}</span>
            <Badge variant="secondary" className="text-xs">{nicheData?.name}</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Choose your POS template
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Select a template that matches your store&apos;s style
          </p>
        </motion.div>

        {/* Template Cards + Live Preview */}
        <div className="w-full max-w-6xl flex gap-6">
          {/* Template Grid */}
          <div className={`flex-1 ${!livePreviewTemplate || isMobile ? 'max-w-4xl mx-auto' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {templates.map((template, index) => {
                  const isSelected = selectedTemplate === template.id;
                  const isActivePreview = activePreviewTemplate?.id === template.id;
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onMouseEnter={() => setHoveredTemplate(template)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                    >
                      <Card
                        className={`relative overflow-hidden transition-all duration-200 border-2 ${
                          isSelected
                            ? 'border-emerald-500 shadow-emerald-100 shadow-lg'
                            : isActivePreview
                              ? 'border-emerald-300 shadow-emerald-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 z-10 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}

                        {/* Color Scheme Preview Bar */}
                        <div className="flex h-2">
                          <div className="flex-1" style={{ backgroundColor: template.colorScheme.primary }} />
                          <div className="flex-1" style={{ backgroundColor: template.colorScheme.secondary }} />
                          <div className="flex-1" style={{ backgroundColor: template.colorScheme.accent }} />
                        </div>

                        {/* Mini POS Preview */}
                        <div className="p-3">
                          <MiniPosMockup template={template} nicheSlug={nicheSlug} />
                        </div>

                        <div className="px-4 pb-4">
                          {/* Template Header */}
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 text-base">{template.name}</h3>
                            <Badge variant="outline" className="text-xs gap-1 capitalize">
                              {layoutIcons[template.layoutStyle]}
                              {template.layoutStyle}
                            </Badge>
                          </div>

                          {/* Color Circles */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">Colors:</span>
                            <div className="flex gap-1.5">
                              <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: template.colorScheme.primary }} />
                              <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: template.colorScheme.secondary }} />
                              <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: template.colorScheme.accent }} />
                            </div>
                          </div>

                          <p className="text-sm text-gray-500 mb-3">{template.description}</p>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePreviewTemplate(isActivePreview ? null : template);
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {isActivePreview ? 'Hide Preview' : 'Preview'}
                            </Button>
                            <Button
                              size="sm"
                              className={`gap-1.5 ${
                                isSelected
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : 'bg-gray-900 hover:bg-gray-800'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTemplate(template.id);
                              }}
                            >
                              <Check className="w-3.5 h-3.5" />
                              {isSelected ? 'Selected' : 'Use This'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Live Preview Panel */}
          <AnimatePresence>
            {livePreviewTemplate && !isMobile && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="hidden lg:block w-[400px] shrink-0"
              >
                <Card className="sticky top-32 p-5 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      Live Preview
                    </h3>
                    <Badge variant="outline" className="text-[10px]">
                      {livePreviewTemplate.name}
                    </Badge>
                  </div>
                  <LivePreviewPanel template={livePreviewTemplate} nicheSlug={nicheSlug} />
                  <Button
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    onClick={() => {
                      setSelectedTemplate(livePreviewTemplate.id);
                      setActivePreviewTemplate(null);
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Use {livePreviewTemplate.name}
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-t">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleUseTemplate}
            disabled={!selectedTemplate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Preview Dialog */}
      <Dialog
        open={!!activePreviewTemplate && isMobile}
        onOpenChange={(open) => !open && setActivePreviewTemplate(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            Template Preview — {activePreviewTemplate?.name}
          </DialogTitle>
          {activePreviewTemplate && (
            <div className="space-y-4">
              <LivePreviewPanel template={activePreviewTemplate} nicheSlug={nicheSlug} />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setActivePreviewTemplate(null)}
                >
                  Close
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => {
                    setSelectedTemplate(activePreviewTemplate.id);
                    setActivePreviewTemplate(null);
                  }}
                >
                  <Check className="w-4 h-4" />
                  Use This Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
