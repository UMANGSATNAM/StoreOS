'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  UserCog,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Clock,
  IndianRupee,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Types ───

interface StaffMember {
  id: string;
  storeId: string;
  name: string;
  phone: string | null;
  role: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  salary: number;
  commission: number;
  isActive: boolean;
  createdAt: string;
}

type RoleFilter = 'all' | 'admin' | 'cashier' | 'manager' | 'viewer';

const PAGE_SIZE = 10;

const ROLES = ['admin', 'cashier', 'manager', 'viewer'] as const;

// ─── Skeleton Loader ───

function StaffTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// ─── Role Badge ───

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; className: string }> = {
    admin: {
      label: 'Admin',
      className: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100',
    },
    cashier: {
      label: 'Cashier',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    },
    manager: {
      label: 'Manager',
      className: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-100',
    },
    viewer: {
      label: 'Viewer',
      className: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100',
    },
  };

  const c = config[role.toLowerCase()] || config.viewer;

  return (
    <Badge className={`${c.className} border capitalize`}>
      {c.label}
    </Badge>
  );
}

// ─── Staff Form Data ───

interface StaffFormData {
  name: string;
  phone: string;
  role: string;
  shiftStart: string;
  shiftEnd: string;
  salary: string;
  commission: string;
  isActive: boolean;
}

const emptyStaffForm: StaffFormData = {
  name: '',
  phone: '',
  role: 'cashier',
  shiftStart: '',
  shiftEnd: '',
  salary: '',
  commission: '',
  isActive: true,
};

// ─── Main Component ───

