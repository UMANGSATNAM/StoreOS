'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { NICHES } from '@/lib/types';
import { toast } from 'sonner';

// shadcn/ui
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// lucide-react
import {
  Store, CreditCard, Clock, IndianRupee, TrendingDown, UserPlus,
  LogOut, Shield, Search, Eye, UserRound, Ban, CheckCircle2,
  Send, Megaphone, MessageSquare, Unlock, KeyRound, CalendarPlus,
  BarChart3, ArrowUpRight, ArrowDownRight, Activity, Wallet,
  AlertTriangle, XCircle, HelpCircle
} from 'lucide-react';

// recharts
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ============================================================
// Mock Data
// ============================================================

const INDIAN_NAMES = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Gupta', 'Vikram Singh',
  'Anita Desai', 'Suresh Reddy', 'Meena Iyer', 'Ramesh Joshi', 'Kavita Nair',
  'Deepak Mehta', 'Pooja Agarwal', 'Arjun Rao', 'Lakshmi Venkat', 'Manish Chauhan',
  'Divya Saxena', 'Nikhil Verma', 'Swati Pandey', 'Rahul Mishra', 'Neha Bhat',
];

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Indore', 'Nagpur', 'Kochi', 'Coimbatore',
];

interface MockStore {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  city: string;
  niche: string;
  nicheName: string;
  nicheIcon: string;
  plan: string;
  status: 'active' | 'trial' | 'suspended';
  revenue: number;
  created: string;
  totalOrders: number;
  totalCustomers: number;
}

interface MockTicket {
  id: string;
  store: string;
  owner: string;
  subject: string;
  priority: string;
  status: string;
  created: string;
  messages: number;
}

const MOCK_STORES: MockStore[] = Array.from({ length: 24 }, (_, i) => {
  const niche = NICHES[i % NICHES.length];
  const statuses: ('active' | 'trial' | 'suspended')[] = ['active', 'active', 'active', 'active', 'trial', 'trial', 'suspended'];
  const status = statuses[i % statuses.length];
  const plans = ['Starter', 'Pro', 'Starter', 'Enterprise', 'Starter'];
  const owner = INDIAN_NAMES[i % INDIAN_NAMES.length];
  const city = INDIAN_CITIES[i % INDIAN_CITIES.length];
  const revenue = status === 'active' ? Math.floor(Math.random() * 50000) + 5000 : status === 'trial' ? Math.floor(Math.random() * 5000) + 500 : 0;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return {
    id: `store-${i + 1}`,
    name: `${niche.icon} ${owner.split(' ')[0]}'s ${niche.name.split('/')[0].trim()}`,
    owner,
    email: `${owner.split(' ')[0].toLowerCase()}${i}@gmail.com`,
    phone: `+91 ${9000000000 + Math.floor(Math.random() * 999999999)}`,
    city,
    niche: niche.slug,
    nicheName: niche.name,
    nicheIcon: niche.icon,
    plan: plans[i % plans.length],
    status,
    revenue,
    created: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    totalOrders: Math.floor(Math.random() * 500) + 50,
    totalCustomers: Math.floor(Math.random() * 200) + 20,
  };
});

const REVENUE_MONTHLY = [
  { month: 'Sep 2024', revenue: 245000, orders: 1240, newStores: 8 },
  { month: 'Oct 2024', revenue: 298000, orders: 1520, newStores: 12 },
  { month: 'Nov 2024', revenue: 312000, orders: 1680, newStores: 15 },
  { month: 'Dec 2024', revenue: 345000, orders: 1890, newStores: 18 },
  { month: 'Jan 2025', revenue: 378000, orders: 2010, newStores: 22 },
  { month: 'Feb 2025', revenue: 425000, orders: 2340, newStores: 28 },
];

const REVENUE_BY_NICHE = [
  { niche: 'Restaurant', revenue: 185000, stores: 8 },
  { niche: 'Grocery', revenue: 142000, stores: 6 },
  { niche: 'Salon', revenue: 98000, stores: 5 },
  { niche: 'Clothing', revenue: 87000, stores: 4 },
  { niche: 'Pharmacy', revenue: 72000, stores: 3 },
  { niche: 'Electronics', revenue: 65000, stores: 3 },
  { niche: 'Gym', revenue: 48000, stores: 2 },
  { niche: 'Hotel', revenue: 42000, stores: 2 },
  { niche: 'Others', revenue: 56000, stores: 5 },
];

