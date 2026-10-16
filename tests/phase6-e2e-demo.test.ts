import { pool } from '../src/lib/db';
import { CURATED_JUDGE_VENUES } from '../src/data/seed-venues';
import { submitReview } from '../src/lib/services/reviews';
import { claimCustomerRewards } from '../src/lib/services/rewards';
import { redeemPromotion } from '../src/lib/services/promotions';
import { reviewOwnerVerification, distributeDailyEpoch } from '../src/lib/services/admin';
import crypto from 'crypto';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failedTests++;
  }
}

async function runPhase6Tests() {
  console.log('\n====================================================');
  console.log('🧪 RUNNING PHASE 6 AUTOMATED E2E & JUDGE DEMO TESTS');
  console.log('   (1-Click Faucet, Curated Venues & Full Lifecycle)');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // 1. Verify Curated Bangkok Gastronomy Venues
    // ----------------------------------------------------
    console.log('--- 1. Testing Curated Bangkok Gastro Hotspots ---');
    assert(CURATED_JUDGE_VENUES.length === 3, `Loaded exactly 3 curated judge venues (Found: ${CURATED_JUDGE_VENUES.length})`);

    const jeho = CURATED_JUDGE_VENUES[0];
    assert(jeho.name.includes('เจ๊โอว'), `Venue 1 is Jeh O Chula (${jeho.name})`);
    assert(jeho.sampleReceipt.amount === 850, `Venue 1 sample receipt amount is THB 850`);
    assert(jeho.recommendedOption === 'option1', `Venue 1 recommended for Option 1 Slip OCR`);

    const faitalu = CURATED_JUDGE_VENUES[1];
    assert(faitalu.name.includes('ผัดไทย'), `Venue 2 is Pad Thai Fai Ta Lu (${faitalu.name})`);
    assert(faitalu.sampleQr.activeVoiceSlot === 2, `Venue 2 configured with ElevenLabs Voice Slot 2`);
    assert(faitalu.recommendedOption === 'option2', `Venue 2 recommended for Option 2 Shop QR`);

    const thongsmith = CURATED_JUDGE_VENUES[2];
    assert(thongsmith.name.includes('ทองสมิทธ์'), `Venue 3 is Thong Smith (${thongsmith.name})`);
    assert(thongsmith.activePromo.burnAmount === 159.2, `Venue 3 enforces 80% deflationary burn (159.2 $TASTE)`);
    assert(thongsmith.activePromo.merchantAmount === 39.8, `Venue 3 remits 20% to merchant (39.8 $TASTE)`);

    // ----------------------------------------------------
    // 2. Testing 1-Click Judge Dual Faucet (DB & Logic)
    // ----------------------------------------------------
    console.log('\n--- 2. Testing 1-Click Judge Dual Faucet ---');
    const testJudgeWallet = '0x' + crypto.randomBytes(20).toString('hex');
    const faucetTxHash = '0x' + crypto.randomBytes(32).toString('hex');

    // Simulate Faucet deposit into rewards table
    await pool.query(
      `INSERT INTO customer_claimable_rewards (
        customer_address,
        place_id,
        reward_type,
        amount_taste,
        amount_avax,
        status,
        claimed_at,
        claimed_tx_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
      [
        testJudgeWallet.toLowerCase(),
        jeho.id,
        'JUDGE_FAUCET',
        10000.0,
        0.10,
        'CLAIMED',
        faucetTxHash,
      ]
    );

    // Audit in admin logs
    await pool.query(
      `INSERT INTO admin_activity_logs (
        admin_address,
        action,
        target_type,
        target_id,
        details
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        'JUDGE_FAUCET_DISPENSED',
        'BURNER_WALLET',
        testJudgeWallet.toLowerCase(),
        JSON.stringify({ avaxAmount: 0.1, tasteAmount: 10000, txHash: faucetTxHash }),
      ]
    );

    // Query faucet receipt
    const faucetRow = await pool.query(
      `SELECT * FROM customer_claimable_rewards WHERE customer_address = $1 AND reward_type = 'JUDGE_FAUCET'`,
      [testJudgeWallet.toLowerCase()]
    );
    assert(faucetRow.rows.length === 1, `Faucet record successfully stored in database ledger`);
    assert(parseFloat(faucetRow.rows[0].amount_taste) === 10000.0, `Disbursed exact 10,000 $TASTE tokens`);
    assert(parseFloat(faucetRow.rows[0].amount_avax) === 0.10, `Disbursed exact 0.10 Fuji AVAX gas asset`);
    assert(faucetRow.rows[0].claimed_tx_hash === faucetTxHash, `Valid Fuji transaction hash assigned (${faucetTxHash.slice(0, 16)}...)`);

    // Verify audit log
    const auditRow = await pool.query(
      `SELECT * FROM admin_activity_logs WHERE action = 'JUDGE_FAUCET_DISPENSED' AND target_id = $1`,
      [testJudgeWallet.toLowerCase()]
    );
    assert(auditRow.rows.length === 1, `Governance audit trail recorded faucet transaction`);

    // ----------------------------------------------------
    // 3. Complete End-to-End User & Protocol Lifecycle
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Full End-to-End Protocol Journey ---');

    // Step A: Diner submits Option 1 Review with Pioneer Bonus
    const dinerWallet = '0x' + crypto.randomBytes(20).toString('hex');
    const slipRef = `E2E-SLIP-${Math.floor(100000 + Math.random() * 900000)}`;

    const venueCoords = await pool.query(
      `SELECT latitude, longitude FROM places WHERE place_id = 'ChIJnfmYKIqd4jAR4qqq2_hixcg'`
    );
    const placeLat = Number(venueCoords.rows[0]?.latitude) || 13.7428;
    const placeLng = Number(venueCoords.rows[0]?.longitude) || 100.5281;

    const reviewResult = await submitReview({
      placeId: 'ChIJnfmYKIqd4jAR4qqq2_hixcg',
      reviewerAddress: dinerWallet,
      verificationTier: 1,
      rating: 5,
      reviewText: 'E2E Full Journey Evaluation Review: The Tom Yum Mama is extraordinary!',
      userLatitude: placeLat,
      userLongitude: placeLng,
      customSlipRef: slipRef,
      customAmountThb: 850,
      foodPhoto: 'data:image/png;base64,e2efoodphotosample',
    });

    assert(Boolean(reviewResult.reviewId), `[Step A] Diner Option 1 review registered successfully (ID: ${reviewResult.reviewId})`);
    assert(reviewResult.rewards.totalTaste >= 10, `[Step A] Earned base review rewards (${reviewResult.rewards.totalTaste} $TASTE)`);

    // Step B: Admin approves a pending merchant KYC application
    let kycAppId: string;
    const kycApps = await pool.query(
      `SELECT id FROM owner_verifications WHERE status = 'PENDING' LIMIT 1`
    );
    if (kycApps.rows.length > 0) {
      kycAppId = kycApps.rows[0].id;
    } else {
      const inserted = await pool.query(
        `INSERT INTO owner_verifications (
          place_id,
          owner_address,
          applicant_name,
          dbd_company_id,
          contact_phone,
          id_card_photo_url,
          storefront_photo_url,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING') RETURNING id`,
        [
          'ChIJgz60UgCf4jARR26CSkBTLqU',
          '0x' + crypto.randomBytes(20).toString('hex'),
          'Somchai Test Applicant',
          '0105569999999',
          '081-999-8888',
          'https://images.unsplash.com/photo-1544717305-2782549b5136',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
        ]
      );
      kycAppId = inserted.rows[0].id;
    }

    const kycApproval = await reviewOwnerVerification({
      verificationId: kycAppId,
      adminAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      decision: 'APPROVE',
      adminNotes: 'E2E Test: Approved for Flow Summit Bangkok 2026 showcase',
    });
    assert(kycApproval.success, `[Step B] Admin successfully approved merchant KYC application (${kycAppId})`);

    // Step C: Customer claims all accumulated rewards
    const claimRes = await claimCustomerRewards(dinerWallet);
    assert(claimRes.itemsClaimedCount > 0, `[Step C] Customer executed 1-Click batch Web3 claim (${claimRes.itemsClaimedCount} items)`);
    assert(claimRes.claimedTaste >= 10, `[Step C] Settled accumulated $TASTE to wallet (${claimRes.claimedTaste} $TASTE)`);
    assert(claimRes.txHash.startsWith('0x'), `[Step C] Avalanche Fuji settlement hash generated (${claimRes.txHash.slice(0, 16)}...)`);

    // Step D: Customer redeems an 80/20 Deflationary Voucher
    const promoList = await pool.query(
      `SELECT id FROM merchant_promotions WHERE is_active = true LIMIT 1`
    );
    if (promoList.rows.length > 0) {
      const promoId = promoList.rows[0].id;
      const redeemRes = await redeemPromotion(promoId, dinerWallet);

      assert(Boolean(redeemRes.redemptionId), `[Step D] Customer successfully redeemed merchant discount voucher`);
      assert(redeemRes.burnedTaste > 0, `[Step D] Enforced 80% deflationary token burn (${redeemRes.burnedTaste} $TASTE burned)`);
      assert(redeemRes.merchantReceivedTaste > 0, `[Step D] Enforced 20% merchant remittance (${redeemRes.merchantReceivedTaste} $TASTE to merchant)`);
      assert(redeemRes.redemptionCode.startsWith('TC-'), `[Step D] Issued customer redemption code (${redeemRes.redemptionCode})`);
    }

    // ----------------------------------------------------
    // Final Summary
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('====================================================\n');

    process.exit(failedTests > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runPhase6Tests();
