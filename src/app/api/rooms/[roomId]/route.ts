import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();

    const existing = await db.room.findUnique({ where: { id: roomId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['number', 'type', 'pricePerNight', 'capacity', 'floor', 'amenities', 'status'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'pricePerNight') {
          updateData[field] = parseFloat(String(body[field]));
        } else if (field === 'capacity' || field === 'floor') {
          updateData[field] = parseInt(String(body[field]), 10);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const room = await db.room.update({
      where: { id: roomId },
      data: updateData,
    });

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Update room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
