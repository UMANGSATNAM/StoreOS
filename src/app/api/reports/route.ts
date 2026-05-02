import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');
    const period = request.nextUrl.searchParams.get('period') || 'today';

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId query parameter is required' },
        { status: 400 }
      );
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'today':
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // Today's sales
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [todayOrders, weekOrders, monthOrders, allPeriodOrders, topProductsResult] =
      await Promise.all([
        // Today's orders
        db.order.findMany({
          where: {
            storeId,
            status: 'completed',
            createdAt: { gte: todayStart },
          },
        }),
        // Week's orders
        db.order.findMany({
          where: {
            storeId,
            status: 'completed',
            createdAt: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        // Month's orders
        db.order.findMany({
          where: {
            storeId,
            status: 'completed',
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1),
            },
          },
        }),
        // Period orders for count & avg
        db.order.findMany({
          where: {
            storeId,
            status: 'completed',
            createdAt: { gte: startDate },
          },
        }),
        // Top products
        db.orderItem.findMany({
          where: {
            order: { storeId, status: 'completed' },
          },
          include: { product: true },
          orderBy: { total: 'desc' },
          take: 5,
        }),
      ]);

    const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const weekSales = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthSales = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const ordersCount = allPeriodOrders.length;
    const averageOrderValue = ordersCount > 0
      ? allPeriodOrders.reduce((sum, o) => sum + o.totalAmount, 0) / ordersCount
      : 0;

    // Aggregate top products by name
    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const item of topProductsResult) {
      const existing = productSalesMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.total;
      productSalesMap.set(item.name, existing);
    }

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Generate daily data for chart
    const dailyData = generateDailyData(allPeriodOrders, period);

    return NextResponse.json({
      todaySales,
      weekSales,
      monthSales,
      ordersCount,
      averageOrderValue,
      topProducts,
      dailyData,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateDailyData(
  orders: Array<{ totalAmount: number; createdAt: Date }>,
  period: string
): Array<{ date: string; sales: number; orders: number }> {
  const now = new Date();
  const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 7;

  // Group orders by date
  const ordersByDate = new Map<string, { sales: number; orders: number }>();

  for (const order of orders) {
    const orderDate = new Date(order.createdAt);
    const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const existing = ordersByDate.get(dateKey) || { sales: 0, orders: 0 };
    existing.sales += order.totalAmount;
    existing.orders += 1;
    ordersByDate.set(dateKey, existing);
  }

  // Build daily data array
  const result: Array<{ date: string; sales: number; orders: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const dayData = ordersByDate.get(dateKey) || { sales: 0, orders: 0 };

    const dayName = days <= 7
      ? date.toLocaleDateString('en-IN', { weekday: 'short' })
      : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

    result.push({
      date: dayName,
      sales: Math.round(dayData.sales),
      orders: dayData.orders,
    });
  }

  return result;
}
