import { NextRequest, NextResponse } from 'next/server';
import { getPlaceById } from '@/lib/services/places';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params;
    if (!placeId) {
      return NextResponse.json({ success: false, error: 'Missing place ID' }, { status: 400 });
    }

    const place = await getPlaceById(placeId);
    if (!place) {
      return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: place });
  } catch (error: any) {
    console.error('API /api/places/[placeId] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch place' },
      { status: 500 }
    );
  }
}
