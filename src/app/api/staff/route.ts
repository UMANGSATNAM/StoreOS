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

    const staff = await db.staff.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Get staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, name, phone, role, shiftStart, shiftEnd, salary, commission } = body;

    if (!storeId || !name) {
      return NextResponse.json(
        { error: 'storeId and name are required' },
        { status: 400 }
      );
    }

    const staff = await db.staff.create({
      data: {
        storeId,
        name,
        phone: phone || null,
        role: role || 'cashier',
        shiftStart: shiftStart || null,
        shiftEnd: shiftEnd || null,
        salary: salary ? parseFloat(String(salary)) : 0,
        commission: commission ? parseFloat(String(commission)) : 0,
      },
    });

    return NextResponse.json({ staff }, { status: 201 });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
