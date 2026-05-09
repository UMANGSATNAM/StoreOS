'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  BedDouble,
  Plus,
  CheckCircle,
  AlertCircle,
  Wrench,
  IndianRupee,
  LogIn,
  LogOut,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface RoomItem {
  id: string;
  number: string;
  type: string;
  pricePerNight: number;
  capacity: number;
  status: string;
  floor: number | null;
  amenities: string | null;
}

export default function RoomsPanel() {
  const store = useAppStore((s) => s.store);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);

  // Add form
  const [formNumber, setFormNumber] = useState('');
  const [formType, setFormType] = useState('standard');
  const [formPrice, setFormPrice] = useState('');
  const [formCapacity, setFormCapacity] = useState('2');
  const [formFloor, setFormFloor] = useState('');

  // Check-in form
  const [guestName, setGuestName] = useState('');
  const [guestIdType, setGuestIdType] = useState('aadhaar');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState('');

  const fetchRooms = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms?storeId=${store.id}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const filteredRooms = typeFilter === 'all'
    ? rooms
    : rooms.filter((r) => r.type === typeFilter);

  const stats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === 'available').length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length,
  };

  const handleAddRoom = async () => {
    if (!store?.id || !formNumber || !formPrice) return;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          number: formNumber,
          type: formType,
          pricePerNight: parseFloat(formPrice),
          capacity: parseInt(formCapacity) || 2,
          floor: formFloor ? parseInt(formFloor) : undefined,
        }),
      });
      if (res.ok) {
        toast.success(`Room ${formNumber} added`);
        setAddDialogOpen(false);
        setFormNumber('');
        setFormPrice('');
        setFormCapacity('2');
        setFormFloor('');
        fetchRooms();
      } else {
        toast.error('Failed to add room');
      }
    } catch {
      toast.error('Failed to add room');
    }
  };

  const handleCheckIn = async () => {
    if (!selectedRoom || !guestName) return;
    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'occupied' }),
      });
      if (res.ok) {
        toast.success(`Guest ${guestName} checked into Room ${selectedRoom.number}`);
        setCheckInDialogOpen(false);
        setGuestName('');
        setCheckOutDate('');
        setSelectedRoom(null);
        fetchRooms();
      }
    } catch {
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    if (!selectedRoom) return;
    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'available' }),
      });
      if (res.ok) {
        toast.success(`Room ${selectedRoom.number} checked out`);
        setCheckOutDialogOpen(false);
        setSelectedRoom(null);
        fetchRooms();
      }
    } catch {
      toast.error('Failed to check out');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700';
      case 'occupied':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      case 'maintenance':
        return 'bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-600';
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
      case 'maintenance':
        return <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0 text-[10px]">Maintenance</Badge>;
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
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Room Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage hotel rooms, check-in and check-out
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700 text-white shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance</p>
                <p className="text-xl font-bold text-gray-600">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
        {['all', 'standard', 'deluxe', 'suite'].map((type) => (
          <Button
            key={type}
            variant={typeFilter === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter(type)}
            className={typeFilter === type ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl border bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <BedDouble className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">No rooms found</p>
          <p className="text-sm mt-1">Add your first room to get started</p>
          <Button onClick={() => setAddDialogOpen(true)} className="mt-4 bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredRooms.map((room) => (
            <Card key={room.id} className={`border-2 shadow-sm hover:shadow-md transition-all ${getStatusColor(room.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold">R{room.number}</span>
                  {getStatusIcon(room.status)}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <BedDouble className="w-3.5 h-3.5" />
                    <span className="capitalize">{room.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>₹{room.pricePerNight.toLocaleString('en-IN')}/night</span>
                  </div>
                  {room.floor && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Floor {room.floor}</p>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {getStatusBadge(room.status)}
                  {room.status === 'available' && (
                    <Button size="sm" className="w-full bg-emerald-600 min-h-[44px] hover:bg-emerald-700 text-white h-7 text-xs" onClick={() => { setSelectedRoom(room); setCheckInDialogOpen(true); }}>
                      <LogIn className="w-3 h-3 mr-1" />
                      Check In
                    </Button>
                  )}
                  {room.status === 'occupied' && (
                    <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={() => { setSelectedRoom(room); setCheckOutDialogOpen(true); }}>
                      <LogOut className="w-3 h-3 mr-1" />
                      Check Out
                    </Button>
                  )}
                  {room.status === 'maintenance' && (
                    <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={async () => {
                      await fetch(`/api/rooms/${room.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'available' }) });
                      toast.success('Room marked as available');
                      fetchRooms();
                    }}>
                      Mark Available
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Room Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>Add a new room to your hotel</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Number *</Label>
                <Input value={formNumber} onChange={(e) => setFormNumber(e.target.value)} placeholder="101" />
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price/Night (₹) *</Label>
                <Input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="1500" />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)} placeholder="2" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Floor</Label>
              <Input type="number" value={formFloor} onChange={(e) => setFormFloor(e.target.value)} placeholder="1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRoom} disabled={!formNumber || !formPrice} className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check-In Guest</DialogTitle>
            <DialogDescription>
              Room {selectedRoom?.number} — {selectedRoom?.type} — ₹{selectedRoom?.pricePerNight}/night
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Guest Name *</Label>
              <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest name" />
            </div>
            <div className="space-y-2">
              <Label>ID Type</Label>
              <Select value={guestIdType} onValueChange={setGuestIdType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                  <SelectItem value="pan">PAN Card</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driving">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Check-out Date</Label>
                <Input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
              </div>
            </div>
            {checkInDate && checkOutDate && selectedRoom && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  <span className="font-medium">Estimated Total: </span>
                  ₹{((Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)) || 1) * selectedRoom.pricePerNight).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckIn} disabled={!guestName} className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
              <LogIn className="w-4 h-4 mr-2" />
              Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={checkOutDialogOpen} onOpenChange={setCheckOutDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check-Out</DialogTitle>
            <DialogDescription>
              Room {selectedRoom?.number} — {selectedRoom?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Room Rate</span>
              <span>₹{selectedRoom?.pricePerNight.toLocaleString('en-IN')}/night</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Bill Amount</span>
              <span>₹{selectedRoom?.pricePerNight.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Generate detailed bill from the Billing tab</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckOutDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCheckOut} className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
              <LogOut className="w-4 h-4 mr-2" />
              Check Out & Generate Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
