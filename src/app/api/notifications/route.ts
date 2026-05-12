import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/notifications?storeId=xxx
// Fetches stored notifications + generates dynamic notifications from real store events
export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId query parameter is required' },
        { status: 400 }
      );
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch stored notifications from DB
    const storedNotifications = await db.notification.findMany({
      where: {
        OR: [
          { storeId },
          { storeId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // ─── Generate dynamic notifications from real store events ───

    const dynamicNotifications: Array<{
      id: string;
      storeId: string | null;
      userId: string | null;
      title: string;
      message: string;
      type: string;
      read: boolean;
      createdAt: Date;
      isDynamic?: boolean;
    }> = [];

    // 1. Low stock alerts: products where stock <= lowStockAlert
    // SQLite doesn't support cross-column comparison in WHERE, so we fetch and filter in JS
    const allActiveProducts = await db.product.findMany({
      where: { storeId, isActive: true },
      select: { id: true, name: true, stock: true, lowStockAlert: true },
    });

    const lowStockItems = allActiveProducts.filter(p => p.stock <= p.lowStockAlert);

    for (const product of lowStockItems.slice(0, 10)) {
      dynamicNotifications.push({
        id: `dynamic-lowstock-${product.id}`,
        storeId,
        userId: null,
        title: product.stock === 0 ? 'Out of Stock' : 'Low Stock Alert',
        message: `${product.name} — only ${product.stock} unit${product.stock !== 1 ? 's' : ''} left${product.stock === 0 ? ' (OUT OF STOCK)' : ''}`,
        type: 'warning',
        read: false,
        createdAt: new Date(),
        isDynamic: true,
      });
    }

    // 2. Recent orders from last 24 hours
    const recentOrders = await db.order.findMany({
      where: {
        storeId,
        createdAt: { gte: twentyFourHoursAgo },
      },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const order of recentOrders) {
      const customerName = order.customer?.name || 'Walk-in';
      dynamicNotifications.push({
        id: `dynamic-order-${order.id}`,
        storeId,
        userId: null,
        title: 'New Order Received',
        message: `₹${order.totalAmount.toLocaleString('en-IN')} from ${customerName} — ${order.type.replace('_', ' ')}, ${order.paymentMethod}`,
        type: 'order',
        read: false,
        createdAt: order.createdAt,
        isDynamic: true,
      });
    }

    // 3. New customers added in last 24 hours
    const newCustomers = await db.customer.findMany({
      where: {
        storeId,
        createdAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const customer of newCustomers) {
      dynamicNotifications.push({
        id: `dynamic-customer-${customer.id}`,
        storeId,
        userId: null,
        title: 'New Customer Signup',
        message: `${customer.name} joined your store`,
        type: 'info', // will be mapped to 'customer' category in the frontend
        read: false,
        createdAt: customer.createdAt,
        isDynamic: true,
      });
    }

    // 4. Payment notifications: recent completed orders with payment info
    const paidOrders = await db.order.findMany({
      where: {
        storeId,
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: { gte: twentyFourHoursAgo },
      },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const order of paidOrders) {
      const customerName = order.customer?.name || 'Walk-in';
      dynamicNotifications.push({
        id: `dynamic-payment-${order.id}`,
        storeId,
        userId: null,
        title: `Payment Received via ${order.paymentMethod.toUpperCase()}`,
        message: `₹${order.totalAmount.toLocaleString('en-IN')} credited from ${customerName}`,
        type: 'success',
        read: false,
        createdAt: order.createdAt,
        isDynamic: true,
      });
    }

    // Merge: dynamic notifications first (most recent events), then stored
    // Deduplicate: if a stored notification has the same dynamic ID prefix, skip it
    const allNotifications = [...dynamicNotifications, ...storedNotifications];

    return NextResponse.json({
      notifications: allNotifications,
      counts: {
        total: allNotifications.length,
        unread: allNotifications.filter(n => !n.read).length,
        dynamic: dynamicNotifications.length,
        stored: storedNotifications.length,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications
// Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, userId, title, message, type } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      );
    }

    const notification = await db.notification.create({
      data: {
        storeId: storeId || null,
        userId: userId || null,
        title,
        message,
        type: type || 'info',
        read: false,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications
// Mark notification(s) as read
// Accepts {id: string} to mark one, or {markAllRead: true, storeId: string} to mark all
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, markAllRead, storeId } = body;

    if (markAllRead && storeId) {
      // Mark all as read for a store
      const result = await db.notification.updateMany({
        where: {
          OR: [
            { storeId },
            { storeId: null },
          ],
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({
        success: true,
        updatedCount: result.count,
      });
    }

    if (id) {
      // Mark single notification as read
      const notification = await db.notification.update({
        where: { id },
        data: { read: true },
      });

      return NextResponse.json({ notification });
    }

    return NextResponse.json(
      { error: 'Provide either {id} or {markAllRead: true, storeId}' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Patch notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications?id=xxx or ?storeId=xxx&clearAll=true
// Delete a single notification or clear all for a store
export async function DELETE(request: NextRequest) {
  try {
    const notifId = request.nextUrl.searchParams.get('id');
    const storeId = request.nextUrl.searchParams.get('storeId');
    const clearAll = request.nextUrl.searchParams.get('clearAll') === 'true';

    if (notifId) {
      // Delete a single notification
      await db.notification.delete({
        where: { id: notifId },
      });

      return NextResponse.json({ success: true });
    }

    if (clearAll && storeId) {
      // Clear all notifications for a store
      const result = await db.notification.deleteMany({
        where: {
          OR: [
            { storeId },
            { storeId: null },
          ],
        },
      });

      return NextResponse.json({
        success: true,
        deletedCount: result.count,
      });
    }

    return NextResponse.json(
      { error: 'Provide either ?id=xxx or ?storeId=xxx&clearAll=true' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
