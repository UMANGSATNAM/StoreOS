'use client';

import React, { useState, useMemo } from 'react';
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
  User,
  Phone,
  Sparkles,
  Shield,
  Clock,
  Headphones,
} from 'lucide-react';
import type { AppUser, AppSubscription } from '@/lib/types';

// ── Password strength helper ──
function getPasswordStrength(pw: string): {
  score: number; // 0-3
  label: string;
  color: string;
  bgColor: string;
} {
  if (!pw) return { score: 0, label: '', color: '', bgColor: '' };

  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  // Normalize to 0-3
  const level = score <= 1 ? 0 : score <= 3 ? 1 : 2;

  const levels = [
    { label: 'Weak', color: 'text-red-500', bgColor: 'bg-red-500' },
    { label: 'Medium', color: 'text-amber-500', bgColor: 'bg-amber-500' },
    { label: 'Strong', color: 'text-emerald-500', bgColor: 'bg-emerald-500' },
  ];

  return { score: level, ...levels[level] };
}

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

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);

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

      // Map API response to store shapes
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

  // ── Benefits for illustration side ──
  const benefits = [
    { icon: Sparkles, text: '14-day free trial' },
    { icon: Shield, text: 'Secure & encrypted' },
    { icon: Clock, text: 'Setup in minutes' },
    { icon: Headphones, text: '24/7 support' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-emerald-50 via-white to-teal-50/40">
      {/* ── Left: Brand illustration (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-teal-600 via-emerald-700 to-emerald-800 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-100px] right-[-100px] w-72 h-72 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-80px] w-64 h-64 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-white/5 blur-xl" />

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
            Start your<br />
            <span className="text-emerald-200">free trial</span> today.
          </h1>
          <p className="text-emerald-100/80 text-lg mb-10 max-w-md">
            Join thousands of businesses using StoreOS to manage sales,
            inventory, and customers — all in one place.
          </p>

          {/* Benefits list */}
          <div className="space-y-3">
            {benefits.map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10 max-w-xs"
              >
                <b.icon className="w-5 h-5 text-emerald-200 shrink-0" />
                <span className="text-sm font-medium">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-3">
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
                <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Start your 14-day free trial. No credit card required.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10 h-11"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                      }}
                      aria-invalid={!!errors.name}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-11"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                      }}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="text-sm font-medium text-gray-700">
                    Phone <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="pl-10 h-11"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                      }}
                      aria-invalid={!!errors.phone}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      className="pl-10 pr-10 h-11"
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

                  {/* Strength indicator */}
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                              i <= pwStrength.score ? pwStrength.bgColor : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${pwStrength.color}`}>
                        {pwStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 h-11"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms checkbox */}
                <div className="space-y-1">
                  <div className="flex items-start gap-2.5">
                    <Checkbox
                      id="terms"
                      checked={agreeTerms}
                      onCheckedChange={(c) => {
                        setAgreeTerms(c === true);
                        if (errors.terms) setErrors((p) => ({ ...p, terms: '' }));
                      }}
                      className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
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
                  {errors.terms && (
                    <p className="text-xs text-red-500 ml-7">{errors.terms}</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm cursor-pointer mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account…
                    </span>
                  ) : (
                    'Start Free Trial'
                  )}
                </Button>
              </form>

              {/* Login link */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView({ page: 'login' })}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Login
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