const SIGNUPS_LAST_30 = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    day: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    signups: Math.floor(Math.random() * 8) + 1,
  };
});

const MRR_TREND = [
  { month: 'Sep', mrr: 82000 },
  { month: 'Oct', mrr: 95000 },
  { month: 'Nov', mrr: 103000 },
  { month: 'Dec', mrr: 115000 },
  { month: 'Jan', mrr: 128000 },
  { month: 'Feb', mrr: 142000 },
];

const PAYMENT_METHOD_DIST = [
  { method: 'UPI', value: 58, color: '#10b981' },
  { method: 'Credit Card', value: 22, color: '#6366f1' },
  { method: 'Debit Card', value: 12, color: '#f59e0b' },
  { method: 'Net Banking', value: 5, color: '#ef4444' },
  { method: 'Wallet', value: 3, color: '#8b5cf6' },
];

const STORES_BY_NICHE_DATA = NICHES.slice(0, 8).map((n) => ({
  name: n.name.split('/')[0].trim(),
  value: Math.floor(Math.random() * 15) + 2,
}));

interface Announcement {
  id: string;
  title: string;
  message: string;
  target: string;
  date: string;
  sentBy: string;
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Scheduled Maintenance — Feb 28',
    message: 'StoreOS will undergo scheduled maintenance on Feb 28 from 2:00 AM to 4:00 AM IST. Please save your work.',
    target: 'All Stores',
    date: '2025-02-20',
    sentBy: 'Admin',
  },
  {
    id: 'ann-2',
    title: 'New Feature: WhatsApp Billing',
    message: 'Send bills directly via WhatsApp to your customers! Enable it from Settings > WhatsApp Integration.',
    target: 'Active Stores',
    date: '2025-02-15',
    sentBy: 'Admin',
  },
  {
    id: 'ann-3',
    title: 'Trial Extension Offer',
    message: 'Extend your trial by 7 days! Explore all Pro features before committing.',
    target: 'Trial Stores',
    date: '2025-02-10',
    sentBy: 'Admin',
  },
];

const MOCK_TICKETS: MockTicket[] = [
  { id: 'TKT-001', store: "Rajesh's Restaurant", owner: 'Rajesh Kumar', subject: 'Unable to generate invoice', priority: 'high', status: 'open', created: '2025-02-25', messages: 3 },
  { id: 'TKT-002', store: "Priya's Salon", owner: 'Priya Sharma', subject: 'Subscription payment failed', priority: 'high', status: 'open', created: '2025-02-24', messages: 5 },
  { id: 'TKT-003', store: "Amit's Grocery", owner: 'Amit Patel', subject: 'Product import CSV error', priority: 'medium', status: 'in_progress', created: '2025-02-23', messages: 2 },
  { id: 'TKT-004', store: "Sunita's Clinic", owner: 'Sunita Gupta', subject: 'Want to upgrade to Pro plan', priority: 'low', status: 'open', created: '2025-02-22', messages: 1 },
  { id: 'TKT-005', store: "Vikram's Electronics", owner: 'Vikram Singh', subject: 'Staff login not working', priority: 'medium', status: 'resolved', created: '2025-02-20', messages: 4 },
  { id: 'TKT-006', store: "Anita's Bakery", owner: 'Anita Desai', subject: 'Receipt printer setup help', priority: 'low', status: 'resolved', created: '2025-02-18', messages: 3 },
  { id: 'TKT-007', store: "Suresh's Pharmacy", owner: 'Suresh Reddy', subject: 'Data export request', priority: 'low', status: 'open', created: '2025-02-17', messages: 1 },
  { id: 'TKT-008', store: "Meena's Coaching", owner: 'Meena Iyer', subject: 'Fee collection feature request', priority: 'medium', status: 'in_progress', created: '2025-02-15', messages: 2 },
];

const CHART_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#84cc16'];

// ============================================================
// Helper: Status Badge
// ============================================================
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">Active</Badge>;
    case 'trial':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">Trial</Badge>;
    case 'suspended':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">Suspended</Badge>;
    case 'open':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">Open</Badge>;
    case 'in_progress':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">In Progress</Badge>;
    case 'resolved':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">Resolved</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case 'high':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">High</Badge>;
    case 'medium':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Medium</Badge>;
    case 'low':
      return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Low</Badge>;
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
}

