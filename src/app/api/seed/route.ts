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

  clothing: {
    storeName: 'Style Bazaar',
    ownerName: 'Vikram Malhotra',
    niche: 'clothing',
    template: 'cloth-boutique',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '9876543210',
    address: '78 Fashion Street, Bandra West',
    email: 'info@stylebazaar.in',
    gstNumber: '27AABCU9603R1ZN',
    taxRate: 18.0,
    receiptHeader: 'Style Bazaar - Fashion for Everyone',
    receiptFooter: 'Thank you for shopping with us! Exchange within 7 days.',
    categories: [
      { name: "Men's Wear", icon: '👔', color: '#1e40af', sortOrder: 1 },
      { name: "Women's Wear", icon: '👗', color: '#be185d', sortOrder: 2 },
      { name: 'Kids', icon: '🧒', color: '#f97316', sortOrder: 3 },
      { name: 'Accessories', icon: '👜', color: '#7c3aed', sortOrder: 4 },
      { name: 'Footwear', icon: '👟', color: '#059669', sortOrder: 5 },
    ],
    products: [
      { name: 'Formal Shirt (Men)', price: 1200, costPrice: 600, sku: 'MN-001', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Premium cotton formal shirt', catIdx: 0 },
      { name: 'Casual Jeans (Men)', price: 1800, costPrice: 900, sku: 'MN-002', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Slim fit casual denim jeans', catIdx: 0 },
      { name: 'Polo T-Shirt (Men)', price: 800, costPrice: 350, sku: 'MN-003', stock: 60, lowStockAlert: 12, unit: 'piece', description: 'Cotton polo t-shirt', catIdx: 0 },
      { name: 'Kurta (Men)', price: 1500, costPrice: 700, sku: 'MN-004', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Embroidered cotton kurta', catIdx: 0 },
      { name: 'Blazer (Men)', price: 3500, costPrice: 1800, sku: 'MN-005', stock: 15, lowStockAlert: 3, unit: 'piece', description: 'Formal blazer - navy blue', catIdx: 0 },
      { name: 'Saree (Silk)', price: 5000, costPrice: 2500, sku: 'WN-001', stock: 20, lowStockAlert: 4, unit: 'piece', description: 'Banarasi silk saree with border', catIdx: 1 },
      { name: 'Kurti (Women)', price: 900, costPrice: 400, sku: 'WN-002', stock: 45, lowStockAlert: 8, unit: 'piece', description: 'Cotton printed kurti', catIdx: 1 },
      { name: 'Salwar Suit', price: 2200, costPrice: 1000, sku: 'WN-003', stock: 30, lowStockAlert: 6, unit: 'piece', description: 'Embroidered salwar kameez set', catIdx: 1 },
      { name: 'Dress (Western)', price: 1800, costPrice: 800, sku: 'WN-004', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'A-line western dress', catIdx: 1 },
      { name: 'Leggings (Women)', price: 400, costPrice: 180, sku: 'WN-005', stock: 80, lowStockAlert: 15, unit: 'piece', description: 'Cotton stretchable leggings', catIdx: 1 },
      { name: 'Kids Frocks', price: 600, costPrice: 250, sku: 'KD-001', stock: 35, lowStockAlert: 7, unit: 'piece', description: 'Cotton printed frocks for girls', catIdx: 2 },
      { name: 'Kids T-Shirt', price: 350, costPrice: 150, sku: 'KD-002', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Cartoon print t-shirt for boys', catIdx: 2 },
      { name: 'Kids Jeans', price: 700, costPrice: 300, sku: 'KD-003', stock: 30, lowStockAlert: 6, unit: 'piece', description: 'Denim jeans for kids', catIdx: 2 },
      { name: 'Handbag', price: 1200, costPrice: 500, sku: 'ACC-001', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Leather-look handbag', catIdx: 3 },
      { name: 'Dupatta', price: 500, costPrice: 200, sku: 'ACC-002', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Chiffon embroidered dupatta', catIdx: 3 },
      { name: 'Sunglasses', price: 800, costPrice: 300, sku: 'ACC-003', stock: 3, lowStockAlert: 5, unit: 'piece', description: 'UV protection sunglasses', catIdx: 3 },
      { name: 'Sports Shoes (Men)', price: 2200, costPrice: 1000, sku: 'FT-001', stock: 20, lowStockAlert: 4, unit: 'pair', description: 'Running shoes - lightweight', catIdx: 4 },
      { name: 'Heels (Women)', price: 1500, costPrice: 600, sku: 'FT-002', stock: 30, lowStockAlert: 6, unit: 'pair', description: 'Block heel sandals', catIdx: 4 },
      { name: 'Slippers', price: 400, costPrice: 150, sku: 'FT-003', stock: 60, lowStockAlert: 10, unit: 'pair', description: 'Comfort slippers', catIdx: 4 },
    ],
    staff: [
      { name: 'Vikram Malhotra', phone: '9712345678', role: 'admin', shiftStart: '10:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Priya Shah', phone: '9723456789', role: 'cashier', shiftStart: '10:00', shiftEnd: '18:00', salary: 14000, commission: 0, isActive: true },
      { name: 'Rahul Joshi', phone: '9734567890', role: 'manager', shiftStart: '10:00', shiftEnd: '21:00', salary: 20000, commission: 2, isActive: true },
      { name: 'Nisha Patel', phone: '9745678901', role: 'cashier', shiftStart: '14:00', shiftEnd: '21:00', salary: 13000, commission: 0, isActive: true },
    ],
  },

  medical: {
    storeName: 'HealthPlus Pharmacy',
    ownerName: 'Dr. Suresh Gupta',
    niche: 'medical',
    template: 'pharma-care',
    city: 'Delhi',
    state: 'Delhi',
    phone: '9876543210',
    address: '12 MG Road, Lajpat Nagar',
    email: 'info@healthpluspharma.in',
    gstNumber: '07AABCU9603R1ZP',
    taxRate: 0.0,
    receiptHeader: 'HealthPlus Pharmacy - Your Health Partner',
    receiptFooter: 'Thank you! Keep your bill for returns. Consult your doctor.',
    categories: [
      { name: 'Medicines', icon: '💊', color: '#dc2626', sortOrder: 1 },
      { name: 'OTC', icon: '🩹', color: '#f97316', sortOrder: 2 },
      { name: 'Supplements', icon: '💪', color: '#059669', sortOrder: 3 },
      { name: 'Personal Care', icon: '🧴', color: '#7c3aed', sortOrder: 4 },
      { name: 'Baby Care', icon: '🍼', color: '#0891b2', sortOrder: 5 },
    ],
    products: [
      { name: 'Paracetamol 500mg (10 tab)', price: 25, costPrice: 12, sku: 'MED-001', stock: 500, lowStockAlert: 50, unit: 'strip', description: 'Acetaminophen tablets for fever and pain', catIdx: 0 },
      { name: 'Crocin Advance (15 tab)', price: 30, costPrice: 18, sku: 'MED-002', stock: 300, lowStockAlert: 30, unit: 'strip', description: 'Crocin pain relief tablets', catIdx: 0 },
      { name: 'Azithromycin 500mg (3 tab)', price: 85, costPrice: 45, sku: 'MED-003', stock: 100, lowStockAlert: 15, unit: 'strip', description: 'Antibiotic for bacterial infections', catIdx: 0 },
      { name: 'Cetirizine 10mg (10 tab)', price: 20, costPrice: 8, sku: 'MED-004', stock: 400, lowStockAlert: 40, unit: 'strip', description: 'Antihistamine for allergies', catIdx: 0 },
      { name: 'Omeprazole 20mg (10 cap)', price: 35, costPrice: 15, sku: 'MED-005', stock: 200, lowStockAlert: 20, unit: 'strip', description: 'Proton pump inhibitor for acidity', catIdx: 0 },
      { name: 'ORS Sachets (5 pack)', price: 30, costPrice: 15, sku: 'OTC-001', stock: 200, lowStockAlert: 25, unit: 'pack', description: 'Oral rehydration salts', catIdx: 1 },
      { name: 'Dettol Antiseptic (120ml)', price: 85, costPrice: 50, sku: 'OTC-002', stock: 80, lowStockAlert: 10, unit: 'bottle', description: 'Antiseptic disinfectant liquid', catIdx: 1 },
      { name: 'Band-Aid (10 strip)', price: 30, costPrice: 15, sku: 'OTC-003', stock: 150, lowStockAlert: 20, unit: 'pack', description: 'Adhesive bandages', catIdx: 1 },
      { name: 'Cough Syrup (100ml)', price: 65, costPrice: 30, sku: 'OTC-004', stock: 60, lowStockAlert: 10, unit: 'bottle', description: 'Dry cough relief syrup', catIdx: 1 },
      { name: 'Vitamin D3 (60k IU)', price: 120, costPrice: 60, sku: 'SUP-001', stock: 100, lowStockAlert: 15, unit: 'strip', description: 'Weekly vitamin D3 supplement', catIdx: 2 },
      { name: 'Multivitamin (30 tab)', price: 250, costPrice: 130, sku: 'SUP-002', stock: 80, lowStockAlert: 10, unit: 'bottle', description: 'Daily multivitamin tablets', catIdx: 2 },
      { name: 'Calcium + Vitamin D (30 tab)', price: 180, costPrice: 90, sku: 'SUP-003', stock: 60, lowStockAlert: 8, unit: 'bottle', description: 'Bone health supplement', catIdx: 2 },
      { name: 'Protein Powder (500g)', price: 450, costPrice: 250, sku: 'SUP-004', stock: 30, lowStockAlert: 5, unit: 'pack', description: 'Whey protein supplement', catIdx: 2 },
      { name: 'Hand Sanitizer (200ml)', price: 80, costPrice: 35, sku: 'PC-001', stock: 100, lowStockAlert: 15, unit: 'bottle', description: 'Alcohol-based hand sanitizer', catIdx: 3 },
      { name: 'Face Wash (100ml)', price: 150, costPrice: 70, sku: 'PC-002', stock: 50, lowStockAlert: 8, unit: 'tube', description: 'Gentle face wash for daily use', catIdx: 3 },
      { name: 'Baby Lotion (200ml)', price: 180, costPrice: 95, sku: 'BC-001', stock: 40, lowStockAlert: 8, unit: 'bottle', description: 'Mild baby moisturizing lotion', catIdx: 4 },
      { name: 'Baby Diapers (Medium, 20 pack)', price: 350, costPrice: 200, sku: 'BC-002', stock: 2, lowStockAlert: 5, unit: 'pack', description: 'Disposable diapers for babies', catIdx: 4 },
    ],
    staff: [
      { name: 'Dr. Suresh Gupta', phone: '9712345678', role: 'admin', shiftStart: '09:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Ramesh Kumar', phone: '9723456789', role: 'cashier', shiftStart: '09:00', shiftEnd: '17:00', salary: 14000, commission: 0, isActive: true },
      { name: 'Anita Sharma', phone: '9734567890', role: 'staff', shiftStart: '09:00', shiftEnd: '17:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Sanjay Verma', phone: '9745678901', role: 'cashier', shiftStart: '17:00', shiftEnd: '22:00', salary: 14000, commission: 0, isActive: true },
    ],
  },

  electronics: {
    storeName: 'TechZone Mobiles',
    ownerName: 'Amit Patel',
    niche: 'electronics',
    template: 'elec-tech',
    city: 'Bangalore',
    state: 'Karnataka',
    phone: '9876543210',
    address: '45 Brigade Road, MG Road',
    email: 'info@techzonemobiles.in',
    gstNumber: '29AABCU9603R1ZQ',
    taxRate: 18.0,
    receiptHeader: 'TechZone Mobiles - Your Gadget Destination',
    receiptFooter: 'Thank you! Warranty applicable with this bill.',
    categories: [
      { name: 'Smartphones', icon: '📱', color: '#1e40af', sortOrder: 1 },
      { name: 'Accessories', icon: '🎧', color: '#7c3aed', sortOrder: 2 },
      { name: 'Chargers', icon: '🔌', color: '#f97316', sortOrder: 3 },
      { name: 'Cases', icon: '🛡️', color: '#059669', sortOrder: 4 },
      { name: 'Earphones', icon: '🎵', color: '#dc2626', sortOrder: 5 },
    ],
    products: [
      { name: 'iPhone 15 Cover', price: 800, costPrice: 250, sku: 'SM-001', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Premium silicone case for iPhone 15', catIdx: 0 },
      { name: 'Samsung Galaxy Cover', price: 500, costPrice: 180, sku: 'SM-002', stock: 60, lowStockAlert: 10, unit: 'piece', description: 'Transparent back cover for Samsung', catIdx: 0 },
      { name: 'Screen Guard (Tempered)', price: 200, costPrice: 50, sku: 'SM-003', stock: 200, lowStockAlert: 30, unit: 'piece', description: '9H tempered glass screen protector', catIdx: 0 },
      { name: 'Phone Stand', price: 350, costPrice: 120, sku: 'ACC-001', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Adjustable phone holder stand', catIdx: 1 },
      { name: 'USB OTG Cable', price: 150, costPrice: 50, sku: 'ACC-002', stock: 80, lowStockAlert: 15, unit: 'piece', description: 'USB OTG adapter cable', catIdx: 1 },
      { name: 'Power Bank 10000mAh', price: 800, costPrice: 400, sku: 'ACC-003', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Slim power bank with fast charging', catIdx: 1 },
      { name: 'Samsung 25W Charger', price: 600, costPrice: 300, sku: 'CHG-001', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Original Samsung fast charger', catIdx: 2 },
      { name: 'USB-C Cable (1m)', price: 200, costPrice: 80, sku: 'CHG-002', stock: 100, lowStockAlert: 20, unit: 'piece', description: 'Type-C fast charging cable', catIdx: 2 },
      { name: 'iPhone 20W Adapter', price: 1200, costPrice: 600, sku: 'CHG-003', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Apple 20W USB-C power adapter', catIdx: 2 },
      { name: 'iPhone Silicone Case', price: 600, costPrice: 200, sku: 'CASE-001', stock: 45, lowStockAlert: 8, unit: 'piece', description: 'Silicone protective case - assorted colors', catIdx: 3 },
      { name: 'Samsung Flip Cover', price: 700, costPrice: 250, sku: 'CASE-002', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'LED flip cover for Samsung Galaxy', catIdx: 3 },
      { name: 'Wireless Earbuds', price: 1500, costPrice: 600, sku: 'EAR-001', stock: 20, lowStockAlert: 4, unit: 'piece', description: 'TWS wireless earbuds with mic', catIdx: 4 },
      { name: 'Wired Earphones', price: 300, costPrice: 100, sku: 'EAR-002', stock: 100, lowStockAlert: 15, unit: 'piece', description: 'In-ear wired earphones with mic', catIdx: 4 },
      { name: 'Neckband Earphone', price: 800, costPrice: 300, sku: 'EAR-003', stock: 3, lowStockAlert: 5, unit: 'piece', description: 'Bluetooth neckband with bass', catIdx: 4 },
    ],
    staff: [
      { name: 'Amit Patel', phone: '9712345678', role: 'admin', shiftStart: '10:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Kiran Rao', phone: '9723456789', role: 'cashier', shiftStart: '10:00', shiftEnd: '18:00', salary: 15000, commission: 0, isActive: true },
      { name: 'Deepak Singh', phone: '9734567890', role: 'staff', shiftStart: '10:00', shiftEnd: '21:00', salary: 14000, commission: 3, isActive: true },
    ],
  },

  coaching: {
    storeName: 'Excel Academy',
    ownerName: 'Prof. Ramesh Iyer',
    niche: 'coaching',
    template: 'coach-learn',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '9876543210',
    address: '23 FC Road, Shivajinagar',
    email: 'info@excelacademy.in',
    gstNumber: '27AABCU9603R1ZR',
    taxRate: 18.0,
    receiptHeader: 'Excel Academy - Learn to Excel',
    receiptFooter: 'Thank you for choosing Excel Academy!',
    categories: [
      { name: 'Math', icon: '📐', color: '#1e40af', sortOrder: 1 },
      { name: 'Science', icon: '🔬', color: '#059669', sortOrder: 2 },
      { name: 'English', icon: '📝', color: '#7c3aed', sortOrder: 3 },
      { name: 'Computer', icon: '💻', color: '#0891b2', sortOrder: 4 },
      { name: 'Arts', icon: '🎨', color: '#dc2626', sortOrder: 5 },
    ],
    products: [
      { name: 'Math Monthly Fee (Class 10)', price: 2000, costPrice: 500, sku: 'MTH-001', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Monthly tuition fee for Class 10 Math', catIdx: 0 },
      { name: 'Math Monthly Fee (Class 12)', price: 3000, costPrice: 700, sku: 'MTH-002', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Monthly tuition fee for Class 12 Math', catIdx: 0 },
      { name: 'Math Test Series (10th)', price: 500, costPrice: 150, sku: 'MTH-003', stock: 999, lowStockAlert: 1, unit: 'package', description: 'Complete test series for board prep', catIdx: 0 },
      { name: 'Science Monthly Fee (Class 10)', price: 2000, costPrice: 500, sku: 'SCI-001', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Monthly tuition fee for Class 10 Science', catIdx: 1 },
      { name: 'Science Lab Practical', price: 1000, costPrice: 300, sku: 'SCI-002', stock: 999, lowStockAlert: 1, unit: 'package', description: 'Lab practical sessions for Class 12', catIdx: 1 },
      { name: 'Science Test Series', price: 500, costPrice: 150, sku: 'SCI-003', stock: 999, lowStockAlert: 1, unit: 'package', description: 'Test series for science subjects', catIdx: 1 },
      { name: 'English Grammar Course', price: 1500, costPrice: 400, sku: 'ENG-001', stock: 999, lowStockAlert: 1, unit: 'month', description: 'English grammar and writing course', catIdx: 2 },
      { name: 'Spoken English (3 months)', price: 5000, costPrice: 1500, sku: 'ENG-002', stock: 999, lowStockAlert: 1, unit: 'package', description: 'Spoken English 3-month course', catIdx: 2 },
      { name: 'Computer Basics Course', price: 3000, costPrice: 800, sku: 'CMP-001', stock: 999, lowStockAlert: 1, unit: 'package', description: 'Basic computer course (MS Office, Internet)', catIdx: 3 },
      { name: 'Programming (Python)', price: 4000, costPrice: 1200, sku: 'CMP-002', stock: 999, lowStockAlert: 1, unit: 'package', description: 'Python programming for beginners', catIdx: 3 },
      { name: 'Drawing Class Monthly', price: 1000, costPrice: 300, sku: 'ART-001', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Monthly drawing and sketching class', catIdx: 4 },
      { name: 'Study Material (Combo)', price: 800, costPrice: 250, sku: 'GEN-001', stock: 50, lowStockAlert: 10, unit: 'pack', description: 'Combined study material for all subjects', catIdx: 0 },
    ],
    staff: [
      { name: 'Prof. Ramesh Iyer', phone: '9712345678', role: 'admin', shiftStart: '08:00', shiftEnd: '18:00', salary: 0, commission: 0, isActive: true },
      { name: 'Sneha Deshmukh', phone: '9723456789', role: 'staff', shiftStart: '08:00', shiftEnd: '14:00', salary: 18000, commission: 5, isActive: true },
      { name: 'Rajesh Kulkarni', phone: '9734567890', role: 'staff', shiftStart: '14:00', shiftEnd: '20:00', salary: 18000, commission: 5, isActive: true },
      { name: 'Megha Patil', phone: '9745678901', role: 'cashier', shiftStart: '09:00', shiftEnd: '17:00', salary: 12000, commission: 0, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const studentDefs = [
        { name: 'Arjun Sharma', phone: '9812345678', email: 'arjun.s@gmail.com', course: 'Math', batch: 'Morning', status: 'active', feeTotal: 5000, feePaid: 5000 },
        { name: 'Priya Desai', phone: '9823456789', email: 'priya.d@gmail.com', course: 'Science', batch: 'Afternoon', status: 'active', feeTotal: 5000, feePaid: 5000 },
        { name: 'Rohan Kulkarni', phone: '9834567890', email: 'rohan.k@gmail.com', course: 'English', batch: 'Morning', status: 'active', feeTotal: 4000, feePaid: 2000 },
        { name: 'Ananya Joshi', phone: '9845678901', email: 'ananya.j@gmail.com', course: 'Computer', batch: 'Evening', status: 'active', feeTotal: 6000, feePaid: 6000 },
      ];
      for (const s of studentDefs) {
        await db.student.create({
          data: { storeId, name: s.name, phone: s.phone, email: s.email, course: s.course, batch: s.batch, status: s.status, feeTotal: s.feeTotal, feePaid: s.feePaid },
        });
      }
    },
  },

  clinic: {
    storeName: 'Sharma Clinic',
    ownerName: 'Dr. Anil Sharma',
    niche: 'clinic',
    template: 'clinic-care',
    city: 'Jaipur',
    state: 'Rajasthan',
    phone: '9876543210',
    address: '56 MI Road, Civil Lines',
    email: 'info@sharmaclinic.in',
    gstNumber: '08AABCU9603R1ZS',
    taxRate: 0.0,
    receiptHeader: 'Sharma Clinic - Your Family Doctor',
    receiptFooter: 'Thank you! Follow prescription carefully.',
    categories: [
      { name: 'Consultation', icon: '🩺', color: '#dc2626', sortOrder: 1 },
      { name: 'Lab Tests', icon: '🔬', color: '#0891b2', sortOrder: 2 },
      { name: 'Medicines', icon: '💊', color: '#059669', sortOrder: 3 },
      { name: 'Procedures', icon: '🏥', color: '#7c3aed', sortOrder: 4 },
      { name: 'Dental', icon: '🦷', color: '#f97316', sortOrder: 5 },
    ],
    products: [
      { name: 'OPD Consultation', price: 500, costPrice: 0, sku: 'CON-001', stock: 999, lowStockAlert: 1, unit: 'visit', description: 'General OPD consultation fee', catIdx: 0 },
      { name: 'Follow-up Visit', price: 300, costPrice: 0, sku: 'CON-002', stock: 999, lowStockAlert: 1, unit: 'visit', description: 'Follow-up consultation (within 7 days)', catIdx: 0 },
      { name: 'Specialist Referral', price: 800, costPrice: 0, sku: 'CON-003', stock: 999, lowStockAlert: 1, unit: 'visit', description: 'Specialist doctor referral', catIdx: 0 },
      { name: 'Blood Test (CBC)', price: 350, costPrice: 150, sku: 'LAB-001', stock: 999, lowStockAlert: 1, unit: 'test', description: 'Complete blood count', catIdx: 1 },
      { name: 'X-Ray', price: 500, costPrice: 200, sku: 'LAB-002', stock: 999, lowStockAlert: 1, unit: 'test', description: 'Digital X-ray imaging', catIdx: 1 },
      { name: 'Urine Test', price: 150, costPrice: 60, sku: 'LAB-003', stock: 999, lowStockAlert: 1, unit: 'test', description: 'Routine urine analysis', catIdx: 1 },
      { name: 'Thyroid Profile', price: 600, costPrice: 280, sku: 'LAB-004', stock: 999, lowStockAlert: 1, unit: 'test', description: 'T3, T4, TSH thyroid panel', catIdx: 1 },
      { name: 'Paracetamol 500mg', price: 25, costPrice: 12, sku: 'MED-001', stock: 500, lowStockAlert: 50, unit: 'strip', description: 'Fever and pain relief', catIdx: 2 },
      { name: 'Antacid Syrup', price: 60, costPrice: 25, sku: 'MED-002', stock: 100, lowStockAlert: 15, unit: 'bottle', description: 'Acidity relief syrup', catIdx: 2 },
      { name: 'Wound Dressing', price: 200, costPrice: 80, sku: 'PROC-001', stock: 999, lowStockAlert: 1, unit: 'procedure', description: 'Minor wound dressing', catIdx: 3 },
      { name: 'ECG', price: 400, costPrice: 150, sku: 'PROC-002', stock: 999, lowStockAlert: 1, unit: 'procedure', description: 'Electrocardiogram test', catIdx: 3 },
      { name: 'Dental Cleaning', price: 800, costPrice: 200, sku: 'DENT-001', stock: 999, lowStockAlert: 1, unit: 'procedure', description: 'Professional teeth cleaning', catIdx: 4 },
      { name: 'Tooth Filling', price: 1200, costPrice: 400, sku: 'DENT-002', stock: 999, lowStockAlert: 1, unit: 'procedure', description: 'Cavity filling', catIdx: 4 },
      { name: 'Root Canal', price: 5000, costPrice: 2000, sku: 'DENT-003', stock: 999, lowStockAlert: 1, unit: 'procedure', description: 'Root canal treatment', catIdx: 4 },
    ],
    staff: [
      { name: 'Dr. Anil Sharma', phone: '9712345678', role: 'admin', shiftStart: '09:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Dr. Priya Sharma', phone: '9723456789', role: 'staff', shiftStart: '09:00', shiftEnd: '17:00', salary: 40000, commission: 0, isActive: true },
      { name: 'Rakesh Meena', phone: '9734567890', role: 'staff', shiftStart: '09:00', shiftEnd: '17:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Sunita Devi', phone: '9745678901', role: 'cashier', shiftStart: '09:00', shiftEnd: '21:00', salary: 13000, commission: 0, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const apptDefs = [
        { customerName: 'Rajesh Kumar', customerPhone: '9812345678', service: 'OPD Consultation', staffName: 'Dr. Anil Sharma', date: new Date(Date.now() + 1 * 60 * 60 * 1000), duration: 15, status: 'scheduled' },
        { customerName: 'Sunita Devi', customerPhone: '9823456789', service: 'Dental Cleaning', staffName: 'Dr. Priya Sharma', date: new Date(Date.now() + 2 * 60 * 60 * 1000), duration: 30, status: 'scheduled' },
        { customerName: 'Mohan Lal', customerPhone: '9834567890', service: 'Blood Test (CBC)', staffName: 'Rakesh Meena', date: new Date(Date.now() + 30 * 60 * 1000), duration: 15, status: 'scheduled' },
      ];
      for (const a of apptDefs) {
        await db.appointment.create({
          data: { storeId, customerName: a.customerName, customerPhone: a.customerPhone, service: a.service, staffName: a.staffName, date: a.date, duration: a.duration, status: a.status },
        });
      }
    },
  },

  garage: {
    storeName: 'Singh Auto Works',
    ownerName: 'Harpreet Singh',
    niche: 'garage',
    template: 'garage-auto',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    phone: '9876543210',
    address: '89 Kanpur Road, Aliganj',
    email: 'info@singhautoworks.in',
    gstNumber: '09AABCU9603R1ZT',
    taxRate: 18.0,
    receiptHeader: 'Singh Auto Works - Complete Car Care',
    receiptFooter: 'Thank you! Drive safe!',
    categories: [
      { name: 'Service', icon: '🔧', color: '#475569', sortOrder: 1 },
      { name: 'Parts', icon: '⚙️', color: '#dc2626', sortOrder: 2 },
      { name: 'Oil', icon: '🛢️', color: '#d97706', sortOrder: 3 },
      { name: 'Tyres', icon: '🛞', color: '#1e40af', sortOrder: 4 },
      { name: 'Accessories', icon: '✨', color: '#7c3aed', sortOrder: 5 },
    ],
    products: [
      { name: 'Oil Change Service', price: 1500, costPrice: 600, sku: 'SVC-001', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Engine oil change with filter', catIdx: 0 },
      { name: 'Brake Service', price: 2000, costPrice: 800, sku: 'SVC-002', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Brake pad inspection and service', catIdx: 0 },
      { name: 'Full Car Wash', price: 500, costPrice: 150, sku: 'SVC-003', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Exterior + interior car wash', catIdx: 0 },
      { name: 'AC Service', price: 1200, costPrice: 400, sku: 'SVC-004', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Car AC gas refill and service', catIdx: 0 },
      { name: 'Brake Pads (Front)', price: 1200, costPrice: 600, sku: 'PRT-001', stock: 20, lowStockAlert: 5, unit: 'set', description: 'Front brake pads - Maruti/Hyundai', catIdx: 1 },
      { name: 'Air Filter', price: 350, costPrice: 150, sku: 'PRT-002', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Engine air filter', catIdx: 1 },
      { name: 'Cabin Filter', price: 400, costPrice: 180, sku: 'PRT-003', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'AC cabin air filter', catIdx: 1 },
      { name: 'Wiper Blades (Pair)', price: 500, costPrice: 200, sku: 'PRT-004', stock: 15, lowStockAlert: 3, unit: 'pair', description: 'Front wiper blade set', catIdx: 1 },
      { name: 'Engine Oil 5W-30 (4L)', price: 1800, costPrice: 1100, sku: 'OIL-001', stock: 20, lowStockAlert: 5, unit: 'can', description: 'Synthetic engine oil', catIdx: 2 },
      { name: 'Brake Fluid (500ml)', price: 250, costPrice: 120, sku: 'OIL-002', stock: 15, lowStockAlert: 3, unit: 'bottle', description: 'DOT3 brake fluid', catIdx: 2 },
      { name: 'Coolant (1L)', price: 300, costPrice: 140, sku: 'OIL-003', stock: 12, lowStockAlert: 3, unit: 'bottle', description: 'Engine coolant/antifreeze', catIdx: 2 },
      { name: 'Tyre (165/80 R14)', price: 3500, costPrice: 2200, sku: 'TYR-001', stock: 16, lowStockAlert: 4, unit: 'piece', description: 'Tubeless tyre for hatchback', catIdx: 3 },
      { name: 'Alloy Wheel (14 inch)', price: 4500, costPrice: 2800, sku: 'TYR-002', stock: 8, lowStockAlert: 2, unit: 'piece', description: '14-inch alloy wheel', catIdx: 3 },
      { name: 'Car Phone Mount', price: 350, costPrice: 120, sku: 'ACC-001', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Dashboard phone holder', catIdx: 4 },
      { name: 'Car Perfume', price: 300, costPrice: 100, sku: 'ACC-002', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Car air freshener', catIdx: 4 },
      { name: 'Seat Cover Set', price: 2500, costPrice: 1000, sku: 'ACC-003', stock: 2, lowStockAlert: 3, unit: 'set', description: 'Universal seat covers', catIdx: 4 },
    ],
    staff: [
      { name: 'Harpreet Singh', phone: '9712345678', role: 'admin', shiftStart: '08:00', shiftEnd: '20:00', salary: 0, commission: 0, isActive: true },
      { name: 'Mukesh Yadav', phone: '9723456789', role: 'staff', shiftStart: '08:00', shiftEnd: '18:00', salary: 15000, commission: 5, isActive: true },
      { name: 'Raju Verma', phone: '9734567890', role: 'staff', shiftStart: '08:00', shiftEnd: '18:00', salary: 14000, commission: 5, isActive: true },
      { name: 'Gurpreet Singh', phone: '9745678901', role: 'cashier', shiftStart: '09:00', shiftEnd: '20:00', salary: 12000, commission: 0, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const vehicleDefs = [
        { ownerName: 'Rahul Verma', ownerPhone: '9812345678', make: 'Maruti', model: 'Swift', registrationNumber: 'UP32 AB 1234', year: 2022 },
        { ownerName: 'Priya Patel', ownerPhone: '9823456789', make: 'Hyundai', model: 'Creta', registrationNumber: 'UP32 CD 5678', year: 2023 },
        { ownerName: 'Amit Kumar', ownerPhone: '9834567890', make: 'Honda', model: 'City', registrationNumber: 'UP32 EF 9012', year: 2021 },
      ];
      for (const v of vehicleDefs) {
        await db.vehicle.create({
          data: { storeId, ownerName: v.ownerName, ownerPhone: v.ownerPhone, make: v.make, model: v.model, registrationNumber: v.registrationNumber, year: v.year },
        });
      }
    },
  },

  bakery: {
    storeName: 'Sweet Moments Bakery',
    ownerName: 'Rahul Khanna',
    niche: 'bakery',
    template: 'bake-sweet',
    city: 'Chandigarh',
    state: 'Punjab',
    phone: '9876543210',
    address: 'Sector 17, Main Market',
    email: 'info@sweetmoments.in',
    gstNumber: '04AABCU9603R1ZU',
    taxRate: 5.0,
    receiptHeader: 'Sweet Moments Bakery - Fresh & Delicious',
    receiptFooter: 'Thank you! Fresh baked daily 🧁',
    categories: [
      { name: 'Cakes', icon: '🎂', color: '#dc2626', sortOrder: 1 },
      { name: 'Pastries', icon: '🥐', color: '#f97316', sortOrder: 2 },
      { name: 'Breads', icon: '🍞', color: '#d97706', sortOrder: 3 },
      { name: 'Cookies', icon: '🍪', color: '#059669', sortOrder: 4 },
      { name: 'Beverages', icon: '☕', color: '#7c3aed', sortOrder: 5 },
    ],
    products: [
      { name: 'Chocolate Cake (1 kg)', price: 600, costPrice: 250, sku: 'CKE-001', stock: 10, lowStockAlert: 2, unit: 'piece', description: 'Rich chocolate cake with ganache', catIdx: 0 },
      { name: 'Vanilla Cake (1 kg)', price: 500, costPrice: 200, sku: 'CKE-002', stock: 8, lowStockAlert: 2, unit: 'piece', description: 'Classic vanilla sponge cake', catIdx: 0 },
      { name: 'Red Velvet Cake (1 kg)', price: 700, costPrice: 300, sku: 'CKE-003', stock: 5, lowStockAlert: 2, unit: 'piece', description: 'Red velvet with cream cheese frosting', catIdx: 0 },
      { name: 'Black Forest (1 kg)', price: 650, costPrice: 280, sku: 'CKE-004', stock: 6, lowStockAlert: 2, unit: 'piece', description: 'Classic black forest cake', catIdx: 0 },
      { name: 'Butterscotch Cake (1 kg)', price: 550, costPrice: 230, sku: 'CKE-005', stock: 4, lowStockAlert: 2, unit: 'piece', description: 'Butterscotch crunch cake', catIdx: 0 },
      { name: 'Croissant', price: 60, costPrice: 20, sku: 'PST-001', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Buttery flaky croissant', catIdx: 1 },
      { name: 'Puff (Veg)', price: 40, costPrice: 15, sku: 'PST-002', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Vegetable puff pastry', catIdx: 1 },
      { name: 'Danish Pastry', price: 80, costPrice: 30, sku: 'PST-003', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Sweet Danish pastry', catIdx: 1 },
      { name: 'Eclair', price: 50, costPrice: 18, sku: 'PST-004', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Chocolate eclair with cream', catIdx: 1 },
      { name: 'Bread (White, 400g)', price: 40, costPrice: 18, sku: 'BRD-001', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Soft white bread loaf', catIdx: 2 },
      { name: 'Brown Bread (400g)', price: 50, costPrice: 22, sku: 'BRD-002', stock: 35, lowStockAlert: 8, unit: 'piece', description: 'Whole wheat brown bread', catIdx: 2 },
      { name: 'Bun (Pack of 6)', price: 45, costPrice: 18, sku: 'BRD-003', stock: 25, lowStockAlert: 5, unit: 'pack', description: 'Soft burger buns', catIdx: 2 },
      { name: 'Chocolate Cookie (6 pack)', price: 80, costPrice: 30, sku: 'CKE-006', stock: 30, lowStockAlert: 5, unit: 'pack', description: 'Chocolate chip cookies', catIdx: 3 },
      { name: 'Butter Cookies (200g)', price: 100, costPrice: 40, sku: 'CKE-007', stock: 25, lowStockAlert: 5, unit: 'pack', description: 'Premium butter cookies', catIdx: 3 },
      { name: 'Cappuccino', price: 120, costPrice: 40, sku: 'BVG-001', stock: 999, lowStockAlert: 1, unit: 'cup', description: 'Hot cappuccino coffee', catIdx: 4 },
      { name: 'Cold Coffee', price: 140, costPrice: 50, sku: 'BVG-002', stock: 999, lowStockAlert: 1, unit: 'glass', description: 'Iced coffee with ice cream', catIdx: 4 },
      { name: 'Masala Chai', price: 40, costPrice: 10, sku: 'BVG-003', stock: 999, lowStockAlert: 1, unit: 'cup', description: 'Indian spiced tea', catIdx: 4 },
    ],
    staff: [
      { name: 'Rahul Khanna', phone: '9712345678', role: 'admin', shiftStart: '06:00', shiftEnd: '20:00', salary: 0, commission: 0, isActive: true },
      { name: 'Sunita Kumari', phone: '9723456789', role: 'cashier', shiftStart: '08:00', shiftEnd: '16:00', salary: 13000, commission: 0, isActive: true },
      { name: 'Rajinder Singh', phone: '9734567890', role: 'staff', shiftStart: '06:00', shiftEnd: '14:00', salary: 12000, commission: 2, isActive: true },
      { name: 'Meena Devi', phone: '9745678901', role: 'staff', shiftStart: '14:00', shiftEnd: '20:00', salary: 12000, commission: 2, isActive: true },
    ],
  },

  wholesale: {
    storeName: 'Patel Distributors',
    ownerName: 'Mahesh Patel',
    niche: 'wholesale',
    template: 'whole-biz',
    city: 'Ahmedabad',
    state: 'Gujarat',
    phone: '9876543210',
    address: '12 APMC Market, Naroda',
    email: 'info@pateldistributors.in',
    gstNumber: '24AABCU9603R1ZV',
    taxRate: 18.0,
    receiptHeader: 'Patel Distributors - Wholesale Deals',
    receiptFooter: 'Thank you for your business! Terms: 30 days credit.',
    categories: [
      { name: 'Grains', icon: '🌾', color: '#d97706', sortOrder: 1 },
      { name: 'Spices', icon: '🌶️', color: '#dc2626', sortOrder: 2 },
      { name: 'Oils', icon: '🫒', color: '#eab308', sortOrder: 3 },
      { name: 'Packaging', icon: '📦', color: '#475569', sortOrder: 4 },
      { name: 'Household', icon: '🏠', color: '#059669', sortOrder: 5 },
    ],
    products: [
      { name: 'Rice (50 kg bag)', price: 3000, costPrice: 2400, sku: 'GRN-001', stock: 100, lowStockAlert: 10, unit: 'bag', description: 'Basmati rice 50kg wholesale bag', catIdx: 0 },
      { name: 'Atta (25 kg bag)', price: 1100, costPrice: 850, sku: 'GRN-002', stock: 150, lowStockAlert: 15, unit: 'bag', description: 'Whole wheat atta 25kg', catIdx: 0 },
      { name: 'Toor Dal (50 kg)', price: 5500, costPrice: 4200, sku: 'GRN-003', stock: 60, lowStockAlert: 8, unit: 'bag', description: 'Toor dal 50kg wholesale', catIdx: 0 },
      { name: 'Sugar (50 kg)', price: 2500, costPrice: 2000, sku: 'GRN-004', stock: 80, lowStockAlert: 10, unit: 'bag', description: 'White sugar 50kg bag', catIdx: 0 },
      { name: 'Red Chilli Powder (5 kg)', price: 800, costPrice: 550, sku: 'SPC-001', stock: 50, lowStockAlert: 8, unit: 'pack', description: 'Red chilli powder wholesale', catIdx: 1 },
      { name: 'Turmeric Powder (5 kg)', price: 700, costPrice: 480, sku: 'SPC-002', stock: 40, lowStockAlert: 6, unit: 'pack', description: 'Turmeric/haldi powder wholesale', catIdx: 1 },
      { name: 'Garam Masala (5 kg)', price: 1800, costPrice: 1200, sku: 'SPC-003', stock: 25, lowStockAlert: 5, unit: 'pack', description: 'Garam masala wholesale pack', catIdx: 1 },
      { name: 'Mustard Oil (15 L)', price: 2700, costPrice: 2100, sku: 'OIL-001', stock: 30, lowStockAlert: 5, unit: 'can', description: 'Mustard oil 15L wholesale', catIdx: 2 },
      { name: 'Sunflower Oil (15 L)', price: 2400, costPrice: 1900, sku: 'OIL-002', stock: 35, lowStockAlert: 5, unit: 'can', description: 'Sunflower oil 15L wholesale', catIdx: 2 },
      { name: 'Palm Oil (15 L)', price: 1800, costPrice: 1400, sku: 'OIL-003', stock: 40, lowStockAlert: 5, unit: 'can', description: 'Palm oil 15L wholesale', catIdx: 2 },
      { name: 'Plastic Bags (1000 pack)', price: 400, costPrice: 250, sku: 'PKG-001', stock: 200, lowStockAlert: 20, unit: 'pack', description: 'Small plastic carry bags', catIdx: 3 },
      { name: 'Paper Bags (500 pack)', price: 600, costPrice: 380, sku: 'PKG-002', stock: 100, lowStockAlert: 10, unit: 'pack', description: 'Brown paper bags', catIdx: 3 },
      { name: 'Detergent Powder (5 kg)', price: 450, costPrice: 300, sku: 'HH-001', stock: 60, lowStockAlert: 8, unit: 'pack', description: 'Wholesale detergent powder', catIdx: 4 },
      { name: 'Soap Bar (50 pack)', price: 500, costPrice: 320, sku: 'HH-002', stock: 40, lowStockAlert: 8, unit: 'pack', description: 'Bathing soap bars 50-pack', catIdx: 4 },
    ],
    staff: [
      { name: 'Mahesh Patel', phone: '9712345678', role: 'admin', shiftStart: '07:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Dharmesh Shah', phone: '9723456789', role: 'manager', shiftStart: '07:00', shiftEnd: '19:00', salary: 22000, commission: 2, isActive: true },
      { name: 'Hitesh Joshi', phone: '9734567890', role: 'cashier', shiftStart: '07:00', shiftEnd: '15:00', salary: 14000, commission: 0, isActive: true },
      { name: 'Amit Desai', phone: '9745678901', role: 'staff', shiftStart: '07:00', shiftEnd: '19:00', salary: 12000, commission: 1, isActive: true },
    ],
  },

  jewellery: {
    storeName: 'Kundan Jewellers',
    ownerName: 'Rajesh Soni',
    niche: 'jewellery',
    template: 'jewel-gold',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '9876543210',
    address: '34 Zaveri Bazaar, Bhuleshwar',
    email: 'info@kundanjewellers.in',
    gstNumber: '27AABCU9603R1ZW',
    taxRate: 3.0,
    receiptHeader: 'Kundan Jewellers - Pure Gold & Diamond',
    receiptFooter: 'Thank you! Hallmark certified jewellery.',
    categories: [
      { name: 'Gold', icon: '🥇', color: '#d97706', sortOrder: 1 },
      { name: 'Silver', icon: '🥈', color: '#6b7280', sortOrder: 2 },
      { name: 'Diamond', icon: '💎', color: '#1e40af', sortOrder: 3 },
      { name: 'Platinum', icon: '⬜', color: '#9ca3af', sortOrder: 4 },
      { name: 'Coins', icon: '🪙', color: '#dc2626', sortOrder: 5 },
    ],
    products: [
      { name: 'Gold Chain (10g)', price: 55000, costPrice: 48000, sku: 'GLD-001', stock: 15, lowStockAlert: 3, unit: 'piece', description: '22K gold chain - 10 grams', catIdx: 0 },
      { name: 'Gold Ring (5g)', price: 30000, costPrice: 26000, sku: 'GLD-002', stock: 20, lowStockAlert: 4, unit: 'piece', description: '22K gold ring - 5 grams', catIdx: 0 },
      { name: 'Gold Bangle (15g)', price: 85000, costPrice: 74000, sku: 'GLD-003', stock: 10, lowStockAlert: 2, unit: 'piece', description: '22K gold bangle pair - 15g each', catIdx: 0 },
      { name: 'Gold Earrings (4g)', price: 24000, costPrice: 20000, sku: 'GLD-004', stock: 25, lowStockAlert: 5, unit: 'piece', description: '22K gold earrings - 4 grams', catIdx: 0 },
      { name: 'Gold Necklace Set (25g)', price: 145000, costPrice: 128000, sku: 'GLD-005', stock: 5, lowStockAlert: 2, unit: 'set', description: '22K gold necklace with earrings', catIdx: 0 },
      { name: 'Silver Earrings (20g)', price: 1800, costPrice: 1200, sku: 'SLV-001', stock: 30, lowStockAlert: 5, unit: 'piece', description: '925 sterling silver earrings', catIdx: 1 },
      { name: 'Silver Chain (30g)', price: 2800, costPrice: 1800, sku: 'SLV-002', stock: 20, lowStockAlert: 4, unit: 'piece', description: 'Sterling silver chain', catIdx: 1 },
      { name: 'Silver Anklet (50g)', price: 4500, costPrice: 3000, sku: 'SLV-003', stock: 15, lowStockAlert: 3, unit: 'pair', description: 'Silver anklet pair', catIdx: 1 },
      { name: 'Diamond Ring (0.25 ct)', price: 45000, costPrice: 32000, sku: 'DIA-001', stock: 8, lowStockAlert: 2, unit: 'piece', description: '0.25 carat diamond ring in 18K gold', catIdx: 2 },
      { name: 'Diamond Earrings (0.15 ct)', price: 35000, costPrice: 24000, sku: 'DIA-002', stock: 10, lowStockAlert: 2, unit: 'piece', description: 'Diamond stud earrings in 18K gold', catIdx: 2 },
      { name: 'Diamond Pendant (0.30 ct)', price: 55000, costPrice: 38000, sku: 'DIA-003', stock: 2, lowStockAlert: 2, unit: 'piece', description: 'Diamond pendant with chain', catIdx: 2 },
      { name: 'Platinum Band (6g)', price: 35000, costPrice: 28000, sku: 'PLT-001', stock: 5, lowStockAlert: 2, unit: 'piece', description: 'Platinum wedding band - 6 grams', catIdx: 3 },
      { name: 'Gold Coin (1g)', price: 6500, costPrice: 5800, sku: 'COIN-001', stock: 50, lowStockAlert: 10, unit: 'piece', description: '24K pure gold coin 1 gram', catIdx: 4 },
      { name: 'Gold Coin (5g)', price: 32000, costPrice: 28500, sku: 'COIN-002', stock: 20, lowStockAlert: 5, unit: 'piece', description: '24K pure gold coin 5 grams', catIdx: 4 },
      { name: 'Silver Coin (10g)', price: 900, costPrice: 650, sku: 'COIN-003', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Pure silver coin 10 grams', catIdx: 4 },
    ],
    staff: [
      { name: 'Rajesh Soni', phone: '9712345678', role: 'admin', shiftStart: '10:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Mohan Lal', phone: '9723456789', role: 'manager', shiftStart: '10:00', shiftEnd: '21:00', salary: 25000, commission: 3, isActive: true },
      { name: 'Suresh Verma', phone: '9734567890', role: 'staff', shiftStart: '10:00', shiftEnd: '18:00', salary: 16000, commission: 2, isActive: true },
      { name: 'Rekha Devi', phone: '9745678901', role: 'cashier', shiftStart: '10:00', shiftEnd: '21:00', salary: 14000, commission: 0, isActive: true },
    ],
  },

  gym: {
    storeName: 'FitLife Gym',
    ownerName: 'Suresh Reddy',
    niche: 'gym',
    template: 'gym-fit',
    city: 'Hyderabad',
    state: 'Telangana',
    phone: '9876543210',
    address: '56 Jubilee Hills, Road No. 10',
    email: 'info@fitlifegym.in',
    gstNumber: '36AABCU9603R1ZX',
    taxRate: 18.0,
    receiptHeader: 'FitLife Gym - Transform Your Body',
    receiptFooter: 'Thank you! Stay fit, stay healthy 💪',
    categories: [
      { name: 'Membership', icon: '🏋️', color: '#65a30d', sortOrder: 1 },
      { name: 'Personal Training', icon: '🥊', color: '#dc2626', sortOrder: 2 },
      { name: 'Group Classes', icon: '🧘', color: '#7c3aed', sortOrder: 3 },
      { name: 'Supplements', icon: '🥤', color: '#0891b2', sortOrder: 4 },
      { name: 'Merchandise', icon: '👕', color: '#f97316', sortOrder: 5 },
    ],
    products: [
      { name: 'Monthly Membership', price: 1500, costPrice: 0, sku: 'MEM-001', stock: 999, lowStockAlert: 1, unit: 'month', description: '1-month gym membership', catIdx: 0 },
      { name: 'Quarterly Membership', price: 4000, costPrice: 0, sku: 'MEM-002', stock: 999, lowStockAlert: 1, unit: 'quarter', description: '3-month gym membership (save ₹500)', catIdx: 0 },
      { name: 'Annual Plan', price: 12000, costPrice: 0, sku: 'MEM-003', stock: 999, lowStockAlert: 1, unit: 'year', description: '12-month gym membership (best value)', catIdx: 0 },
      { name: 'Student Monthly', price: 1000, costPrice: 0, sku: 'MEM-004', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Student discount monthly membership', catIdx: 0 },
      { name: 'PT Session (1 hour)', price: 800, costPrice: 400, sku: 'PT-001', stock: 999, lowStockAlert: 1, unit: 'session', description: '1-hour personal training session', catIdx: 1 },
      { name: 'PT Pack (10 sessions)', price: 6500, costPrice: 3500, sku: 'PT-002', stock: 999, lowStockAlert: 1, unit: 'pack', description: '10 personal training sessions', catIdx: 1 },
      { name: 'Yoga Class (Monthly)', price: 2000, costPrice: 800, sku: 'GRP-001', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Monthly unlimited yoga classes', catIdx: 2 },
      { name: 'Zumba Class (Monthly)', price: 2000, costPrice: 800, sku: 'GRP-002', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Monthly unlimited Zumba classes', catIdx: 2 },
      { name: 'Whey Protein (1 kg)', price: 1800, costPrice: 1000, sku: 'SUP-001', stock: 20, lowStockAlert: 5, unit: 'pack', description: 'Whey protein powder', catIdx: 3 },
      { name: 'BCAA (300g)', price: 900, costPrice: 500, sku: 'SUP-002', stock: 15, lowStockAlert: 3, unit: 'pack', description: 'Branched-chain amino acids', catIdx: 3 },
      { name: 'Creatine (250g)', price: 700, costPrice: 350, sku: 'SUP-003', stock: 12, lowStockAlert: 3, unit: 'pack', description: 'Creatine monohydrate', catIdx: 3 },
      { name: 'Gym T-Shirt', price: 500, costPrice: 200, sku: 'MRC-001', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'FitLife branded gym t-shirt', catIdx: 4 },
      { name: 'Gym Shorts', price: 400, costPrice: 180, sku: 'MRC-002', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'FitLife branded gym shorts', catIdx: 4 },
      { name: 'Shaker Bottle', price: 250, costPrice: 80, sku: 'MRC-003', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Protein shaker bottle', catIdx: 4 },
    ],
    staff: [
      { name: 'Suresh Reddy', phone: '9712345678', role: 'admin', shiftStart: '06:00', shiftEnd: '22:00', salary: 0, commission: 0, isActive: true },
      { name: 'Venkat Rao', phone: '9723456789', role: 'staff', shiftStart: '06:00', shiftEnd: '14:00', salary: 18000, commission: 5, isActive: true },
      { name: 'Lakshmi Priya', phone: '9734567890', role: 'staff', shiftStart: '14:00', shiftEnd: '22:00', salary: 18000, commission: 5, isActive: true },
      { name: 'Ravi Kumar', phone: '9745678901', role: 'cashier', shiftStart: '08:00', shiftEnd: '20:00', salary: 13000, commission: 0, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const memberDefs = [
        { name: 'Arjun Reddy', phone: '9812345678', email: 'arjun.r@gmail.com', plan: 'annual', startDate: new Date('2024-06-15'), endDate: new Date('2025-06-15'), status: 'active' },
        { name: 'Divya Sharma', phone: '9823456789', email: 'divya.s@gmail.com', plan: 'monthly', startDate: new Date('2025-01-10'), endDate: new Date('2025-02-10'), status: 'active' },
        { name: 'Kiran Naidu', phone: '9834567890', email: 'kiran.n@gmail.com', plan: 'quarterly', startDate: new Date('2024-11-20'), endDate: new Date('2025-02-20'), status: 'active' },
        { name: 'Meena Kumari', phone: '9845678901', email: 'meena.k@gmail.com', plan: 'monthly', startDate: new Date('2025-02-01'), endDate: new Date('2025-03-01'), status: 'active' },
      ];
      for (const m of memberDefs) {
        await db.member.create({
          data: { storeId, name: m.name, phone: m.phone, email: m.email, plan: m.plan, startDate: m.startDate, endDate: m.endDate, status: m.status },
        });
      }
    },
  },

  stationery: {
    storeName: 'National Stationery',
    ownerName: 'Bipin Chatterjee',
    niche: 'stationery',
    template: 'stat-book',
    city: 'Kolkata',
    state: 'West Bengal',
    phone: '9876543210',
    address: '78 College Street, Bowbazar',
    email: 'info@nationalstationery.in',
    gstNumber: '19AABCU9603R1ZY',
    taxRate: 18.0,
    receiptHeader: 'National Stationery - Books & Office Supplies',
    receiptFooter: 'Thank you! Visit again for all your stationery needs.',
    categories: [
      { name: 'Notebooks', icon: '📓', color: '#1e40af', sortOrder: 1 },
      { name: 'Pens', icon: '🖊️', color: '#dc2626', sortOrder: 2 },
      { name: 'Art Supplies', icon: '🎨', color: '#7c3aed', sortOrder: 3 },
      { name: 'School Kits', icon: '🎒', color: '#f97316', sortOrder: 4 },
      { name: 'Office', icon: '🏢', color: '#475569', sortOrder: 5 },
    ],
    products: [
      { name: 'Classmate Notebook (200 pg)', price: 60, costPrice: 35, sku: 'NBK-001', stock: 200, lowStockAlert: 30, unit: 'piece', description: 'Classmate ruled notebook 200 pages', catIdx: 0 },
      { name: 'Practical Notebook (150 pg)', price: 45, costPrice: 25, sku: 'NBK-002', stock: 150, lowStockAlert: 25, unit: 'piece', description: 'Practical file notebook', catIdx: 0 },
      { name: 'Drawing Book (A4)', price: 80, costPrice: 45, sku: 'NBK-003', stock: 80, lowStockAlert: 15, unit: 'piece', description: 'Blank drawing book A4 size', catIdx: 0 },
      { name: 'Register (300 pg)', price: 100, costPrice: 55, sku: 'NBK-004', stock: 60, lowStockAlert: 10, unit: 'piece', description: 'Hardbound register 300 pages', catIdx: 0 },
      { name: 'Parker Pen (Ball)', price: 150, costPrice: 70, sku: 'PEN-001', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Parker ballpoint pen', catIdx: 1 },
      { name: 'Gel Pen (Pack of 5)', price: 50, costPrice: 22, sku: 'PEN-002', stock: 100, lowStockAlert: 20, unit: 'pack', description: 'Gel pen set - 5 colors', catIdx: 1 },
      { name: 'Fountain Pen', price: 120, costPrice: 55, sku: 'PEN-003', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Student fountain pen with converter', catIdx: 1 },
      { name: 'Marker (Whiteboard)', price: 40, costPrice: 18, sku: 'PEN-004', stock: 80, lowStockAlert: 15, unit: 'piece', description: 'Whiteboard marker - assorted colors', catIdx: 1 },
      { name: 'Watercolors (12 shade)', price: 120, costPrice: 55, sku: 'ART-001', stock: 40, lowStockAlert: 8, unit: 'box', description: 'Student watercolor kit 12 shades', catIdx: 2 },
      { name: 'Crayons (24 shade)', price: 80, costPrice: 35, sku: 'ART-002', stock: 50, lowStockAlert: 10, unit: 'box', description: 'Wax crayons 24 shades', catIdx: 2 },
      { name: 'Pencil Set (6B-2H)', price: 150, costPrice: 65, sku: 'ART-003', stock: 35, lowStockAlert: 5, unit: 'set', description: 'Drawing pencil set - 12 pieces', catIdx: 2 },
      { name: 'School Bag', price: 500, costPrice: 250, sku: 'KIT-001', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'School backpack for students', catIdx: 3 },
      { name: 'Geometry Box', price: 120, costPrice: 55, sku: 'KIT-002', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Math geometry instrument box', catIdx: 3 },
      { name: 'Lunch Box', price: 250, costPrice: 120, sku: 'KIT-003', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Insulated lunch box', catIdx: 3 },
      { name: 'A4 Paper (500 sheet)', price: 300, costPrice: 200, sku: 'OFF-001', stock: 50, lowStockAlert: 10, unit: 'ream', description: 'A4 copier paper 500 sheets', catIdx: 4 },
      { name: 'Stapler', price: 150, costPrice: 70, sku: 'OFF-002', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Office stapler with staples', catIdx: 4 },
      { name: 'File Folder (Pack of 5)', price: 80, costPrice: 35, sku: 'OFF-003', stock: 60, lowStockAlert: 10, unit: 'pack', description: 'Lever arch file folders', catIdx: 4 },
    ],
    staff: [
      { name: 'Bipin Chatterjee', phone: '9712345678', role: 'admin', shiftStart: '09:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Amit Das', phone: '9723456789', role: 'cashier', shiftStart: '09:00', shiftEnd: '17:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Rupa Sen', phone: '9734567890', role: 'cashier', shiftStart: '14:00', shiftEnd: '21:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Sanjay Ghosh', phone: '9745678901', role: 'staff', shiftStart: '09:00', shiftEnd: '21:00', salary: 11000, commission: 1, isActive: true },
    ],
  },

  hotel: {
    storeName: 'Heritage Inn',
    ownerName: 'Vijay Tripathi',
    niche: 'hotel',
    template: 'hotel-stay',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    phone: '9876543210',
    address: '23 Dashashwamedh Ghat Road',
    email: 'info@heritageinn.in',
    gstNumber: '09AABCU9603R1ZZ',
    taxRate: 18.0,
    receiptHeader: 'Heritage Inn - Experience Varanasi',
    receiptFooter: 'Thank you for staying with us! Namaste 🙏',
    categories: [
      { name: 'Standard Room', icon: '🛏️', color: '#475569', sortOrder: 1 },
      { name: 'Deluxe Room', icon: '🌟', color: '#d97706', sortOrder: 2 },
      { name: 'Suite', icon: '👑', color: '#7c3aed', sortOrder: 3 },
      { name: 'Room Service', icon: '🍽️', color: '#059669', sortOrder: 4 },
      { name: 'Laundry', icon: '👔', color: '#0891b2', sortOrder: 5 },
    ],
    products: [
      { name: 'Standard Room (1 Night)', price: 1500, costPrice: 600, sku: 'STD-001', stock: 999, lowStockAlert: 1, unit: 'night', description: 'Standard non-AC room per night', catIdx: 0 },
      { name: 'Standard AC Room (1 Night)', price: 2200, costPrice: 900, sku: 'STD-002', stock: 999, lowStockAlert: 1, unit: 'night', description: 'Standard AC room per night', catIdx: 0 },
      { name: 'Deluxe Room (1 Night)', price: 3500, costPrice: 1500, sku: 'DLX-001', stock: 999, lowStockAlert: 1, unit: 'night', description: 'Deluxe AC room with river view', catIdx: 1 },
      { name: 'Deluxe Room (Extra Bed)', price: 800, costPrice: 300, sku: 'DLX-002', stock: 999, lowStockAlert: 1, unit: 'night', description: 'Extra bed in deluxe room', catIdx: 1 },
      { name: 'Suite (1 Night)', price: 6000, costPrice: 2500, sku: 'STE-001', stock: 999, lowStockAlert: 1, unit: 'night', description: 'Premium suite with living room', catIdx: 2 },
      { name: 'Honeymoon Suite (1 Night)', price: 8000, costPrice: 3500, sku: 'STE-002', stock: 999, lowStockAlert: 1, unit: 'night', description: 'Honeymoon suite with balcony', catIdx: 2 },
      { name: 'Breakfast Buffet', price: 350, costPrice: 120, sku: 'RS-001', stock: 999, lowStockAlert: 1, unit: 'person', description: 'Breakfast buffet per person', catIdx: 3 },
      { name: 'Dinner Thali', price: 450, costPrice: 180, sku: 'RS-002', stock: 999, lowStockAlert: 1, unit: 'person', description: 'Indian dinner thali', catIdx: 3 },
      { name: 'Tea/Coffee (Room Service)', price: 100, costPrice: 30, sku: 'RS-003', stock: 999, lowStockAlert: 1, unit: 'cup', description: 'Tea or coffee to room', catIdx: 3 },
      { name: 'Minibar Items', price: 250, costPrice: 100, sku: 'RS-004', stock: 999, lowStockAlert: 1, unit: 'set', description: 'Minibar consumption', catIdx: 3 },
      { name: 'Laundry (Wash + Iron)', price: 150, costPrice: 50, sku: 'LND-001', stock: 999, lowStockAlert: 1, unit: 'set', description: 'Laundry per 5 items', catIdx: 4 },
      { name: 'Dry Cleaning', price: 300, costPrice: 120, sku: 'LND-002', stock: 999, lowStockAlert: 1, unit: 'piece', description: 'Dry cleaning per item', catIdx: 4 },
      { name: 'Early Check-in', price: 500, costPrice: 0, sku: 'EXT-001', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Early check-in (before 12 PM)', catIdx: 0 },
      { name: 'Late Check-out', price: 500, costPrice: 0, sku: 'EXT-002', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Late check-out (after 11 AM)', catIdx: 0 },
    ],
    staff: [
      { name: 'Vijay Tripathi', phone: '9712345678', role: 'admin', shiftStart: '08:00', shiftEnd: '22:00', salary: 0, commission: 0, isActive: true },
      { name: 'Rajesh Pandey', phone: '9723456789', role: 'manager', shiftStart: '08:00', shiftEnd: '20:00', salary: 22000, commission: 2, isActive: true },
      { name: 'Anita Mishra', phone: '9734567890', role: 'cashier', shiftStart: '08:00', shiftEnd: '20:00', salary: 14000, commission: 0, isActive: true },
      { name: 'Sunil Yadav', phone: '9745678901', role: 'staff', shiftStart: '06:00', shiftEnd: '14:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Gopal Sharma', phone: '9756789012', role: 'staff', shiftStart: '14:00', shiftEnd: '22:00', salary: 12000, commission: 0, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const roomDefs = [
        { number: '101', type: 'standard', capacity: 2, status: 'available', floor: 1, pricePerNight: 1500 },
        { number: '102', type: 'standard', capacity: 2, status: 'occupied', floor: 1, pricePerNight: 1500 },
        { number: '103', type: 'deluxe', capacity: 2, status: 'available', floor: 1, pricePerNight: 2500 },
        { number: '201', type: 'deluxe', capacity: 3, status: 'occupied', floor: 2, pricePerNight: 2500 },
        { number: '202', type: 'deluxe', capacity: 3, status: 'available', floor: 2, pricePerNight: 2500 },
        { number: '203', type: 'deluxe', capacity: 3, status: 'maintenance', floor: 2, pricePerNight: 2500 },
        { number: '301', type: 'suite', capacity: 4, status: 'available', floor: 3, pricePerNight: 5000 },
        { number: '302', type: 'suite', capacity: 2, status: 'occupied', floor: 3, pricePerNight: 5000 },
      ];
      for (const r of roomDefs) {
        await db.room.create({
          data: { storeId, number: r.number, type: r.type, capacity: r.capacity, status: r.status, floor: r.floor, pricePerNight: r.pricePerNight },
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
