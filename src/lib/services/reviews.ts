import crypto from 'crypto';
import { pool } from '@/lib/db';
import { calculateDistanceMeters, isWithinProximity } from '@/lib/utils/gps';
import {
  parseDiningReceipt,
  computeSlipRefHash,
  computePhotoPHash,
  isSlipAlreadyUsed,
} from './receipt-ocr';
import { verifyDailyNonce } from './shop-qr';
import { getShopVoices } from './elevenlabs';

export interface SubmitReviewInput {
  placeId: string;
  reviewerAddress: string;
  verificationTier: 1 | 2; // 1: Receipt Slip, 2: Shop QR
  rating: number; // 1-5
  reviewText: string;
  userLatitude: number;
  userLongitude: number;
  foodPhoto?: string;
  // Option 1 parameters
  receiptSlip?: string;
  customSlipRef?: string;
  customAmountThb?: number;
  // Option 2 parameters
  qrNonce?: string;
}

export interface ReviewSubmissionResult {
  reviewId: string;
  placeId: string;
  venueName: string;
  reviewerAddress: string;
  verificationTier: 1 | 2;
  rating: number;
  reviewText: string;
  isPioneer: boolean;
  pioneerSlot: number | null;
  gpsDistanceMeters: number;
  rewards: {
    baseTaste: number;
    pioneerTaste: number;
    totalTaste: number;
    bountyAvax: number;
  };
  slipDetails?: {
    slipRef: string;
    amountThb: number;
    slipRefHash: string;
  };
  voiceAudioUrl?: string;
  createdAt: string;
}

/**
 * Helper to compute deterministic keccak256 or sha256 placeHash
 */
export function getPlaceHash(placeId: string): string {
  return '0x' + crypto.createHash('sha256').update(placeId).digest('hex');
}

/**
 * Submits a verified review under Option 1 (Dining Receipt Slip OCR) or Option 2 (Shop QR).
 * Implements GPS proximity, anti-replay, Pioneer 2x multiplier, and reward accumulator.
 */
