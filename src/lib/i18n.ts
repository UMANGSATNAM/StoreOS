// ============================================================
// StoreOS - Internationalization (i18n) System
// Supports: English (en), Hindi (hi)
// ============================================================

export type Language = 'en' | 'hi';

type TranslationKeys = {
  // Sidebar labels
  dashboard: string;
  billing: string;
  products: string;
  suppliers: string;
  customers: string;
  orders: string;
  tables: string;
  staff: string;
  reports: string;
  notifications: string;
  settings: string;
  appointments: string;
  rooms: string;
  members: string;
  students: string;
  vehicles: string;

  // Common labels
  search: string;
  add: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  close: string;
  viewAll: string;
  markAllRead: string;
  loading: string;
  noData: string;
  confirm: string;
  back: string;
  next: string;
  submit: string;
  reset: string;
  export: string;
  import: string;
  filter: string;
  sort: string;
  refresh: string;
  print: string;
  download: string;
  upload: string;
  actions: string;
  status: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  total: string;
  subtotal: string;
  quantity: string;
  price: string;
  discount: string;
  description: string;

  // Dashboard overview
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  todaySales: string;
  totalOrders: string;
  activeCustomers: string;
  revenue: string;
  ordersToday: string;
  productsLabel: string;
  customersLabel: string;

  // Billing
  currentBill: string;
  subtotalLabel: string;
  tax: string;
  totalLabel: string;
  pay: string;
  holdBill: string;
  clearCart: string;
  cash: string;
  upi: string;
  card: string;
  split: string;
  cartEmpty: string;
  addToCart: string;

  // Status labels
  completed: string;
  pending: string;
  cancelled: string;
  active: string;
  inactive: string;
  available: string;
  occupied: string;
  reserved: string;
  scheduled: string;
  paid: string;
  unpaid: string;
  refunded: string;

  // Settings labels
  language: string;
  languageEn: string;
  languageHi: string;
  languageDesc: string;
  languagePreview: string;
  storeProfile: string;
  taxConfig: string;
  receiptSetup: string;
  paymentMethods: string;
  branding: string;
  subscription: string;
  whatsapp: string;
  dataManagement: string;
  saveChanges: string;

  // Misc
  darkMode: string;
  lightMode: string;
  logOut: string;
  switchAccount: string;
  helpSupport: string;
  keyboardShortcuts: string;
};

