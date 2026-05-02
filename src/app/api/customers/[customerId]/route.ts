import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const body = await request.json();

    const existing = await db.customer.findUnique({ where: { id: customerId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'phone', 'email', 'address', 'gstNumber', 'loyaltyPoints', 'creditBalance', 'totalSpent', 'totalOrders'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'loyaltyPoints' || field === 'creditBalance' || field === 'totalSpent' || field === 'totalOrders') {
          updateData[field] = typeof body[field] === 'number' ? body[field] : parseFloat(String(body[field]));
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (body.nicheData !== undefined) {
      updateData.nicheData = body.nicheData ? JSON.stringify(body.nicheData) : null;
    }

    const customer = await db.customer.update({
      where: { id: customerId },
      data: updateData,
    });

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const existing = await db.customer.findUnique({ where: { id: customerId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    await db.customer.delete({ where: { id: customerId } });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
