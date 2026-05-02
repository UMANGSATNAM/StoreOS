import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/lib/db';

// ============================================================
// Niche-specific seed data configurations
// ============================================================

interface NicheSeedConfig {
  storeName: string;
  ownerName: string;
  niche: string;
  template: string;
  city: string;
  state: string;
  phone: string;
  address: string;
  email: string;
  gstNumber: string;
  taxRate: number;
  receiptHeader: string;
  receiptFooter: string;
  categories: { name: string; icon: string; color: string; sortOrder: number }[];
  products: { name: string; price: number; costPrice: number; sku: string; stock: number; lowStockAlert: number; unit: string; description: string; catIdx: number }[];
  staff: { name: string; phone: string; role: string; shiftStart: string; shiftEnd: string; salary: number; commission: number; isActive: boolean }[];
  nicheSpecificSeeds?: (storeId: string) => Promise<void>;
}

const NICHE_CONFIGS: Record<string, NicheSeedConfig> = {
  restaurant: {
    storeName: "Sharma's Kitchen",
    ownerName: 'Rajesh Sharma',
    niche: 'restaurant',
    template: 'rest-classic',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '9876543210',
    address: '123 Linking Road, Bandra West',
    email: 'info@sharmaskitchen.in',
    gstNumber: '27AABCU9603R1ZM',
    taxRate: 5.0,
    receiptHeader: "Sharma's Kitchen - Authentic Indian Cuisine",
    receiptFooter: 'Thank you for dining with us! Visit again.',
    categories: [
      { name: 'Starters', icon: '🥗', color: '#f97316', sortOrder: 1 },
      { name: 'Main Course', icon: '🍛', color: '#dc2626', sortOrder: 2 },
      { name: 'Breads', icon: '🫓', color: '#d97706', sortOrder: 3 },
      { name: 'Beverages', icon: '🥤', color: '#0891b2', sortOrder: 4 },
      { name: 'Desserts', icon: '🍨', color: '#e879f9', sortOrder: 5 },
    ],
    products: [
      { name: 'Paneer Tikka', price: 250, costPrice: 120, sku: 'STR-001', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Marinated cottage cheese grilled in tandoor', catIdx: 0 },
      { name: 'Chicken Tikka', price: 280, costPrice: 140, sku: 'STR-002', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Boneless chicken pieces grilled with spices', catIdx: 0 },
      { name: 'Veg Spring Roll', price: 180, costPrice: 80, sku: 'STR-003', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Crispy rolls stuffed with mixed vegetables', catIdx: 0 },
      { name: 'Fish Fry', price: 320, costPrice: 180, sku: 'STR-004', stock: 15, lowStockAlert: 5, unit: 'piece', description: 'Crispy fried fish with masala coating', catIdx: 0 },
      { name: 'Mushroom Manchurian', price: 220, costPrice: 100, sku: 'STR-005', stock: 3, lowStockAlert: 5, unit: 'piece', description: 'Mushroom balls in Indo-Chinese sauce', catIdx: 0 },
      { name: 'Butter Chicken', price: 320, costPrice: 160, sku: 'MC-001', stock: 60, lowStockAlert: 10, unit: 'piece', description: 'Tender chicken in rich tomato-cream sauce', catIdx: 1 },
      { name: 'Dal Makhani', price: 220, costPrice: 80, sku: 'MC-002', stock: 45, lowStockAlert: 8, unit: 'piece', description: 'Slow-cooked black lentils with cream', catIdx: 1 },
      { name: 'Palak Paneer', price: 240, costPrice: 100, sku: 'MC-003', stock: 35, lowStockAlert: 5, unit: 'piece', description: 'Cottage cheese in creamy spinach gravy', catIdx: 1 },
      { name: 'Chicken Biryani', price: 300, costPrice: 150, sku: 'MC-004', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Fragrant basmati rice with spiced chicken', catIdx: 1 },
      { name: 'Mutton Rogan Josh', price: 380, costPrice: 200, sku: 'MC-005', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Kashmiri-style mutton in aromatic gravy', catIdx: 1 },
      { name: 'Veg Kolhapuri', price: 200, costPrice: 80, sku: 'MC-006', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Mixed vegetables in spicy Kolhapuri masala', catIdx: 1 },
      { name: 'Prawn Masala', price: 350, costPrice: 200, sku: 'MC-007', stock: 2, lowStockAlert: 5, unit: 'piece', description: 'Fresh prawns in coastal masala gravy', catIdx: 1 },
      { name: 'Kadhai Paneer', price: 260, costPrice: 110, sku: 'MC-008', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Paneer cooked with bell peppers in kadhai', catIdx: 1 },
      { name: 'Egg Curry', price: 180, costPrice: 70, sku: 'MC-009', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Boiled eggs in onion-tomato gravy', catIdx: 1 },
      { name: 'Butter Naan', price: 50, costPrice: 15, sku: 'BRD-001', stock: 100, lowStockAlert: 20, unit: 'piece', description: 'Soft tandoor bread with butter', catIdx: 2 },
      { name: 'Garlic Naan', price: 60, costPrice: 18, sku: 'BRD-002', stock: 80, lowStockAlert: 15, unit: 'piece', description: 'Naan topped with garlic and coriander', catIdx: 2 },
      { name: 'Tandoori Roti', price: 30, costPrice: 8, sku: 'BRD-003', stock: 120, lowStockAlert: 25, unit: 'piece', description: 'Whole wheat bread baked in tandoor', catIdx: 2 },
      { name: 'Laccha Paratha', price: 50, costPrice: 14, sku: 'BRD-004', stock: 60, lowStockAlert: 10, unit: 'piece', description: 'Flaky layered whole wheat bread', catIdx: 2 },
      { name: 'Masala Chai', price: 40, costPrice: 10, sku: 'BVG-001', stock: 200, lowStockAlert: 30, unit: 'piece', description: 'Traditional spiced Indian tea', catIdx: 3 },
      { name: 'Mango Lassi', price: 80, costPrice: 30, sku: 'BVG-002', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Thick mango yogurt smoothie', catIdx: 3 },
      { name: 'Fresh Lime Soda', price: 60, costPrice: 15, sku: 'BVG-003', stock: 80, lowStockAlert: 15, unit: 'piece', description: 'Fresh lime with soda - sweet or salted', catIdx: 3 },
      { name: 'Cold Coffee', price: 90, costPrice: 35, sku: 'BVG-004', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Chilled coffee blended with ice cream', catIdx: 3 },
      { name: 'Gulab Jamun', price: 100, costPrice: 35, sku: 'DES-001', stock: 35, lowStockAlert: 8, unit: 'piece', description: 'Soft milk dumplings in rose sugar syrup', catIdx: 4 },
      { name: 'Rasmalai', price: 120, costPrice: 45, sku: 'DES-002', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Cottage cheese discs in saffron milk', catIdx: 4 },
      { name: 'Kulfi Falooda', price: 130, costPrice: 50, sku: 'DES-003', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Traditional Indian ice cream with falooda', catIdx: 4 },
    ],
    staff: [
      { name: 'Vikram Singh', phone: '9712345678', role: 'admin', shiftStart: '09:00', shiftEnd: '21:00', salary: 25000, commission: 0, isActive: true },
      { name: 'Neha Gupta', phone: '9723456789', role: 'cashier', shiftStart: '10:00', shiftEnd: '22:00', salary: 15000, commission: 0, isActive: true },
      { name: 'Rajesh Thakur', phone: '9734567890', role: 'manager', shiftStart: '09:00', shiftEnd: '21:00', salary: 20000, commission: 2, isActive: true },
      { name: 'Sunita Devi', phone: '9745678901', role: 'cashier', shiftStart: '14:00', shiftEnd: '23:00', salary: 14000, commission: 0, isActive: true },
      { name: 'Arun Mehta', phone: '9756789012', role: 'manager', shiftStart: '08:00', shiftEnd: '16:00', salary: 18000, commission: 1.5, isActive: false },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const tableDefinitions = [
        { number: 1, capacity: 2, status: 'available', section: 'indoor' },
        { number: 2, capacity: 4, status: 'occupied', section: 'indoor' },
        { number: 3, capacity: 4, status: 'available', section: 'indoor' },
        { number: 4, capacity: 6, status: 'occupied', section: 'indoor' },
        { number: 5, capacity: 2, status: 'available', section: 'outdoor' },
        { number: 6, capacity: 4, status: 'reserved', section: 'outdoor' },
        { number: 7, capacity: 8, status: 'available', section: 'VIP' },
        { number: 8, capacity: 6, status: 'occupied', section: 'VIP' },
      ];
      for (const t of tableDefinitions) {
        await db.table.create({
          data: { storeId, number: t.number, capacity: t.capacity, status: t.status, section: t.section },
        });
      }
    },
  },

  grocery: {
    storeName: 'Patel Fresh Mart',
    ownerName: 'Dinesh Patel',
    niche: 'grocery',
    template: 'grocery-fresh',
    city: 'Ahmedabad',
    state: 'Gujarat',
    phone: '9876543210',
    address: '45 CG Road, Navrangpura',
    email: 'info@patelfreshmart.in',
    gstNumber: '24AABCU9603R1ZM',
    taxRate: 0.0,
    receiptHeader: 'Patel Fresh Mart - Your Daily Needs',
    receiptFooter: 'Thank you for shopping! Visit again for fresh deals.',
    categories: [
      { name: 'Grains & Rice', icon: '🌾', color: '#d97706', sortOrder: 1 },
      { name: 'Pulses & Dal', icon: '🫘', color: '#92400e', sortOrder: 2 },
      { name: 'Oils & Ghee', icon: '🫒', color: '#eab308', sortOrder: 3 },
      { name: 'Spices & Masala', icon: '🌶️', color: '#dc2626', sortOrder: 4 },
      { name: 'Dairy', icon: '🥛', color: '#0891b2', sortOrder: 5 },
      { name: 'Snacks & Packaged', icon: '🍪', color: '#7c3aed', sortOrder: 6 },
    ],
    products: [
      // Grains & Rice (catIdx: 0)
      { name: 'Basmati Rice (1 kg)', price: 160, costPrice: 130, sku: 'GRN-001', stock: 200, lowStockAlert: 30, unit: 'kg', description: 'Premium long-grain basmati rice', catIdx: 0 },
      { name: 'Regular Rice (1 kg)', price: 60, costPrice: 45, sku: 'GRN-002', stock: 500, lowStockAlert: 50, unit: 'kg', description: 'Daily use medium-grain rice', catIdx: 0 },
      { name: 'Wheat Atta (5 kg)', price: 280, costPrice: 220, sku: 'GRN-003', stock: 150, lowStockAlert: 20, unit: 'pack', description: 'Whole wheat flour for rotis', catIdx: 0 },
      { name: 'Maida (1 kg)', price: 45, costPrice: 32, sku: 'GRN-004', stock: 100, lowStockAlert: 15, unit: 'kg', description: 'Refined wheat flour', catIdx: 0 },
      { name: 'Suji / Sooji (1 kg)', price: 50, costPrice: 38, sku: 'GRN-005', stock: 80, lowStockAlert: 10, unit: 'kg', description: 'Semolina for upma and halwa', catIdx: 0 },
      // Pulses & Dal (catIdx: 1)
      { name: 'Toor Dal (1 kg)', price: 140, costPrice: 110, sku: 'PUL-001', stock: 180, lowStockAlert: 25, unit: 'kg', description: 'Split pigeon pea lentil', catIdx: 1 },
      { name: 'Moong Dal (1 kg)', price: 120, costPrice: 95, sku: 'PUL-002', stock: 150, lowStockAlert: 20, unit: 'kg', description: 'Split green gram lentil', catIdx: 1 },
      { name: 'Chana Dal (1 kg)', price: 110, costPrice: 85, sku: 'PUL-003', stock: 120, lowStockAlert: 15, unit: 'kg', description: 'Split Bengal gram lentil', catIdx: 1 },
      { name: 'Urad Dal (1 kg)', price: 130, costPrice: 100, sku: 'PUL-004', stock: 100, lowStockAlert: 15, unit: 'kg', description: 'Split black gram lentil', catIdx: 1 },
      { name: 'Rajma (1 kg)', price: 180, costPrice: 140, sku: 'PUL-005', stock: 60, lowStockAlert: 10, unit: 'kg', description: 'Kidney beans for rajma curry', catIdx: 1 },
      // Oils & Ghee (catIdx: 2)
      { name: 'Mustard Oil (1 L)', price: 180, costPrice: 145, sku: 'OIL-001', stock: 100, lowStockAlert: 15, unit: 'liter', description: 'Cold-pressed mustard cooking oil', catIdx: 2 },
      { name: 'Sunflower Oil (1 L)', price: 160, costPrice: 130, sku: 'OIL-002', stock: 120, lowStockAlert: 20, unit: 'liter', description: 'Refined sunflower cooking oil', catIdx: 2 },
      { name: 'Groundnut Oil (1 L)', price: 200, costPrice: 165, sku: 'OIL-003', stock: 80, lowStockAlert: 10, unit: 'liter', description: 'Filtered groundnut cooking oil', catIdx: 2 },
      { name: 'Amul Ghee (500 ml)', price: 290, costPrice: 240, sku: 'OIL-004', stock: 50, lowStockAlert: 8, unit: 'pack', description: 'Pure cow ghee from Amul', catIdx: 2 },
      { name: 'Coconut Oil (1 L)', price: 220, costPrice: 175, sku: 'OIL-005', stock: 40, lowStockAlert: 8, unit: 'liter', description: 'Virgin coconut oil for cooking', catIdx: 2 },
      // Spices & Masala (catIdx: 3)
      { name: 'Red Chilli Powder (100g)', price: 40, costPrice: 25, sku: 'SPC-001', stock: 200, lowStockAlert: 30, unit: 'pack', description: 'Hot red chilli powder', catIdx: 3 },
      { name: 'Turmeric Powder (100g)', price: 35, costPrice: 20, sku: 'SPC-002', stock: 250, lowStockAlert: 30, unit: 'pack', description: 'Pure turmeric/haldi powder', catIdx: 3 },
      { name: 'Coriander Powder (100g)', price: 30, costPrice: 18, sku: 'SPC-003', stock: 180, lowStockAlert: 25, unit: 'pack', description: 'Roasted dhania powder', catIdx: 3 },
      { name: 'Garam Masala (100g)', price: 65, costPrice: 40, sku: 'SPC-004', stock: 100, lowStockAlert: 15, unit: 'pack', description: 'Aromatic spice blend', catIdx: 3 },
      { name: 'Cumin Seeds (100g)', price: 45, costPrice: 30, sku: 'SPC-005', stock: 150, lowStockAlert: 20, unit: 'pack', description: 'Whole jeera/cumin seeds', catIdx: 3 },
      // Dairy (catIdx: 4)
      { name: 'Amul Milk (1 L)', price: 65, costPrice: 52, sku: 'DRY-001', stock: 300, lowStockAlert: 50, unit: 'liter', description: 'Full-cream toned milk', catIdx: 4 },
      { name: 'Curd / Dahi (500g)', price: 50, costPrice: 38, sku: 'DRY-002', stock: 100, lowStockAlert: 15, unit: 'pack', description: 'Fresh set curd', catIdx: 4 },
      { name: 'Paneer (200g)', price: 90, costPrice: 70, sku: 'DRY-003', stock: 60, lowStockAlert: 10, unit: 'pack', description: 'Fresh cottage cheese block', catIdx: 4 },
      { name: 'Butter (100g)', price: 55, costPrice: 42, sku: 'DRY-004', stock: 80, lowStockAlert: 12, unit: 'pack', description: 'Salted butter', catIdx: 4 },
      // Snacks & Packaged (catIdx: 5)
      { name: 'Britannia Biscuit', price: 30, costPrice: 22, sku: 'SNK-001', stock: 200, lowStockAlert: 30, unit: 'pack', description: 'Marie gold biscuit pack', catIdx: 5 },
      { name: 'Maggi Noodles (Pack of 4)', price: 56, costPrice: 44, sku: 'SNK-002', stock: 150, lowStockAlert: 20, unit: 'pack', description: '2-minute noodles family pack', catIdx: 5 },
      { name: 'Lays Chips', price: 20, costPrice: 14, sku: 'SNK-003', stock: 250, lowStockAlert: 40, unit: 'pack', description: 'Potato chips - classic salted', catIdx: 5 },
      { name: 'Parle-G Biscuit', price: 10, costPrice: 7, sku: 'SNK-004', stock: 3, lowStockAlert: 20, unit: 'pack', description: 'Glucose biscuit small pack', catIdx: 5 },
      { name: 'Tea Powder (100g)', price: 55, costPrice: 40, sku: 'SNK-005', stock: 120, lowStockAlert: 15, unit: 'pack', description: 'Taj Mahal tea powder', catIdx: 5 },
    ],
    staff: [
      { name: 'Dinesh Patel', phone: '9712345678', role: 'admin', shiftStart: '07:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Meena Ben', phone: '9723456789', role: 'cashier', shiftStart: '08:00', shiftEnd: '14:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Ravi Kumar', phone: '9734567890', role: 'cashier', shiftStart: '14:00', shiftEnd: '21:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Sunil Shah', phone: '9745678901', role: 'manager', shiftStart: '08:00', shiftEnd: '20:00', salary: 18000, commission: 1, isActive: true },
    ],
  },

  salon: {
    storeName: 'Glamour Studio',
    ownerName: 'Pooja Kapoor',
    niche: 'salon',
    template: 'salon-glam',
    city: 'Delhi',
    state: 'Delhi',
    phone: '9876543210',
    address: '56 Hudson Lane, GTB Nagar',
    email: 'info@glamourstudio.in',
    gstNumber: '07AABCU9603R1ZM',
    taxRate: 18.0,
    receiptHeader: 'Glamour Studio - Hair & Beauty Salon',
    receiptFooter: 'Thank you for choosing Glamour! Book your next visit.',
    categories: [
      { name: 'Hair Services', icon: '💇', color: '#7c3aed', sortOrder: 1 },
      { name: 'Skin Care', icon: '✨', color: '#ec4899', sortOrder: 2 },
      { name: 'Nail Care', icon: '💅', color: '#f43f5e', sortOrder: 3 },
      { name: 'Bridal Packages', icon: '👰', color: '#d97706', sortOrder: 4 },
      { name: 'Men Services', icon: '🧔', color: '#0891b2', sortOrder: 5 },
    ],
    products: [
      // Hair Services (catIdx: 0)
      { name: 'Haircut - Women', price: 500, costPrice: 150, sku: 'HIR-001', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Professional women haircut with wash and blow-dry', catIdx: 0 },
      { name: 'Haircut - Men', price: 300, costPrice: 80, sku: 'HIR-002', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Trendy men haircut with styling', catIdx: 0 },
      { name: 'Hair Spa', price: 1200, costPrice: 400, sku: 'HIR-003', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Deep conditioning hair spa treatment', catIdx: 0 },
      { name: 'Hair Color - Global', price: 2500, costPrice: 800, sku: 'HIR-004', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Full head hair coloring with premium brand', catIdx: 0 },
      { name: 'Hair Color - Root Touch Up', price: 1500, costPrice: 500, sku: 'HIR-005', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Root touch-up hair color', catIdx: 0 },
      { name: 'Keratin Treatment', price: 4000, costPrice: 1500, sku: 'HIR-006', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Smoothing keratin treatment for frizz-free hair', catIdx: 0 },
      { name: 'Blow Dry', price: 400, costPrice: 100, sku: 'HIR-007', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Professional blow dry and styling', catIdx: 0 },
      // Skin Care (catIdx: 1)
      { name: 'Facial - Classic', price: 800, costPrice: 250, sku: 'SKN-001', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Deep cleansing facial with massage', catIdx: 1 },
      { name: 'Facial - Gold', price: 1500, costPrice: 500, sku: 'SKN-002', stock: 999, lowStockAlert: 1, unit: 'service', description: '24K gold facial for radiant glow', catIdx: 1 },
      { name: 'Facial - Diamond', price: 2000, costPrice: 700, sku: 'SKN-003', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Premium diamond facial treatment', catIdx: 1 },
      { name: 'Cleanup', price: 500, costPrice: 150, sku: 'SKN-004', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Face cleanup with bleach and mask', catIdx: 1 },
      { name: 'De-Tan Facial', price: 1000, costPrice: 350, sku: 'SKN-005', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Tan removal facial with fruit extracts', catIdx: 1 },
      // Nail Care (catIdx: 2)
      { name: 'Manicure', price: 400, costPrice: 120, sku: 'NAIL-001', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Classic manicure with nail paint', catIdx: 2 },
      { name: 'Pedicure', price: 500, costPrice: 150, sku: 'NAIL-002', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Relaxing pedicure with foot massage', catIdx: 2 },
      { name: 'Gel Nail Art', price: 800, costPrice: 300, sku: 'NAIL-003', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Creative gel nail art design', catIdx: 2 },
      { name: 'Nail Extension', price: 1500, costPrice: 600, sku: 'NAIL-004', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Acrylic nail extension with design', catIdx: 2 },
      // Bridal Packages (catIdx: 3)
      { name: 'Bridal Makeup - Basic', price: 8000, costPrice: 3000, sku: 'BRD-001', stock: 999, lowStockAlert: 1, unit: 'package', description: 'Essential bridal makeup package', catIdx: 3 },
      { name: 'Bridal Makeup - Premium', price: 15000, costPrice: 5000, sku: 'BRD-002', stock: 999, lowStockAlert: 1, unit: 'package', description: 'Premium bridal makeup with hairstyling', catIdx: 3 },
      { name: 'Bridal Mehendi', price: 5000, costPrice: 2000, sku: 'BRD-003', stock: 999, lowStockAlert: 1, unit: 'package', description: 'Full bridal mehendi for hands and feet', catIdx: 3 },
      { name: 'Pre-Bridal Package', price: 6000, costPrice: 2200, sku: 'BRD-004', stock: 999, lowStockAlert: 1, unit: 'package', description: '5-session pre-bridal skin prep package', catIdx: 3 },
      // Men Services (catIdx: 4)
      { name: 'Men Haircut + Beard Trim', price: 400, costPrice: 100, sku: 'MEN-001', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Men haircut with beard shaping', catIdx: 4 },
      { name: 'Men Facial', price: 700, costPrice: 200, sku: 'MEN-002', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Men charcoal facial for deep cleanse', catIdx: 4 },
      { name: 'Men Hair Color', price: 800, costPrice: 300, sku: 'MEN-003', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Natural-looking men hair color', catIdx: 4 },
      { name: 'Men Cleanup', price: 400, costPrice: 120, sku: 'MEN-004', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Face cleanup for men with bleach', catIdx: 4 },
    ],
    staff: [
      { name: 'Pooja Kapoor', phone: '9712345678', role: 'admin', shiftStart: '09:00', shiftEnd: '20:00', salary: 0, commission: 0, isActive: true },
      { name: 'Neha Sharma', phone: '9723456789', role: 'manager', shiftStart: '09:00', shiftEnd: '18:00', salary: 20000, commission: 5, isActive: true },
      { name: 'Ritu Verma', phone: '9734567890', role: 'staff', shiftStart: '10:00', shiftEnd: '19:00', salary: 15000, commission: 10, isActive: true },
      { name: 'Kavita Singh', phone: '9745678901', role: 'staff', shiftStart: '09:00', shiftEnd: '18:00', salary: 14000, commission: 10, isActive: true },
      { name: 'Rajesh Kumar', phone: '9756789012', role: 'staff', shiftStart: '10:00', shiftEnd: '20:00', salary: 12000, commission: 10, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      // Create sample appointments for salon
      const appointmentDefs = [
        { customerName: 'Anita Sharma', customerPhone: '9812345678', service: 'Haircut - Women', staffName: 'Ritu Verma', date: new Date(Date.now() + 2 * 60 * 60 * 1000), duration: 45, status: 'scheduled' },
        { customerName: 'Priya Mehta', customerPhone: '9823456789', service: 'Facial - Gold', staffName: 'Kavita Singh', date: new Date(Date.now() + 3 * 60 * 60 * 1000), duration: 60, status: 'scheduled' },
        { customerName: 'Rahul Gupta', customerPhone: '9834567890', service: 'Men Haircut + Beard Trim', staffName: 'Rajesh Kumar', date: new Date(Date.now() + 1 * 60 * 60 * 1000), duration: 30, status: 'scheduled' },
        { customerName: 'Sneha Reddy', customerPhone: '9845678901', service: 'Keratin Treatment', staffName: 'Neha Sharma', date: new Date(Date.now() + 4 * 60 * 60 * 1000), duration: 120, status: 'scheduled' },
      ];
      for (const a of appointmentDefs) {
        await db.appointment.create({
          data: {
            storeId,
            customerName: a.customerName,
            customerPhone: a.customerPhone,
            service: a.service,
            staffName: a.staffName,
            date: a.date,
            duration: a.duration,
            status: a.status,
          },
        });
      }
    },
  },
};

// ============================================================
// Seed API Handler
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Parse body for niche parameter
    const body = await request.json().catch(() => ({}));
    const selectedNiche = body.niche || 'restaurant';

    // Validate niche
    const config = NICHE_CONFIGS[selectedNiche];
    if (!config) {
      return NextResponse.json(
        { error: `Invalid niche. Supported: ${Object.keys(NICHE_CONFIGS).join(', ')}` },
        { status: 400 }
      );
    }

    // ─── Idempotent: Check if demo user exists and clean up ───
    const existingDemo = await db.user.findUnique({ where: { email: 'demo@storeos.in' } });
    if (existingDemo) {
      const demoStore = await db.store.findUnique({ where: { userId: existingDemo.id } });
      if (demoStore) {
        // Clean up niche-specific data
        await db.appointment.deleteMany({ where: { storeId: demoStore.id } });
        await db.vehicle.deleteMany({ where: { storeId: demoStore.id } });
        await db.room.deleteMany({ where: { storeId: demoStore.id } });
        await db.member.deleteMany({ where: { storeId: demoStore.id } });
        await db.student.deleteMany({ where: { storeId: demoStore.id } });
        // Clean up orders first (order items depend on orders)
        const orders = await db.order.findMany({ where: { storeId: demoStore.id } });
        for (const order of orders) {
          await db.orderItem.deleteMany({ where: { orderId: order.id } });
        }
        await db.order.deleteMany({ where: { storeId: demoStore.id } });
        await db.product.deleteMany({ where: { storeId: demoStore.id } });
        await db.category.deleteMany({ where: { storeId: demoStore.id } });
        await db.customer.deleteMany({ where: { storeId: demoStore.id } });
        await db.staff.deleteMany({ where: { storeId: demoStore.id } });
        await db.table.deleteMany({ where: { storeId: demoStore.id } });
        await db.supplier.deleteMany({ where: { storeId: demoStore.id } });
        await db.store.delete({ where: { id: demoStore.id } });
      }
      await db.subscription.deleteMany({ where: { userId: existingDemo.id } });
      await db.user.delete({ where: { id: existingDemo.id } });
    }

    // Clean up admin user too
    const existingAdmin = await db.user.findUnique({ where: { email: 'admin@storeos.in' } });
    if (existingAdmin) {
      await db.subscription.deleteMany({ where: { userId: existingAdmin.id } });
      const adminStore = await db.store.findUnique({ where: { userId: existingAdmin.id } });
      if (adminStore) {
        await db.orderItem.deleteMany({ where: { order: { storeId: adminStore.id } } });
        await db.order.deleteMany({ where: { storeId: adminStore.id } });
        await db.product.deleteMany({ where: { storeId: adminStore.id } });
        await db.category.deleteMany({ where: { storeId: adminStore.id } });
        await db.customer.deleteMany({ where: { storeId: adminStore.id } });
        await db.staff.deleteMany({ where: { storeId: adminStore.id } });
        await db.table.deleteMany({ where: { storeId: adminStore.id } });
        await db.supplier.deleteMany({ where: { storeId: adminStore.id } });
        await db.store.delete({ where: { id: adminStore.id } });
      }
      await db.user.delete({ where: { id: existingAdmin.id } });
    }

    // ─── 1. Create Demo User ───
    const demoPasswordHash = createHash('sha256').update('demo123').digest('hex');
    const demoUser = await db.user.create({
      data: {
        email: 'demo@storeos.in',
        password: demoPasswordHash,
        name: config.ownerName,
        phone: config.phone,
        role: 'user',
      },
    });

    // ─── 2. Create Subscription for Demo User ───
    const subscription = await db.subscription.create({
      data: {
        userId: demoUser.id,
        plan: 'basic',
        status: 'active',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // ─── 3. Create Store for Demo User ───
    const store = await db.store.create({
      data: {
        userId: demoUser.id,
        name: config.storeName,
        ownerName: config.ownerName,
        niche: config.niche,
        template: config.template,
        city: config.city,
        state: config.state,
        phone: config.phone,
        address: config.address,
        email: config.email,
        gstNumber: config.gstNumber,
        taxRate: config.taxRate,
        receiptHeader: config.receiptHeader,
        receiptFooter: config.receiptFooter,
        onboardingComplete: true,
      },
    });

    // ─── 4. Create Categories ───
    const categories: { id: string; name: string }[] = [];
    for (const cat of config.categories) {
      const category = await db.category.create({
        data: {
          storeId: store.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          sortOrder: cat.sortOrder,
        },
      });
      categories.push({ id: category.id, name: category.name });
    }

    // ─── 5. Create Products ───
    const products: { id: string; name: string; price: number }[] = [];
    for (const p of config.products) {
      const product = await db.product.create({
        data: {
          storeId: store.id,
          categoryId: categories[p.catIdx].id,
          name: p.name,
          description: p.description,
          sku: p.sku,
          price: p.price,
          costPrice: p.costPrice,
          stock: p.stock,
          lowStockAlert: p.lowStockAlert,
          unit: p.unit,
          isActive: true,
        },
      });
      products.push({ id: product.id, name: product.name, price: product.price });
    }

    // ─── 6. Create 10 Customers ───
    const customerDefinitions = [
      { name: 'Rahul Verma', phone: '9812345678', email: 'rahul.v@gmail.com', loyaltyPoints: 250, totalSpent: 12450, totalOrders: 18 },
      { name: 'Priya Patel', phone: '9823456789', email: 'priya.p@gmail.com', loyaltyPoints: 180, totalSpent: 8920, totalOrders: 12 },
      { name: 'Amit Kumar', phone: '9834567890', email: 'amit.k@gmail.com', loyaltyPoints: 420, totalSpent: 22300, totalOrders: 28 },
      { name: 'Sneha Reddy', phone: '9845678901', email: 'sneha.r@gmail.com', loyaltyPoints: 95, totalSpent: 5340, totalOrders: 7 },
      { name: 'Vikash Singh', phone: '9856789012', email: 'vikash.s@gmail.com', loyaltyPoints: 310, totalSpent: 15670, totalOrders: 22 },
      { name: 'Anita Deshmukh', phone: '9867890123', email: 'anita.d@gmail.com', loyaltyPoints: 60, totalSpent: 3250, totalOrders: 4 },
      { name: 'Suresh Iyer', phone: '9878901234', email: 'suresh.i@gmail.com', loyaltyPoints: 550, totalSpent: 28900, totalOrders: 35 },
      { name: 'Meera Joshi', phone: '9889012345', email: 'meera.j@gmail.com', loyaltyPoints: 140, totalSpent: 7680, totalOrders: 10 },
      { name: 'Arjun Nair', phone: '9890123456', email: 'arjun.n@gmail.com', loyaltyPoints: 200, totalSpent: 11200, totalOrders: 15 },
      { name: 'Kavita Sharma', phone: '9801234567', email: 'kavita.s@gmail.com', loyaltyPoints: 30, totalSpent: 1890, totalOrders: 3 },
    ];

    const customers: { id: string; name: string }[] = [];
    for (const c of customerDefinitions) {
      const customer = await db.customer.create({
        data: {
          storeId: store.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          loyaltyPoints: c.loyaltyPoints,
          totalSpent: c.totalSpent,
          totalOrders: c.totalOrders,
        },
      });
      customers.push({ id: customer.id, name: customer.name });
    }

    // ─── 7. Create Staff Members ───
    const staff: { id: string; name: string }[] = [];
    for (const s of config.staff) {
      const staffMember = await db.staff.create({
        data: {
          storeId: store.id,
          name: s.name,
          phone: s.phone,
          role: s.role,
          shiftStart: s.shiftStart,
          shiftEnd: s.shiftEnd,
          salary: s.salary,
          commission: s.commission,
          isActive: s.isActive,
        },
      });
      staff.push({ id: staffMember.id, name: staffMember.name });
    }

    // ─── 8. Create Niche-Specific Data ───
    if (config.nicheSpecificSeeds) {
      await config.nicheSpecificSeeds(store.id);
    }

    // ─── 9. Create Recent Orders ───
    const orderDefinitions = [
      {
        customerIdx: 0,
        orderNumber: 'ORD-001',
        type: config.niche === 'salon' ? 'in_store' : 'dine_in',
        paymentMethod: 'upi',
        staffIdx: 0,
        nicheData: config.niche === 'restaurant' ? JSON.stringify({ tableNumber: 2, section: 'indoor' }) : null,
        items: [
          { prodIdx: 0, name: config.products[0].name, quantity: 2, unitPrice: config.products[0].price },
          { prodIdx: 5, name: config.products[5].name, quantity: 1, unitPrice: config.products[5].price },
        ],
      },
      {
        customerIdx: 2,
        orderNumber: 'ORD-002',
        type: config.niche === 'salon' ? 'in_store' : config.niche === 'grocery' ? 'in_store' : 'dine_in',
        paymentMethod: 'card',
        staffIdx: 1,
        nicheData: config.niche === 'restaurant' ? JSON.stringify({ tableNumber: 4, section: 'indoor' }) : null,
        items: [
          { prodIdx: 1, name: config.products[1].name, quantity: 2, unitPrice: config.products[1].price },
          { prodIdx: 8, name: config.products[8].name, quantity: 2, unitPrice: config.products[8].price },
        ],
      },
      {
        customerIdx: 4,
        orderNumber: 'ORD-003',
        type: 'takeaway',
        paymentMethod: 'cash',
        staffIdx: 0,
        nicheData: null,
        items: [
          { prodIdx: 6, name: config.products[6].name, quantity: 1, unitPrice: config.products[6].price },
          { prodIdx: 7, name: config.products[7].name, quantity: 1, unitPrice: config.products[7].price },
        ],
      },
      {
        customerIdx: 6,
        orderNumber: 'ORD-004',
        type: config.niche === 'salon' ? 'in_store' : 'dine_in',
        paymentMethod: 'upi',
        staffIdx: Math.min(2, staff.length - 1),
        nicheData: config.niche === 'restaurant' ? JSON.stringify({ tableNumber: 8, section: 'VIP' }) : null,
        items: [
          { prodIdx: 9, name: config.products[9].name, quantity: 1, unitPrice: config.products[9].price },
          { prodIdx: 3, name: config.products[3].name, quantity: 2, unitPrice: config.products[3].price },
        ],
      },
      {
        customerIdx: 7,
        orderNumber: 'ORD-005',
        type: 'delivery',
        paymentMethod: 'cash',
        staffIdx: 0,
        nicheData: null,
        items: [
          { prodIdx: 10, name: config.products[10].name, quantity: 1, unitPrice: config.products[10].price },
          { prodIdx: 12, name: config.products[12].name, quantity: 1, unitPrice: config.products[12].price },
        ],
      },
    ];

    let orderCount = 0;
    for (const o of orderDefinitions) {
      const subtotal = o.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const taxRate = config.taxRate;
      const taxAmount = Math.round(subtotal * taxRate / 100 * 100) / 100;
      const totalAmount = subtotal + taxAmount;

      const order = await db.order.create({
        data: {
          storeId: store.id,
          customerId: customers[o.customerIdx].id,
          orderNumber: o.orderNumber,
          status: 'completed',
          type: o.type,
          subtotal,
          taxAmount,
          discountAmount: 0,
          totalAmount,
          paymentMethod: o.paymentMethod,
          paymentStatus: 'paid',
          nicheData: o.nicheData,
          staffId: staff[o.staffIdx]?.id,
          createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        },
      });

      for (const item of o.items) {
        const itemTotal = item.unitPrice * item.quantity;
        await db.orderItem.create({
          data: {
            orderId: order.id,
            productId: products[item.prodIdx]?.id || null,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: 0,
            total: itemTotal,
          },
        });
      }

      orderCount++;
    }

    // ─── 10. Create Admin User ───
    const adminPasswordHash = createHash('sha256').update('admin123').digest('hex');
    const adminUser = await db.user.create({
      data: {
        email: 'admin@storeos.in',
        password: adminPasswordHash,
        name: 'Super Admin',
        role: 'admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully with ${selectedNiche} niche`,
      niche: selectedNiche,
      counts: {
        users: 2,
        subscriptions: 1,
        stores: 1,
        categories: categories.length,
        products: products.length,
        customers: customers.length,
        staff: staff.length,
        orders: orderCount,
      },
      demoUser: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
      },
      demoStore: {
        id: store.id,
        name: store.name,
        niche: store.niche,
        template: store.template,
        taxRate: store.taxRate,
        ownerName: store.ownerName,
        city: store.city,
        state: store.state,
        phone: store.phone,
        address: store.address,
        gstNumber: store.gstNumber,
      },
      demoSubscription: {
        plan: subscription.plan,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt,
      },
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