export async function submitReview(input: SubmitReviewInput): Promise<ReviewSubmissionResult> {
  const {
    placeId,
    reviewerAddress,
    verificationTier,
    rating,
    reviewText,
    userLatitude,
    userLongitude,
    foodPhoto,
    receiptSlip,
    customSlipRef,
    customAmountThb,
    qrNonce,
  } = input;

  if (!placeId || !reviewerAddress) {
    throw new Error('Place ID and Reviewer wallet address are required.');
  }

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5 stars.');
  }

  // 1. Fetch place coordinates & name
  const placeRes = await pool.query(
    'SELECT place_id, name, latitude, longitude FROM places WHERE place_id = $1 LIMIT 1',
    [placeId]
  );

  if (placeRes.rows.length === 0) {
    throw new Error(`Venue with ID ${placeId} not found.`);
  }

  const place = placeRes.rows[0];
  const placeLat = Number(place.latitude) || 13.7563;
  const placeLng = Number(place.longitude) || 100.5018;

  // 2. GPS Proximity Verification (< 100m)
  const distanceMeters = calculateDistanceMeters(
    Number(userLatitude),
    Number(userLongitude),
    placeLat,
    placeLng
  );

  if (distanceMeters > 100) {
    throw new Error(
      `GPS proximity check failed: You are ${Math.round(distanceMeters)}m away from "${place.name}". Maximum allowed distance is 100 meters.`
    );
  }

  // 3. Tier-Specific Proof Verification
  let slipRefHash: string | null = null;
  let slipAmountThb: number | null = null;
  let slipRefNum: string | null = null;
  let ocrRaw: any = null;
  let voiceAudioUrl: string | undefined;

  if (verificationTier === 1) {
    // --- Option 1: Dining Receipt Slip ---
    let ocrResult;
    if (customSlipRef && customAmountThb) {
      slipRefNum = customSlipRef;
      slipAmountThb = customAmountThb;
      slipRefHash = computeSlipRefHash(placeId, slipRefNum, slipAmountThb);
      ocrRaw = {
        slipReference: slipRefNum,
        amountThb: slipAmountThb,
        source: 'DIRECT_INPUT',
      };
    } else {
      ocrResult = await parseDiningReceipt(placeId, receiptSlip || 'mock_receipt', place.name);
      slipRefNum = ocrResult.slipReference;
      slipAmountThb = ocrResult.amountThb;
      slipRefHash = ocrResult.slipRefHash;
      ocrRaw = ocrResult;
    }

    // Anti-replay check against existing database reviews
    const alreadyUsed = await isSlipAlreadyUsed(slipRefHash);
    if (alreadyUsed) {
      throw new Error(
        `Duplicate Receipt Slip: This dining receipt slip (Hash: ${slipRefHash.substring(0, 12)}...) has already been registered on TasteChain BKK. Anti-replay verification failed.`
      );
    }
  } else if (verificationTier === 2) {
    // --- Option 2: Dynamic Shop QR Code ---
    if (!qrNonce) {
      throw new Error('Shop QR Code daily nonce is required for Option 2 verification.');
    }

    const isValidNonce = verifyDailyNonce(placeId, qrNonce);
    if (!isValidNonce) {
      throw new Error('Invalid or expired Shop QR nonce. Please rescan the physical counter stand.');
    }

    // Retrieve active voice audio URL for greeting playback
    try {
      const voices = await getShopVoices(placeId, place.name);
      const activeVoice = voices.find((v) => v.is_active) || voices[0];
      if (activeVoice) {
        voiceAudioUrl = activeVoice.audio_url;
      }
    } catch (e) {
      // Non-critical, fallback to default wav
      voiceAudioUrl = '/audio/voices/default_greeting.wav';
    }
  } else {
    throw new Error('Invalid verification tier. Must be 1 (Receipt Slip) or 2 (Shop QR).');
  }

  // 4. Food Photo pHash
  const foodPhotoPhash = foodPhoto
    ? computePhotoPHash(foodPhoto)
    : 'phash_' + crypto.randomBytes(8).toString('hex');

  // 5. Pioneer Status Evaluation (< 3 verified reviews for this venue)
  const countRes = await pool.query(
    'SELECT count(*) FROM verified_reviews WHERE place_id = $1',
    [placeId]
  );
  const currentReviewsCount = parseInt(countRes.rows[0].count, 10);
  const isPioneer = currentReviewsCount < 3;
  const pioneerSlot = isPioneer ? currentReviewsCount + 1 : null;

  // 6. Rewards Allocation Calculation
  const baseTaste = verificationTier === 1 ? 10.0 : 5.0;
  const pioneerTaste = isPioneer ? baseTaste : 0.0;
  const totalTaste = baseTaste + pioneerTaste;

  // Check for active merchant AVAX visit bounty
  let bountyAvax = 0.0;
  let bountyIdToUpdate: string | null = null;
  const bountyRes = await pool.query(
    `SELECT id, remaining_budget_avax, reward_per_visit_avax 
     FROM merchant_bounties 
     WHERE place_id = $1 AND status = 'ACTIVE' AND remaining_budget_avax >= reward_per_visit_avax
     ORDER BY created_at DESC 
     LIMIT 1`,
    [placeId]
  );

  if (bountyRes.rows.length > 0) {
    const bounty = bountyRes.rows[0];
    bountyAvax = Number(bounty.reward_per_visit_avax);
    bountyIdToUpdate = bounty.id;
  }

  // 7. Database Transactions
  const client = await pool.connect();
  let reviewId: string;
  const placeHash = getPlaceHash(placeId);
  const simulatedOnchainTx = '0x' + crypto.randomBytes(32).toString('hex');

  try {
    await client.query('BEGIN');

    // Insert into verified_reviews
    const insertReviewQuery = `
      INSERT INTO verified_reviews (
        place_id,
        place_hash,
        reviewer_address,
        rating,
        review_text,
        verification_tier,
        gps_latitude,
        gps_longitude,
        gps_distance_meters,
        slip_amount_thb,
        slip_ref_hash,
        slip_ocr_raw,
        food_photo_phash,
        photo_url,
        is_pioneer,
        pioneer_slot,
        bounty_reward_avax,
        epoch_points_awarded,
        onchain_tx_hash,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'VERIFIED'
      )
      RETURNING id, created_at;
    `;

    const reviewInsertRes = await client.query(insertReviewQuery, [
      placeId,
      placeHash,
      reviewerAddress,
      rating,
      reviewText,
      verificationTier,
      userLatitude,
      userLongitude,
      distanceMeters,
      slipAmountThb,
      slipRefHash,
      ocrRaw ? JSON.stringify(ocrRaw) : null,
      foodPhotoPhash,
      foodPhoto ? foodPhoto.substring(0, 500) : null,
      isPioneer,
      pioneerSlot,
      bountyAvax,
      totalTaste,
      simulatedOnchainTx,
    ]);

    reviewId = reviewInsertRes.rows[0].id;
    const createdAt = reviewInsertRes.rows[0].created_at;

    // Record Pioneer Claim if applicable
    if (isPioneer && pioneerSlot !== null) {
      await client.query(
        `INSERT INTO pioneer_claims (
          place_id, place_hash, slot_index, pioneer_address, review_id, onchain_tx_hash
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING`,
        [placeId, placeHash, pioneerSlot, reviewerAddress, reviewId, simulatedOnchainTx]
      );
    }

    // Deduct bounty budget if applicable
    if (bountyIdToUpdate && bountyAvax > 0) {
      await client.query(
        `UPDATE merchant_bounties 
         SET remaining_budget_avax = remaining_budget_avax - $1,
             total_claims = total_claims + 1
         WHERE id = $2`,
        [bountyAvax, bountyIdToUpdate]
      );
    }

    // Credit Customer Claimable Rewards (Base Taste)
    await client.query(
      `INSERT INTO customer_claimable_rewards (
        customer_address, place_id, review_id, reward_type, amount_taste, amount_avax, status
      ) VALUES ($1, $2, $3, $4, $5, 0, 'UNCLAIMED')`,
      [
        reviewerAddress,
        placeId,
        reviewId,
        verificationTier === 1 ? 'REVIEW_OPTION_1' : 'REVIEW_OPTION_2',
        baseTaste,
      ]
    );

    // Credit Pioneer Bonus (if applicable)
    if (isPioneer) {
      await client.query(
        `INSERT INTO customer_claimable_rewards (
          customer_address, place_id, review_id, reward_type, amount_taste, amount_avax, status
        ) VALUES ($1, $2, $3, 'PIONEER_BONUS', $4, 0, 'UNCLAIMED')`,
        [reviewerAddress, placeId, reviewId, pioneerTaste]
      );
    }

    // Credit AVAX Bounty (if applicable)
    if (bountyAvax > 0) {
      await client.query(
        `INSERT INTO customer_claimable_rewards (
          customer_address, place_id, review_id, reward_type, amount_taste, amount_avax, status
        ) VALUES ($1, $2, $3, 'BOUNTY', 0, $4, 'UNCLAIMED')`,
        [reviewerAddress, placeId, reviewId, bountyAvax]
      );
    }

    await client.query('COMMIT');

    return {
      reviewId,
      placeId,
      venueName: place.name,
      reviewerAddress,
      verificationTier,
      rating,
      reviewText,
      isPioneer,
      pioneerSlot,
      gpsDistanceMeters: Math.round(distanceMeters * 10) / 10,
      rewards: {
        baseTaste,
        pioneerTaste,
        totalTaste,
        bountyAvax,
      },
      slipDetails:
        verificationTier === 1 && slipRefNum && slipAmountThb && slipRefHash
          ? {
              slipRef: slipRefNum,
              amountThb: slipAmountThb,
              slipRefHash,
            }
          : undefined,
      voiceAudioUrl,
      createdAt,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Retrieves verified reviews for a venue
 */
export async function getPlaceReviews(placeId: string, limit = 10) {
  const res = await pool.query(
    `SELECT 
      id,
      reviewer_address,
      rating,
      review_text,
      verification_tier,
      is_pioneer,
      pioneer_slot,
      bounty_reward_avax,
      epoch_points_awarded,
      photo_url,
      onchain_tx_hash,
      created_at
     FROM verified_reviews 
     WHERE place_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [placeId, limit]
  );
  return res.rows;
}
