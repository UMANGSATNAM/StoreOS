import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, ownerName, niche, template, city, state, gstNumber, phone } = body;

    if (!userId || !name || !ownerName || !niche) {
      return NextResponse.json(
        { error: 'userId, name, ownerName, and niche are required' },
        { status: 400 }
      );
    }

    // Check if user already has a store
    const existingStore = await db.store.findUnique({ where: { userId } });
    if (existingStore) {
      return NextResponse.json(
        { error: 'User already has a store' },
        { status: 409 }
      );
    }

    const store = await db.store.create({
      data: {
        userId,
        name,
        ownerName,
        niche,
        template: template || 'default',
        city: city || null,
        state: state || null,
        gstNumber: gstNumber || null,
        phone: phone || null,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    console.error('Create store error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    const store = await db.store.findUnique({
      where: { userId },
      include: {
        categories: { orderBy: { sortOrder: 'asc' } },
        _count: {
          select: { products: true, orders: true, customers: true, staff: true },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error('Get store error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
