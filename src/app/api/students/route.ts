import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');
    const status = request.nextUrl.searchParams.get('status');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId query parameter is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId };
    if (status) where.status = status;

    const students = await db.student.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, name, phone, email, parentPhone, batch, course, feeTotal } = body;

    if (!storeId || !name) {
      return NextResponse.json(
        { error: 'storeId and name are required' },
        { status: 400 }
      );
    }

    const student = await db.student.create({
      data: {
        storeId,
        name,
        phone: phone || null,
        email: email || null,
        parentPhone: parentPhone || null,
        batch: batch || null,
        course: course || null,
        feeTotal: parseFloat(String(feeTotal || 0)),
        feePaid: 0,
        status: 'active',
        enrollDate: new Date(),
      },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
