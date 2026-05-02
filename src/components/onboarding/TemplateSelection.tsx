'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, Check, ShoppingCart, LayoutGrid, List, Calendar, CreditCard } from 'lucide-react';
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

// Sample products for the preview mockup
const SAMPLE_PRODUCTS = [
  { name: 'Product Alpha', price: 299 },
  { name: 'Product Beta', price: 499 },
  { name: 'Product Gamma', price: 149 },
  { name: 'Product Delta', price: 799 },
  { name: 'Product Epsilon', price: 349 },
  { name: 'Product Zeta', price: 599 },
];

const SAMPLE_CATEGORIES = ['Popular', 'New Arrivals', 'Best Sellers'];

function TemplatePreviewMockup({ template, niche }: { template: Template; niche: string }) {
  const nicheData = getNicheBySlug(niche as NicheSlug);
  const primaryColor = template.colorScheme.primary;
  const secondaryColor = template.colorScheme.secondary;

  return (
    <div className="bg-gray-100 rounded-xl p-4 w-full">
      {/* Mini POS Header */}
      <div
        className="rounded-t-lg p-3 flex items-center justify-between"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2">
          <span className="text-white text-lg">{nicheData?.icon}</span>
          <span className="text-white font-bold text-sm">{nicheData?.name || 'Store'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-full" />
          <div className="w-6 h-6 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Mini Category Bar */}
      <div className="flex gap-2 p-2 bg-white border-b overflow-x-auto" style={{ borderColor: secondaryColor }}>
        {SAMPLE_CATEGORIES.map((cat) => (
          <span
            key={cat}
            className="text-[10px] px-3 py-1 rounded-full whitespace-nowrap font-medium"
            style={{ backgroundColor: secondaryColor, color: primaryColor }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Mini Product Grid */}
      <div className={`grid ${template.layoutStyle === 'list' ? 'grid-cols-1' : 'grid-cols-3'} gap-2 p-2`}>
        {SAMPLE_PRODUCTS.slice(0, template.layoutStyle === 'list' ? 4 : 6).map((product, i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-2 border hover:shadow-sm transition-shadow cursor-pointer"
            style={{ borderColor: `${primaryColor}20` }}
          >
            <div
              className="w-full h-8 rounded mb-1"
              style={{ backgroundColor: `${primaryColor}15` }}
            />
            <p className="text-[9px] font-medium text-gray-800 truncate">{product.name}</p>
            <p className="text-[9px] font-bold" style={{ color: primaryColor }}>
              ₹{product.price}
            </p>
          </div>
        ))}
      </div>

      {/* Mini Cart */}
      <div className="bg-white rounded-b-lg p-2 border-t" style={{ borderColor: secondaryColor }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500">Cart Total</p>
            <p className="text-sm font-bold" style={{ color: primaryColor }}>₹798.00</p>
          </div>
          <div
            className="text-[10px] px-4 py-1.5 rounded-lg text-white font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            Pay
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplateSelection() {
  const { onboardingNiche, onboardingTemplate, setOnboardingTemplate, setCurrentView } = useAppStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    onboardingTemplate || null
  );
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const nicheSlug = (onboardingNiche || 'restaurant') as NicheSlug;
  const nicheData = getNicheBySlug(nicheSlug);
  const templates = getTemplatesForNiche(nicheSlug);

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
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
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

        {/* Template Cards */}
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {templates.map((template, index) => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className={`relative overflow-hidden transition-all duration-200 border-2 ${
                        isSelected
                          ? 'border-emerald-500 shadow-emerald-100 shadow-lg'
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
                      <div className="flex h-3">
                        <div
                          className="flex-1"
                          style={{ backgroundColor: template.colorScheme.primary }}
                        />
                        <div
                          className="flex-1"
                          style={{ backgroundColor: template.colorScheme.secondary }}
                        />
                        <div
                          className="flex-1"
                          style={{ backgroundColor: template.colorScheme.accent }}
                        />
                      </div>

                      <div className="p-5">
                        {/* Template Header */}
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
                          <Badge variant="outline" className="text-xs gap-1 capitalize">
                            {layoutIcons[template.layoutStyle]}
                            {template.layoutStyle}
                          </Badge>
                        </div>

                        {/* Color Circles */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-gray-500">Colors:</span>
                          <div className="flex gap-1.5">
                            <div
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: template.colorScheme.primary }}
                            />
                            <div
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: template.colorScheme.secondary }}
                            />
                            <div
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: template.colorScheme.accent }}
                            />
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">{template.description}</p>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplate(template);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Preview
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
                            {isSelected ? 'Selected' : 'Use This Template'}
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
      </div>

      {/* Footer Actions */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-t">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
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

      {/* Template Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            Template Preview — {previewTemplate?.name}
          </DialogTitle>
          {previewTemplate && (
            <div className="space-y-4">
              <TemplatePreviewMockup
                template={previewTemplate}
                niche={nicheSlug}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => {
                    setSelectedTemplate(previewTemplate.id);
                    setPreviewTemplate(null);
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
