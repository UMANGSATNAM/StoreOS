import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const body = await request.json();

    const existing = await db.student.findUnique({ where: { id: studentId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'phone', 'email', 'parentPhone', 'batch', 'course', 'feeTotal', 'feePaid', 'status'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'feeTotal' || field === 'feePaid') {
          updateData[field] = parseFloat(String(body[field]));
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Record fee payment
    if (body.payAmount !== undefined) {
      const payAmount = parseFloat(String(body.payAmount));
      updateData.feePaid = (existing.feePaid || 0) + payAmount;
    }

    const student = await db.student.update({
      where: { id: studentId },
      data: updateData,
    });

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
