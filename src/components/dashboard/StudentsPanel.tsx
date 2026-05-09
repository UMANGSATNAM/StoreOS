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
  GraduationCap,
  Plus,
  CheckCircle,
  IndianRupee,
  Search,
  User,
  Wallet,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  parentPhone: string | null;
  batch: string | null;
  course: string | null;
  feeTotal: number;
  feePaid: number;
  status: string;
  enrollDate: string;
  createdAt: string;
}

export default function StudentsPanel() {
  const store = useAppStore((s) => s.store);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [payFeeDialogOpen, setPayFeeDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Attendance
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});

  // Add form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formBatch, setFormBatch] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formFeeTotal, setFormFeeTotal] = useState('');

  const fetchStudents = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/students?storeId=${store.id}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone && s.phone.includes(search)) ||
    (s.batch && s.batch.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === 'active').length,
    feeCollected: students.reduce((sum, s) => sum + (s.feePaid || 0), 0),
    feePending: students.reduce((sum, s) => sum + ((s.feeTotal || 0) - (s.feePaid || 0)), 0),
  };

  const handleAddStudent = async () => {
    if (!store?.id || !formName) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          name: formName,
          phone: formPhone || undefined,
          email: formEmail || undefined,
          parentPhone: formParentPhone || undefined,
          batch: formBatch || undefined,
          course: formCourse || undefined,
          feeTotal: formFeeTotal || 0,
        }),
      });
      if (res.ok) {
        toast.success(`${formName} enrolled successfully`);
        setAddDialogOpen(false);
        setFormName('');
        setFormPhone('');
        setFormEmail('');
        setFormParentPhone('');
        setFormBatch('');
        setFormCourse('');
        setFormFeeTotal('');
        fetchStudents();
      } else {
        toast.error('Failed to add student');
      }
    } catch {
      toast.error('Failed to add student');
    }
  };

  const handlePayFee = async () => {
    if (!selectedStudent || !payAmount) return;
    const amount = parseFloat(payAmount);
    const balance = (selectedStudent.feeTotal || 0) - (selectedStudent.feePaid || 0);
    if (amount > balance) {
      toast.error(`Amount exceeds pending balance of ₹${balance.toLocaleString('en-IN')}`);
      return;
    }
    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payAmount: amount }),
      });
      if (res.ok) {
        toast.success(`₹${amount.toLocaleString('en-IN')} fee collected from ${selectedStudent.name}`);
        setPayFeeDialogOpen(false);
        setSelectedStudent(null);
        setPayAmount('');
        fetchStudents();
      }
    } catch {
      toast.error('Failed to record payment');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Students
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage student enrollment and fee collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setAttendanceMap(students.reduce((acc, s) => ({ ...acc, [s.id]: true }), {}));
              setAttendanceDialogOpen(true);
            }}
          >
            <Clock className="w-4 h-4 mr-2" />
            Attendance
          </Button>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fee Collected</p>
                <p className="text-xl font-bold">₹{stats.feeCollected.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fee Pending</p>
                <p className="text-xl font-bold text-red-600">₹{stats.feePending.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Students Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <GraduationCap className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">No students found</p>
          <p className="text-sm mt-1">Enroll your first student</p>
          <Button onClick={() => setAddDialogOpen(true)} className="mt-4 bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
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
                  <TableHead>Batch</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Fee Total</TableHead>
                  <TableHead>Fee Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const balance = (student.feeTotal || 0) - (student.feePaid || 0);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{student.phone || '—'}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{student.batch || '—'}</Badge></TableCell>
                      <TableCell className="text-sm text-gray-500">{student.course || '—'}</TableCell>
                      <TableCell className="text-sm">₹{(student.feeTotal || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-sm text-emerald-600">₹{(student.feePaid || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        {balance > 0 ? (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0 text-[10px]">
                            ₹{balance.toLocaleString('en-IN')}
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">Clear</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={student.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0 text-[10px]'
                        }>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {balance > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(student);
                              setPayAmount('');
                              setPayFeeDialogOpen(true);
                            }}
                            className="text-emerald-600"
                          >
                            <IndianRupee className="w-3 h-3 mr-1" />
                            Collect
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 max-h-[calc(100vh-32rem)] overflow-y-auto">
            {filteredStudents.map((student) => {
              const balance = (student.feeTotal || 0) - (student.feePaid || 0);
              return (
                <Card key={student.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.phone || 'No phone'}</p>
                        </div>
                      </div>
                      <Badge className={student.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0 text-[10px]'
                      }>
                        {student.status}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                      {student.batch && <Badge variant="outline" className="text-[10px]">{student.batch}</Badge>}
                      {student.course && <span>{student.course}</span>}
                    </div>
                    <div className="mt-3 flex justify-between text-sm">
                      <span>Total: ₹{(student.feeTotal || 0).toLocaleString('en-IN')}</span>
                      <span className="text-emerald-600">Paid: ₹{(student.feePaid || 0).toLocaleString('en-IN')}</span>
                    </div>
                    {balance > 0 && (
                      <div className="mt-2 flex items-center justify-between">
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0 text-[10px]">
                          Balance: ₹{balance.toLocaleString('en-IN')}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent(student);
                            setPayAmount('');
                            setPayFeeDialogOpen(true);
                          }}
                          className="text-emerald-600 h-7 text-xs"
                        >
                          <IndianRupee className="w-3 h-3 mr-1" />
                          Collect Fee
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Add Student Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enroll New Student</DialogTitle>
            <DialogDescription>Add a new student to the coaching centre</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Student name" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="9876543210" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Parent Phone</Label>
                <Input value={formParentPhone} onChange={(e) => setFormParentPhone(e.target.value)} placeholder="Parent's phone" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Batch</Label>
                <Input value={formBatch} onChange={(e) => setFormBatch(e.target.value)} placeholder="e.g. Morning A" />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Input value={formCourse} onChange={(e) => setFormCourse(e.target.value)} placeholder="e.g. JEE Prep" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total Fee (₹)</Label>
              <Input type="number" value={formFeeTotal} onChange={(e) => setFormFeeTotal(e.target.value)} placeholder="25000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStudent} disabled={!formName} className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Enroll Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Collection Dialog */}
      <Dialog open={payFeeDialogOpen} onOpenChange={setPayFeeDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Collect Fee</DialogTitle>
            <DialogDescription>
              {selectedStudent?.name} — Balance: ₹{((selectedStudent?.feeTotal || 0) - (selectedStudent?.feePaid || 0)).toLocaleString('en-IN')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Fee</span>
                <span>₹{(selectedStudent?.feeTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Already Paid</span>
                <span>₹{(selectedStudent?.feePaid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-red-600">
                <span>Pending</span>
                <span>₹{((selectedStudent?.feeTotal || 0) - (selectedStudent?.feePaid || 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount to Collect (₹)</Label>
              <Input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="flex gap-2">
              {((selectedStudent?.feeTotal || 0) - (selectedStudent?.feePaid || 0)) > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPayAmount(String((selectedStudent?.feeTotal || 0) - (selectedStudent?.feePaid || 0)))}
                  >
                    Full Amount
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPayAmount(String(Math.floor(((selectedStudent?.feeTotal || 0) - (selectedStudent?.feePaid || 0)) / 2)))}
                  >
                    Half
                  </Button>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayFeeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePayFee} disabled={!payAmount} className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
              <IndianRupee className="w-4 h-4 mr-2" />
              Collect ₹{payAmount ? parseFloat(payAmount).toLocaleString('en-IN') : '0'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>
              Mark attendance for {attendanceDate}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mb-4">
            <Label>Date</Label>
            <Input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{student.name}</p>
                    {student.batch && <p className="text-xs text-gray-500">{student.batch}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={attendanceMap[student.id] ? 'default' : 'outline'}
                    onClick={() => setAttendanceMap((prev) => ({ ...prev, [student.id]: true }))}
                    className={attendanceMap[student.id] ? 'bg-emerald-600 h-7 text-xs' : 'h-7 text-xs'}
                  >
                    P
                  </Button>
                  <Button
                    size="sm"
                    variant={attendanceMap[student.id] === false ? 'default' : 'outline'}
                    onClick={() => setAttendanceMap((prev) => ({ ...prev, [student.id]: false }))}
                    className={attendanceMap[student.id] === false ? 'bg-red-600 h-7 text-xs' : 'h-7 text-xs'}
                  >
                    A
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { toast.success('Attendance saved'); setAttendanceDialogOpen(false); }} className="bg-emerald-600 min-h-[44px] hover:bg-emerald-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
