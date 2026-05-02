import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');
    const search = request.nextUrl.searchParams.get('search');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId query parameter is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    if (search) {
      where.OR = [
        { registrationNumber: { contains: search } },
        { ownerName: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } },
      ];
    }

    const vehicles = await db.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, registrationNumber, make, model, year, ownerName, ownerPhone } = body;

    if (!storeId || !registrationNumber) {
      return NextResponse.json(
        { error: 'storeId and registrationNumber are required' },
        { status: 400 }
      );
    }

    const vehicle = await db.vehicle.create({
      data: {
        storeId,
        registrationNumber,
        make: make || null,
        model: model || null,
        year: year ? parseInt(String(year), 10) : null,
        ownerName: ownerName || null,
        ownerPhone: ownerPhone || null,
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
