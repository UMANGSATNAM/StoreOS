'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Store,
  User,
  Phone,
  Sparkles,
  Shield,
  Clock,
  Headphones,
  Check,
  X,
  TrendingUp,
  Globe,
  Package,
} from 'lucide-react';
import type { AppUser, AppSubscription } from '@/lib/types';

// ── Password strength helper (enhanced with 4 levels) ──
function getPasswordStrength(pw: string): {
  score: number; // 0-3
  label: string;
  color: string;
  bgColor: string;
  percent: number;
} {
  if (!pw) return { score: 0, label: '', color: '', bgColor: '', percent: 0 };

  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const level = score <= 1 ? 0 : score <= 3 ? 1 : 2;

  const levels = [
    { label: 'Weak', color: 'text-red-500', bgColor: 'bg-red-500', percent: 33 },
    { label: 'Medium', color: 'text-amber-500', bgColor: 'bg-amber-500', percent: 66 },
    { label: 'Strong', color: 'text-emerald-500', bgColor: 'bg-emerald-500', percent: 100 },
  ];

  return { score: level, ...levels[level] };
}

// ── Validation checks for real-time feedback ──
function getPasswordChecks(pw: string) {
  return [
    { label: 'At least 6 characters', met: pw.length >= 6 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(pw) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(pw) },
    { label: 'Contains a number', met: /\d/.test(pw) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(pw) },
  ];
}

// ── Counter animation hook ──
function useCounter(end: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let rafId: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [end, duration, start]);
  return count;
}

// ── Animated stat for left panel ──
function StatItem({ icon: Icon, value, suffix, label, index }: {
  icon: React.ElementType; value: number; suffix: string; label: string; index: number;
}) {
  const count = useCounter(value, 2000 + index * 300, true);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 + index * 0.15 }}
      className="flex items-center gap-2.5"
    >
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-emerald-200" />
      </div>
      <div>
        <p className="text-lg font-bold text-white">{count}{suffix}</p>
        <p className="text-[11px] text-emerald-200/60 -mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Floating orb config ──
const orbs = [
  { size: 300, x: '60%', y: '-15%', color: 'rgba(20,184,166,0.25)', delay: 0 },
  { size: 200, x: '-10%', y: '60%', color: 'rgba(52,211,153,0.15)', delay: 1.5 },
  { size: 160, x: '30%', y: '70%', color: 'rgba(255,255,255,0.06)', delay: 3 },
  { size: 120, x: '80%', y: '40%', color: 'rgba(6,95,70,0.2)', delay: 2 },
];

const leftPanelStats = [
  { icon: Store, value: 2500, suffix: '+', label: 'Businesses' },
  { icon: Package, value: 15, suffix: '+', label: 'Niches' },
  { icon: TrendingUp, value: 98, suffix: '%', label: 'Uptime' },
  { icon: Globe, value: 50, suffix: 'M+', label: 'Transactions' },
];

