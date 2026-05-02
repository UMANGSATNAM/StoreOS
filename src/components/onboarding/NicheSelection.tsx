'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { NICHES, type NicheSlug } from '@/lib/types';
import { useAppStore } from '@/lib/store';

const STEPS = ['Choose Business Type', 'Select Template', 'Setup Store'];

export default function NicheSelection() {
  const { onboardingNiche, setOnboardingNiche, setCurrentView } = useAppStore();
  const [selectedNiche, setSelectedNiche] = useState<NicheSlug | null>(
    (onboardingNiche as NicheSlug) || null
  );

  const handleContinue = () => {
    if (!selectedNiche) return;
    setOnboardingNiche(selectedNiche);
    setCurrentView({ page: 'onboarding-template' });
  };

  const handleSkip = () => {
    setCurrentView({ page: 'dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* Progress Section */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
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

        {/* Niche Grid */}
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {NICHES.map((niche, index) => {
                const isSelected = selectedNiche === niche.slug;
                return (
                  <motion.div
                    key={niche.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <Card
                      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group border-2 ${
                        isSelected
                          ? 'border-emerald-500 shadow-emerald-100 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedNiche(niche.slug)}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl" role="img" aria-label={niche.name}>
                            {niche.icon}
                          </span>
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
          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleContinue}
              disabled={!selectedNiche}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
