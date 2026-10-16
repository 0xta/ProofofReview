import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { getPlaceById } from '@/lib/services/places';
import { isWithinVenueProximity } from '@/lib/utils/gps';
import { verifyShopDailyNonce } from '@/lib/services/shop-qr';
import { getShopVoices, ShopVoice } from '@/lib/services/elevenlabs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      place_id,
      customer_address,
      gps_latitude,
      gps_longitude,
      nonce,
      skip_gps_check = false, // Allow bypass for hackathon mock simulator
    } = body;

    if (!place_id || !customer_address) {
      return NextResponse.json(
        { success: false, error: 'Missing place_id or customer_address' },
        { status: 400 }
      );
    }

    const place = await getPlaceById(place_id);
    if (!place) {
      return NextResponse.json(
        { success: false, error: 'Venue not found in database' },
        { status: 404 }
      );
    }

    // 1. Verify Dynamic Nonce
    if (nonce) {
      const isValidNonce = verifyShopDailyNonce(place_id, nonce);
      if (!isValidNonce && !skip_gps_check) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid or expired shop QR nonce. Please scan the current counter QR.',
          },
          { status: 403 }
        );
      }
    }

    // 2. Verify GPS Proximity (<= 100 meters)
    let distanceMeters = 0;
    if (
      !skip_gps_check &&
      place.latitude !== null &&
      place.longitude !== null &&
      gps_latitude !== undefined &&
      gps_longitude !== undefined
    ) {
      const proximity = isWithinVenueProximity(
        parseFloat(gps_latitude),
        parseFloat(gps_longitude),
        Number(place.latitude),
        Number(place.longitude),
        100
      );

      distanceMeters = proximity.distanceMeters;

      if (!proximity.isWithin) {
        return NextResponse.json(
          {
            success: false,
            error: `GPS distance too far (${distanceMeters}m). You must be within 100m of the restaurant.`,
            distanceMeters,
          },
          { status: 400 }
        );
      }
    }

    // 3. Select One of the 3 Active Thai Voice Slots
    const voices = await getShopVoices(place_id, place.name);
    const activeVoices = voices.filter((v) => v.is_active);
    const selectedVoice: ShopVoice =
      activeVoices.length > 0
        ? activeVoices[Math.floor(Math.random() * activeVoices.length)]
        : voices[0];

    // Increment voice play count
    if (selectedVoice?.id) {
      await query('UPDATE shop_voices SET play_count = play_count + 1 WHERE id = $1', [
        selectedVoice.id,
      ]);
    }

    // 4. Record In-Store Check-in
    const placeHash =
      '0x' + crypto.createHash('sha256').update(place_id).digest('hex');

    const checkinRows = await query<{ id: string }>(
      `INSERT INTO in_store_qr_checkins (
        place_id, place_hash, customer_address, gps_latitude, gps_longitude, gps_distance_meters, dispatched_voice_id, epoch_points_awarded
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 3)
      RETURNING id;`,
      [
        place_id,
        placeHash,
        customer_address.toLowerCase(),
        gps_latitude || place.latitude,
        gps_longitude || place.longitude,
        distanceMeters,
        selectedVoice?.id || null,
      ]
    );

    // 5. Accumulate Customer Reward (3 Points / $TASTE in DB)
    await query(
      `INSERT INTO customer_claimable_rewards (
        customer_address, place_id, reward_type, amount_taste, status
      )
      VALUES ($1, $2, 'EPOCH_MINING', 3.0, 'UNCLAIMED');`,
      [customer_address.toLowerCase(), place_id]
    );

    return NextResponse.json({
      success: true,
      checkinId: checkinRows[0]?.id,
      venueName: place.name,
      epochPointsAwarded: 3,
      distanceMeters,
      voice: {
        title: selectedVoice.title,
        scriptText: selectedVoice.script_text,
        audioUrl: selectedVoice.audio_url,
        durationSeconds: selectedVoice.duration_seconds,
        slotNumber: selectedVoice.slot_number,
      },
    });
  } catch (error: any) {
    console.error('API /api/checkin/qr error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Check-in oracle failed' },
      { status: 500 }
    );
  }
}
