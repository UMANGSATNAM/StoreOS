'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Store,
  ShoppingBag,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react';
import type { AppUser, AppStore, AppSubscription } from '@/lib/types';

export default function LoginPage() {
  const { setCurrentView, setUser, setStore, setSubscription } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // ── Validation ──
  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      // Map API response to store shapes
      const apiUser = data.user;
      const appUser: AppUser = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role || 'user',
      };
      setUser(appUser);

      // Set subscription from top-level response
      const apiSubscription = data.subscription;
      if (apiSubscription) {
        const appSub: AppSubscription = {
          plan: apiSubscription.plan,
          status: apiSubscription.status,
          trialEndsAt: apiSubscription.trialEndsAt,
        };
        setSubscription(appSub);
      }

      // Set store from top-level response with full data
      const apiStore = data.store;
      if (apiStore) {
        const appStore: AppStore = {
          id: apiStore.id,
          name: apiStore.name,
          niche: apiStore.niche,
          template: apiStore.template,
          onboardingComplete: apiStore.onboardingComplete,
          taxRate: apiStore.taxRate,
          ownerName: apiStore.ownerName,
          city: apiStore.city,
          state: apiStore.state,
          phone: apiStore.phone,
          address: apiStore.address,
          gstNumber: apiStore.gstNumber,
        };
        setStore(appStore);
        setCurrentView({ page: 'dashboard' });
        toast.success('Welcome back!');
      } else {
        setStore(null);
        setCurrentView({ page: 'onboarding-niche' });
        toast.success('Welcome! Let\'s set up your store.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Brand features for illustration side ──
  const features = [
    { icon: ShoppingBag, text: 'Point of Sale' },
    { icon: BarChart3, text: 'Analytics & Reports' },
    { icon: Users, text: 'Customer Management' },
    { icon: Zap, text: '15+ Business Niches' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40">
      {/* ── Left: Brand illustration (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-emerald-500/30 blur-2xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 py-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Store className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">StoreOS</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4">
            Run your business<br />
            <span className="text-emerald-200">smarter</span>, not harder.
          </h1>
          <p className="text-emerald-100/80 text-lg mb-10 max-w-md">
            The all-in-one POS platform built for every niche — from restaurants
            to retail, salons to clinics.
          </p>

          {/* Feature list */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10"
              >
                <f.icon className="w-5 h-5 text-emerald-200 shrink-0" />
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial-like quote at bottom */}
          <div className="mt-12 pl-4 border-l-2 border-emerald-300/40">
            <p className="text-emerald-100/70 text-sm italic">
              &ldquo;StoreOS helped us digitize our kirana store in under 10 minutes. Our billing speed doubled!&rdquo;
            </p>
            <p className="text-emerald-200/60 text-xs mt-1">— Rajesh, Fresh Mart</p>
          </div>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">StoreOS</span>
          </div>
          <div className="hidden lg:block" />
          <button
            onClick={() => setCurrentView({ page: 'landing' })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </button>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-8">
          <Card className="w-full max-w-md border-0 shadow-lg shadow-emerald-900/5 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Sign in to your StoreOS account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-11"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                      }}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-11"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                      }}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Remember me & Forgot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(c) => setRememberMe(c === true)}
                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm text-gray-600 cursor-pointer select-none"
                    >
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    onClick={() => toast.info('Password reset is coming soon!')}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>

              {/* Signup link */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView({ page: 'signup' })}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Sign up
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
