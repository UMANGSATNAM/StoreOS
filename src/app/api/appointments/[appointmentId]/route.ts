import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;
    const body = await request.json();

    const existing = await db.appointment.findUnique({ where: { id: appointmentId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['customerName', 'customerPhone', 'service', 'staffName', 'duration', 'status', 'notes'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    if (body.date !== undefined) updateData.date = new Date(body.date);

    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    });

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
