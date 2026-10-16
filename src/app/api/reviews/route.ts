import { NextRequest, NextResponse } from 'next/server';
import { getPlaceReviews } from '@/lib/services/reviews';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('placeId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: 'Query parameter placeId is required.' },
        { status: 400 }
      );
    }

    const reviews = await getPlaceReviews(placeId, limit);
    return NextResponse.json({
      success: true,
      placeId,
      count: reviews.length,
      reviews,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
