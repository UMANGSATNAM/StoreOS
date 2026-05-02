import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = createHash('sha256').update(password).digest('hex');

    // Create user and subscription in a transaction
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        subscription: {
          create: {
            plan: 'basic',
            status: 'trial',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
          },
        },
      },
      include: {
        store: true,
        subscription: true,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { user: userWithoutPassword, message: 'Registration successful' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    // Provide specific error messages instead of generic "Internal server error"
    if (error instanceof Error) {
      if (error.message.includes('UNIQUE constraint')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in instead.' },
          { status: 409 }
        );
      }
      if (error.message.includes('FOREIGN KEY') || error.message.includes('foreign')) {
        return NextResponse.json(
          { error: 'Database relationship error. Please try again.' },
          { status: 500 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Unable to create account right now. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
