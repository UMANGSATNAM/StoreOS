import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId query parameter is required' },
        { status: 400 }
      );
    }

    const tables = await db.table.findMany({
      where: { storeId },
      orderBy: { number: 'asc' },
    });

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Get tables error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, number, capacity, section } = body;

    if (!storeId || number === undefined) {
      return NextResponse.json(
        { error: 'storeId and number are required' },
        { status: 400 }
      );
    }

    const table = await db.table.create({
      data: {
        storeId,
        number: parseInt(String(number), 10),
        capacity: capacity ? parseInt(String(capacity), 10) : 4,
        section: section || null,
      },
    });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    console.error('Create table error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, capacity, section } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Table id is required' },
        { status: 400 }
      );
    }

    const existing = await db.table.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (capacity !== undefined) updateData.capacity = parseInt(String(capacity), 10);
    if (section !== undefined) updateData.section = section;

    const table = await db.table.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Update table error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
