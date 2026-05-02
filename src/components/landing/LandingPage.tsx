'use client';

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { NICHES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Zap,
  PackageSearch,
  Users,
  BarChart3,
  UserCheck,
  Bell,
  Moon,
  Sun,
  Check,
  Star,
  ArrowRight,
  Play,
  Menu,
  X,
  ShoppingCart,
  ChevronRight,
  Sparkles,
  Clock,
  CreditCard,
  Rocket,
  IndianRupee,
  MessageSquare,
  Twitter,
  Linkedin,
  Instagram,
  Loader2,
} from 'lucide-react';

// ─── Animation Helpers ────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}) {
  const offsets = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Niche Icon Mapping ───────────────────────────────────────

function getNicheColorClass(color: string): string {
  const map: Record<string, string> = {
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    zinc: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/30 dark:text-zinc-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    lime: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400',
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  };
  return map[color] || 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400';
}

// ─── Testimonials Data ────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "StoreOS transformed my kirana store. I can now manage inventory, generate GST bills, and track payments — all from my phone. The ₹99 price is unbeatable!",
    name: 'Rajesh Kumar',
    business: 'Grocery Store',
    city: 'Delhi',
    rating: 5,
  },
  {
    quote: "As a restaurant owner, KOT printing and table management were game changers. My staff learned the system in just 30 minutes. Highly recommend!",
    name: 'Priya Sharma',
    business: 'Restaurant',
    city: 'Mumbai',
    rating: 5,
  },
  {
    quote: "The pharmacy-specific features like batch tracking and expiry alerts saved me from huge losses. Best POS for medical stores in India.",
    name: 'Dr. Ahmed Khan',
    business: 'Medical Store',
    city: 'Hyderabad',
    rating: 5,
  },
];

// ─── Features Data ────────────────────────────────────────────

