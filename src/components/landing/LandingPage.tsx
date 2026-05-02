'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
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
  Youtube,
  Github,
  Loader2,
  Shield,
  HeadphonesIcon,
  Globe,
  Building2,
  Store,
  ShoppingBag,
  Stethoscope,
  Mail,
  BadgeCheck,
  TrendingUp,
  Activity,
  ChevronLeft,
  ChevronDown,
  Heart,
  Search,
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

// ─── Animated Counter ─────────────────────────────────────────

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// ─── Tilt Card for Testimonials ───────────────────────────────

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Feature Card with InView Animation ───────────────────────

function FeatureCard({ feature, index }: { feature: typeof FEATURES[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
    >
      <Card className="group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-gray-200 dark:border-gray-800 h-full overflow-hidden relative">
        {/* Subtle gradient background */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.bg}`} />
        <CardContent className="p-6 relative z-10">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:shadow-lg ${feature.bg}`}
            style={{
              boxShadow: undefined,
            }}
          >
            <div className="relative">
              <Icon className={`w-6 h-6 ${feature.color} transition-all duration-300 group-hover:scale-110`} />
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 ${feature.color} blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
            </div>
          </div>
          <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
        </CardContent>
      </Card>
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

function getNicheBorderTop(color: string): string {
  const map: Record<string, string> = {
    orange: 'border-t-orange-500',
    pink: 'border-t-pink-500',
    emerald: 'border-t-emerald-500',
    violet: 'border-t-violet-500',
    green: 'border-t-green-500',
    cyan: 'border-t-cyan-500',
    blue: 'border-t-blue-500',
    red: 'border-t-red-500',
    slate: 'border-t-slate-500',
    amber: 'border-t-amber-500',
    zinc: 'border-t-zinc-500',
    yellow: 'border-t-yellow-500',
    lime: 'border-t-lime-500',
    teal: 'border-t-teal-500',
    indigo: 'border-t-indigo-500',
  };
  return map[color] || 'border-t-gray-500';
}

function getNicheGlowShadow(color: string): string {
  const map: Record<string, string> = {
    orange: 'hover:shadow-orange-500/20',
    pink: 'hover:shadow-pink-500/20',
    emerald: 'hover:shadow-emerald-500/20',
    violet: 'hover:shadow-violet-500/20',
    green: 'hover:shadow-green-500/20',
    cyan: 'hover:shadow-cyan-500/20',
    blue: 'hover:shadow-blue-500/20',
    red: 'hover:shadow-red-500/20',
    slate: 'hover:shadow-slate-500/20',
    amber: 'hover:shadow-amber-500/20',
    zinc: 'hover:shadow-zinc-500/20',
    yellow: 'hover:shadow-yellow-500/20',
    lime: 'hover:shadow-lime-500/20',
    teal: 'hover:shadow-teal-500/20',
    indigo: 'hover:shadow-indigo-500/20',
  };
  return map[color] || 'hover:shadow-gray-500/20';
}

// ─── Testimonials Data ────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "StoreOS transformed my kirana store. I can now manage inventory, generate GST bills, and track payments — all from my phone. The ₹99 price is unbeatable!",
    name: 'Rajesh Kumar',
    business: 'Grocery Store',
    businessIcon: ShoppingBag,
    city: 'Delhi',
    rating: 5,
    initials: 'RK',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    quote: "As a restaurant owner, KOT printing and table management were game changers. My staff learned the system in just 30 minutes. Highly recommend!",
    name: 'Priya Sharma',
    business: 'Restaurant',
    businessIcon: Store,
    city: 'Mumbai',
    rating: 5,
    initials: 'PS',
    color: 'from-amber-400 to-orange-500',
  },
  {
    quote: "The pharmacy-specific features like batch tracking and expiry alerts saved me from huge losses. Best POS for medical stores in India.",
    name: 'Dr. Ahmed Khan',
    business: 'Medical Store',
    businessIcon: Stethoscope,
    city: 'Hyderabad',
    rating: 5,
    initials: 'AK',
    color: 'from-violet-400 to-purple-500',
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

// ─── Pricing Data ─────────────────────────────────────────────

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Try it out',
    popular: false,
    features: [
      { name: 'Up to 50 products', included: true },
      { name: 'Basic POS billing', included: true },
      { name: '5 staff accounts', included: true },
      { name: 'Customer management', included: false },
      { name: 'GST-ready invoices', included: false },
      { name: 'WhatsApp sharing', included: false },
    ],
  },
  {
    name: 'Pro',
    price: 99,
    period: '/month',
    description: 'Everything you need',
    popular: true,
    features: [
      { name: 'Unlimited products', included: true },
      { name: 'Full POS billing system', included: true },
      { name: 'Unlimited staff', included: true },
      { name: 'Customer CRM & loyalty', included: true },
      { name: 'GST-ready invoices & reports', included: true },
      { name: 'WhatsApp bill sharing', included: true },
    ],
  },
  {
    name: 'Enterprise',
    price: 499,
    period: '/month',
    description: 'For growing chains',
    popular: false,
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Multi-store management', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'API access', included: true },
      { name: 'Priority phone support', included: true },
      { name: 'Custom integrations', included: true },
    ],
  },
];

