import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');
    const category = request.nextUrl.searchParams.get('category');
    const search = request.nextUrl.searchParams.get('search');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId query parameter is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { storeId, isActive: true };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ];
    }

    const products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId, name, categoryId, sku, barcode, price, costPrice,
      unit, stock, description, image, variants, nicheData,
    } = body;

    if (!storeId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'storeId, name, and price are required' },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        storeId,
        name,
        categoryId: categoryId || null,
        sku: sku || null,
        barcode: barcode || null,
        price: parseFloat(String(price)),
        costPrice: costPrice ? parseFloat(String(costPrice)) : 0,
        unit: unit || 'piece',
        stock: stock ? parseFloat(String(stock)) : 0,
        description: description || null,
        image: image || null,
        variants: variants ? JSON.stringify(variants) : null,
        nicheData: nicheData ? JSON.stringify(nicheData) : null,
      },
      include: { category: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