const FEATURES = [
  {
    icon: Zap,
    title: 'Fast Billing',
    description: 'Search, scan, and bill in seconds. Quick checkout with barcode support and smart search.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: PackageSearch,
    title: 'Smart Inventory',
    description: 'Auto-reorder alerts, batch tracking, and expiry management. Never run out of stock again.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: Users,
    title: 'Customer CRM',
    description: 'Loyalty points, purchase history, and WhatsApp bill sharing. Build lasting relationships.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon: BarChart3,
    title: 'Live Reports',
    description: 'Real-time sales analytics, profit tracking, and GST-ready reports at your fingertips.',
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
  },
  {
    icon: UserCheck,
    title: 'Staff Manager',
    description: 'Define roles, manage shifts, and track commissions. Full control over your team.',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Low stock warnings, payment reminders, and daily summaries. Stay ahead of everything.',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
];

// ─── Pricing Features ─────────────────────────────────────────

const PRICING_FEATURES = [
  'Unlimited products & categories',
  'Full POS billing system',
  'Customer management & loyalty',
  'Staff management & roles',
  'GST-ready invoices & reports',
  'WhatsApp bill sharing',
  'Multi-payment modes',
  'Mobile & tablet ready',
  '15 niche-specific templates',
  'Priority support',
];

// ─── Main Component ───────────────────────────────────────────

export default function LandingPage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const setUser = useAppStore((s) => s.setUser);
  const setStore = useAppStore((s) => s.setStore);
  const setSubscription = useAppStore((s) => s.setSubscription);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleTryDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUser({
          id: data.demoUser.id,
          email: data.demoUser.email,
          name: data.demoUser.name,
          role: 'user',
        });
        setStore({
          id: data.demoStore.id,
          name: data.demoStore.name,
          niche: data.demoStore.niche,
          template: 'rest-classic',
          onboardingComplete: true,
        });
        setSubscription({
          plan: data.demoSubscription.plan,
          status: data.demoSubscription.status,
          trialEndsAt: data.demoSubscription.trialEndsAt,
        });
        setCurrentView({ page: 'dashboard' });
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setDemoLoading(false);
    }
  };

  // Scroll detection for sticky nav
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll
  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-800/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                StoreOS
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollTo('features')} className="text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors">
                Features
              </button>
              <button onClick={() => scrollTo('niches')} className="text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors">
                Niches
              </button>
              <button onClick={() => scrollTo('pricing')} className="text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors">
                Pricing
              </button>
              <button onClick={() => scrollTo('contact')} className="text-sm font-medium text-gray-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors">
                Contact
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView({ page: 'login' })}
                className="rounded-full"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentView({ page: 'signup' })}
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Get Started
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 pb-4"
          >
            <div className="flex flex-col gap-3 pt-2">
              <button onClick={() => scrollTo('features')} className="text-sm font-medium text-gray-600 dark:text-gray-300 py-2 text-left">Features</button>
              <button onClick={() => scrollTo('niches')} className="text-sm font-medium text-gray-600 dark:text-gray-300 py-2 text-left">Niches</button>
              <button onClick={() => scrollTo('pricing')} className="text-sm font-medium text-gray-600 dark:text-gray-300 py-2 text-left">Pricing</button>
              <button onClick={() => scrollTo('contact')} className="text-sm font-medium text-gray-600 dark:text-gray-300 py-2 text-left">Contact</button>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => { setMobileMenuOpen(false); setCurrentView({ page: 'login' }); }} className="flex-1 rounded-full">
                  Login
                </Button>
                <Button size="sm" onClick={() => { setMobileMenuOpen(false); setCurrentView({ page: 'signup' }); }} className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Get Started
                </Button>
              </div>
              <Button
                size="sm"
                onClick={() => { setMobileMenuOpen(false); handleTryDemo(); }}
                disabled={demoLoading}
                className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                {demoLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {demoLoading ? 'Loading...' : 'Try Demo'}
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950/30" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-200/30 dark:bg-teal-800/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <FadeIn>
                <Badge className="mb-6 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 rounded-full px-4 py-1.5 text-sm font-medium">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Now just ₹99/month
                </Badge>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                  Run Your Store on{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    Autopilot
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                  India&apos;s first multi-niche POS platform. From restaurants to retail, get a custom POS system tailored to your business — for just ₹99/month.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    onClick={() => setCurrentView({ page: 'signup' })}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 px-8 h-12 text-base"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleTryDemo}
                    disabled={demoLoading}
                    className="rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 px-8 h-12 text-base"
                  >
                    {demoLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {demoLoading ? 'Loading Demo...' : 'Try Demo'}
                  </Button>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                  {[
                    { value: '10,000+', label: 'Stores' },
                    { value: '15', label: 'Business Types' },
                    { value: '₹99', label: '/month' },
                    { value: '14-Day', label: 'Free Trial' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stat.value}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* Right: POS Mockup */}
            <FadeIn direction="left" delay={0.3}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {/* Mockup Title Bar */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-medium">StoreOS — Dashboard</span>
                  </div>
                  {/* Mockup Content */}
                  <div className="p-5 space-y-4">
                    {/* Top Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Today', value: '₹24,580', color: 'emerald' },
                        { label: 'Orders', value: '142', color: 'sky' },
                        { label: 'Items', value: '384', color: 'amber' },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-xl p-3 ${
                          s.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                          s.color === 'sky' ? 'bg-sky-50 dark:bg-sky-900/20' :
                          'bg-amber-50 dark:bg-amber-900/20'
                        }`}>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                          <p className={`text-lg font-bold ${
                            s.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                            s.color === 'sky' ? 'text-sky-600 dark:text-sky-400' :
                            'text-amber-600 dark:text-amber-400'
                          }`}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Chart Mockup */}
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/30 p-4">
                      <div className="flex items-end gap-1.5 h-24">
                        {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-emerald-300 dark:from-emerald-600 dark:to-emerald-400 opacity-80"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Recent Orders */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Recent Orders</p>
                      {[
                        { name: 'Butter Chicken × 2', amount: '₹580', status: 'Paid' },
                        { name: 'Paneer Tikka × 1', amount: '₹280', status: 'Paid' },
                        { name: 'Dal Makhani × 3', amount: '₹450', status: 'Pending' },
                      ].map((order, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{order.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{order.amount}</span>
                            <Badge variant={order.status === 'Paid' ? 'default' : 'secondary'} className={`text-[10px] px-1.5 py-0 ${
                              order.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''
                            }`}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════ NICHES SECTION ═══════════════════ */}
      <section id="niches" className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 rounded-full px-3 py-1">
                15 Specialized POS
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Built for{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Every Business
                </span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Choose from 15 specialized POS systems, each crafted for your industry
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {NICHES.map((niche) => (
              <StaggerItem key={niche.slug}>
                <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-gray-200 dark:border-gray-800 h-full">
                  <CardContent className="p-4 text-center flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 ${getNicheColorClass(niche.color)}`}>
                      {niche.icon}
                    </div>
                    <h3 className="font-semibold text-sm leading-tight">{niche.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{niche.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ FEATURES SECTION ═══════════════════ */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 rounded-full px-3 py-1">
                Powerful Tools
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Everything You Need to{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Run Your Store
                </span>
              </h2>
            </div>
          </FadeIn>

          <StaggerContainer className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-gray-200 dark:border-gray-800 h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 rounded-full px-3 py-1">
                Simple Setup
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Get Started in{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  3 Minutes
                </span>
              </h2>
            </div>
          </FadeIn>

          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: CreditCard,
                title: 'Sign Up & Pay ₹99',
                description: 'Create your account and start your 14-day free trial. No credit card required upfront.',
                color: 'emerald',
              },
              {
                step: 2,
                icon: ShoppingCart,
                title: 'Choose Your Niche',
                description: 'Pick your business type from 15 specialized templates. Each one tailored for your industry.',
                color: 'teal',
              },
              {
                step: 3,
                icon: Rocket,
                title: 'Launch Your POS',
                description: 'Start billing immediately. Your custom POS is ready to go — no training needed.',
                color: 'cyan',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.step} delay={item.step * 0.15}>
                  <div className="relative text-center">
                    {/* Connector Line (desktop only) */}
                    {item.step < 3 && (
                      <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-emerald-300 to-teal-300 dark:from-emerald-700 dark:to-teal-700" />
                    )}
                    <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6">
                      <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-gray-900 text-emerald-600 font-bold text-sm flex items-center justify-center border-2 border-emerald-500">
                        {item.step}
                      </span>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">{item.description}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING SECTION ═══════════════════ */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 rounded-full px-3 py-1">
                Pricing
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Simple,{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Transparent Pricing
                </span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">No hidden fees. No surprises. Just one plan that has everything.</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-14 flex justify-center">
              <Card className="relative max-w-md w-full border-2 border-emerald-500 dark:border-emerald-600 shadow-xl shadow-emerald-500/10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white border-0 rounded-full px-4 py-1 text-sm shadow-lg shadow-emerald-600/25">
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center pb-2 pt-8">
                  <CardTitle className="text-xl font-bold">Starter</CardTitle>
                  <CardDescription>Everything to run your store</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <IndianRupee className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-5xl font-extrabold">99</span>
                      <span className="text-gray-500 dark:text-gray-400 text-lg">/month</span>
                    </div>
                    <Badge className="mt-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 rounded-full">
                      14-day free trial
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    {PRICING_FEATURES.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5 shrink-0">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-4">
                  <Button
                    size="lg"
                    className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 h-12 text-base"
                    onClick={() => setCurrentView({ page: 'signup' })}
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">No credit card required</p>
                </CardFooter>
              </Card>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto">
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 rounded-full px-3 py-1">
                Testimonials
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Loved by{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Store Owners
                </span>
              </h2>
            </div>
          </FadeIn>

          <StaggerContainer className="mt-14 grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.name}>
                <Card className="h-full border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t.business} · {t.city}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Ready to Transform Your Business?
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-6 text-lg text-emerald-100 max-w-xl mx-auto">
              Start your 14-day free trial today. No credit card required.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <Button
              size="lg"
              onClick={() => setCurrentView({ page: 'signup' })}
              className="mt-10 rounded-full bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl h-14 px-10 text-lg font-bold"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer id="contact" className="bg-gray-900 dark:bg-gray-950 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">StoreOS</span>
              </div>
              <p className="text-sm leading-relaxed">
                India&apos;s first multi-niche POS platform. Run your store on autopilot for just ₹99/month.
              </p>
              <div className="flex gap-3 mt-5">
                {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <button key={i} className="w-9 h-9 rounded-full bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5">
                {['Features', 'Pricing', 'Templates', 'Integrations'].map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => scrollTo(link.toLowerCase() === 'features' ? 'features' : link.toLowerCase() === 'pricing' ? 'pricing' : 'niches')}
                      className="text-sm hover:text-emerald-400 transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2.5">
                {['About', 'Careers', 'Blog', 'Contact'].map((link) => (
                  <li key={link}>
                    <button className="text-sm hover:text-emerald-400 transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {['Terms of Service', 'Privacy Policy', 'Refund Policy', 'Support'].map((link) => (
                  <li key={link}>
                    <button className="text-sm hover:text-emerald-400 transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; 2025 StoreOS. Made in India 🇮🇳</p>
            <div className="flex items-center gap-1.5 text-sm">
              <span>Built with</span>
              <span className="text-red-500">&hearts;</span>
              <span>for Indian businesses</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
