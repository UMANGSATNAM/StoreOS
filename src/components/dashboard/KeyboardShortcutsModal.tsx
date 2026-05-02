'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Keyboard,
  Search,
  Navigation,
  Receipt,
  Zap,
  X,
  Globe,
  Monitor,
  Minus,
  Plus,
  Trash2,
  CornerDownLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  shortcuts: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    id: 'global',
    title: 'Global Shortcuts',
    icon: Globe,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-l-emerald-500',
    shortcuts: [
      { keys: ['?'], description: 'Show this help' },
      { keys: ['Ctrl', '/'], description: 'Show this help (alternate)' },
      { keys: ['Ctrl', 'K'], description: 'Focus search' },
      { keys: ['/'], description: 'Focus search (alternate)' },
      { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
      { keys: ['Ctrl', 'D'], description: 'Go to Dashboard' },
      { keys: ['Ctrl', 'E'], description: 'Toggle dark mode' },
      { keys: ['Esc'], description: 'Close dialog / modal' },
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation Shortcuts',
    icon: Navigation,
    iconColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-50 dark:bg-sky-900/20',
    borderColor: 'border-l-sky-500',
    shortcuts: [
      { keys: ['1'], description: 'Dashboard' },
      { keys: ['2'], description: 'Billing / POS' },
      { keys: ['3'], description: 'Products' },
      { keys: ['4'], description: 'Customers' },
      { keys: ['5'], description: 'Orders' },
      { keys: ['6'], description: 'Reports' },
      { keys: ['7'], description: 'Settings' },
      { keys: ['8'], description: 'Tables (niche-specific)' },
      { keys: ['9'], description: 'Staff' },
    ],
  },
  {
    id: 'billing',
    title: 'Billing / POS Shortcuts',
    icon: Receipt,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-l-amber-500',
    shortcuts: [
      { keys: ['F2'], description: 'New bill' },
      { keys: ['F4'], description: 'Hold bill' },
      { keys: ['F5'], description: 'Cash payment' },
      { keys: ['F6'], description: 'UPI payment' },
      { keys: ['F7'], description: 'Card payment' },
      { keys: ['F8'], description: 'Notifications' },
      { keys: ['F9'], description: 'Print receipt' },
      { keys: ['F10'], description: 'Fullscreen mode' },
      { keys: ['+'], description: 'Increase quantity' },
      { keys: ['-'], description: 'Decrease quantity' },
      { keys: ['Delete'], description: 'Remove item from cart' },
      { keys: ['Enter'], description: 'Quick pay' },
    ],
  },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center px-2 py-1 text-xs font-mono font-medium bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm min-w-[2rem]">
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter shortcuts based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return SHORTCUT_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return SHORTCUT_CATEGORIES.map((category) => ({
      ...category,
      shortcuts: category.shortcuts.filter(
        (shortcut) =>
          shortcut.description.toLowerCase().includes(query) ||
          shortcut.keys.some((key) => key.toLowerCase().includes(query))
      ),
    })).filter((category) => category.shortcuts.length > 0);
  }, [searchQuery]);

  // Display categories (filtered by active tab or search)
  const displayCategories = useMemo(() => {
    if (activeCategory) {
      return filteredCategories.filter((c) => c.id === activeCategory);
    }
    return filteredCategories;
  }, [filteredCategories, activeCategory]);

  // Total shortcut count
  const totalShortcuts = SHORTCUT_CATEGORIES.reduce(
    (sum, cat) => sum + cat.shortcuts.length,
    0
  );

  // Category tab counts (unfiltered)
  const getCategoryCount = (id: string) => {
    const cat = SHORTCUT_CATEGORIES.find((c) => c.id === id);
    return cat ? cat.shortcuts.length : 0;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* Header */}
              <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50/80 to-transparent dark:from-emerald-950/30 dark:to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Keyboard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                      Work faster with {totalShortcuts} keyboard shortcuts
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Search */}
              <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search shortcuts..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim()) setActiveCategory(null);
                    }}
                    className="pl-9 h-9 text-sm"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Tabs */}
              <div className="px-6 py-2 border-b border-gray-100 dark:border-gray-800/50">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      activeCategory === null
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    All
                  </button>
                  {SHORTCUT_CATEGORIES.map((category) => {
                    const CategoryIcon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveCategory(activeCategory === category.id ? null : category.id);
                          setSearchQuery('');
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                          activeCategory === category.id
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <CategoryIcon className="w-3 h-3" />
                        {category.title.replace(' Shortcuts', '')}
                        <span className="text-[10px] opacity-60">({getCategoryCount(category.id)})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shortcuts by Category */}
              <div className="px-6 py-4 space-y-5 max-h-[50vh] overflow-y-auto">
                {displayCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No shortcuts match &quot;{searchQuery}&quot;
                    </p>
                  </div>
                ) : (
                  displayCategories.map((category) => {
                    const CategoryIcon = category.icon;
                    return (
                      <div key={category.id}>
                        {/* Category Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`border-l-4 ${category.borderColor} pl-3 flex items-center gap-2`}>
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${category.iconBg}`}>
                              <CategoryIcon className={`w-3.5 h-3.5 ${category.iconColor}`} />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                              {category.title}
                            </h3>
                          </div>
                          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2" />
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            {category.shortcuts.length} shortcut{category.shortcuts.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Shortcut Items */}
                        <div className="space-y-0.5">
                          {category.shortcuts.map((shortcut, idx) => (
                            <div
                              key={shortcut.description}
                              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors group ${
                                idx % 2 === 0
                                  ? 'bg-gray-50/50 dark:bg-gray-800/20'
                                  : ''
                              } hover:bg-gray-100 dark:hover:bg-gray-800/50`}
                            >
                              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                {shortcut.description}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {shortcut.keys.map((key, kIdx) => (
                                  <React.Fragment key={key}>
                                    {kIdx > 0 && (
                                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">+</span>
                                    )}
                                    <Kbd>{key}</Kbd>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Press <Kbd>?</Kbd> anytime to toggle this help
                  </p>
                </div>
                <Button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="sm"
                >
                  Got it
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
