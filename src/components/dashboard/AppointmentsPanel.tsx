'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  CheckCircle,
  XCircle,
  PlayCircle,
  Calendar,
  List,
} from 'lucide-react';
import { toast } from 'sonner';

interface AppointmentItem {
  id: string;
  customerName: string;
  customerPhone: string | null;
  service: string;
  staffName: string | null;
  date: string;
  duration: number;
  status: string;
  notes: string | null;
}

export default function AppointmentsPanel() {
  const store = useAppStore((s) => s.store);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Add form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formService, setFormService] = useState('');
  const [formStaff, setFormStaff] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState('30');
  const [formNotes, setFormNotes] = useState('');

  const fetchAppointments = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?storeId=${store.id}&date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [store?.id, selectedDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const todayAppts = appointments;
  const stats = {
    total: todayAppts.length,
    scheduled: todayAppts.filter((a) => a.status === 'scheduled').length,
    inProgress: todayAppts.filter((a) => a.status === 'in_progress').length,
    completed: todayAppts.filter((a) => a.status === 'completed').length,
  };

  const handleAddAppointment = async () => {
    if (!store?.id || !formName || !formService || !formDate || !formTime) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          customerName: formName,
          customerPhone: formPhone || undefined,
          service: formService,
          staffName: formStaff || undefined,
          date: `${formDate}T${formTime}:00`,
          duration: parseInt(formDuration) || 30,
          notes: formNotes || undefined,
        }),
      });
      if (res.ok) {
        toast.success('Appointment scheduled');
        setAddDialogOpen(false);
        setFormName('');
        setFormPhone('');
        setFormService('');
        setFormStaff('');
        setFormDate('');
        setFormTime('');
        setFormDuration('30');
        setFormNotes('');
        fetchAppointments();
      } else {
        toast.error('Failed to add appointment');
      }
    } catch {
      toast.error('Failed to add appointment');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success('Appointment status updated');
        fetchAppointments();
      } else {
        toast.error('Failed to update appointment');
      }
    } catch {
      toast.error('Failed to update appointment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 border-0 text-[10px]">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-0 text-[10px]">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0 text-[10px]">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-0 text-[10px]">{status}</Badge>;
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Calendar view: time slots
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // 8 AM to 7 PM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const staffList = [...new Set(appointments.map((a) => a.staffName).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Appointments
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your salon/clinic appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-emerald-600' : ''}
          >
            <List className="w-4 h-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? 'bg-emerald-600' : ''}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Calendar
          </Button>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Appointment
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled</p>
                <p className="text-xl font-bold text-sky-600">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                <p className="text-xl font-bold text-amber-600">{stats.inProgress}</p>
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium">Date:</Label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <CalendarDays className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No appointments for this date</p>
            <p className="text-sm mt-1">Schedule your first appointment</p>
            <Button onClick={() => setAddDialogOpen(true)} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Appointment
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-28rem)] overflow-y-auto">
            {appointments.map((appt) => (
              <Card key={appt.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{appt.customerName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{appt.service}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(appt.date)} · {appt.duration}min
                          </span>
                          {appt.staffName && (
                            <span className="text-xs text-gray-500">· Staff: {appt.staffName}</span>
                          )}
                          {appt.customerPhone && (
                            <span className="text-xs text-gray-500">· {appt.customerPhone}</span>
                          )}
                        </div>
                        {appt.notes && (
                          <p className="text-xs text-gray-400 mt-1">{appt.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(appt.status)}
                      {appt.status === 'scheduled' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(appt.id, 'in_progress')} className="text-amber-600">
                          Start
                        </Button>
                      )}
                      {appt.status === 'in_progress' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(appt.id, 'completed')} className="text-emerald-600">
                          Complete
                        </Button>
                      )}
                      {(appt.status === 'scheduled' || appt.status === 'in_progress') && (
                        <Button size="sm" variant="ghost" onClick={() => handleStatusChange(appt.id, 'cancelled')} className="text-red-500">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Calendar View */
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr]">
            {/* Header row */}
            <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500">
              Time
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(staffList.length, 1)}, 1fr)` }}>
              {staffList.length > 0 ? staffList.map((staff) => (
                <div key={staff} className="text-xs font-medium text-gray-500 text-center truncate">
                  {staff}
                </div>
              )) : (
                <div className="text-xs font-medium text-gray-500 text-center">All Staff</div>
              )}
            </div>

            {/* Time slots */}
            {timeSlots.map((slot) => {
              const slotHour = parseInt(slot.split(':')[0]);
              const slotAppts = appointments.filter((a) => {
                const apptHour = new Date(a.date).getHours();
                return apptHour === slotHour;
              });

              return (
                <React.Fragment key={slot}>
                  <div className="p-2 border-b border-r border-gray-200 dark:border-gray-700 text-xs text-gray-500 flex items-start justify-center pt-3">
                    {slot}
                  </div>
                  <div
                    className="p-1 border-b border-gray-200 dark:border-gray-700 min-h-[48px] grid gap-1"
                    style={{ gridTemplateColumns: `repeat(${Math.max(staffList.length, 1)}, 1fr)` }}
                  >
                    {slotAppts.map((appt) => (
                      <button
                        key={appt.id}
                        onClick={() => {
                          if (appt.status === 'scheduled') handleStatusChange(appt.id, 'in_progress');
                          else if (appt.status === 'in_progress') handleStatusChange(appt.id, 'completed');
                        }}
                        className={`p-1.5 rounded text-[10px] leading-tight text-left transition-colors ${
                          appt.status === 'scheduled'
                            ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                            : appt.status === 'in_progress'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                              : appt.status === 'completed'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 line-through'
                        }`}
                      >
                        <p className="font-medium truncate">{appt.customerName}</p>
                        <p className="truncate opacity-75">{appt.service}</p>
                      </button>
                    ))}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Appointment Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Customer name" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="9876543210" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Service *</Label>
              <Input value={formService} onChange={(e) => setFormService(e.target.value)} placeholder="e.g. Haircut, Facial" />
            </div>
            <div className="space-y-2">
              <Label>Staff</Label>
              <Input value={formStaff} onChange={(e) => setFormStaff(e.target.value)} placeholder="Staff name" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Time *</Label>
                <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input type="number" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} min={15} step={15} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Any special notes..." className="min-h-[60px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAppointment} disabled={!formName || !formService || !formDate || !formTime} className="bg-emerald-600 hover:bg-emerald-700">
              <CalendarDays className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
