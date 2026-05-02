import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params;
    const body = await request.json();

    const existing = await db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['registrationNumber', 'make', 'model', 'year', 'ownerName', 'ownerPhone', 'lastServiceDate'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'year') {
          updateData[field] = parseInt(String(body[field]), 10);
        } else if (field === 'lastServiceDate') {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const vehicle = await db.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
