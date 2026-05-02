import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, ownerName, niche, template, city, state, gstNumber, phone, address, taxRate, email } = body;

    if (!name || !ownerName || !niche) {
      return NextResponse.json(
        { error: 'Store name, owner name, and niche are required' },
        { status: 400 }
      );
    }

    // If userId is provided, check if user already has a store
    if (userId) {
      const existingStore = await db.store.findUnique({ where: { userId } });
      if (existingStore) {
        // Instead of error, return the existing store (idempotent)
        return NextResponse.json({ store: existingStore }, { status: 200 });
      }
    }

    // Verify user exists or auto-create one if needed
    let resolvedUserId = userId;

    if (userId) {
      const userExists = await db.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        // User ID from session is stale (DB was reset). Auto-create a new user.
        const newUser = await db.user.create({
          data: {
            id: userId, // Try to reuse the same ID
            email: email || `user-${Date.now()}@storeos.in`,
            password: createHash('sha256').update(`auto-${Date.now()}`).digest('hex'),
            name: ownerName,
            phone: phone || null,
            role: 'user',
            subscription: {
              create: {
                plan: 'basic',
                status: 'trial',
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              },
            },
          },
          include: { subscription: true },
        });
        resolvedUserId = newUser.id;
      }
    } else {
      // No userId provided — create a new user account automatically
      const autoEmail = email || `user-${Date.now()}@storeos.in`;
      const newUser = await db.user.create({
        data: {
          email: autoEmail,
          password: createHash('sha256').update(`auto-${Date.now()}`).digest('hex'),
          name: ownerName,
          phone: phone || null,
          role: 'user',
          subscription: {
            create: {
              plan: 'basic',
              status: 'trial',
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: { subscription: true },
      });
      resolvedUserId = newUser.id;
    }

    const store = await db.store.create({
      data: {
        userId: resolvedUserId,
        name,
        ownerName,
        niche,
        template: template || 'default',
        city: city || null,
        state: state || null,
        gstNumber: gstNumber || null,
        phone: phone || null,
        address: address || null,
        email: email || null,
        taxRate: taxRate ?? 18.0,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ store, userId: resolvedUserId }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create store error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create store';
    return NextResponse.json(
      { error: message },
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
