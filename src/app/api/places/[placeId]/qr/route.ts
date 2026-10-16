import { NextRequest, NextResponse } from 'next/server';
import { getPlaceById } from '@/lib/services/places';
import { generateShopQRCode } from '@/lib/services/shop-qr';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params;
    const place = await getPlaceById(placeId);
    if (!place) {
      return NextResponse.json(
        { success: false, error: 'Venue not found' },
        { status: 404 }
      );
    }

    const { origin } = new URL(request.url);
    const qrResult = await generateShopQRCode({
      placeId,
      venueName: place.name,
      baseUrl: origin,
    });

    return NextResponse.json({
      success: true,
      placeId,
      venueName: place.name,
      address: place.address,
      qrDataUrl: qrResult.qrDataUrl,
      nonce: qrResult.nonce,
      epochDate: qrResult.epochDate,
      payload: qrResult.payload,
    });
  } catch (error: any) {
    console.error('API /api/places/[placeId]/qr GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
