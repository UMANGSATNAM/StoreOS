// ============================================================
// StoreOS - TypeScript Types & Constants
// ============================================================

// --- Niche Types ---

export type NicheSlug =
  | 'restaurant'
  | 'clothing'
  | 'pharmacy'
  | 'salon'
  | 'grocery'
  | 'electronics'
  | 'coaching'
  | 'clinic'
  | 'garage'
  | 'bakery'
  | 'wholesale'
  | 'jewellery'
  | 'gym'
  | 'stationery'
  | 'hotel';

export interface Niche {
  slug: NicheSlug;
  name: string;
  icon: string;
  description: string;
  color: string; // tailwind color class
  features: string[];
}

// --- Template Types ---

export interface Template {
  id: string;
  name: string;
  niche: NicheSlug;
  colorScheme: { primary: string; secondary: string; accent: string };
  layoutStyle: string;
  description: string;
}

// --- Cart Types ---

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  discount: number;
  total: number;
  notes?: string;
}

// --- Navigation Types ---

export interface AppView {
  page:
    | 'landing'
    | 'login'
    | 'signup'
    | 'onboarding-niche'
    | 'onboarding-template'
    | 'onboarding-setup'
    | 'dashboard'
    | 'admin';
  dashboardTab?: string;
}

// --- Auth Types ---

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// --- Store (Business) Types ---

export interface AppStore {
  id: string;
  name: string;
  niche: string;
  template: string;
  onboardingComplete: boolean;
}

// --- Subscription Types ---

export interface AppSubscription {
  plan: string;
  status: string;
  trialEndsAt: string | null;
}

// ============================================================
// Niche Data (15 Niches)
// ============================================================

