'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import type { CashRegisterTransaction, CashRegisterDaySummary } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Wallet,
  Lock,
  Unlock,
  Plus,
  Minus,
  Receipt,
  Calculator,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  TrendingUp,
  CircleDot,
  HandCoins,
  FileText,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Denomination Config ────────────────────────────────────
const DENOMINATIONS = [
  { value: 2000, label: '₹2000' },
  { value: 500, label: '₹500' },
  { value: 200, label: '₹200' },
  { value: 100, label: '₹100' },
  { value: 50, label: '₹50' },
  { value: 20, label: '₹20' },
  { value: 10, label: '₹10' },
];

const QUICK_OPEN_AMOUNTS = [1000, 2000, 5000, 10000];

// ─── Helper: format currency ────────────────────────────────
function formatCurrency(amount: number): string {
  return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ─── Helper: format time ────────────────────────────────────
function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Helper: get running duration ───────────────────────────
function getDuration(openedAt: string): string {
  const diff = Date.now() - new Date(openedAt).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ─── Transaction Type Icon & Color ──────────────────────────
function getTransactionIcon(type: CashRegisterTransaction['type']) {
  switch (type) {
    case 'sale':
      return { icon: Receipt, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    case 'cash_in':
      return { icon: ArrowUpRight, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' };
    case 'cash_out':
      return { icon: ArrowDownRight, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
    case 'tip':
      return { icon: HandCoins, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    case 'refund':
      return { icon: Minus, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    default:
      return { icon: CircleDot, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/20' };
  }
}

// ═══════════════════════════════════════════════════════════════
// Main Cash Register Panel
// ═══════════════════════════════════════════════════════════════

export default function CashRegisterPanel() {
  const cashRegister = useAppStore((s) => s.cashRegister);
  const cashRegisterHistory = useAppStore((s) => s.cashRegisterHistory);
  const openCashRegister = useAppStore((s) => s.openCashRegister);
  const closeCashRegister = useAppStore((s) => s.closeCashRegister);
  const addCashRegisterTransaction = useAppStore((s) => s.addCashRegisterTransaction);

  // ─── Open Register State ──────────────────────────────────
  const [openBalance, setOpenBalance] = useState('');
  const [openNotes, setOpenNotes] = useState('');
  const [openDialogOpen, setOpenDialogOpen] = useState(false);

  // ─── Cash In/Out State ────────────────────────────────────
  const [cashInDialogOpen, setCashInDialogOpen] = useState(false);
  const [cashOutDialogOpen, setCashOutDialogOpen] = useState(false);
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDesc, setTransactionDesc] = useState('');

  // ─── Close Register State ─────────────────────────────────
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');
  const [denominations, setDenominations] = useState<Record<number, string>>(
    Object.fromEntries(DENOMINATIONS.map((d) => [d.value, '']))
  );

  // ─── Day Summary Dialog ──────────────────────────────────
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<CashRegisterDaySummary | null>(null);

  // ─── Running duration timer ──────────────────────────────
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!cashRegister?.isOpen) return;
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [cashRegister?.isOpen]);

  // ─── Computed values for close dialog ────────────────────
  const denominationTotal = useMemo(() => {
    return DENOMINATIONS.reduce((sum, d) => {
      const qty = parseInt(denominations[d.value]) || 0;
      return sum + d.value * qty;
    }, 0);
  }, [denominations]);

  const expectedBalance = cashRegister
    ? Math.round((cashRegister.openingBalance + cashRegister.totalCashIn - cashRegister.totalCashOut) * 100) / 100
    : 0;

  const difference = Math.round((denominationTotal - expectedBalance) * 100) / 100;

  // ─── Handlers ────────────────────────────────────────────
  const handleOpenRegister = () => {
    const balance = parseFloat(openBalance);
    if (isNaN(balance) || balance < 0) {
      toast.error('Please enter a valid opening balance');
      return;
    }
    openCashRegister(balance, openNotes);
    setOpenDialogOpen(false);
    setOpenBalance('');
    setOpenNotes('');
    toast.success('Cash register opened successfully!');
  };

  const handleCashIn = () => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    addCashRegisterTransaction({
      type: 'cash_in',
      amount,
      description: transactionDesc || 'Cash in (petty cash)',
    });
    setCashInDialogOpen(false);
    setTransactionAmount('');
    setTransactionDesc('');
    toast.success(`${formatCurrency(amount)} added to register`);
  };

  const handleCashOut = () => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (cashRegister && amount > cashRegister.currentBalance) {
      toast.error('Insufficient balance in register');
      return;
    }
    addCashRegisterTransaction({
      type: 'cash_out',
      amount,
      description: transactionDesc || 'Cash out (expense)',
    });
    setCashOutDialogOpen(false);
    setTransactionAmount('');
    setTransactionDesc('');
    toast.success(`${formatCurrency(amount)} removed from register`);
  };

  const handleTip = () => {
    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    addCashRegisterTransaction({
      type: 'tip',
      amount,
      description: transactionDesc || 'Tip received',
    });
    setTipDialogOpen(false);
    setTransactionAmount('');
    setTransactionDesc('');
    toast.success(`${formatCurrency(amount)} tip recorded`);
  };

  const handleCloseRegister = () => {
    closeCashRegister(denominationTotal, closeNotes);
    setCloseDialogOpen(false);
    setCloseNotes('');
    setDenominations(Object.fromEntries(DENOMINATIONS.map((d) => [d.value, ''])));
    toast.success('Cash register closed successfully!');
  };

  // ─── Last close summary ─────────────────────────────────
  const lastSummary = cashRegisterHistory.length > 0
    ? cashRegisterHistory[cashRegisterHistory.length - 1]
    : null;

  // ═══════════════════════════════════════════════════════════
  // RENDER: Register CLOSED
  // ═══════════════════════════════════════════════════════════
  if (!cashRegister) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-red-500" />
              Cash Register
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Open your register to start accepting payments
            </p>
          </div>
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 gap-1.5 text-sm px-3 py-1 self-start">
            <Lock className="w-3.5 h-3.5" />
            CLOSED
          </Badge>
        </div>

        {/* Last Close Summary */}
        {lastSummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Last Close Summary — {formatDate(lastSummary.closedAt)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Opening Balance</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(lastSummary.openingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Sales</p>
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(lastSummary.totalSales)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {lastSummary.totalOrders}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Closing Balance</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(lastSummary.closingBalance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Open Register Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center max-w-md mx-auto">
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Unlock className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Open Cash Register
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Enter the starting cash balance in your drawer to begin the day
                </p>

                {/* Opening Balance Input */}
                <div className="w-full mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Opening Balance
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={openBalance}
                      onChange={(e) => setOpenBalance(e.target.value)}
                      className="pl-9 h-12 text-lg text-center font-semibold border-emerald-300 dark:border-emerald-700 focus-visible:ring-emerald-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {QUICK_OPEN_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      className="border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                      onClick={() => setOpenBalance(amount.toString())}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>

                {/* Notes */}
                <div className="w-full mb-6">
                  <Input
                    placeholder="Notes (optional)"
                    value={openNotes}
                    onChange={(e) => setOpenNotes(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                {/* Open Button */}
                <Button
                  className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleOpenRegister}
                  disabled={!openBalance || parseFloat(openBalance) < 0}
                >
                  <Unlock className="w-5 h-5 mr-2" />
                  Open Register
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Day Summaries */}
        {cashRegisterHistory.length > 1 && (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Previous Day Summaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {[...cashRegisterHistory].reverse().slice(0, 7).map((summary, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedSummary(summary);
                        setSummaryDialogOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Banknote className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatDate(summary.closedAt)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {summary.totalOrders} orders · {formatCurrency(summary.totalSales)} sales
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(summary.closingBalance)}
                        </p>
                        <p className={`text-xs ${summary.difference === 0 ? 'text-emerald-600' : summary.difference > 0 ? 'text-sky-600' : 'text-red-600'}`}>
                          {summary.difference === 0 ? 'Balanced' : summary.difference > 0 ? `+${formatCurrency(summary.difference)} over` : `${formatCurrency(summary.difference)} short`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Day Summary Detail Dialog */}
        <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Day Summary</DialogTitle>
              <DialogDescription>
                {selectedSummary ? formatDate(selectedSummary.closedAt) : ''}
              </DialogDescription>
            </DialogHeader>
            {selectedSummary && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Opening Balance</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(selectedSummary.openingBalance)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Sales</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedSummary.totalSales)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cash In</p>
                    <p className="text-lg font-bold text-sky-600 dark:text-sky-400">{formatCurrency(selectedSummary.totalCashIn)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cash Out</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(selectedSummary.totalCashOut)}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Expected Balance</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(selectedSummary.expectedBalance)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Actual Balance</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(selectedSummary.actualBalance)}</p>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${selectedSummary.difference === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : selectedSummary.difference > 0 ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Difference</p>
                  <p className={`text-lg font-bold ${selectedSummary.difference === 0 ? 'text-emerald-600 dark:text-emerald-400' : selectedSummary.difference > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-red-600 dark:text-red-400'}`}>
                    {selectedSummary.difference === 0 ? '✓ Balanced' : `${selectedSummary.difference > 0 ? '+' : ''}${formatCurrency(selectedSummary.difference)}`}
                  </p>
                </div>
                {selectedSummary.notes && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedSummary.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSummaryDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: Register OPEN
  // ═══════════════════════════════════════════════════════════

  const netCashInOut = cashRegister.totalCashIn - cashRegister.totalCashOut;

  return (
    <div className="space-y-6">
      {/* ─── Header Bar ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800"
      >
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 gap-1.5 text-sm px-3 py-1">
            <motion.span
              className="w-2 h-2 rounded-full bg-emerald-500 inline-block"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            OPEN
          </Badge>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Opened at {cashRegister.openedAt ? formatTime(cashRegister.openedAt) : '—'}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <Timer className="w-4 h-4" />
            <span>Running {cashRegister.openedAt ? getDuration(cashRegister.openedAt) : '—'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            onClick={() => setCloseDialogOpen(true)}
          >
            <Lock className="w-4 h-4 mr-1" />
            Close Register
          </Button>
        </div>
      </motion.div>

      {/* ─── Balance Summary Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Opening Balance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Opening Balance</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(cashRegister.openingBalance)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cash Sales */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Cash Sales</span>
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(cashRegister.totalSales)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {cashRegister.totalOrders} orders
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cash In/Out */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${netCashInOut >= 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  {netCashInOut >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Cash In/Out</span>
              </div>
              <p className={`text-xl font-bold ${netCashInOut >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                {netCashInOut >= 0 ? '+' : ''}{formatCurrency(netCashInOut)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                In: {formatCurrency(cashRegister.totalCashIn)} · Out: {formatCurrency(cashRegister.totalCashOut)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Balance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-gray-900 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Current Balance</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(cashRegister.currentBalance)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="flex flex-wrap gap-3">
        <Dialog open={cashInDialogOpen} onOpenChange={setCashInDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 gap-2">
              <Plus className="w-4 h-4" />
              Cash In
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-600" /> Cash In
              </DialogTitle>
              <DialogDescription>Add petty cash or extra funds to the register</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="pl-9 h-11 text-lg font-semibold"
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Input
                  placeholder="e.g., Petty cash, Change"
                  value={transactionDesc}
                  onChange={(e) => setTransactionDesc(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCashInDialogOpen(false)}>Cancel</Button>
              <Button className="bg-sky-600 hover:bg-sky-700 text-white" onClick={handleCashIn}>
                Add Cash
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={cashOutDialogOpen} onOpenChange={setCashOutDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2">
              <Minus className="w-4 h-4" />
              Cash Out
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Minus className="w-5 h-5 text-red-600" /> Cash Out
              </DialogTitle>
              <DialogDescription>Remove cash for expenses or withdrawals</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="pl-9 h-11 text-lg font-semibold"
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Available: {formatCurrency(cashRegister.currentBalance)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Input
                  placeholder="e.g., Vendor payment, Expense"
                  value={transactionDesc}
                  onChange={(e) => setTransactionDesc(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCashOutDialogOpen(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleCashOut}>
                Remove Cash
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={tipDialogOpen} onOpenChange={setTipDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 gap-2">
              <HandCoins className="w-4 h-4" />
              Record Tip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-amber-600" /> Record Tip
              </DialogTitle>
              <DialogDescription>Record a tip received from a customer</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="pl-9 h-11 text-lg font-semibold"
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
                <Input
                  placeholder="e.g., Customer tip"
                  value={transactionDesc}
                  onChange={(e) => setTransactionDesc(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTipDialogOpen(false)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleTip}>
                Record Tip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ─── Recent Transactions ─── */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Recent Transactions
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {cashRegister.transactions.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {cashRegister.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Receipt className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No transactions yet</p>
              <p className="text-xs mt-1">Transactions will appear here as sales and cash movements occur</p>
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {[...cashRegister.transactions].reverse().map((tx, idx) => {
                  const txInfo = getTransactionIcon(tx.type);
                  const TxIcon = txInfo.icon;
                  const isIn = tx.type === 'sale' || tx.type === 'cash_in' || tx.type === 'tip';
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${txInfo.bg}`}>
                        <TxIcon className={`w-4 h-4 ${txInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(tx.timestamp)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-semibold ${isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isIn ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Bal: {formatCurrency(tx.runningBalance)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* ─── Close Register Button (Mobile) ─── */}
      <div className="sm:hidden">
        <Button
          className="w-full h-12 text-base font-semibold bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setCloseDialogOpen(true)}
        >
          <Lock className="w-5 h-5 mr-2" />
          Close Register
        </Button>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CLOSE REGISTER DIALOG                                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" /> Close Cash Register
            </DialogTitle>
            <DialogDescription>
              Count your cash drawer and confirm the closing balance
            </DialogDescription>
          </DialogHeader>

          {/* Day Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Day Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Opening</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(cashRegister.openingBalance)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sales</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(cashRegister.totalSales)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-900/20">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cash In</p>
                <p className="text-sm font-bold text-sky-600 dark:text-sky-400">{formatCurrency(cashRegister.totalCashIn)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cash Out</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(cashRegister.totalCashOut)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Balance</p>
                <p className="text-base font-bold text-amber-700 dark:text-amber-400">{formatCurrency(expectedBalance)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Orders</p>
                <p className="text-base font-bold text-gray-900 dark:text-gray-100">{cashRegister.totalOrders}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Denomination Counting */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Count Cash Denominations
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DENOMINATIONS.map((d) => (
                <div key={d.value} className="flex items-center gap-2">
                  <div className="w-16 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0">
                    {d.label}
                  </div>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={denominations[d.value]}
                    onChange={(e) =>
                      setDenominations((prev) => ({ ...prev, [d.value]: e.target.value }))
                    }
                    className="h-10 text-center text-sm font-semibold w-20"
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    = {formatCurrency(d.value * (parseInt(denominations[d.value]) || 0))}
                  </span>
                </div>
              ))}
            </div>

            {/* Denomination Total & Difference */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Counted Total</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(denominationTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Balance</span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(expectedBalance)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Difference</span>
                {difference === 0 ? (
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-5 h-5" />
                    Balanced
                  </span>
                ) : difference > 0 ? (
                  <span className="text-lg font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                    <TrendingUp className="w-5 h-5" />
                    +{formatCurrency(difference)} over
                  </span>
                ) : (
                  <span className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-5 h-5" />
                    {formatCurrency(difference)} short
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Closing Notes (optional)</label>
            <Input
              placeholder="Any notes about the day..."
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              className="h-10"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCloseRegister}
            >
              <Lock className="w-4 h-4 mr-1" />
              Close Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
