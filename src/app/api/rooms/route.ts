import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');
    const type = request.nextUrl.searchParams.get('type');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId query parameter is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    if (type) where.type = type;

    const rooms = await db.room.findMany({
      where,
      orderBy: { number: 'asc' },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, number, type, pricePerNight, capacity, floor, amenities } = body;

    if (!storeId || !number || pricePerNight === undefined) {
      return NextResponse.json(
        { error: 'storeId, number, and pricePerNight are required' },
        { status: 400 }
      );
    }

    const room = await db.room.create({
      data: {
        storeId,
        number,
        type: type || 'standard',
        pricePerNight: parseFloat(String(pricePerNight)),
        capacity: capacity ? parseInt(String(capacity), 10) : 2,
        floor: floor ? parseInt(String(floor), 10) : null,
        amenities: amenities || null,
      },
    });

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