export const NICHES: Niche[] = [
  {
    slug: 'restaurant',
    name: 'Restaurant / Dhaba / Food Court',
    icon: '🍽️',
    description: 'Table management, KOT, menu with images, split bills',
    color: 'orange',
    features: ['Table Management', 'KOT Printing', 'Menu Categories', 'Split Bill', 'Daily Specials', 'Zomato/Swiggy'],
  },
  {
    slug: 'clothing',
    name: 'Clothing & Fashion Store',
    icon: '👗',
    description: 'Size variants, trial rooms, barcode scanning, exchanges',
    color: 'pink',
    features: ['Size/Color Variants', 'Trial Room Tracking', 'Barcode Scan', 'Exchange Flow', 'Fashion Catalog', 'Season Tags'],
  },
  {
    slug: 'pharmacy',
    name: 'Medical Store / Pharmacy',
    icon: '💊',
    description: 'Generic alternatives, batch tracking, expiry alerts, prescriptions',
    color: 'emerald',
    features: ['Generic Alternatives', 'Batch & Expiry', 'Auto Reorder', 'Prescription Attach', 'Schedule H Warning', 'Insurance Flag'],
  },
  {
    slug: 'salon',
    name: 'Salon, Parlour & Spa',
    icon: '💈',
    description: 'Appointment booking, service menu, staff assignment, memberships',
    color: 'violet',
    features: ['Appointment Calendar', 'Service Menu', 'Staff Assignment', 'Loyalty Cards', 'Before/After Photos', 'Tip Tracking'],
  },
  {
    slug: 'grocery',
    name: 'Grocery / Kirana / Supermarket',
    icon: '🛒',
    description: 'Bulk weight entry, fast barcode, khata/credit book, WhatsApp bills',
    color: 'green',
    features: ['Bulk Weight Entry', 'Fast Barcode Mode', 'Khata/Credit Book', 'WhatsApp Bills', 'Expiry Alerts', 'Loose Item Calc'],
  },
  {
    slug: 'electronics',
    name: 'Electronics & Mobile Shop',
    icon: '📱',
    description: 'IMEI tracking, warranty, EMI calculation, repair jobs',
    color: 'cyan',
    features: ['IMEI Tracking', 'Warranty Mgmt', 'EMI Calculator', 'Repair Tracking', 'Brand Filter', 'Demo Unit Tracking'],
  },
  {
    slug: 'coaching',
    name: 'Coaching / Tuition Centre',
    icon: '🎓',
    description: 'Student enrollment, fee collection, attendance, exam marks',
    color: 'blue',
    features: ['Student Enrollment', 'Fee Installments', 'Attendance', 'Exam Marks', 'Certificates', 'Parent SMS'],
  },
  {
    slug: 'clinic',
    name: 'Clinic / Hospital / Diagnostic',
    icon: '🏥',
    description: 'Patient registration, OPD queue, prescription pad, lab tests',
    color: 'red',
    features: ['Patient Registration', 'OPD Queue', 'Prescription Pad', 'Lab Tests', 'Medicine Dispensary', 'Insurance Claims'],
  },
  {
    slug: 'garage',
    name: 'Auto Workshop / Garage',
    icon: '🚗',
    description: 'Vehicle registration, job cards, parts inventory, labour charges',
    color: 'slate',
    features: ['Vehicle Registration', 'Job Cards', 'Parts Inventory', 'Labour Charges', 'Delivery Tracking', 'Service History'],
  },
  {
    slug: 'bakery',
    name: 'Bakery, Cafe & Sweet Shop',
    icon: '🧁',
    description: 'Time-based menu, order display, combos, loyalty stamp card',
    color: 'amber',
    features: ['Time-Based Menu', 'Order Display', 'Combo Builder', 'Loyalty Stamp', 'Pre-Orders', 'Production Log'],
  },
  {
    slug: 'wholesale',
    name: 'Wholesale / B2B Distributor',
    icon: '📦',
    description: 'Party ledger, bulk discounts, credit limits, e-way bills',
    color: 'zinc',
    features: ['Party Ledger', 'Bulk Discounts', 'Credit Limits', 'Payment Follow-up', 'E-Way Bills', 'Tally Export'],
  },
  {
    slug: 'jewellery',
    name: 'Jewellery & Accessories Store',
    icon: '💎',
    description: 'Live gold rates, making charges, hallmark, exchange flow',
    color: 'yellow',
    features: ['Live Gold Rates', 'Making Charges', 'Hallmark Cert', 'Old Gold Exchange', 'Custom Orders', 'Insurance Valuation'],
  },
  {
    slug: 'gym',
    name: 'Gym / Fitness Centre',
    icon: '🏋️',
    description: 'Membership plans, QR attendance, trainer assignment, renewals',
    color: 'lime',
    features: ['Membership Plans', 'QR Attendance', 'Trainer Assignment', 'Diet Plans', 'Renewal Reminders', 'Class Booking'],
  },
  {
    slug: 'stationery',
    name: 'Stationery & Book Store',
    icon: '📚',
    description: 'ISBN search, school supply kits, bulk orders, commissions',
    color: 'teal',
    features: ['ISBN Search', 'Supply Kit Builder', 'Bulk School Orders', 'Commission Tracking', 'Book Rentals', 'Exam Bundles'],
  },
  {
    slug: 'hotel',
    name: 'Hotel / Lodge / Guest House',
    icon: '🛏️',
    description: 'Room grid, check-in/out, guest ID, housekeeping, room service',
    color: 'indigo',
    features: ['Room Grid', 'Check-in/Out', 'Guest ID Upload', 'Housekeeping', 'Room Service', 'Booking Widget'],
  },
];

// ============================================================
// Template Data
// ============================================================