export default function SignupPage() {
  const { setCurrentView, setUser, setSubscription } = useAppStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const leftPanelRef = useRef<HTMLDivElement>(null);

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);
  const pwChecks = useMemo(() => getPasswordChecks(password), [password]);

  // ── Field completion progress ──
  const fieldProgress = useMemo(() => {
    const fields = [
      { key: 'name', done: name.trim().length >= 2 },
      { key: 'email', done: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) },
      { key: 'phone', done: !phone || /^[+]?[\d\s\-()]{7,15}$/.test(phone) },
      { key: 'password', done: password.length >= 6 },
      { key: 'confirm', done: confirmPassword.length > 0 && password === confirmPassword },
    ];
    return fields;
  }, [name, email, phone, password, confirmPassword]);

  const completedCount = fieldProgress.filter((f) => f.done).length;

  // ── Mouse parallax on left panel ──
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!leftPanelRef.current) return;
    const rect = leftPanelRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  // ── Validation ──
  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (phone && !/^[+]?[\d\s\-()]{7,15}$/.test(phone)) {
      errs.phone = 'Please enter a valid phone number';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      errs.terms = 'You must agree to the Terms of Service';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }

      const apiUser = data.user;
      const appUser: AppUser = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role || 'user',
      };
      setUser(appUser);

      if (apiUser.subscription) {
        const appSub: AppSubscription = {
          plan: apiUser.subscription.plan,
          status: apiUser.subscription.status,
          trialEndsAt: apiUser.subscription.trialEndsAt,
        };
        setSubscription(appSub);
      }

      setCurrentView({ page: 'onboarding-niche' });
      toast.success('Account created! Let\'s set up your store.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Benefits for left panel ──
  const benefits = [
    { icon: Sparkles, text: '14-day free trial' },
    { icon: Shield, text: 'Secure & encrypted' },
    { icon: Clock, text: 'Setup in minutes' },
    { icon: Headphones, text: '24/7 support' },
  ];

  // ── Stagger animation variants ──
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50/40">
      {/* ── Animated background gradient ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] animate-[spin_60s_linear_infinite]"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(20,184,166,0.03) 0deg, transparent 60deg, rgba(52,211,153,0.04) 120deg, transparent 180deg, rgba(6,95,70,0.03) 240deg, transparent 300deg, rgba(20,184,166,0.03) 360deg)',
          }}
        />
      </div>

      {/* ── Left: Brand panel (desktop only) ── */}
      <div
        ref={leftPanelRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-600 via-emerald-700 to-emerald-800 text-white overflow-hidden"
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating orbs with parallax */}
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: orb.color,
            }}
            animate={{
              x: mousePos.x * (15 + i * 8),
              y: mousePos.y * (15 + i * 8),
              scale: [1, 1.05, 1],
            }}
            transition={{
              x: { duration: 0.6, ease: 'easeOut' },
              y: { duration: 0.6, ease: 'easeOut' },
              scale: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        ))}

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 py-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg shadow-emerald-900/20">
              <Store className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">StoreOS</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4"
          >
            Start your<br />
            <span className="text-emerald-200">free trial</span> today.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-emerald-100/80 text-lg mb-10 max-w-md"
          >
            Join thousands of businesses using StoreOS to manage sales,
            inventory, and customers — all in one place.
          </motion.p>

          {/* Benefits list with stagger */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-3"
          >
            {benefits.map((b) => (
              <motion.div
                key={b.text}
                variants={itemVariants}
                whileHover={{ scale: 1.03, x: 4 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 max-w-xs transition-colors cursor-default"
              >
                <b.icon className="w-5 h-5 text-emerald-200 shrink-0" />
                <span className="text-sm font-medium">{b.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Animated counter stats */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-x-6 gap-y-3">
            {leftPanelStats.map((s, i) => (
              <StatItem key={s.label} {...s} index={i} />
            ))}
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {['bg-amber-400', 'bg-pink-400', 'bg-cyan-400', 'bg-violet-400'].map((c, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${c} border-2 border-emerald-700 flex items-center justify-center text-[10px] font-bold text-white`}
                >
                  {['R', 'P', 'A', 'S'][i]}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold">2,500+</span>
              <span className="text-emerald-100/70"> businesses trust StoreOS</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Dot grid pattern on form side */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #059669 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">StoreOS</span>
          </div>
          <div className="hidden lg:block" />
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setCurrentView({ page: 'landing' })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </motion.button>
        </div>

        {/* Form container */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <Card className="w-full border border-emerald-100/50 shadow-xl shadow-emerald-900/5 bg-white/70 backdrop-blur-xl relative overflow-hidden">
              {/* Subtle border glow effect */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-emerald-200/30 pointer-events-none" />

              <CardContent className="p-6 sm:p-8 relative z-10">
                {/* Progress indicator dots at top */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-center gap-2 mb-5"
                >
                  {fieldProgress.map((f, i) => (
                    <div key={f.key} className="flex items-center gap-2">
                      <motion.div
                        animate={{
                          scale: f.done ? [1, 1.3, 1] : 1,
                          backgroundColor: f.done ? '#059669' : '#e5e7eb',
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-2.5 h-2.5 rounded-full"
                      />
                      {i < fieldProgress.length - 1 && (
                        <motion.div
                          animate={{
                            backgroundColor: f.done ? '#059669' : '#e5e7eb',
                          }}
                          transition={{ duration: 0.3 }}
                          className="w-4 h-0.5 rounded-full"
                        />
                      )}
                    </div>
                  ))}
                  <span className="text-xs text-gray-400 ml-2">
                    {completedCount}/{fieldProgress.length}
                  </span>
                </motion.div>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-5"
                >
                  <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Start your 14-day free trial. No credit card required.
                  </p>
                </motion.div>

                {/* Social signup buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-2 gap-2 sm:gap-3 mb-5"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 min-h-[44px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 hover:shadow-sm cursor-not-allowed opacity-80"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="hidden xs:inline">Google</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Coming Soon</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 min-h-[44px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 hover:shadow-sm cursor-not-allowed opacity-80"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                        <span className="hidden xs:inline">Apple</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Coming Soon</TooltipContent>
                  </Tooltip>
                </motion.div>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="relative mb-5"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white/80 backdrop-blur-sm px-3 text-gray-400">or sign up with email</span>
                  </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 h-11 text-base transition-all duration-200 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                        }}
                        aria-invalid={!!errors.name}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                      Email address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-11 text-base transition-all duration-200 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                        }}
                        aria-invalid={!!errors.email}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Phone (optional) */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="signup-phone" className="text-sm font-medium text-gray-700">
                      Phone <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        className="pl-10 h-11 text-base transition-all duration-200 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                        }}
                        aria-invalid={!!errors.phone}
                      />
                    </div>
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.phone}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="pl-10 pr-10 h-11 text-base transition-all duration-200 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                        }}
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Animated strength meter with color transitions */}
                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="h-1.5 flex-1 rounded-full overflow-hidden bg-gray-200"
                            >
                              <motion.div
                                className={`h-full rounded-full ${
                                  i <= pwStrength.score ? pwStrength.bgColor : 'bg-transparent'
                                }`}
                                initial={{ width: '0%' }}
                                animate={{ width: i <= pwStrength.score ? '100%' : '0%' }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                              />
                            </motion.div>
                          ))}
                        </div>
                        <motion.p
                          key={pwStrength.label}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-xs font-medium ${pwStrength.color}`}
                        >
                          {pwStrength.label}
                        </motion.p>

                        {/* Real-time validation feedback with animated checkmarks/X marks */}
                        <div className="space-y-1">
                          {pwChecks.map((check, i) => (
                            <motion.div
                              key={check.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-2"
                            >
                              <motion.div
                                animate={{
                                  scale: check.met ? [1, 1.3, 1] : 1,
                                  rotate: check.met ? [0, -10, 0] : 0,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                {check.met ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-gray-300" />
                                )}
                              </motion.div>
                              <span className={`text-xs transition-colors duration-200 ${check.met ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {check.label}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="signup-confirm" className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="signup-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10 h-11 text-base transition-all duration-200 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
                        }}
                        aria-invalid={!!errors.confirmPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Match indicator */}
                    {confirmPassword && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5"
                      >
                        {password === confirmPassword ? (
                          <>
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.3 }}>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            </motion.div>
                            <span className="text-xs text-emerald-600">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-xs text-red-400">Passwords don&apos;t match</span>
                          </>
                        )}
                      </motion.div>
                    )}
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Terms checkbox with smooth animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="space-y-1"
                  >
                    <div className="flex items-start gap-2.5">
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="mt-0.5"
                      >
                        <Checkbox
                          id="terms"
                          checked={agreeTerms}
                          onCheckedChange={(c) => {
                            setAgreeTerms(c === true);
                            if (errors.terms) setErrors((p) => ({ ...p, terms: '' }));
                          }}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 transition-all duration-200"
                        />
                      </motion.div>
                      <Label
                        htmlFor="terms"
                        className="text-sm text-gray-600 cursor-pointer select-none leading-snug"
                      >
                        I agree to the{' '}
                        <button
                          type="button"
                          className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
                          onClick={(e) => {
                            e.preventDefault();
                            toast.info('Terms of Service page coming soon!');
                          }}
                        >
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
                          onClick={(e) => {
                            e.preventDefault();
                            toast.info('Privacy Policy page coming soon!');
                          }}
                        >
                          Privacy Policy
                        </button>
                      </Label>
                    </div>
                    <AnimatePresence>
                      {errors.terms && (
                        <motion.p
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          className="text-xs text-red-500 ml-7"
                        >
                          {errors.terms}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Submit with shimmer/glow effect */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm cursor-pointer relative overflow-hidden group mt-1"
                    >
                      <span className="relative z-10">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating account…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Start Free Trial
                          </span>
                        )}
                      </span>
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      {/* Subtle glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-emerald-500/0 via-emerald-400/10 to-emerald-500/0" />
                    </Button>
                  </motion.div>
                </form>

                {/* Login link */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 }}
                  className="text-center text-sm text-gray-500 mt-5"
                >
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentView({ page: 'login' })}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                  >
                    Login
                  </button>
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
