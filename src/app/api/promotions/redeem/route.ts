import { NextRequest, NextResponse } from 'next/server';
import { redeemPromotion } from '@/lib/services/promotions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promotionId, customerAddress } = body;

    if (!promotionId || !customerAddress) {
      return NextResponse.json(
        { success: false, error: 'Promotion ID and customer wallet address are required.' },
        { status: 400 }
      );
    }

    const result = await redeemPromotion(promotionId, customerAddress);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Voucher redeemed! 80% (${result.burnedTaste} $TASTE) burned deflationarily; 20% (${result.merchantReceivedTaste} $TASTE) paid to merchant. Voucher Code: ${result.redemptionCode}`,
    });
  } catch (error: any) {
    console.error('Error redeeming promotion:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to redeem promotion',
      },
      { status: 400 }
    );
  }
}
