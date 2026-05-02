import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const body = await request.json();

    const existing = await db.member.findUnique({ where: { id: memberId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'phone', 'email', 'plan', 'status', 'trainerName'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // Handle renewal: update startDate, endDate, and status
    if (body.renew === true) {
      const plan = body.plan || existing.plan;
      const start = new Date();
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
      updateData.startDate = start;
      updateData.endDate = end;
      updateData.status = 'active';
      if (body.plan) updateData.plan = plan;
    }

    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);

    const member = await db.member.update({
      where: { id: memberId },
      data: updateData,
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
