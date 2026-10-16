import { pool } from '../src/lib/db';
import {
  computeSlipRefHash,
  computePhotoPHash,
  isSlipAlreadyUsed,
  parseDiningReceipt,
} from '../src/lib/services/receipt-ocr';
import { submitReview, getPlaceReviews } from '../src/lib/services/reviews';
import { getCustomerRewardSummary, claimCustomerRewards } from '../src/lib/services/rewards';
import { getPromotions, redeemPromotion } from '../src/lib/services/promotions';
import { generateDailyNonce } from '../src/lib/services/shop-qr';

async function runPhase4Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 4 AUTOMATED TESTS & VERIFICATIONS');
  console.log('   (Receipt OCR, Anti-Replay, Review Engine & Claims)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}${detail ? ` (${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // Pick a test venue from database
    const placeRes = await pool.query(
      'SELECT place_id, name, latitude, longitude FROM places WHERE latitude IS NOT NULL LIMIT 1'
    );
    const testPlace = placeRes.rows[0];
    const placeId = testPlace.place_id;
    const placeLat = Number(testPlace.latitude);
    const placeLng = Number(testPlace.longitude);

    console.log(`--- Testing with Venue: "${testPlace.name}" (${placeId}) ---`);

    // Clean up any test reviews for this specific test run address
    const testDinerAddr = '0x1111222233334444555566667777888899990000';
    await pool.query('DELETE FROM customer_claimable_rewards WHERE LOWER(customer_address) = $1', [
      testDinerAddr.toLowerCase(),
    ]);
    await pool.query('DELETE FROM pioneer_claims WHERE LOWER(pioneer_address) = $1', [
      testDinerAddr.toLowerCase(),
    ]);
    await pool.query('DELETE FROM verified_reviews WHERE LOWER(reviewer_address) = $1', [
      testDinerAddr.toLowerCase(),
    ]);

    // ----------------------------------------------------
    // 1. Receipt Slip OCR & Anti-Replay Hashing
    // ----------------------------------------------------
    console.log('\n--- 1. Testing Dining Receipt Slip OCR & Hash ---');
    const mockOcr = await parseDiningReceipt(placeId, 'mock_receipt_image', testPlace.name);
    assert(mockOcr.amountThb > 0, 'Receipt OCR extracted positive THB amount', `THB ${mockOcr.amountThb}`);
    assert(!!mockOcr.slipReference, 'Receipt OCR generated slip reference', mockOcr.slipReference);
    assert(mockOcr.slipRefHash.startsWith('0x'), 'Slip SHA-256 hash formatted as 0x hex', mockOcr.slipRefHash.substring(0, 16) + '...');

    const expectedHash = computeSlipRefHash(placeId, mockOcr.slipReference, mockOcr.amountThb);
    assert(mockOcr.slipRefHash === expectedHash, 'Slip hash matches deterministic sha256(place:ref:amount)');

    const pHash = computePhotoPHash('sample_food_photo_base64_content');
    assert(pHash.startsWith('phash_'), 'Food photo pHash fingerprint generated', pHash);

    // ----------------------------------------------------
    // 2. GPS Haversine Rejection
    // ----------------------------------------------------
    console.log('\n--- 2. Testing GPS Proximity Check ---');
    let distantGpsFailed = false;
    try {
      await submitReview({
        placeId,
        reviewerAddress: testDinerAddr,
        verificationTier: 1,
        rating: 5,
        reviewText: 'Great food but I am submitting from 10km away!',
        userLatitude: placeLat + 0.1, // ~11 km away
        userLongitude: placeLng + 0.1,
        customSlipRef: 'TEST-GPS-DISTANT',
        customAmountThb: 300,
      });
    } catch (err: any) {
      if (err.message.includes('GPS proximity check failed')) {
        distantGpsFailed = true;
      }
    }
    assert(distantGpsFailed, 'Distant diner submission correctly rejected (> 100m)');

    // ----------------------------------------------------
    // 3. Option 1 (Receipt Slip) Submission & Pioneer Multiplier
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Option 1 (Dining Receipt Slip) Submission ---');
    const slipRefA = 'SLIP-' + Date.now();
    const reviewResult1 = await submitReview({
      placeId,
      reviewerAddress: testDinerAddr,
      verificationTier: 1,
      rating: 5,
      reviewText: 'Authentic flavors, highly recommended dining experience!',
      userLatitude: placeLat, // Right at venue (0m distance)
      userLongitude: placeLng,
      customSlipRef: slipRefA,
      customAmountThb: 450,
      foodPhoto: 'data:image/png;base64,samplefoodphoto1',
    });

    assert(!!reviewResult1.reviewId, 'Option 1 review successfully persisted in DB', `Review ID: ${reviewResult1.reviewId}`);
    assert(reviewResult1.rewards.baseTaste === 10.0, 'Option 1 awarded 10 base $TASTE tokens');
    assert(reviewResult1.rewards.totalTaste >= 10.0, 'Total rewards correctly calculated', `${reviewResult1.rewards.totalTaste} $TASTE`);
    assert(reviewResult1.slipDetails?.slipRef === slipRefA, 'Receipt slip reference recorded');

    // ----------------------------------------------------
    // 4. Anti-Replay: Duplicate Receipt Slip Rejection
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Receipt Slip Anti-Replay Protection ---');
    let duplicateRejected = false;
    try {
      await submitReview({
        placeId,
        reviewerAddress: testDinerAddr,
        verificationTier: 1,
        rating: 4,
        reviewText: 'Trying to reuse the same receipt slip for another review!',
        userLatitude: placeLat,
        userLongitude: placeLng,
        customSlipRef: slipRefA, // Replay same slip
        customAmountThb: 450,
      });
    } catch (err: any) {
      if (err.message.includes('Duplicate Receipt Slip') || err.message.includes('Anti-replay')) {
        duplicateRejected = true;
      }
    }
    assert(duplicateRejected, 'Duplicate receipt slip submission strictly REJECTED (Anti-replay)');

    // ----------------------------------------------------
    // 5. Option 2 (Shop QR) Submission & Voice Audio Link
    // ----------------------------------------------------
    console.log('\n--- 5. Testing Option 2 (Shop QR) Submission ---');
    const qrNonce = generateDailyNonce(placeId);
    const reviewResult2 = await submitReview({
      placeId,
      reviewerAddress: testDinerAddr,
      verificationTier: 2,
      rating: 5,
      reviewText: 'Scanned counter stand in person. Wonderful atmosphere!',
      userLatitude: placeLat,
      userLongitude: placeLng,
      qrNonce: qrNonce,
      foodPhoto: 'data:image/png;base64,samplefoodphoto2',
    });

    assert(!!reviewResult2.reviewId, 'Option 2 review successfully registered', `Review ID: ${reviewResult2.reviewId}`);
    assert(reviewResult2.rewards.baseTaste === 5.0, 'Option 2 awarded 5 base $TASTE tokens');
    assert(!!reviewResult2.voiceAudioUrl, 'Retrieved active ElevenLabs Thai voice greeting URL', reviewResult2.voiceAudioUrl);

    // ----------------------------------------------------
    // 6. Customer Rewards Ledger & Asynchronous Accumulator
    // ----------------------------------------------------
    console.log('\n--- 6. Testing Customer Rewards Ledger & Claim Engine ---');
    const summary = await getCustomerRewardSummary(testDinerAddr);
    assert(summary.unclaimedItems.length >= 2, 'Unclaimed reward items stored in DB', `Found: ${summary.unclaimedItems.length}`);
    assert(summary.unclaimedTaste >= 15.0, 'Total accumulated claimable $TASTE calculated', `${summary.unclaimedTaste} $TASTE`);

    // Claim all rewards to wallet
    const claimResult = await claimCustomerRewards(testDinerAddr);
    assert(claimResult.itemsClaimedCount >= 2, 'Successfully batch-claimed all unclaimed items', `Items: ${claimResult.itemsClaimedCount}`);
    assert(claimResult.claimedTaste >= 15.0, 'Total claimed $TASTE settled', `${claimResult.claimedTaste} $TASTE`);
    assert(claimResult.txHash.startsWith('0x'), 'Generated valid transaction settlement hash', claimResult.txHash.substring(0, 16) + '...');
    assert(claimResult.explorerUrl.includes('snowtrace.io'), 'Generated valid Snowtrace explorer URL');

    // Confirm that balance is now 0 unclaimed
    const postClaimSummary = await getCustomerRewardSummary(testDinerAddr);
    assert(postClaimSummary.unclaimedTaste === 0, 'Unclaimed balance now cleanly 0 $TASTE after claim');
    assert(postClaimSummary.claimedItems.length >= 2, 'Claimed ledger displays settled items');

    // ----------------------------------------------------
    // 7. Tokenomist 80/20 Deflationary Burn Voucher Redemption
    // ----------------------------------------------------
    console.log('\n--- 7. Testing 80/20 Voucher Burn Redemption ---');
    const promos = await getPromotions();
    assert(promos.length > 0, 'Retrieved active merchant discount promotions', `Count: ${promos.length}`);

    const promoToRedeem = promos[0];
    const redemption = await redeemPromotion(promoToRedeem.id, testDinerAddr);

    const expectedBurn = Math.round(promoToRedeem.cost_in_taste * 0.8 * 100) / 100;
    const expectedMerchant = Math.round((promoToRedeem.cost_in_taste - expectedBurn) * 100) / 100;

    assert(redemption.burnedTaste === expectedBurn, '80% of $TASTE tokens burned deflationarily', `${redemption.burnedTaste} $TASTE burned`);
    assert(redemption.merchantReceivedTaste === expectedMerchant, '20% of $TASTE tokens credited to merchant', `${redemption.merchantReceivedTaste} $TASTE to merchant`);
    assert(redemption.redemptionCode.startsWith('TC-'), 'Issued unique customer redemption code', redemption.redemptionCode);

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    await pool.end();
    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during test run:', error);
    await pool.end();
    process.exit(1);
  }
}

runPhase4Tests();
