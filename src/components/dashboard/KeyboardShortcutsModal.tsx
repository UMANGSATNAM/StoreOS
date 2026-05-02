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
import { Keyboard, Search, Navigation, Receipt, Zap, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  shortcuts: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: 'Navigation',
    icon: Navigation,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Global search' },
      { keys: ['1'], description: 'Dashboard tab' },
      { keys: ['2'], description: 'Billing / POS tab' },
      { keys: ['3'], description: 'Products tab' },
      { keys: ['4'], description: 'Customers tab' },
      { keys: ['5'], description: 'Orders tab' },
      { keys: ['6'], description: 'Staff tab' },
      { keys: ['7'], description: 'Reports tab' },
      { keys: ['8'], description: 'Settings tab' },
      { keys: ['9'], description: 'Niche-specific tab' },
      { keys: ['/'], description: 'Focus search bar' },
    ],
  },
  {
    title: 'Billing',
    icon: Receipt,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    shortcuts: [
      { keys: ['N'], description: 'New bill' },
      { keys: ['H'], description: 'Hold bill' },
      { keys: ['P'], description: 'Print receipt' },
      { keys: ['F4'], description: 'Hold bill (alt)' },
      { keys: ['F8'], description: 'Clear cart' },
      { keys: ['F9'], description: 'Cash payment' },
      { keys: ['F10'], description: 'UPI payment' },
      { keys: ['F11'], description: 'Card payment' },
    ],
  },
  {
    title: 'General',
    icon: Zap,
    iconColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-50 dark:bg-sky-900/20',
    shortcuts: [
      { keys: ['?'], description: 'Toggle this help' },
      { keys: ['Ctrl', '/'], description: 'Toggle this help (alt)' },
      { keys: ['Esc'], description: 'Close dialog / clear' },
      { keys: ['D'], description: 'Toggle dark mode' },
    ],
  },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 shadow-sm select-none">
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

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

  // Total shortcut count
  const totalShortcuts = SHORTCUT_CATEGORIES.reduce(
    (sum, cat) => sum + cat.shortcuts.length,
    0
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
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
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Shortcuts by Category */}
        <div className="px-6 py-4 space-y-5 max-h-[55vh] overflow-y-auto">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No shortcuts match &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <div key={category.title}>
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${category.iconBg}`}>
                      <CategoryIcon className={`w-3.5 h-3.5 ${category.iconColor}`} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                      {category.title}
                    </h3>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2" />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      {category.shortcuts.length} shortcut{category.shortcuts.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Shortcut Items */}
                  <div className="space-y-1">
                    {category.shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.description}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {shortcut.keys.map((key, idx) => (
                            <React.Fragment key={key}>
                              {idx > 0 && (
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
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Shortcuts are disabled when typing in input fields
          </p>
          <Button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            size="sm"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
