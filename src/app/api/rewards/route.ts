import { NextRequest, NextResponse } from 'next/server';
import { getCustomerRewardSummary } from '@/lib/services/rewards';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Query parameter address (wallet address) is required.' },
        { status: 400 }
      );
    }

    const summary = await getCustomerRewardSummary(address);
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch rewards summary' },
      { status: 500 }
    );
  }
}
