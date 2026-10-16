import { NextRequest, NextResponse } from 'next/server';
import { claimCustomerRewards } from '@/lib/services/rewards';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customerAddress = body.customerAddress || body.address;

    if (!customerAddress) {
      return NextResponse.json(
        { success: false, error: 'Customer wallet address is required.' },
        { status: 400 }
      );
    }

    const result = await claimCustomerRewards(customerAddress);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully claimed ${result.claimedTaste} $TASTE${
        result.claimedAvax > 0 ? ` + ${result.claimedAvax} AVAX` : ''
      } across ${result.itemsClaimedCount} reward items!`,
    });
  } catch (error: any) {
    console.error('Error claiming rewards:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to claim rewards',
      },
      { status: 400 }
    );
  }
}
