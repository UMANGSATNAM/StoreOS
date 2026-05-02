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
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const customers = await db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, name, phone, email, address, gstNumber, nicheData } = body;

    if (!storeId || !name) {
      return NextResponse.json(
        { error: 'storeId and name are required' },
        { status: 400 }
      );
    }

    const customer = await db.customer.create({
      data: {
        storeId,
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        gstNumber: gstNumber || null,
        nicheData: nicheData ? JSON.stringify(nicheData) : null,
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
