import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const body = await request.json();

    const existing = await db.category.findUnique({ where: { id: categoryId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'icon', 'color', 'sortOrder'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'sortOrder') {
          updateData[field] = parseInt(String(body[field]), 10);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (body.nicheData !== undefined) {
      updateData.nicheData = body.nicheData ? JSON.stringify(body.nicheData) : null;
    }

    const category = await db.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

    const existing = await db.category.findUnique({ where: { id: categoryId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Set all products in this category to uncategorized (categoryId = null)
    await db.product.updateMany({
      where: { categoryId },
      data: { categoryId: null },
    });

    await db.category.delete({ where: { id: categoryId } });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
