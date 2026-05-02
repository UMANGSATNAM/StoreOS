import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();

    const existing = await db.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'categoryId', 'sku', 'barcode', 'price', 'costPrice',
      'unit', 'stock', 'lowStockAlert', 'description', 'image', 'isActive',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === 'price' || field === 'costPrice' || field === 'stock' || field === 'lowStockAlert'
          ? parseFloat(String(body[field]))
          : body[field];
      }
    }

    if (body.variants !== undefined) {
      updateData.variants = body.variants ? JSON.stringify(body.variants) : null;
    }
    if (body.nicheData !== undefined) {
      updateData.nicheData = body.nicheData ? JSON.stringify(body.nicheData) : null;
    }

    const product = await db.product.update({
      where: { id: productId },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const existing = await db.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await db.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
