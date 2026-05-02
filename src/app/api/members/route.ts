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

    const members = await db.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, name, phone, email, plan, startDate, trainerName } = body;

    if (!storeId || !name || !plan) {
      return NextResponse.json(
        { error: 'storeId, name, and plan are required' },
        { status: 400 }
      );
    }

    // Calculate end date based on plan
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    switch (plan) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        break;
      case 'annual':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }

    const member = await db.member.create({
      data: {
        storeId,
        name,
        phone: phone || null,
        email: email || null,
        plan,
        startDate: start,
        endDate: end,
        status: 'active',
        trainerName: trainerName || null,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
