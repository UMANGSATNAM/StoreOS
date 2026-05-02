import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const [totalStores, totalUsers, storesByNiche] = await Promise.all([
      db.store.count(),
      db.user.count(),
      db.store.groupBy({
        by: ['niche'],
        _count: { niche: true },
      }),
    ]);

    // Get revenue by niche
    const stores = await db.store.findMany({
      select: { id: true, niche: true },
    });

    const nicheRevenueMap = new Map<string, number>();

    for (const store of stores) {
      const result = await db.order.aggregate({
        where: { storeId: store.id, status: 'completed' },
        _sum: { totalAmount: true },
      });
      const revenue = result._sum.totalAmount || 0;
      nicheRevenueMap.set(store.niche, (nicheRevenueMap.get(store.niche) || 0) + revenue);
    }

    const revenueByNiche = Array.from(nicheRevenueMap.entries()).map(([niche, revenue]) => ({
      niche,
      revenue,
    }));

    const nicheBreakdown = storesByNiche.map((item) => ({
      niche: item.niche,
      storeCount: item._count.niche,
      revenue: nicheRevenueMap.get(item.niche) || 0,
    }));

    return NextResponse.json({
      totalStores,
      totalUsers,
      nicheBreakdown,
      revenueByNiche,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
