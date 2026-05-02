'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Car,
  Plus,
  CheckCircle,
  Wrench,
  Search,
  IndianRupee,
  Clock,
  History,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

interface VehicleItem {
  id: string;
  registrationNumber: string;
  make: string | null;
  model: string | null;
  year: number | null;
  ownerName: string | null;
  ownerPhone: string | null;
  lastServiceDate: string | null;
  createdAt: string;
}

interface JobCard {
  id: string;
  vehicleId: string;
  services: string;
  parts: string;
  labourCost: number;
  partsCost: number;
  status: string;
  createdAt: string;
}

export default function VehiclesPanel() {
  const store = useAppStore((s) => s.store);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [jobCardDialogOpen, setJobCardDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleItem | null>(null);

  // Job cards (local state - in production would be from API)
  const [jobCards, setJobCards] = useState<JobCard[]>([]);

  // Add form
  const [formReg, setFormReg] = useState('');
  const [formMake, setFormMake] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formOwner, setFormOwner] = useState('');
  const [formOwnerPhone, setFormOwnerPhone] = useState('');

  // Job card form
  const [jcServices, setJcServices] = useState('');
  const [jcParts, setJcParts] = useState('');
  const [jcLabourCost, setJcLabourCost] = useState('');
  const [jcPartsCost, setJcPartsCost] = useState('');

  const fetchVehicles = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles?storeId=${store.id}`);
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filteredVehicles = vehicles.filter((v) =>
    v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    (v.make && v.make.toLowerCase().includes(search.toLowerCase())) ||
    (v.ownerName && v.ownerName.toLowerCase().includes(search.toLowerCase()))
  );

  const activeJobs = jobCards.filter((j) => j.status === 'in_progress').length;
  const completedToday = jobCards.filter((j) => {
    if (j.status !== 'completed') return false;
    return new Date(j.createdAt).toDateString() === new Date().toDateString();
  }).length;

  const stats = {
    total: vehicles.length,
    activeJobs,
    completedToday,
  };

  const handleAddVehicle = async () => {
    if (!store?.id || !formReg) return;
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          registrationNumber: formReg,
          make: formMake || undefined,
          model: formModel || undefined,
          year: formYear ? parseInt(formYear) : undefined,
          ownerName: formOwner || undefined,
          ownerPhone: formOwnerPhone || undefined,
        }),
      });
      if (res.ok) {
        toast.success(`Vehicle ${formReg} registered`);
        setAddDialogOpen(false);
        setFormReg('');
        setFormMake('');
        setFormModel('');
        setFormYear('');
        setFormOwner('');
        setFormOwnerPhone('');
        fetchVehicles();
      } else {
        toast.error('Failed to register vehicle');
      }
    } catch {
      toast.error('Failed to register vehicle');
    }
  };

  const handleCreateJobCard = () => {
    if (!selectedVehicle || !jcServices) return;
    const newJob: JobCard = {
      id: `jc-${Date.now()}`,
      vehicleId: selectedVehicle.id,
      services: jcServices,
      parts: jcParts,
      labourCost: parseFloat(jcLabourCost) || 0,
      partsCost: parseFloat(jcPartsCost) || 0,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    };
    setJobCards((prev) => [newJob, ...prev]);
    toast.success(`Job card created for ${selectedVehicle.registrationNumber}`);
    setJobCardDialogOpen(false);
    setJcServices('');
    setJcParts('');
    setJcLabourCost('');
    setJcPartsCost('');
    setSelectedVehicle(null);
  };

  const completeJobCard = (jobId: string) => {
    setJobCards((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'completed' } : j))
    );
    toast.success('Job card marked as completed');
  };

  const vehicleHistory = selectedVehicle
    ? jobCards.filter((j) => j.vehicleId === selectedVehicle.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Vehicle Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Register vehicles, create job cards, and track service history
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                <Car className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Vehicles</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active Jobs</p>
                <p className="text-xl font-bold text-amber-600">{stats.activeJobs}</p>
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed Today</p>
                <p className="text-xl font-bold text-emerald-600">{stats.completedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by registration, make, owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Active Job Cards */}
      {jobCards.filter((j) => j.status === 'in_progress').length > 0 && (
        <Card className="shadow-sm border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              Active Job Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobCards.filter((j) => j.status === 'in_progress').map((job) => {
                const vehicle = vehicles.find((v) => v.id === job.vehicleId);
                return (
                  <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{vehicle?.registrationNumber || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.services}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>Labour: ₹{job.labourCost.toLocaleString('en-IN')}</span>
                        <span>Parts: ₹{job.partsCost.toLocaleString('en-IN')}</span>
                        <span className="font-medium text-amber-600">Total: ₹{(job.labourCost + job.partsCost).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => completeJobCard(job.id)} className="text-emerald-600 mt-2 sm:mt-0 shrink-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicles Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Car className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">No vehicles found</p>
          <p className="text-sm mt-1">Register your first vehicle</p>
          <Button onClick={() => setAddDialogOpen(true)} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Last Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => {
                  const hasActiveJob = jobCards.some((j) => j.vehicleId === vehicle.id && j.status === 'in_progress');
                  return (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                            <Car className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          {vehicle.registrationNumber}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {vehicle.make || '—'} {vehicle.model || ''}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{vehicle.year || '—'}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{vehicle.ownerName || '—'}</p>
                          {vehicle.ownerPhone && (
                            <p className="text-xs text-gray-500">{vehicle.ownerPhone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString('en-IN') : '—'}
                      </TableCell>
                      <TableCell>
                        {hasActiveJob ? (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0 text-[10px]">In Service</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">Idle</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setJcServices('');
                              setJcParts('');
                              setJcLabourCost('');
                              setJcPartsCost('');
                              setJobCardDialogOpen(true);
                            }}
                            className="text-amber-600 h-7 text-xs"
                          >
                            <ClipboardList className="w-3 h-3 mr-1" />
                            Job Card
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setHistoryDialogOpen(true);
                            }}
                            className="h-7 text-xs"
                          >
                            <History className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 max-h-[calc(100vh-28rem)] overflow-y-auto">
            {filteredVehicles.map((vehicle) => {
              const hasActiveJob = jobCards.some((j) => j.vehicleId === vehicle.id && j.status === 'in_progress');
              return (
                <Card key={vehicle.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                          <Car className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium">{vehicle.registrationNumber}</p>
                          <p className="text-xs text-gray-500">{vehicle.make || ''} {vehicle.model || ''} {vehicle.year || ''}</p>
                        </div>
                      </div>
                      {hasActiveJob ? (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0 text-[10px]">In Service</Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">Idle</Badge>
                      )}
                    </div>
                    {vehicle.ownerName && (
                      <p className="text-xs text-gray-500 mt-2">Owner: {vehicle.ownerName} {vehicle.ownerPhone ? `· ${vehicle.ownerPhone}` : ''}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setJcServices('');
                          setJcParts('');
                          setJcLabourCost('');
                          setJcPartsCost('');
                          setJobCardDialogOpen(true);
                        }}
                        className="text-amber-600 flex-1 h-8 text-xs"
                      >
                        <ClipboardList className="w-3 h-3 mr-1" />
                        Job Card
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setHistoryDialogOpen(true);
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <History className="w-3 h-3 mr-1" />
                        History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Vehicle</DialogTitle>
            <DialogDescription>Add a new vehicle to the garage</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Number *</Label>
                <Input value={formReg} onChange={(e) => setFormReg(e.target.value.toUpperCase())} placeholder="MH12AB1234" />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={formYear} onChange={(e) => setFormYear(e.target.value)} placeholder="2023" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Make</Label>
                <Input value={formMake} onChange={(e) => setFormMake(e.target.value)} placeholder="Toyota" />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input value={formModel} onChange={(e) => setFormModel(e.target.value)} placeholder="Camry" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Owner Name</Label>
                <Input value={formOwner} onChange={(e) => setFormOwner(e.target.value)} placeholder="Owner name" />
              </div>
              <div className="space-y-2">
                <Label>Owner Phone</Label>
                <Input value={formOwnerPhone} onChange={(e) => setFormOwnerPhone(e.target.value)} placeholder="9876543210" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddVehicle} disabled={!formReg} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Card Dialog */}
      <Dialog open={jobCardDialogOpen} onOpenChange={setJobCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Job Card</DialogTitle>
            <DialogDescription>
              Vehicle: {selectedVehicle?.registrationNumber} — {selectedVehicle?.make} {selectedVehicle?.model}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Services *</Label>
              <Textarea
                value={jcServices}
                onChange={(e) => setJcServices(e.target.value)}
                placeholder="e.g. Oil change, Brake pad replacement, Wheel alignment"
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Parts</Label>
              <Textarea
                value={jcParts}
                onChange={(e) => setJcParts(e.target.value)}
                placeholder="e.g. Brake pads × 2, Oil filter × 1"
                className="min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Labour Cost (₹)</Label>
                <Input type="number" value={jcLabourCost} onChange={(e) => setJcLabourCost(e.target.value)} placeholder="500" />
              </div>
              <div className="space-y-2">
                <Label>Parts Cost (₹)</Label>
                <Input type="number" value={jcPartsCost} onChange={(e) => setJcPartsCost(e.target.value)} placeholder="1200" />
              </div>
            </div>
            {(jcLabourCost || jcPartsCost) && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Estimated Total: ₹{((parseFloat(jcLabourCost) || 0) + (parseFloat(jcPartsCost) || 0)).toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobCardDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateJobCard} disabled={!jcServices} className="bg-emerald-600 hover:bg-emerald-700">
              <ClipboardList className="w-4 h-4 mr-2" />
              Create Job Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Service History</DialogTitle>
            <DialogDescription>
              {selectedVehicle?.registrationNumber} — {selectedVehicle?.make} {selectedVehicle?.model}
            </DialogDescription>
          </DialogHeader>
          {vehicleHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No service history yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {vehicleHistory.map((job) => (
                <div key={job.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{job.services}</span>
                    {job.status === 'completed' ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">Completed</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0 text-[10px]">In Progress</Badge>
                    )}
                  </div>
                  {job.parts && <p className="text-xs text-gray-500 mt-1">Parts: {job.parts}</p>}
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span>Labour: ₹{job.labourCost.toLocaleString('en-IN')}</span>
                    <span>Parts: ₹{job.partsCost.toLocaleString('en-IN')}</span>
                    <span className="font-medium">Total: ₹{(job.labourCost + job.partsCost).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(job.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
