'use client';

import { useAppStore } from '@/lib/store';
import LandingPage from '@/components/landing/LandingPage';
import LoginPage from '@/components/auth/LoginPage';
import SignupPage from '@/components/auth/SignupPage';
import NicheSelection from '@/components/onboarding/NicheSelection';
import TemplateSelection from '@/components/onboarding/TemplateSelection';
import StoreSetup from '@/components/onboarding/StoreSetup';
import PosDashboard from '@/components/dashboard/PosDashboard';
import AdminPanel from '@/components/admin/AdminPanel';

export default function Home() {
  const { currentView } = useAppStore();

  switch (currentView.page) {
    case 'login':
      return <LoginPage />;
    case 'signup':
      return <SignupPage />;
    case 'onboarding-niche':
      return <NicheSelection />;
    case 'onboarding-template':
      return <TemplateSelection />;
    case 'onboarding-setup':
      return <StoreSetup />;
    case 'dashboard':
      return <PosDashboard />;
    case 'admin':
      return <AdminPanel />;
    case 'landing':
    default:
      return <LandingPage />;
  }
}