const COMPARISON_FEATURES = [
  { name: 'Products', starter: 'Up to 50', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Staff accounts', starter: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'POS Billing', starter: '✓', pro: '✓', enterprise: '✓' },
  { name: 'Customer CRM', starter: '—', pro: '✓', enterprise: '✓' },
  { name: 'GST Invoices', starter: '—', pro: '✓', enterprise: '✓' },
  { name: 'WhatsApp Sharing', starter: '—', pro: '✓', enterprise: '✓' },
  { name: 'Multi-store', starter: '—', pro: '—', enterprise: '✓' },
  { name: 'API Access', starter: '—', pro: '—', enterprise: '✓' },
  { name: 'Priority Support', starter: '—', pro: 'Email', enterprise: 'Phone + Email' },
  { name: 'Custom Integrations', starter: '—', pro: '—', enterprise: '✓' },
];

// ─── Main Component ───────────────────────────────────────────

export default function LandingPage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const setUser = useAppStore((s) => s.setUser);
  const setStore = useAppStore((s) => s.setStore);
  const setSubscription = useAppStore((s) => s.setSubscription);
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // Animated mockup state
  const [mockClock, setMockClock] = useState('');
  const [typingText, setTypingText] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [mockStats, setMockStats] = useState({ today: 0, orders: 0, items: 0 });

  // Testimonial carousel state
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [carouselDirection, setCarouselDirection] = useState(1);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Mock orders for auto-cycling (4 orders as specified)
  const mockOrders = [
    { name: 'Butter Chicken × 2', amount: '₹580', status: 'Paid' },
    { name: 'Paneer Tikka × 1', amount: '₹280', status: 'Pending' },
    { name: 'Dal Makhani × 3', amount: '₹450', status: 'Paid' },
    { name: 'Biryani × 2', amount: '₹620', status: 'Paid' },
  ];

  const typingPhrases = ['Search products...', 'Butter Chicken', 'Scan barcode...', 'Paneer Tikka', 'Quick bill...'];

  // Live clock in mockup
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setMockClock(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Typing animation in mockup search
  useEffect(() => {
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    const timer = setInterval(() => {
      const phrase = typingPhrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        setTypingText(phrase.slice(0, charIdx));
        if (charIdx >= phrase.length) {
          deleting = true;
          setTimeout(() => {}, 1500);
        }
      } else {
        charIdx--;
        setTypingText(phrase.slice(0, charIdx));
        if (charIdx <= 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % typingPhrases.length;
        }
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll orders
  useEffect(() => {
    const timer = setInterval(() => {
      setOrderIndex((prev) => (prev + 1) % mockOrders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Count-up animation for mock stats using framer-motion spring
  const mockSpringToday = useSpring(0, { stiffness: 50, damping: 20 });
  const mockSpringOrders = useSpring(0, { stiffness: 50, damping: 20 });
  const mockSpringItems = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    // Delay to let the component render first, then trigger spring animation
    const timer = setTimeout(() => {
      mockSpringToday.set(24580);
      mockSpringOrders.set(142);
      mockSpringItems.set(384);
    }, 500);
    return () => clearTimeout(timer);
  }, [mockSpringToday, mockSpringOrders, mockSpringItems]);

  // Track spring values for display
  useEffect(() => {
    const unsubscribeToday = mockSpringToday.on('change', (v: number) => setMockStats(prev => ({ ...prev, today: Math.round(v) })));
    const unsubscribeOrders = mockSpringOrders.on('change', (v: number) => setMockStats(prev => ({ ...prev, orders: Math.round(v) })));
    const unsubscribeItems = mockSpringItems.on('change', (v: number) => setMockStats(prev => ({ ...prev, items: Math.round(v) })));
    return () => { unsubscribeToday(); unsubscribeOrders(); unsubscribeItems(); };
  }, [mockSpringToday, mockSpringOrders, mockSpringItems]);

  // Testimonial auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselDirection(1);
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
          taxRate: data.demoStore.taxRate ?? 5,
          ownerName: data.demoStore.ownerName,
          city: data.demoStore.city,
          state: data.demoStore.state,
          phone: data.demoStore.phone,
          address: data.demoStore.address,
          gstNumber: data.demoStore.gstNumber,
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

  // Scroll detection for sticky nav + parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      // Parallax for testimonials section
      const testimonialsSection = document.getElementById('testimonials-parallax');
      if (testimonialsSection) {
        const rect = testimonialsSection.getBoundingClientRect();
        const offset = rect.top * 0.08;
        document.documentElement.style.setProperty('--parallax-testimonials', `${offset}px`);
      }
    };
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
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes heroGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulseOrb {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes shimmerBtn {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ctaGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseCtaGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6), 0 0 80px rgba(16, 185, 129, 0.2); }
        }
        .hero-gradient-animated {
          background-size: 200% 200%;
          animation: heroGradient 8s ease infinite;
        }
        .float-animation {
          animation: float 4s ease-in-out infinite;
        }
        .float-shape-1 {
          animation: floatShape1 12s ease-in-out infinite;
        }
        .float-shape-2 {
          animation: floatShape2 15s ease-in-out infinite;
        }
        .float-shape-3 {
          animation: floatShape3 18s ease-in-out infinite;
        }
        .float-shape-4 {
          animation: floatShape4 14s ease-in-out infinite;
        }
        .pulse-orb {
          animation: pulseOrb 4s ease-in-out infinite;
        }
        .shimmer-btn {
          background-size: 200% auto;
          animation: shimmerBtn 3s linear infinite;
        }
        .cta-gradient-animated {
          background-size: 200% 200%;
          animation: ctaGradient 6s ease infinite;
        }
        .pulse-cta-glow {
          animation: pulseCtaGlow 2.5s ease-in-out infinite;
        }
        .niche-shimmer {
          position: relative;
          overflow: hidden;
        }
        .niche-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%) skewX(-15deg);
          pointer-events: none;
        }
        .niche-shimmer:hover::after {
          animation: shimmerSweep 0.6s ease-out;
        }
        .gradient-border {
          position: relative;
          background: white;
          border-radius: 0.75rem;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #10b981, #14b8a6, #0ea5e9, #10b981);
          background-size: 300% 300%;
          opacity: 0;
          z-index: -1;
          transition: opacity 0.4s ease;
        }
        .gradient-border:hover::before {
          opacity: 1;
          animation: gradientBorderMove 3s ease infinite;
        }
        @keyframes gradientBorderMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .dark .gradient-border {
          background: #1f2937;
        }
        @keyframes iconBounce {
          0%, 100% { transform: translateY(0) scale(1.1); }
          50% { transform: translateY(-4px) scale(1.1); }
        }
        .pricing-glow {
          animation: pulseGlow 3s ease-in-out infinite;
        }
        .pricing-btn-pulse {
          position: relative;
        }
        .pricing-btn-pulse::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 9999px;
          animation: pulseRing 2s ease-out infinite;
        }
        @keyframes stepFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .step-float-1 { animation: stepFloat 3s ease-in-out infinite; }
        .step-float-2 { animation: stepFloat 3s ease-in-out 0.5s infinite; }
        .step-float-3 { animation: stepFloat 3s ease-in-out 1s infinite; }
        @keyframes gradientShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .autopilot-shimmer {
          background: linear-gradient(90deg, #059669, #14b8a6, #0ea5e9, #14b8a6, #059669);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShimmer 3s linear infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        .live-dot {
          animation: livePulse 2s ease-in-out infinite;
        }
        @keyframes floatBadge1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-4px, -8px); }
        }
        @keyframes floatBadge2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(4px, -6px); }
        }
        @keyframes floatBadge3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-6px, -4px); }
        }
        .float-badge-1 { animation: floatBadge1 3s ease-in-out infinite; }
        .float-badge-2 { animation: floatBadge2 4s ease-in-out infinite 0.5s; }
        .float-badge-3 { animation: floatBadge3 3.5s ease-in-out infinite 1s; }
        @keyframes ribbonBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-3px); }
        }
        .popular-ribbon-bounce {
          animation: ribbonBounce 2s ease-in-out infinite;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        .dark .glassmorphism {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .dark .glass-card {
          background: rgba(31, 41, 55, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(250%) skewX(-15deg); }
        }
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), rgba(20, 184, 166, 0.3), rgba(16, 185, 129, 0.3), transparent);
        }
      `}</style>
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
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full">
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
                className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white shimmer-btn"
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
        {/* Background Gradient - Animated */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950/30 hero-gradient-animated" />

        {/* Glowing/Pulsing Gradient Orb behind hero text */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-cyan-400/10 dark:from-emerald-600/10 dark:via-teal-600/5 dark:to-cyan-600/5 rounded-full blur-3xl pulse-orb" />
        <div className="absolute top-1/3 left-[30%] w-[400px] h-[400px] bg-gradient-to-tr from-emerald-300/15 to-teal-300/10 dark:from-emerald-700/5 dark:to-teal-700/5 rounded-full blur-3xl pulse-orb" style={{ animationDelay: '2s' }} />

        {/* Dot Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />

        {/* Soft blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-teal-200/30 dark:bg-teal-800/10 rounded-full blur-3xl" />

        {/* Floating shapes */}
        <div className="absolute top-32 left-[10%] w-20 h-20 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full float-shape-1" />
        <div className="absolute top-48 right-[15%] w-32 h-32 bg-emerald-300/10 dark:bg-emerald-400/10 rounded-full float-shape-2" />
        <div className="absolute bottom-32 left-[20%] w-16 h-16 bg-teal-400/10 dark:bg-teal-500/10 rounded-full float-shape-3" />
        <div className="absolute bottom-48 right-[25%] w-24 h-24 bg-emerald-200/15 dark:bg-emerald-300/10 rounded-full float-shape-4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <FadeIn>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 rounded-full px-4 py-1.5 text-sm font-medium">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Now just ₹99/month
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 rounded-full px-4 py-1.5 text-sm font-medium">
                    🇮🇳 Made for India
                  </Badge>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                  Run Your Store on{' '}
                  <span className="autopilot-shimmer relative">
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
                    className="rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-500/25 px-8 h-12 text-base shimmer-btn relative overflow-hidden"
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
                <div className="mt-10 glass-card rounded-2xl px-6 py-5 shadow-lg">
                  <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center sm:justify-start">
                    {[
                      { value: '10,000+', label: 'Stores', animated: true },
                      { value: '15', label: 'Business Types', animated: false },
                      { value: '₹99', label: '/month', animated: false },
                      { value: '14-Day', label: 'Free Trial', animated: false },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {stat.animated ? <><AnimatedCounter target={10000} />+</> : stat.value}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Trusted badge */}
              <FadeIn delay={0.5}>
                <div className="mt-6 inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <div className="flex -space-x-2">
                    {['bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500'].map((bg, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full ${bg} border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-[8px] font-bold`}>
                        {['R', 'P', 'A', 'S'][i]}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Trusted by <span className="font-bold text-emerald-600 dark:text-emerald-400"><AnimatedCounter target={10000} />+</span> stores
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right: POS Mockup */}
            <FadeIn direction="left" delay={0.3}>
              <div className="relative float-animation">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl" />
                <TiltCard>
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {/* Mockup Title Bar */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                      StoreOS — Dashboard
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                        LIVE
                      </span>
                    </span>
                    <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 font-mono tabular-nums">{mockClock}</span>
                  </div>
                  {/* Mockup Content */}
                  <div className="p-5 space-y-4">
                    {/* Search bar with typing animation */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {typingText}<span className="animate-pulse">|</span>
                      </span>
                    </div>
                    {/* Top Stats Row with count-up */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Today', value: `₹${mockStats.today.toLocaleString('en-IN')}`, color: 'emerald' },
                        { label: 'Orders', value: mockStats.orders.toString(), color: 'sky' },
                        { label: 'Items', value: mockStats.items.toString(), color: 'amber' },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-xl p-3 ${
                          s.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                          s.color === 'sky' ? 'bg-sky-50 dark:bg-sky-900/20' :
                          'bg-amber-50 dark:bg-amber-900/20'
                        }`}>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                          <p className={`text-lg font-bold tabular-nums ${
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
                    {/* Product Grid - mini screenshot content */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'Butter Chicken', price: '₹320', clr: 'bg-orange-100 dark:bg-orange-900/20' },
                        { name: 'Paneer Tikka', price: '₹250', clr: 'bg-amber-100 dark:bg-amber-900/20' },
                        { name: 'Dal Makhani', price: '₹220', clr: 'bg-emerald-100 dark:bg-emerald-900/20' },
                      ].map((item) => (
                        <div key={item.name} className={`rounded-lg p-2 ${item.clr} text-center`}>
                          <div className="w-full aspect-square rounded bg-white/60 dark:bg-gray-700/40 mb-1.5 flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">{item.name}</p>
                          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{item.price}</p>
                        </div>
                      ))}
                    </div>
                    {/* Recent Orders - auto-cycling 4 orders every 3s */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Recent Orders</p>
                      <div className="h-[44px] overflow-hidden relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={orderIndex}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                          >
                            {(() => {
                              const order = mockOrders[orderIndex];
                              return (
                                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 text-sm">
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
                              );
                            })()}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
                </TiltCard>

                {/* Floating Live Badges around mockup */}
                <div className="absolute -top-4 -left-4 float-badge-1 z-20">
                  <div className="glass-card rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 live-dot" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">Live Sales ₹24,580</span>
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-6 float-badge-2 z-20">
                  <div className="glass-card rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                    <Activity className="w-3 h-3 text-sky-500" />
                    <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 whitespace-nowrap">142 Orders Today</span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-4 float-badge-3 z-20">
                  <div className="glass-card rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                    <BadgeCheck className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 whitespace-nowrap">₹99/mo · No Lock-in</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════════ NICHES SECTION ═══════════════════ */}
      <section id="niches" className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200/20 dark:bg-emerald-800/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-200/20 dark:bg-teal-800/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {NICHES.map((niche) => {
              const isPopular = niche.slug === 'restaurant' || niche.slug === 'grocery';
              return (
                <StaggerItem key={niche.slug}>
                  <Card className={`group hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer border-gray-200 dark:border-gray-800 h-full border-t-4 ${getNicheBorderTop(niche.color)} ${getNicheGlowShadow(niche.color)} niche-shimmer gradient-border relative`}>
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 popular-ribbon-bounce">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-md shadow-amber-500/25">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-4 text-center flex flex-col items-center gap-2">
                      <motion.div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getNicheColorClass(niche.color)}`}
                        whileHover={{ y: -4, scale: 1.15 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        {niche.icon}
                      </motion.div>
                      <h3 className="font-semibold text-sm leading-tight">{niche.name}</h3>
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-snug">{niche.description}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

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

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

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

          <div className="mt-14 grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Lines (desktop only) */}
            <div className="hidden md:block absolute top-20 left-[25%] right-[25%]">
              <div className="relative h-0.5 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700">
                {/* Arrow at 50% point */}
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
                  <ChevronRight className="w-4 h-4 text-teal-500 dark:text-teal-400 -mt-0.5" />
                </div>
                {/* Arrow at end */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1">
                  <ChevronRight className="w-4 h-4 text-cyan-500 dark:text-cyan-400 -mt-0.5" />
                </div>
              </div>
            </div>

            {[
              {
                step: 1,
                icon: CreditCard,
                title: 'Sign Up & Pay ₹99',
                description: 'Create your account and start your 14-day free trial. No credit card required upfront.',
                color: 'from-emerald-500 to-emerald-600',
                ring: 'border-emerald-500',
                text: 'text-emerald-600',
              },
              {
                step: 2,
                icon: ShoppingCart,
                title: 'Choose Your Niche',
                description: 'Pick your business type from 15 specialized templates. Each one tailored for your industry.',
                color: 'from-teal-500 to-teal-600',
                ring: 'border-teal-500',
                text: 'text-teal-600',
              },
              {
                step: 3,
                icon: Rocket,
                title: 'Launch Your POS',
                description: 'Start billing immediately. Your custom POS is ready to go — no training needed.',
                color: 'from-cyan-500 to-cyan-600',
                ring: 'border-cyan-500',
                text: 'text-cyan-600',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.step} delay={item.step * 0.15}>
                  <div className="relative text-center">
                    <motion.div
                      className={`step-float-${item.step} inline-block`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: item.step * 0.15 }}
                    >
                      <div className={`relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${item.color} shadow-lg mb-6`}
                      >
                        {/* Step number badge */}
                        <span className={`absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-gray-900 ${item.text} font-bold text-sm flex items-center justify-center border-2 ${item.ring} shadow-sm`}>
                          {item.step}
                        </span>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">{item.description}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

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
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">No hidden fees. No surprises. Pick the plan that fits your business.</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-14 grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
              {PRICING_TIERS.map((tier) => (
                <Card
                  key={tier.name}
                  className={`relative transition-all duration-300 ${
                    tier.popular
                      ? 'border-0 shadow-xl pricing-glow md:scale-105 md:z-10'
                      : 'border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1'
                  }`}
                  style={tier.popular ? {
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(20, 184, 166, 0.08))',
                  } : undefined}
                >
                  {/* Gradient border wrapper for popular card with shimmer */}
                  {tier.popular && (
                    <div className="absolute -inset-[2px] rounded-xl pricing-shimmer-border -z-10 opacity-80" />
                  )}
                  {/* Another background layer */}
                  {tier.popular && (
                    <div className="absolute inset-0 rounded-xl bg-white dark:bg-gray-900" />
                  )}

                  {/* Most Popular Ribbon */}
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 popular-ribbon-bounce">
                      <div className="relative">
                        <Badge className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-0 rounded-full px-5 py-1.5 text-sm font-bold shadow-lg shadow-emerald-600/30 whitespace-nowrap">
                          <Sparkles className="w-3.5 h-3.5 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader className={`text-center pb-2 ${tier.popular ? 'pt-8 relative z-10' : 'pt-6'}`}>
                    <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-4">
                      <div className="flex items-baseline justify-center gap-1">
                        {tier.price > 0 && <IndianRupee className={`w-7 h-7 ${tier.popular ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`} />}
                        <span className={`${tier.popular ? 'text-6xl' : 'text-5xl'} font-extrabold tracking-tight`}>{tier.price > 0 ? tier.price : 'Free'}</span>
                        {tier.price > 0 && <span className="text-gray-500 dark:text-gray-400 text-lg">{tier.period}</span>}
                        {tier.price === 0 && <span className="text-gray-500 dark:text-gray-400 text-lg ml-1">{tier.period}</span>}
                      </div>
                      {tier.popular && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 rounded-full">
                            14-day free trial
                          </Badge>
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 rounded-full text-[11px]">
                            <Zap className="w-3 h-3 mr-0.5" />
                            Best Value
                          </Badge>
                        </div>
                      )}
                      {tier.popular && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0 rounded-full text-[11px]">
                            <Zap className="w-3 h-3 mr-0.5" />
                            Save 20% annually
                          </Badge>
                        </div>
                      )}
                      {!tier.popular && tier.price > 0 && (
                        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Billed annually: ₹{tier.name === 'Enterprise' ? '4,990' : '990'}/yr <span className="text-emerald-500 font-medium">Save 17%</span></p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className={`pb-2 ${tier.popular ? 'relative z-10' : ''}`}>
                    <div className="space-y-3">
                      {tier.features.map((feature) => (
                        <div key={feature.name} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                            feature.included
                              ? 'bg-emerald-100 dark:bg-emerald-900/30'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            {feature.included ? (
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <X className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          <span className={`text-sm ${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className={`flex flex-col gap-3 pt-4 pb-6 ${tier.popular ? 'relative z-10' : ''}`}>
                    <Button
                      size="lg"
                      className={`w-full rounded-full h-12 text-base ${
                        tier.popular
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 pricing-btn-pulse'
                          : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900'
                      }`}
                      onClick={() => setCurrentView({ page: 'signup' })}
                    >
                      {tier.price === 0 ? 'Get Started' : 'Start Free Trial'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                    {tier.popular && <p className="text-xs text-gray-500 dark:text-gray-400">No credit card required</p>}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </FadeIn>

          {/* Comparison Table */}
          <FadeIn delay={0.3}>
            <div className="mt-16 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-center mb-6">Compare Plans</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Feature</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Starter</th>
                      <th className="text-center py-3 px-4 font-semibold bg-emerald-50 dark:bg-emerald-900/20">
                        <span className="text-emerald-600 dark:text-emerald-400">Pro</span>
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_FEATURES.map((row, i) => (
                      <tr key={row.name} className={`border-t border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/50 dark:bg-gray-900/30'}`}>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">{row.name}</td>
                        <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400">{row.starter}</td>
                        <td className="py-3 px-4 text-center bg-emerald-50/50 dark:bg-emerald-900/10 font-medium text-emerald-700 dark:text-emerald-300">{row.pro}</td>
                        <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section id="testimonials-parallax" className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl -translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-teal-100/30 dark:bg-teal-900/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
        {/* Parallax background shapes */}
        <div className="absolute top-20 left-[5%] w-24 h-24 bg-emerald-200/20 dark:bg-emerald-800/10 rounded-full blur-xl" style={{ transform: 'translateY(var(--parallax-testimonials, 0px))' }} />
        <div className="absolute bottom-20 right-[8%] w-32 h-32 bg-teal-200/20 dark:bg-teal-800/10 rounded-full blur-xl" style={{ transform: 'translateY(var(--parallax-testimonials, 0px))' }} />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-emerald-100/15 dark:bg-emerald-900/5 rounded-full blur-2xl" style={{ transform: 'translate(-50%, -50%) translateY(var(--parallax-testimonials, 0px))' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Unified Carousel - Desktop shows 3, Mobile shows 1 */}
          <div className="mt-14 relative">
            {/* Desktop: 3-card carousel with auto-rotate slide effect */}
            <div className="hidden md:block">
              <AnimatePresence mode="wait" custom={carouselDirection}>
                <motion.div
                  key={testimonialIndex}
                  custom={carouselDirection}
                  initial={{ opacity: 0, x: carouselDirection * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: carouselDirection * -60 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="grid md:grid-cols-3 gap-6"
                >
                  {TESTIMONIALS.map((t, i) => {
                    const BusinessIcon = t.businessIcon;
                    const isHighlighted = i === testimonialIndex;
                    return (
                      <TiltCard key={t.name} className="h-full">
                        <Card className={`h-full border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-500 overflow-hidden relative bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20 ${
                          isHighlighted ? 'shadow-xl ring-2 ring-emerald-500/30 scale-[1.02]' : ''
                        }`}>
                          <div className="absolute top-3 right-4 text-6xl font-serif text-emerald-500/10 dark:text-emerald-400/10 leading-none select-none pointer-events-none">
                            &ldquo;
                          </div>
                          <div className={`h-1.5 bg-gradient-to-r ${t.color} transition-all duration-500 ${isHighlighted ? 'h-2' : ''}`} />
                          <CardContent className="p-6">
                            <div className="flex gap-0.5 mb-3">
                              {Array.from({ length: 5 }).map((_, si) => (
                                <Star key={si} className={`w-4 h-4 ${si < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                              ))}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-6">
                              &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/20`}>
                                {t.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">{t.name}</p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                  <BusinessIcon className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{t.business} · {t.city}</span>
                                </div>
                              </div>
                              <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      </TiltCard>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile: single-card carousel */}
            <div className="md:hidden">
              <div className="overflow-hidden">
                <AnimatePresence mode="wait" custom={carouselDirection}>
                  {(() => {
                    const t = TESTIMONIALS[testimonialIndex];
                    const BusinessIcon = t.businessIcon;
                    return (
                      <motion.div
                        key={testimonialIndex}
                        custom={carouselDirection}
                        initial={{ opacity: 0, x: carouselDirection * 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: carouselDirection * -100 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      >
                        <Card className="border-gray-200 dark:border-gray-800 overflow-hidden relative bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20">
                          <div className="absolute top-3 right-4 text-6xl font-serif text-emerald-500/10 dark:text-emerald-400/10 leading-none select-none pointer-events-none">
                            &ldquo;
                          </div>
                          <div className={`h-1.5 bg-gradient-to-r ${t.color}`} />
                          <CardContent className="p-6">
                            <div className="flex gap-0.5 mb-3">
                              {Array.from({ length: 5 }).map((_, si) => (
                                <Star key={si} className={`w-4 h-4 ${si < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                              ))}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-6">
                              &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/20`}>
                                {t.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">{t.name}</p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                  <BusinessIcon className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{t.business} · {t.city}</span>
                                </div>
                              </div>
                              <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </div>

            {/* Shared Navigation arrows & dots */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => { setCarouselDirection(-1); setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); }}
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCarouselDirection(i > testimonialIndex ? 1 : -1); setTestimonialIndex(i); }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === testimonialIndex ? 'bg-emerald-500 w-6' : 'bg-gray-300 dark:bg-gray-600 w-2.5'
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => { setCarouselDirection(1); setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length); }}
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 cta-gradient-animated" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent)]" />

        {/* Floating particles */}
        <div className="absolute top-10 left-[10%] w-3 h-3 bg-white/20 rounded-full float-shape-1" />
        <div className="absolute top-20 right-[20%] w-2 h-2 bg-white/15 rounded-full float-shape-2" />
        <div className="absolute bottom-16 left-[30%] w-4 h-4 bg-white/10 rounded-full float-shape-3" />
        <div className="absolute bottom-10 right-[15%] w-2 h-2 bg-white/20 rounded-full float-shape-4" />

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
              className="mt-10 rounded-full bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl h-14 px-10 text-lg font-bold pulse-cta-glow"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-emerald-200 text-sm">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> 14-day free trial</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Cancel anytime</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer id="contact" className="bg-gray-900 dark:bg-gray-950 text-gray-400 pt-20 pb-12 relative">
        {/* Top border gradient emerald → transparent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Badge Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-10 border-b border-gray-800 mb-10">
            <div className="flex items-center gap-2.5 bg-gray-800/60 rounded-full px-5 py-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Trusted by 10,000+ Stores</p>
                <p className="text-[11px] text-gray-500">SOC 2 Compliant · Data Encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-gray-800/60 rounded-full px-5 py-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Made in India 🇮🇳</p>
                <p className="text-[11px] text-gray-500">GST Ready · UPI Payments</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 pb-14 border-b border-gray-800">
            {/* Brand + Newsletter */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">StoreOS</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                India&apos;s first multi-niche POS platform. Run your store on autopilot for just ₹99/month. Trusted by 10,000+ businesses across India.
              </p>
              {/* Social Media Icons */}
              <div className="flex gap-3 mt-5">
                {[
                  { Icon: Twitter, label: 'Twitter', href: '#' },
                  { Icon: Linkedin, label: 'LinkedIn', href: '#' },
                  { Icon: Github, label: 'GitHub', href: '#' },
                  { Icon: Instagram, label: 'Instagram', href: '#' },
                  { Icon: Youtube, label: 'YouTube', href: '#' },
                ].map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-gray-800 hover:bg-emerald-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
              {/* Newsletter Signup */}
              <div className="mt-6">
                <p className="text-sm font-medium text-white mb-2">Stay updated</p>
                <p className="text-xs text-gray-500 mb-3">Get product updates & tips</p>
                {newsletterSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-emerald-400 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>You&apos;re subscribed!</span>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); if (newsletterEmail) { setNewsletterSuccess(true); setNewsletterEmail(''); setTimeout(() => setNewsletterSuccess(false), 3000); } }}
                    className="flex gap-2"
                  >
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <Button type="submit" className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 px-4">
                      Subscribe
                    </Button>
                  </form>
                )}
                <p className="text-[11px] text-gray-600 mt-1.5">No spam. Unsubscribe anytime.</p>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5">
                {[
                  { name: 'Features', id: 'features' },
                  { name: 'Pricing', id: 'pricing' },
                  { name: 'Templates', id: 'niches' },
                  { name: 'Integrations', id: 'features' },
                  { name: 'API', id: 'features' },
                ].map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="text-sm hover:text-emerald-400 transition-colors"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2.5">
                {['About Us', 'Careers', 'Blog', 'Press', 'Contact'].map((link) => (
                  <li key={link}>
                    <button className="text-sm hover:text-emerald-400 transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
              <ul className="space-y-2.5">
                {['Help Center', 'Terms of Service', 'Privacy Policy', 'Refund Policy', 'Status'].map((link) => (
                  <li key={link}>
                    <button className="text-sm hover:text-emerald-400 transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} StoreOS. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {/* Made with love in India badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800/60 border border-gray-700/50 text-sm">
                <span className="text-gray-300">Made with</span>
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span className="text-gray-300">in India</span>
                <span>🇮🇳</span>
              </div>
              <div className="h-4 w-px bg-gray-700" />
              {/* Social icons row */}
              <div className="flex items-center gap-3">
                {[
                  { Icon: Twitter, href: '#', label: 'Twitter' },
                  { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { Icon: Github, href: '#', label: 'GitHub' },
                  { Icon: Instagram, href: '#', label: 'Instagram' },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="text-gray-500 hover:text-emerald-400 transition-all duration-200 hover:scale-110"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