const translations: Record<Language, TranslationKeys> = {
  en: {
    // Sidebar
    dashboard: 'Dashboard',
    billing: 'Billing / POS',
    products: 'Products',
    suppliers: 'Suppliers',
    customers: 'Customers',
    orders: 'Orders',
    tables: 'Tables',
    staff: 'Staff',
    reports: 'Reports',
    notifications: 'Notifications',
    settings: 'Settings',
    appointments: 'Appointments',
    rooms: 'Rooms',
    members: 'Members',
    students: 'Students',
    vehicles: 'Vehicles',

    // Common
    search: 'Search',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    viewAll: 'View All',
    markAllRead: 'Mark All Read',
    loading: 'Loading...',
    noData: 'No data available',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    reset: 'Reset',
    export: 'Export',
    import: 'Import',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    print: 'Print',
    download: 'Download',
    upload: 'Upload',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    total: 'Total',
    subtotal: 'Subtotal',
    quantity: 'Qty',
    price: 'Price',
    discount: 'Discount',
    description: 'Description',

    // Dashboard
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    todaySales: "Today's Sales",
    totalOrders: 'Total Orders',
    activeCustomers: 'Active Customers',
    revenue: 'Revenue',
    ordersToday: 'Orders Today',
    productsLabel: 'Products',
    customersLabel: 'Customers',

    // Billing
    currentBill: 'Current Bill',
    subtotalLabel: 'Subtotal',
    tax: 'Tax',
    totalLabel: 'Total',
    pay: 'Pay',
    holdBill: 'Hold Bill',
    clearCart: 'Clear Cart',
    cash: 'Cash',
    upi: 'UPI',
    card: 'Card',
    split: 'Split',
    cartEmpty: 'Your cart is empty',
    addToCart: 'Add to Cart',

    // Status
    completed: 'Completed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    active: 'Active',
    inactive: 'Inactive',
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    scheduled: 'Scheduled',
    paid: 'Paid',
    unpaid: 'Unpaid',
    refunded: 'Refunded',

    // Settings
    language: 'Language',
    languageEn: 'English',
    languageHi: 'Hindi',
    languageDesc: 'Choose your preferred language for the dashboard',
    languagePreview: 'Preview',
    storeProfile: 'Store Profile',
    taxConfig: 'Tax',
    receiptSetup: 'Receipt',
    paymentMethods: 'Payment',
    branding: 'Branding',
    subscription: 'Plan',
    whatsapp: 'WhatsApp',
    dataManagement: 'Data',
    saveChanges: 'Save Changes',

    // Misc
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    logOut: 'Log Out',
    switchAccount: 'Switch Account',
    helpSupport: 'Help & Support',
    keyboardShortcuts: 'Keyboard Shortcuts',
  },

  hi: {
    // Sidebar
    dashboard: 'डैशबोर्ड',
    billing: 'बिलिंग / POS',
    products: 'उत्पाद',
    suppliers: 'सप्लायर',
    customers: 'ग्राहक',
    orders: 'ऑर्डर',
    tables: 'टेबल',
    staff: 'स्टाफ',
    reports: 'रिपोर्ट',
    notifications: 'सूचनाएं',
    settings: 'सेटिंग्स',
    appointments: 'अपॉइंटमेंट',
    rooms: 'कमरे',
    members: 'सदस्य',
    students: 'छात्र',
    vehicles: 'वाहन',

    // Common
    search: 'खोजें',
    add: 'जोड़ें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    viewAll: 'सभी देखें',
    markAllRead: 'सभी पढ़े हुए चिह्नित करें',
    loading: 'लोड हो रहा है...',
    noData: 'कोई डेटा उपलब्ध नहीं',
    confirm: 'पुष्टि करें',
    back: 'वापस',
    next: 'अगला',
    submit: 'जमा करें',
    reset: 'रीसेट',
    export: 'निर्यात',
    import: 'आयात',
    filter: 'फ़िल्टर',
    sort: 'क्रमबद्ध',
    refresh: 'रीफ़्रेश',
    print: 'प्रिंट',
    download: 'डाउनलोड',
    upload: 'अपलोड',
    actions: 'कार्रवाई',
    status: 'स्थिति',
    date: 'तिथि',
    time: 'समय',
    name: 'नाम',
    phone: 'फ़ोन',
    email: 'ईमेल',
    address: 'पता',
    total: 'कुल',
    subtotal: 'उपकुल',
    quantity: 'मात्रा',
    price: 'कीमत',
    discount: 'छूट',
    description: 'विवरण',

    // Dashboard
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    todaySales: 'आज की बिक्री',
    totalOrders: 'कुल ऑर्डर',
    activeCustomers: 'सक्रिय ग्राहक',
    revenue: 'आय',
    ordersToday: 'आज के ऑर्डर',
    productsLabel: 'उत्पाद',
    customersLabel: 'ग्राहक',

    // Billing
    currentBill: 'वर्तमान बिल',
    subtotalLabel: 'उपकुल',
    tax: 'कर',
    totalLabel: 'कुल',
    pay: 'भुगतान करें',
    holdBill: 'बिल होल्ड करें',
    clearCart: 'कार्ट खाली करें',
    cash: 'नकद',
    upi: 'UPI',
    card: 'कार्ड',
    split: 'विभाजित',
    cartEmpty: 'आपका कार्ट खाली है',
    addToCart: 'कार्ट में जोड़ें',

    // Status
    completed: 'पूर्ण',
    pending: 'लंबित',
    cancelled: 'रद्द',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    available: 'उपलब्ध',
    occupied: 'अधिग्रहीत',
    reserved: 'आरक्षित',
    scheduled: 'निर्धारित',
    paid: 'भुगतान किया',
    unpaid: 'अवैतनिक',
    refunded: 'वापस किया',

    // Settings
    language: 'भाषा',
    languageEn: 'अंग्रेज़ी',
    languageHi: 'हिंदी',
    languageDesc: 'डैशबोर्ड के लिए अपनी पसंदीदा भाषा चुनें',
    languagePreview: 'पूर्वावलोकन',
    storeProfile: 'स्टोर प्रोफ़ाइल',
    taxConfig: 'कर',
    receiptSetup: 'रसीद',
    paymentMethods: 'भुगतान',
    branding: 'ब्रांडिंग',
    subscription: 'योजना',
    whatsapp: 'व्हाट्सएप',
    dataManagement: 'डेटा',
    saveChanges: 'परिवर्तन सहेजें',

    // Misc
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    logOut: 'लॉग आउट',
    switchAccount: 'खाता बदलें',
    helpSupport: 'सहायता और समर्थन',
    keyboardShortcuts: 'कीबोर्ड शॉर्टकट',
  },
};

// ============================================================
// Translation Function & Hook
// ============================================================

/**
 * Get a translated string by key and language.
 * Falls back to English if key not found in the selected language.
 */
export function t(key: keyof TranslationKeys, lang: Language = 'en'): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

/**
 * React hook that reads the current language from Zustand store
 * and provides the t() function bound to that language.
 *
 * Usage:
 *   const { t, language, setLanguage } = useTranslation();
 *   <span>{t('dashboard')}</span>
 */
export function useTranslation() {
  // We import useAppStore directly; store.ts only imports the Language
  // *type* from this module (erased at compile time), so there is no
  // runtime circular-dependency issue.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const storeMod = require('@/lib/store') as typeof import('@/lib/store');
  const language: Language = storeMod.useAppStore((s: { language: Language }) => s.language) || 'en';
  const setLanguage = storeMod.useAppStore((s: { setLanguage: (lang: Language) => void }) => s.setLanguage);

  return {
    language,
    setLanguage,
    t: (key: keyof TranslationKeys) => t(key, language),
  };
}

export type { TranslationKeys };
