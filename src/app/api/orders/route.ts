import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateOrderNumber(): string {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${Date.now()}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');
    const status = request.nextUrl.searchParams.get('status');
    const date = request.nextUrl.searchParams.get('date');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId query parameter is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };

    if (status) {
      where.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const orders = await db.order.findMany({
      where,
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, customerId, items, type, paymentMethod, notes, nicheData } = body;

    if (!storeId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'storeId and items array are required' },
        { status: 400 }
      );
    }

    // Get store tax rate
    const store = await db.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const itemTotal = item.quantity * item.unitPrice - (item.discount || 0);
      subtotal += itemTotal;

      orderItemsData.push({
        productId: item.productId || null,
        name: item.name,
        quantity: parseFloat(String(item.quantity)),
        unitPrice: parseFloat(String(item.unitPrice)),
        discount: item.discount ? parseFloat(String(item.discount)) : 0,
        total: itemTotal,
        notes: item.notes || null,
        nicheData: item.nicheData ? JSON.stringify(item.nicheData) : null,
      });
    }

    const taxAmount = subtotal * (store.taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    const order = await db.order.create({
      data: {
        storeId,
        customerId: customerId || null,
        orderNumber: generateOrderNumber(),
        status: 'completed',
        type: type || 'dine_in',
        subtotal,
        taxAmount,
        totalAmount,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: 'paid',
        notes: notes || null,
        nicheData: nicheData ? JSON.stringify(nicheData) : null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    // Update product stock
    for (const item of items) {
      if (item.productId) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: parseFloat(String(item.quantity)) } },
        });
      }
    }

    // Update customer stats if customerId provided
    if (customerId) {
      await db.customer.update({
        where: { id: customerId },
        data: {
          totalSpent: { increment: totalAmount },
          totalOrders: { increment: 1 },
        },
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
