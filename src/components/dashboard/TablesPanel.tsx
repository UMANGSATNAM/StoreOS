'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  UserPlus,
  RotateCcw,
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

export default function TablesPanel() {
  const store = useAppStore((s) => s.store);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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
  };

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
        toast.success(`Table status updated`);
        fetchTables();
      } else {
        toast.error('Failed to update table');
      }
    } catch {
      toast.error('Failed to update table');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700';
      case 'occupied':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      case 'reserved':
        return 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">Available</Badge>;
      case 'occupied':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0 text-[10px]">Occupied</Badge>;
      case 'reserved':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0 text-[10px]">Reserved</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-0 text-[10px]">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'occupied':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'reserved':
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return null;
    }
  };

  const getNextStatus = (status: string) => {
    switch (status) {
      case 'available': return 'occupied';
      case 'occupied': return 'available';
      case 'reserved': return 'occupied';
      default: return 'available';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Table Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage restaurant tables and their status
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                <p className="text-xl font-bold text-emerald-600">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Occupied</p>
                <p className="text-xl font-bold text-red-600">{stats.occupied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Reserved</p>
                <p className="text-xl font-bold text-amber-600">{stats.reserved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Section:</span>
        {['all', 'indoor', 'outdoor', 'vip'].map((section) => (
          <Button
            key={section}
            variant={sectionFilter === section ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSectionFilter(section)}
            className={sectionFilter === section ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {section === 'all' ? 'All' : section === 'vip' ? 'VIP' : section.charAt(0).toUpperCase() + section.slice(1)}
          </Button>
        ))}
      </div>

      {/* Table Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 animate-pulse" />
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
          {filteredTables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleStatusChange(table.id, getNextStatus(table.status))}
              className={`relative p-4 rounded-xl border-2 transition-all hover:scale-[1.03] hover:shadow-md text-left ${getStatusColor(table.status)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold">T{table.number}</span>
                {getStatusIcon(table.status)}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>{table.capacity} seats</span>
                </div>
                {table.section && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{table.section}</p>
                )}
              </div>
              <div className="mt-3">
                {getStatusBadge(table.status)}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add Table Dialog */}
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