export default function StaffPanel() {
  const { store } = useAppStore();
  const storeId = store?.id || '';

  // Data state
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Dialogs
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Form state
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState<StaffFormData>(emptyStaffForm);
  const [saving, setSaving] = useState(false);

  // Attendance state
  const [clockedInStaff, setClockedInStaff] = useState<Set<string>>(new Set());

  // ─── Fetch Data ───

  const fetchStaff = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/staff?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  // ─── Filtered Staff ───

  const filteredStaff = useMemo(() => {
    let result = [...staff];
    if (roleFilter !== 'all') {
      result = result.filter((s) => s.role.toLowerCase() === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.phone || '').toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q)
      );
    }
    return result;
  }, [staff, search, roleFilter]);

  // ─── Pagination ───

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE));
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ─── Staff CRUD ───

  function openAddStaff() {
    setEditingStaff(null);
    setStaffForm(emptyStaffForm);
    setStaffDialogOpen(true);
  }

  function openEditStaff(member: StaffMember) {
    setEditingStaff(member);
    setStaffForm({
      name: member.name,
      phone: member.phone || '',
      role: member.role,
      shiftStart: member.shiftStart || '',
      shiftEnd: member.shiftEnd || '',
      salary: String(member.salary),
      commission: String(member.commission),
      isActive: member.isActive,
    });
    setStaffDialogOpen(true);
  }

  async function saveStaff() {
    if (!staffForm.name.trim()) {
      toast.error('Staff name is required');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        storeId,
        name: staffForm.name.trim(),
        phone: staffForm.phone.trim() || null,
        role: staffForm.role,
        shiftStart: staffForm.shiftStart || null,
        shiftEnd: staffForm.shiftEnd || null,
        salary: staffForm.salary ? parseFloat(staffForm.salary) : 0,
        commission: staffForm.commission ? parseFloat(staffForm.commission) : 0,
        isActive: staffForm.isActive,
      };

      let res: Response;
      if (editingStaff) {
        res = await fetch(`/api/staff/${editingStaff.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(editingStaff ? 'Staff updated' : 'Staff member added');
        setStaffDialogOpen(false);
        fetchStaff();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save staff');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function deleteStaff() {
    if (!staffToDelete) return;
    try {
      const res = await fetch(`/api/staff/${staffToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Staff member removed');
        setDeleteDialogOpen(false);
        setStaffToDelete(null);
        fetchStaff();
      } else {
        toast.error('Failed to remove staff member');
      }
    } catch {
      toast.error('Network error');
    }
  }

  // ─── Attendance ───

  function toggleClockIn(staffId: string) {
    setClockedInStaff((prev) => {
      const next = new Set(prev);
      if (next.has(staffId)) {
        next.delete(staffId);
        toast.success('Clocked out');
      } else {
        next.add(staffId);
        toast.success('Clocked in');
      }
      return next;
    });
  }

  // ─── Format helpers ───

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // ─── Active staff count ───

  const activeStaff = staff.filter((s) => s.isActive);
  const todayClockedIn = activeStaff.filter((s) => clockedInStaff.has(s.id));

  // ─── Render ───

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Staff</p>
                <p className="text-xl font-bold">{staff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold text-emerald-600">{activeStaff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">On Shift</p>
                <p className="text-xl font-bold text-sky-600">{todayClockedIn.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">On Leave</p>
                <p className="text-xl font-bold text-gray-600">{staff.filter(s => !s.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserCog className="h-6 w-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-bold">Staff</h2>
            <p className="text-sm text-muted-foreground">Manage team members and attendance</p>
          </div>
          <Badge variant="secondary" className="ml-1">
            {filteredStaff.length}
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-[10px]">
            {activeStaff.length} Active
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-56"
            />
          </div>
          <Button
            onClick={openAddStaff}
            size="sm"
            className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Today's Attendance Section */}
      <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-emerald-600" />
            Today&apos;s Attendance
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border">
              {todayClockedIn.length} / {activeStaff.length} Clocked In
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeStaff.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active staff members
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeStaff.map((member) => {
                const isClockedIn = clockedInStaff.has(member.id);
                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      isClockedIn
                        ? 'border-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-700'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isClockedIn
                          ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{member.name}</span>
                    <Button
                      size="sm"
                      variant={isClockedIn ? 'outline' : 'default'}
                      className={`h-7 text-xs ${
                        isClockedIn
                          ? 'border-red-300 text-red-600 hover:bg-red-50'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                      onClick={() => toggleClockIn(member.id)}
                    >
                      {isClockedIn ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Clock Out
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Clock In
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
          <SelectTrigger className="w-36">
            <ShieldCheck className="h-4 w-4 mr-1 text-muted-foreground" />
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="cashier">Cashier</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <StaffTableSkeleton />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <UserCog className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No staff members found</p>
              <p className="text-sm">Add your first staff member to get started</p>
              <Button
                onClick={openAddStaff}
                size="sm"
                className="mt-4 bg-emerald-600 min-h-[44px] hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Staff
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold flex-shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.phone || '—'}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={member.role} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {member.shiftStart && member.shiftEnd ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {member.shiftStart} – {member.shiftEnd}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.salary > 0 ? formatCurrency(member.salary) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.commission > 0 ? `${member.commission}%` : '—'}
                      </TableCell>
                      <TableCell>
                        {member.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-[10px]">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 border-gray-200 border text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditStaff(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setStaffToDelete(member);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredStaff.length)} of{' '}
                  {filteredStaff.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <StaffTableSkeleton />
        ) : filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserCog className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No staff members found</p>
            <Button
              onClick={openAddStaff}
              size="sm"
              className="mt-4 bg-emerald-600 min-h-[44px] hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Staff
            </Button>
          </div>
        ) : (
          paginatedStaff.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-sm font-bold flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{member.name}</p>
                    <RoleBadge role={member.role} />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                    {member.phone && (
                      <span className="flex items-center gap-0.5">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </span>
                    )}
                    {member.shiftStart && member.shiftEnd && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {member.shiftStart}–{member.shiftEnd}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    {member.salary > 0 && <span>{formatCurrency(member.salary)}/mo</span>}
                    {member.commission > 0 && (
                      <span className="text-amber-600">{member.commission}% comm</span>
                    )}
                    {member.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-[10px]">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 border-gray-200 border text-[10px]">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => openEditStaff(member)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    setStaffToDelete(member);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}

        {/* Mobile Pagination */}
        {!loading && filteredStaff.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ─── Add/Edit Staff Dialog ─── */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Update staff details' : 'Fill in staff information'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="staff-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="staff-name"
                placeholder="Full name"
                value={staffForm.name}
                onChange={(e) => setStaffForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Phone + Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="staff-phone">Phone</Label>
                <Input
                  id="staff-phone"
                  placeholder="Phone number"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={staffForm.role}
                  onValueChange={(v) => setStaffForm((f) => ({ ...f, role: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Shift Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="staff-shift-start">Shift Start</Label>
                <Input
                  id="staff-shift-start"
                  type="time"
                  value={staffForm.shiftStart}
                  onChange={(e) => setStaffForm((f) => ({ ...f, shiftStart: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-shift-end">Shift End</Label>
                <Input
                  id="staff-shift-end"
                  type="time"
                  value={staffForm.shiftEnd}
                  onChange={(e) => setStaffForm((f) => ({ ...f, shiftEnd: e.target.value }))}
                />
              </div>
            </div>

            {/* Salary + Commission */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="staff-salary">Salary (Monthly)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="staff-salary"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={staffForm.salary}
                    onChange={(e) => setStaffForm((f) => ({ ...f, salary: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="staff-commission">Commission (%)</Label>
                <Input
                  id="staff-commission"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={staffForm.commission}
                  onChange={(e) => setStaffForm((f) => ({ ...f, commission: e.target.value }))}
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Active staff can log in and process orders
                  </p>
                </div>
              </div>
              <Switch
                checked={staffForm.isActive}
                onCheckedChange={(checked) => setStaffForm((f) => ({ ...f, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStaffDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveStaff}
              disabled={saving}
              className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700"
            >
              {saving ? 'Saving...' : editingStaff ? 'Update' : 'Add Staff'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Staff Confirmation ─── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{staffToDelete?.name}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteStaff}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