export const TEMPLATES: Template[] = [
  // Restaurant templates
  { id: 'rest-classic', name: 'Classic Diner', niche: 'restaurant', colorScheme: { primary: '#ea580c', secondary: '#fed7aa', accent: '#c2410c' }, layoutStyle: 'grid', description: 'Traditional diner layout with table grid view' },
  { id: 'rest-modern', name: 'Modern Bistro', niche: 'restaurant', colorScheme: { primary: '#1c1917', secondary: '#f5f5f4', accent: '#dc2626' }, layoutStyle: 'list', description: 'Sleek modern bistro with minimal design' },
  { id: 'rest-cafe', name: 'Cafe Style', niche: 'restaurant', colorScheme: { primary: '#92400e', secondary: '#fef3c7', accent: '#b45309' }, layoutStyle: 'card', description: 'Warm cafe theme with card-based layout' },

  // Clothing templates
  { id: 'cloth-boutique', name: 'Boutique', niche: 'clothing', colorScheme: { primary: '#be185d', secondary: '#fce7f3', accent: '#9d174d' }, layoutStyle: 'catalog', description: 'Fashion-forward boutique with catalog view' },
  { id: 'cloth-retail', name: 'Retail Store', niche: 'clothing', colorScheme: { primary: '#1e293b', secondary: '#f1f5f9', accent: '#3b82f6' }, layoutStyle: 'grid', description: 'Clean retail layout with size grid' },
  { id: 'cloth-ethnic', name: 'Ethnic Wear', niche: 'clothing', colorScheme: { primary: '#7c2d12', secondary: '#fef2f2', accent: '#b91c1c' }, layoutStyle: 'card', description: 'Rich ethnic wear theme with gold accents' },

  // Pharmacy templates
  { id: 'pharma-care', name: 'PharmaCare', niche: 'pharmacy', colorScheme: { primary: '#059669', secondary: '#d1fae5', accent: '#047857' }, layoutStyle: 'list', description: 'Clean medical store with search-first design' },
  { id: 'pharma-plus', name: 'MediPlus', niche: 'pharmacy', colorScheme: { primary: '#0d9488', secondary: '#ccfbf1', accent: '#0f766e' }, layoutStyle: 'grid', description: 'Professional pharmacy with batch tracking' },

  // Salon templates
  { id: 'salon-glam', name: 'Glam Studio', niche: 'salon', colorScheme: { primary: '#7c3aed', secondary: '#ede9fe', accent: '#6d28d9' }, layoutStyle: 'calendar', description: 'Calendar-first salon with appointment booking' },
  { id: 'salon-chic', name: 'Chic Parlour', niche: 'salon', colorScheme: { primary: '#db2777', secondary: '#fce7f3', accent: '#be185d' }, layoutStyle: 'card', description: 'Stylish parlour with service cards' },

  // Grocery templates
  { id: 'grocery-fresh', name: 'Fresh Mart', niche: 'grocery', colorScheme: { primary: '#16a34a', secondary: '#dcfce7', accent: '#15803d' }, layoutStyle: 'grid', description: 'Fresh grocery with quick billing mode' },
  { id: 'grocery-kirana', name: 'Kirana Store', niche: 'grocery', colorScheme: { primary: '#ca8a04', secondary: '#fef9c3', accent: '#a16207' }, layoutStyle: 'list', description: 'Traditional kirana with khata book' },

  // Electronics templates
  { id: 'elec-tech', name: 'TechHub', niche: 'electronics', colorScheme: { primary: '#0891b2', secondary: '#cffafe', accent: '#0e7490' }, layoutStyle: 'grid', description: 'Tech store with IMEI tracking' },
  { id: 'elec-mob', name: 'Mobile Zone', niche: 'electronics', colorScheme: { primary: '#1d4ed8', secondary: '#dbeafe', accent: '#1e40af' }, layoutStyle: 'list', description: 'Mobile shop with EMI calculator' },

  // Coaching templates
  { id: 'coach-learn', name: 'LearnHub', niche: 'coaching', colorScheme: { primary: '#2563eb', secondary: '#dbeafe', accent: '#1d4ed8' }, layoutStyle: 'table', description: 'Student management with fee tracking' },
  { id: 'coach-academy', name: 'Academy Pro', niche: 'coaching', colorScheme: { primary: '#4f46e5', secondary: '#e0e7ff', accent: '#4338ca' }, layoutStyle: 'card', description: 'Academy with attendance and marks' },

  // Clinic templates
  { id: 'clinic-care', name: 'MediCare', niche: 'clinic', colorScheme: { primary: '#dc2626', secondary: '#fef2f2', accent: '#b91c1c' }, layoutStyle: 'queue', description: 'Hospital with OPD queue management' },
  { id: 'clinic-dental', name: 'Dental Care', niche: 'clinic', colorScheme: { primary: '#0284c7', secondary: '#e0f2fe', accent: '#0369a1' }, layoutStyle: 'calendar', description: 'Clinic with appointment system' },

  // Garage templates
  { id: 'garage-auto', name: 'AutoPro', niche: 'garage', colorScheme: { primary: '#475569', secondary: '#f1f5f9', accent: '#334155' }, layoutStyle: 'card', description: 'Garage with job card management' },
  { id: 'garage-quick', name: 'QuickFix', niche: 'garage', colorScheme: { primary: '#78350f', secondary: '#fef3c7', accent: '#92400e' }, layoutStyle: 'list', description: 'Quick service with vehicle tracking' },

  // Bakery templates
  { id: 'bake-sweet', name: 'Sweet Spot', niche: 'bakery', colorScheme: { primary: '#d97706', secondary: '#fef3c7', accent: '#b45309' }, layoutStyle: 'card', description: 'Warm bakery with combo builder' },
  { id: 'bake-cafe', name: 'Cafe Bake', niche: 'bakery', colorScheme: { primary: '#78350f', secondary: '#fffbeb', accent: '#92400e' }, layoutStyle: 'grid', description: 'Cafe with time-based menu' },

  // Wholesale templates
  { id: 'whole-biz', name: 'BizWholesale', niche: 'wholesale', colorScheme: { primary: '#3f3f46', secondary: '#f4f4f5', accent: '#52525b' }, layoutStyle: 'table', description: 'B2B with party ledger and credit limits' },
  { id: 'whole-dist', name: 'DistribPro', niche: 'wholesale', colorScheme: { primary: '#1c1917', secondary: '#fafaf9', accent: '#44403c' }, layoutStyle: 'list', description: 'Distribution with e-way bills' },

  // Jewellery templates
  { id: 'jewel-gold', name: 'Gold Palace', niche: 'jewellery', colorScheme: { primary: '#b45309', secondary: '#fef3c7', accent: '#92400e' }, layoutStyle: 'card', description: 'Jewellery with live gold rates' },
  { id: 'jewel-diamond', name: 'Diamond House', niche: 'jewellery', colorScheme: { primary: '#1e1b4b', secondary: '#e0e7ff', accent: '#312e81' }, layoutStyle: 'catalog', description: 'Premium jewellery with hallmark tracking' },

  // Gym templates
  { id: 'gym-fit', name: 'FitZone', niche: 'gym', colorScheme: { primary: '#65a30d', secondary: '#ecfccb', accent: '#4d7c0f' }, layoutStyle: 'card', description: 'Gym with membership management' },
  { id: 'gym-power', name: 'PowerHouse', niche: 'gym', colorScheme: { primary: '#dc2626', secondary: '#fef2f2', accent: '#b91c1c' }, layoutStyle: 'table', description: 'Fitness center with QR attendance' },

  // Stationery templates
  { id: 'stat-book', name: 'BookWorld', niche: 'stationery', colorScheme: { primary: '#0d9488', secondary: '#ccfbf1', accent: '#0f766e' }, layoutStyle: 'grid', description: 'Book store with ISBN search' },
  { id: 'stat-supply', name: 'Supply Depot', niche: 'stationery', colorScheme: { primary: '#0284c7', secondary: '#e0f2fe', accent: '#0369a1' }, layoutStyle: 'list', description: 'Stationery with kit builder' },

  // Hotel templates
  { id: 'hotel-stay', name: 'StayEasy', niche: 'hotel', colorScheme: { primary: '#4f46e5', secondary: '#e0e7ff', accent: '#4338ca' }, layoutStyle: 'grid', description: 'Hotel with room grid management' },
  { id: 'hotel-lodge', name: 'Lodge Pro', niche: 'hotel', colorScheme: { primary: '#1c1917', secondary: '#fafaf9', accent: '#44403c' }, layoutStyle: 'list', description: 'Lodge with check-in/out tracking' },
];

// ============================================================
// Helper Functions
// ============================================================

/** Get niches by slug */
export function getNicheBySlug(slug: NicheSlug): Niche | undefined {
  return NICHES.find((n) => n.slug === slug);
}

/** Get templates for a given niche */
export function getTemplatesForNiche(niche: NicheSlug): Template[] {
  return TEMPLATES.filter((t) => t.niche === niche);
}

/** Get template by ID */
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
