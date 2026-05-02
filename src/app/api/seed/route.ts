import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // ─── Idempotent: Check if demo user exists and clean up ───
    const existingDemo = await db.user.findUnique({ where: { email: 'demo@storeos.in' } });
    if (existingDemo) {
      const demoStore = await db.store.findUnique({ where: { userId: existingDemo.id } });
      if (demoStore) {
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
        name: 'Rajesh Sharma',
        phone: '9876543210',
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
        name: "Sharma's Kitchen",
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
        onboardingComplete: true,
      },
    });

    // ─── 4. Create Categories ───
    const categoryDefinitions = [
      { name: 'Starters', icon: '🥗', color: '#f97316', sortOrder: 1 },
      { name: 'Main Course', icon: '🍛', color: '#dc2626', sortOrder: 2 },
      { name: 'Breads', icon: '🫓', color: '#d97706', sortOrder: 3 },
      { name: 'Beverages', icon: '🥤', color: '#0891b2', sortOrder: 4 },
      { name: 'Desserts', icon: '🍨', color: '#e879f9', sortOrder: 5 },
    ];

    const categories: { id: string; name: string }[] = [];
    for (const cat of categoryDefinitions) {
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

    // ─── 5. Create 25 Products ───
    const productDefinitions = [
      // Starters (categoryId index 0)
      { name: 'Paneer Tikka', price: 250, costPrice: 120, sku: 'STR-001', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Marinated cottage cheese grilled in tandoor', catIdx: 0 },
      { name: 'Chicken Tikka', price: 280, costPrice: 140, sku: 'STR-002', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Boneless chicken pieces grilled with spices', catIdx: 0 },
      { name: 'Veg Spring Roll', price: 180, costPrice: 80, sku: 'STR-003', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Crispy rolls stuffed with mixed vegetables', catIdx: 0 },
      { name: 'Fish Fry', price: 320, costPrice: 180, sku: 'STR-004', stock: 15, lowStockAlert: 5, unit: 'piece', description: 'Crispy fried fish with masala coating', catIdx: 0 },
      { name: 'Mushroom Manchurian', price: 220, costPrice: 100, sku: 'STR-005', stock: 3, lowStockAlert: 5, unit: 'piece', description: 'Mushroom balls in Indo-Chinese sauce', catIdx: 0 },

      // Main Course (categoryId index 1)
      { name: 'Butter Chicken', price: 320, costPrice: 160, sku: 'MC-001', stock: 60, lowStockAlert: 10, unit: 'piece', description: 'Tender chicken in rich tomato-cream sauce', catIdx: 1 },
      { name: 'Dal Makhani', price: 220, costPrice: 80, sku: 'MC-002', stock: 45, lowStockAlert: 8, unit: 'piece', description: 'Slow-cooked black lentils with cream', catIdx: 1 },
      { name: 'Palak Paneer', price: 240, costPrice: 100, sku: 'MC-003', stock: 35, lowStockAlert: 5, unit: 'piece', description: 'Cottage cheese in creamy spinach gravy', catIdx: 1 },
      { name: 'Chicken Biryani', price: 300, costPrice: 150, sku: 'MC-004', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Fragrant basmati rice with spiced chicken', catIdx: 1 },
      { name: 'Mutton Rogan Josh', price: 380, costPrice: 200, sku: 'MC-005', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Kashmiri-style mutton in aromatic gravy', catIdx: 1 },
      { name: 'Veg Kolhapuri', price: 200, costPrice: 80, sku: 'MC-006', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Mixed vegetables in spicy Kolhapuri masala', catIdx: 1 },
      { name: 'Prawn Masala', price: 350, costPrice: 200, sku: 'MC-007', stock: 2, lowStockAlert: 5, unit: 'piece', description: 'Fresh prawns in coastal masala gravy', catIdx: 1 },
      { name: 'Kadhai Paneer', price: 260, costPrice: 110, sku: 'MC-008', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Paneer cooked with bell peppers in kadhai', catIdx: 1 },
      { name: 'Egg Curry', price: 180, costPrice: 70, sku: 'MC-009', stock: 30, lowStockAlert: 5, unit: 'piece', description: 'Boiled eggs in onion-tomato gravy', catIdx: 1 },

      // Breads (categoryId index 2)
      { name: 'Butter Naan', price: 50, costPrice: 15, sku: 'BRD-001', stock: 100, lowStockAlert: 20, unit: 'piece', description: 'Soft tandoor bread with butter', catIdx: 2 },
      { name: 'Garlic Naan', price: 60, costPrice: 18, sku: 'BRD-002', stock: 80, lowStockAlert: 15, unit: 'piece', description: 'Naan topped with garlic and coriander', catIdx: 2 },
      { name: 'Tandoori Roti', price: 30, costPrice: 8, sku: 'BRD-003', stock: 120, lowStockAlert: 25, unit: 'piece', description: 'Whole wheat bread baked in tandoor', catIdx: 2 },
      { name: 'Laccha Paratha', price: 50, costPrice: 14, sku: 'BRD-004', stock: 60, lowStockAlert: 10, unit: 'piece', description: 'Flaky layered whole wheat bread', catIdx: 2 },

      // Beverages (categoryId index 3)
      { name: 'Masala Chai', price: 40, costPrice: 10, sku: 'BVG-001', stock: 200, lowStockAlert: 30, unit: 'piece', description: 'Traditional spiced Indian tea', catIdx: 3 },
      { name: 'Mango Lassi', price: 80, costPrice: 30, sku: 'BVG-002', stock: 50, lowStockAlert: 10, unit: 'piece', description: 'Thick mango yogurt smoothie', catIdx: 3 },
      { name: 'Fresh Lime Soda', price: 60, costPrice: 15, sku: 'BVG-003', stock: 80, lowStockAlert: 15, unit: 'piece', description: 'Fresh lime with soda - sweet or salted', catIdx: 3 },
      { name: 'Cold Coffee', price: 90, costPrice: 35, sku: 'BVG-004', stock: 40, lowStockAlert: 8, unit: 'piece', description: 'Chilled coffee blended with ice cream', catIdx: 3 },

      // Desserts (categoryId index 4)
      { name: 'Gulab Jamun', price: 100, costPrice: 35, sku: 'DES-001', stock: 35, lowStockAlert: 8, unit: 'piece', description: 'Soft milk dumplings in rose sugar syrup', catIdx: 4 },
      { name: 'Rasmalai', price: 120, costPrice: 45, sku: 'DES-002', stock: 25, lowStockAlert: 5, unit: 'piece', description: 'Cottage cheese discs in saffron milk', catIdx: 4 },
      { name: 'Kulfi Falooda', price: 130, costPrice: 50, sku: 'DES-003', stock: 20, lowStockAlert: 5, unit: 'piece', description: 'Traditional Indian ice cream with falooda', catIdx: 4 },
    ];

    const products: { id: string; name: string; price: number }[] = [];
    for (const p of productDefinitions) {
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

    // ─── 7. Create 5 Staff Members ───
    const staffDefinitions = [
      { name: 'Vikram Singh', phone: '9712345678', role: 'admin', shiftStart: '09:00', shiftEnd: '21:00', salary: 25000, commission: 0, isActive: true },
      { name: 'Neha Gupta', phone: '9723456789', role: 'cashier', shiftStart: '10:00', shiftEnd: '22:00', salary: 15000, commission: 0, isActive: true },
      { name: 'Rajesh Thakur', phone: '9734567890', role: 'manager', shiftStart: '09:00', shiftEnd: '21:00', salary: 20000, commission: 2, isActive: true },
      { name: 'Sunita Devi', phone: '9745678901', role: 'cashier', shiftStart: '14:00', shiftEnd: '23:00', salary: 14000, commission: 0, isActive: true },
      { name: 'Arun Mehta', phone: '9756789012', role: 'manager', shiftStart: '08:00', shiftEnd: '16:00', salary: 18000, commission: 1.5, isActive: false },
    ];

    const staff: { id: string; name: string }[] = [];
    for (const s of staffDefinitions) {
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

    // ─── 8. Create 8 Tables ───
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

    const tables: { id: string }[] = [];
    for (const t of tableDefinitions) {
      const table = await db.table.create({
        data: {
          storeId: store.id,
          number: t.number,
          capacity: t.capacity,
          status: t.status,
          section: t.section,
        },
      });
      tables.push({ id: table.id });
    }

    // ─── 9. Create 5 Recent Orders ───
    const orderDefinitions = [
      {
        customerIdx: 0,
        orderNumber: 'ORD-001',
        type: 'dine_in',
        paymentMethod: 'upi',
        staffIdx: 1,
        nicheData: JSON.stringify({ tableNumber: 2, section: 'indoor' }),
        items: [
          { prodIdx: 0, name: 'Paneer Tikka', quantity: 2, unitPrice: 250 },
          { prodIdx: 5, name: 'Butter Chicken', quantity: 1, unitPrice: 320 },
          { prodIdx: 14, name: 'Butter Naan', quantity: 3, unitPrice: 50 },
        ],
      },
      {
        customerIdx: 2,
        orderNumber: 'ORD-002',
        type: 'dine_in',
        paymentMethod: 'card',
        staffIdx: 2,
        nicheData: JSON.stringify({ tableNumber: 4, section: 'indoor' }),
        items: [
          { prodIdx: 1, name: 'Chicken Tikka', quantity: 2, unitPrice: 280 },
          { prodIdx: 8, name: 'Chicken Biryani', quantity: 2, unitPrice: 300 },
          { prodIdx: 19, name: 'Mango Lassi', quantity: 2, unitPrice: 80 },
        ],
      },
      {
        customerIdx: 4,
        orderNumber: 'ORD-003',
        type: 'takeaway',
        paymentMethod: 'cash',
        staffIdx: 1,
        nicheData: null,
        items: [
          { prodIdx: 6, name: 'Dal Makhani', quantity: 1, unitPrice: 220 },
          { prodIdx: 7, name: 'Palak Paneer', quantity: 1, unitPrice: 240 },
          { prodIdx: 16, name: 'Tandoori Roti', quantity: 4, unitPrice: 30 },
        ],
      },
      {
        customerIdx: 6,
        orderNumber: 'ORD-004',
        type: 'dine_in',
        paymentMethod: 'upi',
        staffIdx: 3,
        nicheData: JSON.stringify({ tableNumber: 8, section: 'VIP' }),
        items: [
          { prodIdx: 9, name: 'Mutton Rogan Josh', quantity: 1, unitPrice: 380 },
          { prodIdx: 3, name: 'Fish Fry', quantity: 2, unitPrice: 320 },
          { prodIdx: 15, name: 'Garlic Naan', quantity: 4, unitPrice: 60 },
          { prodIdx: 22, name: 'Gulab Jamun', quantity: 2, unitPrice: 100 },
        ],
      },
      {
        customerIdx: 7,
        orderNumber: 'ORD-005',
        type: 'delivery',
        paymentMethod: 'cash',
        staffIdx: 1,
        nicheData: null,
        items: [
          { prodIdx: 10, name: 'Veg Kolhapuri', quantity: 1, unitPrice: 200 },
          { prodIdx: 12, name: 'Kadhai Paneer', quantity: 1, unitPrice: 260 },
          { prodIdx: 14, name: 'Butter Naan', quantity: 2, unitPrice: 50 },
          { prodIdx: 23, name: 'Rasmalai', quantity: 2, unitPrice: 120 },
        ],
      },
    ];

    let orderCount = 0;
    for (const o of orderDefinitions) {
      const subtotal = o.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const taxRate = 5.0;
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
          staffId: staff[o.staffIdx].id,
          createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        },
      });

      for (const item of o.items) {
        const itemTotal = item.unitPrice * item.quantity;
        await db.orderItem.create({
          data: {
            orderId: order.id,
            productId: products[item.prodIdx].id,
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
      message: 'Database seeded successfully',
      counts: {
        users: 2,
        subscriptions: 1,
        stores: 1,
        categories: categories.length,
        products: products.length,
        customers: customers.length,
        staff: staff.length,
        tables: tables.length,
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
