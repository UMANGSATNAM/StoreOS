import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');
    const date = request.nextUrl.searchParams.get('date');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId query parameter is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    const appointments = await db.appointment.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, customerName, customerPhone, service, staffName, date, duration, notes } = body;

    if (!storeId || !customerName || !service || !date) {
      return NextResponse.json(
        { error: 'storeId, customerName, service, and date are required' },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.create({
      data: {
        storeId,
        customerName,
        customerPhone: customerPhone || null,
        service,
        staffName: staffName || null,
        date: new Date(date),
        duration: duration || 30,
        notes: notes || null,
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
