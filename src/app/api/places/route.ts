import { NextRequest, NextResponse } from 'next/server';
import { getPlaces, getPlaceById } from '@/lib/services/places';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId') || searchParams.get('place_id');
    if (placeId) {
      const place = await getPlaceById(placeId);
      if (!place) {
        return NextResponse.json(
          { success: false, error: 'Place not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: place });
    }

    const search = searchParams.get('search') || undefined;
    const city = searchParams.get('city') || undefined;
    const serviceType = searchParams.get('serviceType') || undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const hasBounty = searchParams.get('hasBounty') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = await getPlaces({
      search,
      city,
      serviceType,
      minRating,
      hasBounty,
      limit: Math.min(limit, 100),
      offset: Math.max(offset, 0),
    });

    return NextResponse.json({
      success: true,
      data: result.places,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + limit < result.total,
      },
    });
  } catch (error: any) {
    console.error('API /api/places error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch places' },
      { status: 500 }
    );
  }
}
