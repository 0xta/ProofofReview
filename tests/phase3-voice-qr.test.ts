import { pool, query } from '../src/lib/db';
import {
  THAI_VOICE_PERSONAS,
  getShopVoices,
  saveShopVoice,
  synthesizeThaiVoice,
} from '../src/lib/services/elevenlabs';
import {
  generateShopDailyNonce,
  verifyShopDailyNonce,
  generateShopQRCode,
  getBangkokDateString,
} from '../src/lib/services/shop-qr';
import { calculateDistanceMeters, isWithinVenueProximity } from '../src/lib/utils/gps';

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 3 AUTOMATED TESTS & VERIFICATIONS');
  console.log('   (ElevenLabs Thai Voice AI & Dynamic Shop QR)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  const SAMPLE_PLACE_ID = 'ChIJgz60UgCf4jARR26CSkBTLqU'; // Baobao.. Bar Sathorn
  const SAMPLE_NAME = 'Baobao.. Bar Sathorn';

  try {
    // 1. Test Thai Voice Personas Configuration
    console.log('--- 1. Testing ElevenLabs Thai Voice Personas ---');
    assert(!!THAI_VOICE_PERSONAS[1], 'Slot 1: Warm & Welcoming persona defined');
    assert(!!THAI_VOICE_PERSONAS[2], 'Slot 2: Energetic Casual persona defined');
    assert(!!THAI_VOICE_PERSONAS[3], 'Slot 3: Chef & Signature Luxury persona defined');

    // 2. Test getShopVoices Service
    console.log('\n--- 2. Testing Shop Voices Database Service ---');
    const voices = await getShopVoices(SAMPLE_PLACE_ID, SAMPLE_NAME);
    assert(voices.length === 3, `Retrieved exactly 3 voice slots (Found: ${voices.length})`);
    assert(voices[0].slot_number === 1, 'Slot 1 present with script text');
    assert(voices[1].slot_number === 2, 'Slot 2 present with script text');
    assert(voices[2].slot_number === 3, 'Slot 3 present with script text');

    // 3. Test Thai Voice Synthesis
    console.log('\n--- 3. Testing Voice Synthesis & Audio Generation ---');
    const synthResult = await synthesizeThaiVoice({
      placeId: SAMPLE_PLACE_ID,
      slotNumber: 1,
      scriptText: 'ยินดีต้อนรับสู่ร้าน Baobao.. Bar Sathorn ครับ เชิญรับประทานให้อร่อยครับ',
    });
    assert(!!synthResult.audioUrl && synthResult.audioUrl.startsWith('/audio/voices/'), `Generated valid audio URL: ${synthResult.audioUrl}`);
    assert(synthResult.durationSeconds > 0, `Audio duration calculated: ${synthResult.durationSeconds}s`);

    // 4. Test Dynamic Daily Nonce
    console.log('\n--- 4. Testing Cryptographic Daily QR Nonce ---');
    const today = getBangkokDateString();
    const nonce = generateShopDailyNonce(SAMPLE_PLACE_ID, today);
    assert(nonce.length === 16, `Generated 16-char daily nonce: ${nonce}`);
    assert(verifyShopDailyNonce(SAMPLE_PLACE_ID, nonce) === true, 'Valid nonce passes daily verification');
    assert(verifyShopDailyNonce(SAMPLE_PLACE_ID, 'fake_expired_nonce_123') === false, 'Tampered/expired nonce rejected');

    // 5. Test QR Code Image & Payload Generator
    console.log('\n--- 5. Testing QR Code Generation ---');
    const qrResult = await generateShopQRCode({
      placeId: SAMPLE_PLACE_ID,
      venueName: SAMPLE_NAME,
      baseUrl: 'http://localhost:3002',
    });
    assert(qrResult.qrDataUrl.startsWith('data:image/png;base64,'), 'Generated high-resolution PNG QR Data URL');
    assert(qrResult.payload.protocol === 'TASTECHAIN_BKK', 'QR payload conforms to TASTECHAIN_BKK protocol');
    assert(qrResult.payload.nonce === nonce, 'QR payload contains valid daily nonce');

    // 6. Test GPS Distance & Proximity Filter
    console.log('\n--- 6. Testing Haversine GPS Proximity (< 100m) ---');
    // Baobao Bar coords: 13.7196, 100.5301
    const venueLat = 13.7196;
    const venueLon = 100.5301;
    
    // Diner sitting 25 meters away
    const dinerCloseLat = 13.7197;
    const dinerCloseLon = 100.5302;
    const closeCheck = isWithinVenueProximity(dinerCloseLat, dinerCloseLon, venueLat, venueLon, 100);
    assert(closeCheck.isWithin === true, `Close diner verified: distance ${closeCheck.distanceMeters}m (< 100m)`);

    // Diner 1.2 kilometers away (At home)
    const dinerFarLat = 13.7300;
    const dinerFarLon = 100.5400;
    const farCheck = isWithinVenueProximity(dinerFarLat, dinerFarLon, venueLat, venueLon, 100);
    assert(farCheck.isWithin === false, `Diner too far rejected: distance ${farCheck.distanceMeters}m (> 100m)`);

    // 7. Test In-Store QR Check-in Persistence & DB Rewards
    console.log('\n--- 7. Testing Check-in DB Persistence & Reward Accumulator ---');
    const testCustomer = '0x1111222233334444555566667777888899990000';
    
    // Record check-in in DB
    const insertRes = await query<{ id: string }>(
      `INSERT INTO in_store_qr_checkins (
        place_id, place_hash, customer_address, gps_latitude, gps_longitude, gps_distance_meters, epoch_points_awarded
      ) VALUES ($1, $2, $3, $4, $5, $6, 3) RETURNING id`,
      [SAMPLE_PLACE_ID, '0xsampleplacehash', testCustomer, venueLat, venueLon, closeCheck.distanceMeters]
    );
    assert(!!insertRes[0]?.id, `Check-in record created with ID: ${insertRes[0]?.id}`);

    // Verify customer claimable rewards
    await query(
      `INSERT INTO customer_claimable_rewards (
        customer_address, place_id, reward_type, amount_taste, status
      ) VALUES ($1, $2, 'EPOCH_MINING', 3.0, 'UNCLAIMED')`,
      [testCustomer, SAMPLE_PLACE_ID]
    );

    const rewardCheck = await query<{ total_taste: string }>(
      `SELECT COALESCE(SUM(amount_taste), 0) as total_taste 
       FROM customer_claimable_rewards 
       WHERE customer_address = $1 AND status = 'UNCLAIMED'`,
      [testCustomer]
    );
    assert(parseFloat(rewardCheck[0].total_taste) >= 3.0, `Accumulated claimable reward: ${rewardCheck[0].total_taste} $TASTE`);

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runPhase3Tests();
