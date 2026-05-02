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
  Dumbbell,
  Plus,
  CheckCircle,
  XCircle,
  RefreshCw,
  IndianRupee,
  Users,
  Search,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

interface MemberItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
  trainerName: string | null;
  createdAt: string;
}

const PLAN_PRICES: Record<string, number> = {
  monthly: 999,
  quarterly: 2499,
  annual: 8999,
};

export default function MembersPanel() {
  const store = useAppStore((s) => s.store);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [renewPlan, setRenewPlan] = useState('monthly');

  // Add form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPlan, setFormPlan] = useState('monthly');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTrainer, setFormTrainer] = useState('');

  const fetchMembers = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/members?storeId=${store.id}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.phone && m.phone.includes(search))
  );

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    expired: members.filter((m) => m.status === 'expired').length,
    revenue: members.reduce((sum, m) => sum + (PLAN_PRICES[m.plan] || 0), 0),
  };

  const handleAddMember = async () => {
    if (!store?.id || !formName || !formPlan) return;
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          name: formName,
          phone: formPhone || undefined,
          email: formEmail || undefined,
          plan: formPlan,
          startDate: formStartDate,
          trainerName: formTrainer || undefined,
        }),
      });
      if (res.ok) {
        toast.success(`${formName} added as member`);
        setAddDialogOpen(false);
        setFormName('');
        setFormPhone('');
        setFormEmail('');
        setFormPlan('monthly');
        setFormTrainer('');
        fetchMembers();
      } else {
        toast.error('Failed to add member');
      }
    } catch {
      toast.error('Failed to add member');
    }
  };

  const handleRenew = async () => {
    if (!selectedMember) return;
    try {
      const res = await fetch(`/api/members/${selectedMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renew: true, plan: renewPlan }),
      });
      if (res.ok) {
        toast.success(`${selectedMember.name}'s membership renewed`);
        setRenewDialogOpen(false);
        setSelectedMember(null);
        fetchMembers();
      }
    } catch {
      toast.error('Failed to renew membership');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gym Members
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage memberships, renewals, and trainers
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-lime-600 dark:text-lime-400" />
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
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Expired</p>
                <p className="text-xl font-bold text-red-600">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-xl font-bold">₹{stats.revenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Members Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Dumbbell className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">No members found</p>
          <p className="text-sm mt-1">Add your first gym member</p>
          <Button onClick={() => setAddDialogOpen(true)} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center">
                          <User className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                        </div>
                        {member.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">{member.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {member.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDate(member.startDate)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDate(member.endDate)}</TableCell>
                    <TableCell className="text-sm text-gray-500">{member.trainerName || '—'}</TableCell>
                    <TableCell>
                      {member.status === 'active' && !isExpired(member.endDate) ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">Active</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0 text-[10px]">Expired</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {(member.status === 'expired' || isExpired(member.endDate)) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMember(member);
                            setRenewPlan(member.plan);
                            setRenewDialogOpen(true);
                          }}
                          className="text-emerald-600"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Renew
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 max-h-[calc(100vh-32rem)] overflow-y-auto">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.phone || 'No phone'}</p>
                      </div>
                    </div>
                    {member.status === 'active' && !isExpired(member.endDate) ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0 text-[10px]">Expired</Badge>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                    <Badge variant="outline" className="capitalize text-[10px]">{member.plan}</Badge>
                    <span>{formatDate(member.startDate)} → {formatDate(member.endDate)}</span>
                    {member.trainerName && <span>Trainer: {member.trainerName}</span>}
                  </div>
                  {(member.status === 'expired' || isExpired(member.endDate)) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMember(member);
                        setRenewPlan(member.plan);
                        setRenewDialogOpen(true);
                      }}
                      className="mt-3 w-full text-emerald-600"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Renew Membership
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add Member Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>Register a new gym member</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Member name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="9876543210" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan *</Label>
                <Select value={formPlan} onValueChange={setFormPlan}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly — ₹999</SelectItem>
                    <SelectItem value="quarterly">Quarterly — ₹2,499</SelectItem>
                    <SelectItem value="annual">Annual — ₹8,999</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Trainer</Label>
              <Input value={formTrainer} onChange={(e) => setFormTrainer(e.target.value)} placeholder="Trainer name (optional)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={!formName} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Dialog */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Membership</DialogTitle>
            <DialogDescription>
              Renew {selectedMember?.name}&apos;s membership
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Plan</Label>
              <Select value={renewPlan} onValueChange={setRenewPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly — ₹999</SelectItem>
                  <SelectItem value="quarterly">Quarterly — ₹2,499</SelectItem>
                  <SelectItem value="annual">Annual — ₹8,999</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                New membership will be active from today for {renewPlan === 'monthly' ? '1 month' : renewPlan === 'quarterly' ? '3 months' : '1 year'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRenew} className="bg-emerald-600 hover:bg-emerald-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Renew — ₹{PLAN_PRICES[renewPlan]?.toLocaleString('en-IN')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
