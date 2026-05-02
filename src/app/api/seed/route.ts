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
    storeName: 'Fashion Hub',
    ownerName: 'Vikram Malhotra',
    niche: 'clothing',
    template: 'cloth-modern',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '9876543210',
    address: '78 Fashion Street, Bandra West',
    email: 'info@fashionhub.in',
    gstNumber: '27AABCU9603R1ZN',
    taxRate: 18.0,
    receiptHeader: 'Fashion Hub - Style for Everyone',
    receiptFooter: 'Thank you for shopping! Exchange within 7 days.',
    categories: [
      { name: "Men's Wear", icon: '👔', color: '#1e40af', sortOrder: 1 },
      { name: "Women's Wear", icon: '👗', color: '#be185d', sortOrder: 2 },
      { name: 'Kids Wear', icon: '🧒', color: '#f97316', sortOrder: 3 },
      { name: 'Accessories', icon: '👜', color: '#7c3aed', sortOrder: 4 },
      { name: 'Footwear', icon: '👟', color: '#059669', sortOrder: 5 },
    ],
    products: [
      // Men's Wear (catIdx: 0)
      { name: 'Formal Shirt', price: 1500, costPrice: 700, sku: 'MN-001', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Premium cotton formal shirt', catIdx: 0 },
      { name: 'Casual Shirt', price: 800, costPrice: 380, sku: 'MN-002', stock: 65, lowStockAlert: 12, unit: 'piece', description: 'Trendy casual shirt for everyday wear', catIdx: 0 },
      { name: 'Jeans (Men)', price: 2500, costPrice: 1200, sku: 'MN-003', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Slim fit premium denim jeans', catIdx: 0 },
      { name: 'Kurta (Men)', price: 1200, costPrice: 550, sku: 'MN-004', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Embroidered cotton kurta', catIdx: 0 },
      { name: 'T-Shirt (Men)', price: 600, costPrice: 250, sku: 'MN-005', stock: 80, lowStockAlert: 15, unit: 'piece', description: 'Cotton crew neck t-shirt', catIdx: 0 },
      // Women's Wear (catIdx: 1)
      { name: 'Silk Saree', price: 8000, costPrice: 4000, sku: 'WN-001', stock: 15, lowStockAlert: 3, unit: 'piece', description: 'Banarasi silk saree with golden border', catIdx: 1 },
      { name: 'Cotton Saree', price: 2000, costPrice: 900, sku: 'WN-002', stock: 30, lowStockAlert: 6, unit: 'piece', description: 'Handloom cotton saree', catIdx: 1 },
      { name: 'Western Dress', price: 3000, costPrice: 1400, sku: 'WN-003', stock: 20, lowStockAlert: 4, unit: 'piece', description: 'Elegant A-line western dress', catIdx: 1 },
      { name: 'Kurti', price: 900, costPrice: 400, sku: 'WN-004', stock: 45, lowStockAlert: 8, unit: 'piece', description: 'Cotton printed kurti', catIdx: 1 },
      { name: 'Salwar Suit', price: 2200, costPrice: 1000, sku: 'WN-005', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Embroidered salwar kameez set', catIdx: 1 },
      // Kids Wear (catIdx: 2)
      { name: 'Kids T-Shirt', price: 400, costPrice: 180, sku: 'KD-001', stock: 60, lowStockAlert: 10, unit: 'piece', description: 'Cartoon print cotton t-shirt for kids', catIdx: 2 },
      { name: 'Kids Dress', price: 800, costPrice: 350, sku: 'KD-002', stock: 35, lowStockAlert: 7, unit: 'piece', description: 'Cotton printed dress for girls', catIdx: 2 },
      { name: 'Kids Jeans', price: 1200, costPrice: 550, sku: 'KD-003', stock: 30, lowStockAlert: 6, unit: 'piece', description: 'Denim jeans for kids', catIdx: 2 },
      { name: 'Kids Kurta', price: 600, costPrice: 260, sku: 'KD-004', stock: 20, lowStockAlert: 4, unit: 'piece', description: 'Festive kurta for kids', catIdx: 2 },
      // Accessories (catIdx: 3)
      { name: 'Leather Belt', price: 600, costPrice: 250, sku: 'ACC-001', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Genuine leather belt', catIdx: 3 },
      { name: 'Wrist Watch', price: 3500, costPrice: 1500, sku: 'ACC-002', stock: 15, lowStockAlert: 3, unit: 'piece', description: 'Analog wrist watch - steel strap', catIdx: 3 },
      { name: 'Premium Watch', price: 8500, costPrice: 4000, sku: 'ACC-003', stock: 3, lowStockAlert: 5, unit: 'piece', description: 'Luxury premium brand watch', catIdx: 3 },
      // Footwear (catIdx: 4)
      { name: 'Sneakers', price: 3000, costPrice: 1400, sku: 'FT-001', stock: 20, lowStockAlert: 4, unit: 'pair', description: 'Trendy sneakers - lightweight sole', catIdx: 4 },
      { name: 'Heels (Women)', price: 2000, costPrice: 900, sku: 'FT-002', stock: 25, lowStockAlert: 5, unit: 'pair', description: 'Elegant block heel sandals', catIdx: 4 },
      { name: 'Formal Shoes', price: 4500, costPrice: 2000, sku: 'FT-003', stock: 10, lowStockAlert: 3, unit: 'pair', description: 'Leather formal shoes for men', catIdx: 4 },
    ],
    staff: [
      { name: 'Vikram Malhotra', phone: '9712345678', role: 'admin', shiftStart: '10:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Priya Shah', phone: '9723456789', role: 'cashier', shiftStart: '10:00', shiftEnd: '18:00', salary: 14000, commission: 0, isActive: true },
      { name: 'Rahul Joshi', phone: '9734567890', role: 'manager', shiftStart: '10:00', shiftEnd: '21:00', salary: 20000, commission: 2, isActive: true },
      { name: 'Nisha Patel', phone: '9745678901', role: 'cashier', shiftStart: '14:00', shiftEnd: '21:00', salary: 13000, commission: 0, isActive: true },
    ],
  },

  pharmacy: {
    storeName: 'MedPlus Pharmacy',
    ownerName: 'Dr. Suresh Gupta',
    niche: 'pharmacy',
    template: 'pharm-classic',
    city: 'Delhi',
    state: 'Delhi',
    phone: '9876543210',
    address: '12 MG Road, Lajpat Nagar',
    email: 'info@medpluspharmacy.in',
    gstNumber: '07AABCU9603R1ZP',
    taxRate: 0.0,
    receiptHeader: 'MedPlus Pharmacy - Your Health Partner',
    receiptFooter: 'Thank you! Keep your bill for returns. Consult your doctor.',
    categories: [
      { name: 'Prescription Drugs', icon: '💊', color: '#dc2626', sortOrder: 1 },
      { name: 'OTC Medicines', icon: '🩹', color: '#f97316', sortOrder: 2 },
      { name: 'Health Supplements', icon: '💪', color: '#059669', sortOrder: 3 },
      { name: 'Personal Care', icon: '🧴', color: '#7c3aed', sortOrder: 4 },
      { name: 'Baby Care', icon: '🍼', color: '#0891b2', sortOrder: 5 },
    ],
    products: [
      // Prescription Drugs (catIdx: 0)
      { name: 'Paracetamol 500mg (10 tab)', price: 30, costPrice: 12, sku: 'RX-001', stock: 500, lowStockAlert: 50, unit: 'strip', description: 'Acetaminophen tablets for fever and pain', catIdx: 0 },
      { name: 'Crocin Advance (15 tab)', price: 25, costPrice: 10, sku: 'RX-002', stock: 300, lowStockAlert: 30, unit: 'strip', description: 'Crocin pain relief tablets', catIdx: 0 },
      { name: 'Azithromycin 500mg (3 tab)', price: 120, costPrice: 55, sku: 'RX-003', stock: 80, lowStockAlert: 15, unit: 'strip', description: 'Antibiotic for bacterial infections', catIdx: 0 },
      { name: 'Cetirizine 10mg (10 tab)', price: 20, costPrice: 8, sku: 'RX-004', stock: 400, lowStockAlert: 40, unit: 'strip', description: 'Antihistamine for allergies', catIdx: 0 },
      { name: 'Omeprazole 20mg (10 cap)', price: 35, costPrice: 15, sku: 'RX-005', stock: 2, lowStockAlert: 20, unit: 'strip', description: 'Proton pump inhibitor for acidity', catIdx: 0 },
      // OTC Medicines (catIdx: 1)
      { name: 'Dettol Antiseptic (120ml)', price: 95, costPrice: 55, sku: 'OTC-001', stock: 80, lowStockAlert: 10, unit: 'bottle', description: 'Antiseptic disinfectant liquid', catIdx: 1 },
      { name: 'Band-Aid (10 strip)', price: 45, costPrice: 20, sku: 'OTC-002', stock: 150, lowStockAlert: 20, unit: 'pack', description: 'Adhesive bandages for cuts', catIdx: 1 },
      { name: 'Vicks VapoRub (50g)', price: 55, costPrice: 28, sku: 'OTC-003', stock: 100, lowStockAlert: 15, unit: 'jar', description: 'Topical cough suppressant', catIdx: 1 },
      { name: 'Benadryl Cough Syrup (100ml)', price: 110, costPrice: 55, sku: 'OTC-004', stock: 60, lowStockAlert: 10, unit: 'bottle', description: 'Cough and cold relief syrup', catIdx: 1 },
      { name: 'ORS Sachets (5 pack)', price: 30, costPrice: 12, sku: 'OTC-005', stock: 200, lowStockAlert: 25, unit: 'pack', description: 'Oral rehydration salts', catIdx: 1 },
      // Health Supplements (catIdx: 2)
      { name: 'Vitamin D3 (60k IU)', price: 350, costPrice: 160, sku: 'SUP-001', stock: 100, lowStockAlert: 15, unit: 'strip', description: 'Weekly vitamin D3 supplement capsule', catIdx: 2 },
      { name: 'Calcium + Vitamin D (30 tab)', price: 280, costPrice: 120, sku: 'SUP-002', stock: 60, lowStockAlert: 8, unit: 'bottle', description: 'Bone health supplement', catIdx: 2 },
      { name: 'Protein Powder (500g)', price: 800, costPrice: 400, sku: 'SUP-003', stock: 30, lowStockAlert: 5, unit: 'pack', description: 'Whey protein supplement powder', catIdx: 2 },
      { name: 'Multivitamin (30 tab)', price: 250, costPrice: 110, sku: 'SUP-004', stock: 80, lowStockAlert: 10, unit: 'bottle', description: 'Daily multivitamin tablets', catIdx: 2 },
      // Personal Care (catIdx: 3)
      { name: 'Hand Sanitizer (200ml)', price: 80, costPrice: 35, sku: 'PC-001', stock: 100, lowStockAlert: 15, unit: 'bottle', description: 'Alcohol-based hand sanitizer', catIdx: 3 },
      { name: 'Face Wash (100ml)', price: 180, costPrice: 80, sku: 'PC-002', stock: 50, lowStockAlert: 8, unit: 'tube', description: 'Gentle face wash for daily use', catIdx: 3 },
      { name: 'Cetaphil Cleanser (250ml)', price: 450, costPrice: 220, sku: 'PC-003', stock: 3, lowStockAlert: 5, unit: 'bottle', description: 'Gentle skin cleanser for sensitive skin', catIdx: 3 },
      // Baby Care (catIdx: 4)
      { name: 'Baby Lotion (200ml)', price: 160, costPrice: 80, sku: 'BC-001', stock: 40, lowStockAlert: 8, unit: 'bottle', description: 'Mild baby moisturizing lotion', catIdx: 4 },
      { name: 'Baby Diapers (Medium, 20 pack)', price: 350, costPrice: 180, sku: 'BC-002', stock: 2, lowStockAlert: 5, unit: 'pack', description: 'Disposable diapers for babies', catIdx: 4 },
      { name: 'Baby Soap (75g)', price: 55, costPrice: 22, sku: 'BC-003', stock: 60, lowStockAlert: 10, unit: 'piece', description: 'Gentle baby bath soap', catIdx: 4 },
    ],
    staff: [
      { name: 'Dr. Suresh Gupta', phone: '9712345678', role: 'admin', shiftStart: '09:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Ramesh Kumar', phone: '9723456789', role: 'cashier', shiftStart: '09:00', shiftEnd: '17:00', salary: 14000, commission: 0, isActive: true },
      { name: 'Anita Sharma', phone: '9734567890', role: 'staff', shiftStart: '09:00', shiftEnd: '17:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Sanjay Verma', phone: '9745678901', role: 'cashier', shiftStart: '17:00', shiftEnd: '22:00', salary: 14000, commission: 0, isActive: true },
    ],
  },

  electronics: {
    storeName: 'TechZone Electronics',
    ownerName: 'Amit Patel',
    niche: 'electronics',
    template: 'electro-modern',
    city: 'Bengaluru',
    state: 'Karnataka',
    phone: '9876543210',
    address: '45 Brigade Road, MG Road',
    email: 'info@techzoneelectronics.in',
    gstNumber: '29AABCU9603R1ZQ',
    taxRate: 18.0,
    receiptHeader: 'TechZone Electronics - Your Gadget Destination',
    receiptFooter: 'Thank you! Warranty applicable with this bill.',
    categories: [
      { name: 'Smartphones', icon: '📱', color: '#1e40af', sortOrder: 1 },
      { name: 'Laptops', icon: '💻', color: '#7c3aed', sortOrder: 2 },
      { name: 'Accessories', icon: '🔌', color: '#f97316', sortOrder: 3 },
      { name: 'Audio', icon: '🎵', color: '#dc2626', sortOrder: 4 },
      { name: 'Wearables', icon: '⌚', color: '#059669', sortOrder: 5 },
    ],
    products: [
      // Smartphones (catIdx: 0) - high value, low stock
      { name: 'iPhone 15', price: 79900, costPrice: 72000, sku: 'SM-001', stock: 5, lowStockAlert: 2, unit: 'piece', description: 'Apple iPhone 15 128GB', catIdx: 0 },
      { name: 'Samsung Galaxy S24', price: 44999, costPrice: 39000, sku: 'SM-002', stock: 8, lowStockAlert: 3, unit: 'piece', description: 'Samsung Galaxy S24 128GB', catIdx: 0 },
      { name: 'OnePlus 12', price: 39999, costPrice: 34000, sku: 'SM-003', stock: 6, lowStockAlert: 2, unit: 'piece', description: 'OnePlus 12 256GB', catIdx: 0 },
      // Laptops (catIdx: 1) - high value, very low stock
      { name: 'MacBook Air M2', price: 99900, costPrice: 88000, sku: 'LAP-001', stock: 3, lowStockAlert: 1, unit: 'piece', description: 'Apple MacBook Air M2 8GB/256GB', catIdx: 1 },
      { name: 'HP Laptop 15s', price: 55900, costPrice: 47000, sku: 'LAP-002', stock: 4, lowStockAlert: 2, unit: 'piece', description: 'HP 15s Ryzen 5 8GB/512GB', catIdx: 1 },
      { name: 'Lenovo Tab M10', price: 24999, costPrice: 20000, sku: 'LAP-003', stock: 5, lowStockAlert: 2, unit: 'piece', description: 'Lenovo Tab M10 FHD Plus 4GB/64GB', catIdx: 1 },
      // Accessories (catIdx: 2)
      { name: 'AirPods Pro', price: 24900, costPrice: 21000, sku: 'ACC-001', stock: 8, lowStockAlert: 3, unit: 'piece', description: 'Apple AirPods Pro 2nd Gen', catIdx: 2 },
      { name: 'Power Bank 20000mAh', price: 1299, costPrice: 600, sku: 'ACC-002', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Mi Power Bank 3i 20000mAh', catIdx: 2 },
      { name: 'USB-C Cable (1m)', price: 299, costPrice: 80, sku: 'ACC-003', stock: 100, lowStockAlert: 20, unit: 'piece', description: 'Type-C fast charging cable', catIdx: 2 },
      { name: 'Screen Guard (Tempered)', price: 199, costPrice: 50, sku: 'ACC-004', stock: 150, lowStockAlert: 30, unit: 'piece', description: '9H tempered glass screen protector', catIdx: 2 },
      { name: 'Mouse (Wireless)', price: 799, costPrice: 350, sku: 'ACC-005', stock: 30, lowStockAlert: 8, unit: 'piece', description: 'Wireless optical mouse', catIdx: 2 },
      { name: 'Keyboard (Wireless)', price: 1499, costPrice: 650, sku: 'ACC-006', stock: 15, lowStockAlert: 4, unit: 'piece', description: 'Wireless keyboard with num pad', catIdx: 2 },
      // Audio (catIdx: 3)
      { name: 'JBL Flip 6 Speaker', price: 4999, costPrice: 3000, sku: 'AUD-001', stock: 10, lowStockAlert: 3, unit: 'piece', description: 'JBL Flip 6 portable Bluetooth speaker', catIdx: 3 },
      { name: 'Headphones (Over-Ear)', price: 2999, costPrice: 1400, sku: 'AUD-002', stock: 12, lowStockAlert: 3, unit: 'piece', description: 'Over-ear wireless headphones with ANC', catIdx: 3 },
      { name: 'Wireless Earbuds', price: 1999, costPrice: 900, sku: 'AUD-003', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'TWS wireless earbuds with mic', catIdx: 3 },
      // Wearables (catIdx: 4)
      { name: 'Smart Watch (GPS)', price: 14999, costPrice: 10000, sku: 'WR-001', stock: 6, lowStockAlert: 2, unit: 'piece', description: 'GPS smart watch with health tracking', catIdx: 4 },
      { name: 'Fitbit Charge 6', price: 9999, costPrice: 6500, sku: 'WR-002', stock: 4, lowStockAlert: 2, unit: 'piece', description: 'Fitbit fitness tracker with heart rate', catIdx: 4 },
      { name: 'Smart Band', price: 2999, costPrice: 1300, sku: 'WR-003', stock: 3, lowStockAlert: 5, unit: 'piece', description: 'Mi Smart Band 8 Active', catIdx: 4 },
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
    template: 'coach-academic',
    city: 'Delhi',
    state: 'Delhi',
    phone: '9876543210',
    address: '45 Hudson Lane, GTB Nagar',
    email: 'info@excelacademy.in',
    gstNumber: '07AABCU9603R1ZR',
    taxRate: 18.0,
    receiptHeader: 'Excel Academy - Learn to Excel',
    receiptFooter: 'Thank you for choosing Excel Academy!',
    categories: [
      { name: 'Mathematics', icon: '📐', color: '#1e40af', sortOrder: 1 },
      { name: 'Science', icon: '🔬', color: '#059669', sortOrder: 2 },
      { name: 'English', icon: '📝', color: '#7c3aed', sortOrder: 3 },
      { name: 'Computer', icon: '💻', color: '#0891b2', sortOrder: 4 },
      { name: 'Test Prep', icon: '🎯', color: '#dc2626', sortOrder: 5 },
    ],
    products: [
      // Mathematics (catIdx: 0)
      { name: 'Class 10 Math Tuition', price: 2500, costPrice: 800, sku: 'MTH-001', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Monthly Class 10 mathematics tuition', catIdx: 0 },
      { name: 'Class 12 Math Tuition', price: 3000, costPrice: 1000, sku: 'MTH-002', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Monthly Class 12 mathematics tuition', catIdx: 0 },
      { name: 'Vedic Maths Course', price: 2000, costPrice: 600, sku: 'MTH-003', stock: 999, lowStockAlert: 1, unit: 'course', description: 'Vedic maths speed calculation course', catIdx: 0 },
      // Science (catIdx: 1)
      { name: 'NEET Biology', price: 4000, costPrice: 1200, sku: 'SCI-001', stock: 999, lowStockAlert: 1, unit: 'month', description: 'NEET Biology preparation - monthly', catIdx: 1 },
      { name: 'JEE Physics', price: 3500, costPrice: 1100, sku: 'SCI-002', stock: 999, lowStockAlert: 1, unit: 'month', description: 'JEE Physics preparation - monthly', catIdx: 1 },
      { name: 'JEE Chemistry', price: 3500, costPrice: 1100, sku: 'SCI-003', stock: 999, lowStockAlert: 1, unit: 'month', description: 'JEE Chemistry preparation - monthly', catIdx: 1 },
      { name: 'NEET Chemistry', price: 3500, costPrice: 1100, sku: 'SCI-004', stock: 999, lowStockAlert: 1, unit: 'month', description: 'NEET Chemistry preparation - monthly', catIdx: 1 },
      // English (catIdx: 2)
      { name: 'Spoken English', price: 2000, costPrice: 600, sku: 'ENG-001', stock: 999, lowStockAlert: 1, unit: 'course', description: 'Spoken English course - 3 months', catIdx: 2 },
      { name: 'IELTS Preparation', price: 8000, costPrice: 3000, sku: 'ENG-002', stock: 999, lowStockAlert: 1, unit: 'course', description: 'IELTS exam preparation course', catIdx: 2 },
      { name: 'Grammar & Writing', price: 1500, costPrice: 450, sku: 'ENG-003', stock: 999, lowStockAlert: 1, unit: 'course', description: 'English grammar and creative writing', catIdx: 2 },
      // Computer (catIdx: 3)
      { name: 'Python Programming', price: 6000, costPrice: 2000, sku: 'CMP-001', stock: 999, lowStockAlert: 1, unit: 'course', description: 'Python programming for beginners', catIdx: 3 },
      { name: 'Web Development', price: 10000, costPrice: 3500, sku: 'CMP-002', stock: 999, lowStockAlert: 1, unit: 'course', description: 'Full-stack web development course', catIdx: 3 },
      { name: 'Tally & Accounting', price: 4000, costPrice: 1200, sku: 'CMP-003', stock: 999, lowStockAlert: 1, unit: 'course', description: 'Tally accounting software course', catIdx: 3 },
      // Test Prep (catIdx: 4)
      { name: 'JEE Foundation (2yr)', price: 25000, costPrice: 8000, sku: 'TP-001', stock: 999, lowStockAlert: 1, unit: 'course', description: '2-year JEE foundation program', catIdx: 4 },
      { name: 'NEET Crash Course', price: 15000, costPrice: 5000, sku: 'TP-002', stock: 999, lowStockAlert: 1, unit: 'course', description: 'NEET intensive crash course', catIdx: 4 },
      { name: 'Olympiad Prep', price: 3000, costPrice: 900, sku: 'TP-003', stock: 999, lowStockAlert: 1, unit: 'course', description: 'Science and Math Olympiad preparation', catIdx: 4 },
      { name: 'CUET Preparation', price: 8000, costPrice: 2500, sku: 'TP-004', stock: 999, lowStockAlert: 1, unit: 'course', description: 'CUET entrance exam preparation', catIdx: 4 },
    ],
    staff: [
      { name: 'Prof. Ramesh Iyer', phone: '9712345678', role: 'admin', shiftStart: '08:00', shiftEnd: '18:00', salary: 0, commission: 0, isActive: true },
      { name: 'Sneha Deshmukh', phone: '9723456789', role: 'staff', shiftStart: '08:00', shiftEnd: '14:00', salary: 18000, commission: 5, isActive: true },
      { name: 'Rajesh Kulkarni', phone: '9734567890', role: 'staff', shiftStart: '14:00', shiftEnd: '20:00', salary: 18000, commission: 5, isActive: true },
      { name: 'Megha Patil', phone: '9745678901', role: 'cashier', shiftStart: '09:00', shiftEnd: '17:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Dr. Anil Verma', phone: '9756789012', role: 'staff', shiftStart: '08:00', shiftEnd: '14:00', salary: 22000, commission: 8, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const studentDefs = [
        { name: 'Arjun Sharma', phone: '9812345678', email: 'arjun.s@gmail.com', course: 'JEE Physics', batch: 'Morning', status: 'active', feeTotal: 3500, feePaid: 3500 },
        { name: 'Priya Desai', phone: '9823456789', email: 'priya.d@gmail.com', course: 'NEET Biology', batch: 'Afternoon', status: 'active', feeTotal: 4000, feePaid: 4000 },
        { name: 'Rohan Kulkarni', phone: '9834567890', email: 'rohan.k@gmail.com', course: 'Class 10 Math Tuition', batch: 'Morning', status: 'active', feeTotal: 2500, feePaid: 1250 },
        { name: 'Ananya Joshi', phone: '9845678901', email: 'ananya.j@gmail.com', course: 'Web Development', batch: 'Evening', status: 'active', feeTotal: 10000, feePaid: 10000 },
        { name: 'Vikram Patel', phone: '9856789012', email: 'vikram.p@gmail.com', course: 'Python Programming', batch: 'Weekend', status: 'active', feeTotal: 6000, feePaid: 3000 },
        { name: 'Sneha Reddy', phone: '9867890123', email: 'sneha.r@gmail.com', course: 'NEET Chemistry', batch: 'Afternoon', status: 'active', feeTotal: 3500, feePaid: 3500 },
        { name: 'Karan Mehta', phone: '9878901234', email: 'karan.m@gmail.com', course: 'JEE Foundation (2yr)', batch: 'Morning', status: 'active', feeTotal: 25000, feePaid: 12500 },
        { name: 'Divya Nair', phone: '9889012345', email: 'divya.n@gmail.com', course: 'Spoken English', batch: 'Evening', status: 'active', feeTotal: 2000, feePaid: 2000 },
      ];
      for (const s of studentDefs) {
        await db.student.create({
          data: { storeId, name: s.name, phone: s.phone, email: s.email, course: s.course, batch: s.batch, status: s.status, feeTotal: s.feeTotal, feePaid: s.feePaid },
        });
      }
    },
  },

  clinic: {
    storeName: 'HealthFirst Clinic',
    ownerName: 'Dr. Kavita Mehta',
    niche: 'clinic',
    template: 'clinic-care',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '9876543210',
    address: '78 SV Road, Andheri West',
    email: 'info@healthfirstclinic.in',
    gstNumber: '27AABCU9603R1ZS',
    taxRate: 0.0,
    receiptHeader: 'HealthFirst Clinic - Your Health, Our Priority',
    receiptFooter: 'Thank you! Follow prescription carefully. Get well soon!',
    categories: [
      { name: 'Consultation', icon: '🩺', color: '#dc2626', sortOrder: 1 },
      { name: 'Lab Tests', icon: '🔬', color: '#0891b2', sortOrder: 2 },
      { name: 'Pharmacy', icon: '💊', color: '#059669', sortOrder: 3 },
      { name: 'Procedures', icon: '🏥', color: '#7c3aed', sortOrder: 4 },
      { name: 'Vaccination', icon: '💉', color: '#d97706', sortOrder: 5 },
    ],
    products: [
      // Consultation (catIdx: 0)
      { name: 'General Consultation', price: 500, costPrice: 0, sku: 'CON-001', stock: 999, lowStockAlert: 1, unit: 'visit', description: 'General OPD consultation', catIdx: 0 },
      { name: 'Specialist Consultation', price: 1000, costPrice: 0, sku: 'CON-002', stock: 999, lowStockAlert: 1, unit: 'visit', description: 'Specialist doctor consultation', catIdx: 0 },
      { name: 'Follow-up Visit', price: 300, costPrice: 0, sku: 'CON-003', stock: 999, lowStockAlert: 1, unit: 'visit', description: 'Follow-up consultation within 7 days', catIdx: 0 },
      { name: 'Teleconsultation', price: 400, costPrice: 0, sku: 'CON-004', stock: 999, lowStockAlert: 1, unit: 'visit', description: 'Video consultation with doctor', catIdx: 0 },
      // Lab Tests (catIdx: 1)
      { name: 'Blood Test (CBC)', price: 350, costPrice: 120, sku: 'LAB-001', stock: 999, lowStockAlert: 1, unit: 'test', description: 'Complete blood count test', catIdx: 1 },
      { name: 'X-Ray', price: 800, costPrice: 300, sku: 'LAB-002', stock: 999, lowStockAlert: 1, unit: 'test', description: 'Digital X-ray imaging', catIdx: 1 },
      { name: 'ECG', price: 400, costPrice: 150, sku: 'LAB-003', stock: 999, lowStockAlert: 1, unit: 'test', description: 'Electrocardiogram', catIdx: 1 },
      { name: 'Ultrasound', price: 1200, costPrice: 500, sku: 'LAB-004', stock: 999, lowStockAlert: 1, unit: 'test', description: 'Ultrasound imaging', catIdx: 1 },
      { name: 'Thyroid Panel', price: 600, costPrice: 220, sku: 'LAB-005', stock: 999, lowStockAlert: 1, unit: 'test', description: 'Thyroid function test panel', catIdx: 1 },
      // Pharmacy (catIdx: 2)
      { name: 'Paracetamol (10 tab)', price: 25, costPrice: 10, sku: 'PHR-001', stock: 500, lowStockAlert: 50, unit: 'strip', description: 'Paracetamol 500mg tablets', catIdx: 2 },
      { name: 'Cough Syrup (100ml)', price: 85, costPrice: 35, sku: 'PHR-002', stock: 100, lowStockAlert: 15, unit: 'bottle', description: 'Cough relief syrup', catIdx: 2 },
      { name: 'Antacid (15 tab)', price: 30, costPrice: 12, sku: 'PHR-003', stock: 200, lowStockAlert: 20, unit: 'strip', description: 'Antacid tablets for acidity', catIdx: 2 },
      { name: 'ORS Sachets (5 pack)', price: 25, costPrice: 10, sku: 'PHR-004', stock: 150, lowStockAlert: 20, unit: 'pack', description: 'Oral rehydration salts', catIdx: 2 },
      // Procedures (catIdx: 3)
      { name: 'Wound Dressing', price: 200, costPrice: 60, sku: 'PRC-001', stock: 999, lowStockAlert: 1, unit: 'procedure', description: 'Wound cleaning and dressing', catIdx: 3 },
      { name: 'Stitch Removal', price: 150, costPrice: 30, sku: 'PRC-002', stock: 999, lowStockAlert: 1, unit: 'procedure', description: 'Suture removal procedure', catIdx: 3 },
      { name: 'Nebulization', price: 250, costPrice: 80, sku: 'PRC-003', stock: 999, lowStockAlert: 1, unit: 'session', description: 'Nebulizer treatment for breathing', catIdx: 3 },
      { name: 'Health Checkup', price: 2500, costPrice: 1000, sku: 'PRC-004', stock: 999, lowStockAlert: 1, unit: 'package', description: 'Comprehensive health checkup package', catIdx: 3 },
      // Vaccination (catIdx: 4)
      { name: 'COVID Vaccine', price: 0, costPrice: 0, sku: 'VAC-001', stock: 999, lowStockAlert: 1, unit: 'dose', description: 'COVID-19 vaccination - free', catIdx: 4 },
      { name: 'Flu Shot', price: 500, costPrice: 200, sku: 'VAC-002', stock: 50, lowStockAlert: 10, unit: 'dose', description: 'Seasonal influenza vaccine', catIdx: 4 },
      { name: 'Hepatitis B Vaccine', price: 800, costPrice: 350, sku: 'VAC-003', stock: 30, lowStockAlert: 8, unit: 'dose', description: 'Hepatitis B vaccination', catIdx: 4 },
      { name: 'Typhoid Vaccine', price: 350, costPrice: 140, sku: 'VAC-004', stock: 40, lowStockAlert: 8, unit: 'dose', description: 'Typhoid fever vaccination', catIdx: 4 },
    ],
    staff: [
      { name: 'Dr. Kavita Mehta', phone: '9712345678', role: 'admin', shiftStart: '09:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Dr. Suresh Patil', phone: '9723456789', role: 'staff', shiftStart: '09:00', shiftEnd: '17:00', salary: 45000, commission: 0, isActive: true },
      { name: 'Rajesh Naik', phone: '9734567890', role: 'staff', shiftStart: '09:00', shiftEnd: '17:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Sunita Devi', phone: '9745678901', role: 'cashier', shiftStart: '09:00', shiftEnd: '21:00', salary: 13000, commission: 0, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const apptDefs = [
        { customerName: 'Rajesh Kumar', customerPhone: '9812345678', service: 'General Consultation', staffName: 'Dr. Kavita Mehta', date: new Date(Date.now() + 1 * 60 * 60 * 1000), duration: 15, status: 'scheduled' },
        { customerName: 'Sunita Devi', customerPhone: '9823456789', service: 'Health Checkup', staffName: 'Dr. Suresh Patil', date: new Date(Date.now() + 2 * 60 * 60 * 1000), duration: 60, status: 'scheduled' },
        { customerName: 'Mohan Lal', customerPhone: '9834567890', service: 'Blood Test (CBC)', staffName: 'Rajesh Naik', date: new Date(Date.now() + 30 * 60 * 1000), duration: 15, status: 'scheduled' },
        { customerName: 'Anita Sharma', customerPhone: '9845678901', service: 'ECG', staffName: 'Dr. Kavita Mehta', date: new Date(Date.now() + 3 * 60 * 60 * 1000), duration: 20, status: 'scheduled' },
        { customerName: 'Pradeep Joshi', customerPhone: '9856789012', service: 'X-Ray', staffName: 'Rajesh Naik', date: new Date(Date.now() + 4 * 60 * 60 * 1000), duration: 20, status: 'scheduled' },
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
    template: 'garage-pro',
    city: 'Ludhiana',
    state: 'Punjab',
    phone: '9876543210',
    address: '23 GT Road, Miller Ganj',
    email: 'info@singhautoworks.in',
    gstNumber: '03AABCU9603R1ZT',
    taxRate: 18.0,
    receiptHeader: 'Singh Auto Works - Complete Car Care',
    receiptFooter: 'Thank you! Drive safe!',
    categories: [
      { name: 'Service', icon: '🔧', color: '#475569', sortOrder: 1 },
      { name: 'Repair', icon: '🛠️', color: '#dc2626', sortOrder: 2 },
      { name: 'Parts', icon: '⚙️', color: '#d97706', sortOrder: 3 },
      { name: 'Wash', icon: '🧽', color: '#0891b2', sortOrder: 4 },
      { name: 'Accessories', icon: '✨', color: '#7c3aed', sortOrder: 5 },
    ],
    products: [
      // Service (catIdx: 0)
      { name: 'Oil Change', price: 500, costPrice: 200, sku: 'SVC-001', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Engine oil change with filter replacement', catIdx: 0 },
      { name: 'Wheel Alignment', price: 400, costPrice: 150, sku: 'SVC-002', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Computerized wheel alignment', catIdx: 0 },
      { name: 'AC Service', price: 1200, costPrice: 450, sku: 'SVC-003', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Car AC gas refill and service', catIdx: 0 },
      { name: 'Tire Rotation', price: 300, costPrice: 100, sku: 'SVC-004', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Tire rotation and balancing', catIdx: 0 },
      { name: 'Battery Check', price: 0, costPrice: 0, sku: 'SVC-005', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Free battery health checkup', catIdx: 0 },
      // Repair (catIdx: 1)
      { name: 'Brake Pad Replacement', price: 1500, costPrice: 600, sku: 'REP-001', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Front brake pad replacement', catIdx: 1 },
      { name: 'Clutch Repair', price: 3500, costPrice: 1500, sku: 'REP-002', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Clutch plate replacement and repair', catIdx: 1 },
      { name: 'Engine Repair', price: 5000, costPrice: 2000, sku: 'REP-003', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Engine diagnostics and repair', catIdx: 1 },
      { name: 'Dent Repair', price: 2000, costPrice: 800, sku: 'REP-004', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Paintless dent removal', catIdx: 1 },
      // Parts (catIdx: 2)
      { name: 'Car Battery', price: 3500, costPrice: 2000, sku: 'PRT-001', stock: 12, lowStockAlert: 3, unit: 'piece', description: '12V maintenance-free car battery', catIdx: 2 },
      { name: 'Brake Pads (Set)', price: 1200, costPrice: 600, sku: 'PRT-002', stock: 20, lowStockAlert: 5, unit: 'set', description: 'Front brake pads set', catIdx: 2 },
      { name: 'Headlight Assembly', price: 800, costPrice: 350, sku: 'PRT-003', stock: 8, lowStockAlert: 3, unit: 'piece', description: 'Halogen headlight assembly', catIdx: 2 },
      { name: 'Wiper Blades (Pair)', price: 450, costPrice: 180, sku: 'PRT-004', stock: 25, lowStockAlert: 5, unit: 'pair', description: 'Universal wiper blade pair', catIdx: 2 },
      { name: 'Air Filter', price: 350, costPrice: 140, sku: 'PRT-005', stock: 15, lowStockAlert: 4, unit: 'piece', description: 'Engine air filter', catIdx: 2 },
      // Wash (catIdx: 3)
      { name: 'Car Wash', price: 300, costPrice: 80, sku: 'WSH-001', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Exterior car wash with wax', catIdx: 3 },
      { name: 'Interior Cleaning', price: 500, costPrice: 150, sku: 'WSH-002', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Full interior vacuum and cleaning', catIdx: 3 },
      { name: 'Detailing', price: 2500, costPrice: 1000, sku: 'WSH-003', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Full interior + exterior detailing', catIdx: 3 },
      // Accessories (catIdx: 4)
      { name: 'Car Perfume', price: 250, costPrice: 80, sku: 'ACC-001', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Car air freshener - assorted', catIdx: 4 },
      { name: 'Floor Mats', price: 800, costPrice: 300, sku: 'ACC-002', stock: 15, lowStockAlert: 3, unit: 'set', description: 'Universal rubber floor mats set', catIdx: 4 },
      { name: 'Seat Covers', price: 2500, costPrice: 1000, sku: 'ACC-003', stock: 8, lowStockAlert: 2, unit: 'set', description: 'Premium leather seat covers', catIdx: 4 },
    ],
    staff: [
      { name: 'Harpreet Singh', phone: '9712345678', role: 'admin', shiftStart: '08:00', shiftEnd: '20:00', salary: 0, commission: 0, isActive: true },
      { name: 'Gurpreet Singh', phone: '9723456789', role: 'staff', shiftStart: '08:00', shiftEnd: '18:00', salary: 15000, commission: 5, isActive: true },
      { name: 'Raju Verma', phone: '9734567890', role: 'staff', shiftStart: '08:00', shiftEnd: '18:00', salary: 14000, commission: 5, isActive: true },
      { name: 'Mukesh Yadav', phone: '9745678901', role: 'cashier', shiftStart: '09:00', shiftEnd: '20:00', salary: 12000, commission: 0, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const vehicleDefs = [
        { ownerName: 'Rahul Verma', ownerPhone: '9812345678', make: 'Maruti', model: 'Swift', registrationNumber: 'PB10 AB 1234', year: 2022 },
        { ownerName: 'Priya Patel', ownerPhone: '9823456789', make: 'Hyundai', model: 'Creta', registrationNumber: 'PB10 CD 5678', year: 2023 },
        { ownerName: 'Amit Kumar', ownerPhone: '9834567890', make: 'Tata', model: 'Nexon', registrationNumber: 'PB10 EF 9012', year: 2021 },
        { ownerName: 'Neha Shah', ownerPhone: '9845678901', make: 'Mahindra', model: 'XUV700', registrationNumber: 'PB10 GH 3456', year: 2024 },
      ];
      for (const v of vehicleDefs) {
        await db.vehicle.create({
          data: { storeId, ownerName: v.ownerName, ownerPhone: v.ownerPhone, make: v.make, model: v.model, registrationNumber: v.registrationNumber, year: v.year },
        });
      }
    },
  },

  bakery: {
    storeName: 'Sweet Cravings Bakery',
    ownerName: 'Rahul Khanna',
    niche: 'bakery',
    template: 'bake-warm',
    city: 'Jaipur',
    state: 'Rajasthan',
    phone: '9876543210',
    address: '12 MI Road, Lal Kothi',
    email: 'info@sweetcravings.in',
    gstNumber: '08AABCU9603R1ZU',
    taxRate: 5.0,
    receiptHeader: 'Sweet Cravings Bakery - Fresh & Delicious',
    receiptFooter: 'Thank you! Fresh baked daily 🧁',
    categories: [
      { name: 'Cakes', icon: '🎂', color: '#dc2626', sortOrder: 1 },
      { name: 'Pastries', icon: '🥐', color: '#f97316', sortOrder: 2 },
      { name: 'Breads', icon: '🍞', color: '#d97706', sortOrder: 3 },
      { name: 'Cookies', icon: '🍪', color: '#059669', sortOrder: 4 },
      { name: 'Beverages', icon: '☕', color: '#7c3aed', sortOrder: 5 },
    ],
    products: [
      // Cakes (catIdx: 0) - low stock (fresh daily items)
      { name: 'Black Forest Cake (1 kg)', price: 800, costPrice: 350, sku: 'CKE-001', stock: 5, lowStockAlert: 2, unit: 'piece', description: 'Classic black forest with whipped cream and cherries', catIdx: 0 },
      { name: 'Red Velvet Cake (1 kg)', price: 950, costPrice: 400, sku: 'CKE-002', stock: 4, lowStockAlert: 2, unit: 'piece', description: 'Red velvet with cream cheese frosting', catIdx: 0 },
      { name: 'Chocolate Truffle Cake (1 kg)', price: 1100, costPrice: 480, sku: 'CKE-003', stock: 3, lowStockAlert: 2, unit: 'piece', description: 'Rich chocolate truffle cake with ganache', catIdx: 0 },
      { name: 'Butterscotch Cake (1 kg)', price: 700, costPrice: 300, sku: 'CKE-004', stock: 5, lowStockAlert: 2, unit: 'piece', description: 'Butterscotch crunch cake with caramel', catIdx: 0 },
      { name: 'Pineapple Cake (1 kg)', price: 650, costPrice: 280, sku: 'CKE-005', stock: 4, lowStockAlert: 2, unit: 'piece', description: 'Pineapple cake with whipped cream', catIdx: 0 },
      // Pastries (catIdx: 1) - low stock (fresh daily)
      { name: 'Blueberry Pastry', price: 120, costPrice: 45, sku: 'PST-001', stock: 15, lowStockAlert: 5, unit: 'piece', description: 'Blueberry filled pastry with cream', catIdx: 1 },
      { name: 'Pineapple Pastry', price: 100, costPrice: 38, sku: 'PST-002', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Pineapple pastry with whipped cream', catIdx: 1 },
      { name: 'Croissant', price: 80, costPrice: 28, sku: 'PST-003', stock: 2, lowStockAlert: 5, unit: 'piece', description: 'Buttery flaky French croissant', catIdx: 1 },
      { name: 'Eclair', price: 90, costPrice: 32, sku: 'PST-004', stock: 18, lowStockAlert: 5, unit: 'piece', description: 'Chocolate eclair with cream filling', catIdx: 1 },
      // Breads (catIdx: 2) - fresh daily, some low stock
      { name: 'Garlic Bread', price: 60, costPrice: 22, sku: 'BRD-001', stock: 25, lowStockAlert: 8, unit: 'piece', description: 'Freshly baked garlic bread', catIdx: 2 },
      { name: 'Whole Wheat Bread (400g)', price: 50, costPrice: 20, sku: 'BRD-002', stock: 30, lowStockAlert: 10, unit: 'piece', description: '100% whole wheat bread loaf', catIdx: 2 },
      { name: 'Pita Bread (6 pack)', price: 40, costPrice: 15, sku: 'BRD-003', stock: 3, lowStockAlert: 8, unit: 'pack', description: 'Soft pita bread for wraps', catIdx: 2 },
      // Cookies (catIdx: 3)
      { name: 'Chocolate Cookie', price: 30, costPrice: 10, sku: 'CKI-001', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Chocolate chip cookie', catIdx: 3 },
      { name: 'Oat Cookie', price: 35, costPrice: 12, sku: 'CKI-002', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Healthy oat and raisin cookie', catIdx: 3 },
      { name: 'Macarons (6pc)', price: 300, costPrice: 120, sku: 'CKI-003', stock: 10, lowStockAlert: 3, unit: 'box', description: 'Assorted French macarons box of 6', catIdx: 3 },
      { name: 'Brownie', price: 80, costPrice: 28, sku: 'CKI-004', stock: 2, lowStockAlert: 5, unit: 'piece', description: 'Fudgy chocolate walnut brownie', catIdx: 3 },
      // Beverages (catIdx: 4)
      { name: 'Coffee (Cappuccino)', price: 120, costPrice: 40, sku: 'BVG-001', stock: 999, lowStockAlert: 1, unit: 'cup', description: 'Hot cappuccino coffee', catIdx: 4 },
      { name: 'Cold Coffee', price: 150, costPrice: 55, sku: 'BVG-002', stock: 999, lowStockAlert: 1, unit: 'glass', description: 'Iced coffee with ice cream', catIdx: 4 },
      { name: 'Masala Chai', price: 40, costPrice: 10, sku: 'BVG-003', stock: 999, lowStockAlert: 1, unit: 'cup', description: 'Indian spiced tea', catIdx: 4 },
      { name: 'Smoothie', price: 180, costPrice: 65, sku: 'BVG-004', stock: 999, lowStockAlert: 1, unit: 'glass', description: 'Fresh fruit smoothie', catIdx: 4 },
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
    ownerName: 'Suresh Patel',
    niche: 'wholesale',
    template: 'wholesale-bulk',
    city: 'Ahmedabad',
    state: 'Gujarat',
    phone: '9876543210',
    address: '23 Ring Road, Varachha',
    email: 'info@pateldistributors.in',
    gstNumber: '24AABCU9603R1ZV',
    taxRate: 18.0,
    receiptHeader: 'Patel Distributors - Wholesale Deals Daily',
    receiptFooter: 'Thank you for your business! Terms: 30 days credit.',
    categories: [
      { name: 'FMCG', icon: '🛒', color: '#d97706', sortOrder: 1 },
      { name: 'Beverages', icon: '🥤', color: '#dc2626', sortOrder: 2 },
      { name: 'Snacks', icon: '🍪', color: '#7c3aed', sortOrder: 3 },
      { name: 'Personal Care', icon: '🧴', color: '#0891b2', sortOrder: 4 },
      { name: 'Household', icon: '🏠', color: '#059669', sortOrder: 5 },
    ],
    products: [
      // FMCG (catIdx: 0)
      { name: 'Parle-G Biscuit (Case)', price: 480, costPrice: 380, sku: 'FMCG-001', stock: 100, lowStockAlert: 10, unit: 'case', description: 'Parle-G biscuit case pack - 72 packs', catIdx: 0 },
      { name: 'Maggi Noodles (Box)', price: 720, costPrice: 560, sku: 'FMCG-002', stock: 80, lowStockAlert: 8, unit: 'box', description: 'Maggi 2-min noodles box - 48 packs', catIdx: 0 },
      { name: 'Aashirvaad Atta (10kg)', price: 450, costPrice: 350, sku: 'FMCG-003', stock: 60, lowStockAlert: 8, unit: 'bag', description: 'Aashirvaad whole wheat atta 10kg', catIdx: 0 },
      { name: 'Tata Salt (1kg, Case)', price: 350, costPrice: 270, sku: 'FMCG-004', stock: 50, lowStockAlert: 8, unit: 'case', description: 'Tata salt case - 24 packs', catIdx: 0 },
      { name: 'Fortune Oil (1L, Case)', price: 1800, costPrice: 1400, sku: 'FMCG-005', stock: 40, lowStockAlert: 5, unit: 'case', description: 'Fortune sunflower oil case - 12 bottles', catIdx: 0 },
      // Beverages (catIdx: 1)
      { name: 'Coca-Cola 2L (Case)', price: 600, costPrice: 460, sku: 'BEV-001', stock: 70, lowStockAlert: 8, unit: 'case', description: 'Coca-Cola 2L case - 6 bottles', catIdx: 1 },
      { name: 'Pepsi 2L (Case)', price: 580, costPrice: 440, sku: 'BEV-002', stock: 65, lowStockAlert: 8, unit: 'case', description: 'Pepsi 2L case - 6 bottles', catIdx: 1 },
      { name: 'Amul Milk 500ml (Box)', price: 400, costPrice: 310, sku: 'BEV-003', stock: 30, lowStockAlert: 5, unit: 'box', description: 'Amul Taaza milk box - 32 packs', catIdx: 1 },
      { name: 'Paper Boat Drinks (Box)', price: 720, costPrice: 540, sku: 'BEV-004', stock: 25, lowStockAlert: 5, unit: 'box', description: 'Paper Boat assorted drinks - 24 packs', catIdx: 1 },
      // Snacks (catIdx: 2)
      { name: 'Lays Chips (Box)', price: 480, costPrice: 360, sku: 'SNK-001', stock: 90, lowStockAlert: 10, unit: 'box', description: 'Lays chips box - 48 packs', catIdx: 2 },
      { name: 'Kurkure (Box)', price: 420, costPrice: 320, sku: 'SNK-002', stock: 75, lowStockAlert: 8, unit: 'box', description: 'Kurkure box - 48 packs', catIdx: 2 },
      { name: 'Britannia Bourbon (Case)', price: 540, costPrice: 410, sku: 'SNK-003', stock: 50, lowStockAlert: 8, unit: 'case', description: 'Britannia Bourbon case - 36 packs', catIdx: 2 },
      { name: 'Haldiram Bhujia (5kg)', price: 1200, costPrice: 900, sku: 'SNK-004', stock: 35, lowStockAlert: 5, unit: 'pack', description: 'Haldiram Aloo Bhujia 5kg bulk', catIdx: 2 },
      // Personal Care (catIdx: 3)
      { name: 'Colgate Toothpaste (Case)', price: 800, costPrice: 600, sku: 'PC-001', stock: 45, lowStockAlert: 6, unit: 'case', description: 'Colgate MaxFresh case - 24 tubes', catIdx: 3 },
      { name: 'Dettol Soap (Box)', price: 650, costPrice: 490, sku: 'PC-002', stock: 50, lowStockAlert: 8, unit: 'box', description: 'Dettol soap box - 48 bars', catIdx: 3 },
      { name: 'Clinic Plus Shampoo (Case)', price: 900, costPrice: 680, sku: 'PC-003', stock: 30, lowStockAlert: 5, unit: 'case', description: 'Clinic Plus shampoo case - 24 bottles', catIdx: 3 },
      // Household (catIdx: 4)
      { name: 'Surf Excel (10kg)', price: 1200, costPrice: 920, sku: 'HH-001', stock: 40, lowStockAlert: 5, unit: 'bag', description: 'Surf Excel detergent 10kg', catIdx: 4 },
      { name: 'Vim Dishwash (5L)', price: 450, costPrice: 340, sku: 'HH-002', stock: 35, lowStockAlert: 5, unit: 'can', description: 'Vim dishwash liquid 5L', catIdx: 4 },
      { name: 'Harpic (2L, Case)', price: 600, costPrice: 450, sku: 'HH-003', stock: 25, lowStockAlert: 4, unit: 'case', description: 'Harpic toilet cleaner case - 6 bottles', catIdx: 4 },
    ],
    staff: [
      { name: 'Suresh Patel', phone: '9712345678', role: 'admin', shiftStart: '07:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Dharmesh Shah', phone: '9723456789', role: 'manager', shiftStart: '07:00', shiftEnd: '19:00', salary: 22000, commission: 2, isActive: true },
      { name: 'Hitesh Joshi', phone: '9734567890', role: 'cashier', shiftStart: '07:00', shiftEnd: '15:00', salary: 14000, commission: 0, isActive: true },
      { name: 'Amit Desai', phone: '9745678901', role: 'staff', shiftStart: '07:00', shiftEnd: '19:00', salary: 12000, commission: 1, isActive: true },
      { name: 'Ravi Patel', phone: '9756789012', role: 'cashier', shiftStart: '15:00', shiftEnd: '21:00', salary: 13000, commission: 0, isActive: true },
    ],
  },

  jewellery: {
    storeName: 'Kundan Jewellers',
    ownerName: 'Rajesh Soni',
    niche: 'jewellery',
    template: 'jewel-elegant',
    city: 'Jaipur',
    state: 'Rajasthan',
    phone: '9876543210',
    address: '45 Johari Bazaar, Pink City',
    email: 'info@kundanjewellers.in',
    gstNumber: '08AABCU9603R1ZW',
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
      // Gold (catIdx: 0)
      { name: '22K Gold Chain', price: 45000, costPrice: 40000, sku: 'GLD-001', stock: 12, lowStockAlert: 3, unit: 'piece', description: '22K gold chain - 10 grams', catIdx: 0 },
      { name: '22K Gold Ring', price: 28000, costPrice: 24500, sku: 'GLD-002', stock: 18, lowStockAlert: 4, unit: 'piece', description: '22K gold ring - 6 grams', catIdx: 0 },
      { name: '22K Gold Earrings', price: 18000, costPrice: 15500, sku: 'GLD-003', stock: 22, lowStockAlert: 5, unit: 'pair', description: '22K gold earrings - 4 grams', catIdx: 0 },
      { name: '22K Gold Bangle', price: 55000, costPrice: 48000, sku: 'GLD-004', stock: 8, lowStockAlert: 2, unit: 'piece', description: '22K gold bangle - 12 grams', catIdx: 0 },
      { name: '22K Gold Necklace', price: 95000, costPrice: 83000, sku: 'GLD-005', stock: 5, lowStockAlert: 2, unit: 'piece', description: '22K gold necklace set - 20 grams', catIdx: 0 },
      // Silver (catIdx: 1)
      { name: 'Silver Chain', price: 3000, costPrice: 2000, sku: 'SLV-001', stock: 20, lowStockAlert: 4, unit: 'piece', description: '925 sterling silver chain', catIdx: 1 },
      { name: 'Silver Anklet', price: 3500, costPrice: 2300, sku: 'SLV-002', stock: 15, lowStockAlert: 3, unit: 'pair', description: 'Silver anklet pair - traditional design', catIdx: 1 },
      { name: 'Silver Ring', price: 2000, costPrice: 1300, sku: 'SLV-003', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Sterling silver ring', catIdx: 1 },
      { name: 'Silver Bracelet', price: 4500, costPrice: 3000, sku: 'SLV-004', stock: 12, lowStockAlert: 3, unit: 'piece', description: 'Oxidized silver bracelet', catIdx: 1 },
      // Diamond (catIdx: 2)
      { name: 'Diamond Ring', price: 85000, costPrice: 60000, sku: 'DIA-001', stock: 6, lowStockAlert: 2, unit: 'piece', description: 'Diamond solitaire ring in 18K gold', catIdx: 2 },
      { name: 'Diamond Earrings', price: 65000, costPrice: 45000, sku: 'DIA-002', stock: 8, lowStockAlert: 2, unit: 'pair', description: 'Diamond stud earrings in 18K gold', catIdx: 2 },
      { name: 'Diamond Pendant', price: 55000, costPrice: 38000, sku: 'DIA-003', stock: 4, lowStockAlert: 2, unit: 'piece', description: 'Diamond pendant with 18K gold chain', catIdx: 2 },
      { name: 'Diamond Nose Pin', price: 18000, costPrice: 12000, sku: 'DIA-004', stock: 10, lowStockAlert: 3, unit: 'piece', description: 'Diamond nose pin in 18K gold', catIdx: 2 },
      // Platinum (catIdx: 3)
      { name: 'Platinum Band', price: 45000, costPrice: 35000, sku: 'PLT-001', stock: 5, lowStockAlert: 2, unit: 'piece', description: 'Platinum wedding band', catIdx: 3 },
      { name: 'Platinum Ring', price: 60000, costPrice: 47000, sku: 'PLT-002', stock: 3, lowStockAlert: 2, unit: 'piece', description: 'Platinum diamond ring', catIdx: 3 },
      // Coins (catIdx: 4)
      { name: 'Gold Coin 1g', price: 7200, costPrice: 6500, sku: 'COIN-001', stock: 50, lowStockAlert: 10, unit: 'piece', description: '24K pure gold coin 1 gram', catIdx: 4 },
      { name: 'Gold Coin 5g', price: 35000, costPrice: 31500, sku: 'COIN-002', stock: 20, lowStockAlert: 5, unit: 'piece', description: '24K pure gold coin 5 grams', catIdx: 4 },
      { name: 'Silver Coin 10g', price: 800, costPrice: 550, sku: 'COIN-003', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Pure silver coin 10 grams', catIdx: 4 },
      { name: 'Gold Coin 10g', price: 68000, costPrice: 62000, sku: 'COIN-004', stock: 10, lowStockAlert: 3, unit: 'piece', description: '24K pure gold coin 10 grams', catIdx: 4 },
    ],
    staff: [
      { name: 'Rajesh Soni', phone: '9712345678', role: 'admin', shiftStart: '10:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Mohan Lal', phone: '9723456789', role: 'manager', shiftStart: '10:00', shiftEnd: '21:00', salary: 25000, commission: 3, isActive: true },
      { name: 'Suresh Verma', phone: '9734567890', role: 'staff', shiftStart: '10:00', shiftEnd: '18:00', salary: 16000, commission: 2, isActive: true },
      { name: 'Rekha Devi', phone: '9745678901', role: 'cashier', shiftStart: '10:00', shiftEnd: '21:00', salary: 14000, commission: 0, isActive: true },
    ],
  },

  gym: {
    storeName: 'Iron Forge Gym',
    ownerName: 'Suresh Reddy',
    niche: 'gym',
    template: 'gym-bold',
    city: 'Pune',
    state: 'Maharashtra',
    phone: '9876543210',
    address: '45 Koregaon Park, Lane 5',
    email: 'info@ironforgegym.in',
    gstNumber: '27AABCU9603R1ZX',
    taxRate: 18.0,
    receiptHeader: 'Iron Forge Gym - Transform Your Body',
    receiptFooter: 'Thank you! Stay fit, stay healthy 💪',
    categories: [
      { name: 'Memberships', icon: '🏋️', color: '#65a30d', sortOrder: 1 },
      { name: 'Personal Training', icon: '🥊', color: '#dc2626', sortOrder: 2 },
      { name: 'Supplements', icon: '🥤', color: '#0891b2', sortOrder: 3 },
      { name: 'Merchandise', icon: '👕', color: '#f97316', sortOrder: 4 },
      { name: 'Equipment Rental', icon: '🔩', color: '#7c3aed', sortOrder: 5 },
    ],
    products: [
      // Memberships (catIdx: 0)
      { name: 'Monthly Membership', price: 2000, costPrice: 0, sku: 'MEM-001', stock: 999, lowStockAlert: 1, unit: 'month', description: '1-month gym membership', catIdx: 0 },
      { name: 'Quarterly Membership', price: 5000, costPrice: 0, sku: 'MEM-002', stock: 999, lowStockAlert: 1, unit: 'quarter', description: '3-month gym membership (save ₹1000)', catIdx: 0 },
      { name: 'Annual Membership', price: 15000, costPrice: 0, sku: 'MEM-003', stock: 999, lowStockAlert: 1, unit: 'year', description: '12-month gym membership (best value)', catIdx: 0 },
      // Personal Training (catIdx: 1)
      { name: 'PT Session (1 hour)', price: 800, costPrice: 400, sku: 'PT-001', stock: 999, lowStockAlert: 1, unit: 'session', description: '1-hour personal training session', catIdx: 1 },
      { name: 'PT 10-Pack', price: 7000, costPrice: 3500, sku: 'PT-002', stock: 999, lowStockAlert: 1, unit: 'pack', description: '10 personal training sessions (save ₹1000)', catIdx: 1 },
      // Supplements (catIdx: 2)
      { name: 'Whey Protein (1 kg)', price: 2500, costPrice: 1400, sku: 'SUP-001', stock: 20, lowStockAlert: 5, unit: 'pack', description: 'Premium whey protein powder', catIdx: 2 },
      { name: 'Creatine (250g)', price: 1200, costPrice: 600, sku: 'SUP-002', stock: 15, lowStockAlert: 3, unit: 'pack', description: 'Creatine monohydrate powder', catIdx: 2 },
      { name: 'BCAA (300g)', price: 800, costPrice: 400, sku: 'SUP-003', stock: 12, lowStockAlert: 3, unit: 'pack', description: 'Branched-chain amino acids', catIdx: 2 },
      // Merchandise (catIdx: 3)
      { name: 'Gym T-Shirt', price: 600, costPrice: 250, sku: 'MRC-001', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Iron Forge branded gym t-shirt', catIdx: 3 },
      { name: 'Gym Shorts', price: 400, costPrice: 180, sku: 'MRC-002', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Iron Forge branded gym shorts', catIdx: 3 },
      { name: 'Water Bottle', price: 300, costPrice: 100, sku: 'MRC-003', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Iron Forge branded water bottle', catIdx: 3 },
      // Equipment Rental (catIdx: 4)
      { name: 'Dumbbell Set (per month)', price: 5000, costPrice: 0, sku: 'EQP-001', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Dumbbell set rental per month', catIdx: 4 },
      { name: 'Resistance Band Set', price: 400, costPrice: 180, sku: 'EQP-002', stock: 15, lowStockAlert: 3, unit: 'set', description: 'Set of 5 resistance bands', catIdx: 4 },
      { name: 'Yoga Mat', price: 600, costPrice: 280, sku: 'EQP-003', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Premium anti-slip yoga mat', catIdx: 4 },
      { name: 'Kettlebell (per month)', price: 1500, costPrice: 0, sku: 'EQP-004', stock: 999, lowStockAlert: 1, unit: 'month', description: 'Kettlebell rental per month', catIdx: 4 },
    ],
    staff: [
      { name: 'Suresh Reddy', phone: '9712345678', role: 'admin', shiftStart: '06:00', shiftEnd: '22:00', salary: 0, commission: 0, isActive: true },
      { name: 'Vikram Deshmukh', phone: '9723456789', role: 'staff', shiftStart: '06:00', shiftEnd: '14:00', salary: 18000, commission: 5, isActive: true },
      { name: 'Lakshmi Patil', phone: '9734567890', role: 'staff', shiftStart: '14:00', shiftEnd: '22:00', salary: 18000, commission: 5, isActive: true },
      { name: 'Ravi Jadhav', phone: '9745678901', role: 'cashier', shiftStart: '08:00', shiftEnd: '20:00', salary: 13000, commission: 0, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const memberDefs = [
        { name: 'Arjun Patil', phone: '9812345678', email: 'arjun.p@gmail.com', plan: 'annual', startDate: new Date('2024-06-15'), endDate: new Date('2025-06-15'), status: 'active' },
        { name: 'Divya Sharma', phone: '9823456789', email: 'divya.s@gmail.com', plan: 'monthly', startDate: new Date('2025-01-10'), endDate: new Date('2025-02-10'), status: 'active' },
        { name: 'Kiran Kulkarni', phone: '9834567890', email: 'kiran.k@gmail.com', plan: 'quarterly', startDate: new Date('2024-11-20'), endDate: new Date('2025-02-20'), status: 'active' },
        { name: 'Meena Deshmukh', phone: '9845678901', email: 'meena.d@gmail.com', plan: 'monthly', startDate: new Date('2025-02-01'), endDate: new Date('2025-03-01'), status: 'active' },
        { name: 'Rahul Joshi', phone: '9856789012', email: 'rahul.j@gmail.com', plan: 'annual', startDate: new Date('2024-09-01'), endDate: new Date('2025-09-01'), status: 'active' },
      ];
      for (const m of memberDefs) {
        await db.member.create({
          data: { storeId, name: m.name, phone: m.phone, email: m.email, plan: m.plan, startDate: m.startDate, endDate: m.endDate, status: m.status },
        });
      }
    },
  },

  stationery: {
    storeName: 'National Book House',
    ownerName: 'Anil Mishra',
    niche: 'stationery',
    template: 'station-neat',
    city: 'Kolkata',
    state: 'West Bengal',
    phone: '9876543210',
    address: '12 College Street, Bowbazar',
    email: 'info@nationalbookhouse.in',
    gstNumber: '19AABCU9603R1ZY',
    taxRate: 12.0,
    receiptHeader: 'National Book House - Books & Stationery',
    receiptFooter: 'Thank you! Visit again for all your stationery needs.',
    categories: [
      { name: 'Books', icon: '📚', color: '#1e40af', sortOrder: 1 },
      { name: 'Notebooks', icon: '📓', color: '#dc2626', sortOrder: 2 },
      { name: 'Pens', icon: '🖊️', color: '#7c3aed', sortOrder: 3 },
      { name: 'Art Supplies', icon: '🎨', color: '#f97316', sortOrder: 4 },
      { name: 'School Kits', icon: '🎒', color: '#059669', sortOrder: 5 },
    ],
    products: [
      // Books (catIdx: 0)
      { name: 'NCERT Maths Class 10', price: 180, costPrice: 110, sku: 'BK-001', stock: 100, lowStockAlert: 15, unit: 'piece', description: 'NCERT Mathematics textbook Class 10', catIdx: 0 },
      { name: 'NCERT Science Class 10', price: 170, costPrice: 105, sku: 'BK-002', stock: 100, lowStockAlert: 15, unit: 'piece', description: 'NCERT Science textbook Class 10', catIdx: 0 },
      { name: 'RD Sharma Class 12', price: 450, costPrice: 280, sku: 'BK-003', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'RD Sharma Mathematics Class 12', catIdx: 0 },
      { name: 'English Grammar (Wren & Martin)', price: 320, costPrice: 190, sku: 'BK-004', stock: 55, lowStockAlert: 10, unit: 'piece', description: 'Wren & Martin English grammar book', catIdx: 0 },
      { name: 'General Knowledge 2025', price: 200, costPrice: 120, sku: 'BK-005', stock: 60, lowStockAlert: 10, unit: 'piece', description: 'Lucent GK 2025 edition', catIdx: 0 },
      // Notebooks (catIdx: 1)
      { name: 'Classmate Notebook (200pg)', price: 55, costPrice: 30, sku: 'NB-001', stock: 200, lowStockAlert: 30, unit: 'piece', description: 'Classmate ruled notebook 200 pages', catIdx: 1 },
      { name: 'Classmate Notebook (100pg)', price: 35, costPrice: 18, sku: 'NB-002', stock: 250, lowStockAlert: 40, unit: 'piece', description: 'Classmate ruled notebook 100 pages', catIdx: 1 },
      { name: 'Drawing Book (A4)', price: 80, costPrice: 42, sku: 'NB-003', stock: 80, lowStockAlert: 15, unit: 'piece', description: 'Blank drawing book A4 size', catIdx: 1 },
      { name: 'Lab Record Book', price: 45, costPrice: 22, sku: 'NB-004', stock: 120, lowStockAlert: 20, unit: 'piece', description: 'Practical lab record notebook', catIdx: 1 },
      // Pens (catIdx: 2)
      { name: 'Cello Gripper Pen (10pk)', price: 45, costPrice: 22, sku: 'PN-001', stock: 300, lowStockAlert: 40, unit: 'pack', description: 'Cello Gripper ballpoint pen 10-pack', catIdx: 2 },
      { name: 'Parker Pen', price: 250, costPrice: 120, sku: 'PN-002', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Parker ballpoint pen', catIdx: 2 },
      { name: 'Gel Pen Set (5pc)', price: 60, costPrice: 28, sku: 'PN-003', stock: 150, lowStockAlert: 20, unit: 'set', description: 'Assorted color gel pen set of 5', catIdx: 2 },
      { name: 'HB Pencil (10pk)', price: 30, costPrice: 14, sku: 'PN-004', stock: 200, lowStockAlert: 30, unit: 'pack', description: 'HB pencil set of 10 with eraser', catIdx: 2 },
      // Art Supplies (catIdx: 3)
      { name: 'Watercolor Set', price: 350, costPrice: 170, sku: 'ART-001', stock: 35, lowStockAlert: 8, unit: 'box', description: 'Student watercolor kit 24 shades', catIdx: 3 },
      { name: 'Sketch Pens (12pk)', price: 120, costPrice: 55, sku: 'ART-002', stock: 50, lowStockAlert: 10, unit: 'pack', description: 'Color sketch pens 12 pack', catIdx: 3 },
      { name: 'Crayons (24 shades)', price: 90, costPrice: 40, sku: 'ART-003', stock: 60, lowStockAlert: 10, unit: 'box', description: 'Wax crayons 24 shades', catIdx: 3 },
      { name: 'Paint Brush Set (6pc)', price: 150, costPrice: 65, sku: 'ART-004', stock: 25, lowStockAlert: 5, unit: 'set', description: 'Round paint brush set of 6 sizes', catIdx: 3 },
      // School Kits (catIdx: 4)
      { name: 'School Bag (Large)', price: 600, costPrice: 280, sku: 'KIT-001', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Large school backpack - assorted colors', catIdx: 4 },
      { name: 'Geometry Box', price: 120, costPrice: 55, sku: 'KIT-002', stock: 45, lowStockAlert: 8, unit: 'piece', description: 'Math geometry instrument box', catIdx: 4 },
      { name: 'Pencil Box', price: 80, costPrice: 35, sku: 'KIT-003', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Double-decker pencil box', catIdx: 4 },
      { name: 'Exam Board', price: 40, costPrice: 18, sku: 'KIT-004', stock: 100, lowStockAlert: 15, unit: 'piece', description: 'Clipboard exam board A4', catIdx: 4 },
    ],
    staff: [
      { name: 'Anil Mishra', phone: '9712345678', role: 'admin', shiftStart: '09:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Pradeep Das', phone: '9723456789', role: 'cashier', shiftStart: '09:00', shiftEnd: '17:00', salary: 12000, commission: 0, isActive: true },
      { name: 'Ramesh Shaw', phone: '9734567890', role: 'staff', shiftStart: '09:00', shiftEnd: '17:00', salary: 11000, commission: 1, isActive: true },
      { name: 'Sumit Ghosh', phone: '9745678901', role: 'cashier', shiftStart: '14:00', shiftEnd: '21:00', salary: 12000, commission: 0, isActive: true },
    ],
  },

  hotel: {
    storeName: 'Heritage Inn',
    ownerName: 'Vikram Singh Rathore',
    niche: 'hotel',
    template: 'hotel-premium',
    city: 'Udaipur',
    state: 'Rajasthan',
    phone: '9876543210',
    address: '23 Lake Palace Road, Near Fateh Sagar',
    email: 'info@heritageinn.in',
    gstNumber: '08AABCU9603R1ZZ',
    taxRate: 18.0,
    receiptHeader: 'Heritage Inn - Experience Royal Udaipur',
    receiptFooter: 'Thank you for staying with us! Namaste 🙏',
    categories: [
      { name: 'Rooms', icon: '🛏️', color: '#059669', sortOrder: 1 },
      { name: 'Food', icon: '🍛', color: '#dc2626', sortOrder: 2 },
      { name: 'Laundry', icon: '👔', color: '#7c3aed', sortOrder: 3 },
      { name: 'Events', icon: '🎪', color: '#d97706', sortOrder: 4 },
      { name: 'Transport', icon: '🚗', color: '#0891b2', sortOrder: 5 },
    ],
    products: [
      // Rooms (catIdx: 0)
      { name: 'Standard Room', price: 1500, costPrice: 600, sku: 'RM-001', stock: 999, lowStockAlert: 1, unit: 'night', description: 'Standard non-AC room per night', catIdx: 0 },
      { name: 'Deluxe Room', price: 2500, costPrice: 1000, sku: 'RM-002', stock: 999, lowStockAlert: 1, unit: 'night', description: 'Deluxe AC room with lake view', catIdx: 0 },
      { name: 'Suite', price: 5000, costPrice: 2000, sku: 'RM-003', stock: 999, lowStockAlert: 1, unit: 'night', description: 'Premium suite with living room and lake view', catIdx: 0 },
      { name: 'Extra Bed', price: 500, costPrice: 150, sku: 'RM-004', stock: 999, lowStockAlert: 1, unit: 'night', description: 'Extra bed per night', catIdx: 0 },
      // Food (catIdx: 1)
      { name: 'Breakfast Buffet', price: 450, costPrice: 160, sku: 'FD-001', stock: 999, lowStockAlert: 1, unit: 'person', description: 'Breakfast buffet per person', catIdx: 1 },
      { name: 'Lunch Thali', price: 350, costPrice: 130, sku: 'FD-002', stock: 999, lowStockAlert: 1, unit: 'person', description: 'Rajasthani lunch thali', catIdx: 1 },
      { name: 'Dinner Buffet', price: 600, costPrice: 230, sku: 'FD-003', stock: 999, lowStockAlert: 1, unit: 'person', description: 'Dinner buffet per person', catIdx: 1 },
      { name: 'Room Service Meal', price: 500, costPrice: 180, sku: 'FD-004', stock: 999, lowStockAlert: 1, unit: 'meal', description: 'In-room dining meal', catIdx: 1 },
      { name: 'Mini Bar Items', price: 300, costPrice: 120, sku: 'FD-005', stock: 999, lowStockAlert: 1, unit: 'set', description: 'Assorted minibar refreshments', catIdx: 1 },
      // Laundry (catIdx: 2)
      { name: 'Wash & Iron (5 items)', price: 300, costPrice: 100, sku: 'LN-001', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Laundry wash and iron - 5 items', catIdx: 2 },
      { name: 'Dry Cleaning (1 item)', price: 250, costPrice: 90, sku: 'LN-002', stock: 999, lowStockAlert: 1, unit: 'piece', description: 'Dry cleaning per item', catIdx: 2 },
      { name: 'Express Laundry', price: 500, costPrice: 180, sku: 'LN-003', stock: 999, lowStockAlert: 1, unit: 'service', description: 'Same-day express laundry', catIdx: 2 },
      // Events (catIdx: 3)
      { name: 'Conference Room (per hour)', price: 3000, costPrice: 1200, sku: 'EV-001', stock: 999, lowStockAlert: 1, unit: 'hour', description: 'Conference room rental per hour', catIdx: 3 },
      { name: 'Banquet Hall (per event)', price: 25000, costPrice: 10000, sku: 'EV-002', stock: 999, lowStockAlert: 1, unit: 'event', description: 'Banquet hall booking per event', catIdx: 3 },
      { name: 'Outdoor Lawn Event', price: 40000, costPrice: 16000, sku: 'EV-003', stock: 999, lowStockAlert: 1, unit: 'event', description: 'Outdoor lawn event booking', catIdx: 3 },
      // Transport (catIdx: 4)
      { name: 'Airport Pickup', price: 800, costPrice: 350, sku: 'TR-001', stock: 999, lowStockAlert: 1, unit: 'trip', description: 'Airport pickup and drop service', catIdx: 4 },
      { name: 'City Tour (half day)', price: 2000, costPrice: 900, sku: 'TR-002', stock: 999, lowStockAlert: 1, unit: 'tour', description: 'Half-day Udaipur city tour', catIdx: 4 },
      { name: 'Car Rental (per day)', price: 3000, costPrice: 1400, sku: 'TR-003', stock: 999, lowStockAlert: 1, unit: 'day', description: 'AC car rental per day with driver', catIdx: 4 },
    ],
    staff: [
      { name: 'Vikram Singh Rathore', phone: '9712345678', role: 'admin', shiftStart: '09:00', shiftEnd: '21:00', salary: 0, commission: 0, isActive: true },
      { name: 'Neha Sharma', phone: '9723456789', role: 'manager', shiftStart: '09:00', shiftEnd: '21:00', salary: 25000, commission: 2, isActive: true },
      { name: 'Rakesh Meena', phone: '9734567890', role: 'staff', shiftStart: '06:00', shiftEnd: '14:00', salary: 15000, commission: 0, isActive: true },
      { name: 'Sunita Devi', phone: '9745678901', role: 'cashier', shiftStart: '09:00', shiftEnd: '21:00', salary: 14000, commission: 0, isActive: true },
      { name: 'Dinesh Joshi', phone: '9756789012', role: 'staff', shiftStart: '14:00', shiftEnd: '22:00', salary: 13000, commission: 0, isActive: true },
    ],
    nicheSpecificSeeds: async (storeId: string) => {
      const roomDefs = [
        { number: '101', type: 'standard', capacity: 2, status: 'available', floor: 1, pricePerNight: 1500 },
        { number: '102', type: 'standard', capacity: 2, status: 'occupied', floor: 1, pricePerNight: 1500 },
        { number: '201', type: 'deluxe', capacity: 3, status: 'available', floor: 2, pricePerNight: 2500 },
        { number: '202', type: 'deluxe', capacity: 3, status: 'occupied', floor: 2, pricePerNight: 2500 },
        { number: '301', type: 'suite', capacity: 4, status: 'available', floor: 3, pricePerNight: 5000 },
        { number: '302', type: 'suite', capacity: 4, status: 'available', floor: 3, pricePerNight: 5000 },
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
    const pLen = config.products.length;
    const safeIdx = (idx: number) => Math.min(idx, pLen - 1);
    const orderDefinitions = [
      {
        customerIdx: 0,
        orderNumber: 'ORD-001',
        type: config.niche === 'salon' ? 'in_store' : 'dine_in',
        paymentMethod: 'upi',
        staffIdx: 0,
        nicheData: config.niche === 'restaurant' ? JSON.stringify({ tableNumber: 2, section: 'indoor' }) : null,
        items: [
          { prodIdx: safeIdx(0), name: config.products[safeIdx(0)].name, quantity: 2, unitPrice: config.products[safeIdx(0)].price },
          { prodIdx: safeIdx(5), name: config.products[safeIdx(5)].name, quantity: 1, unitPrice: config.products[safeIdx(5)].price },
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
          { prodIdx: safeIdx(1), name: config.products[safeIdx(1)].name, quantity: 2, unitPrice: config.products[safeIdx(1)].price },
          { prodIdx: safeIdx(8), name: config.products[safeIdx(8)].name, quantity: 2, unitPrice: config.products[safeIdx(8)].price },
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
          { prodIdx: safeIdx(6), name: config.products[safeIdx(6)].name, quantity: 1, unitPrice: config.products[safeIdx(6)].price },
          { prodIdx: safeIdx(7), name: config.products[safeIdx(7)].name, quantity: 1, unitPrice: config.products[safeIdx(7)].price },
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
          { prodIdx: safeIdx(9), name: config.products[safeIdx(9)].name, quantity: 1, unitPrice: config.products[safeIdx(9)].price },
          { prodIdx: safeIdx(3), name: config.products[safeIdx(3)].name, quantity: 2, unitPrice: config.products[safeIdx(3)].price },
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
          { prodIdx: safeIdx(10), name: config.products[safeIdx(10)].name, quantity: 1, unitPrice: config.products[safeIdx(10)].price },
          { prodIdx: safeIdx(12), name: config.products[safeIdx(12)].name, quantity: 1, unitPrice: config.products[safeIdx(12)].price },
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