// ============================================================
// Overview Tab Component
// ============================================================
function OverviewTabContent() {
  const totalStores = MOCK_STORES.length;
  const activeStores = MOCK_STORES.filter((s) => s.status === 'active').length;
  const trialStores = MOCK_STORES.filter((s) => s.status === 'trial').length;
  const monthlyRevenue = REVENUE_MONTHLY[REVENUE_MONTHLY.length - 1].revenue;
  const churnRate = 4.2;
  const newSignups = REVENUE_MONTHLY[REVENUE_MONTHLY.length - 1].newStores;

  const stats = [
    { label: 'Total Stores', value: totalStores, icon: Store, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '+12%' },
    { label: 'Active Subs', value: activeStores, icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10', change: '+8%' },
    { label: 'Trial Stores', value: trialStores, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', change: '+3' },
    { label: 'Monthly Revenue', value: `₹${(monthlyRevenue / 1000).toFixed(0)}K`, icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '+18%' },
    { label: 'Churn Rate', value: `${churnRate}%`, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10', change: '-0.5%' },
    { label: 'New Signups', value: newSignups, icon: UserPlus, color: 'text-violet-400', bg: 'bg-violet-500/10', change: '+27%' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.change.startsWith('+') ? 'text-emerald-400' : stat.change.startsWith('-') ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : stat.change.startsWith('-') && stat.label === 'Churn Rate' ? <ArrowDownRight className="h-3 w-3" /> : null}
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Revenue Trend</CardTitle>
            <CardDescription className="text-slate-400">Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={REVENUE_MONTHLY}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stores by Niche */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Stores by Niche</CardTitle>
            <CardDescription className="text-slate-400">Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={STORES_BY_NICHE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {STORES_BY_NICHE_DATA.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => [`${value} stores`, 'Count']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => <span className="text-slate-300 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Signups by Day */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">Signups by Day</CardTitle>
          <CardDescription className="text-slate-400">Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={SIGNUPS_LAST_30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} interval={4} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => [`${value}`, 'New Signups']}
              />
              <Bar dataKey="signups" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Stores Tab Component
// ============================================================
function StoresTabContent() {
  const { setUser, setStore, setCurrentView } = useAppStore();
  const [searchStore, setSearchStore] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStore, setSelectedStore] = useState<MockStore | null>(null);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);

  const filteredStores = useMemo(() => {
    return MOCK_STORES.filter((s) => {
      const matchSearch =
        !searchStore ||
        s.name.toLowerCase().includes(searchStore.toLowerCase()) ||
        s.owner.toLowerCase().includes(searchStore.toLowerCase()) ||
        s.city.toLowerCase().includes(searchStore.toLowerCase());
      const matchNiche = nicheFilter === 'all' || s.niche === nicheFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchNiche && matchStatus;
    });
  }, [searchStore, nicheFilter, statusFilter]);

  const handleImpersonate = (store: MockStore) => {
    setStore({
      id: store.id,
      name: store.name,
      niche: store.niche,
      template: 'default',
      onboardingComplete: true,
    });
    setUser({
      id: `user-${store.id}`,
      email: store.email,
      name: store.owner,
      role: 'owner',
    });
    setCurrentView({ page: 'dashboard' });
    toast.success(`Switched to ${store.name}`);
  };

  const handleSuspend = (store: MockStore) => {
    toast.success(`${store.name} has been suspended`);
  };

  const handleActivate = (store: MockStore) => {
    toast.success(`${store.name} has been activated`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search stores, owners, cities..."
            value={searchStore}
            onChange={(e) => setSearchStore(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <Select value={nicheFilter} onValueChange={setNicheFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="All Niches" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-slate-200">All Niches</SelectItem>
            {NICHES.map((n) => (
              <SelectItem key={n.slug} value={n.slug} className="text-slate-200">
                {n.icon} {n.name.split('/')[0].trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-slate-200">All Status</SelectItem>
            <SelectItem value="active" className="text-slate-200">Active</SelectItem>
            <SelectItem value="trial" className="text-slate-200">Trial</SelectItem>
            <SelectItem value="suspended" className="text-slate-200">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stores Table */}
      <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-400">Store Name</TableHead>
                <TableHead className="text-slate-400">Owner</TableHead>
                <TableHead className="text-slate-400 hidden md:table-cell">Niche</TableHead>
                <TableHead className="text-slate-400 hidden sm:table-cell">Plan</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 hidden lg:table-cell">Revenue</TableHead>
                <TableHead className="text-slate-400 hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow key={store.id} className="border-slate-700/50 hover:bg-slate-700/30">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <span>{store.nicheIcon}</span>
                      <span className="truncate max-w-[150px]">{store.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <div>
                      <div>{store.owner}</div>
                      <div className="text-xs text-slate-500">{store.city}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300 hidden md:table-cell">
                    <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {store.nicheName.split('/')[0].trim()}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={
                      store.plan === 'Enterprise' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' :
                      store.plan === 'Pro' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }>
                      {store.plan}
                    </Badge>
                  </TableCell>
                  <TableCell><StatusBadge status={store.status} /></TableCell>
                  <TableCell className="text-emerald-400 font-medium hidden lg:table-cell">
                    ₹{store.revenue.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm hidden lg:table-cell">{store.created}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                        onClick={() => { setSelectedStore(store); setStoreDialogOpen(true); }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                        onClick={() => handleImpersonate(store)}
                        title="Impersonate"
                      >
                        <UserRound className="h-4 w-4" />
                      </Button>
                      {store.status === 'suspended' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-slate-700"
                          onClick={() => handleActivate(store)}
                          title="Activate"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-slate-700"
                          onClick={() => handleSuspend(store)}
                          title="Suspend"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                    <Store className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No stores match your filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-3 border-t border-slate-700/50 text-sm text-slate-400">
          Showing {filteredStores.length} of {MOCK_STORES.length} stores
        </div>
      </Card>

      {/* Store Detail Dialog */}
      <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedStore?.nicheIcon} Store Details
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Complete information about this store
            </DialogDescription>
          </DialogHeader>
          {selectedStore && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400">Store Name:</span><div className="font-medium text-white">{selectedStore.name}</div></div>
                <div><span className="text-slate-400">Owner:</span><div className="font-medium text-white">{selectedStore.owner}</div></div>
                <div><span className="text-slate-400">Email:</span><div className="font-medium text-white">{selectedStore.email}</div></div>
                <div><span className="text-slate-400">Phone:</span><div className="font-medium text-white">{selectedStore.phone}</div></div>
                <div><span className="text-slate-400">City:</span><div className="font-medium text-white">{selectedStore.city}</div></div>
                <div><span className="text-slate-400">Niche:</span><div className="font-medium text-white">{selectedStore.nicheName}</div></div>
                <div><span className="text-slate-400">Plan:</span><div><Badge className={selectedStore.plan === 'Enterprise' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : selectedStore.plan === 'Pro' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}>{selectedStore.plan}</Badge></div></div>
                <div><span className="text-slate-400">Status:</span><div><StatusBadge status={selectedStore.status} /></div></div>
                <div><span className="text-slate-400">Revenue:</span><div className="font-medium text-emerald-400">₹{selectedStore.revenue.toLocaleString('en-IN')}</div></div>
                <div><span className="text-slate-400">Created:</span><div className="font-medium text-white">{selectedStore.created}</div></div>
                <div><span className="text-slate-400">Total Orders:</span><div className="font-medium text-white">{selectedStore.totalOrders}</div></div>
                <div><span className="text-slate-400">Customers:</span><div className="font-medium text-white">{selectedStore.totalCustomers}</div></div>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => { handleImpersonate(selectedStore); setStoreDialogOpen(false); }}
                >
                  <UserRound className="h-4 w-4 mr-2" /> Impersonate
                </Button>
                {selectedStore.status === 'suspended' ? (
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { handleActivate(selectedStore); setStoreDialogOpen(false); }}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Activate
                  </Button>
                ) : (
                  <Button variant="destructive" className="flex-1" onClick={() => { handleSuspend(selectedStore); setStoreDialogOpen(false); }}>
                    <Ban className="h-4 w-4 mr-2" /> Suspend
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// Revenue Tab Component
// ============================================================
function RevenueTabContent() {
  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-white">₹20.03L</div>
            <span className="text-xs text-emerald-400">+18% vs last month</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-400">MRR</span>
            </div>
            <div className="text-2xl font-bold text-white">₹1.42L</div>
            <span className="text-xs text-emerald-400">+11% vs last month</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-slate-400">Pending Payments</span>
            </div>
            <div className="text-2xl font-bold text-white">₹18,500</div>
            <span className="text-xs text-amber-400">3 stores</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-slate-400">Failed Payments</span>
            </div>
            <div className="text-2xl font-bold text-white">₹4,200</div>
            <span className="text-xs text-red-400">2 stores</span>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Trend */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">MRR Trend</CardTitle>
            <CardDescription className="text-slate-400">Monthly Recurring Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={MRR_TREND}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'MRR']}
                />
                <Area type="monotone" dataKey="mrr" stroke="#6366f1" strokeWidth={2} fill="url(#mrrGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Payment Method Distribution</CardTitle>
            <CardDescription className="text-slate-400">How stores pay StoreOS</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={PAYMENT_METHOD_DIST}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="method"
                >
                  {PAYMENT_METHOD_DIST.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => [`${value}%`, 'Share']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => <span className="text-slate-300 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Month Table */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">Revenue by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Month</TableHead>
                  <TableHead className="text-slate-400">Revenue</TableHead>
                  <TableHead className="text-slate-400">Orders</TableHead>
                  <TableHead className="text-slate-400">New Stores</TableHead>
                  <TableHead className="text-slate-400">Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REVENUE_MONTHLY.map((row, i) => {
                  const prev = i > 0 ? REVENUE_MONTHLY[i - 1].revenue : row.revenue;
                  const growth = ((row.revenue - prev) / prev * 100).toFixed(1);
                  return (
                    <TableRow key={row.month} className="border-slate-700/50 hover:bg-slate-700/30">
                      <TableCell className="font-medium text-white">{row.month}</TableCell>
                      <TableCell className="text-emerald-400 font-medium">₹{row.revenue.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-slate-300">{row.orders.toLocaleString()}</TableCell>
                      <TableCell className="text-slate-300">{row.newStores}</TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${Number(growth) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {Number(growth) >= 0 ? '+' : ''}{growth}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Niche */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">Revenue by Niche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {REVENUE_BY_NICHE.map((item, i) => {
              const maxRevenue = REVENUE_BY_NICHE[0].revenue;
              const pct = (item.revenue / maxRevenue) * 100;
              return (
                <div key={item.niche} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-slate-300 shrink-0">{item.niche}</div>
                  <div className="flex-1 bg-slate-700/50 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 text-xs font-medium text-white"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                        minWidth: '40px',
                      }}
                    >
                      ₹{(item.revenue / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 w-16 text-right">{item.stores} stores</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Broadcast Tab Component
// ============================================================
function BroadcastTabContent() {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);

  const handleSendBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error('Please fill in title and message');
      return;
    }
    const targetLabel =
      broadcastTarget === 'all'
        ? 'All Stores'
        : broadcastTarget === 'trial'
          ? 'Trial Stores'
          : broadcastTarget === 'active'
            ? 'Active Stores'
            : NICHES.find((n) => n.slug === broadcastTarget)?.name || broadcastTarget;
    const newAnnouncement: Announcement = {
      id: `ann-${announcements.length + 1}`,
      title: broadcastTitle,
      message: broadcastMessage,
      target: targetLabel,
      date: new Date().toISOString().split('T')[0],
      sentBy: 'Admin',
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastTarget('all');
    toast.success('Announcement sent successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Announcement Form */}
        <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-400" />
              Send Announcement
            </CardTitle>
            <CardDescription className="text-slate-400">
              Broadcast a message to your stores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Title</label>
              <Input
                placeholder="Announcement title..."
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Message</label>
              <Textarea
                placeholder="Write your announcement message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={5}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Target Audience</label>
              <Select value={broadcastTarget} onValueChange={setBroadcastTarget}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-slate-200">All Stores</SelectItem>
                  <SelectItem value="trial" className="text-slate-200">Trial Stores</SelectItem>
                  <SelectItem value="active" className="text-slate-200">Active Stores Only</SelectItem>
                  {NICHES.slice(0, 8).map((n) => (
                    <SelectItem key={n.slug} value={n.slug} className="text-slate-200">
                      {n.icon} {n.name.split('/')[0].trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleSendBroadcast}
            >
              <Send className="h-4 w-4 mr-2" /> Send Announcement
            </Button>
          </CardContent>
        </Card>

        {/* Previous Announcements */}
        <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Previous Announcements
            </CardTitle>
            <CardDescription className="text-slate-400">
              {announcements.length} announcements sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[450px]">
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-700/50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-white">{ann.title}</h4>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs shrink-0">
                        {ann.target}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{ann.message}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><CalendarPlus className="h-3 w-3" /> {ann.date}</span>
                      <span>Sent by {ann.sentBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Support Tab Component
// ============================================================
function SupportTabContent() {
  const [supportSearch, setSupportSearch] = useState('');

  const filteredTickets = useMemo(() => {
    if (!supportSearch) return MOCK_TICKETS;
    return MOCK_TICKETS.filter(
      (t) =>
        t.store.toLowerCase().includes(supportSearch.toLowerCase()) ||
        t.owner.toLowerCase().includes(supportSearch.toLowerCase()) ||
        t.subject.toLowerCase().includes(supportSearch.toLowerCase())
    );
  }, [supportSearch]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search stores, users, or issues..."
            value={supportSearch}
            onChange={(e) => setSupportSearch(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Unlock className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Unlock Account</div>
              <div className="text-xs text-slate-400">Resolve locked user accounts</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <KeyRound className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Reset Password</div>
              <div className="text-xs text-slate-400">Send password reset link</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <CalendarPlus className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Extend Trial</div>
              <div className="text-xs text-slate-400">Grant extra trial days</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Tickets */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-violet-400" />
            Support Tickets
            <Badge className="bg-slate-600 text-slate-200">{filteredTickets.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Ticket</TableHead>
                  <TableHead className="text-slate-400">Store</TableHead>
                  <TableHead className="text-slate-400 hidden sm:table-cell">Subject</TableHead>
                  <TableHead className="text-slate-400">Priority</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="border-slate-700/50 hover:bg-slate-700/30">
                    <TableCell className="font-medium text-white">{ticket.id}</TableCell>
                    <TableCell className="text-slate-300">
                      <div>
                        <div className="font-medium">{ticket.store}</div>
                        <div className="text-xs text-slate-500">{ticket.owner}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm hidden sm:table-cell">{ticket.subject}</TableCell>
                    <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                    <TableCell><StatusBadge status={ticket.status} /></TableCell>
                    <TableCell className="text-slate-400 text-sm hidden md:table-cell">{ticket.created}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-slate-700"
                          onClick={() => toast.success(`Account unlocked for ${ticket.owner}`)}
                        >
                          <Unlock className="h-3 w-3 mr-1" /> Unlock
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                          onClick={() => toast.success(`Password reset link sent to ${ticket.owner}`)}
                        >
                          <KeyRound className="h-3 w-3 mr-1" /> Reset
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-amber-400 hover:text-amber-300 hover:bg-slate-700"
                          onClick={() => toast.success(`Trial extended by 7 days for ${ticket.store}`)}
                        >
                          <CalendarPlus className="h-3 w-3 mr-1" /> Extend
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Main AdminPanel Component
// ============================================================

export default function AdminPanel() {
  const { user, logout, setCurrentView } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-400" />
              <h1 className="text-lg font-bold text-white">
                Store<span className="text-emerald-400">OS</span>{' '}
                <span className="text-slate-400 font-normal text-sm">Admin</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-emerald-600 text-white text-xs">
                  A
                </AvatarFallback>
              </Avatar>
              <span className="text-slate-300">{user?.name || 'Admin'}</span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              Super Admin
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => {
                logout();
                setCurrentView({ page: 'landing' });
              }}
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1 h-auto flex-wrap">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 px-4 py-2"
            >
              <BarChart3 className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger
              value="stores"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 px-4 py-2"
            >
              <Store className="h-4 w-4 mr-2" /> Stores
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 px-4 py-2"
            >
              <IndianRupee className="h-4 w-4 mr-2" /> Revenue
            </TabsTrigger>
            <TabsTrigger
              value="broadcast"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 px-4 py-2"
            >
              <Megaphone className="h-4 w-4 mr-2" /> Broadcast
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400 px-4 py-2"
            >
              <HelpCircle className="h-4 w-4 mr-2" /> Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTabContent /></TabsContent>
          <TabsContent value="stores"><StoresTabContent /></TabsContent>
          <TabsContent value="revenue"><RevenueTabContent /></TabsContent>
          <TabsContent value="broadcast"><BroadcastTabContent /></TabsContent>
          <TabsContent value="support"><SupportTabContent /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
