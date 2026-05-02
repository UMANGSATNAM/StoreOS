'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

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
  icon: string;
  shortcuts: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: 'Navigation',
    icon: '🧭',
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Search' },
      { keys: ['F2'], description: 'Focus search' },
      { keys: ['Esc'], description: 'Close dialogs' },
    ],
  },
  {
    title: 'Billing',
    icon: '💰',
    shortcuts: [
      { keys: ['F4'], description: 'Hold bill' },
      { keys: ['F8'], description: 'Clear cart' },
      { keys: ['F9'], description: 'Cash payment' },
      { keys: ['F10'], description: 'UPI payment' },
      { keys: ['F11'], description: 'Card payment' },
    ],
  },
  {
    title: 'General',
    icon: '⚡',
    shortcuts: [
      { keys: ['?'], description: 'Show shortcuts' },
      { keys: ['Ctrl', '/'], description: 'Show shortcuts' },
    ],
  },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-xs font-mono font-semibold text-gray-700 dark:text-gray-300 shadow-sm select-none">
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
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
                Work faster with these keyboard shortcuts
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Shortcuts by Category */}
        <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
          {SHORTCUT_CATEGORIES.map((category) => (
            <div key={category.title}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{category.icon}</span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  {category.title}
                </h3>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2" />
              </div>

              {/* Shortcut Items */}
              <div className="space-y-1.5">
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
          ))}
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
