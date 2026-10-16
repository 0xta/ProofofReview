import { NextRequest, NextResponse } from 'next/server';
import { getPromotions } from '@/lib/services/promotions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('placeId') || undefined;

    const promotions = await getPromotions(placeId);
    return NextResponse.json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}
