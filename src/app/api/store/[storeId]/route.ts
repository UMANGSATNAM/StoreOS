import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body = await request.json();

    const existingStore = await db.store.findUnique({ where: { id: storeId } });
    if (!existingStore) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'ownerName', 'niche', 'template', 'city', 'state',
      'gstNumber', 'phone', 'email', 'logo', 'address', 'currency',
      'taxRate', 'receiptHeader', 'receiptFooter', 'onboardingComplete',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const store = await db.store.update({
      where: { id: storeId },
      data: updateData,
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error('Update store error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
