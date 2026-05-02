'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  UtensilsCrossed,
  Plus,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Printer,
  ArrowRightLeft,
  Circle,
} from 'lucide-react';
import { toast } from 'sonner';

interface TableItem {
  id: string;
  number: number;
  capacity: number;
  status: string;
  section: string | null;
  updatedAt: string;
}

// ─── Mock order data for occupied tables ───
const mockTableOrders: Record<number, { amount: number; items: number; seatedAt: string }> = {
  1: { amount: 1250, items: 4, seatedAt: '12:30 PM' },
  3: { amount: 870, items: 3, seatedAt: '1:15 PM' },
  5: { amount: 2100, items: 6, seatedAt: '11:45 AM' },
  7: { amount: 560, items: 2, seatedAt: '2:00 PM' },
};

export default function TablesPanel() {
  const store = useAppStore((s) => s.store);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Add form
  const [newNumber, setNewNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');
  const [newSection, setNewSection] = useState('indoor');

  const fetchTables = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tables?storeId=${store.id}`);
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const filteredTables = sectionFilter === 'all'
    ? tables
    : tables.filter((t) => t.section === sectionFilter);

  const stats = {
    total: tables.length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    available: tables.filter((t) => t.status === 'available').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    inactive: tables.filter((t) => t.status === 'inactive').length,
  };

  const occupancyPercent = stats.total > 0
    ? Math.round((stats.occupied / stats.total) * 100)
    : 0;

  const handleAddTable = async () => {
    if (!store?.id || !newNumber) return;
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          number: parseInt(newNumber),
          capacity: parseInt(newCapacity) || 4,
          section: newSection,
        }),
      });
      if (res.ok) {
        toast.success(`Table ${newNumber} added`);
        setAddDialogOpen(false);
        setNewNumber('');
        setNewCapacity('4');
        fetchTables();
      } else {
        toast.error('Failed to add table');
      }
    } catch {
      toast.error('Failed to add table');
    }
  };

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, status: newStatus }),
      });
      if (res.ok) {
        toast.success('Table status updated');
        fetchTables();
        if (selectedTable?.id === tableId) {
          setSelectedTable({ ...selectedTable, status: newStatus });
        }
      } else {
        toast.error('Failed to update table');
      }
    } catch {
      toast.error('Failed to update table');
    }
  };

  const openTableDetail = (table: TableItem) => {
    setSelectedTable(table);
    setDetailDialogOpen(true);
  };

  // ─── Visual table styling ───

  const getTableStyle = (status: string) => {
    switch (status) {
      case 'available':
        return {
          border: 'border-emerald-400 dark:border-emerald-600',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60',
          ring: 'ring-emerald-200 dark:ring-emerald-800',
          text: 'text-emerald-700 dark:text-emerald-400',
        };
      case 'occupied':
        return {
          border: 'border-orange-400 dark:border-orange-600',
          bg: 'bg-orange-50 dark:bg-orange-950/40',
          hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-950/60',
          ring: 'ring-orange-200 dark:ring-orange-800',
          text: 'text-orange-700 dark:text-orange-400',
        };
      case 'reserved':
        return {
          border: 'border-amber-400 dark:border-amber-600',
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-950/60',
          ring: 'ring-amber-200 dark:ring-amber-800',
          text: 'text-amber-700 dark:text-amber-400',
        };
      default:
        return {
          border: 'border-gray-300 dark:border-gray-700',
          bg: 'bg-gray-50 dark:bg-gray-900/40',
          hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-900/60',
          ring: 'ring-gray-200 dark:ring-gray-800',
          text: 'text-gray-500 dark:text-gray-500',
        };
    }
  };

  const isRoundTable = (table: TableItem) => {
    // Small tables (≤4 seats) are round, larger ones are square
    return table.capacity <= 4;
  };

  // ─── Section tabs ───

  const sectionTabs = [
    { value: 'all', label: 'All Tables', count: stats.total },
    { value: 'indoor', label: 'Indoor', count: tables.filter(t => t.section === 'indoor').length },
    { value: 'outdoor', label: 'Outdoor', count: tables.filter(t => t.section === 'outdoor').length },
    { value: 'vip', label: 'VIP', count: tables.filter(t => t.section === 'vip').length },
  ];

  // ─── Format helpers ───

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Table Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Visual floor plan — manage tables and their status
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Table
        </Button>
      </div>

      {/* Enhanced Quick Stats with Progress Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-orange-500 transition-all" style={{ width: '100%' }} />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                <p className="text-xl font-bold text-emerald-600">{stats.available}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${stats.total > 0 ? (stats.available / stats.total) * 100 : 0}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Occupied</p>
                <p className="text-xl font-bold text-orange-600">{stats.occupied}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-orange-500 transition-all" style={{ width: `${occupancyPercent}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reserved</p>
                <p className="text-xl font-bold text-amber-600">{stats.reserved}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-amber-500 transition-all" style={{ width: `${stats.total > 0 ? (stats.reserved / stats.total) * 100 : 0}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Summary */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Occupancy</span>
            <span className="text-sm text-muted-foreground">
              {stats.occupied}/{stats.total} tables occupied — {occupancyPercent}%
            </span>
          </div>
          <Progress value={occupancyPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sectionTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={sectionFilter === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSectionFilter(tab.value)}
            className={`shrink-0 ${sectionFilter === tab.value ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
          >
            {tab.label}
            <Badge
              variant="secondary"
              className={`ml-1.5 text-[10px] h-5 min-w-[20px] flex items-center justify-center ${
                sectionFilter === tab.value
                  ? 'bg-emerald-700 text-emerald-100'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {tab.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Visual Table Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <UtensilsCrossed className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">No tables found</p>
          <p className="text-sm mt-1">Add your first table to get started</p>
          <Button onClick={() => setAddDialogOpen(true)} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTables.map((table) => {
            const style = getTableStyle(table.status);
            const round = isRoundTable(table);
            const orderData = table.status === 'occupied' ? mockTableOrders[table.number] : null;

            return (
              <button
                key={table.id}
                onClick={() => openTableDetail(table)}
                className={`relative p-4 rounded-xl border-2 transition-all hover:scale-[1.03] hover:shadow-lg active:scale-[0.98] text-center ${style.border} ${style.bg} ${style.hoverBg}`}
              >
                {/* Table shape indicator */}
                <div className="flex justify-center mb-2">
                  <div
                    className={`flex items-center justify-center ${
                      round ? 'w-14 h-14 rounded-full' : 'w-14 h-14 rounded-lg'
                    } border-2 ${style.border} ${style.bg}`}
                  >
                    <span className={`text-xl font-bold ${style.text}`}>T{table.number}</span>
                  </div>
                </div>

                {/* Seats */}
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-300 mb-1">
                  <Users className="w-3 h-3" />
                  <span>{table.capacity} seats</span>
                </div>

                {/* Section label */}
                {table.section && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize mb-1">{table.section}</p>
                )}

                {/* Order amount if occupied */}
                {orderData && (
                  <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mt-1">
                    {formatCurrency(orderData.amount)}
                  </p>
                )}

                {/* Status dot */}
                <div className="flex items-center justify-center gap-1 mt-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      table.status === 'available' ? 'bg-emerald-500' :
                      table.status === 'occupied' ? 'bg-orange-500' :
                      table.status === 'reserved' ? 'bg-amber-500' :
                      'bg-gray-400'
                    }`}
                  />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{table.status}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Color Legend */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Inactive</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Table Detail Dialog ─── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedTable && (() => {
            const style = getTableStyle(selectedTable.status);
            const orderData = selectedTable.status === 'occupied' ? mockTableOrders[selectedTable.number] : null;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${
                        isRoundTable(selectedTable) ? 'rounded-full' : 'rounded-lg'
                      } border-2 ${style.border} ${style.bg} flex items-center justify-center`}
                    >
                      <span className={`text-sm font-bold ${style.text}`}>T{selectedTable.number}</span>
                    </div>
                    Table {selectedTable.number}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTable.section ? (
                      <span className="capitalize">{selectedTable.section} Section</span>
                    ) : (
                      'No section assigned'
                    )}
                    {' • '}{selectedTable.capacity} seats
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Current Status */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Current Status</span>
                    <Badge
                      className={`${
                        selectedTable.status === 'available'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : selectedTable.status === 'occupied'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                            : selectedTable.status === 'reserved'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      } border-0`}
                    >
                      {selectedTable.status.charAt(0).toUpperCase() + selectedTable.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Order Details (if occupied) */}
                  {orderData && (
                    <div className="p-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 space-y-2">
                      <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300">Current Order</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                            {formatCurrency(orderData.amount)}
                          </p>
                          <p className="text-[10px] text-gray-500">Bill Amount</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                            {orderData.items}
                          </p>
                          <p className="text-[10px] text-gray-500">Items</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                            {orderData.seatedAt}
                          </p>
                          <p className="text-[10px] text-gray-500">Seated At</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        disabled={selectedTable.status === 'available'}
                        onClick={() => {
                          handleStatusChange(selectedTable.id, 'available');
                          setDetailDialogOpen(false);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                        Mark Available
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        disabled={selectedTable.status === 'occupied'}
                        onClick={() => {
                          handleStatusChange(selectedTable.id, 'occupied');
                          setDetailDialogOpen(false);
                        }}
                      >
                        <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                        Mark Occupied
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => toast.info('Transfer order — coming soon')}
                      >
                        <ArrowRightLeft className="w-4 h-4 mr-2 text-sky-600" />
                        Transfer Order
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => toast.info('Print bill — coming soon')}
                      >
                        <Printer className="w-4 h-4 mr-2 text-purple-600" />
                        Print Bill
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ─── Add Table Dialog ─── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>
              Add a new table to your restaurant layout
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Table Number</Label>
              <Input
                type="number"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="1"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacity (seats)</Label>
              <Input
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                placeholder="4"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select value={newSection} onValueChange={setNewSection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTable} disabled={!newNumber} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
