import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ staffId: string }> }
) {
  try {
    const { staffId } = await params;
    const body = await request.json();
    const { name, phone, role, shiftStart, shiftEnd, salary, commission, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || null;
    if (role !== undefined) updateData.role = role;
    if (shiftStart !== undefined) updateData.shiftStart = shiftStart || null;
    if (shiftEnd !== undefined) updateData.shiftEnd = shiftEnd || null;
    if (salary !== undefined) updateData.salary = parseFloat(String(salary));
    if (commission !== undefined) updateData.commission = parseFloat(String(commission));
    if (isActive !== undefined) updateData.isActive = isActive;

    const staff = await db.staff.update({
      where: { id: staffId },
      data: updateData,
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ staffId: string }> }
) {
  try {
    const { staffId } = await params;

    await db.staff.delete({
      where: { id: staffId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete staff error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
