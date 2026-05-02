import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    const subscription = await db.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Check if trial has expired
    const isTrialExpired = subscription.status === 'trial'
      && subscription.trialEndsAt
      && new Date() > subscription.trialEndsAt;

    return NextResponse.json({
      subscription: {
        ...subscription,
        isTrialExpired,
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const subscription = await db.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Mock Razorpay subscription activation
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const updatedSubscription = await db.subscription.update({
      where: { userId },
      data: {
        plan: plan || 'pro',
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        razorpaySubscriptionId: `sub_mock_${Date.now()}`,
      },
    });

    return NextResponse.json({
      subscription: updatedSubscription,
      message: 'Subscription activated successfully (mock Razorpay)',
    });
  } catch (error) {
    console.error('Activate subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
