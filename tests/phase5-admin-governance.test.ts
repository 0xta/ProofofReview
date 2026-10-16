import { pool } from '../src/lib/db';
import {
  getAdminStats,
  getOwnerVerifications,
  reviewOwnerVerification,
  distributeDailyEpoch,
  getAdminLogs,
  seedDemoKycApplications,
} from '../src/lib/services/admin';

async function runPhase5Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 5 AUTOMATED TESTS & VERIFICATIONS');
  console.log('   (Admin Governance, Owner KYC & 1-Click Epoch Mining)');
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

  const testAdminAddr = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Deployer / Admin address
  const testEpochDate = '2026-10-16';

  try {
    // ----------------------------------------------------
    // 1. System Telemetry & Admin Stats
    // ----------------------------------------------------
    console.log('--- 1. Testing Admin Governance Telemetry ---');
    const stats = await getAdminStats();
    assert(stats.totalPlaces > 40000, 'Indexed total venues in database', `${stats.totalPlaces} venues`);
    assert(stats.bangkokPlaces > 40000, 'Bangkok gastronomy venues filtered', `${stats.bangkokPlaces} venues`);
    assert(stats.dailyEmissionRate === 10000, 'Daily token emission rate verified at 10,000 $TASTE');
    assert(typeof stats.isTodayEpochSettled === 'boolean', 'Epoch settlement status retrieved');

    // ----------------------------------------------------
    // 2. Demo KYC Seeding & Retrieval
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Owner KYC Applications & Seeding ---');
    await seedDemoKycApplications();
    const verifications = await getOwnerVerifications();
    assert(verifications.length > 0, 'Owner KYC applications present in DB', `Count: ${verifications.length}`);

    const pendingItem = verifications.find((v) => v.status === 'PENDING') || verifications[0];
    assert(!!pendingItem.id, 'KYC item has unique UUID', pendingItem.id);
    assert(!!pendingItem.applicant_name, 'KYC item contains applicant legal name', pendingItem.applicant_name);
    assert(!!pendingItem.dbd_company_id, 'KYC item contains DBD company ID', pendingItem.dbd_company_id || 'N/A');
    assert(!!pendingItem.id_card_photo_url, 'KYC item contains ID card photo link');
    assert(!!pendingItem.storefront_photo_url, 'KYC item contains storefront photo link');

    // ----------------------------------------------------
    // 3. KYC Approval Workflow
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Admin KYC Approval Workflow ---');
    const approvalResult = await reviewOwnerVerification({
      verificationId: pendingItem.id,
      adminAddress: testAdminAddr,
      decision: 'APPROVE',
      adminNotes: 'DBD registration and storefront verified for U-Hackathon gastronomy showcase.',
    });

    assert(approvalResult.success, 'KYC verification successfully approved');
    assert(approvalResult.status === 'APPROVED', 'Verification status transitioned to APPROVED');

    // Check place_owners mapping table
    const ownerRes = await pool.query(
      'SELECT place_id, owner_address, verification_id FROM place_owners WHERE verification_id = $1',
      [pendingItem.id]
    );
    assert(ownerRes.rows.length > 0, 'Verified owner mapped in place_owners table', `Owner: ${ownerRes.rows[0].owner_address}`);

    // ----------------------------------------------------
    // 4. KYC Rejection Workflow
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Admin KYC Rejection Workflow ---');
    // Create a temporary test KYC request to reject
    const tempKycRes = await pool.query(
      `INSERT INTO owner_verifications (
        place_id, owner_address, applicant_name, contact_phone,
        dbd_registered_name, id_card_photo_url, storefront_photo_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
      RETURNING id`,
      [
        pendingItem.place_id,
        '0x0000000000000000000000000000000000009999',
        'Rejectable Test Candidate',
        '+66 80 000 0000',
        'Incomplete Documents Ltd.',
        'https://example.com/id.jpg',
        'https://example.com/store.jpg',
      ]
    );
    const tempKycId = tempKycRes.rows[0].id;

    const rejectionResult = await reviewOwnerVerification({
      verificationId: tempKycId,
      adminAddress: testAdminAddr,
      decision: 'REJECT',
      adminNotes: 'Blurry ID photo and missing DBD registration certificate.',
    });

    assert(rejectionResult.success, 'KYC rejection successfully processed');
    assert(rejectionResult.status === 'REJECTED', 'Verification status transitioned to REJECTED');

    // ----------------------------------------------------
    // 5. PoC 1-Click Daily Epoch Distribution
    // ----------------------------------------------------
    console.log('\n--- 5. Testing 1-Click Manual Daily Epoch Mining Distribution ---');
    // Clean up test epoch date to test fresh distribution
    await pool.query('DELETE FROM user_epoch_shares WHERE epoch_date = $1', [testEpochDate]);
    await pool.query('DELETE FROM daily_token_epochs WHERE epoch_date = $1', [testEpochDate]);

    const epochResult = await distributeDailyEpoch(testAdminAddr, testEpochDate);
    assert(epochResult.totalEmissionTokens === 10000, 'Distributed full daily emission pool of 10,000 $TASTE');
    assert(epochResult.totalParticipants > 0, 'Participants included in epoch mining share', `Count: ${epochResult.totalParticipants}`);
    assert(epochResult.onchainTxHash.startsWith('0x'), 'Settlement transaction hash generated', epochResult.onchainTxHash.substring(0, 16) + '...');
    assert(epochResult.explorerUrl.includes('snowtrace.io'), 'Snowtrace block explorer link generated');

    // Verify double distribution protection
    let doubleDistributeBlocked = false;
    try {
      await distributeDailyEpoch(testAdminAddr, testEpochDate);
    } catch (err: any) {
      if (err.message.includes('already been settled')) {
        doubleDistributeBlocked = true;
      }
    }
    assert(doubleDistributeBlocked, 'Double distribution for identical epoch strictly BLOCKED');

    // ----------------------------------------------------
    // 6. Admin Immutable Audit Logs
    // ----------------------------------------------------
    console.log('\n--- 6. Testing Admin Immutable Audit Logs ---');
    const logs = await getAdminLogs(10);
    assert(logs.length >= 3, 'Admin audit logs successfully recorded and retrieved', `Count: ${logs.length}`);

    const hasKycAction = logs.some((l) => l.action.startsWith('KYC_'));
    const hasEpochAction = logs.some((l) => l.action === 'EPOCH_DISTRIBUTED');
    assert(hasKycAction, 'Audit log contains KYC review actions');
    assert(hasEpochAction, 'Audit log contains EPOCH_DISTRIBUTED actions');

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    await pool.end();
    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during Phase 5 tests:', err);
    await pool.end();
    process.exit(1);
  }
}

runPhase5Tests();
